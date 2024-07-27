export interface IProcessEnvVariables {
  CLIENT_ID: string;
  JWTREFRESHSECRET: string;
  JWTSECRET: string;
  SECRET: string;
  MONGO_URL: string;
  FRONTEND_URL: string;
}

declare namespace NodeJS {
  interface ProcessEnv extends IProcessEnvVariables {}
}
