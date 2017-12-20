const path = require('path')
const webController = require('../app_controllers/web_controller')
const express = require('express');
const webRouter = express.Router();
webRouter.get('/web',webController.web);
webRouter.get('/home',webController.home);
webRouter.get('/activeFlowInfo',webController.activeFlowInfo);
webRouter.get('/docs',webController.docs)
module.exports = webRouter;