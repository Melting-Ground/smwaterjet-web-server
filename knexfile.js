// Update with your config settings.
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */

require('dotenv').config();
const fs = require('fs');

const getSslConfig = () => {
  const sslMode = (process.env.DB_SSL || '').toLowerCase();
  if (!sslMode || sslMode === 'false' || sslMode === 'disable') return undefined;
  return { rejectUnauthorized: false };
};

const baseConnection = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  ssl: getSslConfig(),
};

module.exports = {
  
  development: {
    client: 'mysql2',
    connection: baseConnection,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  test: {
    client: 'mysql2',
    connection: baseConnection,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  staging: {
    client: 'mysql2',
    connection: baseConnection,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },

  production: {
    client: 'mysql2',
    connection: baseConnection,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }

};
