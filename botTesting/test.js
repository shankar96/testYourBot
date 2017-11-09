'use strict'
console.log("appserver started");
var appserver = require('../src/webapp/app')
// callTest
console.log("fbTest")
var fbTest = require('./fb_test/fbTest');

var fbServer = require('./fb_mock_server/fbServer')