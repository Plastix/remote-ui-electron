const constants = require("../constants.js")

var exports = module.exports = {}

exports.trigger = constants.RUI_PACKET_REQUEST_PARAMS

exports.execute = function(client, message, args) {
	if(args[0] == constants.RUI_STATUS_OK){
		console.log("Got all params from server!")
	}

}