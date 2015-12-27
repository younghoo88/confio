var winston = require('winston');

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug'
    })
  ]
});

logger.add(require('winston-daily-rotate-file'), {
  level: 'debug',
  dirname: '../logs',
  filename: '../logs/app-debug',
  datePattern: '.yyyy-MM-dd.log',
  maxsize: 1024 * 1024 * 10,
  timestamp: true
});

module.exports = logger;