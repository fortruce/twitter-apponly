var request = require('request'),
	urlencode = require('urlencode'),
  url = require('url'),
  qs = require('querystring'),
	Promise = require('promise');

function Twitter(o) {
  this.consumer_key = o.consumer_key;
  this.consumer_secret = o.consumer_secret;
  this.bearer_url = o.bearer_url;
  this.api_base = o.api_base;
 
  this._generateCredentials();
  this.bearer_token = this._getBearerToken();
  
  this.bearer_token.done(null, function (err) {
    throw new Error(err);
  });
}
 
Twitter.prototype._generateCredentials = function() {
	this.bearer_token_credentials = [urlencode(this.consumer_key), urlencode(this.consumer_secret)].join(':');
  this.bearer_token_credentials = new Buffer(this.bearer_token_credentials).toString('base64');
};
 
Twitter.prototype._getBearerToken = function() {
  var opts = {
    url: this.bearer_url,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Authorization': 'Basic ' + this.bearer_token_credentials
    },
    body: 'grant_type=client_credentials'
  };
 
  return new Promise(function (fulfill, reject) {
  	request.post(opts, function(err, resp, body) {
  		if (err) {
        reject(err);
      }

  		if (resp.statusCode === 200 && body) {
  			body = JSON.parse(body);
  			fulfill(body.access_token);
  			return;
  		}

  		reject(new Error('Failed to acquire bearer token: ' + body));
  	});
  });
};

Twitter.prototype._buildEndpoint = function(endpoint, params) {
  var u = url.resolve(this.api_base, endpoint);
  return u + '.json?' + qs.encode(params);
};

Twitter.prototype.get = function (endpoint, params) {
  return new Promise(function(fulfill, reject) {
    this.bearer_token.then(function (bearer_token) {
      var u = this._buildEndpoint(endpoint, params);
      var opts = {
        url: this._buildEndpoint(endpoint, params),
        headers: {
          'Authorization': 'Bearer' + bearer_token
        }
      };

      request.get(opts, function(err, resp, body) {
        if (err) {
          reject(err);
        }

        if (resp.statusCode === 200) {
          body = JSON.parse(body);
          fulfill(body);
          return;
        }

        reject(new Error('Status: ' + resp.statusCode + '\n' + body.toString()));
      });
    }.bind(this), reject);
  }.bind(this));
}; 

module.exports = Twitter;