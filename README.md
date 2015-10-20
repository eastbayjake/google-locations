[![build status](https://secure.travis-ci.org/eastbayjake/google-locations.png)](http://travis-ci.org/eastbayjake/google-locations)
# google-locations

Google Places + Google Geocoding API module for [node.js](http://nodejs.org). Supports basic functions on the Google Places API -- search, autocomplete, and details -- as well as geocoding and reverse geocoding capabilities with the Google Geocoding API. It also contains two convenience methods, searchByAddress and searchByPhone, that allow users to retrieve Place details by address or phone number.

This module requires a valid Google API key and enabled access for Google Places and/or Google Geocoding. Check out the [Google Places API docs](http://code.google.com/apis/maps/documentation/places/) or [Google Geocoding API docs](http://code.google.com/apis/maps/documentation/geocode/) for more information. Please note that searchByAddress uses the Geocoding API and searchByPhone uses the /place/textsearch endpoint which counts as 10 requests toward your daily quota.

This is a fork of the [node-google-places](https://www.npmjs.org/package/google-places) module which appears to no longer be actively maintained. Please feel free to submit pull requests for features and additional test coverage!

## Install

```
npm install google-locations
```

## Methods

### search(options, callback)
This method makes requests to the /place/nearbysearch endpoint. Any supported query parameter/value for that endpoint is a valid key/value for the options object.

### autocomplete(options, callback)
This method makes requests to the /place/autocomplete endpoint. Any supported query parameter/value for that endpoint is a valid key/value for the options object.

### details(options, callback)
This method makes requests to the /place/details endpoint. It requires a placeid parameter, but any supported query parameter/value for that endpoint is a valid key/value for the options object.

### searchByAddress(options, callback)
This method lets you query for Google Place details by address and location name. It is a convenience wrapper that geocodes an address, does a place search for matching names near that geocoordinate, then does follow-up detail requests for each result in search, up to a specified limit. The only mandatory parameter is address. If rankby is 'distance', name must be specified. If rankby is 'prominence', radius must be specified. If rankby is not specified, it will default to 'distance' and therefore name will be required. The most reliable practice is to specify both an address and name. The number of detail requests is limited by the 'maxResults' parameter: if maxResults isn't specified it will default to 1, but maxResults will automatically never be greater than the number of results returned by a search request.

### searchByPhone(options, callback)
This method lets you query for Google Place details by phone number. 'phone' is a required parameter. If 'maxResults' isn't specified it will default to 1, only returning details about the top result in search. **NOTE:** This method uses the Google Places API's /place/textsearch endpoint, so each request counts as **10 requests** toward your daily quota!

## Usage
```js
var GoogleLocations = require('google-locations');

var locations = new GoogleLocations('YOUR_API_KEY');

locations.search({keyword: 'Google', location: [37.42291810, -122.08542120]}, function(err, response) {
  console.log("search: ", response.results);

  locations.details({placeid: response.results[0].place_id}, function(err, response) {
    console.log("search details: ", response.result.name);
    // search details: Google
  });
});

locations.autocomplete({input: 'Verm', types: "(cities)"}, function(err, response) {
  console.log("autocomplete: ", response.predictions);

  var success = function(err, response) {
    console.log("did you mean: ", response.result.name);
    // did you mean:  Vermont
    // did you mean:  Vermont South
    // did you mean:  Vermilion
    // did you mean:  Vermillion
  };

  for(var index in response.predictions) {
    locations.details({placeid: response.predictions[index].place_id}, success);
  }
});

locations.searchByAddress({address: '1600 Amphitheatre Pkwy, Mountain View, CA', name: 'Goo', maxResults: 2, rankby: "prominence", radius: 5000}, function(err, response){
  for (var index in response.details) {
    console.log("Potential Match: " + response.details[index].name);
    // Potential Match: Google
    // Potential Match: Gooey Cookie Factory
  }
  for (var index in response.errors) {
    console.log("Error looking up place details: ", response.errors[index]);
  }
});

locations.searchByPhone({phone: "(650) 253-0000"}, maxResults: 2, function(err, response){
  // Returns up to 2 matches for this phone number
});
```

## Test

To test simply install development dependencies and run:

```vows test/* --spec```
