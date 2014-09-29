var https = require('https'),
    _     = require('underscore'),
    url   = require('url');


var GoogleLocations = function(key, options) {
  // Set default options
  if (!options) options = {};
  options = _.defaults(options, {
    format: 'json',
    headers: { "User-Agent": 'Google-Locations (https://www.npmjs.org/package/google-locations)' },
    host: 'maps.googleapis.com',
    port: 443,
    path: '/maps/api/'
  });

  this.config = {
    key: key,
    format: options.format,
    headers: options.headers,
    host: options.host,
    port: options.port,
    path: options.path
  };

  return this;
};

//Google place search
GoogleLocations.prototype.search = function(options, cb) {
  options = _.defaults(options, {
    location: [37.42291810, -122.08542120],
    radius: 10,
    name: 'A',
    language: 'en',
    rankby: 'prominence',
    types: []
  });
  
  options.location = options.location.join(',');

  if (options.types.length > 0) {
    options.types = options.types.join('|');
  } else {
    delete options.types;
  }
  if (options.rankby == 'distance') options.radius = null;
  
  this._makeRequest(this._generateUrl(options, 'place', 'nearbysearch'), cb);
};

GoogleLocations.prototype.autocomplete = function(options, cb) {
  options = _.defaults(options, {
    language: "en",
  });

  this._makeRequest(this._generateUrl(options, 'place', 'autocomplete'), cb);
};

// Goolge place details
GoogleLocations.prototype.details = function(options, cb) {
  if (!options.placeid) return cb({error: 'placeid string required'});
  options = _.defaults(options, {
    // placeid: options.placeid,
    language: 'en'
  });

  this._makeRequest(this._generateUrl(options, 'place', 'details'), cb);
};

GoogleLocations.prototype.geocodeAddress = function(options, cb) {
  if (!options.address) return cb({error: 'Address string required'});
  options = _.defaults(options, {
    language: 'en'
  });

  options.address = options.address.replace(/\s/g, '+');

  this._makeRequest(this._generateUrl(options, 'geocode', null), cb);
};

GoogleLocations.prototype.reverseGeocode = function(options, cb) {
  options = _.defaults(options, {
    latlng: [37.42291810, -122.08542120],
    language: 'en'
  });

  options.latlng = options.latlng.join(',');

  this._makeRequest(this._generateUrl(options, 'geocode', null), cb);
};

GoogleLocations.prototype.findPlaceDetailsWithAddress = function(options, cb) {
  if (!options.address) return cb({error: "Address string required"});
  var _self = this;
  var name;
  if (options.name) {
    name = options.name;
    delete options.name;
  }
  var maxResults = 1;
  if (options.maxResults) {
    maxResults = options.maxResults;
    delete options.maxResults;
  }
  _self.geocodeAddress(options, function(err, result){
    if (err) return cb({message: "Error geocoding address", error: err});
    var location;
    try {
      location = result.results[0].geometry.location;
    } catch (exp) {
      return cb({message: "Malformed results -- try a more specific address", error: exp});
    }
    var query = {location: [location.lat, location.lng], rankby: "prominence", radius: 250};
    if (options.name) query.name = name;
    _self.search(query, function(err, result){
      if (err) return cb({message: "Error searching for places near geocoded location", error: err});
      if (result.results.length === 0) return cb(null, {details: [], errors: []});
      var details = [];
      var errors = [];
      var j = (maxResults > result.results.length) ? result.results.length : maxResults;
      for (var i = 0; i < j; i++) {
        var placeid;
        try {
          placeid = result.results[i].place_id;
          _self.details({placeid: placeid}, function(err, result){
            if (err) {
              errors.push({message: "Error requesting details for placeid " + placeid, error: err});
            } else {
              details.push(result);
            }
            if (details.length + errors.length === j) return cb(null, {details: details, errors: errors});
          });
        } catch (exp) {
          errors.push({message: "No place_id found", error: exp});
          if (details.length + errors.length === j) return cb(null, {details: details, errors: errors});
        }
      }
    });
  });
};

// Run the request
GoogleLocations.prototype._makeRequest = function(request_query, cb) {
  // Pass the requested URL as an object to the get request
  https.get(request_query, function(res) {
      var data = [];
      res
      .on('data', function(chunk) { data.push(chunk); })
      .on('end', function() {
          var dataBuff = data.join('').trim();
          var result;
          try {
            result = JSON.parse(dataBuff);
          } catch (exp) {
            result = {'status_code': 500, 'status_text': 'JSON Parse Failed'};
          }
          cb(null, result);
      });
  })
  .on('error', function(e) {
      cb(e);
  });
};

GoogleLocations.prototype._generateUrl = function(query, type, method) {
  //https://maps.googleapis.com/maps/api/place/nearbysearch/json?
  //https://maps.googleapis.com/maps/api/geocode/json?
  _.compact(query); 
  query.key = this.config.key;
  return url.parse(url.format({
    protocol: 'https',
    hostname: this.config.host,
    pathname: this.config.path + type + '/' + (method ? method + '/' : '') + this.config.format,
    query: query
  }));
};

module.exports = GoogleLocations;
