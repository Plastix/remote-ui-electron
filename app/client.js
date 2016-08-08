const osc = require('osc'),
	constants = require('./constants.js'),
	util = require('./util.js')

// ofxRemoteUI Client class
// This is the main abstraction for talking to the ofxRemoteUI server
class Client {

	constructor() {
		// Member Attributes
		this._connection = null
		this._broadcastPort = null
		this._connected = false
		this._commands = {}
		this._servers = {}

		// Register all commands in the commands directory
		// Dynamic require snipet from http://stackoverflow.com/questions/5364928/node-js-require-all-files-in-a-folder
		let normalizedPath = require("path").join(__dirname, constants.CLIENT_COMMANDS_FOLDER)
		console.log(`Loading commands from ${normalizedPath}`)
		require("fs").readdirSync(normalizedPath).forEach((file) => {
				if (file.match(/\.js$/) !== null && file !== 'index.js') {
					console.log(`Loaded command ${file}!`)
					const cmd = require(`./${constants.CLIENT_COMMANDS_FOLDER}/` + file);

					this._commands[cmd.trigger] = cmd.execute
				}
			}, this)
			// Inside of anoymous functions "this" is the global browser window
			// Here we make sure to pass in the instance of the Client class
	}

	// Class methods

	// Opens a OSC port on constants.RUI_BROADCAST_PORT and listens for RemoteUI servers broadcasting their existence 
	listenForServers() {
		console.log(`Listening on port ${constants.RUI_BROADCAST_PORT} for ofxRemoteUI servers...`)

		// Open a port to listen for Remote UI servers broadcasting their existence
		this.broadcastPort = new osc.UDPPort({
			localAddress: constants.LOCAL_IP_ADDRESS,
			localPort: constants.RUI_BROADCAST_PORT
		})

		this.broadcastPort.on(constants.OSC_PORT_MESSAGE, (message, timeTag, info) => {
			// message reponse as an "args" array with 4 pieces of data
			// args[0] = port num
			// args[1] = computer name
			// args[2] = binary (app) name
			// args[3] = broadcast count
			const INFO = {
				ip: info.address,
				port: message.args[0],
				computerName: message.args[1],
				appName: message.args[2],
				seen: Date.now()
			}

			this._servers[INFO.ip] = INFO // Update the server info in the "map"
		})

		this.broadcastPort.open()

		// Every so often clear servers that have "died"
		setInterval(() => {
			this.updateSeenServers()
		}, 500)
	}

	updateSeenServers() {
		var select = document.getElementById("servers")

		Object.keys(this._servers).forEach((ip) => {
			const INFO = this._servers[ip];

			this.addServerToList(ip)

			const lastSeen = ((Date.now() - INFO.seen) / 1000) % 60
			if (lastSeen > constants.RUI_NEIGHBOR_DEATH_TIME) {
				console.log(`Lost connection with ${ip}!`)
				delete this._servers[ip]
				this.removeServerFromList(ip)

			}

		}, this);
	}


	// Connect to the RemoteUI server running at the specified ip and port
	// This will automatically send a 'HELO'
	// After connecting, every new message from the server will be parsed and execute any
	// matching commands
	connect(ip, port) {
		if (this._connected) {
			throw "Client is already connected! Please disconnect first!"
		}

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

			const split = message.address.split(" ")
			const trigger = split[0]
			if (trigger in this._commands) {
				console.log(`Executing command ${trigger}`)
				this._commands[trigger](this, split, message.args)
			}
		})

		// Once we open the UDP port send a connection OSC packet
		this._connection.on(constants.OSC_PORT_READY, () => {
			this._connected = true
			this.updateConnectButton()
			this.send(constants.RUI_PACKET_CONNECT)
		})

		console.log(`Connecting to server ${ip}:${port}...`)
		this._connection.open()
	}


	// Disconnects from the RemoteUI server
	// This will send a 'CIAO' OSC message to the server
	disconnect() {
		if (this._connected) {

			// Reset UI 
			// clearParams() will also clear grouPresets since it gets ride of the divs
			this.clearParams()
			this.clearGroupFilters()
			this.clearGlobalPresets()
			this.clearFilterSearch()
			this.deselectGlobalPresets()
			this.deselectGroupPresets()

			console.log("Disconnecting from server...")
			this.send(constants.RUI_PACKET_DISCONNECT)
			this._connected = false

			this.updateConnectButton()
				// TODO
				// We must close the port here in order for it to be acessible again
				// However closing the port for some reason means our CIAO packet doesn't get sent
			this._connection.close()
		} else {
			throw "Client is not connected!"
		}
	}

	reconnect(ip, port) {
		if (this._connected) {
			this.disconnect()
		}

		this.connect(ip, port)
	}

	// Sends an OSC packet to the RemoteUI server, if connected
	send(command, args) {
		if (this._connected) {

			let packet = {
				address: command
			}

			if (args !== undefined) {
				packet.args = args
			}

			// console.log("Sending OSC packet", packet)
			this._connection.send(packet)
		} else {
			throw "Client is not connected!"
		}
	}

	isConnected() {
		return this._connected
	}

	sync() {
		if (this._connected) {
			this.send(constants.RUI_PACKET_REQUEST_PARAMS)
		} else {
			throw "Client is not connected!"
		}
	}


	updateConnectButton() {
		const button = document.getElementById("connectButton")
		if (this._connected) {
			button.innerHTML = "Disconnect"
		} else {
			button.innerHTML = "Connect"
		}
	}

	clearParams() {
		util.clearTagById("paramList")
	}

	clearGroupFilters() {
		util.clearTagById("groups")

	}

	clearGlobalPresets() {
		util.clearTagById("globalPresets")
	}

	clearGroupPresets() {
		util.clearTagsByClass("groupPresetSelect")
	}

	clearFilterSearch() {
		document.getElementById("filterParams").value = ""
	}

	deselectGlobalPresets() {
		const globalPresets = document.getElementById("globalPresets")
		globalPresets.selectedIndex = 0
		globalPresets.index = 0
	}

	deselectGroupPresets() {
		const dropdowns = document.getElementsByClassName('groupPresetSelect')
		for (var i = dropdowns.length - 1; i >= 0; i--) {
			const select = dropdowns[i]
			select.selectedIndex = 0
			select.index = 0
		}

	}

	// Called when any param is changed
	paramChanged(name) {

		// Remove global preset when any param is changed
		const globalPresets = document.getElementById("globalPresets")
		globalPresets.selectedIndex = 0

		// Remove group preset
		if (name !== undefined) {
			const paramGroup = document.getElementById(name).parentElement
			const groupPresets = paramGroup.getElementsByClassName("groupPresetSelect")[0]
			groupPresets.selectedIndex = 0
		}

	}

	addServerToList(ip) {
		if (document.getElementById(ip) === null) {
			const INFO = this._servers[ip]
			const option = document.createElement("option")
			option.value = `${INFO.ip}:${INFO.port}`
			option.id = ip
			option.innerHTML = `${INFO.appName} @ ${INFO.computerName} (${INFO.ip}:${INFO.port})`

			document.getElementById("servers").appendChild(option)
		}
	}

	removeServerFromList(ip) {
		const select = document.getElementById("servers")
		const option = document.getElementById(ip);
		option.remove(option.selectedIndex)

		if (select.length == 0) {
			select.selectedIndex = -1
		}
	}



}


// Export the client class for Node
module.exports = new Client()