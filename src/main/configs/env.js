const Exception = require('@exceptions/exception');

const toInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const validateEnv = () => {
  const required = ['JWT_SECRETKEY', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  if (process.env.NODE_ENV === 'production') {
    required.push('CORS_ORIGINS');
  }

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Exception(
      'ConfigurationException',
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

const getCorsOrigins = () => {
  return (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const getRateLimitConfig = () => {
  return {
    apiWindowMs: toInt(process.env.RATE_LIMIT_API_WINDOW_MS, 15 * 60 * 1000),
    apiMax: toInt(process.env.RATE_LIMIT_API_MAX, 300),
    loginWindowMs: toInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS, 15 * 60 * 1000),
    loginMax: toInt(process.env.RATE_LIMIT_LOGIN_MAX, 10),
    uploadWindowMs: toInt(process.env.RATE_LIMIT_UPLOAD_WINDOW_MS, 15 * 60 * 1000),
    uploadMax: toInt(process.env.RATE_LIMIT_UPLOAD_MAX, 50),
  };
};

module.exports = {
  validateEnv,
  getCorsOrigins,
  getRateLimitConfig,
};
