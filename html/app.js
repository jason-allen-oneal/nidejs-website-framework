const bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	cors = require('cors'),
	hb = require('express-handlebars'),
	jwt = require('jsonwebtoken'),
	winston = require('winston'),
	express = require('express'),
	session = require('express-session'),
	fs = require('fs');

process.on('uncaughtException', (err) => {
	console.error((new Date()).toUTCString() + ' uncaughtException:', err.message);
  	console.error(err.stack);
  	process.exit(1);
});

var app = express();
var https = require('https');
var server = https.createServer({
  key: fs.readFileSync('../ssl/private.key'),
  cert: fs.readFileSync('../ssl/certificate.crt'),
}, app);
var core = require('./lib/core');
core.initialize().then((core) => {
  app.use(cors());
  app.use(bodyParser.urlencoded({
	  extended: false
  }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(express.static(__dirname + '/assets/'));
  
  var handlebars = hb.create({
	  extname: ".html",
	  defaultLayout: "site",
	  layoutsDir: __dirname+'/views/layouts/',
	  partialsDir: __dirname+'/views/partials/',
	  helpers: handlebarsHelpers
  });
  app.engine('html', handlebars.engine);
  app.set('view engine', 'html');
  
  app.use((req, res, next) => {
	  res.set('Cache-Control', 'no-store');
	  next();
  });
  
  global.logger = winston.createLogger({
	  level: 'warn',
	  format: winston.format.json(),
	  defaultMeta: { service: 'user-service' },
	  transports: [
		  new winston.transports.File({ filename: '../logs/app_error.log', level: 'error' }),
		  new winston.transports.File({ filename: '../logs/app_combined.log' })
	  ],
  });
  
  global.User = global.User || {
	  id: 0,
	  name: '',
	  email: '',
	  joined: 0,
	  admin: 0,
	  token: '',
	  avatar: ''
  };
  
  app.locals.site = {
	  name: core.config.sitename,
	  base: core.config.protocol+'://'+core.config.servername,
	  copyDate: new Date().getFullYear(),
	  isAdmin: (global.User.admin) ? true : false,
	  loggedIn: (global.User.token === '') ? false : true
  };
  
  global.tokenAuth = function(req, res, next){
	  var token = req.body.token || req.query.token || req.cookies.token;
	  
	  if(!token){
	  	return res.redirect('/user/login/');
	  }
	  
	  jwt.verify(token, core.config.secret, function(err, decoded){
		  if(err){
			  return res.redirect('/user/login/');
		  }
		  
		  if(global.User.id !== decoded.id){
		  	return res.redirect('/user/login/');
		  }
		  
		  next();
	  });
  };
  
  global.redirect = "/user/account/";
  var setRedirect = function(req, res, next){
    global.redirect = req.originalUrl;
    next();
  };
  app.use(setRedirect);
  
  var pageSetup = function(req, res, next){
    var loggedIn = false, isAdmin = false;
    
	  if(global.User.token !== ''){
		  loggedIn = true;
	  }
	  if(global.User.admin){
		  isAdmin = true;
	  }
	   app.locals.site.isAdmin = isAdmin;
	  app.locals.site.loggedIn = loggedIn;
	  app.locals.site.user = global.User;
	  app.locals.User = global.User;
	  
	  next();
  };
  app.use(pageSetup);
  
  core.setApp(app, () => {
	  const { Server } = require('socket.io');
	  global.io = new Server(server);
	  
	  var userRoutes = require('./routes/user')(core, express),
	    siteRoutes = require('./routes/base')(core, express);
    
    // Add additional routes here
    app.use('/user', userRoutes);
    app.use('/', siteRoutes);
	  
	  var UserController = require('./controllers/user');
	  var TemplateController = require('./controllers/template');
	  
	  io.on('connection', (socket) => {
		  UserController.init(core, socket);
		  TemplateController.init(core, socket);
	  });
    
	  server.listen(core.config.port, () => {
		  global.logger.info('App running on localhost:'+core.config.port);
	  });
  });
});
    