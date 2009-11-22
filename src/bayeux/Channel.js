if(!window.bayeux) {
	window.bayeux = { };
}

bayeux.Channel = function(server) {
	this._server = server;
};

bayeux.Channel.prototype = {
	_subscribers: [],

	processMessage: function(message) { 
	
	},

	subscribe: function(client) {
		this._subscribers.push(client);   
	},
}
