var express = require('express');
var router = express.Router();
var winston = require('winston');

/* GET home page. */
router.get('/', function(req, res, next) {
  global.logger.debug('entering the index page');
  res.render('index', { title: 'Express' });
});

module.exports = router;
