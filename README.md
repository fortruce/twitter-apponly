Twit
================

This is a simple wrapper around the Twitter api that utilizes Application Only Auth. It
currently only supports `GET` requests against the api. All requests return a Promise that
fulfills on `resp.statusCode === 200` and rejects otherwise.

USAGE
-----

Create a client using OAuth 2.

```
var TwitterAppOnly = require('twitter-apponly');

var consumer_key = '';
var consumer_secret = '';

var client = new TwitterAppOnly(consumer_key, consumer_secret);
```

Make requests.

```
// query the twitter search api for #javascript hashtagged tweets
var resp = client.get('search/tweets', {q: '#javascript'});
resp.then(function (tweets) {
	tweets.statuses.forEach(function (tweet) {
		console.log(tweet.text);
	});
});
```