var express = require('express'); 
var app = express(); 
var bodyParser = require('body-parser');
var http = require('http'); 
var server = http.createServer(app); 

server.listen(process.env.PORT || 3000)

// views is directory for all template files
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

/*********************************************
GAME PAD TYPES
*********************************************/
//default game pads
var dpad_1 = [{ id: 'up', press: 'q'}, { id: 'down', press: 'w'}, 
{ id: 'left', press: 'r'}, { id: 'right', press: 'e'}]; 

var action_1 = [{ id: 'action_one', press: 'x'}, { id: 'action_two', press: 'y'}, 
{ id: 'action_three', press: 'z'}, { id: 'action_four', press: 't'}];

var dpad_2 = [{ id: 'up', press: 'a'}, { id: 'down', press: 's'}, 
{ id: 'left', press: 'f'}, { id: 'right', press: 'd'}]; 

var action_2 = [{ id: 'action_one', press: 'c'}, { id: 'action_two', press: 'h'}, 
{ id: 'action_three', press: 'v'}, { id: 'action_four', press: 'g'}]; 

var dpad_3 = [{ id: 'up', press: '1'}, { id: 'down', press: '2'}, 
{ id: 'left', press: '4'}, { id: 'right', press: '3'}]; 

var action_3 = [{ id: 'action_one', press: '7'}, { id: 'action_two', press: '6'}, 
{ id: 'action_three', press: '8'}, { id: 'action_four', press: '5'}];

var dpad_4 = [{ id: 'up', press: 'u'}, { id: 'down', press: 'i'}, 
{ id: 'left', press: 'p'}, { id: 'right', press: 'o'}]; 

var action_4 = [{ id: 'action_one', press: 'l'}, { id: 'action_two', press: 'k'}, 
{ id: 'action_three', press: 'm'}, { id: 'action_four', press: 'j'}];

/*********************************************
SERVE EJS FILES
*********************************************/
app.get('/', function(req, res) {
	res.render('controller.ejs', {pid: 1, dpad: dpad_1, action: action_1});  
});

function create_url (url, socket) {
	var int_players = 4; 
	var players_array = new Array(4); 

	for (var i = 0; i < int_players; i++) {
		players_array[i] = { id: ((i + 1) + '')}
	}

	app.get('/' + url, function(req, res) {
		res.render('select.ejs', {url_id: url, players: players_array});
	}); 

	app.post('/' + url + '/player', function(req, res) {
		var player_id = req.body.player; 
		io.emit(url + '-disable', { pid: player_id}); 
		console.log(url + '-disable'); 		
		if (player_id == 1) {
			res.render('controller.ejs', {pid: 1, dpad: dpad_1, action: action_1}); 
		} else if (player_id == 2) {
			res.render('controller.ejs', {pid: 2, dpad: dpad_2, action: action_2}); 
		} else if (player_id == 3) {
			res.render('controller.ejs', {pid: 3, dpad: dpad_3, action: action_3}); 
		} else if (player_id == 4) {
			res.render('controller.ejs', {pid: 4, dpad: dpad_4, action: action_4});
		}
	}); 
}

/*********************************************
SOCKET IO
*********************************************/
var io = require('socket.io').listen(server);

io.on('connection', function(socket) {
	var local_url; 
	console.log('a user connected: ' + socket.id);

    //route controller keys to specific desktop clients
    socket.on('controller-key', function(msg) {
    	console.log('received message from webpage: ' + msg.key + ' ' + msg.url); 
		//send key press to desktop listening for press from that url
		io.emit('key-' + msg.url, msg);
	}); 

    socket.on('player-connect', function(msg) {
    	io.emit(msg.url + '-client-connect', {pid: msg.pid, client_id: socket.id}); 
    }); 

    socket.on('create-url', function(msg) {
    	console.log('new url created: ' + msg.url); 
    	create_url (msg.url, socket); 
    	local_url = msg.url; 
    });

    socket.on('disconnect', function(){
    	console.log('user disconnected: ' + socket.id);
    	io.emit('client-disconnect', { client_id: socket.id}); 
    });

    socket.on('answer-query', function (msg) {
    	var url = msg.url_send; 
    	for (var i = 0; i < 4; i++) {
    		if (msg.clients[i]) {
    			console.log('sending message to disable: ' + (i+1)); 
    			io.emit(url + '-disable', {pid: ("" + (i + 1))}); 
    		}
    	}
    	console.log('answer query happening for: ' + url + '-disable');
    }); 

    //select query to disable connected players
    socket.on('select-query', function(msg) {
    	var url = msg.url; 
    	console.log('select query received'); 
    	io.emit(url + '-connect-query', {}); 
    }); 

    //recolor on the select page (calling this enable)
    socket.on('client-disable', function(msg) {
    	var url = msg.url_send; 
    	io.emit(url + '-client-enable', {pid: msg.pid}); 
    }); 
});