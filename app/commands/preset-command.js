const constants = require("../constants.js")

var exports = module.exports = {}

exports.trigger = constants.RUI_PACKET_PRESET


const NULL_LABEL = "---"

exports.execute = function(client, message, args) {

	client.clearGlobalPresets()
	client.clearGroupPresets()

	addNullGlobalPreset()
	addNullGroupPresets()

	if (args.length == 1 && args[0] == constants.RUI_NO_PRESETS) {
		// Server has no presets for us
	} else {
		for (var i = args.length - 1; i >= 0; i--) {
			const preset = args[i]

			// Uber hack. THis isn't always the case since the user can
			// add / to preset names
			if (preset.indexOf("/") == -1) {
				addGlobalPreset(client, preset)

			} else {
				addGroupPreset(client, preset)

			}
		}
	}

	updateGlobalPresetPosition()
	updateGroupPresetPositions()
}


function addGroupPreset(client, preset) {
	const split = preset.split("/", 2)
	const groupName = split[0]
	const groupId = groupName.split(" ").join("_")
	const presetName = split[1]

	const select = document.getElementById(groupId).getElementsByClassName('groupPresetSelect')[0]
	const option = document.createElement("option")
	option.value = preset
	option.innerHTML = presetName

	select.onchange = () => {
		const value = select.value
		if (value != "") {
			client.send(constants.RUI_PACKET_GROUP_PRESET_SET, [presetName, groupName])
		}
		select.index = select.selectedIndex
		client.deselectGlobalPresets()
	}

	select.appendChild(option)
}

function addGlobalPreset(client, preset) {
	const select = document.getElementById("globalPresets")

	const option = document.createElement("option")
	option.value = preset
	option.innerHTML = preset


	select.onchange = () => {
		const value = select.value
		if (value != "") {
			client.send(constants.RUI_PACKET_PRESET_SET, [value])
		}
		select.index = select.selectedIndex
	}

	select.appendChild(option)
}

function addNullGlobalPreset() {
	const presets = document.getElementById("globalPresets")
	const option = document.createElement("option")
	option.value = ""
	option.innerHTML = NULL_LABEL
	presets.appendChild(option)
}

function addNullGroupPresets() {
	const dropdowns = document.getElementsByClassName('groupPresetSelect')
	for (var i = dropdowns.length - 1; i >= 0; i--) {
		const select = dropdowns[i]
		const nullOption = document.createElement("option")
		nullOption.value = ""
		nullOption.innerHTML = NULL_LABEL
		select.appendChild(nullOption)
	}
}

function updateGlobalPresetPosition() {
	const select = document.getElementById("globalPresets")
	select.selectedIndex = select.index
}

function updateGroupPresetPositions() {
	const dropdowns = document.getElementsByClassName('groupPresetSelect')
	for (var i = dropdowns.length - 1; i >= 0; i--) {
		const select = dropdowns[i]
		select.selectedIndex = select.index
	}
}