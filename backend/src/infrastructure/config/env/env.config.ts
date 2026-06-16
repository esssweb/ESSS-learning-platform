export interface AppConfig {
  nodeEnv: string;
  port: number;
  corsOrigin: string;
}

export default (): { app: AppConfig } => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    corsOrigin: process.env.CORS_ORIGIN || '*',
  },
});
