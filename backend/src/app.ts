import express, { Request, Response } from "express";
import { connectDB } from "./db";
import { CLIENT_ID, FRONTEND_URL, SECRET } from "./secret";
import mongoose from "mongoose";
import Platform, { IPlatform } from "./models/platform.model";
import Genre, { IGenre } from "./models/genre.model";
import Game, { IGame } from "./models/game.model";
import Publisher, { IPublisher } from "./models/publisher.model";
import Developer, { IDeveloper } from "./models/devloper.model";

const app = express();
const port = 3000;

const cors = require("cors"); // eslint-disable-line

const getJSON = async (url: string, options: RequestInit = {}) => {
  const result = await fetch(url, options);
  const data = await result.json();
  return data;
};

const sleep = (s: number) =>
  new Promise((resolve) => setTimeout(resolve, s * 1000));

const dropCollectionsIfTheyExist = async (collections: string[]) => {
  for (const collection of collections) {
    const collInfo = await mongoose.connection.db
      .listCollections({
        name: collection,
      })
      .next();
    if (collInfo) {
      await mongoose.connection.dropCollection(collection);
    }
  }
};

const createDocumentsOfObjsAndInsert = async <storedObjInterface>(
  objs: storedObjInterface[],
  model: mongoose.Model<storedObjInterface>
) => {
  // Here _id is going to be id of an individual document according to our mongoDB database
  // and default id will be related to id from the API and we will be able to change ids in individual games obj properties
  // to their equivalents according to our mongoDB database
  const newObjs: (storedObjInterface & {
    _id?: mongoose.ObjectId | undefined;
  })[] = objs.map((obj) => ({ ...obj, _id: undefined }));
  const documents = objs.map((obj) => new model(obj));
  newObjs.forEach((newObj, i: number) => {
    const correspondingDocument = documents[i];
    newObj._id = correspondingDocument._id as mongoose.ObjectId;
  });
  await Promise.all(documents.map(async (doc) => await doc.save()));
  return { documents, newObjs };
};

const random = (min: number, max: number) => Math.random() * (max - min) + min;

interface Error {
  message?: string;
  status?: number;
}

const corsOptions = {
  origin: FRONTEND_URL,
  methods: ["GET"],
  allowedHeaders: ["Content-Type"],
};

const handleTransformQueryValueToNumber = function <T>(param: T) {
  if (typeof param === "string") return parseInt(param);
  if (Array.isArray(param) && param.length !== 0) return parseInt(param[0]);
  return undefined;
};

const startServer = async () => {
  try {
    app.use(cors(corsOptions));

    app.options("*", cors(corsOptions));

    app.get("/products", async (req: Request, res: Response) => {
      try {
        await connectDB();

        const { limit, most_popular, query } = req.query;
        const limitNr = handleTransformQueryValueToNumber(limit);

        let mongooseQuery;

        if (!query) mongooseQuery = Game.find();
        else
          mongooseQuery = Game.find({
            title: { $regex: query, $options: "i" },
          });

        mongooseQuery.populate([
          "genres",
          "developer",
          "publisher",
          "platforms",
        ]);

        if (most_popular === "1")
          mongooseQuery.sort({ popularity: -1, date: -1 });
        if (limitNr) mongooseQuery.limit(limitNr);

        const games = await mongooseQuery.exec();

        res.status(200).json([...games]);
      } catch (err) {
        res
          .status((err as Error).status || 503)
          .json({ message: (err as Error).message });
      }
    });

    app.get("/popular-genres", async (req: Request, res: Response) => {
      try {
        await connectDB();

        const genres: { name: string; popularity: number }[] = [];
        const games = await Game.find()
          .populate(["genres", "developer", "publisher", "platforms"])
          .exec();
        games.forEach((game) =>
          game.genres.forEach((genre) => {
            interface IGameGenre {
              _id: mongoose.ObjectId;
              name: string;
            }
            const foundGenreObj = genres.find(
              (genreObj) =>
                genreObj.name === (genre as unknown as IGameGenre).name
            );

            if (foundGenreObj) foundGenreObj.popularity += game.popularity!;
            else
              genres.push({
                name: (genre as unknown as IGameGenre).name,
                popularity: game.popularity!,
              });
          })
        );

        genres.sort((a, b) => b.popularity - a.popularity);

        res.status(200).json(genres);
      } catch (err) {
        res
          .status((err as Error).status || 503)
          .json({ message: (err as Error).message });
      }
    });

    app.get("/init", async (req: Request, res: Response) => {
      try {
        await connectDB();

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
              const data = await getJSON("https://api.igdb.com/v4/multiquery", {
                method: "POST",
                headers: authorizedHeaders,
                body: multiQuery,
              });
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
          const hasDisocunt = Math.round(random(0, 1)) === 0;
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
              ...(game as { artworks: number[] }).artworks.slice(0, 5)
            );
          return {
            ...game,
            price: +random(5, 25).toFixed(2),
            discount: hasDisocunt ? Math.round(random(1, 100)) : 0,
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

        games = games.map(
          (game: {
            involved_companies?: { publisher?: number; developer?: number };
            artworks?: number[];
          }) => {
            if (!game.involved_companies)
              return { ...game, publisher: undefined, developer: undefined };
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

                    artworkObj.url = artworkObj.url.replace("thumb", "720p");
                    return artworkObj.url;
                  })
                  .filter((artworkUrl) => artworkUrl)
              : [];
            return { ...game, publisher, developer, artworks };
          }
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

        const gamesToSend = games.map(
          (game: {
            id: number;
            release_dates?: number[];
            genres?: number[];
            platforms?: number[];
            name: string;
            publisher?: string;
            developer?: string;
            hypes?: number;
          }) => {
            let releaseDate = undefined;
            if (game.release_dates) {
              releaseDate = releaseDatesObjs.find(
                (releaseDateObj) => releaseDateObj.id === game.release_dates![0]
              )
                ? releaseDatesObjs.find(
                    (releaseDateObj) =>
                      releaseDateObj.id === game.release_dates![0]
                  )?.date
                : undefined;
            }

            return {
              ...game,
              releaseDate,
              genres: game.genres?.map(
                (genreApiID) =>
                  genreDocuments.newObjs.find(
                    (genreDbObj) =>
                      (genreDbObj as IGenre & { id: number }).id === genreApiID
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
            };
          }
        );
        await createDocumentsOfObjsAndInsert<IGame>(gamesToSend, Game);

        res.status(200).json({
          ...gamesToSend,
          dateObjs: releaseDatesObjs,
          platformsObjs: platformDocuments.newObjs,
          genresObjs: genreDocuments.newObjs,
        });
      } catch (err) {
        await mongoose.connection.close();
        res
          .status((err as Error).status || 404)
          .json(
            (err as Error).message || "An error occured. Please try again!"
          );
      }
    });

    const server = app.listen(port);

    const closeServer = async () => {
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
