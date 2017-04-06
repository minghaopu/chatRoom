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
			var _socket = io.connect();
			var _isLogged = false;
			var _nickname = "";
			const event = window.jEventUtil;

			const _displayImage = function(user, imgData) {
				let msgToDisplay = document.createElement("p");
				let container = dom("msgs");
				let date = new Date().toTimeString().substr(0, 8);
				let str = `<span class='${userClassStyle}'>${user}</span><span class='timespan'>(${date}): /span>${msg}`;
				console.log(str)
				msgToDisplay.innerHTML = str;
        		container.appendChild(msgToDisplay);
        		container.scrollTop = container.scrollHeight;
			};
			const _initialEmoji = function() {
				let docFragment = document.createDocumentFragment();
				for (let i = 69; i > 0; --i) {
					let emojiItem = document.createElement("img");
					emojiItem.src = `./content/emoji/${i}.gif`;
					emojiItem.title = i;
					docFragment.appendChild(emojiItem);
				}
				dom("emojiContainer").appendChild(docFragment);
				docFragment = null;

			};
			const _displayNewMsg = function(user, msg, color) {
				let msgToDisplay = document.createElement("p");
				let container = dom("msgs");
				let date = new Date().toTimeString().substr(0, 8);
				msgToDisplay.style.color = color || "#000";
				let userClassStyle = "default";
				if (user === "system") userClassStyle = "system";

				msg = _showEmoji(msg);
				msgToDisplay.innerHTML = `<span class='${userClassStyle}'>${user}</span><span class='timespan'>(${date}):</span>${msg}`;
				container.appendChild(msgToDisplay);
				container.scrollTop = container.scrollHeight;
				msgToDisplay = container = null;
			};
			const _showEmoji = function(msg) {
				const reg = /\[emoji:\d+\]/g;
				const emojis = dom('emojiContainer').children;
				let emojiIndex = null, match = null, result = msg;
				let totalEmojiNum = emojis.length;
				while (match = reg.exec(msg)) {
					emojiIndex = match[0].slice(7, -1);
					if (emojiIndex > totalEmojiNum) {
						result = result.replace(match[0], '[X]');
					} else {
						result = result.replace(match[0], '<img class="emoji" src="${emojis[emojiIndex]}" />');
					}
				}
				return result;
			};

			const dom = (id) => document.getElementById(id);

			const addClass = function(ele, className) {
				let classStr = ele.getAttribute("class");
				if (classStr.indexOf(className) === -1) {
					ele.setAttribute("class", classStr + " " + className);
				}
				console.log(ele.getAttribute("class"));
			};

			const removeClass = function(
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
				dom("loginStatus").textContent = "Create a nickname";
				// dom("loginSection").setAttribute("class", "hidden");
				removeClass(dom("loginSection"), "hidden");
				dom("nicknameInput").focus();
			});

			_socket.on("nicknameExist", function() {
				dom("loginStatus").textContent = "Nickname is already existed";
			});

			_socket.on("loginSuccess", function() {
				_isLogged = true;
				_nickname = dom("nicknameInput").value;
				document.title = "Chat | " + _nickname;
				addClass(dom("loginSection"), "hidden");
			});

			_socket.on("error", function(err) {
				if (_isLogged) {
					dom("status").textContent = "fail to connect";
				} else {
					dom("loginStatus").textContent = "fail to connect";
				}
				_isLogged = false;
				_nickname = "";
			});

			_socket.on("system", function(nickname, userCount, type) {
				var msg = nickname + (type === "login" ? " joined" : " left");
				_displayNewMsg("system", msg, "red")
			});

			_socket.on("newMsg", (user, msg, color) => _displayNewMsg(user, msg, color));
			_socket.on("newImg", (user, img, color) => _displayImage(user, img, color));

			event.addHandler(dom("loginBtn"), "click", function(e) {
				let nickname = dom("nicknameInput").value;
				if (nickname.trim().length !== 0) {
					_socket.emit("login", nickname);
				} else {
					dom("nicknameInput").focus();
				}
			});

			event.addHandler(dom("sendBtn"), "click", function(e) {
				let input = dom("msgInput");
				let msg = input.value;
				let color = dom("colorControl").value;
				input.value = "";
				input = null;
				if (msg.trim().length !== 0) {
					_socket.emit("postMsg", msg, color);
					_displayNewMsg("me", msg, color);
				}
			});

			event.addHandler(dom("nicknameInput"), "keyup", function(e) {
				if (event.getEvent(e).keyCode === 13) {
					let nickname = dom("nicknameInput").value;
					if (nickname.trim().length !== 0) {
						_socket.emit("login", nickname);
					}
				}
			});
			event.addHandler(dom("clearBtn"), "click", function(e) {
				dom("msgs").innerHTML = "";
			})

			event.addHandler(dom("sendImage"), "change", function(e) {

				if (this.files.length !== 0) {
					let file = this.files[0];
					let reader = new FileReader();
					let color = dom("colorControl").value;
					if (!reader) {
						_displayNewMsg("system", "browser doesn't support img");
						this.value = "";
					}
					event.addHandler(reader, "load", function(e) {
						let target = event.getTarget(e);
						this.value = "";
						_socket.emit("img", reader.result, color);
						_displayNewMsg("me", reader.result, color);
					})
					reader.readAsDataURL(file);
				}
			})

			_initialEmoji();

			event.addHandler(dom("emojiBtn"), "click", function(e) {
				removeClass(dom("emojiContainer"), "hidden");
				event.stopPropagation();
			})

			event.addHandler(document.body, "click", function(e) {
				if (event.getTarget(e) !== dom('emojiContainer')) {
					addClass(dom("emojiContainer"), "hidden");
				}
			})
		}
	}
	window.onload = function() {
		let app = new Chat();
		window.app = app;
	}
})(window)