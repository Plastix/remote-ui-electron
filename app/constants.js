// Constants used throughout the app

module.exports = Object.freeze({
	// ofxRemoteUI constants
	RUI_BROADCAST_PORT: 25748,
	RUI_PACKET_CONNECT: "/HELO",
	RUI_PACKET_REQUEST_PARAMS: "/REQU",

	LOCAL_IP_ADDRESS: "0.0.0.0",

	// osc.js constants
	OSC_PORT_READY: "ready",
	OSC_PORT_MESSAGE: "message",

	// Electron constants
	ELECTRON_QUIT_CHANNEL: "quit"

})