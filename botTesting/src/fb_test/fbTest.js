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

var flows = {
    flow1: [
        {
            type: "text",
            text: "multiple_message",
            senderId: "senderId",
            pageId: "pageId",
            appId: "appId",
            response: "bot:flow1 hi1"
        }, {
            type: "text",
            text: "hi22",
            senderId: "senderId",
            pageId: "pageId",
            appId: "appId",
            response: "bot:flow1 hi2"
        }, {
            type: "text",
            text: "multiple_message",
            senderId: "senderId",
            pageId: "pageId",
            appId: "appId",
            response: [
                {
                    "text": "message1"
                }, {
                    "text": "message2"
                }
            ]
        }],
    flow2: [
        {
            type: "text",
            text: "multiple_message",
            senderId: "senderId",
            pageId: "pageId",
            appId: "appId",
            response: "bot:flow1 hi3"
        }
    ],
    "flow_1511279317574": {
        "createdTime": "Date:-Tue Nov 21 2017 21:18:37 GMT+0530 (IST)  Timestamp:- 1511279317577",
        "description": "Empty Description...",
        "senderId": "1",
        "pageId": "2",
        "appId": "3",
        "flow": [
            {
                "query": {
                    "type": "text",
                    "text": "hi"
                },
                "response": [
                    {
                        "recipient": {
                            "id": "1"
                        },
                        "message": {
                            "text": "bot:-hi"
                        }
                    }
                ]
            },
            {
                "query": {
                    "type": "text",
                    "text": "multiple_message"
                },
                "response": [
                    {
                        "recipient": {
                            "id": "1"
                        },
                        "message": {
                            "text": "message1"
                        }
                    },
                    {
                        "recipient": {
                            "id": "1"
                        },
                        "message": {
                            "text": "message2"
                        }
                    }
                ]
            }
        ],
        "flowId": "flow_1511279317574",
        "savedTime": "Date:-Tue Nov 21 2017 21:20:42 GMT+0530 (IST)  Timestamp:- 1511279442021"
    },
    flow3: [
        {
            type: "text",
            text: "multiple_message",
            senderId: "senderId",
            pageId: "pageId",
            appId: "appId",
            response: "bot:flow1 hi1"
        }, {
            type: "text",
            text: "hi223",
            senderId: "senderId",
            pageId: "pageId",
            appId: "appId",
            response: "bot:flow1 hi2"
        }, {
            type: "text",
            text: "multiple_message",
            senderId: "senderId",
            pageId: "pageId",
            appId: "appId",
            response: [
                {
                    "text": "message1"
                }, {
                    "text": "message2"
                }
            ]
        }],

}
let clientMessageFormat = {
    type: "text",
    text: "hi",
    senderId: "senderId",
    pageId: "pageId",
    appId: "appId",
}

function checkEachMessage(clientMessageFormat, index, flowId, cb) {
    it('Testing Flow => <' + flowId + ', message ' + index + '>', function (done) {
        fbClient.sendMessageToFbServer(clientMessageFormat, function (response) {
            if (response.err) {
                log.info("Error", response.err);
                cb(false)
                done()
            } else {
                log.info("\tResponse From bot via Fbserver", response);
                response.should.to.be.a('Array')
                for (let i = 0; i < response.length; i++) {
                    response[i].recipient.should.to.be.a('object');
                    response[i].recipient.id.should.to.be.a('string');
                    //all tests
                }
                cb(true)
                done();
            }
        })
    })
}

function checkEachFlow(flowInfo) {
    return new Promise((resolveAll, rejectAll) => {
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
                        checkEachMessage(clientMessageFormat, index, flowInfo.flowId, function () {
                            resolve();
                            if (index + 1 == flowInfo.flow.length) {
                                resolveAll('done....')
                            }
                        })
                    } catch (err) {
                        log.error("Error:-", err, "In processing TestData", flowInfo.flow[index])
                        resolve();
                    }
                })
            }, Promise.resolve())
        })
    })
}
checkEachFlow(flows['flow_1511279317574'])
.then((status) => {
    console.log("flow resolved", status)
})
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
                        .then((status) => {
                            resolve();
                            if (index + 1 == Object.keys(flows).length) {
                                resolveAll("done....")
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

function checkFlowsFromFbTestData(flowId) {
    return new Promise((resolve, reject) => {
        describe('reading testData from ' + fbTestDataFile, function () {
            it('Test started reading', function (done) {
                testUtils.readTestFile(fbTestDataFile)
                    .then((data) => {
                        done();
                        data = JSON.parse(data);
                        let flows = data.testData.flows;
                        if (flowId) {
                            flows = {
                                [flowId]: data.testData.flows[flowId]
                            }
                        }
                        describe('reading done..',function(){
                        it('Test completed reading', function () { })})
                        // console.log('checkFlowsFromFbTestData',flows)
                        checkMultipleFlowSync(flows)
                            .then((status) => {
                                resolve(status)
                                console.log("All flow resolved", status)
                            })
                    }).catch((err) => {
                        reject(err)
                    })
            })
        })
    })
}
module.exports = {
    checkMultipleFlowSync,
    checkEachFlow,
    checkFlowsFromFbTestData
}