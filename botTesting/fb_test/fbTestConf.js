var path = require('path')
var fbTestDataFile = path.join(__dirname.replace('/fb_test', ''), 'test_data/fbTestData.json');
function getFbTestDataFile(){
    return fbTestDataFile;
}

module.exports={
    getFbTestDataFile
}