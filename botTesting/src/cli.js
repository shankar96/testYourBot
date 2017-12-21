/**
 * Created by shankarkumarc on 20/12/17.
 */
var io = require('socket.io-client')
var socket = io.connect('http://localhost:8888', {reconnect: true});
var Promise = require('bluebird');
var fbCli = require('./fb_test/fbCli')
if(process.env.TEST_CLI=='fb'){
  fbCli(socket);
}