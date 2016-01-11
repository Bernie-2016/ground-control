var eventTypes = [
	{
		id: 14,
		name: 'Rally',
		defaultValues: {
			name: 'Rally for Bernie',
			description: ''
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
		id: 44,
		name: 'Jan. 23rd Nationwide Bernie Address',
		defaultValues: {
			name: 'Jan 23rd Bernie Livestream Party',
			description: 'Bernie has a special message to share with his supporters one week away from the Iowa caucus. Join other volunteers in your area to watch Bernie address all of us live!',
			date: {
				dateTime: new Date('January 23 2016 18:00:00'),
				timeZone: 'US/Eastern'
			}
		},
		adminOnly: false
	}
];

(function(){
	var form = document.getElementById('secondform');	

	form.event_type_id.options[0] = new Option();
	eventTypes.forEach(function(type){
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

	window.location.hash = "type=" + eventType.id;
	var defaults = eventType.defaultValues;	

	clearEvents();
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
	  	console.log(dateMoment.format());
	  	
	  	setEventDate(dateMoment, true);
	  	updateEventTime(dateMoment);

	  	$(form.start_tz).on("change", function(e){
	  		var newDateMoment = dateMoment.tz(e.target.value);
	  		setEventDate(newDateMoment, true);
	  		updateEventTime(newDateMoment);
	  		console.log(newDateMoment.format());
	  	});
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
