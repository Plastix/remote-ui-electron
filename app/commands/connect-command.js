const constants = require("../constants.js")

var exports = module.exports = {}

exports.trigger = constants.RUI_PACKET_CONNECT

exports.execute = function(client, message, args) {

	// Once we get HELLO from the server request params from the server
	client.send(constants.RUI_PACKET_REQUEST_PARAMS)
}