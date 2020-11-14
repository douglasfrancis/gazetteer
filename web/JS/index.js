var mymap = L.map('map').setView([51.504, -0.09], 5);
/*windyInit( options, windyAPI => {
    // windyAPI is ready, and contain 'map', 'store',
    // 'picker' and other usefull stuff

    const { map } = windyAPI;
    // .map is instance of Leaflet map

    L.popup()
        .setLatLng([50.4, 14.3])
        .setContent('Hello World')
        .openOn(map);
});*/

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZG91Z2xhc2ZyYW5jaXMiLCJhIjoiY2tmdjVtbnU1MTEybDJ5czhubjQ4bjY3aiJ9.99eYeX8Ya2HYJofFZqijbQ', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox/streets-v11',
		tileSize: 512,
		zoomOffset: -1
    }).addTo(mymap);
    
L.easyButton("fas fa-info-circle", function() {
$('#infoModal').modal('show');
}, "Country Info").addTo(mymap);

L.easyButton("fas fa-cloud-showers-heavy", function() {

    $('#weatherModal').modal('show');
    }, "Weather").addTo(mymap);

L.easyButton("fas fa-coins", function() {
    $('#currencyModal').modal('show');
        }, "Currency").addTo(mymap);

L.easyButton("fas fa-virus", function() {
    $('#coronaModal').modal('show');
        }, "Coronavirus Stats").addTo(mymap);
        

function getBorder(alphaCode) {

    $.ajax({
        url:"../countries/countries_small.json",
        dataType: "json",
        success: function(result) {
            var countryList = result.features;
            var coordinates = countryList.filter(country => country.id == alphaCode);
            var refined = coordinates[0].geometry.coordinates;
            var i;
            if(refined.length < 2) {
                refined.forEach(coord => polygon(coord))
            } else {
                for (i = 0; i < refined.length; i++) {
                    refined[i].forEach(coord => polygon(coord));
                  }
            }
        },
        error: function() {
           alert("Unfortunately we don't have the boundaries but please still see the country info in the boxes below")
        }
       })
};

var borders;
function polygon(coordinate) {
  
    var myLines = [{
        "type": "LineString",
        "coordinates": coordinate
    }];
    
    var myStyle = {
        "color": "#ff7800",
        "weight": 2,
        "opacity": 0.65
    };
    
    borders = L.geoJSON(myLines, {
        style: myStyle
    }).addTo(mymap); 

    mymap.fitBounds(borders.getBounds());
    
};

function getLocation() {
        
   if (navigator.geolocation)
   { 
        navigator.geolocation.getCurrentPosition(showPosition);
   }
   else{
       alert("Geolocation is not supported by this browser.");}
   }

   function showPosition(position)
   {
      
    mymap.setView([position.coords.latitude, position.coords.longitude], 5);

    L.marker([position.coords.latitude, position.coords.longitude]).addTo(mymap);
    L.popup()
    .setLatLng([position.coords.latitude, position.coords.longitude])
    .setContent('<p>You are here!</p>')
    .openOn(mymap);
    getCountry('United Kingdom');
   }

$("select").on("change", function(){
    
    var choice = $('#sel1').val();
    if(choice == '--Select Country--') {
        alert('Please choose a country')
    } else {
        
        getCountry(choice);
        borders.removeFrom(mymap); 
    }
});    

var capital;

getCountry = (choice) => {
    $.get(`https://restcountries.eu/rest/v2/name/${choice}`, function(data){
        console.log(data)
        var results = data[0].languages;
       var languages = []
        results.forEach(element => {
            languages.push(element.name);
        })
        
        var currencies = []
        data[0].currencies.forEach(element => {
            currencies.push(element.name)
        })
        mymap.setView([data[0].latlng[0], data[0].latlng[1]], 5);
          
        $('#countryName').html(choice);
        $('#countryInfo').html(
           `Capital: ${data[0].capital} <br>
            Region: ${data[0].region} <br>
            Language(s): ${languages.toString()} <br>
            Population: ${data[0].population} <br>
            Timezone(s): ${data[0].timezones.toString()}<br><br>
            <img src=${data[0].flag} id='flag'>
            `);
        $('#flag').css('width', '100%');
            
            
        $('#currencyInfo').html(
            `Currencies: ${currencies.toString()}`
        )
        capital = L.marker([data[0].latlng[0], data[0].latlng[1]]).addTo(mymap);
        L.popup()
        .setLatLng([data[0].latlng[0], data[0].latlng[1]])
        .setContent(data[0].capital)
        .openOn(mymap);

        getWeather(data);
        getExchange(data);
        getBorder(data[0].alpha3Code);

    });
};

getExchange = (results) => {
    let capital = results[0].capital;
    
    $.get(`https://restcountries.eu/rest/v2/capital/${capital}`, function(data) {
    code = data[0].currencies[0].code;
    insertCode(code);
    });

    insertCode = (code) => {
    $.get("https://openexchangerates.org/api/latest.json?app_id=821a381df40a4b008e2057ca3556b6bb", function(data) {
       
        let rates = data.rates;
        Object.keys(rates).forEach(function(key) {
            if(key == code){
            $('#exchange').html(`Exchange Rate: ${rates[key]} ${code} to 1 USD`);
        }
        });
    });
}
};

getWeather = (data) => {
    $.ajax({
        url: "../PHP/getWeather.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: data[0].latlng[0],
            lon: data[0].latlng[1]
        },
        success: function(result) {
        
                 let weatherCode = result.data.weather[0].icon;
                 let weatherDescription = result.data.weather[0].description;
                 let weatherTemp = result.data.temp;

                 document.getElementById('weatherImg').src = `http://openweathermap.org/img/wn/${weatherCode}@2x.png`;
                 document.getElementById('weatherDesc').innerHTML = `Current Weather: ${weatherDescription}`;
                 document.getElementById('weatherTemp').innerHTML = `Current Temperature: ${Math.round(weatherTemp - 273.15)}°C`;
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
}
countryList = () => {

    $.get("https://restcountries.eu/rest/v2", function(data){
      var country = data;
      country.forEach(element => {
        let name = document.createElement("option");
        name.innerHTML = element.name;
        document.getElementById('sel1').appendChild(name);
      });
    });

}

