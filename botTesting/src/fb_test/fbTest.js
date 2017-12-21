'use strict'
var fbClient = require('../fb_client/fbClient')
let fbTestDataFile = require('./fbTestConf').getFbTestDataFile()
var request = require('request')
var log = require('../utils/logger')
var testUtils = require('../utils/testUtils')
var Promise = require('bluebird')
const mocha = require('mocha');
const chai = require('chai');
var should = chai.should();
var cachePageId ={}
let clientMessageFormat = {
    type: "text",
    text: "hi",
    senderId: "senderId",
    pageId: "pageId",
    appId: "appId",
}
function testResponse(botResponse, savedResponse) {
    botResponse.should.to.be.a('Array')
    botResponse.length.should.to.be.equal(savedResponse.length)
    for (let i = 0; i < botResponse.length; i++) {
        botResponse[i].recipient.should.to.be.a('object');
        botResponse[i].recipient.id.should.to.be.a('string');
        botResponse[i].message.should.to.be.a('object');
        Object.keys(botResponse[i].message).should.be.deep.equal(Object.keys(savedResponse[i].message))
        if(botResponse[i].message.attachment){
          Object.keys(botResponse[i].message.attachment).should.be.deep.equal(Object.keys(savedResponse[i].message.attachment))

          if(botResponse[i].message.attachment.payload){
            Object.keys(botResponse[i].message.attachment.payload).should.be.deep.equal(Object.keys(savedResponse[i].message.attachment.payload))
          }
        }
        //all tests
    }
}
function checkEachMessage(clientMessageFormat, index, flowId, savedResponse, cb) {
    describe('Testing Flow => <' + flowId + ', message {' + index + '}>', function () {
      let info = {};//TO add extra info about tests.
      info['function'] = 'checkEachMessage';
      info['clientMessageFormat'] = clientMessageFormat;
      let responseFb = {};
      beforeEach('before Each',function (done) {
        if(!cachePageId[clientMessageFormat.pageId]){// set Timeout
          cachePageId[clientMessageFormat.pageId] = clientMessageFormat.pageId
          this.timeout(50000);
          info["timeoutSet"]=50000;
          info["timeoutSet_"]="timeout is set to 50 seconds because during initialization it takes time and we are also noting responsetime"
        } else{
          // bot may respond late so at max timeout 10 second and we are also noting responsetime
          cachePageId[clientMessageFormat.pageId] = clientMessageFormat.pageId
          this.timeout(30000);
          info["timeoutSet"]=30000;
          info["timeoutSet_"]="bot may respond late so at max timeout 30 second and we are also noting responsetime"
        }
        let currTime = new Date().getTime();
        fbClient.sendMessageToFbServer(clientMessageFormat, function (response) {
          responseFb = response;
          info['responseTime'] = (new Date().getTime() - currTime);
          done()
        });
      })
      it('Testing Flow => <' + flowId + ', message {' + index + '}>', function () {
        let response = responseFb
        if (response.err) {
          this._runnable.info = info;
          this._runnable.flowId=flowId;
          log.error("Error in sendMessageToFbServer", response.err);
          this._runnable.info["err"] = response.err;
          cb()
        } else {
          this._runnable.info = info;
          this._runnable.flowId=flowId;
          // TODO Test Logic on each Message
          log.info("\tResponse From bot via Fbserver", response);
          this._runnable.info["response"]=response;
          this._runnable.info["savedResponse"]=savedResponse;
          testResponse(response, savedResponse);
          cb()
        }
      })
    })
}

function checkEachFlow(flowInfo) {
    return new Promise((resolveAll, rejectAll) => {
        process.env.flowId = flowInfo.flowId;// to use when not setted in each test
        describe('Testing Flow => ' + flowInfo.flowId, function () {
            flowInfo.flow.reduce((promiseChain, message, index) => {
                return new Promise((resolve, reject) => {
                    try {
                        let clientMessageFormat = {
                            type: flowInfo.flow[index].query.type,
                            text: flowInfo.flow[index].query.text,
                            senderId: flowInfo.senderId,
                            pageId: flowInfo.pageId,
                            appId: flowInfo.appId,
                        }
                        let savedResponse = flowInfo.flow[index].response;
                        checkEachMessage(clientMessageFormat, index, flowInfo.flowId, savedResponse, function () {
                            resolve();
                            if (index + 1 == flowInfo.flow.length) {
                                resolveAll()
                            }
                        })
                    } catch (err) {
                      it('Error in Flow => <' + flowInfo.flowId + ', message {' + index + '}>', function () {
                        this._runnable.info={};
                        this._runnable.flowId=flowInfo.flowId;
                        this._runnable.info["function"]='checkEachFlow';
                        this._runnable.info["err"]=err;
                        log.error("Error:-", err, "In processing TestData", flowInfo.flow[index])
                        resolve();
                        if (index + 1 == flowInfo.flow.length) {
                          resolveAll()
                        }
                      })
                    }
                })
            }, Promise.resolve())
        })
    })
}
// checkEachFlow(flows['flow_1511279317574'])
//     .then((status) => {
//         console.log("flow resolved", status)
//     })
// describe('', function () {
//     it('', function () {

//     })
// })


function checkMultipleFlowSync(flows) {
    return new Promise((resolveAll, rejectAll) => {
        describe('Testing multiple Flow', function () {
            Object.keys(flows).reduce((promiseChain, flowInfo, index) => {
                return new Promise((resolve, reject) => {
                    console.log(flowInfo, index)
                    checkEachFlow(flows[flowInfo])
                        .then(() => {
                            resolve();
                            if (index + 1 == Object.keys(flows).length) {
                                resolveAll()
                            }
                        })
                })
            }, Promise.resolve())
        })
    })
}
// checkMultipleFlowSync(flows)
// .then((status)=>{
//     console.log("All flow resolved ",status)
// })
// setTimeout()

function checkFlowsFromFbTestData(flowId) {
    log.info("checkFlowsFromFbTestData",flowId);
    return new Promise((resolve, reject) => {
        describe('reading testData from ' + fbTestDataFile, function () {
          let testDataContent = {};
          let flag = false;
          before('',function (done) {
            testUtils.readTestFile(fbTestDataFile)
              .then((data)=>{
                testDataContent = data;
                flag = true;
                done()
              }).catch((err)=>{
              testDataContent = err;
                done()
            })
          })
          it('processing Of testFile...',function () {
            if(flag){
              let data = JSON.parse(testDataContent);
              let flows = data.testData.flows;
              if (flowId!='undefined') {
                this._runnable.flowId=flowId;
                if(data.testData.flows[flowId]) {
                  flows = {
                    [flowId]: data.testData.flows[flowId]
                  }
                } else {
                  flag = false;
                }
              } else{
                this._runnable.flowId="TestAllFlowID";
              }
              this._runnable.info={};
              
              this._runnable.info['file'] = fbTestDataFile;
              this._runnable.info['function'] = 'checkFlowsFromFbTestData';
              if(flag) {
                checkMultipleFlowSync(flows)
                  .then((status) => {
                    resolve(status)
                    console.log("All flow resolved", status)
                  })
              }else{
                this._runnable.info['err'] = "No such flowId is present in test data make sure to save it before testing"
              }
            }else{
              this._runnable.info={}
              this._runnable.info['err'] = testDataContent;
            }
          })
        })
    })
}
if(process.env.AUTOMATED_TESTING){
  log.info("flowId to be tested=>\n",process.env.flowId)
  checkFlowsFromFbTestData(process.env.flowId)
}
module.exports = {
    checkMultipleFlowSync,
    checkEachFlow,
    checkFlowsFromFbTestData
}