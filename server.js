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

app.post('/player', function(req, res) {
  var player_id = req.body.player; 
  console.log(player_id); 
  if (player_id == 1) {
    res.render('controller.ejs', {pad: pad_1}); 
  } else if (player_id == 2) {
  	res.render('controller.ejs', {pad: pad_2}); 
  }
}); 

/*********************************************
SOCKET IO
*********************************************/
var io = require('socket.io').listen(server);

io.on('connection', function(socket) {
	console.log('a user connected');

    
	socket.on('controller-key', function(msg) {
		console.log('received message from webpage: ' + msg.key); 
		io.emit('key', msg);
	}); 

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});