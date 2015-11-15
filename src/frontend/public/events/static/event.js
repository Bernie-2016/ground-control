BSD.namespace('BSD.event');


 

// Execute this now
YAHOO.util.Event.onDOMReady(function() {
	if(document.event_rsvp.pledge_amt) {
		document.event_rsvp.pledge_amt.value = document.event_rsvp.pledge_amt.value.replace(",","");
	}
});


BSD.event.internationalization = function(country){
    
    if(intl_zip_nomenclature[country.value]){
        //BSD.event.set_zip_label(null,country.value);
        BSD.event.show_zip_label();
        BSD.event.show_zip_row();
        BSD.event.show_radius_row();
        BSD.event.show_sortby_row();
    } else{
        BSD.event.hide_zip_row();
        BSD.event.hide_radius_row();
        BSD.event.hide_sortby_row();
        if(!YAHOO.util.Dom.hasClass('event_zip_row','event_zip_search_txt'))
            BSD.event.hide_zip_label();
    }
    
    if(intl_zip_nomenclature[country.value] != 'US' && intl_zip_nomenclature[country.value] != 'CA'){
        BSD.event.set_state();
    }  
    
    if(country.value == 'US' || country.value == 'CA'){
        BSD.event.show_state_row();
    } else{
        BSD.event.hide_state_row();
    }
    
    BSD.event.set_country(document.getElementById("adv_country"),country.selectedIndex);
    BSD.event.set_country(document.getElementById("simple_country"),country.selectedIndex);
    BSD.event.set_radius_label(country.value);
}

BSD.event.internationalization_admin = function(country){
    
    if(intl_zip_nomenclature[country.value]){
        BSD.event.set_zip_label("zr_zip_txt",country.value);
        BSD.event.show_zip_label("zr_zip_txt");
        BSD.event.show_zip_row("zr_zip_row");
        BSD.event.show_radius_row("zr_radius_row");
    } else{
        BSD.event.hide_zip_row("zr_zip_row");
        BSD.event.hide_radius_row("zr_radius_row");
    }
    
    BSD.event.set_radius_label(country.value);
    
    if(intl_zip_nomenclature[country.value] != 'US' && intl_zip_nomenclature[country.value] != 'CA'){
        BSD.event.set_state();
    }
}

BSD.event.internationalization_host = function(country){
    
    if(intl_zip_nomenclature[country.value]){
        BSD.event.set_zip_label('event_host_zip_txt',country.value);
        BSD.event.show_zip_label('event_host_zip_txt','event_host_zip_and_txt');
        BSD.event.show_zip_row('host_addr_zip');

    } else{
        BSD.event.hide_zip_row('host_addr_zip');
        BSD.event.hide_zip_label('event_host_zip_txt','event_host_zip_and_txt');
    }
    
    if(intl_zip_nomenclature[country.value] != 'US' && intl_zip_nomenclature[country.value] != 'CA'){
        BSD.event.set_state("host_addr_state_cd");
    }
    
}


BSD.event.show_zip_row = function(el_id){
    
    var zip_row = (el_id) ? YAHOO.util.Dom.get(el_id) : YAHOO.util.Dom.get('event_zip_row');
    var zip_row_adv = YAHOO.util.Dom.get('event_zip_row_adv');
    
    if(zip_row){
        var fade_anim = new YAHOO.util.Anim(zip_row, { opacity: { to: 1 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim.onStart.subscribe(function(){ zip_row.style.display = ''; });
        fade_anim.animate();
    }
    if(zip_row_adv){
        var fade_anim_adv = new YAHOO.util.Anim('event_zip_row_adv', { opacity: { to: 1 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim_adv.onStart.subscribe(function(){ zip_row_adv.style.display = ''; });
        fade_anim_adv.animate();
    }
}

BSD.event.hide_zip_row = function(el_id){
    
    var zip_row = (el_id) ? YAHOO.util.Dom.get(el_id) : YAHOO.util.Dom.get('event_zip_row');
    var zip_row_adv = YAHOO.util.Dom.get('event_zip_row_adv');
    
    if(zip_row){
        var fade_anim = new YAHOO.util.Anim(zip_row, { opacity: { to: 0 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim.onComplete.subscribe(function(){ zip_row.style.display = 'none'; });
        fade_anim.animate();
    }
    if(zip_row_adv){
        var fade_anim_adv = new YAHOO.util.Anim('event_zip_row_adv', { opacity: { to: 0 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim_adv.onComplete.subscribe(function(){ zip_row_adv.style.display = 'none'; });
        fade_anim_adv.animate();
    }
}

BSD.event.set_zip_label = function(el_id,countrycode){
    
    var zip_label = (el_id) ? YAHOO.util.Dom.get(new Array(el_id)) : YAHOO.util.Dom.get(new Array("event_zip_txt","event_zip_txt_adv"));
    var new_zip_label = intl_zip_nomenclature[countrycode];

    if(new_zip_label && zip_label){
        for(x=0;x<zip_label.length;x++){
            if(zip_label[x])
                zip_label[x].innerHTML = new_zip_label;
        }
    }
    
}

BSD.event.hide_zip_label = function(el_id1,el_id2){
    
    var zip_label = (el_id1) ? YAHOO.util.Dom.get(el_id1) : YAHOO.util.Dom.get("event_zip_txt");
    var zip_and_txt = (el_id2) ? YAHOO.util.Dom.get(el_id2) : YAHOO.util.Dom.get("event_zip_and_txt");
    
    if(zip_label)
        YAHOO.util.Dom.setStyle(zip_label,'display','none');
    
    if(zip_and_txt)
        YAHOO.util.Dom.setStyle(zip_and_txt,'display','none');
    
}

BSD.event.show_zip_label = function(el_id1,el_id2){
    
    var zip_label = (el_id1) ? YAHOO.util.Dom.get(el_id1) : YAHOO.util.Dom.get("event_zip_txt");
    var zip_and_txt = (el_id2) ? YAHOO.util.Dom.get(el_id2) : YAHOO.util.Dom.get("event_zip_and_txt");
    
    if(zip_label)
        YAHOO.util.Dom.setStyle(zip_label,'display','');
    
    if(zip_and_txt)
        YAHOO.util.Dom.setStyle(zip_and_txt,'display','');
}
 
BSD.event.set_state = function(el_id){
    
    var state_list = (el_id) ? YAHOO.util.Dom.get(el_id) : YAHOO.util.Dom.get("venue_state_cd");
    
    if(state_list)
        state_list.options[state_list.options.length-1].selected = true;
}

BSD.event.hide_radius_row = function(){
    var radius_row = YAHOO.util.Dom.get('event_radius_row');
    var radius_row_adv = YAHOO.util.Dom.get('event_radius_row_adv');
    if(radius_row){
        var fade_anim = new YAHOO.util.Anim('event_radius_row', { opacity: { to: 0 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim.onComplete.subscribe(function(){ radius_row.style.display = 'none'; });
        fade_anim.animate();
    }
    if(radius_row_adv){
        var fade_anim_adv = new YAHOO.util.Anim('event_radius_row_adv', { opacity: { to: 0 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim_adv.onComplete.subscribe(function(){ radius_row_adv.style.display = 'none'; });
        fade_anim_adv.animate();
    }
}

BSD.event.show_radius_row = function(){
    
    var radius_row = YAHOO.util.Dom.get('event_radius_row');
    var radius_row_adv = YAHOO.util.Dom.get('event_radius_row_adv');
    if(radius_row){
        var fade_anim = new YAHOO.util.Anim('event_radius_row', { opacity: { to: 1 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim.onStart.subscribe(function(){ radius_row.style.display = ''; });
        fade_anim.animate();
    }
    if(radius_row_adv){
        var fade_anim_adv = new YAHOO.util.Anim('event_radius_row_adv', { opacity: { to: 1 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim_adv.onStart.subscribe(function(){ radius_row_adv.style.display = ''; });
        fade_anim_adv.animate();
    }
    
}

BSD.event.set_radius_label = function(countrycode){
    
    var radius_label = YAHOO.util.Dom.get(new Array("event_radius_unit","event_radius_unit_adv"));
    
    if(radius_label){
        for(x=0;x<radius_label.length;x++){
            if(radius_label[x])
                radius_label[x].innerHTML = (countrycode && countrycode != 'US') ? BSD.event.dict.glossary.kilometers_lowercase : BSD.event.dict.glossary.miles_lowercase;
        }
    }
    
}

BSD.event.set_country = function(select_el,selected_index){
    
    if(select_el){
        select_el.options[selected_index].selected = true;
    }
    
}

BSD.event.show_state_row = function(){
    
    var state_row = YAHOO.util.Dom.get('event_state_row');
    var state_or_row = YAHOO.util.Dom.get('event_state_row_or');
    var state_row_adv = YAHOO.util.Dom.get('event_state_row_adv');
    
    if(state_row){
        var fade_anim = new YAHOO.util.Anim('event_state_row', { opacity: { to: 1 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim.onStart.subscribe(function(){ state_row.style.display = ''; });
        fade_anim.animate();
    }
    if(state_or_row){
        var fade_anim_or = new YAHOO.util.Anim('event_state_row_or', { opacity: { to: 1 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim_or.onStart.subscribe(function(){ state_or_row.style.display = ''; });
        fade_anim_or.animate();
    }
    if(state_row_adv){
        var fade_anim_adv = new YAHOO.util.Anim('event_state_row_adv', { opacity: { to: 1 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim_adv.onStart.subscribe(function(){ state_row_adv.style.display = ''; });
        fade_anim_adv.animate();
    }
}

BSD.event.hide_state_row = function(){
    
    var state_row = YAHOO.util.Dom.get('event_state_row');
    var state_or_row = YAHOO.util.Dom.get('event_state_row_or');
    var state_row_adv = YAHOO.util.Dom.get('event_state_row_adv');
    
    if(state_row){
        var fade_anim = new YAHOO.util.Anim('event_state_row', { opacity: { to: 0 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim.onComplete.subscribe(function(){ state_row.style.display = 'none'; });
        fade_anim.animate();
    }
    if(state_or_row){
        var fade_anim_or = new YAHOO.util.Anim('event_state_row_or', { opacity: { to: 0 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim_or.onComplete.subscribe(function(){ state_or_row.style.display = 'none'; });
        fade_anim_or.animate();
    }
    if(state_row_adv){
        var fade_anim_adv = new YAHOO.util.Anim('event_state_row_adv', { opacity: { to: 0 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim_adv.onComplete.subscribe(function(){ state_row_adv.style.display = 'none'; });
        fade_anim_adv.animate();
    }
}

BSD.event.hide_sortby_row = function(){
    
    var sortby_row = YAHOO.util.Dom.get('event_adv_sortby_row');
    
    if(sortby_row){
        var fade_anim = new YAHOO.util.Anim('event_adv_sortby_row', { opacity: { to: 0 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim.onComplete.subscribe(function(){ sortby_row.style.display = 'none'; });
        fade_anim.animate();
        var orderby_select = YAHOO.util.Dom.getElementsBy(function(el) { if(el.getAttribute("name") == 'orderby') return true; else return false;}, 'select', sortby_row);
        if(orderby_select) orderby_select[0].value = 'day';
    }
    
}

BSD.event.show_sortby_row = function(){
    
    var sortby_row = YAHOO.util.Dom.get('event_adv_sortby_row');
    
    if(sortby_row){
        var orderby_select = YAHOO.util.Dom.getElementsBy(function(el) { if(el.getAttribute("name") == 'orderby') return true; else return false;}, 'select', sortby_row);
        if(orderby_select) orderby_select[0].value = 'zip_radius';
        var fade_anim = new YAHOO.util.Anim('event_adv_sortby_row', { opacity: { to: 1 } }, 0.66, YAHOO.util.Easing.easeOut);
        fade_anim.onStart.subscribe(function(){ sortby_row.style.display = ''; });
        fade_anim.animate();
    }
    
}
