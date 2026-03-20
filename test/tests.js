"use strict"

// ─── Chrome API Mock ─────────────────────────────────────────────────

var chrome = self.chrome || {}
chrome.system = chrome.system || {}
chrome.system.memory = chrome.system.memory || {}
chrome.system.memory.getInfo = function() {
	return Promise.resolve(chrome.system.memory._mockData)
}
chrome.system.display = chrome.system.display || {}
chrome.system.display.getInfo = function() {
	return Promise.resolve(chrome.system.display._mockData)
}
chrome.offscreen = undefined
chrome.runtime = chrome.runtime || {}
chrome.runtime.sendMessage = function() { return Promise.resolve(1) }

// ─── Copied functions under test (from background.js / popup.js) ────
// Keep in sync with originals — see source references in comments.

// from background.js lines 47-69
async function calc_icon_size() {
	if(navigator.userAgent.includes("OPR")) { // Opera
		var possible = [ 1, 1.25, 1.5, 2, 2.5 ]
	} else {
		var possible = [ 1, 2 ] // Chrome, Edge, Brave, etc.
	}
	let size = 16
	function determine_size(scale) {
		for(let factor of possible) {
			if(Math.fround(scale) <= Math.fround(factor + 0.2)) {
				return 16 * factor
		} }
		return 16 * possible[possible.length - 1]
	}
	let displays = await chrome.system.display.getInfo()
	if(displays.length == 1 && self.devicePixelRatio) {
		size = determine_size(devicePixelRatio)
	} else if(displays[0].modes && displays[0].modes[0]) {
		for(let display of displays) {
			size = Math.max(size, determine_size(display.modes[0].deviceScaleFactor))
		}
	} else if(displays.length == 1 && chrome.offscreen) {
		if(self.offscreen_loading) {
			await offscreen_loading
		}
		let dpr = await chrome.runtime.sendMessage("dpr")
		size = determine_size(dpr)
	} else {
		size = 16 * possible[possible.length - 1]
	}
	return size
}

// ═══════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════


// ─── memory() ───────────────────────────────────────────────────────────

QUnit.module("memory()", function() {

	QUnit.test("normal usage calculation (< 10GB formats to 1 decimal place)", async function(assert) {
		const GB = 1073741824
		chrome.system.memory._mockData = {
			capacity: 16 * GB,
			availableCapacity: 9.3 * GB
		}

		let result = await memory()

		assert.equal(result.capacity, 16, "returns correct capacity in GB")
		assert.equal(result.availableCapacity, 9.3, "returns correct available in GB")
		assert.equal(result.usage, 6.7, "usage is nicely formatted to 1 decimal if < 10")
	})

	QUnit.test("normal usage calculation (>= 10GB rounds to integer)", async function(assert) {
		const GB = 1073741824
		chrome.system.memory._mockData = {
			capacity: 32 * GB,
			availableCapacity: 12.5 * GB
		}

		let result = await memory()

		assert.equal(result.capacity, 32, "returns correct capacity in GB")
		assert.equal(result.availableCapacity, 12.5, "returns correct available in GB")
		assert.equal(result.usage, 20, "usage is rounded to no decimal points if >= 10")
	})
})

// ─── calc_icon_size() ────────────────────────────────────────────────

QUnit.module("calc_icon_size()", function(hooks) {
	let originalDPR
	let originalUA

	hooks.beforeEach(function() {
		originalUA = navigator.userAgent
		Object.defineProperty(navigator, "userAgent", { value: "Chrome", configurable: true })
		originalDPR = self.devicePixelRatio
	})
	hooks.afterEach(function() {
		Object.defineProperty(navigator, "userAgent", { value: originalUA, configurable: true })
		Object.defineProperty(self, "devicePixelRatio", { value: originalDPR, configurable: true })
	})

	QUnit.test("single display, high DPI (devicePixelRatio > 1.2)", async function(assert) {
		Object.defineProperty(self, "devicePixelRatio", { value: 2, configurable: true })
		chrome.system.display._mockData = [{ id: "1" }]

		let size = await calc_icon_size()
		assert.equal(size, 32, "returns 32 for high DPI")
	})
})