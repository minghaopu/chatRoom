;
(function(window, undefined) {
	// import {io}
	// import {event} from "./jEvent";
	// export default class Chat {
	
	// const io = {
	// 	connect: function() {
	// 		return {
	// 			on: function() {}
	// 		}
	// 	}
	// }
	class Chat {
		constructor() {
			var _socket = io.connect("http://localhost:3000");
			var _isLogged = false;
			var _nickname = "";
			const event = window.jEventUtil;

			const _displayImage = function(user, imgData) {
				let msgToDisplay = document.createElement("p");
				let container = _dom("msgs");
				let date = new Date().toTimeString().substr(0, 8);
				let userClassStyle = "default";
				if (user === "system") userClassStyle = "system";

				let str = `<span class='${userClassStyle}'>${user}</span><span class='timespan'>(${date}): </span><br/><img class="img-chat" src="${imgData}"" />`;
				msgToDisplay.innerHTML = str;
        		container.appendChild(msgToDisplay);
        		setTimeout(function() {
        			container.scrollTop = container.scrollHeight;
        			msgToDisplay = container = null;
        		}, 0)
          		
			};
			const _initialEmoji = function() {
				let docFragment = document.createDocumentFragment();
				for (let i = 69; i > 0; --i) {
					let emojiItem = document.createElement("img");
					emojiItem.src = `./content/emoji/${i}.gif`;
					emojiItem.title = i;
					docFragment.appendChild(emojiItem);
				}
				_dom("emojiContainer").appendChild(docFragment);
				docFragment = null;

			};
			const _displayNewMsg = function(user, msg, color) {
				let msgToDisplay = document.createElement("p");
				let container = _dom("msgs");
				let date = new Date().toTimeString().substr(0, 8);
				msgToDisplay.style.color = color || "#000";
				let userClassStyle = "default";
				if (user === "system") userClassStyle = "system";

				msg = _showEmoji(msg);
				msgToDisplay.innerHTML = `<span class='${userClassStyle}'>${user}</span><span class='timespan'>(${date}): </span>${msg}`;
				container.appendChild(msgToDisplay);
				container.scrollTop = container.scrollHeight;
				msgToDisplay = container = null;
			};
			const _showEmoji = function(msg) {
				const reg = /\[emoji:\d+\]/g;
				const emojiContainer = _dom('emojiContainer').children;
				let emojiIndex = null, match = null, result = msg;
				let totalEmojiNum = emojiContainer.length;
				while (match = reg.exec(msg)) {
					emojiIndex = match[0].slice(7, -1);
					if (emojiIndex > totalEmojiNum) {
						result = result.replace(match[0], '[X]');
					} else {
						result = result.replace(match[0], `<img class="emoji" src="content/emoji/${emojiIndex}.gif" />`);
					}
				}
				return result;
			};

			const _dom = (id) => document.getElementById(id);

			const _addClass = function(ele, className) {
				let classStr = ele.getAttribute("class");
				if (classStr.indexOf(className) === -1) {
					ele.setAttribute("class", classStr + " " + className);
				}
			};

			const _removeClass = function(
				ele, className) {
				let classStr = ele.getAttribute("class");
				if (classStr.indexOf(className) !== -1) {
					var newStr = classStr.split(" ").filter((item, idx) => {
						return item !== className;
					}).join(" ");
					ele.setAttribute("class", newStr);
				}
			};

			_socket.on("connect", function() {
				// const getDom = document.getElementById;
				_dom("loginStatus").textContent = "Create a nickname";
				// _dom("loginSection").setAttribute("class", "hidden");
				_removeClass(_dom("loginSection"), "hidden");
				_dom("nicknameInput").focus();
			});

			_socket.on("nicknameExist", function() {
				_dom("loginStatus").textContent = "Nickname is already existed";
			});

			_socket.on("loginSuccess", function() {
				_isLogged = true;
				_nickname = _dom("nicknameInput").value;
				document.title = "Chat | " + _nickname;
				_addClass(_dom("loginSection"), "hidden");
			});

			_socket.on("error", function(err) {
				if (_isLogged) {
					_dom("status").textContent = "fail to connect";
				} else {
					_dom("loginStatus").textContent = "fail to connect";
				}
				_isLogged = false;
				_nickname = "";
			});
			_socket.on("disconnect", function(...args) {
				console.log(...args)
			});
			_socket.on("connect_error", function(...args) {
				console.log(...args)
			});

			_socket.on("system", function(nickname, userCount, type) {
				var msg = nickname + (type === "login" ? " joined" : " left");
				_displayNewMsg("system", msg, "red")
			});

			_socket.on("newMsg", (user, msg, color) => _displayNewMsg(user, msg, color));
			_socket.on("newImg", (user, img) => _displayImage(user, img));

			event.addHandler(_dom("loginBtn"), "click", function(e) {
				let nickname = _dom("nicknameInput").value;
				if (nickname.trim().length !== 0) {
					_socket.emit("login", nickname);
				} else {
					_dom("nicknameInput").focus();
				}
			});

			event.addHandler(_dom("sendBtn"), "click", function(e) {
				let input = _dom("msgInput");
				let msg = input.value;
				let color = _dom("colorControl").value;
				input.value = "";
				input = null;
				if (msg.trim().length !== 0) {
					_socket.emit("postMsg", msg, color);
					_displayNewMsg("me", msg, color);
				}
			});

			event.addHandler(_dom("nicknameInput"), "keyup", function(e) {
				if (event.getEvent(e).keyCode === 13) {
					let nickname = _dom("nicknameInput").value;
					if (nickname.trim().length !== 0) {
						_socket.emit("login", nickname);
					}
				}
			});
			event.addHandler(_dom("clearBtn"), "click", function(e) {
				_dom("msgs").innerHTML = "";
			})

			event.addHandler(_dom("sendImage"), "change", function(e) {

				if (this.files.length !== 0) {
					let file = this.files[0];
					let reader = new FileReader();
					let color = _dom("colorControl").value;
					if (!reader) {
						_displayNewMsg("system", "browser doesn't support img");
						this.value = "";
						return;
					}
					event.addHandler(reader, "load", function(e) {
						let target = event.getTarget(e);
						this.value = "";
						_socket.emit("img", reader.result);
						_displayImage("me", reader.result);
					})
					reader.readAsDataURL(file);
				}
			})

			_initialEmoji();

			event.addHandler(_dom("emojiBtn"), "click", function(e) {
				_removeClass(_dom("emojiContainer"), "hidden");
				event.stopPropagation();
			})

			event.addHandler(document.body, "click", function(e) {
				if (event.getTarget(e) !== _dom('emojiContainer')) {
					_addClass(_dom("emojiContainer"), "hidden");
				}
			})
			event.addHandler(_dom("emojiContainer"), "click", function(e) {

				let target =  event.getTarget(e);
				console.log(target)
				if (target.nodeName.toLowerCase() === "img") {
					let msgInput = _dom("msgInput");
					
					msgInput.value = msgInput.value + `[emoji:${target.title}]`;
					msgInput.focus();
					msgInput = null;
				}
			})
		}
	}
	window.onload = function() {
		let app = new Chat();
		window.app = app;
	}
})(window)