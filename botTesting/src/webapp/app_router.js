var webRouter = require('./app_routers/web_router');

module.exports = function(app){
    app.use('/',webRouter);
}