const env = require('dotenv').config();
const path = require('path');

const config = {
  default: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    dialect: process.env.DB_DIALECT,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
  },
  development: {
    
    extend: 'default',
  },
  test: {
    extend: 'default',
    database: process.env.DB_TEST_NAME,
  },
  production: {
    extend: 'default',
    database: process.env.DB_PROD_NAME,
  },
};

Object.keys(config).forEach((configKey) => {
  const configValue = config[configKey];
  if (configValue.extend) {
    config[configKey] = { ...config[configValue.extend], ...configValue };
  }
});

module.exports = config;
