import express, { Request, Response } from "express";
import { connectDB } from "./db";
import { CLIENT_ID, SECRET } from "./secret";

const app = express();
const port = 3000;

const getJSON = async (url: string, options: RequestInit = {}) => {
  const result = await fetch(url, options);
  const data = await result.json();
  return data;
};

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const startServer = async () => {
  try {
    await connectDB();

    app.get("/init", async (req: Request, res: Response) => {
      const generateMultiQueries = (
        conditionToQueriesArr: number[],
        singleQueryGeneratorFunc: (i: number, cur: number) => string
      ) => {
        return conditionToQueriesArr.reduce<{
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
      };
      try {
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
        let releaseDates: number[] = [];
        let platforms: number[] = [];
        games = games.map((game: object) => {
          const hasDisocunt = Math.round(random(0, 1)) === 0;
          if ((game as { release_dates?: number[] }).release_dates)
            releaseDates.push(
              (game as { release_dates: number[] }).release_dates[0]
            );
          if ((game as { platforms?: number[] }).platforms)
            platforms.push(...(game as { platforms: number[] }).platforms);
          return {
            ...game,
            price: +random(5, 25).toFixed(2),
            discount: hasDisocunt ? Math.round(random(1, 100)) : 0,
          };
        });
        releaseDates = [...new Set(releaseDates)];
        platforms = [...new Set(platforms)];
        const multiQueriesForReleaseDates = generateMultiQueries(
          releaseDates,
          (i, cur) =>
            `query release_dates "${i}" {
                fields date,game;
                where id=${cur};
              };`
        );
        const releaseDatesDataObjs = await Promise.all(
          multiQueriesForReleaseDates.map(async (multiQuery) => {
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
                date: new Date(returnedDataObj.result[0].date),
              })
            );
          })
        );
        const releaseDatesObjs: {
          id: number;
          date: Date;
          game: number;
        }[] = releaseDatesDataObjs.flat();

        const multiQueriesForPlatforms = generateMultiQueries(
          platforms,
          (i, cur) => `query platforms "${i}" {
            fields name;
            where id=${cur};
          };`
        );
        const platformsDataObjs = await Promise.all(
          multiQueriesForPlatforms.map(async (multiQuery) => {
            const data = await getJSON("https://api.igdb.com/v4/multiquery", {
              method: "POST",
              headers: authorizedHeaders,
              body: multiQuery,
            });
            return data.map(
              (multiQueryResponse: {
                name: string;
                result: { id: number; name: string }[];
              }) => ({
                ...multiQueryResponse.result[0],
              })
            );
          })
        );
        const platformsObjs: { id: number; name: string }[] =
          platformsDataObjs.flat();
        // Store in our API and then map appropriate platform IDs in fetched games

        games = games.map((game: { id: number; release_dates?: number[] }) => ({
          ...game,
          releaseDate: game.release_dates
            ? releaseDatesObjs.find(
                (releaseDateObj) => releaseDateObj.id === game.release_dates![0]
              )!.date
            : undefined,
        }));

        res.status(200).json({
          ...games,
          dateObjs: releaseDatesObjs,
          platforms,
        });
      } catch (err) {
        console.error(err);
      }
    });

    app.listen(port);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
startServer();
