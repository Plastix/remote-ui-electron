const constants = require("../constants.js"),
	util = require('../util.js')

var exports = module.exports = {}
exports.trigger = constants.RUI_PACKET_SEND

const setup = {}
setup[constants.RUI_ARG_SPACER] = addSpacer
setup[constants.RUI_ARG_FLOAT] = addFloat
	// setup[constants.RUI_ARG_INTEGER] = addInteger


const paramList = document.getElementById("paramList");

exports.execute = function(client, message, args) {

	const type = message[1]
	const name = message[2]
	const item = document.getElementById(name)

	// Check to see if our param is in the DOM
	if (item === null) {
		addItem()
	} else {
		updateItem(item)
	}

	function updateItem() {
	}

	function addItem() {
		if (type in setup) {
			var div = setup[type](client, name, type, args)

			// For a spacer argument append the spacer directly to the paramList div
			if (type == constants.RUI_ARG_SPACER) {
				paramList.appendChild(div)
			} else { // For actual params, nest inside of the spacer div
				const group = args[args.length - 1] // Param group is always last arg
				let spacer = document.getElementById(group)

				// If we don't have a param group yet, create one
				// This is in the off chance that we get a param before an actual spacer
				// This is because UDP doesn't guarantee packet order
				if (spacer === null) {
					spacer = addSpacer(client, group, constants.RUI_ARG_SPACER, [])
					paramList.appendChild(spacer)
				}

				spacer.appendChild(div)
			}
		}
	}


}


function addSpacer(client, name, type, args) {
	var div = document.createElement("div")
	div.id = name
	div.className += "paramGroup"
	div.innerHTML = name

	// div.style.color = util.rgb(args[1], args[2], args[3])
	return div

}

function addFloat(client, name, type, args) {
	const MIN = args[1]
	const MAX = args[2]
	const CURRENT = args[0].toFixed(2)

	var div = document.createElement("div")
	div.id = name
	div.className += "paramItem"
	div.innerHTML = name

	var display = document.createElement("div")
	display.className +="display"
	display.innerHTML = CURRENT

	var slider = document.createElement("INPUT")
	slider.className += "slider"
	slider.type = "range"
	slider.value = CURRENT
	slider.min = MIN
	slider.max = MAX
	slider.step = 0.01

	// Input range changed callbacl
	slider.oninput = function() {
		// Replace the first value of args with the current value of the slider
		const value = parseFloat(this.value);
		args[0] = value
		const message = `${constants.RUI_PACKET_SEND} ${type} ${name}`
		client.send(message, args)
		display.innerHTML = value
	}


	div.appendChild(display)
	div.appendChild(slider)


	return div
}

function addInteger(client, name, type, args) {
	var div = document.createElement("div")

	div.id = name
	div.innerHTML = name

	return div
}

// Private functions