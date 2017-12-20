'use strict'
const path = require('path')
const cluster = require('cluster');
var log = require('./utils/logger');
if (cluster.isMaster) {
    log.info("master.............");
    cluster.fork();
} else {
  if(process.env.ELLA_CONF_DIR) {
    process.env.ELLA_CONF_DIR = path.resolve(process.env.ELLA_CONF_DIR)+"/";
  }else{
    throw "Pass :- ELLA_CONF_DIR";
  }

  log.info("appserver started");
  var appserver = require('../../src/webapp/app');// to start app server
  // callTest
  log.info("fbTest")

  var fbServer = require('./fb_mock_server/fbServer')
  // var fbTest = require('./fb_test/fbTest');
  var generateTestData = require('./webapp/app');
  // var fbCli = require('./fb_test/cli')
  // fbTest.checkFlowsFromFbTestData();
}