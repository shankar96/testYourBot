'use strict'
var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var log = require('../utils/logger')
const cluster = require('cluster');
if (cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for (var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    }); 
} else {
    // console.log(process.env)
    var REST_PORT = (process.env.PORT || 5000)
    app.listen(REST_PORT, function () {
        log.info("server started on ", REST_PORT);
    })
    
    // app.use(bodyParser.json()) lo
    var appRouters = require('./app_router');
    appRouters(app);
}