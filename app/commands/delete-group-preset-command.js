const constants = require("../constants.js")

var exports = module.exports = {}

exports.trigger = constants.RUI_PACKET_GROUP_PRESET_DELETE

exports.execute = function(client, message, args) {

	// Server told us the preset was removed
	// Sync all presets from the server
	client.send(constants.RUI_PACKET_PRESET)
}