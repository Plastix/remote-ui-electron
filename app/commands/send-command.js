const constants = require("../constants.js"),
	util = require('../util.js')

var exports = module.exports = {}
exports.trigger = constants.RUI_PACKET_SEND

const setup = {}
setup[constants.RUI_ARG_SPACER] = addSpacer
setup[constants.RUI_ARG_FLOAT] = addNumber
setup[constants.RUI_ARG_INTEGER] = addNumber

const update = {}
update[constants.RUI_ARG_FLOAT] = updateNumber
update[constants.RUI_ARG_INTEGER] = updateNumber


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
		if (type in update) {
			update[type](item, args)
		}
	}

	function addItem() {
		if (type in setup) {
			var div = setup[type](client, name, type, args)
			div.id = name
			div.className += "paramItem"


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
	div.className += "paramGroup"
	div.innerHTML = name
		// div.style.color = util.rgb(args[1], args[2], args[3])
	return div
}

function addNumber(client, name, type, args) {
	const CURRENT = util.roundFloat(args[0])

	var div = document.createElement("div")
	div.innerHTML = name
	var display = document.createElement("div")
	display.className += "display"
	display.innerHTML = CURRENT
	div.appendChild(display)

	var slider = document.createElement("INPUT")
	slider.className += "slider"
	slider.type = "range"
	slider.value = CURRENT
	slider.defaultValue = CURRENT
	slider.min = args[1]
	slider.max = args[2]

	if (type == constants.RUI_ARG_FLOAT) {
		slider.step = 0.01
	} else {
		slider.step = 1
	}

	// Input range changed callback
	slider.oninput = function() {
		// Replace the first value of args with the current value of the slider
		const value = parseFloat(slider.value);
		args[0] = value
		const message = `${constants.RUI_PACKET_SEND} ${type} ${name}`
		client.send(message, args)
		display.innerHTML = value
	}

	div.appendChild(slider)
	return div
}

function updateNumber(div, args) {
	var slider = div.getElementsByClassName("slider")[0]
	var display = div.getElementsByClassName("display")[0]

	const CURRENT = util.roundFloat(args[0])
	slider.value = CURRENT
	display.innerHTML = CURRENT
}