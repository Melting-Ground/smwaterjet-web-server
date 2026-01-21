require('dotenv').config();
require('module-alias/register');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');

const app = express();
const exceptionHandler = require('@middlewares/exception-handler');
const setClientIP = require('@middlewares/client-ip');
const adminRoutes = require('@routes/admin-routes');
const photoRoutes = require('@routes/photo-routes');
const inquiryRoutes = require('@routes/inquiry-routes');
const noticeRoutes = require('@routes/notice-routes');
const turnstileRoutes = require('@routes/turnstile-routes');

app.use(cookieParser());
app.use(cors());

app.set('port', process.env.PORT || 3000);

app.use(express.json());

app.use(setClientIP);
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