if(!window.bayeux) {
	window.bayeux = { };
}

/**
 * Bayeux protocol /meta channel implementation
 *
 * Known unsupported protocol features:
 * - Subscriptions to multiple channels with single message
 * - Any other protocol than long-polling
 * - Disconnections are always succesful
 *
 * @param {bayeux.CometdServer} server
 */
bayeux.MetaChannel = function(server) {
	this._server = server;
};

bayeux.MetaChannel.prototype = {
	processMessage: function(message) {
		var channel = message.getChannel();

		var handler = '_' + channel[1] + 'Handler';
		if(!this[handler]) {
			opera.postError('Meta channel: ' + channel[1]);
			return;
		}

		//All meta channel requests except handshake need client id
		if(channel[1] != 'handshake' && !message.clientId) {
			throw new bayeux.ChannelError(401);
		}
		
		return this[handler](message);
	},
	
	_subscribeHandler: function(message) {
		var client = this._server.getClient(message.clientId);
		if(!client) {
			throw new bayeux.ChannelError(402, message.clientId);
		}

		if(!this._server.subscribe(client, message.subscription.substr(1).split(/\//g))) {
			throw new bayeux.ChannelError(404, message.subscription);
		}

		return new bayeux.Message({
			channel: '/meta/subscribe',
			clientId: message.clientId,
			successful: true,
			subscription: message.subscription
		});
	},

	_connectHandler: function(message) {
		var client = this._server.getClient(message.clientId);
		if(!client) {
			throw new bayeux.ChannelError(402, message.clientId);
		}

		this._server.clientConnected(client);

		return new bayeux.Message({
			channel: '/meta/connect',
			successful: true,
			clientId: message.clientId,
			advice: {
				reconnect: 'retry'
			}
		});
	},

	_disconnectHandler: function(message) {
		this._server.disconnect(message.clientId);
		return new bayeux.Message({
			channel: '/meta/disconnect',
			successful: true,
			clientId: message.clientId,
			advice: {
				reconnect: 'handshake'
			}
		});
	},

	_handshakeHandler: function(message) {
		var spec = {
			channel: '/meta/handshake',
			version: '1.0',
			clientId: this._generateClientId(),
			successful: true,
			supportedConnectionTypes: ['long-polling'],
			advice: {
				reconnect: 'none'
			}
		};

		if(message.id) {
			spec.id = message.id;
		}

		this._server.registerClientId(spec.clientId);
		return new bayeux.Message(spec);
	},

	_generateClientId: function() {
		var id = '' + (new Date()).getTime();
		id += ''+ Math.random();
		id += ''+ Math.random();
		return id.replace(/\./g, '');
	}
};
