const Promise = require('bluebird')
function asyncFunction(item, cb) {
    setTimeout(() => {
        console.log('done with', item);
        cb();
    }, 1000);
}
var flow = [1, 2, 3]
// flow.reduce((promiseChain, item) => {
//     return promiseChain.then(() => new Promise((resolve) => {
//         asyncFunction(item, resolve,"ok");
//     }));
// }, Promise.resolve('ok'))
// .then(() => console.log('done'))
