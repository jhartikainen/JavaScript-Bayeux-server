if(!window.bayeux) {
	window.bayeux = { };
}

/**
 * Bayeux Message
 * @param {Object} data
 * @constructor
 */
bayeux.Message = function(data) {
	this._data = data;
	for(var key in data) {
		this[key] = data[key];
	}
};

bayeux.Message.prototype = {
	/**
	 * Get the channel as array
	 * @return {Array}
	 */
	getChannel: function() {
		return this.channel.substr(1).split(/\//g);
	},

	/**
	 * Convert to JSON
	 * @return {String}
	 */
	toJson: function() {
		return JSON.stringify(this._data);
	}
};

/**
 * Create messages from JSON array
 * @param {String} json
 * @return {Array}
 * @static
 */
bayeux.Message.fromJson = function(json) {
	var data = JSON.parse(json);
	var messages = [];
	for(var i = 0; i < data.length; i++) {
		messages.push(new bayeux.Message(data[i]));
	}

	return messages;
};
