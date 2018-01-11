"use strict";
const log = require('../../utils/logger')
var showdown = require('showdown');
var converter = new showdown.Converter();
var fs = require('fs');
var path = require('path')
var conf = {

};

let readmeFile = path.resolve(__dirname).replace("src/webapp/app_controllers","README.md");
let reportFile = path.resolve(__dirname).replace("webapp/app_controllers","test_data/report.json");
function extractOverView(data){
  let overview={}
  overview.reportCount = Object.keys(data).length;
  overview.flowsCount = 0;
  overview.testsCount = 0;
  overview.passedTests = 0;
  overview.failedTests = 0;
  overview.messagesCount = 0;
  overview.messageByReportId = {};
  overview.passedTestsByReportId = {};
  overview.failedTestsByReportId = {};
  for(let reportKey in data){
    overview.flowsCount = overview.flowsCount + Object.keys(data[reportKey].report).length;
    let messageCount = 0;
    let passedTests = 0;
    let failedTests = 0;
    for(let flowsKey in data[reportKey].report){
      messageCount += Object.keys(data[reportKey].report[flowsKey]).length;
      for(let messageKey in data[reportKey].report[flowsKey]){
        if(data[reportKey].report[flowsKey][messageKey].state == 'passed'){
          passedTests += 1;
        } else{
          failedTests += 1;
        }
      }
    }
    overview.messagesCount += messageCount -1; // 1 for processing file tests
    overview.messageByReportId[reportKey] = messageCount-1; // 1 for processing file tests
    overview.passedTestsByReportId[reportKey] = passedTests;
    overview.failedTestsByReportId[reportKey] = failedTests;
    overview.testsCount += messageCount;
    overview.passedTests += passedTests;
    overview.failedTests += failedTests;
  }
  overview.testsCount>0?
  overview.passedPercentage = overview.passedTests/overview.testsCount*100
    :overview.passedPercentage = 100;
  return overview;
}
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
    },
    report(req,res){
      fs.readFile(reportFile, 'utf-8', function(err, data) {
        if (err) {
          log.error("Error",err)
          res.render('report',{
            reportData:err,
            success:false
          })
        }else{
          try {
            data = JSON.parse(data);
            let overview = extractOverView(data);
            log.info("overview",overview);
            res.render('report', {
              reportData: data,
              overview,
              success: true
            })
          } catch (err){
            log.error("Error",err)
            res.render('report',{
              reportData:err,
              success:false
            })
          }
          // res.send(converter.makeHtml(data));
        }
      });
    },

}