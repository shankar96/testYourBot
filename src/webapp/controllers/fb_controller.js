var fbHelper = require('../../channel_helpers/fb_helper')
var processMessage = require('../../message_processor/process_message').processMessage
function home(req, res, next) {
    res.status(200).json({
        message: "Hello world! -webhookHome"
    })
};


function fbGet(req, res) {
    console.log('in fbGet-->');
    res.status(200).json({
        "status": "ok"
    })
};

function fbPost(req, res) {
    console.log('in fbPost-->', req.body);
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