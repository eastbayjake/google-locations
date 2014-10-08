var GoogleLocations = require('../lib/google-locations'),
    vows = require('vows'),
    fakeweb = require('node-fakeweb'),
    assert = require('assert'),
    util = require('util');

fakeweb.allowNetConnect = false;

// fake the search -- basic example by distance
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.4229181%2C-122.0854212&rankby=distance&name=Goo&radius=&language=en&key=fake_key',
  body: '{"results" : [{"name": "Google", "place_id":"ABC123"},{"name": "Gooey Cookie Factory", "place_id":"DEF456"},{"name": "Goorman Shoes", "place_id":"GHI789"}], "status" : "OK"}'
});
// fake the search -- basic example by prominence + radius
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.4229181%2C-122.0854212&radius=10&name=A&language=en&rankby=prominence&key=fake_key',
  body: '{"results" : [{"name": "Google", "place_id":"ABC123"}], "status" : "OK"}'
});
// fake the search -- by address example
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.4229181%2C-122.0854212&rankby=prominence&radius=250&name=A&language=en&key=fake_key',
  body: '{"results" : [{"name": "Google", "place_id":"ABC123"}, {"name": "Gooey Cookie Factory", "place_id":"DEF456"}], "status" : "OK"}'
});
// fake the search -- no results
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=33.5291106%2C-90.226939&rankby=distance&name=Walmart&radius=&language=en&key=fake_key',
  body: '{"html_attributions": [], "results": [], "status": "ZERO_RESULTS" }'
});
// fake the text search -- Google in Mountain View, CA
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=Google%20near%20Mountain%20View%2C%20CA&key=fake_key',
  body: JSON.stringify({"html_attributions" : [], "results" : [{"formatted_address" : "1600 Amphitheatre Pkwy, Mountain View, CA 94043, United States", "geometry" : {"location" : {"lat" : 37.422, "lng" : -122.084058 } }, "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png", "id" : "3a936e96ddcb18b4fa8a2974ebc8876c3108fef2", "name" : "Googleplex", "photos" : [{"height" : 362, "html_attributions" : [], "photo_reference" : "CqQBnQAAACrzt8KRfXeyLDzN6HPye4dEYyH6Frnd-0WQUk81jBb8LzzvQW0HpBuG6SH9JkyTQ7kyId90ZMcrDHoOXny6QO69QTLWqS-it0OGd2KQKS0XR3Sqlv4iiYO2sfLIC177HiJ2bgB_kncbTqScaMSieZOT5Yjdcgotd5-984XP0uphJyXMXuzk8y97ATpreVMYSa83i0ye0Jk3umeY2VcAxE8SEIcOCsK5nF_x8WJj_zZnug4aFM5MGYQNDCqV-9yKZEZZ_EYpc_F-", "width" : 362 } ], "place_id" : "ChIJj61dQgK6j4AR4GeTYWZsKWw", "rating" : 4.3, "reference" : "CnRrAAAAiMV6plnUyDjA4svDGC4vtsleamSG8YUkdacfty4LO1izjwvDhmBewfdRB2S49CHXffNXPYnmsWiUR3kUhLPFlJgAXPoGUVuTIwf1-D8pXgu8VzChoG0FHMLqn0O2qtq17ET03um2OJDs8Ql2XSU9DxIQ6C905MW2ma-jYF7GjfYM3RoUliLUV6ZkGJAkA18VCsBJNQaNy6s", "types" : [ "establishment" ] }, {"formatted_address" : "1625 Charleston Rd, Mountain View, CA 94043, United States", "geometry" : {"location" : {"lat" : 37.420068, "lng" : -122.084157 } }, "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png", "id" : "a42ab417bb867ea8b2685989fd20e214920beb73", "name" : "Google", "opening_hours" : {"open_now" : false }, "photos" : [{"height" : 853, "html_attributions" : [], "photo_reference" : "CnRnAAAAM39qg_oTPeO6BmXj1GSEPCQEtUCQDX6hw8zD1vObVEfyfMbhvyYd3lakChI6LgAKf7x4_c5ovs-OHRAucr5xqcKx-5XQFOLCfQiKzdM1gdf78u5Hz2AIDoZpSWVLmkOPImw5O43Pfh3YaVpMb-hVAhIQObLac5IE1MAfFWNJdIkrRhoUNE4Kf5R5x72dcPNz1pknyiLXlbA", "width" : 1280 } ], "place_id" : "ChIJs1NtHP-5j4ARe0BWrv6DESU", "rating" : 4.6, "reference" : "CnRnAAAAz1oNAfX1WnlIKHGzcP0C2M-yZVE-UDuR1oHqy_P_Lq1BNR7M3XVl590SFrXEuxnmsn16f0hF0Nv3JiE_RwC-aWC_1oyd5Pae1WFp99m2g4lW747mS38l-aCBGywFPnt9yd-4P0TSmuCgeJSyP_PnThIQYBLa4qEKzoqC_oCs3PJCXhoUAidEpd4U56zJgJ3BZShC4I6dpXc", "types" : [ "establishment" ] } ], "status" : "OK"}) });
// fake the text search -- Gap in Los Angeles
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=gap%20in%20los%20angeles%20with%20phone%20number%20(323)%20462-6124&key=fake_key',
  body: '{"html_attributions" : [], "results" : [{"formatted_address" : "6801 Hollywood Blvd, Hollywood, CA 90028, United States", "geometry" : {"location" : {"lat" : 34.102023, "lng" : -118.338945 } }, "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/shopping-71.png", "id" : "a42c4ae9c44c7c59e5e29854a0e468a2ccceec72", "name" : "Gap", "opening_hours" : {"open_now" : true }, "photos" : [{"height" : 320, "html_attributions" : [], "photo_reference" : "CnRqAAAAw3bpYDzuY8vfPEyFki5-M5w-bOq93RLi4CNr9YlH5GNv1mH5rWrymCVyXhTyIMZCv-qGnQ_hS7mTflti7d1z33K7w6YVNzbaWFTc_Rx8CdGukhnX_dL67cCfU_mw-cXWloGZA-D8PyYCG91r6h7vIRIQgDw9fNnVFiBf1lT6REjCwRoUtjxZ8d_FPBaqHGCNIbw4tG-5goA", "width" : 320 } ], "place_id" : "ChIJswRilCO_woARhnNq2d1meQk", "price_level" : 2, "reference" : "CnRkAAAAwuQkQV_Lh_E-fO3J_1EIiTlW5b_QX_fEW57SJ7V5M-sQEa1GxuGpZJ3xFn60iq0i7Ei2t7mX9ni6iyFRf7oWdCdqt8oxYfg0wo8y_i3wUu08w7SPr8uqjYPS-P7T9gjZVl-s2RTNBaKuJuD38C6oNBIQejdSew4OHmdE5skg1nqsOhoURNqZS2rQ5gZ20aGbhJuatxiYm8o", "types" : [ "clothing_store", "store", "establishment" ] } ], "status" : "OK"}'
});
// fake the autocomplete
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/autocomplete/json?language=en&key=fake_key',
  body: '{"predictions" : [{"description": "Google", "id":"1"}, {"description": "Goodfellas Bar & Grill", "id":"2"}, {"description": "Goose Farm", "id": "3"}], "status" : "OK"}'
});
//fake the details
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/details/json?placeid=ABC123&language=en&key=fake_key',
  body: '{"result" : {"name": "Google", "rating": 3.5}, "status" : "OK"}'
});
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/details/json?placeid=DEF456&language=en&key=fake_key',
  body: '{"result" : {"name": "Gooey Cookie Factory", "rating": 4.0}, "status" : "OK"}'
});
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/details/json?placeid=GHI789&language=en&key=fake_key',
  body: '{"result" : {"name": "Goorman Shoes", "rating": 2.5}, "status" : "OK"}'
});
//fake the geocoding
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/geocode/json?address=1600%2BAmphitheatre%2BPkwy%2C%2BMountain%2BView%2C%2BCA&language=en&key=fake_key',
  body: '{"results" : [{"address_components" : [], "formatted_address" : "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA", "geometry" : {"location" : {"lat" : 37.42291810, "lng" : -122.08542120}}}], "status" : "OK"}'
});
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/geocode/json?address=2202%2BUS%2B82%2C%2BGreenwood%2C%2BMS&language=en&key=fake_key',
  body: '{"results" : [{"address_components" : [], "formatted_address" : "2202 US 82, Greenwood, MS 38930", "geometry" : {"location" : {"lat" : 33.5291106, "lng" : -90.226939}}}], "status" : "OK"}'
});
//fake the reverse geocoding
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224%2C-73.961452&language=en&key=fake_key',
  body: '{"results" : [{"address_components" : [], "formatted_address" : "277 Bedford Avenue, Brooklyn, NY 11211, USA", "geometry" : {"location" : { "lat" : 40.714232, "lng" : -73.9612889}}}], "status": "OK"}'
});

vows.describe('URL Generation').addBatch({
  'default url': {
    topic: new GoogleLocations('fake_key'),

    'should have a default url for place search': function(topic) {
      assert.equal(topic._generateUrl({}, 'place', 'search').href, 'https://maps.googleapis.com/maps/api/place/search/json?key=fake_key');
    },

    'should have a default url for place autocomplete': function(topic) {
      assert.equal(topic._generateUrl({}, 'place', 'autocomplete').href, 'https://maps.googleapis.com/maps/api/place/autocomplete/json?key=fake_key');
    },

    'should have a default url for geocode address lookup': function(topic) {
      assert.equal(topic._generateUrl({}, 'geocode', null).href, 'https://maps.googleapis.com/maps/api/geocode/json?key=fake_key');
    },

    'should have my key as a query param': function(topic) {
      assert.equal(topic._generateUrl({key: 'fake_key'}, 'search').query, 'key=fake_key');
    }
  }
}).export(module);

vows.describe('Places Search').addBatch({
  'new search': {
    topic: function() {
      new GoogleLocations('fake_key').search({}, this.callback);
    },

    'should not have an error': function(err, response){
      assert.isNull(err);
    },
    
    'should be status OK': function(err, response){
      assert.equal(response.status, 'OK');
    },

    'should include location description': function(err, response){
      assert.equal(response.results[0].name, 'Google');
    }
  }
}).export(module);

vows.describe('Places Text Search').addBatch({
  'new textsearch': {
    topic: function() {
      new GoogleLocations('fake_key').textsearch({query: 'Google near Mountain View, CA'}, this.callback);
    },

    'should not have an error': function(err, response){
      assert.isNull(err);
    },

    'should be status OK': function(err, response){
      assert.equal(response.status, 'OK');
    },

    'should include formatted address': function(err, response){
      assert.equal(response.results[0].formatted_address, '1600 Amphitheatre Pkwy, Mountain View, CA 94043, United States');
    }

  }
}).export(module);

vows.describe('Places Autocomplete').addBatch({
  'new autocomplete': {
    topic: function() {
      new GoogleLocations('fake_key').autocomplete({}, this.callback);
    },

    'should not have an error': function(err, response){
      assert.isNull(err);
    },
    
    'should be status OK': function(err, response){
      // console.log(response); process.exit();
      assert.equal(response.status, 'OK');
    },

    'should include description for predictions': function(err, response){
      assert.equal(response.predictions[0].description, 'Google');
    }
  }
}).export(module);

vows.describe('Place Details').addBatch({
  'new search': {
    topic: function() {
      new GoogleLocations('fake_key').details({placeid: 'ABC123'}, this.callback);
    },
    'should get details': function(err, response){
      assert.equal(response.result.rating, 3.5);
    }
  }
}).export(module);

vows.describe('Geocode Address').addBatch({
  'new address lookup': {
    topic: function() {
      new GoogleLocations('fake_key').geocodeAddress({address: '1600 Amphitheatre Pkwy, Mountain View, CA'}, this.callback);
    },
    'should get latitude': function(err, response){
      assert.equal(response.results[0].geometry.location.lat, 37.42291810);
    },
    'should get longitude': function(err, response){
      assert.equal(response.results[0].geometry.location.lng, -122.08542120);
    },
    'should get formatted address': function(err, response){
      assert.equal(response.results[0].formatted_address, '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA');
    }
  }
}).export(module);

vows.describe('Reverse Geocode').addBatch({
  'new geocode lookup': {
    topic: function() {
      new GoogleLocations('fake_key').reverseGeocode({latlng: [40.714224, -73.961452]}, this.callback);
    },
    'should get latitude': function(err, response){
      assert.equal(response.results[0].geometry.location.lat, 40.714232);
    },
    'should get longitude': function(err, response){
      assert.equal(response.results[0].geometry.location.lng, -73.9612889);
    },
    'should get formatted address': function(err, response){
      assert.equal(response.results[0].formatted_address, '277 Bedford Avenue, Brooklyn, NY 11211, USA');
    }
  }
}).export(module);

vows.describe('Place Details via Address Query').addBatch({
  'get details from address/name query': {
    topic: function(){
      new GoogleLocations('fake_key').findPlaceDetailsWithAddress({address: '1600 Amphitheatre Pkwy, Mountain View, CA', name: 'Goo'}, this.callback);
    },
    'should get a location': function(err, response){
      assert.equal(response.details[0].result.name, 'Google');
    },
    'should default to one result without maxResults specified': function(err, response){
      assert.equal(response.details.length, 1);
    },
  },
  'list multiple results if specified': {
    topic: function(){
      new GoogleLocations('fake_key').findPlaceDetailsWithAddress({address: '1600 Amphitheatre Pkwy, Mountain View, CA', name: 'Goo', maxResults: 2}, this.callback);
    },
    'should contain two results': function(err, response){
      assert.equal(response.details.length, 2);
    }
  },
  'null results': {
    topic: function(){
      new GoogleLocations('fake_key').findPlaceDetailsWithAddress({address: '2202 US 82, Greenwood, MS', name: 'Walmart', maxResults: 5}, this.callback);
    },
    'should return an empty array if there are no results': function(err, response){
      assert.equal(response.details.length, 0);
    }
  }
}).export(module);
