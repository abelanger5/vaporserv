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

var pad_1 = [{ id: 'up', press: 'q'}, { id: 'down', press: 'w'}, 
{ id: 'left', press: 'e'}, { id: 'right', press: 'r'}, 
{ id: 'action_one', press: 't'}, { id: 'action_two', press: 'y'}, 
{ id: 'action_three', press: 'u'}, { id: 'action_four', press: 'i'}];

var pad_2 = [{ id: 'up', press: 'o'}, { id: 'down', press: 'p'}, 
{ id: 'left', press: 'a'}, { id: 'right', press: 's'}, 
{ id: 'action_one', press: 'd'}, { id: 'action_two', press: 'f'}, 
{ id: 'action_three', press: 'g'}, { id: 'action_four', press: 'h'}];

/*var pad_1 = [
        { up: 'q'}, { down: 'w'}, { left: 'e'}, { right: 'r'}, 
        { action_one: 't'}, { action_two: 'y'}, { action_three: 'y'}, 
        { action_four: 'u'}
    ];

var pad_2 = [
        { up: 'a'}, { down: 's'}, { left: 'd'}, { right: 'f'}, 
        { action_one: 'g'}, { action_two: 'h'}, { action_three: 'j'}, 
        { action_four: 'k'}
        ];*/

/*********************************************
SERVE EJS FILES
*********************************************/
app.get('/', function(request, response) {
	response.render('index.ejs');
});

app.get('/demo', function(request, response) {
	response.render('demo.ejs');
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
			res.render('controller_one.ejs', {pid: 1}); 
		} else if (player_id == 2) {
			res.render('controller_two.ejs', {pid: 2}); 
		} else if (player_id == 3) {
			res.render('controller_three.ejs', {pid: 3}); 
		} else if (player_id == 4) {
			res.render('controller_four.ejs', {pid: 4}); 
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