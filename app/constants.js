// Constants used throughout the app

module.exports = Object.freeze({
	// ofxRemoteUI constants
	REMOTE_UI_BROADCAST_PORT: 25748,

	REMOTE_UI_PACKET_CONNECT: "/HELO",
	LOCAL_IP_ADDRESS: "0.0.0.0",

	// osc.js constants
	OSC_PORT_READY: "ready",
	OSC_PORT_MESSAGE: "message",

	// Electron constants
	ELECTRON_QUIT_CHANNEL: "quit"

})