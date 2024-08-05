import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express, { NextFunction, Request, Response } from "express";
import { connectDB } from "./db";
import bcrypt from "bcrypt";
import mongoose, { Types } from "mongoose";
import Platform, { IPlatform } from "./models/platform.model";
import Genre, { IGenre } from "./models/genre.model";
import Game, { IGame } from "./models/game.model";
import Publisher, { IPublisher } from "./models/publisher.model";
import Developer, { IDeveloper } from "./models/developer.model";
import User, { IUser } from "./models/user.model";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import createDateNoTakingTimezoneIntoAccount, {
  cartDataEntries,
  filterPropertiesFromObj,
  corsOptions,
  createDocumentsOfObjsAndInsert,
  dropCollectionsIfTheyExist,
  generateAndSaveJWT,
  generateRandomStr,
  generateUniqueRandomStrs,
  genSalt,
  getJSON,
  ICartDataEntriesFromRequest,
  ILoginBodyFromRequest,
  IRegisterBodyFromRequest,
  parseQueries,
  random,
  randomizeArrOrder,
  registerBodyEntries,
  sleep,
  validateBodyEntries,
  validateQueriesTypes,
  verifyEmailEntries,
  createCartWithGamesBasedOnReceivedCart,
  updateUserCartBasedOnReceivedOne,
  loginBodyEntriesWithCart,
} from "./helpers";
import Review, { IReview } from "./models/review.model";
import { LoremIpsum } from "lorem-ipsum";
import cookieParser from "cookie-parser";
import RefreshToken from "./models/refreshToken.model";
import { IProcessEnvVariables } from "../env";
import AdditionalContactInformation from "./models/additionalContactInformation.model";

const app = express();
const port = 3000;

const cors = require("cors"); // eslint-disable-line

export function accessEnvironmentVariable(
  environmentVariable: keyof IProcessEnvVariables
): string;
export function accessEnvironmentVariable(
  environmentVariable: (keyof IProcessEnvVariables)[]
): string[];

export function accessEnvironmentVariable(
  environmentVariable:
    | keyof IProcessEnvVariables
    | (keyof IProcessEnvVariables)[]
) {
  const isArray = Array.isArray(environmentVariable);
  const environmentVariablesArr = (
    isArray ? environmentVariable : [environmentVariable]
  ).map((environmentVariable) => {
    const environmentVariableValue = process.env[environmentVariable];
    if (environmentVariableValue === undefined)
      throw new Error(
        `Environment variable ${environmentVariable} is required for the app to function properly!`
      );
    return environmentVariableValue;
  });
  return isArray ? environmentVariablesArr : environmentVariablesArr[0];
}

interface Error {
  message?: string;
  status?: number;
}

interface IJwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

const startServer = async () => {
  const errorHandler = (err: Error, req: Request, res: Response) => {
    console.error(err);
    res
      .status((err as Error & { status?: number }).status || 503)
      .json({ message: err.message });
  };
  try {
    app.use(cors(corsOptions));

    app.use(express.json());
    app.use(cookieParser());

    await connectDB();

    app.get(
      "/products",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const queries = await parseQueries(req);
          const {
            limit,
            most_popular,
            query,
            count,
            page,
            priceMin,
            priceMax,
            popularityOrder,
            priceOrder,
            titleOrder,
            discount,
            genres,
            platforms,
            developers,
            publishers,
          } = queries;

          await validateQueriesTypes([
            ["number", limit],
            ["number", most_popular],
            ["string", query],
            ["number", count],
            ["number", page],
            ["number", priceMin],
            ["number", priceMax],
            ["object", popularityOrder],
            ["object", priceOrder],
            ["object", titleOrder],
            ["number", discount],
            ["array", genres],
            ["array", platforms],
            ["array", developers],
            ["array", publishers],
          ]);
          const limitNr = limit;

          const mapGamePropertyNameToMongooseModel = {
            genres: Genre,
            platforms: Platform,
            publisher: Publisher,
            developer: Developer,
          };

          type generateFilterTagEntryArgument = {
            tags: string[];
            gameDocumentTagPropertyName: keyof IGame;
          };

          const generateFilterTagEntry = async (
            tagEntryObj: generateFilterTagEntryArgument
          ) => {
            const { tags, gameDocumentTagPropertyName } = tagEntryObj;
            const documentsCorrespondingToProvidedTags =
              await mapGamePropertyNameToMongooseModel[
                gameDocumentTagPropertyName as keyof typeof mapGamePropertyNameToMongooseModel
              ].find({ name: { $in: tags } });

            return {
              ...(tags &&
                tags.length !== 0 && {
                  [gameDocumentTagPropertyName]: {
                    $in: documentsCorrespondingToProvidedTags.map(
                      (documentCorrespondingToProvidedTags) =>
                        documentCorrespondingToProvidedTags._id
                    ),
                  },
                }),
            };
          };

          const generateFilterTagsEntries = async (
            tags: generateFilterTagEntryArgument[]
          ) => {
            const filterEntriesPromises = tags.map(async (tag) => {
              const tagGeneratedFilterEntry = await generateFilterTagEntry(tag);
              return Object.entries(tagGeneratedFilterEntry);
            });
            const filterEntries = await Promise.all(filterEntriesPromises);
            return Object.fromEntries(filterEntries.flat());
          };

          const filterTagsEntries = await generateFilterTagsEntries([
            { tags: genres, gameDocumentTagPropertyName: "genres" },
            { tags: platforms, gameDocumentTagPropertyName: "platforms" },
            { tags: developers, gameDocumentTagPropertyName: "developer" },
            { tags: publishers, gameDocumentTagPropertyName: "publisher" },
          ]);

          const filter = {
            ...(query && { title: { $regex: query, $options: "i" } }),
            ...((priceMin !== undefined || priceMax !== undefined) && {
              finalPrice: {
                ...(priceMin !== undefined &&
                  !isNaN(+priceMin) && { $gte: +priceMin }),
                ...(priceMax !== undefined &&
                  !isNaN(+priceMax) && { $lte: +priceMax }),
              },
            }),
            ...(discount === 1 && { discount: { $gt: 0 } }),
            ...filterTagsEntries,
          };

          if (count === 1) {
            const count = await Game.countDocuments(filter).exec();
            res.status(200).json([count]);
            return;
          }

          const mongooseQuery = Game.find(filter);

          mongooseQuery.populate([
            "genres",
            "developer",
            "publisher",
            "platforms",
          ]);

          interface IOrderCustomizationProperty {
            value: "" | "1" | "-1";
            order: number;
          }

          const generateOrderObj = (
            properties: {
              obj: IOrderCustomizationProperty;
              name: string;
            }[]
          ) => {
            const sortProperties: { [key: string]: mongoose.SortOrder } = {};
            properties
              .filter(
                (property) =>
                  property.obj &&
                  (property.obj.value === "1" || property.obj.value === "-1")
              )
              .sort((a, b) => a.obj.order - b.obj.order)
              .forEach((property) => {
                sortProperties[property.name] = Number(property.obj.value) as
                  | 1
                  | -1;
              });
            return sortProperties;
          };

          let sortProperties: { [key: string]: mongoose.SortOrder } =
            generateOrderObj([
              {
                obj: popularityOrder as IOrderCustomizationProperty,
                name: "popularity",
              },
              {
                obj: priceOrder as IOrderCustomizationProperty,
                name: "finalPrice",
              },
              {
                obj: titleOrder as IOrderCustomizationProperty,
                name: "title",
              },
            ]);
          if (most_popular === 1) sortProperties = { popularity: -1, date: -1 };
          mongooseQuery.sort(sortProperties);
          mongooseQuery.skip(
            page && !Array.isArray(page) && isFinite(page) ? page * 10 : 0
          );
          if (limitNr) mongooseQuery.limit(limitNr);

          const games = await mongooseQuery.exec();
          const gamesToSend = games.map((game) => {
            const {
              price,
              discount,
              finalPrice,
              _id,
              title,
              artworks,
              genres,
              summary,
            } = game;
            return {
              price,
              discount,
              finalPrice,
              _id: _id.toString(),
              title,
              artworks,
              genres,
              summary,
            };
          });

          res.status(200).json([...gamesToSend]);
        } catch (err) {
          next(err);
        }
      }
    );

    app.get(
      "/products/price",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const gamesFromDb = await Game.find({}, { finalPrice: true })
            .sort({ finalPrice: -1 })
            .exec();
          res.status(200).json({
            min: gamesFromDb[gamesFromDb.length - 1].finalPrice,
            max: gamesFromDb[0].finalPrice,
          });
        } catch (e) {
          next(e);
        }
      }
    );

    app.get(
      "/products/:productSlug",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { productSlug } = req.params;
          const queries = await parseQueries(req);
          const { onlyReviews, reviewsPageNr, maxReviewsPerPage } = queries;
          await validateQueriesTypes([
            ["boolean", onlyReviews],
            ["number", reviewsPageNr],
            ["number", maxReviewsPerPage],
          ]);
          const game = await Game.findOne({
            slug: { $regex: productSlug, $options: "i" },
          }).populate([
            "genres",
            "publisher",
            "developer",
            "platforms",
            {
              path: "reviews",
              populate: {
                path: "userId",
                model: User,
              },
            },
          ]);
          if (game === null)
            return res
              .status(404)
              .json({ message: "No such a game has been found!" });
          res
            .status(200)
            .json(
              !onlyReviews
                ? { ...game.toObject(), reviews: game.reviews!.length }
                : game.reviews?.slice(
                    reviewsPageNr * maxReviewsPerPage,
                    (reviewsPageNr + 1) * maxReviewsPerPage
                  )
            );
        } catch (err) {
          next(err);
        }
      }
    );

    app.get(
      "/tags",
      async (req: Request, res: Response, next: NextFunction) => {
        type availableTagPropertyNames =
          | "genres"
          | "platforms"
          | "publisher"
          | "developer";
        type tagType<tagName extends availableTagPropertyNames> =
          (tagName extends "genres"
            ? IGenre
            : tagName extends "platforms"
            ? IPlatform
            : tagName extends "publisher"
            ? IPublisher
            : tagName extends "developer"
            ? IDeveloper
            : undefined) & {
            popularity?: number;
          };

        const tagModelBasedOnType = {
          genres: Genre,
          platforms: Platform,
          publisher: Publisher,
          developer: Developer,
        };

        interface IGameTag {
          _id: mongoose.ObjectId;
          name: string;
        }

        try {
          const queries = await parseQueries(req);
          const { mostPopular, query, limit, gameDocumentTagPropertyName } =
            queries;
          await validateQueriesTypes([
            ["number", mostPopular],
            ["string", query],
            ["number", limit],
            ["string", gameDocumentTagPropertyName],
          ]);
          type tagsType = tagType<typeof gameDocumentTagPropertyName>[];
          let tags: tagsType = [];
          if (mostPopular === 1) {
            const games = await Game.find()
              .populate(["genres", "developer", "publisher", "platforms"])
              .exec();
            games.forEach((game) => {
              const individualGameTagValue =
                game[gameDocumentTagPropertyName as availableTagPropertyNames];
              if (individualGameTagValue === undefined) return;

              function handleModifyTagsArrWithNewTagFromGame(
                tags: tagsType,
                tag: IGameTag
              ) {
                const foundTagObj = tags.find(
                  (tagObj) => tagObj.name === tag.name
                );

                if (foundTagObj) foundTagObj.popularity! += game.popularity!;
                else
                  tags.push({
                    name: tag.name,
                    popularity: game.popularity!,
                  });
              }

              if (Array.isArray(individualGameTagValue))
                return individualGameTagValue.forEach((tag) =>
                  handleModifyTagsArrWithNewTagFromGame(
                    tags,
                    tag as unknown as IGameTag
                  )
                );
              handleModifyTagsArrWithNewTagFromGame(
                tags,
                individualGameTagValue as unknown as IGameTag
              );
            });

            tags.sort((a, b) => b.popularity! - a.popularity!);
            tags = tags.slice(0, limit);
          } else {
            const findQuery = tagModelBasedOnType[
              gameDocumentTagPropertyName as availableTagPropertyNames
            ].find({
              name: { $regex: query, $options: "i" },
            });
            if (limit) findQuery.limit(limit);
            tags = await findQuery.exec();
          }

          res.status(200).json(tags);
        } catch (err) {
          next(err);
        }
      }
    );

    app.get(
      "/init",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const generateMultiQueries = async <T>(
            conditionToQueriesArr: number[],
            singleQueryGeneratorFunc: (i: number, cur: number) => string,
            authorizedHeaders: {
              Authorization: string;
              "Client-ID": string;
            }
          ) => {
            const multiQueries = conditionToQueriesArr.reduce<{
              curQuery: string;
              queries: string[];
            }>(
              (acc, cur, i) => {
                const curQuery = singleQueryGeneratorFunc(i, cur).replace(
                  /\n/gi,
                  ""
                );
                if (
                  (i % 10 === 0 && i !== 0) ||
                  i === conditionToQueriesArr.length - 1
                ) {
                  if (i !== conditionToQueriesArr.length - 1)
                    acc.queries.push(acc.curQuery);
                  else acc.queries.push(acc.curQuery + curQuery);
                  acc.curQuery = curQuery;
                } else {
                  acc.curQuery += curQuery;
                }
                return acc;
              },
              { curQuery: "", queries: [] }
            ).queries;
            const multiQueriesResultObjs = await Promise.all(
              multiQueries.map(async (multiQuery) => {
                const data = await getJSON(
                  "https://api.igdb.com/v4/multiquery",
                  {
                    method: "POST",
                    headers: authorizedHeaders,
                    body: multiQuery,
                  }
                );
                return data.map(
                  (returnedDataObj: {
                    name: string;
                    result: { id: number; date: number }[];
                  }) => ({
                    ...returnedDataObj.result[0],
                  })
                );
              })
            );
            return multiQueriesResultObjs.flat() as T;
          };

          const [CLIENT_ID, SECRET] = accessEnvironmentVariable([
            "CLIENT_ID",
            "SECRET",
          ]);

          const { access_token } = await getJSON(
            `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${SECRET}&grant_type=client_credentials`,
            {
              method: "POST",
            }
          );
          const authorizedHeaders = {
            Authorization: `Bearer ${access_token}`,
            "Client-ID": CLIENT_ID,
          };
          let [{ result: games }] = await getJSON(
            "https://api.igdb.com/v4/multiquery",
            {
              method: "POST",
              headers: authorizedHeaders,
              body: `query games "Games" {
              fields *;
              sort hypes desc;
              limit:50;

            };`,
            }
          );
          let releaseDatesIdsToFetch: number[] = [];
          let platformsIdsToFetch: number[] = [];
          let genresIdsToFetch: number[] = [];
          let involvedCompaniesToFetch: number[] = [];
          let companiesToFetch: number[] = [];
          let artworksToFetch: number[] = [];
          games = games.map((game: object) => {
            const hasDisocunt = random(0, 1) === 0;
            if ((game as { release_dates?: number[] }).release_dates)
              releaseDatesIdsToFetch.push(
                (game as { release_dates: number[] }).release_dates[0]
              );
            if ((game as { platforms?: number[] }).platforms)
              platformsIdsToFetch.push(
                ...(game as { platforms: number[] }).platforms
              );
            if ((game as { genres?: number[] }).genres)
              genresIdsToFetch.push(...(game as { genres: number[] }).genres);
            if ((game as { involved_companies: number[] }).involved_companies)
              involvedCompaniesToFetch.push(
                ...(game as { involved_companies: number[] }).involved_companies
              );
            if ((game as { artworks: number[] }).artworks)
              artworksToFetch.push(
                ...(game as { artworks: number[] }).artworks
              );
            return {
              ...game,
              price: +random(5, 25).toFixed(2),
              discount: hasDisocunt ? random(1, 100) : 0,
            };
          });
          releaseDatesIdsToFetch = [...new Set(releaseDatesIdsToFetch)];
          platformsIdsToFetch = [...new Set(platformsIdsToFetch)];
          genresIdsToFetch = [...new Set(genresIdsToFetch)];
          involvedCompaniesToFetch = [...new Set(involvedCompaniesToFetch)];
          artworksToFetch = [...new Set(artworksToFetch)];

          const releaseDatesObjsTemp = await generateMultiQueries<
            {
              id: number;
              date: string;
              game: number;
            }[]
          >(
            releaseDatesIdsToFetch,
            (i, cur) => `query release_dates "${i}" {
            fields date,game;
            where id=${cur};
          };`,
            authorizedHeaders
          );
          const releaseDatesObjs = releaseDatesObjsTemp.map(
            (releaseDatesObj) => ({
              ...releaseDatesObj,
              date: releaseDatesObj.date
                ? new Date(+releaseDatesObj.date * 1000)
                : undefined,
            })
          );

          const platformsObjs = await generateMultiQueries<
            { id: number; name: string }[]
          >(
            platformsIdsToFetch,
            (i, cur) => `query platforms "${i}" {
              fields name;
              where id=${cur};
            };`,
            authorizedHeaders
          );

          await sleep(4);
          const genresObjs = await generateMultiQueries<
            { id: number; name: string }[]
          >(
            genresIdsToFetch,
            (i, cur) => `query genres "${i}" {
            fields name;
            where id=${cur};
          };`,
            authorizedHeaders
          );

          const involvedCompaniesObjs = await generateMultiQueries<
            {
              company: number;
              developer: boolean;
              publisher: boolean;
              id: number;
            }[]
          >(
            involvedCompaniesToFetch,
            (i, cur) => `query involved_companies "${i}" {
          fields company,developer,publisher;
          where id=${cur};
        };`,
            authorizedHeaders
          );

          let publisherCompaniesIds: number[] = [];
          let developerCompaniesIds: number[] = [];

          games = games.map((game: { involved_companies?: number[] }) => {
            if (!game.involved_companies) return game;
            const involvedCompaniesIds = game.involved_companies;

            const developerInvolvedCompanyId = involvedCompaniesIds.find(
              (involvedCompanyId) =>
                involvedCompaniesObjs.find(
                  (involvedCompanyObj) =>
                    involvedCompanyObj.id === involvedCompanyId
                )?.developer
            );
            const developerCompanyId = involvedCompaniesObjs.find(
              (involvedCompanyObj) =>
                involvedCompanyObj.id === developerInvolvedCompanyId
            )?.company;
            const publisherInvolvedCompany = involvedCompaniesIds.find(
              (involvedCompanyId) =>
                involvedCompaniesObjs.find(
                  (involvedCompanyObj) =>
                    involvedCompanyObj.id === involvedCompanyId
                )?.publisher
            );
            const publisherCompanyId = involvedCompaniesObjs.find(
              (involvedCompanyObj) =>
                involvedCompanyObj.id === publisherInvolvedCompany
            )?.company;
            if (developerCompanyId) {
              companiesToFetch.push(developerCompanyId);
              developerCompaniesIds.push(developerCompanyId);
            }
            if (publisherCompanyId) {
              companiesToFetch.push(publisherCompanyId);
              publisherCompaniesIds.push(publisherCompanyId);
            }
            return {
              ...game,
              involved_companies: {
                publisher: publisherCompanyId,
                developer: developerCompanyId,
              },
            };
          });
          companiesToFetch = [...new Set(companiesToFetch)];
          publisherCompaniesIds = [...new Set(publisherCompaniesIds)];
          developerCompaniesIds = [...new Set(developerCompaniesIds)];

          await sleep(4);
          const companiesObjs = await generateMultiQueries<
            { name: string; id: number }[]
          >(
            companiesToFetch,
            (i, cur) => `query companies "${i}" {
          fields name;
          where id=${cur};
        };`,
            authorizedHeaders
          );

          const artworkObjs = await generateMultiQueries<
            { url: string; id: number }[]
          >(
            artworksToFetch,
            (i, cur) => `query artworks "${i}" {
          fields url;
          where id=${cur};
        };`,
            authorizedHeaders
          );

          await dropCollectionsIfTheyExist(["users", "reviews"]);

          const sampleUsersLogins = generateUniqueRandomStrs(
            10,
            "test",
            [4, 10]
          );
          console.log(sampleUsersLogins);
          const salt = await genSalt();
          const sampleUsersToSave: IUser[] = await Promise.all(
            Array.from({ length: 10 }, async (_, i) => {
              const passwordHash = await bcrypt.hash(
                sampleUsersLogins[i],
                salt
              );
              return {
                login: sampleUsersLogins[i],
                email: `${sampleUsersLogins[i]}@gamepoint.pl`,
                password: passwordHash,
              };
            })
          );
          const { newObjs: sampleUsers } = await createDocumentsOfObjsAndInsert(
            sampleUsersToSave,
            User
          );
          const sampleReviewCriteria = [
            "Gameplay",
            "Graphics",
            "Sound",
            "Story",
            "Controls",
            "Replayability",
            "Difficulty",
            "Performance",
            "Value for Money",
            "Innovativeness",
          ];

          games = await Promise.all(
            games.map(
              async (game: {
                involved_companies?: { publisher?: number; developer?: number };
                artworks?: number[];
                price: number;
                discount: number;
              }) => {
                if (!game.involved_companies)
                  return {
                    ...game,
                    publisher: undefined,
                    developer: undefined,
                  };
                const publisher = game.involved_companies.publisher
                  ? companiesObjs.find(
                      (companyObj) =>
                        companyObj.id === game.involved_companies?.publisher
                    )?.name
                  : undefined;
                const developer = game.involved_companies.developer
                  ? companiesObjs.find(
                      (companyObj) =>
                        companyObj.id === game.involved_companies?.developer
                    )?.name
                  : undefined;
                const artworks = game.artworks
                  ? game.artworks
                      .map((artworkId) => {
                        const artworkObj = artworkObjs.find(
                          (artworkObj) => artworkObj.id === artworkId
                        )!;

                        if (!artworkObj) return undefined;

                        artworkObj.url = artworkObj.url.replace(
                          "thumb",
                          "720p"
                        );
                        return artworkObj.url;
                      })
                      .filter((artworkUrl) => artworkUrl)
                  : [];

                return {
                  ...game,
                  publisher,
                  developer,
                  artworks,
                };
              }
            )
          );
          await dropCollectionsIfTheyExist([
            "games",
            "genres",
            "platforms",
            "publishers",
            "developers",
          ]);

          const publisherObjs = publisherCompaniesIds.map(
            (publisherCompanyId) => {
              const { name } = companiesObjs.find(
                (companyObj) => companyObj.id === publisherCompanyId
              )!;
              return { name };
            }
          );
          const developerObjs = developerCompaniesIds.map(
            (developerCompanyId) => {
              const { name } = companiesObjs.find(
                (companyObj) => companyObj.id === developerCompanyId
              )!;
              return { name };
            }
          );
          const publisherDocuments =
            await createDocumentsOfObjsAndInsert<IPublisher>(
              publisherObjs,
              Publisher
            );
          const developerDocuments =
            await createDocumentsOfObjsAndInsert<IDeveloper>(
              developerObjs,
              Developer
            );
          const platformDocuments =
            await createDocumentsOfObjsAndInsert<IPlatform>(
              platformsObjs,
              Platform
            );
          const genreDocuments = await createDocumentsOfObjsAndInsert<IGenre>(
            genresObjs,
            Genre
          );

          const gamesToSend = await Promise.all(
            games.map(
              async (game: {
                id: number;
                release_dates?: number[];
                genres?: number[];
                platforms?: number[];
                name: string;
                publisher?: string;
                developer?: string;
                hypes?: number;
                storyline?: string;
              }) => {
                let releaseDate = undefined;
                if (game.release_dates) {
                  releaseDate = releaseDatesObjs.find(
                    (releaseDateObj) =>
                      releaseDateObj.id === game.release_dates![0]
                  )
                    ? releaseDatesObjs.find(
                        (releaseDateObj) =>
                          releaseDateObj.id === game.release_dates![0]
                      )?.date
                    : undefined;
                }

                const sampleUsersReviewsOrder = randomizeArrOrder(
                  sampleUsers.slice(0, random(0, 10))
                );

                const loremIpsumGenerator = new LoremIpsum({
                  sentencesPerParagraph: { min: 2, max: 6 },
                  wordsPerSentence: { min: 8, max: 16 },
                });
                const reviewsToSend: IReview[] = sampleUsersReviewsOrder.map(
                  (sampleUser) => {
                    const sampleReviewCriteriaNamesOrder = randomizeArrOrder([
                      ...sampleReviewCriteria,
                    ]).slice(0, random(1, 10));
                    const currentDate = new Date();
                    // const [currentDateYear, currentDateMonth, currentDateDay] =
                    //   [
                    //     currentDate.getFullYear(),
                    //     currentDate.getMonth(),
                    //     currentDate.getDate(),
                    //   ];
                    // const [releaseDateYear, releaseDateMonth, releaseDateDay] =
                    //   releaseDate
                    //     ? [
                    //         releaseDate.getFullYear(),
                    //         releaseDate.getMonth(),
                    //         releaseDate.getDate(),
                    //       ]
                    //     : new Array(3).fill(undefined);
                    const timeToDays = 1000 * 60 * 60 * 24;
                    const sampleReviewDate = !releaseDate
                      ? currentDate
                      : new Date(
                          currentDate.getTime() -
                            random(
                              0,
                              Math.ceil(
                                (currentDate.getTime() -
                                  releaseDate.getTime()) /
                                  timeToDays
                              ) * timeToDays
                            )
                        );
                    // do {} while (
                    //   releaseDate &&
                    //   sampleReviewDate &&
                    //   sampleReviewDate < releaseDate
                    // );
                    return {
                      userId: sampleUser._id!,
                      content: loremIpsumGenerator.generateParagraphs(
                        random(1, 3)
                      ),
                      criteria: sampleReviewCriteriaNamesOrder.map(
                        (reviewCriterionName) => ({
                          criterionName: reviewCriterionName,
                          rating: random(0, 4),
                        })
                      ),
                      date: sampleReviewDate,
                    };
                  }
                );
                const { newObjs: gameReviews } =
                  await createDocumentsOfObjsAndInsert(reviewsToSend, Review);

                return {
                  ...game,
                  releaseDate,
                  genres: game.genres?.map(
                    (genreApiID) =>
                      genreDocuments.newObjs.find(
                        (genreDbObj) =>
                          (genreDbObj as IGenre & { id: number }).id ===
                          genreApiID
                      )?._id
                  ),
                  platforms: game.platforms?.map(
                    (platformAPIId) =>
                      platformDocuments.newObjs.find(
                        (platformDbObj) =>
                          (platformDbObj as IPlatform & { id: number }).id ===
                          platformAPIId
                      )?._id
                  ),
                  title: game.name,
                  publisher: game.publisher
                    ? publisherDocuments.newObjs.find(
                        (publisherObj) => publisherObj.name === game.publisher
                      )?._id
                    : undefined,
                  developer: game.developer
                    ? developerDocuments.newObjs.find(
                        (developerObj) => developerObj.name === game.developer
                      )?._id
                    : undefined,
                  popularity: game.hypes || 0,
                  storyLine: game.storyline,
                  reviews: gameReviews.map((gameReview) => gameReview._id),
                };
              }
            )
          );

          await createDocumentsOfObjsAndInsert<IGame>(gamesToSend, Game);

          res.status(200).json({
            ...gamesToSend,
            dateObjs: releaseDatesObjs,
            platformsObjs: platformDocuments.newObjs,
            genresObjs: genreDocuments.newObjs,
          });
        } catch (err) {
          next(err);
        }
      }
    );

    const jwtVerifyPromisified = (token: string, secretKey: string) =>
      new Promise<string | jwt.JwtPayload | undefined>((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
          if (err) reject(err);
          resolve(decoded);
        });
      });

    interface IRequestAdditionAfterVerifyJwtfMiddleware {
      token: {
        isAdmin?: boolean;
        expDate?: Date;
        login?: string;
      };
    }

    const verifyJwt = async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken)
        return res.status(401).json({ message: "Could not authorize" });

      try {
        const [JWTREFRESHSECRET, JWTSECRET] = accessEnvironmentVariable([
          "JWTREFRESHSECRET",
          "JWTSECRET",
        ]);
        const decodedJwt = (await jwtVerifyPromisified(
          refreshToken,
          JWTREFRESHSECRET
        )) as IJwtPayload;
        const userId = decodedJwt.userId;
        let accessToken = req.cookies.accessToken;
        if (!accessToken) {
          accessToken = generateAndSaveJWT(res, userId, "access");
        }
        let decodedJwtAccessToken: jwt.JwtPayload = {};
        try {
          decodedJwtAccessToken = (await jwtVerifyPromisified(
            accessToken,
            JWTSECRET!
          )) as IJwtPayload;
        } catch (e) {
          if ((e as JsonWebTokenError).name === "TokenExpiredError") {
            generateAndSaveJWT(res, userId, "access");
            decodedJwtAccessToken.userId = userId;
          } else {
            throw e;
          }
        }
        if (decodedJwtAccessToken.userId !== userId)
          return res.status(401).json({ message: "Misleading tokens data!" });

        const correspondingUserDocument = await User.findOne({ _id: userId });
        if (!correspondingUserDocument)
          return res
            .status(401)
            .json({ messsage: "Could not authorize as such user!" });
        (req as Request & IRequestAdditionAfterVerifyJwtfMiddleware).token = {
          isAdmin: correspondingUserDocument?.isAdmin,
          login: correspondingUserDocument.login,
        };
        next();
      } catch (e) {
        console.log(e);
        return res.status(403).json({
          message: "You are not allowed to access the requested content",
        });
      }
    };

    app.post(
      "/login",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { login, password, cart } = req.body as ILoginBodyFromRequest;

          const stringBodyEntriesErrors = validateBodyEntries(
            loginBodyEntriesWithCart,
            req
          );
          const errors = [...stringBodyEntriesErrors];
          if (errors.length > 0) return res.status(422).json({ errors });

          const foundUser = await User.findOne({
            login: { $eq: login },
          });
          if (!foundUser)
            return res
              .status(200)
              .json({ message: "A user with such login does not exist!" });
          const validPassword = await bcrypt.compare(
            password,
            foundUser!.password
          );
          if (!validPassword)
            return res
              .status(200)
              .json({ message: "Provided password is invalid!" });

          if (!foundUser.emailVerified)
            return res.status(200).json({
              message:
                "You haven't verified your account yet! Check your e-mail for more details.",
            });

          if (cart!.length > 0)
            await updateUserCartBasedOnReceivedOne(cart!, login);

          const foundUserIdStr = foundUser._id.toString();
          const refreshToken = generateAndSaveJWT(
            res,
            foundUserIdStr,
            "refresh"
          );
          const accessToken = generateAndSaveJWT(res, foundUserIdStr, "access");

          await new RefreshToken({ content: refreshToken }).save();

          return res.status(200).json(accessToken);
        } catch (e) {
          next(e);
        }
      }
    );

    app.get("/auth", verifyJwt, (req: Request, res: Response) => {
      const { token } = req as Request &
        IRequestAdditionAfterVerifyJwtfMiddleware;
      return res.status(200).json(token);
    });

    app.get("/cart", verifyJwt, async (req: Request, res: Response) => {
      const {
        token: { login },
      } = req as Request & IRequestAdditionAfterVerifyJwtfMiddleware;
      const foundUser = await User.findOne({ login }).lean();
      if (!foundUser) return res.sendStatus(404);
      const cart = foundUser.cart;
      return res.status(200).json({
        cart,
      });
    });

    app.post(
      "/cart",
      verifyJwt,
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const {
            token: { login },
          } = req as Request & IRequestAdditionAfterVerifyJwtfMiddleware;
          const errors = validateBodyEntries(cartDataEntries, req);
          if (errors.length > 0) return res.sendStatus(422);
          const { cart } = req.body as ICartDataEntriesFromRequest;
          await updateUserCartBasedOnReceivedOne(cart, login!);
          return res.sendStatus(200);
        } catch (e) {
          next(e);
        }
      }
    );

    app.post(
      "/cart-details",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { cart } = req.body as ICartDataEntriesFromRequest;
          const errors = validateBodyEntries(
            cartDataEntries.map((cartDataEntry) => ({
              ...cartDataEntry,
              optional: false,
            })),
            req
          );
          if (errors.length > 0) return res.sendStatus(422);
          const cartWithGames = await createCartWithGamesBasedOnReceivedCart(
            cart
          );
          const cartToSend = cartWithGames
            .filter((cartEntry) => cartEntry.relatedGame !== null)
            .map((cartEntry) => ({
              ...filterPropertiesFromObj(cartEntry, [
                "relatedGame",
                "quantity",
              ]),
              id: cartEntry.relatedGame,
            }));
          return res.status(200).json(cartToSend);
        } catch (e) {
          next(e);
        }
      }
    );

    app.get(
      "/logout",
      verifyJwt,
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          await RefreshToken.deleteOne({ content: req.cookies.refreshToken });
          res.clearCookie("refreshToken");
          res.clearCookie("accessToken");
          res.status(200).json("Successfully logged out!");
        } catch (e) {
          next(e);
        }
      }
    );

    app.post(
      "/register",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const registerBody = req.body as IRegisterBodyFromRequest;

          const {
            login,
            password,
            email,
            expandedContactInformation,
            firstName,
            surName,
            dateOfBirth,
            phoneNr,
          } = registerBody;

          const includedContactInformation =
            expandedContactInformation !== undefined;

          const errors = !includedContactInformation
            ? validateBodyEntries(registerBodyEntries.slice(0, 4), req)
            : validateBodyEntries(registerBodyEntries, req);

          if (errors.length > 0) return res.status(422).json({ errors });

          let dateOfBirthToSave: Date;
          if (includedContactInformation) {
            const [year, month, day] = dateOfBirth
              .split("-")
              .map((datePart, i) => (i === 1 ? +datePart - 1 : +datePart));
            dateOfBirthToSave = createDateNoTakingTimezoneIntoAccount({
              year,
              month,
              day,
            });
            const latestPossibleDate = createDateNoTakingTimezoneIntoAccount(
              {}
            );
            const oldestPossibleDate = createDateNoTakingTimezoneIntoAccount({
              year: latestPossibleDate.getUTCFullYear() - 150,
              month: latestPossibleDate.getMonth(),
              day: latestPossibleDate.getDate(),
            });
            if (
              dateOfBirthToSave < oldestPossibleDate ||
              dateOfBirthToSave > latestPossibleDate
            )
              return res.status(422).json({
                message: "Your date of birth does not seem to be correct!",
              });
          }

          const sameLoginUser = await User.findOne({ login });
          const sameEmailUser = await User.findOne({ email });
          if (sameLoginUser || sameEmailUser)
            return res.status(200).json({
              message: `There is already an account which uses the same ${
                sameLoginUser ? "login" : "e-mail address"
              } as provided!`,
            });

          let savedContactInformation: Types.ObjectId;
          if (includedContactInformation) {
            const additionalContactInformationWithSameFirstLastNameAndPhoneNr =
              await AdditionalContactInformation.findOne({
                firstName,
                surName,
                phoneNr,
              });
            if (additionalContactInformationWithSameFirstLastNameAndPhoneNr)
              return res.status(200).json({
                message:
                  "There is already a contact address with the same first name, surname and phone number added!",
              });
            const { newObjs } = await createDocumentsOfObjsAndInsert(
              [
                new AdditionalContactInformation({
                  ...registerBody,
                  dateOfBirth: dateOfBirthToSave!,
                }),
              ],
              AdditionalContactInformation
            );
            savedContactInformation = newObjs[0]._id!;
          }

          const passwordSalt = await genSalt();
          const passwordHash = await bcrypt.hash(password, passwordSalt);

          const {
            newObjs: [addedUser],
          } = await createDocumentsOfObjsAndInsert(
            [
              new User({
                login,
                password: passwordHash,
                email,
                ...(includedContactInformation && {
                  additionalContactInformation: [savedContactInformation!],
                  activeAdditionalContactInformation: 0,
                }),
              }),
            ],
            User
          );

          res.status(200).json({
            registrationCode: generateRandomStr(6),
            uId: addedUser._id?.toString(),
          });
        } catch (e) {
          next(e);
        }
      }
    );

    app.get(
      "/verify-email-guard",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { uId, registrationCode } = await parseQueries(req);
          await validateQueriesTypes([
            ["string", uId],
            ["string", registrationCode],
          ]);

          const foundUser = await User.findById(uId);
          if (!foundUser || foundUser.emailVerified) res.sendStatus(403);

          res.sendStatus(200);
        } catch (e) {
          next(e);
        }
      }
    );

    app.post(
      "/verify-email",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { uId, providedRegistrationCode, registrationCode } = req.body;
          const verifyEmailEntriesErrors = validateBodyEntries(
            verifyEmailEntries,
            req
          );
          if (verifyEmailEntriesErrors.length > 0)
            return res.status(422).json({ errors: verifyEmailEntriesErrors });

          const foundUser = await User.findById(uId);
          if (!foundUser)
            return res.status(200).json({
              message: "Account that you are trying to verify does not exist!",
            });
          if (foundUser.emailVerified)
            return res
              .status(200)
              .json({ message: "Account has been already verified!" });

          // this would make sense if the desired registration code was received by an e-mail instead of simulating it
          // with sending it over search param
          if (registrationCode !== providedRegistrationCode)
            return res
              .status(200)
              .json({ message: "Provided registration code is invalid" });

          await foundUser.updateOne({ emailVerified: true });
          generateAndSaveJWT(res, uId, "refresh");

          res.sendStatus(200);
        } catch (e) {
          next(e);
        }
      }
    );

    const server = app.listen(port);

    app.use(function (req, res) {
      res.status(404).json({ message: "Your request contains an invalid URL" });
    });

    app.use(errorHandler);

    const closeServer = async (e: unknown) => {
      console.log(e);
      await mongoose.connection.close();
      server.close(() => process.exit(1));
    };

    ["SIGTERM", "SIGINT", "uncaughtException"].forEach((event) =>
      process.on(event, closeServer)
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
startServer();
