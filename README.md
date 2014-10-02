[![build status](https://secure.travis-ci.org/eastbayjake/google-locations.png)](http://travis-ci.org/eastbayjake/google-locations)
# google-locations

Google Places + Google Geocoding API module for [node.js](http://nodejs.org). Supports basic functions on the Google Places API -- search, autocomplete, and details -- as well as geocoding and reverse geocoding capabilities with the Google Geocoding API. It also contains a convenience method, findPlaceDetailsWithAddress, that allows users to retrieve Place Details with an address search. (The Places API makes users search for places near a latitude/longitude point, so findPlaceDetailsWithAddress handles geocoding an address, finding places near those coordinates, then returning details up to a user-specified limit.)

This module requires a valid Google API key and enabled access for Google Places and/or Google Geocoding. Check out the [Google Places API docs](http://code.google.com/apis/maps/documentation/places/) or [Google Geocoding API docs](http://code.google.com/apis/maps/documentation/geocode/) for more information.

This is a fork of the [node-google-places](https://www.npmjs.org/package/google-places) module which appears to no longer be actively maintained. Please feel free to submit pull requests for features and additional test coverage!

## Install

```
npm install google-locations
```

## Usage
```js
var GoogleLocations = require('google-locations');

var locations = new GoogleLocations('YOUR_API_KEY');

locations.search({keyword: 'Google', location: [37.42291810, -122.08542120]}, function(err, response) {
  console.log("search: ", response.results);

  locations.details({placeid: response.results[0].place_id}, function(err, response) {
    console.log("search details: ", response.result.website);
    // search details:  http://www.vermonster.com/
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

/* The only mandatory parameter is address. If rankby is 'distance', name must be specified. If rankby is 'prominence', radius must be specified. If rankby is not specified, it will default to 'distance' and therefore name will be required. The most reliable practice is to specify both an address and name. If maxResults isn't specified it will default to 1.*/
locations.findPlaceDetailsWithAddress({address: '1600 Amphitheatre Pkwy, Mountain View, CA', name: 'Goo', maxResults: 2, rankby: "prominence", radius: 5000}, function(err, response){
  for (var index in response.details) {
    console.log("Potential Match: " + response.details[index].name);
    // Potential Match: Google
    // Potential Match: Gooey Cookie Factory
  }
  for (var index in response.errors) {
    console.log("Error looking up place details: ", response.errors[index]);
  }
});
```

## Test

To test simply install development dependencies and run:

```vows test/* --spec```
