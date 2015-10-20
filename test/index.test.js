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
  uri: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.4229181%2C-122.0854212&radius=10&language=en&rankby=prominence&key=fake_key',
  body: '{"results" : [{"name": "Google", "place_id":"ABC123"}], "status" : "OK"}'
});
// fake the search -- by address example
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.4229181%2C-122.0854212&rankby=prominence&radius=250&language=en&key=fake_key',
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
  body: JSON.stringify({"html_attributions" : [], "results" : [{"formatted_address" : "1600 Amphitheatre Pkwy, Mountain View, CA 94043, United States", "geometry" : {"location" : {"lat" : 37.422, "lng" : -122.084058 } }, "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png", "id" : "3a936e96ddcb18b4fa8a2974ebc8876c3108fef2", "name" : "Googleplex", "photos" : [{"height" : 362, "html_attributions" : [], "photo_reference" : "CqQBnQAAACrzt8KRfXeyLDzN6HPye4dEYyH6Frnd-0WQUk81jBb8LzzvQW0HpBuG6SH9JkyTQ7kyId90ZMcrDHoOXny6QO69QTLWqS-it0OGd2KQKS0XR3Sqlv4iiYO2sfLIC177HiJ2bgB_kncbTqScaMSieZOT5Yjdcgotd5-984XP0uphJyXMXuzk8y97ATpreVMYSa83i0ye0Jk3umeY2VcAxE8SEIcOCsK5nF_x8WJj_zZnug4aFM5MGYQNDCqV-9yKZEZZ_EYpc_F-", "width" : 362 } ], "place_id" : "ChIJj61dQgK6j4AR4GeTYWZsKWw", "rating" : 4.3, "reference" : "CnRrAAAAiMV6plnUyDjA4svDGC4vtsleamSG8YUkdacfty4LO1izjwvDhmBewfdRB2S49CHXffNXPYnmsWiUR3kUhLPFlJgAXPoGUVuTIwf1-D8pXgu8VzChoG0FHMLqn0O2qtq17ET03um2OJDs8Ql2XSU9DxIQ6C905MW2ma-jYF7GjfYM3RoUliLUV6ZkGJAkA18VCsBJNQaNy6s", "types" : [ "establishment" ] }, {"formatted_address" : "1625 Charleston Rd, Mountain View, CA 94043, United States", "geometry" : {"location" : {"lat" : 37.420068, "lng" : -122.084157 } }, "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png", "id" : "a42ab417bb867ea8b2685989fd20e214920beb73", "name" : "Google", "opening_hours" : {"open_now" : false }, "photos" : [{"height" : 853, "html_attributions" : [], "photo_reference" : "CnRnAAAAM39qg_oTPeO6BmXj1GSEPCQEtUCQDX6hw8zD1vObVEfyfMbhvyYd3lakChI6LgAKf7x4_c5ovs-OHRAucr5xqcKx-5XQFOLCfQiKzdM1gdf78u5Hz2AIDoZpSWVLmkOPImw5O43Pfh3YaVpMb-hVAhIQObLac5IE1MAfFWNJdIkrRhoUNE4Kf5R5x72dcPNz1pknyiLXlbA", "width" : 1280 } ], "place_id" : "ChIJs1NtHP-5j4ARe0BWrv6DESU", "rating" : 4.6, "reference" : "CnRnAAAAz1oNAfX1WnlIKHGzcP0C2M-yZVE-UDuR1oHqy_P_Lq1BNR7M3XVl590SFrXEuxnmsn16f0hF0Nv3JiE_RwC-aWC_1oyd5Pae1WFp99m2g4lW747mS38l-aCBGywFPnt9yd-4P0TSmuCgeJSyP_PnThIQYBLa4qEKzoqC_oCs3PJCXhoUAidEpd4U56zJgJ3BZShC4I6dpXc", "types" : [ "establishment" ] } ], "status" : "OK"})
});
// fake the phone search -- Google at (650) 253-0000
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=phone%20number%20(650)%20253-0000&key=fake_key',
  body: JSON.stringify({"html_attributions" : [], "results" : [{"formatted_address" : "1600 Amphitheatre Pkwy, Mountain View, CA 94043, United States", "geometry" : {"location" : {"lat" : 37.422, "lng" : -122.084058 } }, "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png", "id" : "3a936e96ddcb18b4fa8a2974ebc8876c3108fef2", "name" : "Googleplex", "photos" : [{"height" : 362, "html_attributions" : [], "photo_reference" : "CqQBnQAAAGLoKhJJ47SOpRXZF03xXGkz5iXPxJXtfbTPhDmm6ZwY7H4xIop7zpn2IT4HbHkaj3xal4JaBhc0OEUGU6GW0PyVY53y0r9wR7SxDtZQVLLkf72r0a0tlxskUGG34-Osep2YBzbe7FTEUU50WixLU2lBxH7M1oHyGI_D9XGcXX3VsXVeLQLzrlQErEm4cr2722cTXe5kIDaN7YBv8hxDFpwSEFbszJ1P-bwe0q9qSzuRo4gaFMkfBL46DLMetYg6_4q_hgtS1L__", "width" : 362 } ], "place_id" : "ChIJj61dQgK6j4AR4GeTYWZsKWw", "rating" : 4.3, "reference" : "CnRrAAAAGMc8lc9Lwe3p7jCID6Tm6oiid6dq1dkEC9u6tOh1bIdNfwYHacf9mmOWJAKXQ_WCc3tTVlY5DwdfesKzH-IK2Jgf-3DQxgnsXGShhwWzdI71x1jEZb_m2OjSzu1ypVaSHGXChlUTjckm4Gi2k7O3UxIQqkYVMLeGsgDa61UgG1aFMxoULJUVWhF-57Ersv1dmbFMV96SJ5A", "types" : [ "establishment" ] }, {"formatted_address" : "1625 Charleston Rd, Mountain View, CA 94043, United States", "geometry" : {"location" : {"lat" : 37.420068, "lng" : -122.084157 } }, "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png", "id" : "a42ab417bb867ea8b2685989fd20e214920beb73", "name" : "Google", "opening_hours" : {"open_now" : false }, "photos" : [{"height" : 853, "html_attributions" : [], "photo_reference" : "CnRnAAAA2RAGiUiJUSh0iZ3VTyll4ZRykIdpluGnnNFglC513RMw3af_swUoz-Q_qOJAySsULHsKuZRjoGL0ZcuegRwM_sfl4FqewLhrCli7VDIsM94_1DMArpl0cXKw4ygULaje7YOh5yVtUJcjPSy7JgxyoRIQ5dNHnsDqQtWV4y6L7WKN4xoUHPuzwBdxy3UQq36TAU0mnHwUQ08", "width" : 1280 } ], "place_id" : "ChIJs1NtHP-5j4ARe0BWrv6DESU", "rating" : 4.6, "reference" : "CnRnAAAAHbiNyZDamdTvcE-F6mUxl3Jxjf1bIB2qGtHE-KSNz7_dXnrhcOTWUTJXT6EvTCp_BPDGZfpclSzkla1pm0QKZssdqTnCV7JfP4VueUrs_jNP8NUvZCT8Fjuqr_Ttsr81ZGkYJeiRZtDDmTD79T_8cBIQVwTkBxE59CRBlJ5jCkq72BoUHVmZT4uSTpI4rHSnvv3V_4pIU2g", "types" : [ "establishment" ] } ], "status" : "OK"})
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
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJj61dQgK6j4AR4GeTYWZsKWw&language=en&key=fake_key',
  body: JSON.stringify({"html_attributions" : [], "result" : {"address_components" : [{"long_name" : "1600", "short_name" : "1600", "types" : [ "street_number" ] }, {"long_name" : "Amphitheatre Pkwy", "short_name" : "Amphitheatre Pkwy", "types" : [ "route" ] }, {"long_name" : "Mountain View", "short_name" : "Mountain View", "types" : [ "locality", "political" ] }, {"long_name" : "Santa Clara County", "short_name" : "Santa Clara County", "types" : [ "administrative_area_level_2", "political" ] }, {"long_name" : "CA", "short_name" : "CA", "types" : [ "administrative_area_level_1", "political" ] }, {"long_name" : "United States", "short_name" : "US", "types" : [ "country", "political" ] }, {"long_name" : "94043", "short_name" : "94043", "types" : [ "postal_code" ] } ], "adr_address" : "\u003cspan class=\"street-address\"\u003e1600 Amphitheatre Pkwy\u003c/span\u003e, \u003cspan class=\"locality\"\u003eMountain View\u003c/span\u003e, \u003cspan class=\"region\"\u003eCA\u003c/span\u003e \u003cspan class=\"postal-code\"\u003e94043\u003c/span\u003e, \u003cspan class=\"country-name\"\u003eUnited States\u003c/span\u003e", "formatted_address" : "1600 Amphitheatre Pkwy, Mountain View, CA 94043, United States", "formatted_phone_number" : "(650) 253-0000", "geometry" : {"location" : {"lat" : 37.422, "lng" : -122.084058 } }, "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png", "id" : "3a936e96ddcb18b4fa8a2974ebc8876c3108fef2", "international_phone_number" : "+1 650-253-0000", "name" : "Googleplex", "photos" : [{"height" : 362, "html_attributions" : [], "photo_reference" : "CqQBnQAAAGh3tLnGTLCRWW9Q4tThiEhyHsN5sJFDUx5hxb9S8MiWJ2u1nhRkt3U_Y7C77b4fKX0mjllrdG-VhPegvBZiYb0HJfeOWV8Q0KlYAKippJ8c73OlGfgAAm0BuMYRUCiOUA_2FuTTy1yuwhCzebfpxuuFIc5D-AFBfkTny-Z3om91T0RmsmXayOiOEdmgd_urMz1DyfUml8U4G0ZwUKCJUEYSEFhXZiJVVMSQU4UXlIf3kvwaFKpR0JeviWN-CcuKFb3skl8u0Nei", "width" : 362 } ], "place_id" : "ChIJj61dQgK6j4AR4GeTYWZsKWw", "rating" : 4.3, "reference" : "CnRjAAAAdZwDJSyQIP-tTBBKUOQtPtyhPxPWNwBRaFSgA1MG04VXle2DELfTiOx8zq1c7VJ3kKbAdA6z-sX0Z6lP90jUZoKanXvNRaNgQsFiMtJVMA_bBte--t8Xekb-9pHV66So2ArNXcpkXrO_s83aT37DFhIQ6ZqGKYHw6z-V8nDlrsAG0hoUTGefORpeypjOUh837Us701TNWQY", "reviews" : [{"aspects" : [{"rating" : 2, "type" : "overall"} ], "author_name" : "Bruce Etzcorn", "author_url" : "https://plus.google.com/100299416710892131525", "language" : "en", "rating" : 4, "text" : "One of the coolest places on the planet. It was awesome to visit the Mothership and talk with so many cool people about seo, ppc, and digital strategy. \n\nOne experience I'll never forget. ", "time" : 1410659695 } ], "scope" : "GOOGLE", "types" : [ "establishment" ], "url" : "https://plus.google.com/102930680494956726639/about?hl=en", "user_ratings_total" : 1328, "utc_offset" : -420, "vicinity" : "1600 Amphitheatre Pkwy, Mountain View", "website" : "http://www.google.com/"}, "status" : "OK"})
});
fakeweb.registerUri({
  uri: 'https://maps.googleapis.com/maps/api/place/details/json?placeid=ChIJs1NtHP-5j4ARe0BWrv6DESU&language=en&key=fake_key',
  body: JSON.stringify({"html_attributions" : [], "result" : {"address_components" : [{"long_name" : "1625", "short_name" : "1625", "types" : [ "street_number" ] }, {"long_name" : "Charleston Rd", "short_name" : "Charleston Rd", "types" : [ "route" ] }, {"long_name" : "Mountain View", "short_name" : "Mountain View", "types" : [ "locality", "political" ] }, {"long_name" : "CA", "short_name" : "CA", "types" : [ "administrative_area_level_1", "political" ] }, {"long_name" : "United States", "short_name" : "US", "types" : [ "country", "political" ] }, {"long_name" : "94043", "short_name" : "94043", "types" : [ "postal_code" ] } ], "adr_address" : "\u003cspan class=\"street-address\"\u003e1625 Charleston Rd\u003c/span\u003e, \u003cspan class=\"locality\"\u003eMountain View\u003c/span\u003e, \u003cspan class=\"region\"\u003eCA\u003c/span\u003e \u003cspan class=\"postal-code\"\u003e94043\u003c/span\u003e, \u003cspan class=\"country-name\"\u003eUnited States\u003c/span\u003e", "formatted_address" : "1625 Charleston Rd, Mountain View, CA 94043, United States", "formatted_phone_number" : "(650) 253-0000", "geometry" : {"location" : {"lat" : 37.420068, "lng" : -122.084157 } }, "icon" : "http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png", "id" : "a42ab417bb867ea8b2685989fd20e214920beb73", "international_phone_number" : "+1 650-253-0000", "name" : "Google", "opening_hours" : {"open_now" : false, "periods" : [{"close" : {"day" : 1, "time" : "1700"}, "open" : {"day" : 1, "time" : "0800"} }, {"close" : {"day" : 2, "time" : "1700"}, "open" : {"day" : 2, "time" : "0800"} }, {"close" : {"day" : 3, "time" : "1700"}, "open" : {"day" : 3, "time" : "0800"} }, {"close" : {"day" : 4, "time" : "1700"}, "open" : {"day" : 4, "time" : "0800"} }, {"close" : {"day" : 5, "time" : "1700"}, "open" : {"day" : 5, "time" : "0800"} } ] }, "photos" : [{"height" : 853, "html_attributions" : [], "photo_reference" : "CnRnAAAAv7NwQdZ1RKon3eTht4mJhwFgxt22G0keOjzlWMxdryPryykmyHIXnxF-K6U0M0lXjCe-ufrOfIk_YfpPxL6s-XyL-ahn2FYbKav-_-Oep9CZPsCRE01alWffrJSiluzqYncYTcRrsXaZSaI1tUr_PBIQPMlQrIQtNZJg7muvSk4aVBoUp15iq5rCZ6u3kxm7dt1fHvi2XBs", "width" : 1280 } ], "place_id" : "ChIJs1NtHP-5j4ARe0BWrv6DESU", "rating" : 4.6, "reference" : "CmRfAAAAN9CKIJGilaH4tO6gHnrdvDAAc9wdnQhlCYG5n2RnXRUkSbvYKVsxrZ2YDkq-TgneMDU1nQr3341V8QJLm0Yyt7sWbsbBOS5A7i4Ou0d6ZxRulyFwcKBGss87yyieQG5pEhBriQRv0NHuSWug_ZdzhXhQGhQXqpu5K_aPGDNJLxRVWPfq9A1YZQ", "reviews" : [{"aspects" : [{"rating" : 3, "type" : "overall"} ], "author_name" : "Lewis Wain", "author_url" : "https://plus.google.com/109476013940801473976", "language" : "en", "rating" : 5, "text" : "Went on a Geek pilgrimage from San Francisco. Well worth the drive! You can get some awesome photos but some of the mascots could do with a paint. ", "time" : 1408466142 } ], "scope" : "GOOGLE", "types" : [ "establishment" ], "url" : "https://plus.google.com/118438385594178218811/about?hl=en", "user_ratings_total" : 39, "utc_offset" : -420, "vicinity" : "1625 Charleston Rd, Mountain View", "website" : "http://www.google.co.in/about/company/facts/locations/"}, "status" : "OK"})
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

vows.describe('Search by Address').addBatch({
  'get details from address/name query': {
    topic: function(){
      new GoogleLocations('fake_key').searchByAddress({address: '1600 Amphitheatre Pkwy, Mountain View, CA', name: 'Goo'}, this.callback);
    },
    'should get a location': function(err, response){
      assert.equal(response.details[0].result.name, 'Google');
    },
    'should default to one result without maxResults specified': function(err, response){
      assert.equal(response.details.length, 1);
    },
  },
  'multiple results': {
    topic: function(){
      new GoogleLocations('fake_key').searchByAddress({address: '1600 Amphitheatre Pkwy, Mountain View, CA', name: 'Goo', maxResults: 2}, this.callback);
    },
    'should list up to the number specified in maxResults': function(err, response){
      assert.equal(response.details.length, 2);
    }
  },
  'null results': {
    topic: function(){
      new GoogleLocations('fake_key').searchByAddress({address: '2202 US 82, Greenwood, MS', name: 'Walmart', maxResults: 5}, this.callback);
    },
    'should return an empty array if there are no results': function(err, response){
      assert.equal(response.details.length, 0);
    }
  }
}).export(module);

vows.describe('Search by Phone').addBatch({
  'get details from phone/name query': {
    topic: function(){
      new GoogleLocations('fake_key').searchByPhone({phone: '(650) 253-0000'}, this.callback);
    },
    'should get a location that matches the provided phone number': function(err, response){
      assert.equal(response.details[0].result.formatted_phone_number, "(650) 253-0000");
    },
    'should default to one result without maxResults specified': function(err, response){
      assert.equal(response.details.length, 1);
    }
  },
  'multiple results': {
    topic: function(){
      new GoogleLocations('fake_key').searchByPhone({phone: '(650) 253-0000', maxResults: 2}, this.callback);
    },
    'should list up to the number specified in maxResults': function(err, response){
      assert.equal(response.details.length, 2);
    }
  }
}).export(module);
