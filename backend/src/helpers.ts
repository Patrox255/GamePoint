import mongoose, { isValidObjectId, Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { accessEnvironmentVariable } from "./app";
import { CorsOptions } from "cors";
import bcrypt from "bcrypt";
import Game, { IGame } from "./models/game.model";
import User, { IUser } from "./models/user.model";
import { IReceivedGameDetailsEntry, receivedCart } from "./validateBodyEntries";
import AdditionalContactInformation, {
  IAdditionalContactInformation,
} from "./models/additionalContactInformation.model";
import {
  IOrder,
  orderPossibleStatusesUserFriendlyMap,
} from "./models/order.model";
import { IProcessEnvVariables } from "../env";

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
  model: mongoose.Model<storedObjInterface>,
  session?: mongoose.ClientSession
) => {
  // Here _id is going to be id of an individual document according to our mongoDB database
  // and default id will be related to id from the API and we will be able to change ids in individual games obj properties
  // to their equivalents according to our mongoDB database
  let documents: mongoose.Document<unknown, object, storedObjInterface>[] = [];
  const newObjs: (storedObjInterface & {
    _id?: Types.ObjectId;
  })[] = objs.map((obj) => ({ ...obj, _id: undefined }));
  try {
    documents = objs.map((obj) => new model(obj));
    newObjs.forEach((newObj, i: number) => {
      const correspondingDocument = documents[i];
      newObj._id = correspondingDocument._id as Types.ObjectId;
    });
    await Promise.all(
      documents.map(
        async (doc) => await doc.save(session ? { session } : undefined)
      )
    );
  } catch (e) {
    if (session) await session.abortTransaction();
    throw e;
  }
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
  cart: receivedCart,
  returnOnlyGameIdInRelatedGameProperties: boolean = false
) {
  return await Promise.all(
    cart.map(async (cartEntry) => {
      const { id, quantity } = cartEntry;
      if (!isValidObjectId(id)) return { relatedGame: null };
      const gameId = new mongoose.Types.ObjectId(id);
      const foundGame = await Game.findById(gameId);
      return {
        relatedGame: returnOnlyGameIdInRelatedGameProperties
          ? foundGame === null
            ? null
            : gameId
          : foundGame,
        quantity,
      };
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
    .map((cartEntry) => ({ ...cartEntry, id: cartEntry.relatedGame!._id }));
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

export const verifyJwtWithAdminGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessJwtResult = await accessJwt(req, res);
  if (typeof accessJwtResult === "object")
    return res
      .status(accessJwtResult.status)
      .json({ message: accessJwtResult.message });
  if (!sendAnErrorInCaseOfNormalUserAccessingAdminEndPoint(req, res)) return;
  return next();
};

export const onlyAccessJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await accessJwt(req, res);
  next();
};

export const getUserContactInformationByLoginOrId = async ({
  login,
  userId,
}: {
  login?: string;
  userId?: string;
}) => {
  const userContactInformationProjection: mongoose.ProjectionType<IUser> = {
    additionalContactInformation: true,
    activeAdditionalContactInformation: true,
  };

  const relatedUserDBReq = login
    ? User.findOne({ login }, userContactInformationProjection)
    : User.findById(userId, userContactInformationProjection);
  relatedUserDBReq.populate("additionalContactInformation");

  const relatedUser = await relatedUserDBReq;
  if (!relatedUser) return undefined;
  const { additionalContactInformation, activeAdditionalContactInformation } =
    relatedUser!;
  return {
    additionalContactInformation: additionalContactInformation as
      | undefined
      | (IAdditionalContactInformation & { _id: mongoose.Types.ObjectId })[],
    activeAdditionalContactInformation,
    relatedUser,
  };
};

export const createAndVerifyDateOfBirthFromInput = function (
  dateOfBirth: string,
  res: Response
) {
  const [year, month, day] = dateOfBirth
    .split("-")
    .map((datePart, i) => (i === 1 ? +datePart - 1 : +datePart));
  const dateOfBirthToSave = createDateNoTakingTimezoneIntoAccount({
    year,
    month,
    day,
  });
  const latestPossibleDate = createDateNoTakingTimezoneIntoAccount({});
  const oldestPossibleDate = createDateNoTakingTimezoneIntoAccount({
    year: latestPossibleDate.getUTCFullYear() - 150,
    month: latestPossibleDate.getMonth(),
    day: latestPossibleDate.getDate(),
  });
  if (
    dateOfBirthToSave < oldestPossibleDate ||
    dateOfBirthToSave > latestPossibleDate
  ) {
    res.status(200).json({
      message: "Your date of birth does not seem to be correct!",
    });
    return false;
  }
  return dateOfBirthToSave;
};

export const verifyCreateAndInsertAdditionalContactInformationDocumentBasedOnRequestData =
  async function (
    additionalContactInformationBody: IAdditionalContactInformation,
    res: Response,
    session?: mongoose.ClientSession
  ) {
    const { firstName, surName, phoneNr } = additionalContactInformationBody;
    const additionalContactInformationWithSameFirstLastNameAndPhoneNr =
      await AdditionalContactInformation.findOne(
        {
          firstName,
          surName,
          phoneNr,
        },
        undefined,
        session ? { session } : undefined
      );
    if (additionalContactInformationWithSameFirstLastNameAndPhoneNr) {
      res.status(200).json({
        message:
          "There is already a contact address with the same first name, surname and phone number added!",
      });
      return false;
    }
    const { newObjs, documents } = await createDocumentsOfObjsAndInsert(
      [new AdditionalContactInformation(additionalContactInformationBody)],
      AdditionalContactInformation,
      session
    );
    return { newObjs, documents };
  };

export const orderPopulateOptions: mongoose.PopulateOptions = {
  path: "items.gameId",
  model: "Game",
};
export const retrieveUserDocumentWithPopulatedOrdersDetails = async function (
  userId: string | mongoose.Types.ObjectId
) {
  const user = await User.findById(userId).populate({
    path: "orders",
    populate: orderPopulateOptions,
  });
  return user;
};

export interface IOrderCustomizationProperty {
  value: "" | "1" | "-1";
  order: number;
}

export const generateOrderObj = (
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
      sortProperties[property.name] = Number(property.obj.value) as 1 | -1;
    });
  return sortProperties;
};

export const calcShopPrice = (price: number) => Math.trunc(price * 100) / 100;

export const calcTotalGamesPrice = <
  T extends { quantity: number; finalPrice: number }
>(
  games: T[]
) =>
  games.reduce(
    (acc, game) => acc + calcShopPrice(game.finalPrice * game.quantity),
    0
  );

export const sendAnErrorInCaseOfNormalUserAccessingAdminEndPoint = (
  req: Request,
  res: Response
) => {
  const {
    token: { isAdmin },
  } = req as Request & IRequestAdditionAfterVerifyJwtfMiddleware;
  if (isAdmin) return true;
  res.sendStatus(403);
  return false;
};

export const acquireAndValidatePageNrAndSortPropertiesWhenRetrievingOrders =
  async function (req: Request) {
    const { pageNr, sortProperties, amount } = await parseQueries(req);
    await validateQueriesTypes([
      ["number", pageNr],
      ["object", sortProperties],
      ["number", amount],
    ]);
    return { pageNr, sortProperties, amount };
  };

const transformDateNotToTakeTimeIntoAccount = (date: Date) => {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0);
};

export const sortRetrievedOrdersBasedOnSentSortProperties = function <
  T extends IOrder
>(
  sortProperties: Record<
    "debouncedDate" | "debouncedTotalValue",
    IOrderCustomizationProperty
  >,
  orders: T[]
) {
  const { debouncedDate, debouncedTotalValue } = sortProperties;
  const sortPropertiesNotEmpty = generateOrderObj([
    { name: "date", obj: debouncedDate },
    { name: "totalValue", obj: debouncedTotalValue },
  ]);
  const ordersToSend = [...orders];
  Object.entries(sortPropertiesNotEmpty)
    .reverse()
    .forEach(([propertyName, propertyOrder]) =>
      ordersToSend.sort((o1, o2) => {
        const getValueFromOrderObj = (order: T, key: keyof T) =>
          typeof order[key] === "object"
            ? transformDateNotToTakeTimeIntoAccount(order[key] as Date)
            : +order[key];
        const [v1, v2] = [
          getValueFromOrderObj(o1, propertyName as keyof T),
          getValueFromOrderObj(o2, propertyName as keyof T),
        ];
        const subtraction = v1 - v2;
        if (propertyOrder === 1) return subtraction;
        return -subtraction;
      })
    );
  return ordersToSend;
};

export const applyPageNrToArrOfDocuments = async function <T extends object>(
  maxPerPageEnvironmentVariableEntryName: keyof IProcessEnvVariables,
  pageNr: number,
  documents: T[]
) {
  const MAX_DOCUMENTS_PER_PAGE = accessEnvironmentVariable(
    maxPerPageEnvironmentVariableEntryName
  );
  if (pageNr !== undefined)
    return documents.slice(
      pageNr * +MAX_DOCUMENTS_PER_PAGE,
      (pageNr + 1) * +MAX_DOCUMENTS_PER_PAGE
    );
  return documents.slice(0, 5);
};

export const applyPageNrToRetrievedOrders = applyPageNrToArrOfDocuments.bind(
  null,
  "MAX_ORDERS_PER_PAGE"
);

export const convertOrderStatusToUserFriendlyOne = <T extends IOrder>(
  order: T
): T => ({
  ...order,
  status: orderPossibleStatusesUserFriendlyMap[order.status!],
});

export const tryToTransformOrderUserFriendlyStatusToItsDatabaseVersion = (
  status: string
) =>
  Object.entries(orderPossibleStatusesUserFriendlyMap).find(
    (orderPossibleStatusEntry) => orderPossibleStatusEntry[1] === status
  )?.[0] || { message: "You are not allowed to set such an order status!" };

export const bodyEntryValidMongooseObjectIdValidateFn = (
  value: unknown,
  entryVisibleName: string
) =>
  isValidObjectId(value)
    ? true
    : {
        message: `Provided ${entryVisibleName.replace(
          entryVisibleName[0],
          entryVisibleName[0].toLowerCase()
        )} isn't valid!`,
      };

export const verifyProvidedOrderGamesEntriesAndTurnThemIntoOrderItemsArr =
  async <T extends IReceivedGameDetailsEntry>(orderedGamesDetails: T[]) =>
    await Promise.all(
      orderedGamesDetails.map(async (orderedGamesDetailsEntry) => {
        if (!isValidObjectId(orderedGamesDetailsEntry._id))
          throw new Error(
            "One of your order games has an incorrect identificator provided!"
          );
        const relatedGame = await Game.findById(orderedGamesDetailsEntry._id);
        console.log(relatedGame, orderedGamesDetailsEntry._id);
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
