var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  global.logger.debug('entering the index page');
  res.json({
    message : 'hello world'
  });
  global.logger.debug('hey');
});

module.exports = router;
