'use strict'
var express = require('express')
var fbController = require('../controllers/fb_controller')

var fbRouter = express.Router();
fbRouter.get('/home',fbController.home)
fbRouter.post('/:appId',fbController.fbPost)
fbRouter.get('/:appId',fbController.fbGet)
module.exports = fbRouter