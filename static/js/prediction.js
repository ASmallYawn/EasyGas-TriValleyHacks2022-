function getParameterByName(name){
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function plot_graph(prediction){
   const labels = [
    'Current',
    'Nov',
    'Dec',
    'Jan',
    'Feb',
    'Mar'
  ];
  const data = {
    labels: labels,
    datasets: [{
      backgroundColor: '#00ace6',
      borderColor: '#00ace6',
      label: 'Price (USD)',
      data: [prediction.Oct, prediction.Nov, prediction.Dec, prediction.Jan, prediction.Feb, prediction.Mar],
    }]
  };
  
  const config = {
    type: 'line',
    data: data,
    options: {
      y: {
        max: 6,
        min: 3,
        ticks: {
    color: '#142ffc'
}
      },

    }
  };
  
  const prediction_chart = new Chart(document.getElementById('prediction_chart'), config);

}

function get_data(){
  const city = getParameterByName("city");
  const price = getParameterByName("price").replace("$", "")

  let request = new XMLHttpRequest();

  var url = `/api/get_prediction?price=${price}&city=${city}`
  request.open("GET", url, false);
  request.send();
  
  document.getElementById('current').innerHTML = "Current Price: $" + price;
  document.getElementById('one_month').innerHTML = "Price in 1 Month: $" + JSON.parse(request.responseText).Nov.toFixed(2);
  document.getElementById('six_months').innerHTML = "Price in 6 Months: $" + JSON.parse(request.responseText).Mar.toFixed(2);
  
  plot_graph(JSON.parse(request.responseText))
}

get_data();
