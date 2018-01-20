// Foursquare API
const CLIENT_ID = "2RGJRRNCCC0J01BA4ADEYBECTWOHMCXYPJIFF5FKMQXAWESB";
const CLIENT_SECRET = "MDTCNLZ3Q1TYTY0SBV3Z5WC1MSP05U3V2TX3MF0HIESBFNHS";
const LATITUDE = 24.7136;
const LONGITUDE = 46.6753;
const SEARCH_QUERY = "Cookie";
const SEARCH_LIMIT = "10";

const FOURSQUARE_API = "https://api.foursquare.com/v2/venues/search?ll=" + LATITUDE + "," + LONGITUDE +
    "&query=" + SEARCH_QUERY + "&limit=" + SEARCH_LIMIT + "&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20170304";



let map;
// Callback to draw google map using Riyadh's latitude and longtitude
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: LATITUDE,
            lng: LONGITUDE
        },
        zoom: 8
    });
}

//Handel Map error
function onMapError() {
    alert("Google Maps could not be loaded.");
}