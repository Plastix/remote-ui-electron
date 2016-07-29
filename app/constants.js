// Constants used throughout the app

module.exports = Object.freeze({

	// ofxRemoteUI constants
	RUI_BROADCAST_PORT: 25748,
	RUI_PACKET_CONNECT: "/HELO",
	RUI_PACKET_DISCONNECT: "/CIAO",
	RUI_PACKET_KEEP_ALIVE: "/TEST",
	RUI_PACKET_REQUEST_PARAMS: "/REQU",
	RUI_PACKET_SEND: "/SEND",
	RUI_STATUS_OK: "OK",

	// osc.js constants
	OSC_PORT_READY: "ready",
	OSC_PORT_MESSAGE: "message",

	// Misc constants
	LOCAL_IP_ADDRESS: "0.0.0.0",

	// Electron constants
	ELECTRON_QUIT_CHANNEL: "quit"

})