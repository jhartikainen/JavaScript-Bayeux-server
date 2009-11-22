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
	/**
	 * Add a connection for sending messages
	 * @param {bayeux.UniteConnection} connection
	 */
	addConnection: function(connection) {
		this._connections.push(connection);
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
	 * Attempts to flush messages through a connection
	 */
	flushMessages: function() {
		var conn = this._connections.pop();
		conn.sendMessages(this._messageQueue);
		this._messageQueue = [];
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
