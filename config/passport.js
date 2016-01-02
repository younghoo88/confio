var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var async = require('async');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    global.logger.debug('passport.serializeUser()', user);
    done(null, user.user_id);
  });

  passport.deserializeUser(function(id, done) {
    global.connectionPool.getConnection(function(err, connection) {
      if (err) {
        return done(err);
      }

      var selectQuery = 'SELECT user_id, email, password ' +
                        'FROM users ' +
                        'WHERE user_id = ?';

      connection.query(selectQuery, [id], function(err, rows, fields) {
        var user = {};
        user.user_id = rows[0].user_id;
        user.email = rows[0].email;
        user.password = rows[0].password;
        connection.release();
        global.logger.debug('passport.deserializeUser()', user);
        return done(null, user);
      });
    });
  });

  passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, email, password, done) {

    process.nextTick(function() {

      global.connectionPool.getConnection(function(err, connection) {

        if (err) {
          return done(err);
        }

        // email 중복검사
        var selectQuery = 'SELECT user_id ' +
                          'FROM user ' +
                          'WHERE email = ?';

        connection.query(selectQuery, [email], function(err, rows, fields) {

          if (err) {
            connection.release();
            return done(err);
          }

          if (rows.length) {
            connection.release();
            return done(null, false, 'email이 중복되었습니다.');
          } else {
            async.waterfall([
              function generateSalt(callback) {
                var rounds = 10;
                bcrypt.genSalt(rounds, function(err, salt) {
                  global.logger.debug('bcrypt.genSalt() => ' + salt + '  (' + salt.toString().length + ')');
                  callback(null, salt);
                });
              },
              function hashPassword(salt, callback) {
                bcrypt.hash(password, salt, null, function(err, hashPass) {
                  global.logger.debug('bcrypt.hash() => ' + hashPass + ' (' + hashPass.length + ')');
                  var newUser = {};
                  newUser.email = email;
                  newUser.password = hashPass;
                  callback(null, newUser);
                });
              }
            ], function(err, newUser) {

              if (err) {
                connection.release();
                return done(err);
              }

              var insertQuery = 'INSERT INTO user(name, email, job_sort, job, password) ' +
                                'VALUES (?, ?, ?, ?, ?)';

              var placeHolders = [
                req.body.name,
                newUser.email,
                req.body.job_sort,
                req.body.job,
                newUser.password
              ];

              connection.query(insertQuery, placeHolders, function(err, result) {

                if (err) {
                  connection.release();
                  return done(err);
                }

                newUser.id = result.insertId;
                connection.release();
                return done(null, newUser);
              }); // end of connection.query(insert)
            }); // end of async waterfall()
          } // end of if/else(메일 중복검사)
        }); // end of connection.query(select email)
      }); // end of global.connectionPool.getConnection()
    }); // end of process.nextTick()
  })); // end of passport.use()

  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  }, function(req, email, password, done) {

    process.nextTick(function() {

      global.connectionPool.getConnection(function(err, connection) {

        if (err) {
          return done(err);
        }

        var selectQuery = 'SELECT user_id, email, password ' +
                          'FROM user ' +
                          'WHERE email = ?';

        connection.query(selectQuery, [email], function(err, rows, fields) {

          if (err) {
            connection.release();
            return done(err);
          }

          if (!rows.length) {
            connection.release();
            return done(null, false, '존재하지 않는 이메일입니다.');
          }

          var user = {};
          user.user_id = rows[0].user_id;
          user.email = rows[0].email;
          user.password = rows[0].password;
          connection.release();
          bcrypt.compare(password, user.password, function(err, result) {

            if (!result) {
              return done(null, false, '잘못된 이메일이나 비밀번호입니다.');
            }

            global.logger.debug('bcrypt.compare() => ' + user.password + ' (' + user + ') ');
            return done(null, user);
          });
        }); // end of connection.query(select email)
      }); // end of global.connectionPool.getConnection()
    }); // end of process.nextTick()
  })); // end of passport.use()
};