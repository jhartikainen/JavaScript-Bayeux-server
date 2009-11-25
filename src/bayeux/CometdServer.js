if(!window.bayeux) {
	window.bayeux = { };
}

/**
 * Bayeux server
 * @constructor
 */
bayeux.CometdServer = function() {
	this._channels.meta = new bayeux.MetaChannel(this);
};

bayeux.CometdServer.prototype = {
	/**
	 * List of channels
	 * @type {Object}
	 */
	_channels: {
	},

	/**
	 * List of clients
	 * @type {Array}
	 */
	_clients: [],

	/**
	 * Process a message
	 * @param {bayeux.UniteConnection} connection
	 * @param {bayeux.Message} message
	 * @return {bayeux.Message} response message
	 */
	processMessage: function(connection, message) {
		var channel = message.getChannel();

		try {
			this._channels[channel[0]].processMessage(connection, message);
		}
		catch(error) {
			if(error instanceof bayeux.ChannelError) {
				response = new bayeux.Message({
					channel: message.channel,
					successful: false,
					clientId: message.clientId,
					error: this._errorMessageFromCode(error.code, error.data)
				});

				connection.sendMessages([response]);
			}
			else {
				throw error;
			}
		}
	},

	/**
	 * Get any messages from a new connection and associate it with a client
	 * @param {bayeux.UniteConnection} connection
	 */
	newConnection: function(connection) {
		var messages = bayeux.Message.fromJson(connection.getData());
		if(messages.length < 1) {
			return;
		}

		for(var i = 0; i < messages.length; i++) {
			this.processMessage(connection, messages[i]);
		}
	},

	/**
	 * Goes through all clients and sends any queued messages per queuestrategy used
	 */
	sendQueuedMessages: function() {
		this._clients.forEach(function(client){
			if(client.getQueueLength() > 0 && client.canFlush()) {
				opera.postError('Flushing...');
				client.flushMessages();
			}
		});
	},

	/**
	 * Register a channel
	 * @param {String} name the base name of the channel
	 * @param {bayeux.Channel} channel
	 */
	registerChannel: function(name, channel) {
		this._channels[name] = channel;
		return true;
	},

	/**
	 * Return client by ID
	 * @return {bayeux.Client}
	 */
	getClient: function(id) {
		var clients = this._clients.filter(function(client){
			return client.getId() == id;
		});

		if(clients.length != 1) {
			return null;
		}

		return clients[0];
	},

	/**
	 * Subscribe a client to a channel
	 * @param {bayeux.Client} client
	 * @param {Array} channel channel definition
	 * @return {Boolean} true if ok, false if channel wasn't found
	 */
	subscribe: function(client, channel) {
		if(!this._channels[channel[0]]) {
			return false;
		}

		this._channels[channel[0]].subscribe(client);
		return true;
	},

	/**
	 * Register a new client with a specific ID
	 * @param {String} id
	 */
	registerClientId: function(id) {
		this._clients.push(new bayeux.Client(id, this));
	},

	/**
	 * Disconnect a client by id
	 * @param {String} clientId
	 * @return {Boolean} success?
	 */
	disconnect: function(clientId) {
		var client = this.getClient(clientId);
		if(!client) {
			return false;
		}

		this._clients.splice(this._clients.indexOf(client), 1);
		return true;
	},

	clientConnected: function(client) {
		client.setState('connected');

		if(this.onClientConnect) {
			this.onClientConnect(client);
		}
	},

	/**
	 * Event handler which is fired when a client has succesfully connected
	 * @param {bayeux.Client} client
	 */
	onClientConnect: null,

	_errorMessageFromCode: function(code, data) {
		switch(code) {
			case 401:
				return '401::No Client ID';

			case 402:
				return '402:' + data + ':Unknown Client ID';

			case 404:
				return '404:' + data + ':Unknown Channel';

			default:
				//Not per spec. What's the generic error code?
				return '400:' + data + ':Unknown error (' + code + ')';
		}
	}
};
