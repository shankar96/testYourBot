'use strict'
var fbClient = require('../fb_client/fbClient')
var request = require('request')
var log = require('../utils/logger')
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
                    "text":"message1"
                },{
                    "text":"message2"
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
                    "text":"message1"
                },{
                    "text":"message2"
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

function checkEachMessage(clientMessageFormat, index, flowName, cb) {
    it('Testing Flow => <' + flowName + ', message ' + index + '>', function (done) {
        fbClient.sendMessageToFbServer(clientMessageFormat, function (response) {

            if (response.err) {
                log.info("Error", response.err);
                cb(false)
                done()
            } else {
                // log.info("Response From bot via Fbserver",response);
                response.should.to.be.a('Array')
                for(let i=0;i<response.length;i++){
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

function checkEachFlow(flow, flowName) {
    return new Promise((resolveAll, rejectAll) => {
        describe('Testing Flow => ' + flowName, function () {
            flow.reduce((promiseChain, message, index) => {
                return new Promise((resolve, reject) => {
                    checkEachMessage(flow[index], index, flowName, function () {
                        resolve();
                        if (index + 1 == flow.length) {
                            resolveAll('done....')
                        }
                    })
                })
            }, Promise.resolve())
        })
    })
}
// checkEachFlow(flows.flow1, "flow1")
// .then((status) => {
//     console.log("flow resolved", status)
// })

function checkMultipleFlowSync(flows){
    return new Promise((resolveAll,rejectAll)=>{
        describe('Testing multiple Flow', function () {
            Object.keys(flows).reduce((promiseChain,flow,index)=>{
                return new Promise((resolve,reject)=>{
                    let flowName = Object.keys(flows)[index];
                    checkEachFlow(flows[flowName],flowName)
                    .then((status)=>{
                        resolve();
                        if(index+1==Object.keys(flows).length){
                            resolveAll("done....")
                        }
                    })
                })
            },Promise.resolve())
        })
    })
}
checkMultipleFlowSync(flows)
.then((status)=>{
    console.log("All flow resolved ",status)
})

module.exports={
    checkMultipleFlowSync,
    checkEachFlow
}