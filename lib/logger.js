var winston = require('winston');

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: true,
      level: 'debug',
      colorize: true
    }),
	new (winston.transports.DailyRotateFile)({
      name: 'info-file',
      filename: 'log/filelog-log.log',
      level: 'debug',
	  datePattern: '.dd-MM-yyyy'
    }),
    new (winston.transports.DailyRotateFile)({
      name: 'error-file',
      filename: 'log/filelog-error.log',
      level: 'error',
	  datePattern: '.dd-MM-yyyy'
    })	  
  ]
});

module.exports = logger;