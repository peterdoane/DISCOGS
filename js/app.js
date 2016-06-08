

/** @function getModelFromReleaseSearchResult- creates a formatted object with  * search result data
 * @param {Object} result - Search result data
 * @returns {Object} model - formatted search result data
 */

function getModelFromReleaseSearchResult(result) {
    // Step 1: initialize empty model with default values
    var model = {
        artist: '',
        album: '',
        upc: '',
        cover: '',
        edition: '',
        releaseDate: 0,
        id: ''
    };

    // Step 2: bind each model property from the result if the result has acceptable values

    // bind model.artist and model.album from result.title
    if (result.title) {
        var parts = result.title.split('-');
        switch (parts.length) {
            case 1:
                model.album = parts[0];
                break;
            case 2:
                model.artist = parts[0];
                model.album = parts[1];
                break;
            default:
                model.artists = parts[0];
                parts[0] = '';
                model.album = parts.join('');
        }
        model.artist = model.artist.trim();
        model.album = model.album.trim();
    }

    // bind model.upc from result.barcode
    // Try to rewrite this code in 5 lines.
    if (result.barcode && result.barcode.length > 0) {
        // this logic ignores any barcodes that are not the first one
        model.upc = result.barcode[0];
    }

    // bind model.edition from result.country
    if (result.country) {
        model.edition = result.country;
    }

    // bind model.releaseDate from result.year
    if (result.year) {
        model.releaseDate = parseInt(result.year);
    }

    // bind model.cover from result.thumb
    if (result.thumb) {
        model.cover = result.thumb;
    }

    if (result.catno) {
        model.catno = result.catno;
    }

    if (result.id) {
        model.id = result.id;
    }

    if (result.price) {
      model.price = result.price;
    }

    return model;
}

/** @function getModelFromPriceSuggestionResult- creates a formatted object with  * search result data
 * @param {Object} result - Search result data
 * @param {String} releaseId - number-string from search result
 * @returns {Object} model - formatted search result data
 */

function getModelFromPriceSuggestionResult(result, releaseId) {
    var model = {
        release: releaseId,
        prices: []
    };
    for (var conditionLabel in result) {
        var priceSuggestion = result[conditionLabel];
        var price = {
            release: releaseId,
            condition: conditionLabel,
            amount: priceSuggestion.value,
            currency: priceSuggestion.currency
        };
        model.prices.push(price);
    }
    model.prices = _.sortBy(model.prices, 'amount');
    // Assigns an ID price (do I need an id attached?)
    for (var index = 0; index < model.prices.length; index++) {
        model.prices[index].id = index + 1;
    }
    return model;
}

/** @function bindReleaseModel - creates the html string for search results
 * @param {String} template - HTML string
 * @returns {Object} view - returns HTML with model data from search results
 */


function bindReleaseModel(template, model) {
  debugger;

    var view = template
        .replace(/%album%/g, model.album)
        .replace(/%artist%/g, model.artist)
        .replace(/%edition%/g, model.edition)
        .replace(/%releaseDate%/g, model.releaseDate)
        .replace(/%cover%/g, model.cover)
        .replace(/%upc%/g, model.upc)
        .replace(/%catno%/g, model.catno)
        .replace(/%id%/g, model.id)
        .replace(/%price%/g, model.price);

    return view;
}

function bindPriceModel(template, model) {

    var view = template
        .replace(/%release%/g, model.release)
        .replace(/%condition%/g, model.condition)
        .replace(/%amount%/g, model.amount)
        .replace(/%currency%/g, model.currency)
        .replace(/%id%/g, model.id);

    return view;
}

/**
*@params({model},
{
  REQUIRED
  model.album
  model.artist
  model.edition
  model.releaseDate
  model.cover
  model.upc
  model.catno;
}
  REQUIRED  (templateDOMString (a String)jQuery id selector string for the DOM element you want ot insert the template onto)
 )
*/
function createViewFromModel(model, templateDOMSelector, bindModel) {
    // the jquery object that contains the view template element
    var $template = $(templateDOMSelector);

    // the actual html string from the template
    var template = $template.html();

    var view = bindModel(template, model);
    return view;
}




function appendPriceViewTo(releaseId, parentDOMSelector) {
    var $parent = $(parentDOMSelector);
    if ($parent.size() === 0) {
        console.log('The target parent element does not exist in the DOM so the price information will not be retrieved from Discogs.')
        return;
    }

    var priceUrl = createDiscogsPriceSuggestionUrl(releaseId);

    function handlePriceSuggestionApiResponse(data) {
        //  priceURL used to send Http request
        // 2nd parem callback function when get operation is done run this function
        // data paremeter filled by $.get
        // this function will be called in the future. data depends on what url request returns
        var model = getModelFromPriceSuggestionResult(data, releaseId);
        // viewItemCollection creates empty ARRAY
        var viewItemCollection = [];

        viewItemCollection.push('<span class="price white-text" data-source="condition_' + releaseId + '"></span><br>');

        for (var index = 0; index < model.prices.length; index++) {
            var price = model.prices[index];
            var priceElementId = model.release + '_' + price.id;
            updatePriceModel(model.release, price.id, price);
            var itemView = findOrCreatePriceViewByReleaseId(
                priceElementId,
                function createView() {
                    return createViewFromModel(price, '#price-template', bindPriceModel);
                });
            viewItemCollection.push(itemView);
        }


        // IMPLEMENT SLIDER http://materializecss.com/forms.html
        //    <form action="#">
        //   <p class="range-field">
        //     <input type="range" id="test5" min="0" max="100" />
        //   </p>
        // </form>
        //


        var view = viewItemCollection.join('');
        $parent.append(view);
        var $radios = $('input[name="condition_' + releaseId + '"]');
        var $price = $('span[data-source="condition_' + releaseId + '"]');
        $radios.change(function() {
            var id = parseInt(this.value);
            var price = model.prices[id - 1];
            if (id !== price.id) {
                throw new Error('The wrong price was retrieved.');
            }
            $price.html(price.amount.toFixed(2).toString());
        })

    }

    // $.get - request the site (returns JSON). sends http get request to URL
    $.get(priceUrl, handlePriceSuggestionApiResponse);
}

var $submit, $text, $detailsModule, $searchModule, $userCollectionModule, $cancelAlbum, $carousel, $gotoSearch, $userAlbumList, $userCollectionTotalValue;
var mainModules;

function setMainModule($mainModule) {
    for (var moduleIndex in mainModules) {
        mainModules[moduleIndex].css('display', 'none');
    }
    $mainModule.css('display', 'block');
}

function displaySearchModule() {
    setMainModule($searchModule);
    $('#user-album-list').show();
}

function displayDetailsModule() {
    setMainModule($detailsModule);
    $('#gotoSearch').click(displaySearchModule);

}

function displayUserCollectionModule() {
    setMainModule($userCollectionModule);
    $('#user-album-list').show();
}

function calculateCollectionTotalValue() {
    var value = 0.0;
    for (var album in storage.models.userRecordCollection) {
        storage.models.userRecordCollection[album].price = storage.models.userRecordCollection[album].getPrice();
        // use toFixed() in getPrice function to set decimals to 2?

        if (storage.models.userRecordCollection[album].price == null) { /* no condition was selected yet */ } else {
            value += storage.models.userRecordCollection[album].price.amount;
        }
    }
    return value;
}
var collection = [];
function pushObjects(obj, arr) {
    arr.push(obj);
    return arr;
}
$(document)
    .ready(function() {
        $text = $('#textarea1');
        $submit = $('#search-by-artist-link');
        $searchModule = $('#search-module');
        $detailsModule = $('#details-module');
        $userCollectionModule = $('#user-collection-module');
        mainModules = [$detailsModule, $searchModule, $userCollectionModule];
        $cancelAlbum = $('#cancel-album-button');
        // FIX Cancel album button
        $carousel = $('.carousel')
        $gotoSearch = $('.gotoSearch');
        $userAlbumList = $('#user-album-list');
        $userCollectionTotalValue = $('#user-collection-total-value');

        $("#textarea1").keyup(function(event){
            if(event.keyCode == 13){

                $submit.click();
            }
        });

        $submit.click(function() {

            var query = $text.val();
            var searchUrl = createDiscogsSearchUrl(query, 'release');
            var scriptTag = document.createElement("script");
            scriptTag.setAttribute("src", searchUrl + "&callback=collecton");
            console.log(scriptTag);
            document.body.appendChild(scriptTag);


        });

        $gotoSearch.click(displaySearchModule);

        displaySearchModule();

    });

function collecton(data) {
    var collectionViewItems = [];
    var data = data.data;
    for (var resultIndex = 0; resultIndex < data.results.length; resultIndex++) {
        var result = data.results[resultIndex];
        var model = getModelFromReleaseSearchResult(result);
        // cache the release model by upc
        if (model.upc) {
            updateReleaseModel(model);
        }

        var itemView = findOrCreateResultViewByUpc(model.upc,
            function createView() {
                return createViewFromModel(model, '#search-result-template', bindReleaseModel);

            });

        if (collectionViewItems.indexOf(itemView) === -1) {
            collectionViewItems.push(itemView);
        }

    }
    var collectionView = collectionViewItems.join('');


    //$submit.css('display', 'none');
    $("#search-result-list").append(collectionView);
    $('#user-album-list').hide();
// TODO: make list disappear
    $('.release-details-link').click(function() {
        var upc = $(this).attr('data-upc');
        var model = findReleaseModelByUpc(upc);
        var view = findOrCreateReleaseViewByUpc(upc, function() {
            return createViewFromModel(model, '#release-details-template', bindReleaseModel);
        });
        /*
     testingPriceApi(model.id);
      function testingPriceApi(id){
        console.log('testing price api');

        var releaseId = id;
        appendPriceViewTo(releaseId, '#testing-module');
      };
*/

        var $releaseDiv = $detailsModule.find('.release');

        // add the details view to the DOM
        $releaseDiv.html(view);
        // append the price here and pass the id from the model
        appendPriceViewTo(model.id, '#details-module > .release');
        displayDetailsModule();

        // remove all search results
        $('.search-result').remove();

        /*
        <button
          id="collectionButton"
          data-id="%id%"
          data-condition-input-name="condition_%id%"
          data-upc="%upc%">
          Add to Collection
          </button>
          */
        var $addToCollection = $('#collectionButton');
        $addToCollection.click(function() {
            var id = $addToCollection.attr('data-id');
            var upc = $addToCollection.attr('data-upc');
            var conditionRadio = $('input[name="condition_' + id + '"]:checked');
            var priceModel = findPriceModel(id, conditionRadio.val());
            var userAlbum = updateUserAlbum(upc, priceModel);

            var totalValue = calculateCollectionTotalValue();
            $userCollectionTotalValue.html(formatMoney(totalValue, 2));

            var userAlbumModel = userAlbum.getRelease();

            userAlbumModel.price = userAlbum.price.amount.toFixed();

            var carouselItemView = createViewFromModel(userAlbumModel, '#user-album-carousel-item-template', bindReleaseModel);

            var listItemView = createViewFromModel(userAlbumModel, '#user-album-list-item-template', bindReleaseModel);


            $carousel.removeClass('initialized')
            $carousel.append(carouselItemView);
            $carousel.carousel();


            $userAlbumList.append(listItemView);

            displayUserCollectionModule();
        })
    });

}
