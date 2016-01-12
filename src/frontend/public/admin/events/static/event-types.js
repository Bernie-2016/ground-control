var eventTypes = [
	{
		id: 14,
		name: 'Rally (official event)',
		defaultValues: {
			name: 'Rally for Bernie',
			description: '',
			is_official: true
		},
		adminOnly: true
	},
	{
		id: 31,
		name: 'Phonebank',
		defaultValues: {
			name: 'Phone banking for Bernie',
			description: '<p>Join other volunteers in your area to make phone calls for Bernie. This is a great opportunity to meet other Bernie supporters, make calls to voters, and help make a big impact in our campaign for President.</p><p>Please bring a laptop, phone, chargers, and any extra batteries you have.</p>',
		},
		adminOnly: false
	},
	{
		id: 32,
		name: 'Canvass',
		defaultValues: {
			name: 'Door knocking for Bernie',
			description: '<blockquote><p>&ldquo;To win this campaign, all of us must be deeply involved.&rdquo; - Bernie Sanders</p></blockquote><p>You&rsquo;re invited to join your neighbors and supporters to knock on the doors of&nbsp;undecided voters.</p><p>We&rsquo;ll provide you with a script, a list of voters that you&rsquo;ll be talking to, and a map of where to go. We&rsquo;ll also train you to use your time effectively out in the field.</p><p>You&rsquo;ll be able to talk to real people about how this country belongs to all of us, not just the billionaire class. Our victory starts with us knocking on doors together.</p>'
		},
		adminOnly: false
	},
	{
		id: 44,
		name: 'Jan. 23rd Nationwide Bernie Address',
		defaultValues: {
			name: 'Jan 23rd Bernie Livestream Party',
			description: 'Bernie has a special message to share with his supporters one week away from the Iowa caucus. Join other volunteers in your area to watch Bernie address all of us live!',
			date: {
				dateTime: new Date('January 23 2016 18:00:00'),
				timeZone: 'US/Eastern'
			},
			duration_num: 2,
			duration_unit: 60
		},
		adminOnly: false
	}
];

(function(){
	var form = document.getElementById('secondform');	

	form.event_type_id.options[0] = new Option();
	eventTypes.forEach(function(type){
		if (isPublic && type.adminOnly) {
			return
		};
		form.event_type_id.options[form.event_type_id.options.length] = new Option(type.name, type.id);
	});	

	form.event_type_id.selectedIndex = -1;	

	$(form.event_type_id).on("change", function(e){
		setDefaults(e.target.value);
	});
})();

function setDefaults(eventTypeId){
	var form = document.getElementById('secondform');
	$(form.start_tz).off("change");
	
	var eventType = null;
	for (var i = 0; i < eventTypes.length; i++) {
		if (eventTypes[i].id == eventTypeId) {
			eventType = eventTypes[i];
			break
		}
	}
	if (!eventType) {return};	

	setHashValue("type", eventType.id);
	var defaults = eventType.defaultValues;	

	clearEvents();
	updateFormValue('is_official', false);
	form.event_type_id.value = eventType.id;
	for (var property in defaults) {
	  if (defaults.hasOwnProperty(property)) {
	    updateFormValue(property, defaults[property])
	  }
	}
}

function updateFormValue(property, value) {
	var form = document.getElementById('secondform');

	switch (property) {
		case "description":
			CKEDITOR.instances.description.setData(value);
			document.getElementById('description').value = CKEDITOR.instances.description.getData();
	  	break;
	  case "date":
	  	var dateMoment = moment(value.dateTime).tz(value.timeZone);
	  	
	  	setEventDate(dateMoment, true);
	  	updateEventTime(dateMoment);

	  	$(form.start_tz).on("change", function(e){
	  		var newDateMoment = dateMoment.tz(e.target.value);
	  		setEventDate(newDateMoment, true);
	  		updateEventTime(newDateMoment);
	  	});
	    break;
	  case "is_official":
	  	if (form.is_official){
	  		form.is_official.checked = value;
	  	}
	  	break;
	  default:
	    form[property].value = value;
	}
}

function setEventDate(dateMoment, auto_generated) {
	clearEvents();
	addEventDate(dateMoment, auto_generated);
}

function addEventDate(dateMoment, auto_generated) {
	if (moment() >= dateMoment){
		console.error('Event date is in the past!');
		return false;
	};

	var new_events = [{
	  	date: dateMoment.format('YYYY-MM-DD'),
	  	auto_generated: auto_generated,
	  	moment: dateMoment
	  }];

	// Push new event to calendar display and user_created_events array
	user_created_events = $.merge(new_events, user_created_events);
	events_cal.addEvents(new_events);
	return user_created_events;
}

function removeEventDate(dateMoment) {
	// An event exists on this day; remove it from the calendar display
	events_cal.removeEvents(function(event){
	  return event._clndrStartDateObject.format('YYYY-MM-DD') == dateMoment.format('YYYY-MM-DD');
	});

	// Remove events on this date from the given arrays
	user_created_events = removeEventsOnDate(user_created_events);
	generated_events = removeEventsOnDate(generated_events);

	function removeEventsOnDate(array){
		array = jQuery.grep(array, function(event) {
		  return event.date != dateMoment.format('YYYY-MM-DD');
		});
		return array;
	}
}

function clearEvents(){
	user_created_events = [];
	generated_events = [];
	events_cal.setEvents([]);
}

function updateEventTime(dateMoment) {
	var form = document.getElementById('secondform');
	
	var hour = Number(dateMoment.format('hh'));
	hour = (hour == 12) ? '00' : hour;
	form['start_time[h]'].value = hour;
	form['start_time[i]'].value = dateMoment.format('mm');
	form['start_time[a]'].value = dateMoment.format('a');
}

function getHashValue(key) {
  var matches = location.hash.match(new RegExp(key+'=([^&]*)'));
  return matches ? matches[1] : null;
}

function setHashValue(key, value) {
  var hash = window.location.hash;
  var re = new RegExp(key + "=.*?(&|#|$)(.*)", "i");
  var updated_hash = "";
  if (hash.match(re)) {
		if (typeof value !== 'undefined' && value !== null) {
      updated_hash =  hash.replace(re, key + "=" + value + '$1$2');
    }
    else {
	  	updated_hash =  hash.replace(re,'');
    }
  }
  else if (typeof value !== 'undefined' && value !== null) {
		if (hash != "" ) {
			updated_hash = hash + "&";
		}
    updated_hash += key + "=" + value;
  }
  window.location.hash = updated_hash;
}
