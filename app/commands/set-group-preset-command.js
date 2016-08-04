const constants = require("../constants.js")

var exports = module.exports = {}

exports.trigger = constants.RUI_PACKET_GROUP_PRESET_SET

exports.execute = function(client, message, args) {

	// Server said the group preset was set
	// Sync new params
	client.sync()
}