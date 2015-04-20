Twit
================

This is a simple wrapper around the Twitter api that utilizes Application Only Auth. It
currently only supports `GET` requests against the api. All requests return a Promise that
fulfills on `resp.statusCode === 200` and rejects otherwise.

USAGE
-----

Create a client using OAuth 2.

```
var keys = {
  consumer_key: '',
  consumer_secret: '',
  api_base: 'https://api.twitter.com/1.1/',
  bearer_url: 'https://api.twitter.com/oauth2/token'
};

var client = new Twit(keys);
```

Make requests.

```
// query the twitter search api for #javascript hashtagged tweets
var promise = client.get('search/tweets', {q: '#javascript'});
promise.then(function (tweets) {
	tweets.forEach(function (tweet) {
		console.log(tweet.text);
	});
});
```