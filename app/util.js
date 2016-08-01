var exports = module.exports = {}

// From http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
exports.getIPV4 = function() {

	const interfaces = require('os').networkInterfaces();
	for (var devName in interfaces) {
		var iface = interfaces[devName]

		for (var i = 0; i < iface.length; i++) {
			var alias = iface[i]
			if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
				return alias.address
		}
	}

	return '0.0.0.0'
}

// Converts rgb format into CSS rgb format
exports.rgb = function(r, g, b) {
	return `rgb(${r}, ${g}, ${b})`
}