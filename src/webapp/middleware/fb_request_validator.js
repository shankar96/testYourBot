var log = require('../../utils/logger')
var Promise = require('bluebird');
var cacheDataHelper = {
	getAppSecretByAppId(appId) {
		return new Promise((resolve, reject) => {
			if (appId == "216838955439477") {
				resolve("b874082acc240dc3d117565c3dd20c1a")
			} else {
				resolve('mySecretKey')//fetch from dbHelper or need to set in config
			}
		})
	}
}
var fbHelper = require('../../channel_helpers/fb_helper')
function verifyFbWebhookSignature(req, res, next) {
	res.send("OK");
	log.info('Respond back with 200 status and START of verifyFbWebhookSignature',req.body,req.url);
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
		cacheDataHelper.getAppSecretByAppId(appId).then(function (appSecret) {
			return fbHelper.verifyRequestSignature(xHubSignature, appSecret, postData);
		}).then(function (data) {
			log.info('after validating signature', data);
			next();
		}).catch(function (err) {
			log.error({
				err: err
			}, 'Error in validatingFbWebhookSignature', err);
			next();
		});
	}

}

module.exports = verifyFbWebhookSignature