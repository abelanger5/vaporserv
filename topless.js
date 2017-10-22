var socket = require('socket.io-client')('http://35.196.132.21:3000');
var robot = require("robotjs");

function key_press(key) {
	if (key.length == 1) {
		robot.keyToggle(key, "down");
		robot.keyToggle(key, "up"); 
	}
}

socket.on('connect', function(){
	console.log('connected'); 
});

socket.on('key', function(data){
	console.log("message: " + data.key); 
	key_press(data.key); 
});

socket.on('disconnect', function(){
	console.log('disconnected'); 
});