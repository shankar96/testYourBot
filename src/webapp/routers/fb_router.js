'use strict'
var express = require('express')
var fbController = require('../controllers/fb_controller')
var bodyParser = require('body-parser')
function callVerifier(req, res, buf) {
    req.rawBody = buf;
    console.log("buffer",buf)
}

var fbRouter = express.Router();
fbRouter.get('/home',fbController.home)
fbRouter.post('/:appId',[bodyParser.json({
		verify: callVerifier
	})],fbController.fbPost)
fbRouter.get('/:appId',fbController.fbGet)
module.exports = fbRouter