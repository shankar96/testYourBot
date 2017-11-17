'use strict'
var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var log = require('../utils/logger')

var REST_PORT = (process.env.PORT||5000)
app.listen(REST_PORT,function(){
    log.info("server started on ",REST_PORT);
})
app.use(bodyParser.json())
var appRouters = require('./app_router');
appRouters(app);