// Foursquare API
const CLIENT_ID = "2RGJRRNCCC0J01BA4ADEYBECTWOHMCXYPJIFF5FKMQXAWESB";
const CLIENT_SECRET = "MDTCNLZ3Q1TYTY0SBV3Z5WC1MSP05U3V2TX3MF0HIESBFNHS";
const LOCATION_CENTER = {
    lat: 24.7136,
    lng: 46.6753
};
const SEARCH_QUERY = "Cookie";
const SEARCH_LIMIT = "10";

const FOURSQUARE_API = "https://api.foursquare.com/v2/venues/search?ll=" + LOCATION_CENTER.lat + "," + LOCATION_CENTER.lng +
    "&query=" + SEARCH_QUERY + "&limit=" + SEARCH_LIMIT + "&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20170304";


let map;
let viewModel = null;
let infoWindow = null;

/**
 *Callback to draw google map using Riyadh's latitude and longtitude
 *https://developers.google.com/maps/documentation/javascript/tutorial
 */
function init() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: LOCATION_CENTER,
        zoom: 15
    });

    //tell knockout to apply binding to ViewModel
    viewModel = new AppViewModel();
    ko.applyBindings(viewModel);

    //load all 5 stores
    viewModel.loadStores(FOURSQUARE_API);
}

//Handel Map error
function onMapError() {
    alert("Google Maps could not be loaded.");
}


/**
 * Add markers to the given bound of map, and add listeners to them.
 *https://stackoverflow.com/questions/44833803/how-to-add-event-listener-to-map-marker-array
 * https://gist.github.com/mbeaty/1261182
 */
function addMarkers() {
    var bounds = new google.maps.LatLngBounds();
    viewModel.stores().forEach(function(clickedLocation) {
        //using bounds help the marker to be zoomed 
        bounds.extend(clickedLocation.marker.position);
        //add marker to the map directly using setMap
        clickedLocation.marker.setMap(map);
        //on marker click, display the windoInfo and bounce it 
        clickedLocation.marker.addListener('click', function(clickedLocation) {
            return function() {
                bounceMarker(clickedLocation.marker);
                infoWindow.open(map, clickedLocation.marker);
                infoWindow.setContent(clickedLocation.infoWindowContent);
            }
        }(clickedLocation));

    });
    //Sets the viewport to contain the given bounds.
    map.fitBounds(bounds);
}


/*
 * shows a marker bouncing animation for 2 seconds on click.
 * https://stackoverflow.com/questions/14657779/google-maps-bounce-animation-on-marker-for-a-limited-period
 * */

function bounceMarker(marker) {
    //check if the marker doesn't bounce, if yes -> animate it : else remove animation
    if (marker.getAnimation() === null) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 2000);
    } else {
        marker.setAnimation(null);
    }
}

/*
 * show filterd location's marker and hide the others 
 * http://eyecatchup.github.io/2011/06/03/the-setvisible-method-for-the-google-maps-marker-class-or-how-to-toggle-marker-icons-with-the-google-maps-v3-javascript-api
 * https://gis.stackexchange.com/questions/209297/google-markers-are-updating-but-not-removing-previous-markers
 */
function updateMarker() {
    var bounds = new google.maps.LatLngBounds();
    viewModel.stores().forEach(function(location) {
        bounds.extend(location.marker.position);
        location.marker.setVisible(location.filteredMarker());
    });
}


/*
 * displays Info Window that conatins a content (usually text or images) in a popup window above the map
 *https://developers.google.com/maps/documentation/javascript/infowindows
 * */

function displayInfoWindow(location) {
    //check if there is a value for each phone and website to display it, and if not display not found.
    let website = location.url !== undefined ? '<a href="' + location.url + '">' + location.url + '</a>' : '<p class="error_message">Website not found.<p/>';
    let phoneNumber = location.phone !== undefined ? '<a href="tel:' + location.phone + '">' + location.phone + '</a></br>' : '<p class="error_message"> Phone number not found.<p />';
    return '<div id="content">' + '<h4 class="locationName">' + location.name + '</h4>' + phoneNumber + website + '</div>';
}


/*
 * Model thet contains the store information
 * */
var StoreModel = function(store) {
    var self = this;

    this.name = store.name;
    this.phone = store.phone;
    this.url = store.url;
    this.lat = store.lat;
    this.lng = store.lng;
    this.infoWindowContent = store.infoWindowContent;
    this.marker = store.marker;
    this.filteredMarker = ko.observable(true);
};


/*
 * The ViewModel for the application.
 * */

var AppViewModel = function() {
    var self = this;

    this.stores = ko.observableArray();
    this.filteredText = ko.observable('');
    //https://stackoverflow.com/questions/39799600/how-to-use-knockoutjs-click-binding-to-create-a-hamburger-menu
    this.isOpen = ko.observable(false);
    this.toggle = function() {
        this.isOpen(!this.isOpen());
    };
    /*
     *Show store info when clicked from the list
     */
    this.showWindowInfo = function(m) {
        bounceMarker(m.marker);
        infoWindow.open(map, m.marker);
        infoWindow.setContent(m.infoWindowContent);
        map.panTo(m.marker.getPosition());
    };


    //https://developers.google.com/maps/documentation/javascript/markers
    //https://stackoverflow.com/questions/1740218/error-handling-in-getjson-calls
    this.loadStores = function(req_url) {
        $.getJSON(req_url, function(store) {
            var venues = store.response.venues;
            venues.forEach(function(venue) {
                var marker = new google.maps.Marker({
                    map: null,
                    animation: google.maps.Animation.DROP,
                    position: { lat: venue.location.lat, lng: venue.location.lng },
                    title: venue.name
                });
                var Venue = new StoreModel({
                    'name': venue.name,
                    'lat': venue.location.lat,
                    'lng': venue.location.lng,
                    'phone': venue.contact.phone,
                    'url': venue.url,
                    'marker': marker
                });
                Venue.infoWindowContent = displayInfoWindow(Venue);

                self.stores.push(Venue);
            });

            // display markers once retrieved
            addMarkers();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert('GetJSON request failed! ' + errorThrown);
        });

        //initlialize info window
        infoWindow = new google.maps.InfoWindow();

        // Subscribe to applyFilter to change Map markes when changed.
        viewModel.applyFilter.subscribe(function() {
            updateMarker();
        });
    };


    //https://stackoverflow.com/questions/47741328/filtering-list-with-knockout
    this.applyFilter = ko.computed(function() {
        var filteredLocation = [];
        for (var i = 0; i < self.stores().length; i++) {
            var currentStore = self.stores()[i];
            //check on store's name 
            if (currentStore.name.toLowerCase().indexOf(self.filteredText().toLowerCase()) !== -1) {
                currentStore.filteredMarker(true);
                filteredLocation.push(currentStore);
            } else {
                currentStore.filteredMarker(false);
            }
        }
        return filteredLocation;
    });
};