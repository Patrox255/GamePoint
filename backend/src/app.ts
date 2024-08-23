import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express, { NextFunction, Request, Response } from "express";
import { connectDB } from "./db";
import bcrypt from "bcrypt";
import mongoose, { isValidObjectId, startSession, Types } from "mongoose";
import Platform, { IPlatform } from "./models/platform.model";
import Genre, { IGenre } from "./models/genre.model";
import Game, { IGame } from "./models/game.model";
import Publisher, { IPublisher } from "./models/publisher.model";
import Developer, { IDeveloper } from "./models/developer.model";
import User, { IUser } from "./models/user.model";
import {
  corsOptions,
  createDocumentsOfObjsAndInsert,
  dropCollectionsIfTheyExist,
  generateAndSaveJWT,
  generateRandomStr,
  generateUniqueRandomStrs,
  genSalt,
  getJSON,
  parseQueries,
  random,
  randomizeArrOrder,
  sleep,
  validateQueriesTypes,
  createCartWithGamesBasedOnReceivedCart,
  updateUserCartBasedOnReceivedOne,
  onlyAccessJwt,
  IRequestAdditionAfterVerifyJwtfMiddleware,
  verifyJwt,
  IRequestAdditionAfterAccessJwtfMiddleware,
  getUserContactInformationByLogin,
  createAndVerifyDateOfBirthFromInput,
  verifyCreateAndInsertAdditionalContactInformationDocumentBasedOnRequestData,
  filterPropertiesFromObj,
  retrieveUserDocumentWithPopulatedOrdersDetails,
  IOrderCustomizationProperty,
  generateOrderObj,
  calcTotalGamesPrice,
} from "./helpers";
import Review, { IReview } from "./models/review.model";
import { LoremIpsum } from "lorem-ipsum";
import cookieParser from "cookie-parser";
import RefreshToken from "./models/refreshToken.model";
import { IProcessEnvVariables } from "../env";
import AdditionalContactInformation from "./models/additionalContactInformation.model";
import sanitizeHtml from "sanitize-html";
import {
  addReviewEntries,
  cartDataEntries,
  changeActiveContactInformationEntries,
  checkOrderIdEntries,
  contactInformationEntries,
  contactInformationForGuestsEntries,
  IAddReviewEntriesFromRequest,
  ICartDataEntriesFromRequest,
  IChangeActiveContactInformationEntriesFromRequest,
  ICheckOrderIdBodyFromRequest,
  IContactInformationEntriesFromRequest,
  ILoginBodyFromRequest,
  IModifyOrAddContactInformationEntriesFromRequest,
  IOrderDataFromRequest,
  IOrderDataFromRequestContactInformationForGuests,
  IOrderDataFromRequestOrderedGamesDetails,
  IRegisterBodyFromRequest,
  IRemoveReviewEntriesFromRequest,
  IRetrieveUsersBasedOnEmailOrLoginBodyFromRequest,
  IVerifyEmailEntriesFromRequest,
  loginBodyEntriesWithCart,
  modifyOrAddContactInformationValidationEntries,
  orderedGamesEntries,
  registerBodyEntries,
  removeReviewEntries,
  retrieveUsersBasedOnEmailOrLoginEntries,
  verifyEmailEntries,
} from "./validateBodyEntries";
import { validateBodyEntries } from "./validateBodyFn";
import { IOrderItem } from "./models/orderItem.model";
import Order, { IOrder } from "./models/order.model";

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

          let sortProperties = generateOrderObj([
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
      onlyAccessJwt,
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
          const { token } = req as Request &
            IRequestAdditionAfterAccessJwtfMiddleware;
          const login = token?.login;
          type receivedGameReview = IReview & { userId: IUser };
          let userReview: receivedGameReview | undefined = undefined;
          if (login)
            userReview = (game.reviews as unknown as receivedGameReviews)?.find(
              (gameReview) => gameReview.userId.login === login
            );
          if (!onlyReviews)
            return res.status(200).json({
              ...game.toObject(),
              reviews: game.reviews!.length + (userReview ? -1 : 0),
              userReview: userReview ? true : false,
            });
          type receivedGameReviews = receivedGameReview[];
          let gameReviewsToSend: receivedGameReviews = game.reviews!.slice(
            reviewsPageNr * maxReviewsPerPage,
            (reviewsPageNr + 1) * maxReviewsPerPage
          ) as unknown as receivedGameReviews;
          if (token) {
            gameReviewsToSend = gameReviewsToSend.filter(
              (gameReview) => gameReview.userId.login !== login
            );
          }
          res.status(200).json({ reviews: gameReviewsToSend, userReview });
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

    app.post(
      "/login",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { login, password, cart } = req.body as ILoginBodyFromRequest;

          if (
            !validateBodyEntries({
              entries: loginBodyEntriesWithCart,
              req,
              res,
            })
          )
            return;

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

    app.get("/auth", verifyJwt, async (req, res, next) => {
      try {
        const { token } = req as Request &
          IRequestAdditionAfterVerifyJwtfMiddleware;

        const relatedUser = await User.findById(token.userId).populate(
          "orders"
        );
        const userOrdersAmount = relatedUser!.orders!.length || 0;
        return res
          .status(200)
          .json({ ...token, ordersAmount: userOrdersAmount });
      } catch (e) {
        next(e);
      }
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
          if (!validateBodyEntries({ entries: cartDataEntries, req, res }))
            return;
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
          if (
            !validateBodyEntries({
              entries: cartDataEntries.map((cartDataEntry) => ({
                ...cartDataEntry,
                optional: false,
              })),
              req,
              res,
            })
          )
            return;
          const cartWithGames = (
            await createCartWithGamesBasedOnReceivedCart(cart)
          ).filter(
            (cartWithGamesEntry) => cartWithGamesEntry.relatedGame !== null
          );

          const cartTotalPrice = calcTotalGamesPrice(
            cartWithGames.map((cartWithGamesEntry) => {
              const {
                relatedGame: { finalPrice },
                quantity,
              } = cartWithGamesEntry as typeof cartWithGamesEntry & {
                relatedGame: IGame;
              };
              return { finalPrice: finalPrice!, quantity };
            })
          );
          const cartToSend = cartWithGames.map((cartEntry) =>
            filterPropertiesFromObj(cartEntry, ["quantity"])
          );
          return res.status(200).json({ cart: cartToSend, cartTotalPrice });
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
            dateOfBirth,
          } = registerBody;

          const includedContactInformation =
            expandedContactInformation !== undefined;
          const validateBodyEntriesArgObj = { req };

          if (
            !includedContactInformation
              ? !validateBodyEntries({
                  ...validateBodyEntriesArgObj,
                  entries: registerBodyEntries.slice(0, 4),
                  res,
                })
              : !validateBodyEntries({
                  ...validateBodyEntriesArgObj,
                  entries: registerBodyEntries,
                  res,
                })
          )
            return;

          let dateOfBirthToSave: Date | false;
          if (includedContactInformation) {
            dateOfBirthToSave = createAndVerifyDateOfBirthFromInput(
              dateOfBirth,
              res
            );
            if (!dateOfBirthToSave) return;
          }

          const sameLoginUser = await User.findOne({ login });
          const sameEmailUser = await User.findOne({ email });
          if (sameLoginUser || sameEmailUser)
            return res.status(200).json({
              message: `There is already an account which uses the same ${
                sameLoginUser ? "login" : "e-mail address"
              } as provided!`,
            });

          const session = await startSession();
          session.startTransaction();

          let savedContactInformation: Types.ObjectId;
          if (includedContactInformation) {
            const saveContactInformationRes =
              await verifyCreateAndInsertAdditionalContactInformationDocumentBasedOnRequestData(
                { ...registerBody, dateOfBirth: dateOfBirthToSave! as Date },
                res,
                session
              );
            if (!saveContactInformationRes) return;
            savedContactInformation = saveContactInformationRes.newObjs[0]._id!;
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
                  activeAdditionalContactInformation: savedContactInformation!,
                }),
              }),
            ],
            User,
            session
          );

          await session.commitTransaction();
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
          if (!foundUser || foundUser.emailVerified) return res.sendStatus(403);

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
          const { uId, providedRegistrationCode, registrationCode, cartData } =
            req.body as IVerifyEmailEntriesFromRequest;
          if (
            !validateBodyEntries({
              entries: verifyEmailEntries,
              req,
              res,
            })
          )
            return;

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

          const cartToSet = (
            await createCartWithGamesBasedOnReceivedCart(cartData, true)
          ).filter(
            (generatedCartEntry) => generatedCartEntry.relatedGame !== null
          );

          await foundUser.updateOne({
            emailVerified: true,
            ...(Object.entries(cartToSet).length > 0 && {
              cart: cartToSet.map((cartToSetEntry) => ({
                id: cartToSetEntry.relatedGame,
                quantity: cartToSetEntry.quantity,
              })),
            }),
          });
          generateAndSaveJWT(res, uId, "refresh");

          res.sendStatus(200);
        } catch (e) {
          next(e);
        }
      }
    );

    app.post(
      "/add-review",
      verifyJwt,
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          if (
            !validateBodyEntries({
              entries: addReviewEntries,
              req,
              res,
            })
          )
            return;

          const { criteria, reviewContent, gameId } =
            req.body as IAddReviewEntriesFromRequest;
          const {
            token: { userId },
          } = req as Request & IRequestAdditionAfterVerifyJwtfMiddleware;

          const relatedGame = await Game.findById(gameId).populate("reviews");
          if (!relatedGame)
            return res.status(200).json({
              message:
                "There isn't such a game You would like to upload a review to!",
            });
          const gameReviews = relatedGame.reviews as unknown as IReview[];
          if (
            gameReviews.length > 0 &&
            gameReviews.find(
              (gameReview) => gameReview.userId.toString() === userId
            )
          )
            return res.status(200).json({
              message:
                "You have already added a review connected to this game!",
            });

          const reviewContentToSave = sanitizeHtml(reviewContent, {
            allowedTags: ["b", "i", "u", "strong", "em", "p", "br", "a"],
            allowedAttributes: {
              a: ["href"],
            },
            allowedSchemes: ["https", "http"],
          });
          const { newObjs } = await createDocumentsOfObjsAndInsert(
            [
              new Review({
                content: reviewContentToSave,
                criteria,
                userId,
              }),
            ],
            Review
          );

          await relatedGame.updateOne({
            $push: { reviews: newObjs[0]._id },
          });
          return res.sendStatus(200);
        } catch (e) {
          next(e);
        }
      }
    );

    app.post(
      "/remove-review",
      verifyJwt,
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { reviewId } = req.body as IRemoveReviewEntriesFromRequest;
          if (
            !validateBodyEntries({
              entries: removeReviewEntries,
              req,
              res,
            })
          )
            return;

          const {
            token: { userId },
          } = req as Request & IRequestAdditionAfterVerifyJwtfMiddleware;
          const requestedReviewToRemove = await Review.findById(reviewId);
          if (!requestedReviewToRemove)
            return res.status(200).json({
              message: "We couldn't find your review! Please try again later.",
            });
          if (requestedReviewToRemove.userId.toString() !== userId)
            return res
              .status(200)
              .json({ message: "You are not the owner of this review!" });
          const relatedGame = await Game.findOne({
            reviews: { $elemMatch: { $eq: requestedReviewToRemove._id } },
          });
          if (!relatedGame)
            return res.status(200).json({
              message: "Failed to find a game related to your review!",
            });

          const session = await startSession();
          session.startTransaction();

          try {
            await relatedGame.updateOne({
              $pull: { reviews: requestedReviewToRemove._id },
            });
            await requestedReviewToRemove.deleteOne();
          } catch (e) {
            await session.abortTransaction();
            throw e;
          }
          await session.commitTransaction();

          return res.sendStatus(200);
        } catch (e) {
          next(e);
        }
      }
    );

    app.get("/contact-information", verifyJwt, async (req, res, next) => {
      try {
        const {
          token: { login },
        } = req as Request & IRequestAdditionAfterVerifyJwtfMiddleware;

        const userContactInformation = await getUserContactInformationByLogin(
          login!
        );
        const {
          activeAdditionalContactInformation,
          additionalContactInformation,
        } = userContactInformation!;
        // Surely this account contains this information as its existence has been already verified in verifyJwt middleware

        res.status(200).json({
          additionalContactInformation,
          activeAdditionalContactInformation,
        });
      } catch (e) {
        next(e);
      }
    });

    app.post("/contact-information", verifyJwt, async (req, res, next) => {
      try {
        const { newContactInformation, updateContactInformationId } =
          req.body as IModifyOrAddContactInformationEntriesFromRequest;

        if (
          !validateBodyEntries<IContactInformationEntriesFromRequest>({
            requestBodyEntriesObj: newContactInformation,
            entries: modifyOrAddContactInformationValidationEntries,
            res,
          })
        )
          return;

        const dateOfBirthToSave = createAndVerifyDateOfBirthFromInput(
          newContactInformation.dateOfBirth,
          res
        );
        if (!dateOfBirthToSave) return;
        const contactInformationToSave = {
          ...newContactInformation,
          dateOfBirth: dateOfBirthToSave,
        };
        const session = await startSession();
        session.startTransaction();

        if (updateContactInformationId) {
          const failedToFindErr = {
            message: "Failed to find a selected contact details entry!",
          };
          if (!isValidObjectId(updateContactInformationId))
            return res.status(200).json(failedToFindErr);
          const relatedAdditionalContactInformation =
            await AdditionalContactInformation.findById(
              updateContactInformationId
            ).session(session);
          if (!relatedAdditionalContactInformation)
            return res.status(200).json(failedToFindErr);

          relatedAdditionalContactInformation.set(contactInformationToSave);
          try {
            await relatedAdditionalContactInformation.save({ session });
          } catch (_) {
            await session.abortTransaction();
            return res.status(200).json({
              message: "Failed to update the desired contact details entry!",
            });
          }
          await session.commitTransaction();
          return res.sendStatus(200);
        }

        const {
          token: { login },
        } = req as Request & IRequestAdditionAfterVerifyJwtfMiddleware;
        const { newObjs } = await createDocumentsOfObjsAndInsert(
          [contactInformationToSave],
          AdditionalContactInformation,
          session
        );

        const createdContactInformationObjectId = newObjs[0]._id!;
        const relatedUser = await User.findOne({ login }).session(session);
        // relatedUser has to be true as its existence has been already checked within verifyJwt middleware
        relatedUser!.additionalContactInformation!.push(
          createdContactInformationObjectId
        );
        if (relatedUser!.additionalContactInformation?.length === 1)
          relatedUser!.activeAdditionalContactInformation =
            createdContactInformationObjectId;
        await relatedUser?.save({ session });
        await session.commitTransaction();
        return res.sendStatus(200);
      } catch (e) {
        next(e);
      }
    });

    app.post(
      "/contact-information-active",
      verifyJwt,
      async (req, res, next) => {
        try {
          const {
            token: { login },
          } = req as Request & IRequestAdditionAfterVerifyJwtfMiddleware;

          if (
            !validateBodyEntries({
              entries: changeActiveContactInformationEntries,
              req,
              res,
            })
          )
            return;
          const { newActiveAdditionalInformationEntryId } =
            req.body as IChangeActiveContactInformationEntriesFromRequest;

          const userContactInformation = await getUserContactInformationByLogin(
            login!
          );
          const { additionalContactInformation, relatedUser } =
            userContactInformation!;
          if (newActiveAdditionalInformationEntryId === "") {
            await relatedUser.updateOne({
              activeAdditionalContactInformation: null,
            });
            return res.sendStatus(200);
          }

          if (
            additionalContactInformation!.length === 0 ||
            !additionalContactInformation!.find(
              (additionalContactInformationEntry) =>
                additionalContactInformationEntry._id.toString() ===
                newActiveAdditionalInformationEntryId
            )
          )
            return res.status(200).json({
              message:
                "Couldn't find a desired contact information to change to!",
            });

          if (!isValidObjectId(newActiveAdditionalInformationEntryId))
            return res.status(200).json({
              message:
                "Failed to read your desired contact information identificator",
            });

          await relatedUser.updateOne({
            activeAdditionalContactInformation: new Types.ObjectId(
              newActiveAdditionalInformationEntryId
            ),
          });
          return res.sendStatus(200);
        } catch (e) {
          next(e);
        }
      }
    );

    app.post("/contact-information/validate", (req, res) => {
      if (
        !validateBodyEntries<IOrderDataFromRequestContactInformationForGuests>({
          req,
          entries: contactInformationForGuestsEntries,
          res,
        })
      )
        return;
      return res.sendStatus(200);
    });

    app.post("/order", onlyAccessJwt, async (req, res, next) => {
      try {
        const {
          orderedGamesDetails,
          contactInformationForGuests,
          contactInformationForLoggedUsers,
        } = req.body as IOrderDataFromRequest;

        const { token } = req as IRequestAdditionAfterAccessJwtfMiddleware &
          Request;
        const userId = token?.userId;

        if (contactInformationForLoggedUsers && !userId)
          return res.status(403).json({
            message:
              "You are not allowed to access such contact details entry!",
          });

        if (!contactInformationForLoggedUsers && !contactInformationForGuests)
          return res.status(422).json({
            errors: [
              {
                message:
                  "You have to provide your contact information by typing it into the form or selecting one of your contact details entries in case you are logged in!",
                errInputName: "",
              },
            ],
          });

        if (
          !validateBodyEntries<IOrderDataFromRequestOrderedGamesDetails>({
            entries: orderedGamesEntries,
            requestBodyEntriesObj: { orderedGamesDetails },
            res,
          })
        )
          return;

        if (
          contactInformationForGuests &&
          !validateBodyEntries<IOrderDataFromRequestContactInformationForGuests>(
            {
              entries: contactInformationForGuestsEntries,
              res,
              requestBodyEntriesObj: contactInformationForGuests,
            }
          )
        )
          return;

        if (
          contactInformationForLoggedUsers &&
          !validateBodyEntries<IContactInformationEntriesFromRequest>({
            entries: contactInformationEntries,
            res,
            requestBodyEntriesObj: contactInformationForLoggedUsers,
          })
        )
          return;

        let orderItems: IOrderItem[] = [];
        try {
          orderItems = await Promise.all(
            orderedGamesDetails.map(async (orderedGamesDetailsEntry) => {
              if (!isValidObjectId(orderedGamesDetailsEntry._id))
                throw new Error(
                  "One of your order games has an incorrect identificator provided!"
                );
              const relatedGame = await Game.findById(
                orderedGamesDetailsEntry._id
              );
              if (!relatedGame)
                throw new Error(
                  "One of your order games might have just been deleted!"
                );
              (["price", "discount", "finalPrice"] as (keyof IGame)[]).forEach(
                (gamePriceRelatedProperty) => {
                  if (
                    relatedGame[gamePriceRelatedProperty] !==
                    orderedGamesDetailsEntry[gamePriceRelatedProperty]
                  )
                    throw new Error(
                      "Price for one of the games that You wanted to order might have just been changed!"
                    );
                }
              );
              const { price, discount, finalPrice, quantity } =
                orderedGamesDetailsEntry;
              return {
                price,
                discount,
                finalPrice: finalPrice!,
                quantity,
                gameId: relatedGame._id,
              };
            })
          );
        } catch (e) {
          return res.status(200).json({
            message: `${
              (e as Error).message || "Failed to retrieve order games data!"
            } Please try refreshing the page.`,
          });
        }

        const contactInformation = contactInformationForGuests
          ? contactInformationForGuests
          : contactInformationForLoggedUsers!;
        const contactInformationDateOfBirth =
          createAndVerifyDateOfBirthFromInput(
            contactInformation.dateOfBirth,
            res
          );
        if (!contactInformationDateOfBirth) return;

        const salt = await bcrypt.genSalt();
        const accessCode = await bcrypt.hash(generateRandomStr(8), salt);
        const totalValue = calcTotalGamesPrice(orderItems);
        const orderToSave: IOrder = {
          items: orderItems,
          orderContactInformation: {
            ...contactInformation,
            dateOfBirth: contactInformationDateOfBirth,
          },
          accessCode,
          totalValue,
        };
        const session = await startSession();
        session.startTransaction();

        const { newObjs } = await createDocumentsOfObjsAndInsert(
          [orderToSave],
          Order,
          session
        );
        const savedOrderId = newObjs[0]._id!;
        const responseBody = { savedOrderId };
        if (!userId) {
          await session.commitTransaction();
          return res.status(200).json({
            ...responseBody,
            accessCode,
            email: contactInformationForGuests!.email,
          });
        }

        const relatedUser = await User.findById(userId).session(session);
        if (!relatedUser) {
          await session.abortTransaction();
          return res
            .status(200)
            .json({ message: "Failed to find your account information!" });
        }
        try {
          await relatedUser
            .updateOne({ $push: { orders: savedOrderId }, cart: [] })
            .session(session);
        } catch (e) {
          await session.abortTransaction();
          throw e;
        }

        await session.commitTransaction();
        return res.status(200).json(responseBody);
      } catch (e) {
        next(e);
      }
    });

    app.get("/order", verifyJwt, async (req, res, next) => {
      try {
        const {
          token: { userId },
        } = req as Request & IRequestAdditionAfterVerifyJwtfMiddleware;
        const { pageNr, sortProperties } = await parseQueries(req);
        await validateQueriesTypes([
          ["number", pageNr],
          ["object", sortProperties],
        ]);
        const MAX_ORDERS_PER_PAGE = accessEnvironmentVariable(
          "MAX_ORDERS_PER_PAGE"
        );

        const relatedUser =
          await retrieveUserDocumentWithPopulatedOrdersDetails(userId!);
        // no checking as after verifyJwt it has to be true
        let orders: IOrder[];
        orders = relatedUser!.orders as unknown as IOrder[];
        const { debouncedDate, debouncedTotalValue } = sortProperties;
        const sortPropertiesNotEmpty = generateOrderObj([
          { name: "date", obj: debouncedDate },
          { name: "totalValue", obj: debouncedTotalValue },
        ]);
        console.log(sortPropertiesNotEmpty);
        Object.entries(sortPropertiesNotEmpty)
          .reverse()
          .forEach(([propertyName, propertyOrder]) =>
            orders.sort((o1, o2) => {
              const subtraction =
                +o1[propertyName as keyof typeof o1]! -
                +o2[propertyName as keyof typeof o2]!;
              if (propertyOrder === 1) return subtraction;
              return -subtraction;
            })
          );
        if (pageNr !== undefined)
          orders = orders.slice(
            pageNr * +MAX_ORDERS_PER_PAGE,
            (pageNr + 1) * +MAX_ORDERS_PER_PAGE
          );
        return res.status(200).json({ orders });
      } catch (e) {
        next(e);
      }
    });

    app.post("/order/data", verifyJwt, async (req, res, next) => {
      try {
        const {
          token: { userId },
        } = req as Request & IRequestAdditionAfterVerifyJwtfMiddleware;
        if (
          !validateBodyEntries({
            entries: checkOrderIdEntries,
            res,
            req,
          })
        )
          return;
        const relatedUser =
          await retrieveUserDocumentWithPopulatedOrdersDetails(userId!);
        const { orderId } = req.body as ICheckOrderIdBodyFromRequest;
        const order = relatedUser?.orders?.find(
          (order) => order._id.toString() === orderId
        );

        if (!order) return res.sendStatus(403);
        return res.status(200).json(order);
      } catch (e) {
        next(e);
      }
    });

    app.post("/retrieve-users", verifyJwt, async (req, res, next) => {
      try {
        const {
          token: { isAdmin },
        } = req as Request & IRequestAdditionAfterVerifyJwtfMiddleware;
        if (!isAdmin) return res.sendStatus(403);
        if (
          !validateBodyEntries({
            entries: retrieveUsersBasedOnEmailOrLoginEntries,
            res,
            req,
          })
        )
          return;
        const { loginOrEmail } =
          req.body as IRetrieveUsersBasedOnEmailOrLoginBodyFromRequest;

        const retrievedUsers = await User.find({
          $and: [
            {
              $or: [
                { login: { $regex: loginOrEmail } },
                { email: { $regex: loginOrEmail } },
              ],
            },
            { emailVerified: true },
          ],
        }).limit(5);
        res.status(200).json(
          retrievedUsers.map((retrievedUsersEntry) => ({
            login: retrievedUsersEntry.login,
            email: retrievedUsersEntry.email,
          }))
        );
      } catch (e) {
        next(e);
      }
    });

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
