/**
 * VenueSuggest
 *
 * This module pulls "did you mean" type results from Yahoo's
 * GeoCoding API and provides a method for backfilling into an
 * event form submission
 *
 * To Use:
 *
 * var venuesuggest_config = {
 *     "form": "secondform",
 *     "name": "venue_name",
 *     "country": "venue_country",
 *     "address1": "venue_addr1",
 *     "address2": "venue_addr2",
 *     "city": "venue_city",
 *     "state": "venue_state_cd",
 *     "zip": "venue_zip",
 *     "container": "venuesuggest",
 *     "results_container": "venuesuggest_results",
 *     "result_template": "venuesuggest_template"
 * };
 *
 * YAHOO.util.Event.onDOMReady(BSD.Event.VenueSuggest.init, venuesuggest_config);
 */

BSD.namespace('BSD.Event');
BSD.Event.VenueSuggest = {};

BSD.Event.VenueSuggest.init = function (event, info, config) {
    var form = $(config["form"]);

    BSD.Event.VenueSuggest.e_name     = form[config["name"]];
    BSD.Event.VenueSuggest.e_country  = form[config["country"]];
    BSD.Event.VenueSuggest.e_address1 = form[config["address1"]];
    BSD.Event.VenueSuggest.e_address2 = form[config["address2"]];
    BSD.Event.VenueSuggest.e_city     = form[config["city"]];
    BSD.Event.VenueSuggest.e_state    = form[config["state"]];
    BSD.Event.VenueSuggest.e_zip      = form[config["zip"]];

    BSD.Event.VenueSuggest.container         = $(config['container']);
    BSD.Event.VenueSuggest.results_container = $(config['results_container']);
    BSD.Event.VenueSuggest.result_template   = $(config['results_template']);

    // add change handlers to each element in venue
    var elements = [config["name"],
                    config["country"],
                    config["address1"],
                    config["address2"],
                    config["city"],
                    config["state"],
                    config["zip"]];

    for (var i in elements) {
        YAHOO.util.Event.addListener (form[elements[i]], "change", BSD.Event.VenueSuggest.update);
    }
};

BSD.Event.VenueSuggest.update = function () {
    // TODO: trim all text fields
    var name     = BSD.Event.VenueSuggest.e_name.value;
    var country  = BSD.Event.VenueSuggest.e_country.options[BSD.Event.VenueSuggest.e_country.selectedIndex].value;
    var address1 = BSD.Event.VenueSuggest.e_address1.value;
    var address2 = BSD.Event.VenueSuggest.e_address2.value;
    var city     = BSD.Event.VenueSuggest.e_city.value;
    var state    = BSD.Event.VenueSuggest.e_state.options[BSD.Event.VenueSuggest.e_state.selectedIndex].value;
    var zip      = BSD.Event.VenueSuggest.e_zip.value;

    // decide whether we have enough info to display venuesuggest
    if (country == "US" && name.length > 0 &&
        ((zip.length > 0) || (city.length > 0 && state.length > 0))) {

        var query = "http://local.yahooapis.com/LocalSearchService/V3/localSearch?appid=blue_address&results=4&output=json&callback=BSD.Event.VenueSuggest.handle_response";

        if (zip.length > 0) {
            query += "&zip=" + escape(zip);
        } else {
            query += "&city=" + escape(city) + "&state=" + escape(state);
        }

        if (address1.length > 0) {
            query += "&address=" + escape(address1);
        }

        query += "&query=" + escape(name);

        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement('script');
        script.type = "text/javascript";
        script.src = query;
        script.setAttribute('id', 'venue-suggest-callback');

        if ($('venue-suggest-callback')) {
            head.replaceChild(script, $('venue-suggest-callback'));
        } else {
            head.appendChild(script);
        }
    } else {
        // hide the box.  not enough info to search on.
        BSD.Event.VenueSuggest.container.style.display = "none";
    }
}

BSD.Event.VenueSuggest.handle_response = function (o) {
    if (!o || !o.ResultSet || !o.ResultSet.totalResultsReturned ||
        o.ResultSet.totalResultsReturned == 0) {
        // hide the box.  no viable results
        BSD.Event.VenueSuggest.container.style.display = "none";
        return;
    }

    if (!(o.ResultSet.Result instanceof Array)) {
        o.ResultSet.Result = [o.ResultSet.Result];
    }

    BSD.Event.VenueSuggest.results_container.setAttribute('aria-busy', 'true');
    BSD.Event.VenueSuggest.results_container.innerHTML = "";

    for (var i = 0; i < o.ResultSet.totalResultsReturned; i++) {
        var result = o.ResultSet.Result[i];

        var element = BSD.Event.VenueSuggest.result_template.cloneNode(true);
        element.id = '';
        element.style.display = "block";

        for (var j in element.childNodes) {
            if (element.childNodes[j].className == "venue_name") {
                element.childNodes[j].innerHTML = result.Title;
            }
            if (element.childNodes[j].className == "venue_address1") {
                element.childNodes[j].innerHTML = result.Address;
            }
            if (element.childNodes[j].className == "venue_address2") {
                var address2 = result.City;

                if (result.City && result.State) {
                    address2 += ', ';
                }

                address2 += result.State;

                if ((result.City || result.State) && result.Phone) {
                    address2 += '&nbsp;&nbsp;&ndash;&nbsp;&nbsp;';
                }

                element.childNodes[j].innerHTML = address2 + result.Phone;
            }
            if (element.childNodes[j].className == "venue_use_this_link") {
                YAHOO.util.Event.addListener(element.childNodes[j], "click", BSD.Event.VenueSuggest.use_address_handler, result);
            }
        }

        BSD.Event.VenueSuggest.results_container.appendChild(element);
        BSD.Event.VenueSuggest.results_container.setAttribute('aria-busy', 'false');
    }

    BSD.Event.VenueSuggest.container.style.display = "block";
};

BSD.Event.VenueSuggest.use_address_handler = function (e, obj) {
    BSD.Event.VenueSuggest.e_name.value     = obj.Title;
    BSD.Event.VenueSuggest.e_address1.value = obj.Address;
    BSD.Event.VenueSuggest.e_city.value     = obj.City;

    var options = jQuery(BSD.Event.VenueSuggest.e_state).children();
    options.each(function(){
        if (this.value == obj.State){
            jQuery(this).attr('selected','selected');
        }
    });

    /* TODO: Zip code lookup
     * Yahoo Local doesn't provide zips.  Ideally, we'd do another
     * Geocode request to get zip code.  This would be easy, but
     * Yahoo doesn't support JSON/callback to get around x-domain
     * restrictions.  The right solution here might just be to leave
     * the user entered (possibly wrong) zip code, then fix on the
     * backend when we do a geocode of the address
     */

    return true;
};
