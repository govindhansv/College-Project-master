var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileupload=require('express-fileupload')
var db=require('./config/connection')
var session=require('express-session')
const Handlebars = require('handlebars');
const nocache=require('nocache')

Handlebars.registerHelper('increment', function(value) {
  return value + 1;
});


var UserRouter = require('./routes/user');
var ownerRouter = require('./routes/owner');
var devRouter = require('./routes/dev');


var app = express();
var hbs = require('express-handlebars');
const { ObjectId } = require('mongodb');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileupload());
app.use(nocache());
app.use(session({secret:"Key" , resave: false,
saveUninitialized: true,cookie:{maxAge:600000}}));

db.connect()


// Middleware to fake session
function fakeSession(req, res, next) {
  if (process.env.NODE_ENV != 'production') {
    // Assuming you have a function to authenticate the user and create a session
    // Replace it with your actual authentication logic
    req.session.owner = {
      _id: new ObjectId("6596cce6fd9c707875b312ed"),
      name: 'Ramesh',
      email: 'ramesh@gmail.com',
      password: '$2b$10$.3gki5iNzzY50p6H7k8wZeUHJf83SJfTrW0v8UjGzzBCfQTV2h23G',
      rpassword: '123',
      loggedIn: true
    }
    
  }
  next();
}

// Apply the middleware to all routes
// app.use(fakeSession);

app.use('/', UserRouter);
app.use('/owner', ownerRouter);
app.use('/dev', devRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
