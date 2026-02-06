require('dotenv').config();
require('module-alias/register');
const cors = require('cors');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { validateEnv, getCorsOrigins, getRateLimitConfig } = require('@configs/env');

const app = express();
validateEnv();
const exceptionHandler = require('@middlewares/exception-handler');
const adminRoutes = require('@routes/admin-routes');
const photoRoutes = require('@routes/photo-routes');
const inquiryRoutes = require('@routes/inquiry-routes');
const noticeRoutes = require('@routes/notice-routes');
const turnstileRoutes = require('@routes/turnstile-routes');

app.set('trust proxy', 1);

const corsOrigins = getCorsOrigins();
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!isProd) return callback(null, true);
    if (corsOrigins.length === 0) {
      return callback(new Error('CORS is not configured'));
    }
    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.set('port', process.env.PORT || 8000);

app.use(express.json());

const rateLimitConfig = getRateLimitConfig();
const apiLimiter = rateLimit({
  windowMs: rateLimitConfig.apiWindowMs,
  max: rateLimitConfig.apiMax,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(apiLimiter);

const path = require('path');
const uploadsPath = path.join(__dirname, '../../public');
app.use('/public', express.static(uploadsPath));

app.use('/turnstile', turnstileRoutes)
app.use('/admins', adminRoutes);
app.use('/photos', photoRoutes);
app.use('/inquiries', inquiryRoutes);
app.use('/notices', noticeRoutes);

app.use(exceptionHandler);

app.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});
