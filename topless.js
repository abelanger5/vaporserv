var socket = require('socket.io-client')('http://127.0.0.1:3000');
var robot = require("robotjs");

function key_press(key) {
	robot.keyToggle(key, "down");
	robot.keyToggle(key, "up"); 
}

socket.on('connect', function(){
	console.log('connected'); 
});

socket.on('controller-key', function(data){
	console.log("message: " + data.key); 
	key_press(data.key); 
});

socket.on('disconnect', function(){
	console.log('disconnected'); 
});