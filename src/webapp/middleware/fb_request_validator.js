var log = require('../../utils/logger')
var Promise = require('bluebird');
var cacheDataHelper={
    getAppSecretByAppId(appId){
        return Promise.resolve('mySecretKey')
    }
}
var fbHelper = require('../../channel_helpers/fb_helper')
function verifyFbWebhookSignature(req, res, next) {
  res.send("OK");
	log.info('Respond back with 200 status and START of verifyFbWebhookSignature');
	let xHubSignature = req.headers['x-hub-signature'];
	let appId;
	try {
		appId = req.params['appId'];
	} catch (err) {
		log.error({
			err: err,
			url: req.url
		}, 'Error while extracting appId');
	}
	if (xHubSignature && appId) {
		let postData = req.rawBody;
		cacheDataHelper.getAppSecretByAppId(appId).then(function(appSecret) {
			return fbHelper.verifyRequestSignature(xHubSignature, appSecret, postData);
		}).then(function(data) {
			log.info('after validating signature', data);
			next();
		}).catch(function(err) {
			log.error({
				err: err
			}, 'Error in validatingFbWebhookSignature', err);
		});
	}

}

module.exports = verifyFbWebhookSignature