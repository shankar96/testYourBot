var conf ={

}
module.exports = {
    home(req, res) {
        res.render('home', {
            "message": "Welcome to Bot Testing"
        })
    },
    angular(req,res) {
        res.render('index',{
            conf,
            module:{
                
            }
        })
    }

}