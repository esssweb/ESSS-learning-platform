require('dotenv').config({ path: require('path').resolve(process.cwd(), '.env.dev') });

// Azure Database for PostgreSQL requires TLS. DB_SSL=true turns on verified TLS;
// DB_SSL=false turns it off.
const sslOptions = () =>
  process.env.DB_SSL === 'true'
    ? { ssl: { require: true, rejectUnauthorized: true } }
    : undefined;

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'esss_learning',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: console.log,
    dialectOptions: sslOptions(),
  },
  test: {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE_TEST || 'esss_learning_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: sslOptions(),
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    dialect: 'postgres',
    logging: false,
    // DB_SSL governs. When it is unset, keep the pre-existing behaviour (TLS on,
    // certificate not verified, for GCP Cloud SQL) so existing deployments keep working.
    dialectOptions:
      process.env.DB_SSL === undefined
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : sslOptions(),
  },
};
