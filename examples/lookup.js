var dotenv = require('dotenv');
dotenv.load();

var GoogleLocations = require('../lib/google-locations');

var places = new GoogleLocations(process.env.GOOGLE_API_KEY);

places.search({keyword: 'Vermonster'}, function(err, response) {
  if(err) { console.log(err); return; }
  console.log("search: ", response.results);

  places.details({placeid: response.results[0].place_id}, function(err, response) {
    if(err) { console.log(err); return; }
    console.log("search details: ", response.result.website);
  });
});

places.autocomplete({input: 'Verm', types: "(cities)"}, function(err, response) {
  if(err) { console.log(err); return; }
  console.log("autocomplete: ", response.predictions);

  var success = function(err, response) {
    if(err) { console.log(err); return; }
    console.log("did you mean: ", response.result.name);
  };

  for(var index in response.predictions) {
    places.details({placeid: response.predictions[index].place_id}, success);
  }
});
