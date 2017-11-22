const path = require('path')
const webController = require('../app_controllers/web_controller')
const express = require('express');
const webRouter = express.Router();
webRouter.get('/web',webController.angular);
webRouter.get('/home',webController.home)
module.exports = webRouter;