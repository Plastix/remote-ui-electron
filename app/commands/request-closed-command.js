const constants = require("../constants.js")

var exports = module.exports = {}

exports.trigger = constants.RUI_PACKET_REQUEST_PARAMS

const ALL_PARAM_VALUE = "*"

exports.execute = function(client, message, args) {

	// Server closed the request
	// We should have all params now
	if (args[0] == constants.RUI_STATUS_OK) {
		console.log("Got all params from server!")

		client.clearGroupFilters()

		// Populate the group filter dropdown menu
		updateGroupPicker()
	}
}

function updateGroupPicker() {
	const select = document.getElementById("groups")

	// Add special option "All Params" for showing all
	const allParams = document.createElement("option")
	allParams.value = ALL_PARAM_VALUE
	allParams.innerHTML = "ALL_PARAMS"
	select.appendChild(allParams)

	const groups = document.getElementsByClassName('paramGroup')

	for (var i = groups.length - 1; i >= 0; i--) {
		const group = groups[i]

		const option = document.createElement("option")
		option.value = group.id
		option.innerHTML = group.id.split("_").join(" ")

		select.appendChild(option)
	}

	select.onchange = () => {
		const value = select.value
		const showingAll = value == ALL_PARAM_VALUE

		// Hide all paramGroups except for the select one
		// If "All Params" is selected all are shown
		for (var i = groups.length - 1; i >= 0; i--) {
			const group = groups[i]

			if (showingAll || group.id == value) {
				group.style.display = "block"
			} else {
				group.style.display = "none"

			}
		}
	}
}