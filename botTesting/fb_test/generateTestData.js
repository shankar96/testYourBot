var Promise = require('bluebird');
var fs = require('fs');
var path = require('path')
var testUtils = require('../utils/testUtils')
var activeFlow = {}
var activeTestSuite = {}
let filename = path.join(__dirname.replace('/fb_test', ''), 'test_data/fbTestData.json');
console.log("FbTest Data filename ", filename)
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

        testUtils.readTestFile(filename)
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
                testUtils.writeTestFile(filename, JSON.stringify(data, null, '\t'))
                    .then((resp) => {
                        delete activeFlow[flowId];// remove from activeFlow
                        resolve({success:true,resp,message:"successfully saved in file.."})
                    }).catch((err) => {
                        reject({success:false,err,message:"Error in writeTestFile in saveActiveFlowById.."})
                    })

            }).catch((err) => {
                reject({success:true,err,message:"Error in readTestFile in saveActiveFlowById.."})
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
            
            resolve({ success: true, flowInfo, message:"successfully created and initialized new Flow"})
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
            if (Object.keys(keyPair).indexOf('flowId') > -1) {
                let data = activeFlow[flowId];
                delete activeFlow[flowId];//delete old FlowId and data
                activeFlow[keyPair['flowId']] = data;
                activeFlow[keyPair['flowId']]['flowId'] = keyPair['flowId'];
                updatedPair.push('flowId changed from ' + flowId + " to " + keyPair['flowId']);
                flowId = keyPair['flowId']

            }
            for (key in keyPair) {
                if (key != 'flowId') {
                    updatedPair.push(key + ' changed from ' + activeFlow[flowId][key] + " to " + keyPair[key]);
                    activeFlow[flowId][key] = keyPair[key];

                }
            }
            resolve({ success: "true", updatedPair, message: "updated in cache.." })
        } else {
            //later fetch from file
            testUtils.readTestFile(filename)
                .then((data) => {
                    data = JSON.parse(data);
                    if (data.testData && data.testData.flows) {
                        activeFlow[flowId] = data.testData.flows[flowId];
                        updateKeyPairById(flowId, keyPair)
                            .then((resp) => {
                                resp.message = "Reading from file and saved in cache. " + resp.message;
                                resolve(resp)
                            }).catch((err) => {
                                reject(err);
                            })
                    } else {
                        reject({ success: false, message: "unstructured testData in file" })
                    }
                }).catch((err) => {
                    reject({ success: false, err, message: "Error in readTestFile in updateKeyPairById" })
                })

        }
    })
}
function deleteFlowById(flowId) {
    return new Promise((resolve, reject) => {
        if (activeFlow[flowId]) {
            delete activeFlow[flowId];
            resolve({ success: true, message: "removed from activeFlow.." });
        } else {
            testUtils.readTestFile(filename)
                .then((data) => {
                    data = JSON.parse(data)
                    if (data.testData && data.testData.flows) {
                        delete data.testData.flows[flowId]
                        testUtils.writeTestFile(filename, JSON.stringify(data, null, '\t'))
                            .then((resp) => {
                                resolve({ success: true, message: "removed from file...", resp })
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
            resolve({ success: true, flow, message: "viewing from activeFlow" })
        } else {
            testUtils.readTestFile(filename)
                .then((data) => {
                    data = JSON.parse(data);
                    if (data.testData && data.testData.flows) {
                        flow = data.testData.flows[flowId]
                    } else {
                        flow = {}
                    }
                    resolve({ success: true, flow, message: "viewing from file" })
                }).catch((err) => {
                    reject({ success: false, err, message: "Error in viewFlowById" });
                })
        }
    })
}
function viewAllFlowId() {
    return new Promise((resolve, reject) => {
        testUtils.readTestFile(filename)
            .then((data) => {
                let flowIds1 = [], flowIds2 = []
                data = JSON.parse(data)
                if (data.testData && data.testData.flows) {
                    flowIds1 = Object.keys(data.testData.flows);
                }
                flowIds2 = Object.keys(activeFlow);
                resolve({ success: true, flowIds: flowIds1.concat(flowIds2), message: "viewing from file and activeFlow" })
            }).catch((err) => {
                reject({ success: false, err, message: "Error in readingTestFile in viewAllFlowId" })
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
    viewAllFlowId
}