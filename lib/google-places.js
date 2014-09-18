var https = require('https'),
    _     = require('underscore'),
    url   = require('url');


var GooglePlaces = function(key, options) {
  // Set default options
  if (!options) options = {};
  options = _.defaults(options, {
    format: 'json',
    headers: { "User-Agent": 'Google-Places-Node' },
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
GooglePlaces.prototype.search = function(options, cb) {
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
  
  this._doRequest(this._generateUrl(options, 'place', 'search'), cb);
};

GooglePlaces.prototype.autocomplete = function(options, cb) {
  options = _.defaults(options, {
    language: "en",
  });

  this._doRequest(this._generateUrl(options, 'place', 'autocomplete'), cb);
};

// Goolge place details
GooglePlaces.prototype.details = function(options, cb) {
  options = _.defaults(options, {
    placeid: options.placeid,
    language: 'en'
  });

  this._doRequest(this._generateUrl(options, 'place', 'details'), cb);
};

GooglePlaces.prototype.geocodeAddress = function(options, cb) {
  options = _.defaults(options, {
    address: '1600 Amphitheatre Parkway, Mountain View, CA',
    language: 'en'
  });

  options.address = options.address.replace(/\s/g, '+');

  this._doRequest(this._generateUrl(options, 'geocode', null), cb);
};

GooglePlaces.prototype.reverseGeocode = function(options, cb) {
  options = _.defaults(options, {
    latlng: [37.42291810, -122.08542120],
    language: 'en'
  });

  options.latlng = options.latlng.join(',');

  this._doRequest(this._generateUrl(options, 'geocode', null), cb);
}

// Run the request
GooglePlaces.prototype._doRequest = function(request_query, cb) {
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

GooglePlaces.prototype._generateUrl = function(query, type, method) {
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

module.exports = GooglePlaces;
