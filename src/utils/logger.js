module.exports = {
    info: function () {
        for (key in arguments) {
            // console.log(arguments[key])
        }
    },
    error: function () {
        for (key in arguments) {
            console.error(arguments[key])
        }
    }

}