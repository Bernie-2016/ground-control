var localeJqueryRef = typeof(bQuery) == "function" ? bQuery : jQuery;

function locale(args) {
    this.load = (args.load_locale) ? args.load_locale : load_locale;
    this.get_country = get_country;
    this.get_region = get_region;
    this.get_postal = get_postal;
    this.region_postal_exceptions = Array();
    this.postal_row = null;
    this.get_region_row = (args.get_region_row) ? args.get_region_row : get_region_row_default;
    this.get_postal_row = (args.get_postal_row) ? args.get_postal_row : get_postal_row_default;
    this.init = false;
    this.skip_postal = (args.skip_postal) ? args.skip_postal : false;
    this.country_el = (args.country_el) ? args.country_el : 'country';
    this.region_el = (args.region_el) ? args.region_el : 'state_cd';
    this.region_el_name = (args.region_el_name) ? args.region_el_name : this.region_el;
    this.postal_el = (args.postal_el) ? args.postal_el : 'zip';
    this.postal_sibling_el = (args.postal_sibling_el) ? args.postal_sibling_el : this.get_region_row();
    this.postal_required_el = (args.postal_el) ? args.postal_required_el : 'zip_required';
    this.postal_error_el = (args.postal_el) ? args.postal_required_el : 'zip_error';
    this.handle_success = (args.handle_success) ? args.handle_success : handle_success;
}

function get_country() {
    return localeJqueryRef('#' + this.country_el);
}

function get_region() {
    return localeJqueryRef('#' + this.region_el);
}

function remove_region_field(){

    var state_el = this.args.get_region();
    var row = this.get_state_row();
    var parent = row.parent;
    parent.removeChild(state_el);
}

function get_postal() {
    return localeJqueryRef('#' + this.postal_el);
}

function load_locale(init) {
    this.init = (init) ? init : false;

    var selected_country = this.get_country().val();
    var submitted_state = (typeof(submitted_state_cd) !== 'undefined') ? submitted_state_cd : '';
    localeJqueryRef.ajax({
        url: '/utils/locale/load_locale.ajax.php?country=' + selected_country+'&region='+submitted_state+'&region_id='+this.region_el,
        dataType: 'json',
        context: this,
        success: this.handle_success,
        error: handle_failure
    });
}

var set_region_attributes = function(oldnode, newnode) {
    oldnode = oldnode[0];
    var multiple = oldnode.getAttribute('multiple');
    var size = oldnode.getAttribute('size');
    var style = oldnode.getAttribute('style');
    var name = oldnode.getAttribute('name');

    if(name) {
        newnode.setAttribute('name', name);
    }

    if(multiple) {
        newnode.setAttribute('multiple', multiple);
    }

    if(size) {
        newnode.setAttribute('size', size);
    }

    if(style) {
        newnode.setAttribute('style', style);
    }
}

var handle_success = function(locale, textStatus, XMLHttpRequest) {
    var state_el = this.get_region();
    var country_el = this.get_country();

    if(state_el){
        var parent = state_el.parent();
        var selected_state = state_el.val();
    }

    this.region_postal_exceptions = locale.region_postal_exceptions;

    if (!this.init) {

        if (locale.select_html == null) {
            var input = document.createElement('input');
            input.id = this.region_el;
            input.name = this.region_el_name;
        } else {
            input = localeJqueryRef(locale.select_html);
        }

        parent.children().not('label').remove();
        parent.append(input);
        newselect = document.getElementById('state_cd');
        if(newselect) {
            set_region_attributes(state_el, newselect);
        }
    }

    if (!locale.use_zip && (localeJqueryRef.inArray(selected_state, this.region_postal_exceptions) == -1) && !this.skip_postal) {
        var zip = this.get_postal();
        var zip_required = localeJqueryRef('#' + this.postal_required_el);
        var zip_error = localeJqueryRef('#' + this.postal_error_el);

        if (zip_required) {
            zip_required.attr("value", "0");
        }

        if (zip_error) {
            zip_error.hide();
        }

        if (zip) {
            var row = localeJqueryRef(this.get_postal_row());
            this.postal_row = row.clone();
            row.remove();
        }
    }

    if ((locale.use_zip || localeJqueryRef.inArray(selected_state, this.region_postal_exceptions) != -1) && !this.skip_postal) {
        var zip_required = localeJqueryRef('#' + this.postal_required_el);

        if (zip_required) {
            zip_required.attr("value", "1");
        }

        var postal_row = this.get_postal_row();
        if (!postal_row || !localeJqueryRef(postal_row).html()) {
            var region_row = localeJqueryRef(this.get_region_row());
            localeJqueryRef(this.postal_row).insertAfter(this.postal_sibling_el);
        }

    }

    // add a listener to deal with region level postal exceptions
    if (this.region_postal_exceptions.length > 0 && !this.skip_postal) {
        var context = this;
        localeJqueryRef('#' + this.region_el).change(function () {
            if (localeJqueryRef.inArray(this.value, context.region_postal_exceptions) != -1) {
                localeJqueryRef(context.postal_row).insertAfter(context.get_region_row());
            } else {
                var row = context.get_postal_row();
                if (row && localeJqueryRef(row).html()) {
                    context.postal_row = localeJqueryRef(row).clone();
                    localeJqueryRef(row).remove();
                }
            }
        });
    }

    this.init = false;
}

function handle_postal_exceptions(e,args){
    if(args.region_postal_exceptions.in_array(this.value)){
        localJqueryRef(args.postal_row).insertAfter(args.postal_sibling_el);
    } else{
        var row = args.get_postal_row();
        if(row){
            args.postal_row = args.get_postal_row().cloneNode(true);
            row.parentNode.removeChild(row);
        }
    }

}

var handle_failure = function(XMLHttpRequest, textStatus, errorThrown) {
    // in the event the ajax request fails, we'll leave the user with a text input
    var state_el = localeJqueryRef('#' + this.region_el);
    var parent = state_el.parent();
    var input = document.createElement('input');
    input.id = this.region_el;
    parent.append(input);
}

function get_region_row_default() {
    var region = this.get_region();
    return (region) ? region.closest('tr').parent().closest('tr') : null;
}

function get_postal_row_default() {
    var postal = this.get_postal();
    return (postal) ? postal.closest('tr').parent().closest('tr') : null;
}

Array.prototype.in_array = function(str){

    for(i = 0; i < this.length; i++){

        if(this[i] == str){
            return true;
        } else{
            continue;
        }
    }

    return false;
}
