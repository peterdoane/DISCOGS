

var discogsConfig = {
  unauthenticated_api_stuff_from_before : {
    apiKey: "tVSpuGmepgSzvxGVNOmk",
    apiSecret: "imDlswLKNGuvHBhpkoZVCCQAhrLYscuB"
  },
  api : {
    base: 'https://api.discogs.com',
    token: 'KWtkOUFJNLgcubpLsiWDHFemLZkjePmUwaENoJmG'
  }
};

function getAuthenticatedDiscogsUrl(path){

  return discogsConfig.api.base + path + '?token=' + discogsConfig.api.token;

  //
    //return discogsConfig.api.base + path + '?secret=' + discogsConfig.unauthenticated_api_stuff_from_before.apiSecret + '&key=' + discogsConfig.unauthenticated_api_stuff_from_before.apiKey;
}

function getUnauthenticatedDiscogsUrl(path){
    return discogsConfig.apiBase + path;
}
function createDiscogsSearchUrl(query, type){
  var url = getAuthenticatedDiscogsUrl('/database/search');
  if(query){
    url += '&q=' + query;
  }
  if(type){
    url += '&type=' + type;
  }
  return url;
}

function createDiscogsPriceSuggestionUrl(releaseId){
  var path = '/marketplace/price_suggestions/' + releaseId;
  var url = getAuthenticatedDiscogsUrl(path);
  return url;
}

function createDiscogsPriceSuggestionUrlNoAuth(releaseId){
  var path = '/marketplace/price_suggestions/' + releaseId;
  var url = getUnauthenticatedDiscogsUrl(path);
  return url;
}
