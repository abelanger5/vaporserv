var express = require('express'); 
var app = express(); 
var http = require('http'); 
var server = http.createServer(app); 

server.listen(process.env.PORT || 3000)

// views is directory for all template files
app.use(express.static('public'));
app.set('view engine', 'ejs');

/*********************************************
SERVE EJS FILES
*********************************************/
app.get('/', function(request, response) {
  response.render('index.ejs');
});

app.get('/demo', function(request, response) {
  response.render('demo.ejs');
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