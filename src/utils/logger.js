'use strict';

const bunyan = require('bunyan');

const logConf = {
  path: "logs/ella.log",
  level: "DEBUG"
}
const Elasticsearch = require('bunyan-elasticsearch');
const esStream = new Elasticsearch({
  indexPattern: '[ella-]YYYY.MM.DD',
  type: 'logs',
  host: logConf.host
});
esStream.on('error', function(err) {
  console.log('Elasticsearch Stream Error:', err.stack);
});


var streams = [];
var stdStream = {
  level: 'info',
  stream: process.stdout // log INFO and above to stdout
}
streams.push(stdStream);
if (process.env.LOG_TO_FILE && JSON.parse(process.env.LOG_TO_FILE)) {
  var fileStream = {
    path: logConf.path,
    level: logConf.level
  };
  streams.push(fileStream);
}

function getLogger() {
  var log = bunyan.createLogger({
    name: 'botTester',
    src: true,
    streams: streams,
    serializers: bunyan.stdSerializers
  });
  return log;
}
var log = getLogger();
// log ={
//   info: function () {
//     for (key in arguments) {
//       console.log(arguments[key])
//     }
//   },
//   error: function () {
//     for (key in arguments) {
//       console.error(arguments[key])
//     }
//   }
//
// }
module.exports = log;
