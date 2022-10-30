//map generation
var map = L.map('map').setView([37.6575, -121.8715], 12);
var markerList = [];

L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    className: 'map-tiles'
}).addTo(map);
var layerGroup = L.layerGroup().addTo(map);

function open_marker(lat, lng) {
  let selected_marker;
  for(let i=0; i<markerList.length; i++){
    let marker = markerList[i];
    console.log(lat)
    console.log(lng)
    if(marker._latlng.lat == lat && marker._latlng.lng == lng) {
      marker.openPopup();
      console.log(marker)
      break;
    }
  }
}

function search_city(query) {
  console.log("Searching for cities... Query: "+query);
  var request = new XMLHttpRequest();
  var url = `https://nominatim.openstreetmap.org/search.php?city=${query}&country=United States&format=jsonv2`
  request.open("GET", url, false);
  request.send();
  var results = JSON.parse(request.responseText);
  return results;
}; 

function search_bar_handler() {
  var city = document.getElementById("search_bar").value; 
  if (city != "") {
    var div = document.getElementById("results_div");
    div.innerHTML = "";
    div.innerHTML = (`
      <p style="font-size: 14px; margin-top: 8px">Loading results...</p>
      <table id="results_table"></table>`
      );
    
    setTimeout(function() {
        run(city);
    }, 100);

    function run(city) {
      var data = search_city(city);
      if (data.length > 0) {
        map.setView([data[0].lat, data[0].lon]);
        layerGroup.clearLayers();
        display_stations(city);
      }
  
      else {
        console.log("No results found for "+city + ". Due to replit storage size limits, we are only serving Oakland, Pleasanton, and Fremont stations for right now.")
  
        div.innerHTML = ( `
        <p style="font-size: 14px; margin-top: 8px">City not found.</p>
        `)
      }
    }
  }
  else {
    console.log("Input cannot be blank.")
  }
}

function title_case(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

function display_stations(city){
  var request = new XMLHttpRequest();
  var url = `/api/get_stations?city=${city}`
  request.open("GET", url, false);
  request.send();
  var stations = JSON.parse(request.responseText);
  
  layerGroup.clearLayers();
  
  for(let i=0; i<stations.length; i++){
    let station = stations[i];
    let marker = L.marker([station.lat, station.lng]);

    let reg, mid, pre, die
    for(let j=0; j<station.prices.length; j++){
      let price = station.prices[j];
      if(price.gasType == "Regular"){
        reg = price.priceTag.replace("US", "");
      }
      else if(price.gasType == "Midgrade"){
        mid = price.priceTag.replace("US", "");
      }
      else if(price.gasType == "Premium"){
        pre = price.priceTag.replace("US", "");
      }
      else if(price.gasType == "Diesel"){
        die = price.priceTag.replace("US", "");
      }

    }

    if(typeof reg === "undefined"){reg="No Price For This Quality Of Gas"}
    if(typeof mid === "undefined"){mid="No Price For This Quality Of Gas"}
    if(typeof pre === "undefined"){pre="No Price For This Quality Of Gas"}
    if(typeof die === "undefined"){die="No Price For This Type Of Gas"}
    
    let popupHTML = (`
    <body>
      <h1>${station.name}</h1>
      <b>Regular Price: </b> ${reg}<br>
      <b>Midgrade Price: </b> ${mid}<br>
      <b>Premium Price: </b> ${pre}<br>
      <b>Diesel Price: </b> ${die}<br>
    </body>
        `);

    marker.bindPopup(popupHTML);

    marker.addTo(layerGroup);
    
    markerList.push(marker);
    let lowest_price = 10000000000000000.00;
    
  }
  
  let lowest_price = 10000000000000000.00;
  let lowest_price_station = {};
  for(let i=0; i<stations.length; i++){
    let station = stations[i]
    let station_price = station.prices[0].priceTag.replace("$", "");

    if(typeof station_price !== 'undefined' && station_price < lowest_price){
      lowest_price = station_price;
      lowest_price_station = station;
    }
  }

  let div = document.getElementById("results_div");
  div.innerHTML = "";
  div.innerHTML = (`
      <p style="font-size: 20px; margin-top: 8px; padding-bottom: 8px; border-bottom: solid; border-bottom-color: #ffffff; border-bottom-width: 1px;">Lowest Prices By Category</p>
      <table id="results_table"></table>`
  );
  let table = document.getElementById("results_table");
  table.innerHTML = "";
  let row, cell, row2, cell2, row3, cell3, row4, cell4;
  
  table.className = "results_table"
  row = table.insertRow(-1);
  row.className = "table_row"
  cell = row.insertCell(0);
  cell.className = "table_cell";
  cell.innerHTML = (`
    <div> 
      <h2 style="margin-top: 4px; margin-left: 12px; margin-bottom: 10px;">Regular</h2>
      <p style="font-size: 12px; margin-left: 12px"><b>Name: </b>${lowest_price_station.name}</p>
      <p style="font-size: 12px; margin: 12px"><b>Price: </b>${lowest_price_station.prices[0].priceTag}</p>
      <div>
        <button class='popup_button' onclick="open_marker(${lowest_price_station.lat}, ${lowest_price_station.lng});">Show On Map</button>
        <button class='popup_button' onclick='window.open("/prediction?price=${lowest_price_station.prices[0].priceTag}&city=${document.getElementById("search_bar").value}");'>Show Price Prediction</button>
      </div>
    </div>
  `);

  row2 = table.insertRow(-1);
  row2.className = "table_row"
  cell2 = row2.insertCell(0);
  cell2.className = "table_cell";
  cell2.innerHTML = (`
    <div> 
      <h2 style="margin-top: 4px; margin-left: 12px; margin-bottom: 10px;">Midgrade</h2>
      <p style="font-size: 12px; margin-left: 12px"><b>Name: </b>${lowest_price_station.name}</p>
      <p style="font-size: 12px; margin: 12px"><b>Price: </b>${lowest_price_station.prices[1].priceTag}</p>
      <div>
        <button class='popup_button' onclick="open_marker(${lowest_price_station.lat}, ${lowest_price_station.lng});">Show On Map</button>
        <button class='popup_button' onclick='window.open("/prediction?price=${lowest_price_station.prices[1].priceTag}&city=${document.getElementById("search_bar").value}");'>Show Price Prediction</button>
      </div>
    </div>
  `);
  
  row3 = table.insertRow(-1);
  row3.className = "table_row"
  cell3 = row3.insertCell(0);
  cell3.className = "table_cell";
  cell3.innerHTML = (`
    <div> 
      <h2 style="margin-top: 4px; margin-left: 12px; margin-bottom: 10px;">Premium</h2>
      <p style="font-size: 12px; margin-left: 12px"><b>Name: </b>${lowest_price_station.name}</p>
      <p style="font-size: 12px; margin: 12px"><b>Price: </b>${lowest_price_station.prices[2].priceTag}</p>
      <div>
        <button class='popup_button' onclick="open_marker(${lowest_price_station.lat}, ${lowest_price_station.lng});">Show On Map</button>
        <button class='popup_button' onclick='window.open("/prediction?price=${lowest_price_station.prices[2].priceTag}&city=${document.getElementById("search_bar").value}");'>Show Price Prediction</button>
      </div>
    </div>
  `);

}