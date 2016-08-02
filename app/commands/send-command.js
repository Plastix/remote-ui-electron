const constants = require("../constants.js"),
	util = require('../util.js')

var exports = module.exports = {}
exports.trigger = constants.RUI_PACKET_SEND

const setup = {}
setup[constants.RUI_ARG_SPACER] = addSpacer
setup[constants.RUI_ARG_FLOAT] = addNumber
setup[constants.RUI_ARG_INTEGER] = addNumber
setup[constants.RUI_ARG_BOOLEAN] = addBoolean
setup[constants.RUI_ARG_STRING] = addString
setup[constants.RUI_ARG_ENUM] = addEnum
setup[constants.RUI_ARG_COLOR] = addColor


const update = {}
update[constants.RUI_ARG_FLOAT] = updateNumber
update[constants.RUI_ARG_INTEGER] = updateNumber
update[constants.RUI_ARG_BOOLEAN] = updateBoolean
update[constants.RUI_ARG_STRING] = updateString
update[constants.RUI_ARG_ENUM] = updateEnum
update[constants.RUI_ARG_COLOR] = updateColor

const paramList = document.getElementById("paramList");

exports.execute = function(client, message, args) {

	const type = message[1]

	// Message argument is split by spaces
	// Names may have spaces in them so we replace with _
	const name = message.slice(2).join("_")
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
			// For a spacer argument append the spacer directly to the paramList div
			if (type == constants.RUI_ARG_SPACER) {
				paramList.appendChild(div)
			} else { // For actual params, nest inside of the spacer div
				const group = args[args.length - 1].split(" ").join("_") // Param group is always last arg
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
	div.innerHTML = args[0]
	div.style.background = util.rgba(args[1], args[2], args[3], args[4])
	return div
}

function addNumber(client, name, type, args) {
	const CURRENT = util.roundFloat(args[0])

	var div = document.createElement("div")
	div.innerHTML = name
	div.className += "paramItem"
	var display = document.createElement("span")
	display.className += "display"
	display.innerHTML = CURRENT
	div.appendChild(display)

	var slider = document.createElement("input")
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
	slider.oninput = () => {
		// Replace the first value of args with the current value of the slider
		const value = parseFloat(slider.value)
		args[0] = value
		const message = `${constants.RUI_PACKET_SEND} ${type} ${name}`
		client.send(message, args)
		display.innerHTML = value
	}

	div.appendChild(slider)
	return div
}

function updateNumber(div, args) {
	var slider = div.getElementsByTagName("input")[0]
	var display = div.getElementsByClassName("display")[0]

	const CURRENT = util.roundFloat(args[0])
	slider.value = CURRENT
	display.innerHTML = CURRENT
}

function addBoolean(client, name, type, args) {
	var div = document.createElement("div")
	div.innerHTML = name
	div.className += "paramItem"

	var checkbox = document.createElement("input")
	checkbox.type = 'checkbox'
	checkbox.checked = args[0]

	checkbox.onchange = () => {
		args[0] = checkbox.checked ? 1 : 0 // RemoteUI wants an int param
		const message = `${constants.RUI_PACKET_SEND} ${type} ${name}`
		client.send(message, args)
	}

	div.appendChild(checkbox)
	return div
}


function updateBoolean(div, args) {
	var checkbox = div.getElementsByTagName("input")[0]

	checkbox.checked = args[0]
}

function addString(client, name, type, args) {
	var div = document.createElement("div")
	div.innerHTML = name
	div.className += "paramItem"

	var textbox = document.createElement("input")
	textbox.type = 'text'
	textbox.value = args[0]

	textbox.oninput = () => {
		args[0] = textbox.value
		const message = `${constants.RUI_PACKET_SEND} ${type} ${name}`
		client.send(message, args)
	}

	div.appendChild(textbox)
	return div
}

function updateString(div, args) {
	var textbox = div.getElementsByTagName("input")[0]

	textbox.value = args[0]
}

function addEnum(client, name, type, args) {
	var div = document.createElement("div")
	div.innerHTML = name
	div.className += "paramItem"

	const selected = args[0] + 3
	const num = args[2]
	var select = document.createElement("select")
	for (var i = 3; i <= 3 + num; i++) {
		const val = args[i]
		var option = document.createElement("option")
		option.value = i - 3
		option.innerHTML = val
		if (i == selected) {
			option.setAttribute("selected", "")
		}
		select.appendChild(option)
	}

	select.onchange = () => {
		args[0] = parseInt(select.value)
		const message = `${constants.RUI_PACKET_SEND} ${type} ${name}`
		client.send(message, args)
	}

	div.appendChild(select)
	return div
}

function updateEnum(div, args) {
	const selected = args[0]

	var options = document.getElementsByTagName("option")

	for (var i = 0; i < options.length; i++) {
		options[i].removeAttribute("selected")
	}

	options[selected].setAttribute("selected", "")
}

function addColor(client, name, type, args) {
	var div = document.createElement("div")
	div.innerHTML = name
	div.className += "paramItem"

	// HTML 5 color picker only works in Chrome + Opera!
	// Luckoly Electron runs on Chromium!
	var color = document.createElement("input")
	color.type = "color"
	color.value = util.rgbToHex(args[0], args[1], args[2])

	color.onchange = () => {
		rgb = util.hexToRgb(color.value)
		args[0] = rgb.r
		args[1] = rgb.g
		args[2] = rgb.b
		const message = `${constants.RUI_PACKET_SEND} ${type} ${name}`
		client.send(message, args)
	}

	div.appendChild(color)
	return div
}

function updateColor(div, args) {
	var color = div.getElementsByTagName("input")[0]

	color.value = util.rgbToHex(args[0], args[1], args[2])
}