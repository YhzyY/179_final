//起服务器，页面响应
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var user_socket = {}, users = [];

app.use('/', express.static(__dirname + "/www"));

server.listen(8080);
console.log("Server has started.");

//socket
io.on('connection', function (socket) {

	socket.on('login', function (nickname) {
		console.log('login');

		//判断用户名是否已经存在
		if (users.indexOf(nickname) > -1) {
			console.log('loginFailed');
			socket.emit('loginFailed');
		} else {
			console.log('login success');
			// socket.userIndex = users.length;
			user_socket[nickname] = socket;
			socket.nickname = nickname;
			users.push(nickname);
			console.log(nickname + ' is online, total: ' + users.length);
			console.log(' login users:  ' + users);
			socket.emit('loginSuccess');
			io.sockets.emit('system', nickname, users.length, 'login');
		}

	});

	//断开连接，实时更新users数组
	//广播system事件
	socket.on('disconnect', function () {
		var index = users.indexOf(socket.nickname);
		users.splice(index, 1);
		io.sockets.emit('system', socket.nickname, users.length, 'logout');
		delete user_socket[socket.nickname];
		//test
		console.log(socket.nickname + ' is disconnected.');
		console.log(' in disconnect, current user :' + users);
	});

	//群发信息
	socket.on('msgSend',function(msg){
		socket.broadcast.emit('newMsg', socket.nickname, msg);
	});

	//私聊信息
	socket.on('send private message', function (res) {
		console.log(res);
		if (res.recipient in user_socket) {
			user_socket[res.recipient].emit('receive private message', res);
		}
		else{
			user_socket[res.addresser].emit('paired user is offline',res);
		}
	});
});
