const constants = require("../constants.js")

var exports = module.exports = {}

exports.trigger = constants.RUI_PACKET_PRESET_SET

exports.execute = function(client, message, args) {

	// Client said the global preset was set
	// Sync new params
	client.sync()
}