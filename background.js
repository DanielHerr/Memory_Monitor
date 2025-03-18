
// This code is the intellectual property of Daniel Stephen Herr.

var panel = 0;
var iconinterval = 1000;
var barinterval = 1000;
var clickbar = true;
var clickpanel = true;
var clickicon = true;
var autoinject = false;
var textcolor = "#000000";
var background = "#dddddd";
var notosans = false;
var notified = false;
var low = 0;
var canvas = document.createElement("canvas").getContext("2d");

chrome.runtime.onInstalled.addListener(function(details) {
  if (chrome.runtime.id == "gaodmenekccdomeicdoldgdpcemlgiag" && details.reason != "chrome_update") {
    chrome.tabs.create({url: "options.html"});
  } else if (chrome.runtime.id != "gaodmenekccdomeicdoldgdpcemlgiag") {
    chrome.tabs.create({ url: "https://chrome.google.com/webstore/detail/gaodmenekccdomeicdoldgdpcemlgiag"}, function() {
      chrome.management.uninstallSelf();
  }) }
  if (details.reason == "install") {
    chrome.fontSettings.getFontList(function(results) {
      for (number = 0; number < results.length; number++) {
        if (results[number].displayName == "Noto Sans"){ notosans = true }
      }
      if (notosans === false) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "blob";
        xhr.open("GET", "https://googledrive.com/host/0B9_ds1FPyRuZNUpaOFhfeXhjNXc/NotoSans.ttf");
        xhr.onload = function() {
          window.webkitRequestFileSystem(window.PERSISTENT, 410*1024, function(fileSystem){
            fileSystem.root.getFile("noto.ttf", {create: true}, function(fileEntry) {
              fileEntry.createWriter(function(fileWriter) {
                fileWriter.onwriteend = function() {
                  document.head.insertAdjacentHTML("beforeend", "<style> @font-face { font-family: Noto; src: url(" + fileEntry.toURL() + "); } </style>");
                };
                fileWriter.write(xhr.response);
        }) }) }) };
        xhr.send();
} }) } });

window.addEventListener("load", function() {
  chrome.fontSettings.getFontList(function(results) {
    for (number = 0; number < results.length; number++) {
      if (results[number].displayName == "Noto Sans"){ notosans = true }
    }
    if (notosans === false){
      window.webkitResolveLocalFileSystemURL("filesystem:chrome-extension://gaodmenekccdomeicdoldgdpcemlgiag/persistent/noto.ttf", function(fileEntry) {
        document.head.insertAdjacentHTML("beforeend", "<style> @font-face { font-family: Noto; src: url(" + fileEntry.toURL() + "); } </style>");
}) } }) });

chrome.windows.onRemoved.addListener(function(windowId) {
  if (windowId == panel) { panel = 0 }
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
  browserinterval: 1, barinterval: 1, clickbar: true, clickicon: true, clickpanel: true, low: 0,
  browsertextcolor: "#000000", browserbackground: "#dddddd", autoicon: false, autopanel: false
}, function(items) {
    iconinterval = items.browserinterval * 1000;
    barinterval = items.barinterval * 1000;
    textcolor = items.browsertextcolor;
    background = items.browserbackground;
    clickbar = items.clickbar;
    clickicon = items.clickicon;
    clickpanel = items.clickpanel;
    low = items.low;
    if (items.autoicon == true && panel == 0) { open()}
    if (items.autopanel == true) {
      chrome.runtime.sendMessage("kbilomlpmhhhaimaigidhnjijhiajbam", { launch: true })
} } )}

window.addEventListener("load", options);
chrome.storage.onChanged.addListener(options);

chrome.notifications.onClicked.addListener(function() {
  chrome.tabs.create({ url: "options.html" });
});

chrome.notifications.onClosed.addListener(function() { notified = false });

window.addEventListener("load", function iconinfo() {
  chrome.system.memory.getInfo(function(memory) {
    var short = (Math.round(memory.availableCapacity / 1024 / 1024 / 100)) / 10;
    var long = (Math.round(memory.availableCapacity / 1024 / 1024)) / 1000;
    canvas.font = "20px Noto Sans, Noto";
    canvas.clearRect(0, 0, 19, 19);
    canvas.fillStyle = background;
    canvas.fillRect(0, 0, 19, 19);
    canvas.fillStyle = textcolor;
    canvas.fillText(short.toString()[0], -1, 14);
    if (short.toString()[2] !== undefined) { canvas.fillText(short.toString()[2], 9, 14)}
    else { canvas.fillText("0", 9, 14)}
    canvas.fillText(".", 7, 18);
    chrome.browserAction.setTitle({ title: "Available: " + long + " GB " + "Capacity: " + (Math.round(memory.capacity / 1024 / 1024 / 100 )) / 10 + " GB" });
    if (long < low && notified === false) {
      chrome.notifications.create("lowram", {
        type: "progress", title: "Memory Monitor", message: "Warning! Your available RAM is low!", iconUrl: "icon.png", progress: Math.round((memory.availableCapacity / memory.capacity) * 100)
      }, function() { notified = true }
    ) }
    else if (long < low && notified === true) {
      chrome.notifications.update("lowram", { progress: Math.round((memory.availableCapacity / memory.capacity) * 100) }, function() { } );
    }
    else if (notified === true) { chrome.notifications.clear("lowram",
      function() { notified = false }
  ) } });
  setTimeout(iconinfo, iconinterval);
  chrome.browserAction.setIcon({ imageData: canvas.getImageData(0, 0, 19, 19)});
});

window.addEventListener("load", function barinfo() {
  chrome.system.memory.getInfo(function(memory) {
    if (clickbar === true || autoinject === true) {
      chrome.tabs.query({ active: true }, function(tabs) {
        for (var number in tabs) {
          chrome.tabs.sendMessage(tabs[number].id, { available: (Math.round(memory.availableCapacity / 1024 / 1024)) / 1000 });
  } }) } });
  setTimeout(barinfo, barinterval);
});

function inject() { if (autoinject === true) {
  chrome.tabs.query({}, function(tabs) {
    for (var number in tabs) {
      chrome.tabs.executeScript(tabs[number].id, { file: "inject.js"});
} }) }}

function permissions() { chrome.permissions.contains({
  permissions: ["tabs"], origins: ["<all_urls>"] }, function(result) {
    if (result) { autoinject = true;
    chrome.tabs.onCreated.addListener(inject);
    chrome.tabs.onUpdated.addListener(inject);
    chrome.tabs.onReplaced.addListener(inject);
    }
    else { autoinject = false }
} )}

window.addEventListener("load", permissions);
chrome.permissions.onAdded.addListener(permissions);

chrome.browserAction.onClicked.addListener(function() {
	if (clickbar === true && autoinject === false) {
    chrome.tabs.executeScript({ file: "inject.js"});
	}
	if (clickicon === true) { open()}
	if (clickpanel == true) {
	  chrome.runtime.sendMessage("kbilomlpmhhhaimaigidhnjijhiajbam", { launch: true })
} });

chrome.runtime.onMessageExternal.addListener(function(message, sender, sendResponse) {
  chrome.tabs.create({ url: "options.html"}, function() {
    sendResponse({ opened: true })
}) });

chrome.contextMenus.create({ id: "shelf", title: "Enable Bottom Shelf Icon", contexts: ["browser_action"], onclick: function() {
  chrome.tabs.create({ url: "chrome://flags/#enable-panels"})
}});
chrome.contextMenus.create({ id: "panel", title: "Install Floating Panel App", contexts: ["browser_action"], onclick: function() {
  chrome.tabs.create({ url: "https://chrome.google.com/webstore/detail/kbilomlpmhhhaimaigidhnjijhiajbam"})
}});