// This example displays an address form, using the autocomplete feature
// of the Google Places API to help users fill in the information.

var placeSearch, autocomplete;
var componentForm = {
    venue_addr1: 'venue_addr1',
    venue_addr2: 'venue_addr2',
    venue_city: 'venue_city',
    venue_state_cd: 'venue_state_cd',
    venue_country: 'venue_country',
    venue_zip: 'venue_zip'
};

var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'short_name',
    postal_code: 'short_name'
};

window.initAutocomplete = function() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    autocomplete = new google.maps.places.Autocomplete(
        /** @type {!HTMLInputElement} */(document.getElementById('street_number'))
    );

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    autocomplete.addListener('place_changed', fillInAddress);
}

// [START region_fillform]
function fillInAddress() {
    // Get the place details from the autocomplete object.
    var place = autocomplete.getPlace();

    if (! place.address_components) {
        return;
    }

    for (var component in componentForm) {
        document.getElementById(component).value = '';
        document.getElementById(component).disabled = false;
    }

    // Get each component of the address from the place details
    // and fill the corresponding field on the form.
    for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            document.getElementById(addressType).value = val;
        }
    }
    document.getElementById('venue_name').placeholder = place.name;
    document.getElementById('street_number').value += " " + document.getElementById('route').value;
    document.getElementById('route').value = "";

    setDefaultEventTimeZone(place);
}
// [END region_fillform]

// [START region_geolocation]
// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var geolocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            var circle = new google.maps.Circle({
                center: geolocation,
                radius: position.coords.accuracy
            });
            autocomplete.setBounds(circle.getBounds());
        });
    }
}
// [END region_geolocation]

function setDefaultEventTimeZone(place) {
    var url = "https://maps.googleapis.com/maps/api/timezone/json?sensor=false&";
    url += "location=" + place.geometry.location.lat() + "," + place.geometry.location.lng();
    url += "&timestamp=" + Math.round((new Date().getTime())/1000).toString();
    $.ajax({url:url}).done(function(response){
        if(response.timeZoneId != null){
            $("[name=start_tz]").val(response.timeZoneId);
            $("[name=start_tz]").trigger("change");
        }
    });
}

