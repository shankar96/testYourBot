var fs = require('fs')
function readTestFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, function (err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data.toString());
            }
        })
    })
}
function writeTestFile(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, 'utf8', function (err, resp) {
            if (err) {
                reject(err)
            } else {
                console.log("arguments", arguments)
                resolve(resp)
            }
        })
    })
}

module.exports={
    readTestFile,
    writeTestFile
}