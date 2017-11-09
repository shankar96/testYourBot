var express = require('express')
var fbController = require('../controllers/fb_controller')

var fbRouter = express.Router();
fbRouter.get('/home',fbController.home)
fbRouter.post('/webhook',fbController.fbPost)
fbRouter.get('/webhook',fbController.fbGet)
module.exports = fbRouter