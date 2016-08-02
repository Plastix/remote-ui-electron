const constants = require("../constants.js")

var exports = module.exports = {}

exports.trigger = constants.RUI_PACKET_DISCONNECT

exports.execute = function(client, message, args) {

	// Clear all current params
	var div = document.getElementById("paramList")
	div.innerHTML = ""

	client.disconnect()
}