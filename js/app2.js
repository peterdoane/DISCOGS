'use strict';

// configuration object for entire application
var config = {
  apiToken: 'KWtkOUFJNLgcubpLsiWDHFemLZkjePmUwaENoJmG'
}

// create local storage variables to manage state
var state = {
  searchResults: null,
  selectedItem: null,
  userCollection: []
}

$(document).ready(function(){


  // 1.Find record by searching with Name or UPC

  //onclick of search button perform search of discogs API
  $('#searchBtn').click(function(){

    //build the search url
    var searchUrl ='https://api.discogs.com/database/search?token=' + config.apiToken + '&q=' + $('#searchInput').val() + '&type=release&limit=10';

    //inject script tag
    var scriptTag = document.createElement("script");
    scriptTag.setAttribute("src", searchUrl + "&callback=handleApiResult");
    document.body.appendChild(scriptTag);

  });

  // 2.Store the record

});

//function for handling the discogs search API result
function handleApiResult(response){

  // storing the response results to the pages current state
  state.searchResults = response.data.results;

  //generating HTML string from search result data
  var searchResultHTMLArray = response.data.results.map(function(item){
    return '<p><a href="#" data-resultId="' + item.id + '" class="title">' + item.title + '</a></p>'
  });

  // adding an HTML string with response data to the page
  $('#detailsView').html(searchResultHTMLArray.join(''));

  //add click handlers to all title elements generated from search
  $('.title').map(function(){
    $(this).click(handleSearchItemClick);
  });

}

function handleSearchItemClick(){

  //get selected item Id from element
  var selectedItemId = $(this).attr('data-resultid');

  //filter the search results to only have the selected item's details
  var selectedItemDetails = state.searchResults.filter(function(item){
    if (item.id == selectedItemId) {
      return item;
    }
  });

  state.selectedItem = selectedItemDetails[0];

  //get the pricing data for this item's details
  //build the search url
  var searchUrl ='https://api.discogs.com/marketplace/price_suggestions/' +  selectedItemDetails[0].id +
  '?token=' + config.apiToken;

  $.get(searchUrl, function(priceSuggestions){

    var priceSuggestionsHTML = [];

    for (var key in priceSuggestions) {
      priceSuggestionsHTML.push('<p><input type="radio" id="' + key + '" data-price="'+ priceSuggestions[key].value + '"></input>' +
      '<label for="' + key + '">' + key + '</label></p>');
    }

    //generate an HTML string with the details of the album
    var itemDetailsHTMLString =
    '<div class="itemDetails">' +
    '<p class="artist">Artist: '+ selectedItemDetails[0].title.split('-')[0] + '</p>' +
    '<p class="album">Album: ' + selectedItemDetails[0].title.split('-')[1] + ' </p>' +
    '<p class="country">Country:' + selectedItemDetails[0].country + '</p>' +
    '<p class="year">Year:' + selectedItemDetails[0].year + '</p>' +
    '<img class="photo" src="' + selectedItemDetails[0].thumb + '">' +
    '<form action="#">' + priceSuggestionsHTML.join('') +
    '<button id="addToCollectionBtn" class="btn">Add To Collection</button>' +
    '</form>' +
    '</div>';

    //insert that html string into the detailsView area
    $('#detailsView').html(itemDetailsHTMLString)

    //sets click handler on #addToCollection and prevents form from being submitted
    $('#addToCollectionBtn').click(function(evt){
      event.preventDefault();

      // pushes selectedItems into the state.userCollection array
      state.userCollection.push(state.selectedItem);

      // =null resets the state to blank search page
      state.selectedItem = null;
      state.searchResults = null;

      // resets the details view to be empty, will change this to show usercollection maybe
      $('#detailsView').html("");

      console.log(state);
    });

  });

}
