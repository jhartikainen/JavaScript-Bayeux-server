if(!window.bayeux) {
	window.bayeux = { };
}

bayeux.Client = function(id, server) {
	this._id = id;
	this._server = server;
	this._connections = [];
	this._messageQueue = [];
};

bayeux.Client.prototype = {
	_timeout: 10000,
	_connectionLost: null,

	/**
	 * Add a connection for sending messages
	 * @param {bayeux.UniteConnection} connection
	 */
	addConnection: function(connection) {
		this._connections.push(connection);
		this._connectionLost = null;
	},
	/**
	 * Queue a message for sending 
	 * @param {bayeux.Message} message
	 */
	queueMessage: function(message) {
		this._messageQueue.push(message);
	},

	/**
	 * Return amount of messages queued for this client
	 * @return {Number}
	 */
	getQueueLength: function() {
		return this._messageQueue.length;
	},

	/**
	 * Is there an active connection or other to push messages to?
	 * @return {Boolean}
	 */
	canFlush: function() {
		return this._connections.length > 0;
	},

	hasTimedOut: function() {
		if(this._connectionLost) {
			var now = new Date();
			return now.getTime() - this._connectionLost.getTime() > this._timeout;
		}

		return false;
	},

	/**
	 * Attempts to flush messages through a connection
	 */
	flushMessages: function() {
		if(this._connections.length === 0) {
			opera.postError('No available connections!');
		}

		var conn = this._connections.pop();
		conn.sendMessages(this._messageQueue);
		this._messageQueue = [];

		//No connections so keep date for timeout calculation
		if(this._connections.length == 0) {
			this._connectionLost = new Date();
		}
	},

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
