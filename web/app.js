/**
 * Module dependencies.
 */
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
const moment = require('moment');

const upload = multer({ dest: path.join(__dirname, 'uploads') });

/*
 * moment locale
 */
moment.locale('es');
moment.defaultFormat = 'DD/MM/YY HH:mm:ss';

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');
const loginController = require('./controllers/login');
const systemStatusController = require('./controllers/status');
const contactController = require('./controllers/contact');
const computerController = require('./controllers/computer');
const userController = require('./controllers/user');
const ldapController = require('./controllers/ldap');
const apiController = require('./api');

/**
 * API keys and Passport configuration.
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
const app = express();

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', (err) => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Express configuration.
 */
app.set('NODE_ENV', process.env.NODE_ENV || 'development');
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor({
  path: '/statusapp'
}));
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
  store: new MongoStore({
    url: process.env.MONGODB_URI,
    autoReconnect: true,
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path.match(/^\/api/)) {
  // if (req.path === '/api/upload') {
    // Multer multipart/form-data handling needs to occur before the Lusca CSRF check.
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.isAdmin = req.session.isAdmin;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user
    && req.path !== '/login'
    && req.path !== '/signup'
    && !req.path.match(/^\/auth/)
    && !req.path.match(/\./)) {
    req.session.returnTo = req.originalUrl;
  } else if (req.user
    && (req.path === '/account' || req.path.match(/^\/api/))) {
    req.session.returnTo = req.originalUrl;
  }
  next();
});
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/axios/dist'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/chart.js/dist'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/popper.js/dist/umd'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jquery/dist'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/jszip/dist'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/pdfmake/build'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/datatables.net/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/datatables.net-bs4/js'), { maxAge: 31557600000 }));

app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/datatables.net-buttons/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/datatables.net-buttons-bs4/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/datatables.net-responsive/js'), { maxAge: 31557600000 }));
app.use('/js/lib', express.static(path.join(__dirname, 'node_modules/datatables.net-responsive-bs4/js'), { maxAge: 31557600000 }));

app.use('/css/lib', express.static(path.join(__dirname, 'node_modules/animate.css'), { maxAge: 31557600000 }));

app.use('/css/lib', express.static(path.join(__dirname, 'node_modules/datatables.net-bs4/css'), { maxAge: 31557600000 }));
app.use('/css/lib', express.static(path.join(__dirname, 'node_modules/datatables.net-buttons-bs4/css'), { maxAge: 31557600000 }));
app.use('/css/lib', express.static(path.join(__dirname, 'node_modules/datatables.net-responsive-bs4/css'), { maxAge: 31557600000 }));

app.use('/webfonts', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free/webfonts'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', homeController.index);
app.get('/login', loginController.getLogin);
app.post('/login', loginController.postLogin);
app.get('/logout', loginController.logout);
// app.get('/forgot', loginController.getForgot);
// app.post('/forgot', loginController.postForgot);
app.get('/reset/:token', loginController.getReset);
app.post('/reset/:token', loginController.postReset);
// Avoid signup because we are using ldap auth
// app.get('/signup', loginController.getSignup);
// app.post('/signup', loginController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/account/verify', passportConfig.isAuthenticated, loginController.getVerifyEmail);
app.get('/account/verify/:token', passportConfig.isAuthenticated, loginController.getVerifyEmailToken);
app.get('/account', passportConfig.isAuthenticated, loginController.getAccount);
app.post('/account/profile', passportConfig.isAuthenticated, loginController.postUpdateProfile);
app.post('/account/password', passportConfig.isAuthenticated, loginController.postUpdatePassword);
app.post('/account/delete', passportConfig.isAuthenticated, loginController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConfig.isAuthenticated, loginController.getOauthUnlink);

/**
 * Monitorization routes.
 */
app.get('/computer', passportConfig.isAdmin, computerController.getComputer);
app.get('/computer/status/:computer', passportConfig.isAdmin, computerController.getComputerStatus);
app.get('/computer/user/:computer', passportConfig.isAdmin, computerController.getComputerUser);

app.get('/user', passportConfig.isAdmin, userController.getUser);
app.get('/user/:user', passportConfig.isAdminOrSameUser, userController.getUserComputer);

app.get('/status', passportConfig.isAdmin, systemStatusController.getSystemStatus);

/**
 * LDAP routes.
 */
app.get('/ldap/users', passportConfig.isAdmin, ldapController.getUsers);
app.get('/ldap/groups', passportConfig.isAdmin, ldapController.getGroups);

/**
 * API routes.
 */
app.use('/api', apiController);


/**
 * Error Handler.
 */
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
