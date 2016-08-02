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

exports.roundFloat = function(num){
	if(exports.isFloat(num)){
		return num.toFixed(2)
	}
	return num
}

exports.isFloat = function(n) {
   return n % 1 !== 0;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// From http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
exports.rgbaToHex = function(r, g, b, a) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b) + componentToHex(a)
}

exports.rgbToHex = function(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

exports.hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    console.log(result)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}