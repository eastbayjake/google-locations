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
  if (options.rankby == 'distance')
    options.radius = null;
  
  this._makeRequest(this._generateUrl(options, 'place', 'search'), cb);
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
}

GoogleLocations.prototype.findPlaceDetailsWithAddress = function(options, cb) {
  if (!options.hasOwnProperty(address)) return cb({error: "Address string required"});
  this.geocodeAddress(options, function(err, result){
    if (err) return cb({message: "Error geocoding address", error: err});
    var location;
    try {
      location = result.results[0].geometry.location;
    } catch (exp) {
      return cb({message: "Malformed results -- try a more specific address", error: exp});
    }
    var query = {location: [location.lat, location.lng], rankby: "distance"};
    if (options.name) query.name = options.name;
    this.search(query, function(err, result){
      if (err) return cb({message: "Error searching for places near geocoded location", error: err});
      var placeid;
      try {
        location = result.results[0].place_id;
      } catch (exp) {
        return cb({message: "Malformed results -- no place_id found", error: exp});
      }
      this.details({placeid: placeid}, function(err, result){
        if (err) return cb({message: "Error requesting details for placeid " + placeid, error: err});
        return cb(null, result);
      });
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
  //https://maps.googleapis.com/maps/api/place/search/json?
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
