// Constants used throughout the app

module.exports = Object.freeze({

	// ofxRemoteUI constants
	RUI_BROADCAST_PORT: 25748,
	RUI_NEIGHBOR_DEATH_TIME: 2, // Seconds
	RUI_PACKET_CONNECT: "/HELO",
	RUI_PACKET_DISCONNECT: "/CIAO",
	RUI_PACKET_KEEP_ALIVE: "/TEST",
	RUI_PACKET_REQUEST_PARAMS: "/REQU",
	RUI_PACKET_SEND: "/SEND",
	RUI_PACKET_PRESET: "/PREL",
	RUI_PACKET_PRESET_SET: "/SETP",
	RUI_PACKET_GROUP_PRESET_SET: "/SETp",
	RUI_STATUS_OK: "OK",
	RUI_NO_PRESETS: "NO_PRESETS",
	RUI_ARG_FLOAT: "FLT",
	RUI_ARG_INTEGER: "INT",
	RUI_ARG_BOOLEAN: "BOL",
	RUI_ARG_STRING: "STR",
	RUI_ARG_ENUM: "ENU",
	RUI_ARG_COLOR: "COL",
	RUI_ARG_SPACER: "SPA",

	// remote-ui-electron constants
	CLIENT_COMMANDS_FOLDER: "commands",

	// osc.js constants
	OSC_PORT_READY: "ready",
	OSC_PORT_MESSAGE: "message",

	// Misc constants
	LOCAL_IP_ADDRESS: "0.0.0.0",

	// Electron constants
	ELECTRON_QUIT_CHANNEL: "quit"

})