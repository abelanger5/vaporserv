/*********************************************
GUI AND ROUTING
*********************************************/
var electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
    	app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 900, height: 600});

    // and load the index.html of the app.
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});

/*********************************************
SOCKET IO + IPC (from app itself)
*********************************************/
var socket = require('socket.io-client')('http://localhost:3000');
var robot = require("robotjs");
var ipc = require('electron').ipcMain; 
var url; 

function key_press(key) {
	robot.keyToggle(key, "down");
	robot.keyToggle(key, "up"); 
}

function listen_key_press (url) {
	socket.on('key-' + url, function(data){
		console.log("message: " + data.key); 
		key_press(data.key); 
	});
}

socket.on('connect', function(){
	console.log('connected'); 
});

ipc.on('url', function(event, data) {
	url = data; 
	console.log(url); 
	listen_key_press(url); 
}); 

socket.on('disconnect', function(){
	console.log('disconnected'); 
});