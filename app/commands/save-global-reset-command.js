const constants = require("../constants.js")

var exports = module.exports = {}

exports.trigger = constants.RUI_PACKET_PRESET_SAVE

exports.execute = function(client, message, args) {

	// Server told us the preset was saved
	// Sync all presets from the server
	client.send(constants.RUI_PACKET_PRESET)
}