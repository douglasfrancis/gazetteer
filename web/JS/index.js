// Set up map and info icons
var mymap = L.map('map').setView([51.504, -0.09], 5);

L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZG91Z2xhc2ZyYW5jaXMiLCJhIjoiY2tmdjVtbnU1MTEybDJ5czhubjQ4bjY3aiJ9.99eYeX8Ya2HYJofFZqijbQ", {
		maxZoom: 18,
		attribution: `<div id="map-attr">Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, 
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, 
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a></div>`,
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

L.easyButton("fas fa-mountain", function() {
    $('#mountainModal').modal('show');
    getMountains();
        }, "Show Highest Peaks").addTo(mymap);
    

//Get and set location on page load
getLocation = () => {
        
            if (navigator.geolocation)
            { 
                 navigator.geolocation.getCurrentPosition(showPosition);
            }
            else{
                alert("Geolocation is not supported by this browser.");}
            };
         
showPosition = (position) => {
               
             mymap.setView([position.coords.latitude, position.coords.longitude], 5);
         
             L.marker([position.coords.latitude, position.coords.longitude]).addTo(mymap);
             L.popup()
             .setLatLng([position.coords.latitude, position.coords.longitude])
             .setContent('<p>You are here!</p>')
             .openOn(mymap);
             getCountry('United Kingdom');
            };
        
//Get Country names and boundaries

countryList = () => {
    $.ajax({
        url: "../PHP/getCountries.php",
        type: 'GET',
        success: function(result) {
      
        result.data.forEach(element => {
            let name = document.createElement("option");
            name.innerHTML = element.name;
            document.getElementById('sel1').appendChild(name);
          });
                 },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
};

$("select").on("change", function(){
    
    var choice = $('#sel1').val();
    if(choice == '--Select Country--') {
        alert('Please choose a country')
    } else {
        
        getCountry(choice);
        borders.removeFrom(mymap); 
    }
});   

getBorder = (alphaCode) => {

    $.ajax({
        url:"../PHP/getBoundaries.php",
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
let borders= null;

polygon = (coordinate) => {
  
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


//Get Country info from various API's

var capital;

getCountry = (choice) => {
    $.get(`https://restcountries.eu/rest/v2/name/${choice}`, function(data){
        
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
        $('#capital').html(data[0].capital);
        $('#region').html(data[0].region);
        $('#language').html(languages.toString());
        $('#population').html(data[0].population);
        $('#timezone').html(data[0].timezones);
        $('#country-flag').attr("src", data[0].flag);
            
        $('#country-flag').css('width', '100%');
               
        $('#currencyInfo').html(currencies.toString());

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
            $('#exchange').html(`${rates[key]} ${code} to 1 USD`);
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
                 document.getElementById('weatherDesc').innerHTML = weatherDescription;
                 document.getElementById('weatherTemp').innerHTML = `${Math.round(weatherTemp - 273.15)}°C`;
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR, textStatus, errorThrown);
        }
    });
}

// Get highest peak data from local JSON file
getMountains = () => {
    var mountainIcon = L.icon({
        iconUrl: '../images/mountain.png',
        iconSize:     [50, 40], // size of the icon
        iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62],  // the same for the shadow
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });

    if($("#list").html("")){
    $.ajax({
        url:"https://douglasfrancis.github.io/data/mountains.json",
        dataType: "json",
        success: function(result) {
            
           
            result.forEach(mountain => { 
                $("#list").append(`<p id="m${mountain.number}">${mountain.number}. ${mountain.name}</p> `);

                $(`#m${mountain.number}`).append(`<button id="mb${mountain.number}" class="m-btn">Find Me</button>`);

                $(`#mb${mountain.number}`).click(function () {
                    $('#mountainModal').modal('hide');
                    mymap.setView([mountain.coordinates.lat, mountain.coordinates.long], 12);
                });

               L.marker([mountain.coordinates.lat, mountain.coordinates.long], {icon: mountainIcon})
               .addTo(mymap)
               .bindPopup(
                `Name: ${mountain.name}<br/>
                Elevation: ${mountain.elevation}m<br/>
                First Ascent: ${mountain.firstAscent}<br/>
                <a href="${mountain.wiki}" target="_blank">Find Out More</a>
                `);
            })
            
            mymap.setView([33, 81], 6);
        },
        error: function() {
           alert("Unfortunately something went wrong!")
        }
       })
    } else {
        $('#mountainModal').modal('show');
    }
};



