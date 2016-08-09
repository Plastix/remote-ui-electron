// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const client = require('./client.js'),
	electron = require('electron'),
	constants = require('./constants.js'),
	fuzzysearch = require("fuzzysearch"),
	Dialogs = require('dialogs')

client.listenForServers()

const dialogs = Dialogs()
const button = document.getElementById("connectButton")
const select = document.getElementById("servers")

button.onclick = () => {
	const raw = select.value
	if (raw !== "") {
		if (!client.isConnected()) {
			const value = raw.split(":")
			client.connect(value[0], parseInt(value[1]))
		} else {
			client.disconnect()
		}
	}
}

select.onchange = () => {
	const raw = select.value

	if (raw !== "") {
		const value = raw.split(":")
		client.reconnect(value[0], parseInt(value[1]))
	}
}

const filter = document.getElementById("filterParams")

filter.oninput = () => {
	const input = filter.value
	const isEmpty = input == ""
	const params = document.getElementsByClassName('paramItem')
	for (var i = params.length - 1; i >= 0; i--) {
		const param = params[i]
		if (!isEmpty && !fuzzysearch(input.toLowerCase(), param.id.toLowerCase())) {
			param.style.opacity = 0.1
		} else {
			param.style.opacity = 1
		}
	}
}

const sync = document.getElementById("syncButton")
sync.onclick = () => {
	if (client.isConnected()) {
		client.sync()
	}
}

const addPreset = document.getElementById("addGlobalPreset")
console.log(addPreset)
addPreset.onclick = () => {
	if (client.isConnected()) {
		dialogs.prompt("Enter your preset name", (name) => {
			if (name !== undefined && name != "") {
				client.send(constants.RUI_PACKET_PRESET_SAVE, [name])
			}
		})
	}
}

const globalPresets = document.getElementById("globalPresets")
const removePreset = document.getElementById("removeGlobalPreset")
removePreset.onclick = () => {
	if (client.isConnected()) {
		const selectedPreset = globalPresets.value
		console.log(selectedPreset)
		if(selectedPreset != ""){
			client.send(constants.RUI_PACKET_PRESET_DELETE, [selectedPreset])
			client.deselectGlobalPresets()
		}
	}
}