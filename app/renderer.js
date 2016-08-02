// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var client = require('./client.js'),
	electron = require('electron')
const constants = require('./constants.js')

client.listenForServers()

var button = document.getElementById("connectButton")
var select = document.getElementById("servers")

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