if(!window.bayeux) {
	window.bayeux = { };
}

bayeux.ConnectionError = function(message) {
	Error.call(this, message);
};

bayeux.ConnectionError.prototype = new Error();
