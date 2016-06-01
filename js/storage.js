var storage = {
  models : {
    releases : {},
    prices : {},
    userRecordCollection: {}
  },
  views:{
    releases: {},
    results: {},
    prices:{},
    userRecordCollection:{}
  }
};

function findReleaseModelByUpc(upc){
  return storage.models.releases[upc];
}

function updateReleaseModel(model){
  storage.models.releases[model.upc] = model;
  if(storage.views.results[model.upc])
  {
    delete storage.views.results[model.upc];
  }
  if(storage.views.releases[model.upc])
  {
    delete storage.views.releases[model.upc];
  }
}

function findPriceModel(releaseId, priceId){
  return storage.models.prices[releaseId + '_' + priceId] ;
}

function findUserAlbumByUpc(upc){
  var userAlbum = storage.models.userRecordCollection[upc];
  if(userAlbum){
    return userAlbum;
  } else {
    throw new Error("The user doesn't have an album with UPC = " +upc + ".");
  }
}

function updateUserAlbum(upc, price){
  if(storage.models.userRecordCollection[upc] == null){
    storage.models.userRecordCollection[upc] = {
      upc: upc,
      //condition: price,
      getPrice: price  ? function(){ return findPriceModel(price.release, price.id); } : function(){ return { amount:0.0 }; },
      getRelease : function(){ return findReleaseModelByUpc(upc); }
    };
  } else{
    storage.models.userRecordCollection[upc].condition = price;
  }
  return storage.models.userRecordCollection[upc];
}

function updatePriceModel(releaseId, priceId, price){

  return storage.models.prices[releaseId + '_' + priceId] = price;
}



function findOrCreateViewByKey(collection, key, createView){
  var view = collection[key];
  if(view == null){
    view = createView();
    collection[key] = view;
  }
  return view;
}

function findOrCreateResultViewByUpc(upc, createView){ return findOrCreateViewByKey(storage.views.results, upc, createView); }

function findOrCreateReleaseViewByUpc(upc, createView){ return findOrCreateViewByKey(storage.views.releases, upc, createView); }

function findOrCreatePriceViewByReleaseId(releaseId, createView){ return findOrCreateViewByKey(storage.views.prices, releaseId, createView); }

// function findOrCreateResultViewByUpc(upc, createView){
//   var view  = storage.views.results[upc];
//   if(view == null){
//     view  = createView();
//     storage.views.results[upc] = view;
//   }
//   return view;
// }
//
// function findOrCreateReleaseViewByUpc(upc, createView){
//   var view  = storage.views.releases[upc];
//   if(view == null){
//     view  = createView();
//     storage.views.releases[upc] = view;
//   }
//   return view;
// }
//
// function findOrCreatePriceViewByReleaseId(releaseId, createView){
//   var view  = storage.views.prices[releaseId];
//   if(view == null){
//     view  = createView();
//     storage.views.prices[releaseId] = view;
//   }
//   return view;
// }
