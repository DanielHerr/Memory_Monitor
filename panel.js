
// This code is the intellectual property of Daniel Stephen Herr.

var panelinterval = 1000;
var shelfinterval = 1000;
var shelftextcolor = "#ffffff";
var shelfbackground = "#000000";
var canvas = document.createElement("canvas");
canvas.width = 48;
canvas.height = 48;
var context = canvas.getContext("2d");
context.font = "40px Noto Sans";

function settings() {
  chrome.storage.sync.get({
    panelinterval: 1, paneltextcolor: "#000000", panelbackground: "#ffffff", panelsize: 20,
    shelfinterval: 1, shelftextcolor: "#ffffff", shelfbackground: "#000000"
  }, function(items) {
    panelinterval = items.panelinterval * 1000;
    shelfinterval = items.shelfinterval * 1000;
    document.body.style.backgroundColor = items.panelbackground;
    document.body.style.color = items.paneltextcolor;
    document.body.style.fontSize = items.panelsize + "px";
    shelftextcolor = items.shelftextcolor;
    shelfbackground = items.shelfbackground;
}) }

chrome.storage.onChanged.addListener(settings);
window.addEventListener("load", settings);

window.addEventListener("load", function shelf() {
  chrome.system.memory.getInfo(function(memory) {
    var short = (Math.round(memory.availableCapacity / 1024 / 1024 / 100 )) / 10;
    var long = (Math.round(memory.availableCapacity / 1024 / 1024)) / 1000;
    document.title = "Available: " + long + "GB " + "Capacity: " + (Math.round(memory.capacity / 1024 / 1024 / 100 )) / 10 + "GB";
    context.clearRect(0, 0, 48, 48);
    context.fillStyle = shelfbackground;
    context.fillRect(0, 0, 48, 48);
    context.fillStyle = shelftextcolor;
    context.fillText(short.toString()[0], 0, 36);
    if (short.toString()[2] !== undefined) { context.fillText(short.toString()[2], 24, 36)}
    else { context.fillText("0", 24, 36)}
    context.fillText(".", 20, 46);
    if (document.querySelector("link")) {
      document.querySelector("link").remove();
    }
    var link = document.createElement("link");
    link.rel = "icon";
    link.href = canvas.toDataURL();
    document.head.appendChild(link);
  });
  setTimeout(shelf, shelfinterval);
});

window.addEventListener("load", function panel() {
  chrome.system.memory.getInfo(function(memory) {
    var long = (Math.round(memory.availableCapacity / 1024 / 1024)) / 1000;
    document.querySelector("div").textContent = long;
  });
  setTimeout(panel, panelinterval);
});