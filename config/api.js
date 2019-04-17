var apiai = require('apiai');
var app = apiai("<Put Your DialogFlow Client Toker>");
// Function which returns speech from api.ai
var getRes = function(query) {
  var request = app.textRequest(query, {
    sessionId: 'Test1'
  });
  const responseFromAPI = new Promise(
    function(resolve, reject) {
      request.on('error', function(error) {
        reject(error);
      });
      request.on('response', function(response) {
        resolve(response.result.fulfillment.speech);
      });
    });
  request.end();
  return responseFromAPI;
};
// test the command :
//getRes('hello').then(function(res){console.log(res)});
module.exports = {
  getRes
}