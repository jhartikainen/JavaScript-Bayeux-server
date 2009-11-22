if(!window.bayeux) {
	window.bayeux = { };
}

bayeux.Client = function(id, server) {
	this._id = id;
	this._server = server;
};

bayeux.Client.prototype = {
	getId: function() {
		return this._id;
	},

	setState: function(state) {
		this._state = state;
	},

	getState: function() {
		return this._state;
	}
}
