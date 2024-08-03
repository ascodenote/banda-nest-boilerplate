export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  frontendDomain?: string;
  backendDomain: string;
  port: number;
  apiPrefix: string;
};

export type AuthConfig = {
  secret?: string;
  expires?: string;
  refresh_exp?: string;
};

export type DataBaseConfig = {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  db: DataBaseConfig;
};
