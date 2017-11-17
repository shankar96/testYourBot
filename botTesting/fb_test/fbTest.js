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
    a: [
        {
            type: "text",
            text: "multiple_message",
            senderId: "senderId",
            pageId: "pageId",
            appId: "appId",
            response: "bot:flow1 hi3"
        }
    ]
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
                log.info(response);
                // response.should.to.be.a('object')
                // response.recipient.should.to.be.a('object')
                // response.message.
                // response.reci
                cb(true)
                done();
            }

        })

    })
}

function checkEachFlow(flow, flowName) {
    return new Promise((resolveAll, reject) => {
        describe('Testing Flow => ' + flowName, function () {
            flow.reduce((promiseChain, message, index) => {
                return new Promise((resolve, reject) => {
                    checkEachMessage(flow[index], index, flowName, function () {
                        resolve(index + 1);
                        if (index + 1 == flow.length) {
                            resolveAll('done....')
                        }
                    })
                })
            }, Promise.resolve(0))
        })
    })
}
checkEachFlow(flows.a, "flow1").then((status) => {
    console.log("flow resolved", status)
})