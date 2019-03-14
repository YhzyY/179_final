// var socket = io.connect(); //与服务器进行连接
// var button = document.getElementById("");
// button.onclick = function() {
// 	socket.emit("message", "kkkyrie"); //这个msg是用户的输入
// }
var tutor_id, tutor_name;
window.onload = function () {


	function getQuery(query) {
		var request = window.location.search.substr(1);
		var queries = request.split("&");
		for (var i = 0; i < queries.length; i++) {
			query_pair = queries[i].split("=");
			if (query_pair[0] == query)
				return query_pair[1];
		}
		return (false);
	}

	var course_id = getQuery("course_id");
	var course_name = getQuery("course_name");
	tutor_id = getQuery("tutor_id");
	tutor_name = getQuery("tutor_name");
	var uid = getQuery("uid");

	const usersRef = firestore.doc("users/" + uid);
	const courseRef = firestore.doc("course/" + course_id);

	document.getElementById('signup').style.display = 'none';
	document.getElementById('login').style.display = 'none';
	document.getElementById('top1').style.display = 'none';
	document.getElementById('top2').style.display = 'none';
	document.getElementById('user').style.display = 'block';
	document.getElementById('top3').style.display = 'none';
	document.getElementById('signout').style.display = 'none';

	document.getElementById("hide_tid").textContent = tutor_id;
	document.getElementById("hide_uid").textContent = uid;
	// alert('("hide_tid").textContent' + tutor_id);
	// alert('("hide_uid").textContent' + document.getElementById("hide_uid").textContent);

	usersRef.get().then(function (doc) {
		if (doc && doc.exists) {
			const curData = doc.data();
			user.email = curData.email;
			user.credit = curData.credit;
			user.gender = curData.gender;
			user.username = curData.username;
			user.phone = curData.phone;
			user.interests = curData.interests;
			user.skills = curData.skills;
			user.rate = curData.rate;
			user.rate_amount = curData.rate_amount;

			if (user.username) {
				document.getElementById('title_username').textContent = user.username;
			}
			else if (user.email) {
				document.getElementById('title_username').textContent = user.email;
			}

			document.getElementById("username").textContent = tutor_name;
			document.getElementById("subject").textContent = course_name;
		}
	}).catch(function (error) {
		console.log("Got an error: " + error);
	});

	var kchat = new KChat();
	kchat.init();
};

var KChat = function () {
	this.socket = null;
};

KChat.prototype = {

	init: function () {
		var that = this;

		//建立与服务器的socket连接
		this.socket = io.connect();

		//监听socket的connect事件，此事件表示连接已经建立
		this.socket.on('connect', function () {
			console.log("111");
			alert('connecting to the server')
			// document.getElementById('info').textContent = 'Go get youself a nickname :)';
			// document.getElementById('nickWrapper').style.display = 'block';
			// document.getElementById('nicknameInput').focus();

			var tutor_id = document.getElementById("hide_tid").textContent;
			// alert('in kchat, tutor_id'+ tutor_id);
			if (tutor_id == '') {
				alert('in kchat, paired user unvalid');
				return;
			}
			var nickname = document.getElementById("hide_uid").textContent;
			that.socket.emit('login', nickname);
			// alert('in kchat, my id' + nickname);
		});

		//登录失败
		this.socket.on('loginFailed', function () {
			var info = document.getElementById('info');
			info.textContent = 'login Failed';
			info.style.color = 'red';
		});

		//登录成功
		this.socket.on('loginSuccess', function () {
			// document.title = 'KChat | ' + document.getElementById('nicknameInput').value;
			// document.getElementById('loginWrapper').style.display = 'none';
			document.getElementById('input_text').focus();
		});

		//系统人数更新，提示用户新加入或离开
		this.socket.on('system', function (nickname, count, type) {
			that._systemInfo(nickname, count, type);
		});

		// 收到群发新消息
		this.socket.on('newMsg', function (nickname, msg) {
			that._displayNewMsg(nickname, msg, 'newMsg');
			// alert(nickname + ': ' + msg);
		});

		// 接收私聊信息
		this.socket.on('receive private message', function (data) {
			that._displayNewMsg("", data, 'newMsg');
		});
		// this.socket.on('receive private message', function (data) {
		// 	if (data.addresser == data.recipient) return;
		// 	that._displayNewMsg(data.addresser, data.body, 'newMsg');
		// });

		this.socket.on('paired user is offline', function (data) {
			alert('your paired user is offline');

		});

		//设置登陆按钮和nicknameInput的监听事件(click&keyup)login
		var tutor_id = document.getElementById("hide_tid").textContent;
		console.log('tutor_id', tutor_id);
		console.log("222");
		document.getElementById('loginBtn').addEventListener('click', function () {
			// 	var nickname = document.getElementById('nicknameInput').value.trim();
			// 	var info = document.getElementById('info');
			// 	var nicknameInput = document.getElementById('nicknameInput');

			console.log("333");
			var tutor_id = document.getElementById("hide_tid").textContent;
			console.log('in kchat, tutor_id', tutor_id);
			if (tutor_id == '') {
				alert('in kchat, paired user unvalid');
				return;
			}
			var nickname = document.getElementById("hide_uid").textContent;
			console.log('in kchat, nickname', nickname);
			that.socket.emit('login', nickname);

			console.log("after server nickname");
			// 	if (nickname.length == 0 || nickname.length > 10) {
			// 		//如果用户名为空或超出长度限制
			// 		info.textContent = 'nickname illegal, try another :)';
			// 		info.style.color = 'red';
			// 		nicknameInput.value = '';
			// 		nicknameInput.focus();
			// 	} else {
			// 		//用户名合法
			// 		that.socket.emit('login', nickname);

			// 	}
		}, false);

		// document.getElementById('nicknameInput').addEventListener('keyup', function (e) {
		// 	if (e.keyCode == 13) {
		// 		var nicknameInput = document.getElementById('nicknameInput');
		// 		var nickname = nicknameInput.value.trim();
		// 		var info = document.getElementById('info');


		// 		if (nickname.length == 0 || nickname.length > 10) {
		// 			//如果用户名为空或超出长度限制
		// 			info.textContent = 'nickname illegal, try another :)';
		// 			info.style.color = 'red';
		// 			nicknameInput.value = '';
		// 			nicknameInput.focus();
		// 		} else {
		// 			//用户名合法
		// 			that.socket.emit('login', nickname);
		// 		}
		// 	}
		// }, false);


		//发送按钮和input_text监听事件
		document.getElementById('input_button').addEventListener('click', function () {
			//1.获取用户输入
			//2.检测是否超出长度限制
			//3.通过检测则直接广播
			var nickname = document.getElementById("hide_uid").textContent;
			var input_text = document.getElementById('input_text');
			alert("onclick");
			var msg = input_text.value.replace('\n', '');
			if (msg == '') {
				input_text.focus();
				return;
			}

			if (msg.length > 15) {
				alert('The message length is up to 15 words');
				input_text.focus();
			} else {
				// that.socket.emit('msgSend', msg);
				alert("onclick");
				var req = {
					'addresser': nickname,
					'recipient': tutor_id,
					'body': msg
				};
				that.socket.emit('send private message', req);
				input_text.value = '';
				input_text.focus();
				that._displayNewMsg('', msg, 'myMsg');
			}
		}, false);

		document.getElementById('input_text').addEventListener('keyup', function (e) {
			var nickname = document.getElementById("hide_uid").textContent;
			// alert("nickname : " + nickname);
			alert("keyup");

			if (e.keyCode == 13) {
				alert("nickname : " + nickname);
				alert("tutor_id: " + tutor_id);

				var input_text = document.getElementById('input_text');
				input_text.value = input_text.value.replace('\n', '');
				var msg = input_text.value.replace('\n', '');
				if (msg == '') {
					input_text.focus();
					return;
				}

				if (msg.length > 15) {
					alert('The message length is up to 15 words');
					input_text.focus();
				}
				// else {
				// 	that.socket.emit('msgSend', msg);
				// 	input_text.value = '';
				// 	input_text.focus();
				// 	that._displayNewMsg('', msg, 'myMsg');
				// }
				else {
					// var req = nickname + tutor_id + msg;
					//alert(req[0] + ' ' + req[1] + ' ' + req[2]);
					var req = {
						'addresser': nickname,
						'recipient': tutor_id,
						'body': msg
					};
					that.socket.emit('send private message', req);
					input_text.value = '';
					input_text.focus();
					that._displayNewMsg('', msg, 'myMsg');
				}
			}
		}, false);


	},

	_displayNewMsg: function (nickname, msg, who) {
		console.log("111");
		var history = document.getElementById('history');

		var p = document.createElement('p');
		p.setAttribute('class', who);
		if (who == 'myMsg')
			p.style.textAlign = 'right';
		console.log("222");

		var span_nickname = document.createElement('span');
		span_nickname.setAttribute('class', 'nickname');
		span_nickname.textContent = nickname;
		console.log("333");

		var span_timespan = document.createElement('span');
		span_timespan.setAttribute('class', 'timespan');
		var time = '(' + new Date().toTimeString().substr(0, 8) + ')';
		span_timespan.textContent = time;
		console.log("444");

		var text = document.createTextNode(msg);

		p.appendChild(span_nickname);
		p.appendChild(span_timespan);
		p.appendChild(text);
		console.log("555");

		history.appendChild(p);

		history.style.overflowY = "scroll";
		//控制滚动条自动滚到底部
		history.scrollTop = history.scrollHeight;
		console.log("after display");
	},

	_systemInfo: function (nickname, count, type) {

		var history = document.getElementById('history');
		history.style.overflowY = "scroll";
		// <p class="system"><span class="nickname">kyrieliu</span>加入了群聊</p>
		var p = document.createElement('p');
		var span = document.createElement('span');
		var text;
		if (type == 'login') {
			text = document.createTextNode(' is online');
		} else if (type == 'logout') {
			text = document.createTextNode(' has leaved');
		}

		p.setAttribute('class', 'system');
		span.setAttribute('class', 'nickname');
		span.textContent = tutor_name;

		p.appendChild(span);
		p.appendChild(text);


		history.appendChild(p);
	}

};