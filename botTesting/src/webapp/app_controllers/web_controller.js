var conf = {

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
    }

}