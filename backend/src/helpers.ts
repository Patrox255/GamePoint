import mongoose, { isValidObjectId, Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { accessEnvironmentVariable } from "./app";
import { CorsOptions } from "cors";
import bcrypt from "bcrypt";
import Game from "./models/game.model";
import User from "./models/user.model";
import { receivedCart } from "./validateBodyEntries";

export const getJSON = async (url: string, options: RequestInit = {}) => {
  const result = await fetch(url, options);
  const data = await result.json();
  return data;
};

export const sleep = (s: number) =>
  new Promise((resolve) => setTimeout(resolve, s * 1000));

export const dropCollectionsIfTheyExist = async (collections: string[]) => {
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

export const createDocumentsOfObjsAndInsert = async <storedObjInterface>(
  objs: storedObjInterface[],
  model: mongoose.Model<storedObjInterface>
) => {
  // Here _id is going to be id of an individual document according to our mongoDB database
  // and default id will be related to id from the API and we will be able to change ids in individual games obj properties
  // to their equivalents according to our mongoDB database
  const newObjs: (storedObjInterface & {
    _id?: Types.ObjectId | undefined;
  })[] = objs.map((obj) => ({ ...obj, _id: undefined }));
  const documents = objs.map((obj) => new model(obj));
  newObjs.forEach((newObj, i: number) => {
    const correspondingDocument = documents[i];
    newObj._id = correspondingDocument._id as Types.ObjectId;
  });
  await Promise.all(documents.map(async (doc) => await doc.save()));
  return { documents, newObjs };
};

export const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const FRONTEND_URLS = accessEnvironmentVariable("FRONTEND_URLS");

const allowedOrigins = FRONTEND_URLS.split(",");

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1)
      return callback(null, true);
    return callback(new Error("Rejected by CORS policy"));
  },
  credentials: true,
};

export const parseQueries = async (
  req: Request,
  type: "query" | "params" = "query"
) => {
  return Object.fromEntries(
    [...Object.entries(req[type])].map((entry) => [
      entry[0],
      entry[1] ? JSON.parse(entry[1] as string) : undefined,
    ])
  );
};

export const validateQueriesTypes = async (queries: unknown[][]) => {
  queries.forEach((query) => {
    if (
      query[1] !== undefined &&
      ((query[0] === "array" && !Array.isArray(query[1])) ||
        (query[0] !== "array" && typeof query[1] !== query[0]))
    )
      throw "Invalid data provided";
  });
};

export const randomizeArrOrder = function <T extends unknown[]>(arr: T) {
  return arr.sort(() => (Math.random() < 0.5 ? 1 : -1));
};

export const generateRandomStr = (length: number, prefix: string = "") => {
  let str = prefix;
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  str += Array.from({ length: length - prefix.length }, () =>
    random(0, characters.length - 1)
  ).reduce((str, random) => str + characters[random], "");
  return str;
};
export const generateUniqueRandomStrs = (
  amount: number,
  prefix: string = "",
  lengthArg: number | number[]
) => {
  const strs: string[] = [];
  for (let i = 0; i < amount; i++) {
    let randomStr = "";
    const length = Array.isArray(lengthArg)
      ? random(lengthArg[0], lengthArg[1])
      : lengthArg;
    do {
      randomStr = generateRandomStr(length, prefix);
    } while (strs.includes(randomStr));
    strs.push(randomStr);
  }
  return strs;
};

export const generateAndSaveJWT = (
  res: Response,
  userId: string,
  type: "access" | "refresh"
) => {
  const JWTSECRET = accessEnvironmentVariable(
    type === "access" ? "JWTSECRET" : "JWTREFRESHSECRET"
  );
  const newToken = jwt.sign({ userId }, JWTSECRET, {
    expiresIn: type === "access" ? "30min" : "1d",
  });
  const accessTokenMaxAge = 60 * 30 * 1000;
  res.cookie(type === "access" ? "accessToken" : "refreshToken", newToken, {
    httpOnly: true,
    secure: true,
    maxAge: type === "access" ? accessTokenMaxAge : accessTokenMaxAge * 2 * 24,
  });
  return newToken;
};

export default function createDateNoTakingTimezoneIntoAccount({
  year,
  month,
  day,
  omitTimeInCurrentDate = true,
}: {
  year?: number;
  month?: number;
  day?: number;
  omitTimeInCurrentDate?: boolean;
}) {
  if (!year) {
    const now = new Date();
    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        ...(omitTimeInCurrentDate
          ? [
              now.getUTCHours(),
              now.getMinutes(),
              now.getUTCSeconds(),
              now.getUTCMilliseconds(),
            ]
          : [])
      )
    );
  }

  return new Date(Date.UTC(year, month, day));
}

export async function genSalt() {
  return await bcrypt.genSalt(10);
}

export const sameRegex = (regex1: RegExp, regex2: RegExp) =>
  regex1.source === regex2.source && regex1.flags === regex2.flags;

export const filterPropertiesFromObj = (obj: object, properties: string[]) => ({
  ...Object.fromEntries(
    Object.entries(obj).filter(
      (objEntry) =>
        !properties.find((propertiesEntry) => propertiesEntry === objEntry[0])
    )
  ),
});

export const createCartWithGamesBasedOnReceivedCart = async function (
  cart: receivedCart
) {
  return await Promise.all(
    cart.map(async (cartEntry) => {
      const { id } = cartEntry;
      if (!isValidObjectId(id)) return { relatedGame: null };
      const gameId = new mongoose.Types.ObjectId(id);
      const foundGame = await Game.findById(gameId);
      return { ...cartEntry, relatedGame: foundGame, id: gameId };
    })
  );
};

export const updateUserCartBasedOnReceivedOne = async function (
  cart: receivedCart,
  login: string
) {
  const cartWithGames = await createCartWithGamesBasedOnReceivedCart(cart);
  const cartToSave = cartWithGames
    .filter((cartEntry) => cartEntry.relatedGame !== null)
    .map((cartEntry) => filterPropertiesFromObj(cartEntry, ["relatedGame"]));
  await User.updateOne({ login }, { cart: cartToSave });
};

interface IJwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

const jwtVerifyPromisified = (token: string, secretKey: string) =>
  new Promise<string | jwt.JwtPayload | undefined>((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });

interface IRequestTokenPropertyAfterJwtMiddleware {
  isAdmin?: boolean;
  expDate?: Date;
  login?: string;
  userId?: string;
}

export interface IRequestAdditionAfterVerifyJwtfMiddleware {
  token: IRequestTokenPropertyAfterJwtMiddleware;
}

export interface IRequestAdditionAfterAccessJwtfMiddleware {
  token?: IRequestTokenPropertyAfterJwtMiddleware;
}

const accessJwt = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return { message: "Could not authorize", status: 401 };

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
      return { message: "Misleading tokens data!", status: 401 };

    const correspondingUserDocument = await User.findOne({ _id: userId });
    if (!correspondingUserDocument)
      return { message: "Could not authorize as such user!", status: 401 };
    (req as Request & IRequestAdditionAfterVerifyJwtfMiddleware).token = {
      isAdmin: correspondingUserDocument?.isAdmin,
      login: correspondingUserDocument.login,
      userId,
    };
  } catch (_) {
    return {
      message: "You are not allowed to access the requested content",
      status: 403,
    };
  }
};

export const verifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessJwtResult = await accessJwt(req, res);
  if (typeof accessJwtResult !== "object") return next();
  return res
    .status(accessJwtResult.status)
    .json({ message: accessJwtResult.message });
};

export const onlyAccessJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await accessJwt(req, res);
  next();
};
