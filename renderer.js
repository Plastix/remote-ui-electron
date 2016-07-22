// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var osc = require('osc');

const REMOTE_UI_BROADCAST_PORT = 25748
const LOCAL_IP_ADDRESS = "0.0.0.0"

const OSC_PORT_READY = "ready"
const OSC_PORT_MESSAGE = "message"


function startListeningForBroadcasts(callback) {
	console.log(`listening on port ${REMOTE_UI_BROADCAST_PORT} for remote ui broadcasts`)

	// Open a port to listen for Remote UI servers broadcasting their existence
	var broadcastPort = new osc.UDPPort({
		localAddress: LOCAL_IP_ADDRESS,
		localPort: REMOTE_UI_BROADCAST_PORT
	})

	broadcastPort.on(OSC_PORT_MESSAGE, (message, timeTag, info) => {
		const IP = info.address

		// message reponse as an "args" array with 4 pieces of data
		// args[0] = port num
		// args[1] = computer name
		// args[2] = binary (app) name
		// args[3] = broadcast count
		const PORT = message.args[0]


		// All we need is one broadcast packet so close the port
		broadcastPort.close()

		console.log(`found remote ui server ${IP}:${PORT}`)
		callback(IP, PORT)
	})

	// Open the port.
	broadcastPort.open()
}


function connectToRemoteUIServer(ip, port) {
	console.log("connecting to server")

	// Remote UI server talks to the client on its port + 1
	const LOACAL_PORT = port + 1

	var connection = new osc.UDPPort({
		localAddress: LOCAL_IP_ADDRESS,
		localPort: LOACAL_PORT,
		remoteAddress: ip,
		remotePort: port,
	})

	connection.on("message", (message, timeTag, info) => {
		console.log(message, " ", info)
	})

	connection.on("error", (error) => {
		console.log(error)
	})

	console.log("opening port")
	connection.open()

	// Wait for the port to be ready before sending to it
	connection.on(OSC_PORT_READY, () => {
		console.log("sending HELO")

		var message = {
			address: "/HELO"
		}

		connection.send(message)
	})

}

startListeningForBroadcasts(connectToRemoteUIServer)