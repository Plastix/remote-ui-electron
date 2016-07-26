const osc = require('osc'),
	constants = require('./constants.js')

var client = (function() {

	var connection
	var connected = false

	// Public API
	return {
		run: () => listenForServers(connect),
		connect: connect,
		disconnect: disconnect,
		isConnected: connected
	}

	function listenForServers(callback) {
		console.log(`Listening on port ${constants.REMOTE_UI_BROADCAST_PORT} for ofxRemoteUI servers...`)

		// Open a port to listen for Remote UI servers broadcasting their existence
		var broadcastPort = new osc.UDPPort({
			localAddress: constants.LOCAL_IP_ADDRESS,
			localPort: constants.REMOTE_UI_BROADCAST_PORT
		})

		broadcastPort.on(constants.OSC_PORT_MESSAGE, (message, timeTag, info) => {

			// message reponse as an "args" array with 4 pieces of data
			// args[0] = port num
			// args[1] = computer name
			// args[2] = binary (app) name
			// args[3] = broadcast count
			const IP = info.address
			const PORT = message.args[0]


			// All we need is one broadcast packet so close the port
			broadcastPort.close()

			console.log(`Found ofxRemoteUI server @ ${IP}:${PORT}!`)
			console.log(`${message.args[2]} @ ${message.args[1]}`)
			callback(IP, PORT)
		})

		// Open the port.
		broadcastPort.open()
	}


	function connect(ip, port) {

		// Remote UI server talks to the client on its port + 1
		const LOACAL_PORT = port + 1

		connection = new osc.UDPPort({
			localAddress: constants.LOCAL_IP_ADDRESS,
			localPort: LOACAL_PORT,
			remoteAddress: ip,
			remotePort: port,
		})

		connection.on("message", (message, timeTag, info) => {
			console.log(message, " ", info)

			if (message.address == "/HELO") {
				connected = true

				connection.send({
					address: "/REQU"
				})
			}
		})

		connection.open()

		// Wait for the port to be ready before sending to it
		connection.on(constants.OSC_PORT_READY, () => {

			var message = {
				address: "/HELO"
			}

			console.log(`Connecting to server ${ip}:${port}...`)
			connection.send(message)
		})

	}

	function disconnect() {
		if (connected) {

			connection.send({
				address: "/CIAO"
			})

			connected = false
		}
	}


})();

// Export the client object for Node
module.exports = client