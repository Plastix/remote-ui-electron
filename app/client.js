const osc = require('osc'),
	constants = require('./constants.js'),
	util = require('./util.js')

// ofxRemoteUI Client class
// This is the main abstraction for talking to the ofxRemoteUI server
class Client {

	constructor() {

		const COMMANDS_DIRECTORY = "commands"

		// Member Attributes
		this.connection = {}
		this.connected = false
		this.commands = {}

		// IP of computer on local network
		this.NETWORK_IP = util.getIPV4()
		this.DEBUG_MODE = true

		// Register all commands in the ./commands directory
		// Dynamic require snipet from http://stackoverflow.com/questions/5364928/node-js-require-all-files-in-a-folder
		let normalizedPath = require("path").join(__dirname, COMMANDS_DIRECTORY)
		require("fs").readdirSync(normalizedPath).forEach((file) => {
				if (file.match(/\.js$/) !== null && file !== 'index.js') {
					console.log(`Loaded command ${file}!`)
					const cmd = require(`./${COMMANDS_DIRECTORY}/` + file);

					this.commands[cmd.trigger] = cmd.execute
				}
			}, this)
			// Inside of anoymous functions "this" is the global browser window
			// Here we make sure to pass in the instance of the Client class
	}

	// Class methods

	listenForServers(callback) {
		console.log(`Listening on port ${constants.REMOTE_UI_BROADCAST_PORT} for ofxRemoteUI servers...`)

		// Open a port to listen for Remote UI servers broadcasting their existence
		const broadcastPort = new osc.UDPPort({
			localAddress: constants.LOCAL_IP_ADDRESS,
			localPort: constants.REMOTE_UI_BROADCAST_PORT
		})

		broadcastPort.on(constants.OSC_PORT_MESSAGE, (message, timeTag, info) => {

			// TODO DEBUG ONLY: Connect to own computer only
			if (!this.DEBUG_MODE || (this.DEBUG_MODE &&info.address == this.NETWORK_IP)) {

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
				callback.call(this, IP, PORT)
			}
		})

		// Open the port.
		broadcastPort.open()
	}


	connect(ip, port) {
		this.connection = new osc.UDPPort({
			localAddress: constants.LOCAL_IP_ADDRESS,
			localPort: port + 1, // Remote UI server talks to the client on its port + 1
			remoteAddress: ip,
			remotePort: port,
		})

		// On every OSC message from the ofxRemoteServer check if the OSC address
		// matches a registered command and run it
		this.connection.on(constants.OSC_PORT_MESSAGE, (message, timeTag, info) => {
			console.log("Received OSC message", message)

			const trigger = message.address
			if (trigger in this.commands) {
				console.log(`Executing command ${trigger}`)
				this.commands[trigger](this)
			}
		})

		// Wait for the port to be ready before sending to it
		this.connection.on(constants.OSC_PORT_READY, () => {
			console.log(`Connecting to server ${ip}:${port}...`)
			this.connection.send({
				address: constants.REMOTE_UI_PACKET_CONNECT
			})
		})

		this.connection.open()
	}


	disconnect() {
		if (this.connected) {

			console.log("Disconnecting from server...")
			this.connection.send({
				address: "/CIAO"
			})

			this.connected = false
		}
	}

	run() {
		this.listenForServers(this.connect)
	}


}


// Export the client class for Node
module.exports = new Client()