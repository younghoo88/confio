var session = require('express-session');
var SessionStore = require('express-mysql-session');
var options = {
  host : 'localhost',
  port : 3306,
  user : 'root',
  password : '12345678',
  database : 'confio',
  useConnectionPooling : true
};

var sessionMiddleware = session({
  store : new SessionStore(options),
  secret : '12345678',
  cookie : {
    maxAge : 86400000
  },
  resave : true,
  saveUninitialized : true
});

module.exports.sessionMiddleware = sessionMiddleware;