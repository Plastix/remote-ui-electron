const constants = require("../constants.js"),
	util = require('../util.js'),
		Dialogs = require('dialogs')

const dialog = Dialogs()
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
			const div = setup[type](client, name, type, args)
			div.id = name
				// For a spacer argument append the spacer directly to the paramList div
			if (type == constants.RUI_ARG_SPACER) {
				paramList.appendChild(div)
			} else { // For actual params, nest inside of the spacer div
				const group = args[args.length - 1].split(" ").join("_") // Param group is always last arg
				const spacer = document.getElementById(group)

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
	const div = document.createElement("div")
	div.className += "paramGroup"
	div.innerHTML = args[0]
	div.style.background = util.rgba(args[1], args[2], args[3], args[4])

	const presetToolbar = document.createElement("div")
	presetToolbar.className += "groupPresetToolbar"
	const select = document.createElement("select")
	select.className += "groupPresetSelect"

	const addPreset = document.createElement("button")
	addPreset.innerHTML = "+"
	addPreset.type = "button"

	addPreset.onclick = () => {
		dialog.prompt("Enter your preset name", (name) => {
			if (name !== undefined && name != "") {
				const groupName = div.id.split("_").join(" ")
				client.send(constants.RUI_PACKET_GROUP_PRESET_SAVE, [name, groupName])
			}
		})
	}

	const removePreset = document.createElement("button")
	removePreset.type = "button"
	removePreset.innerHTML = "-"

	removePreset.onclick = () => {
		if (select.value != "") {
			const split = select.value.split("/", 2)
			const groupName = split[0]
			const presetName = split[1]
			client.send(constants.RUI_PACKET_GROUP_PRESET_DELETE, [presetName, groupName])
			// Reset specific group preset
		}
	}

	presetToolbar.appendChild(select)
	presetToolbar.appendChild(addPreset)
	presetToolbar.appendChild(removePreset)
	div.appendChild(presetToolbar)
	return div
}

function addNumber(client, name, type, args) {
	const CURRENT = util.roundFloat(args[0])

	const div = document.createElement("div")
	div.innerHTML = name
	div.className += "paramItem"

	const display = document.createElement("input")
	display.type = "number"
	display.className += "display"
	display.value = CURRENT
	display.defaultValue = CURRENT
	display.min = args[1]
	display.max = args[2]
	div.appendChild(display)

	display.oninput = () => {
		const value = parseFloat(display.value)
		args[0] = value
		const message = `${constants.RUI_PACKET_SEND} ${type} ${name}`
		client.send(message, args)
		paramChanged(name)
	}

	const slider = document.createElement("input")
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
		display.value = value
		paramChanged(name)
	}

	div.appendChild(slider)
	return div
}

function updateNumber(div, args) {
	const slider = div.getElementsByTagName("input")[0]
	const display = div.getElementsByClassName("display")[0]

	const CURRENT = util.roundFloat(args[0])
	slider.value = CURRENT
	display.value = CURRENT
}

function addBoolean(client, name, type, args) {
	const div = document.createElement("div")
	div.innerHTML = name
	div.className += "paramItem"

	const checkbox = document.createElement("input")
	checkbox.type = 'checkbox'
	checkbox.checked = args[0]

	checkbox.onchange = () => {
		args[0] = checkbox.checked ? 1 : 0 // RemoteUI wants an int param
		const message = `${constants.RUI_PACKET_SEND} ${type} ${name}`
		client.send(message, args)
		paramChanged(name)

	}

	div.appendChild(checkbox)
	return div
}


function updateBoolean(div, args) {
	const checkbox = div.getElementsByTagName("input")[0]

	checkbox.checked = args[0]
}

function addString(client, name, type, args) {
	const div = document.createElement("div")
	div.innerHTML = name
	div.className += "paramItem"

	const textbox = document.createElement("input")
	textbox.type = 'text'
	textbox.value = args[0]

	textbox.oninput = () => {
		args[0] = textbox.value
		const message = `${constants.RUI_PACKET_SEND} ${type} ${name}`
		client.send(message, args)
		paramChanged(name)

	}

	div.appendChild(textbox)
	return div
}

function updateString(div, args) {
	const textbox = div.getElementsByTagName("input")[0]

	textbox.value = args[0]
}

function addEnum(client, name, type, args) {
	const div = document.createElement("div")
	div.innerHTML = name
	div.className += "paramItem"

	const selected = args[0] + 3
	const num = args[2]
	const select = document.createElement("select")
	for (var i = 3; i <= 3 + num; i++) {
		const val = args[i]
		const option = document.createElement("option")
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
		paramChanged(name)

	}

	div.appendChild(select)
	return div
}

function updateEnum(div, args) {
	const selected = args[0]

	const options = document.getElementsByTagName("option")

	for (var i = 0; i < options.length; i++) {
		options[i].removeAttribute("selected")
	}

	options[selected].setAttribute("selected", "")
}

function addColor(client, name, type, args) {
	const div = document.createElement("div")
	div.innerHTML = name
	div.className += "paramItem"

	// HTML 5 color picker only works in Chrome + Opera!
	// Luckoly Electron runs on Chromium!
	const color = document.createElement("input")
	color.type = "color"
	color.value = util.rgbToHex(args[0], args[1], args[2])

	color.onchange = () => {
		rgb = util.hexToRgb(color.value)
		args[0] = rgb.r
		args[1] = rgb.g
		args[2] = rgb.b
		const message = `${constants.RUI_PACKET_SEND} ${type} ${name}`
		client.send(message, args)
		paramChanged(name)
	}

	div.appendChild(color)
	return div
}

function updateColor(div, args) {
	const color = div.getElementsByTagName("input")[0]

	color.value = util.rgbToHex(args[0], args[1], args[2])
}

// Called when any param is changed
function paramChanged(name) {

	// Remove global preset when any param is changed
	const globalPresets = document.getElementById("globalPresets")
	globalPresets.selectedIndex = 0

	// Remove group preset
	if (name !== undefined) {
		const paramGroup = document.getElementById(name).parentElement
		const groupPresets = paramGroup.getElementsByClassName("groupPresetSelect")[0]
		groupPresets.selectedIndex = 0
	}

}