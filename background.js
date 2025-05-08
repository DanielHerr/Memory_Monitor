"use strict"

var panel = 0;
var iconinterval = 1000;
var barinterval = 1000;
var clickbar = false;
var clickpanel = true;
var autoinject = false;
var textcolor = "#000000";
var background = "#ffffff";
var notified = false;
var low = 0;
var canvas = (new OffscreenCanvas(19, 19)).getContext("2d", { willReadFrequently: true })

chrome.runtime.onInstalled.addListener(function({ reason }) {
 if(reason == "install") {
  chrome.tabs.create({ url: "options.html" })
 }
 chrome.contextMenus.create({ id: "panel", title: "Install Floating Panel App", contexts: ["action"] }, function() {})
 chrome.runtime.setUninstallURL("https://forms.danielherr.software/Uninstalled/Memory_Monitor")
})

function open() {
  chrome.windows.create({ url: "panel.html", type: "panel", width: 100, height: 100
  }, function(window) { if (window.type === "panel") {
    chrome.windows.update(window.id, { state: "minimized"});
    panel = window.id;
  } else {
    chrome.windows.remove(window.id);
} } ) }

function options() { chrome.storage.sync.get({
  browserinterval: 1, barinterval: 1, clickbar: false, clickpanel: true, low: 0,
  browsertextcolor: "#000000", browserbackground: "#ffffff", autopanel: false
}, function(items) {
    iconinterval = items.browserinterval * 1000;
    barinterval = items.barinterval * 1000;
    textcolor = items.browsertextcolor;
    background = items.browserbackground;
    clickbar = items.clickbar;
    clickpanel = items.clickpanel;
    low = items.low;
    if (items.autopanel == true) {
      chrome.runtime.sendMessage("kbilomlpmhhhaimaigidhnjijhiajbam", { launch: true })
} } )}

options()
chrome.storage.onChanged.addListener(options);

chrome.notifications.onClicked.addListener(function() {
  chrome.tabs.create({ url: "options.html"});
})

chrome.notifications.onClosed.addListener(function() { notified = false });

function infoicon() {
  chrome.system.memory.getInfo(function(memory) {
    var short = (Math.round(memory.availableCapacity / 1024 / 1024 / 100)) / 10;
    var long = (Math.round(memory.availableCapacity / 1024 / 1024)) / 1000;
    canvas.font = "20px Noto Sans, sans-serif";
    canvas.clearRect(0, 0, 19, 19);
    canvas.fillStyle = background;
    canvas.fillRect(0, 0, 19, 19);
    canvas.fillStyle = textcolor;
    canvas.fillText(short.toString()[0], -1, 14);
    if (short.toString()[2] !== undefined) { canvas.fillText(short.toString()[2], 9, 14)}
    else { canvas.fillText("0", 9, 14)}
    canvas.fillText(".", 7, 18);
    chrome.action.setTitle({ title: "Available: " + long + " GB " + "Capacity: " + (Math.round(memory.capacity / 1024 / 1024 / 100 )) / 10 + " GB" });
    if (long < low && notified === false) {
      chrome.notifications.create("lowram", {
        type: "progress", title: "Memory Monitor", message: "Your available RAM is low.", iconUrl: "icon.png", progress: Math.round((memory.availableCapacity / memory.capacity) * 100)
      }, function() { notified = true }
    ) }
    else if (long < low && notified === true) {
      chrome.notifications.update("lowram", { progress: Math.round((memory.availableCapacity / memory.capacity) * 100) }, function() { } );
    }
    else if (notified === true) { chrome.notifications.clear("lowram",
      function() { notified = false }
  	) }
		chrome.action.setIcon({ imageData: canvas.getImageData(0, 0, 19, 19)});
	});
  setTimeout(infoicon, iconinterval);
}
infoicon()

function infobar() {
	if(clickbar || autoinject) {
  chrome.system.memory.getInfo(function(memory) {
      chrome.tabs.query({ active: true }, function(tabs) {
        for (var number in tabs) {
          chrome.tabs.sendMessage(tabs[number].id, { available: (Math.round(memory.availableCapacity / 1024 / 1024)) / 1000 });
	} }) }) }
  setTimeout(infobar, barinterval);
}
infobar()

function inject() { if (autoinject === true) {
  chrome.tabs.query({}, function(tabs) {
    for (var number in tabs) {
      chrome.scripting.executeScript({ target: { tabId: tabs[number].id }, files: [ "inject.js" ]})
} }) }}

function permissions() {
 chrome.permissions.contains({
  origins: ["<all_urls>"] }, function(result) {
    if (result) { autoinject = true;
    chrome.tabs.onCreated.addListener(inject);
    chrome.tabs.onUpdated.addListener(inject);
    chrome.tabs.onReplaced.addListener(inject);
    }
    else { autoinject = false }
} )}

permissions()
chrome.permissions.onAdded.addListener(permissions)

chrome.action.onClicked.addListener(function(tab) {
	if (clickbar === true && autoinject === false) {
    chrome.scripting.executeScript({ target: { tabId: tab.id }, files: [ "inject.js" ]})
	}
	if (clickpanel == true) {
	  chrome.runtime.sendMessage("kbilomlpmhhhaimaigidhnjijhiajbam", { launch: true })
} });

chrome.runtime.onMessageExternal.addListener(function(message, sender, sendResponse) {
  chrome.tabs.create({ url: "options.html"}, function() {
    sendResponse({ opened: true })
}) });

chrome.contextMenus.onClicked.addListener(function() {
  chrome.tabs.create({ url: "https://chrome.google.com/webstore/detail/kbilomlpmhhhaimaigidhnjijhiajbam"})
})

chrome.runtime.onStartup.addListener(function() {}) // dummy to fix extension not loading on startup