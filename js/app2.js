'use strict';

// configuration object for entire application
var config = {
    apiToken: 'KWtkOUFJNLgcubpLsiWDHFemLZkjePmUwaENoJmG'
}

// create local storage variables to manage state aka. initialize state
var state = {
    searchResults: null,
    selectedItem: null,
    userCollection: []
}

$(document).ready(function() {

    //onclick of search button perform search of discogs API
    $('#searchBtn').click(function(evt) {
        //prevent form from submitting
        event.preventDefault();

        //build the search url
        var searchUrl = 'https://api.discogs.com/database/search?token=' + config.apiToken + '&q=' + $('#searchInput').val() + '&type=release&limit=10';

        //insert the script tag into html/dom
        var scriptTag = document.createElement("script");
        // <script></script>
        scriptTag.setAttribute("src", searchUrl + "&callback=handleApiResult");
        // <script src=searchUrl + "&callback=handleApiResult"></script>
        document.body.appendChild(scriptTag);

    });

});

//function for handling the discogs search API result
function handleApiResult(response) {

    // storing the response results to the pages current state
    state.searchResults = response.data.results;

    //generating HTML string from search result data
    var searchResultHTMLArray = response.data.results.map(function(album) {
        return '<p><a href="#" data-resultId="' + album.id + '" class="title">' + album.title + '</a></p>'
    });

    // adding an HTML string with response data to the page
    $('#detailsView').html(searchResultHTMLArray.join(''));

    //add click handlers to all title elements generated from search
    $('.title').map(function() {
        $(this).click(handleSearchItemClick);
    });

}

function handleSearchItemClick() {

    //get selected item Id from element
    var selectedItemId = $(this).attr('data-resultid');

    //filter the search results to only have the selected item's details
    var selectedItemDetails = state.searchResults.filter(function(item) {
        if (item.id == selectedItemId) {
            return item;
        }
    });

    //add album details to application global state
    state.selectedItem = selectedItemDetails[0];

    //get the pricing data for this item's details
    //build the price search url
    var searchUrl = 'https://api.discogs.com/marketplace/price_suggestions/' + selectedItemDetails[0].id +
        '?token=' + config.apiToken;

    //make get request to price suggestions API
    $.get(searchUrl, function(priceSuggestions) {

        var priceSuggestionsHTML = [];

        //create radio buttons for every key:value pair in price suggestions object
        for (var key in priceSuggestions) {
            priceSuggestionsHTML.push('<p><input type="radio" name="group1" id="' + key + '" value="'+ priceSuggestions[key].value +'"></input>' +
                '<label for="' + key + '">' + key + '</label></p>');
        }

        //generate an HTML string with the details of the album
        var itemDetailsHTMLString =
            '<div class="itemDetails">' +
            '<p class="artist">Artist: ' + selectedItemDetails[0].title.split('-')[0] + '</p>' +
            '<p class="album">Album: ' + selectedItemDetails[0].title.split('-')[1] + ' </p>' +
            '<p class="country">Country:' + selectedItemDetails[0].country + '</p>' +
            '<p class="year">Year:' + selectedItemDetails[0].year + '</p>' +
            '<img class="photo" src="' + selectedItemDetails[0].thumb + '">' +
            '<form action="#" id="priceSelectionForm">' + priceSuggestionsHTML.join('') +
            '<button id="addToCollectionBtn" class="btn">Add To Collection</button>' +
            '</form>' +
            '</div>';

        //insert that html string into the detailsView area
        $('#detailsView').html(itemDetailsHTMLString)

        //sets click handler on #addToCollection and prevents form from being submitted
        $('#addToCollectionBtn').click(function(evt) {
            //prevent form submission
            event.preventDefault();

            //get all form elements from submitted form
            var formArr = $('#priceSelectionForm').serializeArray();

            //get value of the form element (which is our price) and add it to
            // the state.selectedItem object as 'price'
            state.selectedItem.price = formArr[0].value;

            // pushes selectedItems into the state.userCollection array
            state.userCollection.push(state.selectedItem);

            // =null resets the state to blank search page
            state.selectedItem = null;
            state.searchResults = null;

            // state.userCollection holds our collection. it is an array
            // for every element in state.userCollection array create a line
            // Lines 124 through 128 do the exact same thing as 130
            // var collectionHTMLArray = [];
            // for(var i=0; i<state.userCollection.length; i++){
            //    collectionHTMLArray.push('<p style="color:white">Hello</p>');
            // }

            var collectionHTMLArray = state.userCollection.map(function(album) {
                return '<p>Artist: ' + album.title.split('-')[0] + '</p>' +
                        '<p>Album: ' + album.title.split('-')[1] + '</p>' +
                        '<p>Year: ' + album.year + '</p>' +
                        '<p>Barcode: ' + album.barcode[0] + '</p>' +
                        '<p>Price: $' + parseFloat(album.price).toFixed(2) + '</p>' +
                        '<img src=' + album.thumb + '>';

            });

            var arrOfPrices = state.userCollection.map(function(album){
              return parseFloat(album.price).toFixed(2);
            });

            var sum = arrOfPrices.reduce(function(a,b){
              return parseFloat(a) + parseFloat(b);
            });

            //add an html element to the beginning of the collectionHTMLArray
            collectionHTMLArray.unshift('<h3>User Collection $' + sum + '</h3>');

            // join that new array to create one string
            var collectionHTML = collectionHTMLArray.join('');

            // insert that html string into the details view
            $('#detailsView').html(collectionHTML);

        });

    });

}
