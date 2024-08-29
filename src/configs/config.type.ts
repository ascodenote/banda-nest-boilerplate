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
  refreshSecret?: string;
  refreshExpires?: string;
  forgotSecret?: string;
  forgotExpires?: string;
  confirmEmailSecret?: string;
  confirmEmailExpires?: string;
};

export type DataBaseConfig = {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
};

export type MailConfig = {
  port: number;
  host?: string;
  user?: string;
  password?: string;
  defaultEmail?: string;
  defaultName?: string;
  ignoreTLS: boolean;
  secure: boolean;
  requireTLS: boolean;
};

export type AllConfigType = {
  app: AppConfig;
  auth: AuthConfig;
  db: DataBaseConfig;
  mail: MailConfig;
};
