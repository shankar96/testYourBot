# Bot Testing Framework

Using this frame work we can be able to generate test flows using web UI or Command Line Interface
and we can be able to test these flow using flowId.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

The things you need to install the software and how to install them

Node Modules used in this project
* nock :
    for mocking facebook server
* bluebird :
    for Promise
* body-parser :
    for request parsing
* bunyan :
    for logging appLogging and test Logging
* chai :
    assertion library for node
* ejs :
    simple templating language that lets you generate HTML markup with plain JavaScript.
* express :
    minimal and flexible Node.js web application framework that provides a robust set of features to develop web and mobile applications.
* mocha :
    test framework
* request : to make http request
* showdown : to generate HTML from markdown(README.md)
* socket.io : to enable real-time bidirectional event-based communication.


Flow of Diagram of Bot testing

<img src="/images/flow.png" style="max-width: 100%;border-style: groove;" />


### Installing

copy this module in root folder of your project.

lets assume your project folder is __$myProject__ i will be refferring it later

you can configure following files according to your project

---
` 1. configuring testConf `

__$myProject/botTesting/conf/testConf.js__
* the following required Params you can configure in testConf.js
    * **fbUrl** = "https://graph.facebook.com";     _# base url of facebook_
    * **fbMessageEndPoint** = "/v2.6/me/messages";  _# end point where your app is sending messages to facebook_
    * **appBaseUrl** = "http://127.0.0.1:5000";     _# your appServer baseUrl_
    * **webhookUrl** = "http://127.0.0.1:5000/webhook/fb/:appId";   _# your webhookUrl of botProject_
    * **fbTestDataFile** = "";      _# we will be setting it at runtime to_ __$myProject/botTesting/src/test_data/fbTestData.json__
    * **fbSecretKeyByAppId** = {"appId":"Token"};   _# if you are verifying request from facebook in your botProject add appId and secret token here_


---
` 2. Entry point for starting web test Server (where you can generate and test flows) `

__$myProject/botTesting/src/test.js__
* you can set node environment variable accordingly here
which may be needed for your botProject (appServer) like configuration file path and logs
Say what the step will be

---

` 3. you can edit what to test in responses from bot `

__$myProject/botTesting/src/fb_test/fbTest.js__
* you can edit testResponse function
```
function testResponse(botResponse, savedResponse) {
    // all tests
}
```



` 4. Starting testWebServer `
* got to botTesting directory and run below command

   $myProject/botTesting$ __LOG_TO_FILE=true npm run webTest__
   
   make sure you are not using proxy in terminal
   
   to check proxy run __echo $https_proxy $https_proxy__
    
   if you got something remove proxy by running __export https_proxy=__ and __export https_proxy=__


---



## Generation Of testData and testing of testData from web UI
start the testServer as explained above and head to
http://127.0.0.1:8888/web

The web UI
<img src="/images/web1.png" style="max-width: 100%;border-style: groove;" />

The above page showing welcome messages and some buttons in left side
* __Reset/Refresh__ : used to reset the active flow / reload the webpage.
* __Delete__ : used to delete an active flow.
* __Test Flow__ : used to test active flow.
* __Create New Flow__ : it is used to create a flow and save the flow as testData.
* __flowIds List__ : it display all list of flow available in testData.
    * clicking which we can able to modify flowInfo and test the flow
    * we can see if flow is saved in testData or not by icon
    * 📁 : this icon shows flow is already saved in testData
    * ✍️ : this icon shows flow is not saved in testData
        * to save it click on __edit Details__ then __update Details__ then __save Active Flow__
        * to delete it click on __Delete__

### creating a new flow

In order to create new flow by clicking on __Create New Flow__ button as shown below

<img src="/images/web2.png" style="max-width: 100%;border-style: groove;" />

fill the required information to create a flowDetails

__appId__, __senderId__ and __pageId__ are required fields

__flowId__ and flowDetails are optional fields

once done with it click on __Create Flow Details__

you will get a chatwindow as shown below where you can send messages to generate test Data

<img src="/images/web3.png" style="max-width: 100%;border-style: groove;" />

once you completed the chat you can save the testData by clicking __save Active Flow__

<img src="/images/web4.png" style="max-width: 100%;border-style: groove;" />


### viewing saved flow details and testing

Inorder to view a particular flow click on flowId in left side as shown below

<img src="/images/web5.png" style="max-width: 100%;border-style: groove;" />

Then to test this flow click on __Test Flow__

<img src="/images/web6.png" style="max-width: 100%;border-style: groove;" />

It will start testing flow showing the test status for each messages in flow as shown below

<img src="/images/web7.png" style="max-width: 100%;border-style: groove;" />

finally after ending of test it will shows the passed and faield test count as show below

<img src="/images/web8.png" style="max-width: 100%;border-style: groove;" />


### Response for Each Message tested

for each messages tested we will get following JSON
containing fields which is self explanatory.

```
{
  "title": "Testing Flow => <transactionDetails, message {3}>",
  "responseTime": 3074,
  "timedOut": false,
  "duration": 6,
  "state": "passed",
  "speed": "fast",
  "flowId": "transactionDetails",
  "messageId": "3",
  "info": {
    "function": "checkEachMessage",
    "clientMessageFormat": {
      "type": "text",
      "text": "thanks",
      "senderId": "1586711078087024",
      "pageId": "202153767012429",
      "appId": "216838955439477"
    },
    "timeoutSet": 30000,
    "timeoutSet_": "bot may respond late so at max timeout 30 second and we are also noting responsetime",
    "responseTime": 3074,
    "response": [
      {
        "recipient": {
          "id": "1586711078087024"
        },
        "message": {
          "text": "Anytime. That's what I'm here for."
        }
      }
    ],
    "savedResponse": [
      {
        "recipient": {
          "id": "1586711078087024"
        },
        "message": {
          "text": "Anytime. That's what I'm here for."
        }
      }
    ]
  }
}
```

## Deployment

follow installation steps

## Contributing

Contribute to make it more reliable and usefull for testing...

## Authors

* **Shankar Kumar Chaudhary**


