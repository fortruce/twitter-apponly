var urlencode = require('urlencode'),
    url = require('url'),
    qs = require('querystring'),
    Promise = require('bluebird'),
    request = Promise.promisifyAll(require('request'));

var API_BASE = 'https://api.twitter.com/1.1/';
var BEARER_ENDPOINT = 'https://api.twitter.com/oauth2/token';

function Twitter(consumer_key, consumer_secret) {
  this.consumer_key = consumer_key;
  this.consumer_secret = consumer_secret;

  this._generateCredentials();
  this.bearer_token = this._getBearerToken();
}

Twitter.prototype._generateCredentials = function() {
	this.bearer_token_credentials = [urlencode(this.consumer_key), urlencode(this.consumer_secret)].join(':');
  this.bearer_token_credentials = new Buffer(this.bearer_token_credentials).toString('base64');
};

Twitter.prototype._getBearerToken = function() {
  var opts = {
    url: BEARER_ENDPOINT,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Authorization': 'Basic ' + this.bearer_token_credentials
    },
    body: 'grant_type=client_credentials'
  };

  return request.postAsync(opts)
  .then(function (r) {
    var resp = r[0];
    var body = r[1];
    if (resp.statusCode === 200) {
      body = JSON.parse(body);
      console.log('access:', body.access_token);
      return body.access_token;
    }

    throw new Error('Failed to acquire bearer token: ' + body.toString());
  });
};

Twitter.prototype._buildEndpoint = function(endpoint, params) {
  var u = url.resolve(API_BASE, endpoint);
  return u + '.json?' + qs.encode(params);
};

Twitter.prototype.get = function (endpoint, params) {
  return this.bearer_token.then(function (bearer_token) {
    var u = this._buildEndpoint(endpoint, params);
    var opts = {
      url: this._buildEndpoint(endpoint, params),
      headers: {
        'Authorization': 'Bearer ' + bearer_token
      }
    };

    return request.getAsync(opts)
    .then(function (r) {
      var body = r[1];
      return JSON.parse(body);
    });
  }.bind(this));
}; 

module.exports = Twitter;