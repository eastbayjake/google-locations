[![build status](https://secure.travis-ci.org/eastbayjake/google-locations.png)](http://travis-ci.org/eastbayjake/google-locations)
# google-locations

Google Places + Google Geocoding API module for [node.js](http://nodejs.org). Supports basic functions on the Google Places API -- search, autocomplete, and details -- as well as geocoding and reverse geocoding capabilities with the Google Geocoding API. Under current development: enter an address and search term (like a business name) and find the closest matching Place Detail by turning the address into a geocode, querying for places near that geocode matching the search term, then looking up the details for the most relevant match in that set.

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
```

## Test

To test simply install development dependencies and run:

`vows test/* --spec`

## License

The MIT License (MIT)

Copyright (C) 2012 Vermonster LLC
Copyright (C) 2014 Jake McGuire

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

