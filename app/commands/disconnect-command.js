const constants = require("../constants.js")

var exports = module.exports = {}

exports.trigger = constants.RUI_PACKET_DISCONNECT

exports.execute = function(client) {
	client.disconnect()
}