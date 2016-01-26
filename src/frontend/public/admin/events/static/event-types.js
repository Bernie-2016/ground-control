var eventTypes = [
	{
		id: 14,
		name: 'Rally',
		defaultValues: {
			name: 'Rally for Bernie',
			description: 'Join Bernie Sanders and local leaders for a rally to discuss the major issues facing our country.',
			is_official: false
		},
		disabled: ['contact_phone'],
		adminOnly: true
	},
	{
		id: 30,
		name: 'Gather Ballot Access Signatures',
		defaultValues: {
			name: 'Bernie Ballot Blast - PA Support Bernie and his Delegates and Collect Petition Signatures',
			description: 'We only have 3 weeks to get all the needed signatures to get Bernie on the Ballot and get his Delegates nominated for the Democratic Convention.  Sign up for your local events scheduled between January 26th and February 10th.  We can\'t do this without you and you can make the difference in Pennsylvania, one of the most important swing states.  Come join the movement!',
		},
		adminOnly: false
	},
	{
		id: 31,
		name: 'Phonebank',
		defaultValues: {
			name: 'Phone banking for Bernie',
			description: 'Join other volunteers in your area to make phone calls for Bernie. This is a great opportunity to meet other Bernie supporters, make calls to voters, and help make a big impact in our campaign for President. Please bring a laptop, phone, chargers, and any extra batteries you have.',
		},
		adminOnly: false
	},
	{
		id: 32,
		name: 'Canvass',
		defaultValues: {
			name: 'Door knocking for Bernie',
			description: 'You\'re invited to join your neighbors and supporters to knock on the doors of undecided voters. We\'ll provide you with a script, a list of voters that you\'ll be talking to, and a map of where to go. We\'ll also train you to use your time effectively out in the field. You\'ll be able to talk to real people about how this country belongs to all of us, not just the billionaire class. Our victory starts with us knocking on doors together.',
		},
		adminOnly: false
	},
	{
		id: 41,
		name: 'Barnstorm',
		defaultValues: {
			name: 'Bernstorm - Organizing Rally with National Bernie Staff',
			description: '<p>Join other local volunteers and grassroots organizers on <DOW, Month DD> as a representative from the national organizing staff, <STAFF> comes to <State> for a series of special organizing events.</p><p>We will discuss how we can rapidly grow our movement in the next several months as we enter the primary season. We will also be discussing local volunteer activities to help the early primary states.</p><p>This will be a great opportunity to hear what\'s going on nationally and locally with the campaign, as well as a chance to meet other Bernie supporters from your community. Thank you for all that you\'ve contributed and all the hard work that you\'re about to do!</p>',
			is_official: true,
			attendee_volunteer_show: true
		},
		disabled: ['contact_phone'],
		adminOnly: false
	}
	// { // Keep this event type in as an example for providing extra default values
	// 	id: 44,
	// 	name: 'Jan. 23rd Nationwide Bernie Address',
	// 	defaultValues: {
	// 		name: 'Jan 23rd Bernie Livestream Party',
	// 		description: 'Bernie has a special message to share with his supporters one week away from the Iowa caucus. Join other volunteers in your area to watch Bernie address all of us live!',
	// 		date: {
	// 			dateTime: new Date('January 23 2016 18:00:00'),
	// 			timeZone: 'US/Eastern'
	// 		},
	// 		duration_num: 2,
	// 		duration_unit: 60
	// 	},
	// 	adminOnly: false
	// }
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

var disabledInputs = [];
function resetForm(){
	var form = document.getElementById('secondform');
	
	$(form.start_tz).off("change");
	clearEvents();
	updateFormValue('is_official', false);

	for (var i = 0; i < disabledInputs.length; i++){
		var input = form[disabledInputs[i].name];
		if (disabledInputs[i].required){
			$(input).prop('required', true);
		}
		$(input).removeAttr('disabled');
	}

	disabledInputs = [];

	return form
}

function setDefaults(eventTypeId){
	var form = resetForm();

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

	form.event_type_id.value = eventType.id;
	
	// add default values
	for (var property in defaults) {
	  if (defaults.hasOwnProperty(property)) {
	    updateFormValue(property, defaults[property])
	  }
	}

	// remove disabled inputs
	if (eventType.disabled){
		var disabled = eventType.disabled;
		for (var i = 0; i < disabled.length; i++){
			var input = form[disabled[i]];
			disabledInputs.push({
				name: disabled[i],
				required: $(input).prop('required')
			});
			$(input).val('').removeProp('required').attr('disabled','disabled');
		}
	};
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
	  default:
	  	if (typeof value === 'boolean') {
	  		if (form[property]){
	  			form[property].checked = value;
	  		}
	  	}
	  	else
		    form[property].value = value;

		  if (property === 'attendee_volunteer_show')
		  	$('#attendee_volunteer_show').change()
		  break
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
