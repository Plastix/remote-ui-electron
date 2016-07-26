// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var client = require('./client.js'),
	electron = require('electron')
const constants = require('./constants.js')

client.run()

// Disconnect the client once the app is closed
electron.ipcRenderer.on(constants.ELECTRON_QUIT_CHANNEL, (event, message) => {
	client.disconnect()
})