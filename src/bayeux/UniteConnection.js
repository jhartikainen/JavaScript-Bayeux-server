if(!window.bayeux) {
	window.bayeux = { };
}

/**
 * Opera Unite specific connection adapter
 *
 * Known issues:
 * - Supports only long polling and non-crossdomain requests
 *
 * @param {WebServerConnection} connection
 */
bayeux.UniteConnection = function(connection) {
	this._connection = connection;
};

bayeux.UniteConnection.prototype = {
	/**
	 * Set the response to this connection's message
	 * @param {bayeux.Message} response
	 */
	setResponse: function(response) {
		this._response = response;
	},

	/**
	 * Send messages over this connection
	 * @param {Array} messages Array of bayeux.Message to send
	 */
	sendMessages: function(messages) {
		var response = this._connection.response;
		if(!response || response.closed) {
			return;
		}

		response.setResponseHeader('Content-Type', 'application/json');
		
		if(this._response) {
			messages.push(this._response);
		}

		var jsonData = messages.map(function(message) {
			return message.toJson();
		});

		var responseData = '[' + jsonData.join(',') + ']';
		response.write(responseData);
		response.flush();
		response.close();
	},

	/**
	 * Process the requests parameters to find bayeux message data
	 * @return {String}
	 */
	getData: function() {
		var req = this._connection.request;

		if(!req.body) {
			return decodeURIComponent(req.bodyItems['message'][0]);
		}

		var body = req.body;
		if(body.indexOf('message=') === 0) {
			//Remove the message= part
			body = body.substr(8);
		}

		return body;
	}
};
