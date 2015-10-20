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
  if (options.rankby == 'distance') options.radius = null;
  
  _makeRequest(_generateUrl(this, options, 'place', 'nearbysearch'), cb);
};

GoogleLocations.prototype.textsearch = function(options, cb) {
  options = _.defaults(options, {
    query: 'Google near Mountain View, CA'
  });

  _makeRequest(_generateUrl(this, options, 'place', 'textsearch'), cb);
};

GoogleLocations.prototype.autocomplete = function(options, cb) {
  options = _.defaults(options, {
    language: "en",
  });

  _makeRequest(_generateUrl(this, options, 'place', 'autocomplete'), cb);
};

GoogleLocations.prototype.details = function(options, cb) {
  if (!options.placeid) return cb({error: 'placeid string required'});
  options = _.defaults(options, {
    language: 'en'
  });

  _makeRequest(_generateUrl(this, options, 'place', 'details'), cb);
};

GoogleLocations.prototype.geocodeAddress = function(options, cb) {
  if (!options.address) return cb({error: 'Address string required'});
  options = _.defaults(options, {
    language: 'en'
  });

  options.address = options.address.replace(/\s/g, '+');

  _makeRequest(_generateUrl(this, options, 'geocode', null), cb);
};

GoogleLocations.prototype.reverseGeocode = function(options, cb) {
  options = _.defaults(options, {
    latlng: [37.42291810, -122.08542120],
    language: 'en'
  });

  options.latlng = options.latlng.join(',');

  _makeRequest(_generateUrl(this, options, 'geocode', null), cb);
};

GoogleLocations.prototype.searchByAddress = function(config, cb) {
  if (!config.address) return cb({error: "Address string required"});
  var _self = this;
  var options = _generateOptions(config);
  _self.geocodeAddress(options.geocode, function(err, result){
    if (err) return cb({message: "Error geocoding address", error: err});
    try {
      var location = result.results[0].geometry.location;
      var query = _searchQuery(location, options.search);
      _self.search(query, function(err, result){
        if (err) return cb({message: "Error searching for places near geocoded location", error: err});
        _batchDetails(_self, result, options.search.maxResults, cb);
      });
    } catch (exp) {
      return cb({message: "Malformed results -- try a more specific address", error: exp});
    }
  });
};

GoogleLocations.prototype.searchByPhone = function(options, cb) {
  if (!options.phone) return cb({error: "Missing required parameter 'phone'"});
  options.maxResults = options.maxResults || 1;
  var _self = this;
  
  _self.textsearch({query: 'phone number ' + options.phone}, function(err, result){
    if (err) return cb({message: "Error from textsearch", error: err});
    _batchDetails(_self, result, options.maxResults, cb);
  });
};

/* Helper Functions */
function _batchDetails(context, result, maxResults, cb) {
  if (result.results.length === 0) return cb(null, {details: [], errors: []});
  var details = [];
  var errors = [];
  var j = (maxResults > result.results.length) ? result.results.length : maxResults;
  for (var i = 0; i < j; i++) {
    try {
      var placeid = result.results[i].place_id;
      context.details({placeid: placeid}, function(err, result){
        if (err) {
          errors.push({message: "Error requesting details for placeid " + placeid, error: err});
        } else {
          details.push(result);
        }
        if (details.length + errors.length == j) return cb(null, {details: details, errors: errors});
      });
    } catch (exp) {
      errors.push({message: "No place_id found", error: exp});
      if (details.length + errors.length == j) return cb(null, {details: details, errors: errors});
    }
  }
}

function _generateOptions(geocodeOptions) {
  var options = {geocode: geocodeOptions, search: {maxResults: 1, rankby: "distance"}};
  var keys = ['name', 'maxResults', 'rankby', 'radius'];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (options.geocode[key]) {
      options.search[key] = options.geocode[key];
      delete options.geocode[key];
    }
  }
  // Ensure 'prominence' searches have a radius
  if (options.search.rankby === "prominence" && !options.search.radius) {
    options.search.radius = 250;
  }
  return options;
}

function _searchQuery(location, searchOptions) {
  var query = {location: [location.lat, location.lng], rankby: searchOptions.rankby};
  if (searchOptions.name) query.name = searchOptions.name;
  if (searchOptions.radius) query.radius = searchOptions.radius;
  return query;
}


/* Request Utility Functions */
function _makeRequest (request_query, cb) {
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
}

function _generateUrl(context, query, type, method) {
  //https://maps.googleapis.com/maps/api/place/nearbysearch/json?
  //https://maps.googleapis.com/maps/api/geocode/json?
  _.compact(query); 
  query.key = context.config.key;
  var request_query = url.parse(url.format({
    protocol: 'https',
    hostname: context.config.host,
    pathname: context.config.path + type + '/' + (method ? method + '/' : '') + context.config.format,
    query: query
  }));
  request_query.headers = context.config.headers;
  return request_query;
}

module.exports = GoogleLocations;
