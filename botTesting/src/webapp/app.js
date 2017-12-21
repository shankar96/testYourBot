'use strict'
var express = require('express');
var app = express();
var appRouter = require('./app_router');
var socketController = require('./app_controllers/socketController')
var path = require('path')
var log = require('../utils/logger')
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
var REST_PORT = (process.env.TEST_PORT || '8888')

appRouter(app);
app.use(express.static(path.join(__dirname, 'public')));

var server = app.listen(REST_PORT,function(){
    log.info("Server started at PORT",REST_PORT)
})
var io = require('socket.io')(server);
socketController(io);