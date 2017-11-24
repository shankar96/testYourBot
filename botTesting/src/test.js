'use strict'
var log = require('./utils/logger')
log.info("appserver started");
var appserver = require('../../src/webapp/app');// to start app server
// callTest
log.info("fbTest")

var fbServer = require('./fb_mock_server/fbServer')
var fbTest = require('./fb_test/fbTest');
var generateTestData = require('./webapp/app')
// fbTest.checkFlowsFromFbTestData();