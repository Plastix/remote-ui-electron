const constants = require("../constants.js")

var exports = module.exports = {}

exports.trigger = constants.RUI_PACKET_DISCONNECT

exports.execute = function(client, message, args) {

	// If the server is shutting down, disconnect the client
	client.disconnect()
}