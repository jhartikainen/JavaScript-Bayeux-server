if(!window.bayeux) {
	window.bayeux = { };
}

bayeux.ChannelError = function(code, data) {
	this.code = code;
	this.data = data || '';
};

bayeux.ChannelError.prototype = new Error();
