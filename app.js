var express = require('express');
var path = require('path');
var logger = require('morgan');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var dbConfig = require('./config/database');
var passport = require('passport');
var flash = require('connect-flash');

require('./config/passport')(passport);

/**
 * 다른 모듈 파일에서도 mysql connectionPool과 winston logger를 선언없이 사용하기 위해 전역으로 정의함.
 */
global.connectionPool = mysql.createPool(dbConfig);
global.logger = require('./config/logger');

// Mount Point
var routes = require('./routes/index');
// Custom mount point
var user = require('./routes/user');
var conference = require('./routes/conference');
var detail = require('./routes/detail');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(flash());

app.use('/', routes);
app.use('/user', user);
app.use('/conference', conference);
app.use('/detail', detail);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      success: 0,
      result: {
        message: err.message
      }
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
