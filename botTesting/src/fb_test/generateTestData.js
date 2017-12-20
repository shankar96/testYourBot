"use strict";
var Promise = require('bluebird');
var testUtils = require('../utils/testUtils')
var log = require('../utils/logger')
var activeFlow = {}
var activeTestSuite = {}
let fbTestDataFile = require('./fbTestConf').getFbTestDataFile()
log.info("setting fbTestDataFile => ", fbTestDataFile)
console.log("FbTest Data filename ", fbTestDataFile)
var sampleTestData = {
    "testData": {
        "flows": {
            "flowId": {
                "description": "",
                "senderId": "",
                "pageId": "",
                "appId": "",
                "flow": [
                    {
                        "query": {
                            "type": "",
                            "text": ""
                        },
                        "response": [

                        ]
                    }
                ]
            }
        }
    },
    "testSuite": {
        "testSuiteId": {
            "description": "",
            "senderId": "",
            "pageId": "",
            "appId": "",
            "flows": [
                [
                    {}//flow
                ],
                [

                ]
            ]
        }
    }
}

/**
 * 
 * @param {*} flowId - uniqueId for EachFlow
 * @param {*} data -{
            type:"postback/quick_replies/text",
            text: "multiple_message",
            response: "Will Add here responses as sent by our bot"
        }

 */
function addToActiveFlowById(flowId, data) {
    return new Promise((resolve, reject) => {
        activeFlow[flowId].flow.push(data)
    })

}

function saveActiveFlowById(flowId) {
    return new Promise((resolve, reject) => {

        testUtils.readTestFile(fbTestDataFile)
            .then((data) => {
                data = JSON.parse(data);
                if (!data.testData) {
                    data.testData = {}
                }
                if (!data.testData.flows) {
                    data.testData.flows = {}
                }
                activeFlow[flowId].savedTime = "Date:-" + new Date() + "  Timestamp:- " + new Date().getTime();
                data.testData.flows[flowId] = activeFlow[flowId];
                // console.log(data, JSON.stringify(data))
                testUtils.writeTestFile(fbTestDataFile, JSON.stringify(data, null, '\t'))
                    .then((resp) => {
                        delete activeFlow[flowId];// remove from activeFlow
                        resolve({ success: true, resp, message: "successfully saved in file.." })
                    }).catch((err) => {
                        reject({ success: false, err, message: "Error in writeTestFile in saveActiveFlowById.." })
                    })

            }).catch((err) => {
                reject({ success: false, err, message: "Error in readTestFile in saveActiveFlowById.." })
            })
    })
}
/**
flowInfo={
    flowId,
    senderId,
    pageId,
    description,
    appId
}
 */
function createNewFlow(flowInfo) {
    return new Promise((resolve, reject) => {
        let flowId = flowInfo.flowId,
            senderId = flowInfo.senderId,
            pageId = flowInfo.pageId,
            appId = flowInfo.appId,
            description = flowInfo.description,
            requireFields = [];
        senderId ? "" : requireFields.push("senderId");
        pageId ? "" : requireFields.push("pageId");
        appId ? "" : requireFields.push("appId");
        if (!flowId) {
            flowId = "flow_" + new Date().getTime();
        }
        if (requireFields.length > 0) {
            reject({ success: false, message: "please set the required fields " + requireFields.join(", ") })
        } else {
            description ? description : description = "Empty Description...";
            activeFlow[flowId] = {
                flowId,
                createdTime: "Date:-" + new Date() + "  Timestamp:- " + new Date().getTime(),
                description,
                senderId,
                pageId,
                appId,
                flow: []
            }
            flowInfo = activeFlow[flowId];

            resolve({ success: true, flowInfo, message: "successfully created and initialized new Flow" })
        }
    })
}
/**
 * 
 @param {*} keyPair ={
     "flowId":"",
     "description":"",
     "senderId":"",
     "pageId":"",
     "appId":""
 }
 */
// update in activeFlow
// later save 
function updateKeyPairById(flowId, keyPair) {
    return new Promise((resolve, reject) => {
        if (activeFlow[flowId]) {
            let updatedPair = [];
            let oldFlowId = flowId;
            let success = true;
            if (Object.keys(keyPair).indexOf('flowId') > -1) {
                let data = JSON.parse(JSON.stringify(activeFlow[flowId]));
                if (keyPair['flowId'] == "") {
                    keyPair['flowId'] = 'flowId_' + new Date().getTime();
                }
                // delete activeFlow[flowId];//delete old FlowId and data// mostly we should delete it
                if (activeFlow[keyPair['flowId']]) {
                    //some flow with same ID is available cant Replace
                    success = 'false';
                } else {
                    activeFlow[keyPair['flowId']] = data;//copy
                    activeFlow[keyPair['flowId']]['flowId'] = keyPair['flowId'];
                    updatedPair.push('flowId changed from ' + flowId + " to " + keyPair['flowId']);
                    flowId = keyPair['flowId']
                }

            }
            if (success == true) {
                for (let key in keyPair) {
                    if (key != 'flowId') {
                        updatedPair.push(key + ' changed from ' + activeFlow[flowId][key] + " to " + keyPair[key]);
                        activeFlow[flowId][key] = keyPair[key];

                    }
                }
                let newFlowId = keyPair['flowId'] ? keyPair['flowId'] : flowId;
                console.log("cache file....", activeFlow);
                resolve({ success, updatedPair, message: "updated in cache..", oldFlowId, newFlowId, keyPair })
            } else {
                resolve({ success, updatedPair, message: "couldn't update because there is already an active flow with same flowId try with Other flowId" })
            }

        } else {
            //loading flowId in Cache
            testUtils.readTestFile(fbTestDataFile)
                .then((data) => {
                    data = JSON.parse(data);
                    if (data.testData && data.testData.flows) {
                        activeFlow[flowId] = data.testData.flows[flowId];
                        console.log("reading file....", flowId, activeFlow, data)
                        if (activeFlow[flowId]) {
                            updateKeyPairById(flowId, keyPair)
                                .then((resp) => {
                                    console.log("done file....", activeFlow)
                                    resp.message = "Reading from file and saved in cache. " + resp.message;
                                    resolve(resp)
                                }).catch((err) => {
                                    reject(err);
                                })
                        } else {
                            reject({ success: false, message: "flowId is not found in testData file" })
                        }
                    } else {
                        reject({ success: false, message: "unstructured data in testData file" })
                    }
                }).catch((err) => {
                    reject({ success: false, err, message: "Error in readTestFile in updateKeyPairById" })
                })

        }
    })
}
function deleteFlowById(flowId, from) {
    return new Promise((resolve, reject) => {
        if (activeFlow[flowId] && from == 'fromCache') {
            delete activeFlow[flowId];
            resolve({ success: true, message: "removed from activeFlow.." });
        } else {

            testUtils.readTestFile(fbTestDataFile)
                .then((data) => {
                    data = JSON.parse(data)
                    if (data.testData && data.testData.flows) {
                        delete data.testData.flows[flowId]
                        testUtils.writeTestFile(fbTestDataFile, JSON.stringify(data, null, '\t'))
                            .then((resp) => {
                                delete activeFlow[flowId];
                                resolve({ success: true, message: "removed from file and cache..", resp })
                            }).catch((err) => {
                                reject({ success: false, err, message: "Error in deleteFlowById" })
                            })
                    } else {
                        reject({ success: false, message: "unstructured testData in file" })
                    }
                }).catch((err) => {
                    reject({ success: false, err, message: "Error in deleteFlowById" })
                })
        }
    })
}
function viewFlowById(flowId) {
    return new Promise((resolve, reject) => {
        let flow = activeFlow[flowId]
        if (flow) {
            resolve({ success: true, flow, message: "viewing from activeFlow..." })
        } else {
            testUtils.readTestFile(fbTestDataFile)
                .then((data) => {
                    data = JSON.parse(data);
                    if (data.testData && data.testData.flows) {
                        flow = data.testData.flows[flowId];
                        if (flow) {
                            resolve({ success: true, flow, message: "viewing from file..." })
                        } else {
                            resolve({ success: false, err: "404", message: "Not found such flow" })
                        }
                    } else {
                        resolve({ success: false, message: "No such Flow Found...." })
                    }
                }).catch((err) => {
                    reject({ success: false, err, message: "Error in viewFlowById" });
                })
        }
    })
}

function viewAllFlowId() {
    return new Promise((resolve, reject) => {
        testUtils.readTestFile(fbTestDataFile)
            .then((data) => {
                let flowIds1 = [], flowIds2 = [], flowIdsInfo = []
                data = JSON.parse(data)
                if (data.testData && data.testData.flows) {
                    flowIds1 = Object.keys(data.testData.flows);
                }
                flowIds2 = Object.keys(activeFlow);
                for (let key of flowIds1){
                    flowIdsInfo.push({key,"status":"saved"})
                }
                for (let key of flowIds2) {
                    if (flowIds1.indexOf(key) < 0) {
                        flowIdsInfo.push({key,"status":"cached"})
                    }
                }
                console.log(flowIds1,flowIds2,flowIdsInfo)
                resolve({ success: true, flowIds: flowIdsInfo, message: "viewing from file and activeFlow" })
            }).catch((err) => {
                reject({ success: false, err, message: "Error in readingTestFile in viewAllFlowId" })
            })
    })
}
/**
 * return senderId pageId and appId from flowData
 */
function getCustomFlowInfo() {
  return new Promise((resolve,reject)=>{
    testUtils.readTestFile(fbTestDataFile)
      .then((data)=>{
        data = JSON.parse(data);
        let flowIds=[]
        if (data.testData && data.testData.flows) {
          flowIds = Object.keys(data.testData.flows);
        }
        if(flowIds.length>0){
          let flow = data.testData.flows[flowIds[Math.floor(Math.random()*flowIds.length)]]
          resolve({senderId:flow.senderId,pageId:flow.pageId,appId:flow.appId,"length":flowIds.length})
        }else{
          resolve({senderId:"",pageId:"",appId:"","length":flowIds.length})
        }
      }).catch((err)=>{
      log.info("Error in getCustomFlowInfo",err)
      resolve({senderId:"",pageId:"",appId:"",err})
    })
  })
}
module.exports = {
    saveActiveFlowById,
    createNewFlow,
    addToActiveFlowById,
    updateKeyPairById,
    viewFlowById,
    deleteFlowById,
    viewAllFlowId,
    activeFlow,
    getCustomFlowInfo
}