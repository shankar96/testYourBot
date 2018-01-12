'use strict'
var fbRouter = require('./routers/fb_router');
module.exports= function(app){
    app.use('/webhook/fb',fbRouter)
    app.all(function(req,res){
        res.status(404).json({"resource":"not available"})
    })
}
