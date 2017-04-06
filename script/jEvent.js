;(function(window, undefined) {
	var jEventUtil = {
		addHandler: function(element, type, handler) {
			if (element.addEventListener) {
				element.addEventListener(type, handler, false);
			} else if (element.attachEvent) {
				element.attachEvent("on" + type, handler);
			} else {
				element["on" + type] = handler;
			}
		},
		removeHandler: function(element, type, handler) {
			if (element.removeEventListener) {
				element.removeEventListener(type, handler, false);
			} else if (element.detachEvent) {
				element.detachEvent("on" + type, handler);
			} else {
				element["on" + type] = null;
			}
		},
		getEvent: function(event) {
			return event ? event : window.event;
		},
		getTarget: function(event) {
			var e = this.getEvent(event);
			return e.target || e.srcElement;
		},
		preventDefault: function(event) {
			var e = this.getEvent(event);
			if (e.preventDefault()) {
				e.preventDefault();
			} else {
				e.returnValue = false;
			}
		},
		stopPropagation: function(event) {
			var e = this.getEvent(event);
			if (e.stopPropagation) {
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
			}
		},
		getRelatedTarget: function(event) {
			var e = this.getEvent(event);
			if (e.relatedTarget) {
				return e.relatedTarget;
			} else if (e.toElement) {
				return e.toElement;
			} else if (e.fromElement) {
				return e.fromElement;
			} else {
				return null;
			}
		},
		getButton: function(event) {
			var e = this.getEvent(event);
			if (document.implementation.hasFeature("MouseEvents", "2.0")) {
				return e.button;
			} else {
				switch (e.button) {
					case 0:
					case 1:
					case 3:
					case 5:
					case 7:
						return 0;
					case 2:
					case 6:
						return 2;
					case 4:
						return 1;
				}
			}
		},
		getWheelDelta: function(event) {
			var e = this.getEvent(event);
			if (e.wheelDelta) {
				return (client.engine.opera && client.engine.opera < 9.5 ? -e.wheelDelta : e.wheelDelta);
			} else {
				return -e.detail * 40;
			}
		},
		getCharCode: function(event) {
			var e = this.getEvent(event);
			if (typeof e.charCode === "number") {
				return event.charCode;
			} else {
				return e.keyCode;
			}
		}
	}
	window.jEventUtil = jEventUtil;
	// export {jEventUtil};
})(window)