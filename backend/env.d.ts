export interface IProcessEnvVariables {
  CLIENT_ID: string;
  JWTREFRESHSECRET: string;
  JWTSECRET: string;
  SECRET: string;
  MONGO_URL: string;
  FRONTEND_URLS: string;
  MAX_ORDERS_PER_PAGE: string;
  MAX_USERS_PER_PAGE: string;
  FRONTEND_URL_FOR_COOKIES: string;
  BACKEND_URL_FOR_COOKIES: string;
}

declare namespace NodeJS {
  interface ProcessEnv extends IProcessEnvVariables {}
}
