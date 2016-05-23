var map;
var accesToken;
var markers = [
                {latLng: {lat: 50.9514596, lng: -1.3598909}, 
                info: "TRIGGER NOTAM. PERM AIP AMDT AIRAC 06/2016 PART 2 WEF 26 MAY 2016. CHANGES TO SOUTHAMPTON ATC MINIMUM SURVEILLANCE CHART"},
                {latLng: {lat: 51.1709147, lng: -1.5612896},
                info: "Aviation Centre, Stockbridge, Hampshire SO20 8DY, UK"}
              ];
var endpoint = "https://apidev.rocketroute.com/notam/v1/service"
var icao = $('#user-input').val();
var authEndpoint = "https://fly.rocketroute.com/remote/auth ";
var authRequestBody = "<?xml version=\"1.0\" encoding=\"UTF-8\" ?> <AUTH> <USR>tadeush.voichyshyn@gmail.com</USR> <PASSWD>0a5ddde5faa57c76aaa257f636788ac6</PASSWD> <DEVICEID>1299f2aa8935b9ffabcd4a2cbcd16b8d45691629</DEVICEID> <PCATEGORY>RocketRoute</PCATEGORY> <APPMD5>2c91e99a107360c33e176b639d857959</APPMD5> </AUTH>"

function initMap() {
  map = new google.maps.Map(document.getElementById('map-container'), {
    center: {lat: 51.5287718, lng: -0.2416802},
    zoom: 8
  });
}

function generateRequstBody(icao){
  var body = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
             "<REQWX>" +
             "<USR>tadeush.voichyshyn@gmail.com</USR>" +
             "<PASSWD>0a5ddde5faa57c76aaa257f636788ac6</PASSWD>" +
             "<ICAO>" + icao + "</ICAO>" +
             "</REQWX>"
  return body
  
};

function performNotamRequest(){
  $.post(endpoint, generateRequstBody(icao), function(data){
    parseResponse(data);
    placeMarkers(markers);
  }, "xml")
};

function rerformAuthRequest(){
  $.post(authEndpoint, authRequestBody, function(data){
    retrieveSessionToken(data);
  })
}

function parseResponse(data){
  var itemq = $(data).find('notamset').find('notam').each(function(i, el){
    var coords = $(el).find('itemq').text();
    var info = $(el).find('iteme').text();
    markers.push(getCoords(coords, info));
  })
}

function getCoords(coords, info){
  // parse coords and return object with lat/long for marker initialization and info for textbox
  // {latLng: {lat: 50.966011, lng: -1.374120}, info: "LIT MULTIPLE CONSTRUCTION SITE CRANES OPR (LONG TERM) WI 0.25NM RADIUS 505707N 0012039W (SOUTHAMPTON) MAX HGT 150FT AGL 330FT AMSL"}
}

function placeMarkers(points){
  var image = 'marker.png';

  points.forEach(function(obj){
    var marker = new google.maps.Marker({
      position: obj.latLng,
      map: map,
      icon: image
    });

    var infowindow = new google.maps.InfoWindow({
      content: infoWindowContent(obj.info)
    });

    marker.addListener('click', function() {
      infowindow.open(map, marker);
    });
  });

}

function infoWindowContent(info){
  var content = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h2 id="firstHeading" class="firstHeading">Info</h2>'+
      '<div id="bodyContent">'+
      '<p>' + info + '</p>' +
      '</div>'+
      '</div>';
  return content;
};

function retrieveSessionToken(data){
  if ($(data).find('result').text() == 'ERROR') {
    // handle error depend on message received
  } else {
    // store access token for the briefing pack and shop API requests. as per documentation
    accesToken = $(data).find('key').text();
  }

};

$('#search').on("click", function(){
  // performNotamRequest();
  // function is stubbed because of problems with endpoint.
  placeMarkers(markers);
});

$(document).ready(rerformAuthRequest());
