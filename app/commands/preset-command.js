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
				addGlobalPreset(preset)

			} else {
				addGroupPreset(preset)

			}
		}
	}
}


function addGroupPreset(preset) {
	const split = preset.split("/", 2)
	const groupId = split[0].split(" ").join("_")
	const presetName = split[1]

	const select = document.getElementById(groupId).getElementsByClassName('groupPresetSelect')[0]
	const option = document.createElement("option")
	option.value = groupId
	option.innerHTML = presetName

	select.appendChild(option)
}

function addGlobalPreset(preset) {
	const presets = document.getElementById("globalPresets")

	const option = document.createElement("option")
	option.value = preset
	option.innerHTML = preset

	presets.appendChild(option)
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