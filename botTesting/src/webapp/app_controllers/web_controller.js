"use strict";
const log = require('../../utils/logger')
var showdown = require('showdown');
var converter = new showdown.Converter();
var fs = require('fs');
var path = require('path')
var conf = {

};

let readmeFile = path.resolve(__dirname).replace("src/webapp/app_controllers","README.md");
module.exports = {
    home(req, res) {
        res.render('home', {
            "message": "Welcome to Bot Testing"
        })
    },
    web(req, res) {
        var generateTestData = require('../../fb_test/generateTestData').viewAllFlowId()
            .then((result) => {
                res.render('index', {
                    conf,
                    module: {

                    },
                    flowIds:result.flowIds
                })
            }).catch((err) => {
                console.log(err)
                res.render('index', {
                    conf,
                    module: {

                    },
                    flowIds:[]
                })
            })

    },
    activeFlowInfo(req, res) {
        let activeFlow = require('../../fb_test/generateTestData').activeFlow
        res.status(200).json({
            activeFlow
        })
    },
    docs(req,res){
      fs.readFile(readmeFile, 'utf-8', function(err, data) {
        if (err) {
          log.error("Error",err)
          res.render('docs',{
            readmeContent:err
          })
        }else{
          res.render('docs',{
            readmeContent:converter.makeHtml(data)
          })
          // res.send(converter.makeHtml(data));
        }
      });
    }

}