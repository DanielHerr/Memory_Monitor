"use strict"

async function refresh_meters() {
	let mem = await chrome.system.memory.getInfo()
	usagemeter.max = mem.capacity
	usagemeter.low = mem.capacity * 0.8
	usagemeter.high = mem.capacity * 0.9
	usagemeter.value = mem.capacity - mem.availableCapacity
	setTimeout(refresh_meters, Settings.graphical_interval * 1000)
}

var units = {
	"GB": 1000000000,
	"GiB": 1073741824
}

async function refresh_text() {
	let mem = await chrome.system.memory.getInfo()
	capacity.value = (mem.capacity / units[Settings.measure_unit]).toFixed(3) + " " + Settings.measure_unit
	available.value = (mem.availableCapacity / units[Settings.measure_unit]).toFixed(3) + " " + Settings.measure_unit
	setTimeout(refresh_text, Settings.numeric_interval * 1000)
}

refresh_meters()
refresh_text()

Settings.assigned.add(function(assigned) {
	if("graphical_interval" in assigned) {
		document.body.style.setProperty("--interval", assigned.graphical_interval + "s")
	}
})