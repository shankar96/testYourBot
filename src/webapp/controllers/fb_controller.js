'use strict'
var fbHelper = require('../../channel_helpers/fb_helper')
var processMessage = require('../../message_processor/process_message').processMessage
function home(req, res, next) {
    res.status(200).json({
        message: "Hello world! -webhookHome"
    })
};

/*
 in fbGet--> { appId: '1696173620688563' } {} { 'hub.mode': 'subscribe',
  'hub.challenge': '1340446858',
  'hub.verify_token': '12345' }
  
 */
function fbGet(req, res) {
    console.log('in fbGet-->',req.params,req.body,req.query);
    if(req.query && req.query['hub.challenge']){
        res.send(req.query['hub.challenge'])
    }
        else{
            res.send(400)
        }
};
/**

{
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
 */ 
function fbPost(req, res) {
    console.log('in fbPost-->', req.params,req.body,req.query);
    try {
        var valueContexts = fbHelper.parseIncomingMessage(req);
        if (valueContexts && valueContexts.length > 0) {
            valueContexts.forEach((valueContext) => {
                processMessage(valueContext);
            });
        }
        return res.status(200).json({
            status: "ok"
        });
    } catch (err) {
        console.error({ err: err }, "error in handling request");
        return res.status(400).json({
            status: "error",
            error: err
        });
    }
};

module.exports = {
    home,
    fbGet,
    fbPost
}