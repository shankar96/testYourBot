/**
 * Created by shankarkumarc on 15/12/17.
 */
"use strict";
const log = require('./utils/logger');
const testUtils = require('./utils/testUtils')
const path = require('path');
const reportFile = path.resolve(__dirname)+"/test_data/report.json"
function notifyUsingSocket(socket,event,info) {
  if(socket){
    socket.emit(event,info);
  }
}
function saveReport(testResults,testStartedTimestamp,testCompletedTimestamp) {
  let reportId = "report_"+new Date().getTime();
  testUtils.readTestFile(reportFile)
    .then((data)=>{
      data = JSON.parse(data);
      data[reportId]={
        reportId,
        testStartedTimestamp,
        testCompletedTimestamp,
        report:testResults
      }
      testUtils.writeTestFile(reportFile, JSON.stringify(data, null, '\t'))
        .then((resp) => {
          log.info("successfully saved test report with ",reportId)
        }).catch((err) => {
        log.info("Error in saving test report",err)
      })
    })
}
function pushResults(socket, flowId, test, testResults) {
  let responseTime = 0, messageId;
  if(test.info && test.info.responseTime){
    responseTime = test.info.responseTime
  }
  messageId = test.title.split(/{|}/)[1];
  if(testResults[messageId]){
    messageId = messageId+"_"+new Date().getTime();
  }
  if(!flowId){
    flowId = test.flowId;
    if(!flowId){
      flowId = process.env.flowId;
    }
  }
  let testResult ={
    title: test.title,
    responseTime,
    timedOut: test.timedOut,
    duration: test.duration,
    state: test.state,
    speed: test.speed,
    flowId,
    messageId,
    info:test.info,
    err:test.err
  }
  notifyUsingSocket(socket,'testingInfo',testResult);
  if(testResults[flowId]){
    testResults[flowId][messageId] = testResult;
  }else{
    testResults[flowId] = {};
    testResults[flowId][messageId] = testResult;
  }
  log.info("results for =>\n"+test.title,testResult);

}
function fbTests(socket, flowId) {
  let Mocha = require('mocha'),
    fs = require('fs'),
    path = require('path');
  let mocha = new Mocha();
  let testDir = path.join(__dirname,'/fb_test/fbTest.js');
  process.env.AUTOMATED_TESTING = true;
  process.env.flowId = flowId;
  log.info("TestDirecory=>\n",testDir)
  return new Promise((resolve,reject)=>{
    delete require.cache[ testDir ];
    mocha.addFile(testDir);
    let testResults = {};
    let testStartedTimestamp = new Date().getTime();
    mocha.run(function(failures){
      process.on('exit', function () {
        process.exit(failures);  // exit with non-zero status if there were failures
      });

    }).on('test', function(test) {
      log.info("█▒▒▒▒▒▒▒▒▒ test started \n", test.title);
      // notifyUsingSocket(socket,'testingInfo',{"state":"test started","title":test.title});
    }).on('test end', function(test) {
      log.info("██████████ test ended \n", test.title);
      // notifyUsingSocket(socket,'testingInfo',{"state":"test Ended","title":test.title});
    }).on('pass', function(test) {
      log.warn("✓ test passed\n", test.title);
      pushResults(socket, flowId, test, testResults);
    }).on('fail', function(test, err) {
      log.error("❌ test Failed\n", test.title);
      if(!test.info){
        test.info ={}
      }
      test.info.err = err;
      pushResults(socket, flowId, test, testResults);
    }).on('end', function() {
      let testCompletedTimestamp = new Date().getTime();
      notifyUsingSocket(socket,'testedFlow',testResults);
      saveReport(testResults,testStartedTimestamp,testCompletedTimestamp);
    });
    resolve(true);
  })

}

module.exports={
  fbTests
}