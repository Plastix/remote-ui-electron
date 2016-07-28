const osc = require('osc'),
	constants = require('./constants.js'),
	util = require('./util.js')

// ofxRemoteUI Client class
// This is the main abstraction for talking to the ofxRemoteUI server
class Client {

	constructor() {

		const COMMANDS_DIRECTORY = "commands"

		// Member Attributes
		this._connection = {}
		this._connected = false
		this._commands = {}

		// IP of computer on local network
		this._networkIp = util.getIPV4()
		this._debugMode = true

		console.log(`Debug Mode: ${this._debugMode}`)

		// Register all _commands in the commands directory
		// Dynamic require snipet from http://stackoverflow.com/questions/5364928/node-js-require-all-files-in-a-folder
		let normalizedPath = require("path").join(__dirname, COMMANDS_DIRECTORY)
		console.log(`Loading commands from ${normalizedPath}`)
		require("fs").readdirSync(normalizedPath).forEach((file) => {
				if (file.match(/\.js$/) !== null && file !== 'index.js') {
					console.log(`Loaded command ${file}!`)
					const cmd = require(`./${COMMANDS_DIRECTORY}/` + file);

					this._commands[cmd.trigger] = cmd.execute
				}
			}, this)
			// Inside of anoymous functions "this" is the global browser window
			// Here we make sure to pass in the instance of the Client class
	}

	// Class methods

	listenForServers(callback) {
		console.log(`Listening on port ${constants.RUI_BROADCAST_PORT} for ofxRemoteUI servers...`)

		// Open a port to listen for Remote UI servers broadcasting their existence
		const broadcastPort = new osc.UDPPort({
			localAddress: constants.LOCAL_IP_ADDRESS,
			localPort: constants.RUI_BROADCAST_PORT
		})

		broadcastPort.on(constants.OSC_PORT_MESSAGE, (message, timeTag, info) => {

			// TODO DEBUG ONLY: Connect to own computer only
			if (!this._debugMode || (this._debugMode && info.address == this._networkIp)) {

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
		this._connection = new osc.UDPPort({
			localAddress: constants.LOCAL_IP_ADDRESS,
			localPort: port + 1, // Remote UI server talks to the client on its port + 1
			remoteAddress: ip,
			remotePort: port,
		})

		// On every OSC message from the ofxRemoteServer check if the OSC address
		// matches a registered command and run it
		this._connection.on(constants.OSC_PORT_MESSAGE, (message, timeTag, info) => {
			console.log("Received OSC packet", message)

			const trigger = message.address
			if (trigger in this._commands) {
				console.log(`Executing command ${trigger}`)
				this._commands[trigger](this)
			}
		})

		// Once we open the UDP port send a connection OSC packet
		this._connection.on(constants.OSC_PORT_READY, () => {
			this._connected = true
			this.send(constants.RUI_PACKET_CONNECT)
		})

		console.log(`Connecting to server ${ip}:${port}...`)
		this._connection.open()
	}


	disconnect() {
		if (this._connected) {

			console.log("Disconnecting from server...")
			this.send(constants.RUI_PACKET_DISCONNECT)
			this._connected = false
		} else {
			throw "Client is not connected!"
		}
	}

	send(command, args) {
		if (this._connected) {

			let packet = {
				address: command
			}

			if (args !== undefined) {
				packet.args = args
			}

			console.log("Sending OSC packet", packet)
			this._connection.send(packet)
		} else {
			throw "Client is not connected!"
		}
	}

	run() {
		this.listenForServers(this.connect)
	}



}


// Export the client class for Node
module.exports = new Client()