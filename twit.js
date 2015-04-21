var urlencode = require('urlencode'),
    url = require('url'),
    qs = require('querystring'),
    Promise = require('bluebird'),
    request = Promise.promisifyAll(require('request'));

var API_BASE = 'https://api.twitter.com/1.1/';
var BEARER_ENDPOINT = 'https://api.twitter.com/oauth2/token';

function TwitterError(errors) {
  this.name = 'TwitterError';
  this.message = '';
  errors.forEach(function (err) {
    this.message += err.code + ': ' + err.message + '\n';
  }.bind(this));
}
TwitterError.prototype = Object.create(Error.prototype);
TwitterError.prototype.constructor = TwitterError;

function generateCredentials(key, secret) {
  var c = [urlencode(key), urlencode(secret)].join(':');
  return new Buffer(c).toString('base64');
}

function buildEndpoint (endpoint, params) {
  var u = url.resolve(API_BASE, endpoint);
  return u + '.json?' + qs.encode(params);
};

/**
 * Returns a function that calls callback on successful api response.
 * Throws TwitterError on api failure.
 * @param  {Function} Optional callback to be called on successful api data.
 *                    If no callback, handler function returns the api body.
 * @return {Function}
 */
function handleTwitterResponse(cb) {
  return function (r) {
    var resp = r[0];
    var body = r[1];

    body = JSON.parse(body);

    if (resp.statusCode === 200) {
      return cb ? cb(body) : body;
    }

    throw new TwitterError(body.errors);
  }
}

function getBearerToken (credentials) {
  var opts = {
    url: BEARER_ENDPOINT,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Authorization': 'Basic ' + credentials
    },
    body: 'grant_type=client_credentials'
  };

  return request.postAsync(opts)
  .then(handleTwitterResponse(function (body) {
    return body.access_token;
  }));
};

function Twitter(consumer_key, consumer_secret) {
  var credentials = generateCredentials(consumer_key, consumer_secret);
  this.token = getBearerToken(credentials);
}

/**
 * Returns a function that expects a bearer_token and exectues an api request to the endpoint with params.
 * @param  {String} Twitter api endpoint to query.
 * @param  {Object} Params to send to the Api Endpoint.
 * @return {Function} Function that expects a bearer_token and executes an authenticated api rquest. 
 */
Twitter.prototype._request = function(endpoint, params) {
  var u = buildEndpoint(endpoint, params);

  return function (token) {
    var opts = {
      url: u,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    };

    return request.getAsync(opts)
                  .then(handleTwitterResponse());
  }
}

Twitter.prototype.get = function (endpoint, params) {
  return this.token.then(this._request(endpoint, params));
}; 

module.exports = Twitter;
