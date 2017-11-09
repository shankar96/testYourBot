'use strict'
var appConf = require("../../conf/appconf")
var request = require("request")
var flows = {
    flow1: [
        {
            "query": "flow1 hi1"
        },
        {
            "query": " flow1 hi2"
        },
        {
            "query": " flow1 hi3"
        }
    ],
    flow2: [
        {
            "query": "flow2 hi1"
        },
        {
            "query": " flow2 hi2"
        },
        {
            "query": " flow2 hi3"
        }
    ]
}
let fbMessagePostFormat={
  "object": "page",
  "entry": [
    {
      "id": "1444391685773559",
      "time": 1510235946278,
      "messaging": [
        {
          "sender": {
            "id": "601540646690669"
          },
          "recipient": {
            "id": "1444391685773559"
          },
          "timestamp": 1510235945681,
          "message": {
            "mid": "mid.$cAAV7XphbTjxl0lkC0VfoRO6Qouym",
            "seq": 636419,
            "text": "cool",
            "nlp": {
              "entities": {
                "location": [
                  {
                    "suggested": true,
                    "confidence": 0.84847,
                    "value": "cool",
                    "type": "value"
                  }
                ]
              }
            }
          }
        }
      ]
    }
  ]
}
let options ={ url: appConf.webhookUrl,
 json: fbMessagePostFormat,
 }
request.post(options,function(err,resp,body){
    console.log("posted to webhookUrl",body);
})




