var submitted_state_cd = null;

YAHOO.util.Event.onDOMReady(
    function(){

        var venue_locale = new locale( 
            {
                country_el: 'venue_country',
                region_el: 'venue_state_cd',
                postal_el: 'event_zip_row',
                get_region_row: get_region_row,
                get_postal_row: get_postal_row
            }
        );

        YAHOO.util.Event.addListener(venue_locale.get_country(),"change",
            function(e,venue_locale){ venue_locale.load(); }, venue_locale, true);
        
        var host_locale = new locale( 
            {
                country_el: 'host_addr_country',
                region_el: 'host_addr_state_cd',
                postal_el: 'host_addr_zip',
                get_region_row: get_region_row,
                get_postal_row: get_postal_row
            }
        );

        YAHOO.util.Event.addListener(host_locale.get_country(),"change",
            function(e,host_locale){ host_locale.load(); }, host_locale, true);
    }
);


function get_region_row(){
    var region = YAHOO.util.Dom.get(this.region_el);
    return (region) ? region.parentNode.parentNode : null;
}

function get_postal_row(){
    var zip = YAHOO.util.Dom.get(this.postal_el);
    return (zip) ? zip.parentNode.parentNode : null;
}
