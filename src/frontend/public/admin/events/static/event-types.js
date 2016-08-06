function dynamicSort(property) {
	var sortOrder = 1;
	if(property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a,b) {
		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * sortOrder;
	}
}

var eventTypes = [
	/*{
		id: 'rally',
		name: 'Rally (Official Campaign Event)',
		defaultValues: {
			name: 'Rally for Bernie',
			description: 'Join Bernie Sanders and local leaders for a rally to discuss the major issues facing our country.',
			is_official: true
		},
		disabled: ['contact_phone'],
		adminOnly: true
	},
	*/
	// {
	// 	id: 'volunteer-meeting',
	// 	name: 'Volunteer Activity or Meeting',
	// 	adminOnly: false,
	// 	nonAdminOnly: false,
	// 	disabled: ['use_shifts']
	// },
	// {
	// 	id: 'organizing-meeting',
	// 	name: 'Official Organizing Meeting',
	// 	adminOnly: true,
	// 	disabled: ['use_shifts']
	// },
	// {
	// 	id: 'debate-watch',
	// 	name: 'Debate Watch Party',
	// 	adminOnly: false,
	// 	disabled: ['use_shifts']
	// },
	// {
	// 	id: 'carpool',
	// 	name: 'Carpool',
	// 	adminOnly: false,
	// 	disabled: ['use_shifts', 'attendee_volunteer_show', 'host_receive_rsvp_emails'],
	// 	labels: {
	// 		'host_receive_rsvp_emails': 'Receive an email when people join my carpool',
	// 		'attendee_volunteer_show': 'Ask riders to help out',
	// 	},
	// 	defaultValues: {
	// 		public_phone: 1,
	// 		venue_name: 'My car',
	// 		name: 'Carpool From [HOME CITY] to [DESTINATION CITY]',
	// 		is_searchable: true,
	// 		rsvp_use_reminder_email: true,
	// 		rsvp_email_reminder_hours: 24,
	// 		duration_num: 2,
	// 		duration_unit: 60,
	// 		attendee_volunteer_message: 'If you can chip in for gas and snacks, please sign up as a volunteer. Thanks!',
	// 		host_receive_rsvp_emails: true,
	// 		attendee_volunteer_show: true,
	// 		description: '<a href="http://bernie.to/distance-faq">Click here to view Carpool FAQs</a><p>Join me and other Bernie supporters for a road trip!</p><p>I’ll be leaving on [WRITE YOUR DEPARTURE DATE/TIME HERE] and returning on [WRITE YOUR RETURN DATE/TIME HERE].</p><p>We’re going to hit the road for Bernie to the help out in the crucial final days before the election. Bernie staff on the ground will train us and plug us into the campaign so that we can be as effective as possible.</p><p>Victory will require all of us pitching in, so sign up and let’s go on a Bernie Journey!</p>'
	// 	}
	// },
	// {
	// 	id: 'ballot-access',
	// 	name: 'Gather Ballot Access Signatures',
	// 	defaultValues: {
	// 		name: 'Bernie Ballot Blast - NJ Support Bernie and his Delegates and Collect Petition Signatures',
	// 		description: 'Please stop by and sign petitions to put Bernie and his delegates on the New Jersey Democratic Primary Ballot. All petitions are due in on Monday, so we need you to act now. It takes just a few minutes to sign the petition and spread the Bern!',
	// 	},
	// 	adminOnly: false,
	// 	disabled: ['use_shifts']
	// },
	// {
	// 	id: 'phonebank',
	// 	name: 'Phonebank',
	// 	defaultValues: {
	// 		name: 'Phone banking for Bernie',
	// 		description: 'Join other volunteers in your area to make phone calls for Bernie. This is a great opportunity to meet other Bernie supporters, make calls to voters, and help make a big impact in our campaign for President. Please bring a laptop, phone, chargers, and any extra batteries you have.',
	// 	},
	// 	adminOnly: false
	// },
	// {
	// 	id: 'canvass',
	// 	name: 'Canvass',
	// 	defaultValues: {
	// 		name: 'Door knocking for Bernie',
	// 		description: 'You\'re invited to join your neighbors and supporters to knock on the doors of supporters and undecided voters. We\'ll provide you with a script, a list of voters that you\'ll be talking to, and a map of where to go. We\'ll also train you to use your time effectively out in the field. You\'ll be able to talk to real people about how this country belongs to all of us, not just the billionaire class. Our victory starts with us knocking on doors together.',
	// 		is_official: true
	// 	},
	// 	adminOnly: false,
	// 	disabled: ['attendee_volunteer_show', 'use_shifts']
	// },
	// {
	// 	id: 'canvass-3-shifts',
	// 	name: 'Canvass - 3 Standard Shifts',
	// 	defaultValues: {
	// 		name: 'Door knocking for Bernie',
	// 		description: 'You\'re invited to join your neighbors and supporters to knock on the doors of supporters and undecided voters. We\'ll provide you with a script, a list of voters that you\'ll be talking to, and a map of where to go. We\'ll also train you to use your time effectively out in the field. You\'ll be able to talk to real people about how this country belongs to all of us, not just the billionaire class. Our victory starts with us knocking on doors together.',
	// 		is_official: true
	// 	},
	// 	adminOnly: true,
	// 	disabled: ['attendee_volunteer_show', 'use_shifts']
	// },
	// {
	// 	id: 'canvass-4-shifts',
	// 	name: 'Canvass - 4 Standard Shifts',
	// 	defaultValues: {
	// 		name: 'Door knocking for Bernie',
	// 		description: 'You\'re invited to join your neighbors and supporters to knock on the doors of supporters and undecided voters. We\'ll provide you with a script, a list of voters that you\'ll be talking to, and a map of where to go. We\'ll also train you to use your time effectively out in the field. You\'ll be able to talk to real people about how this country belongs to all of us, not just the billionaire class. Our victory starts with us knocking on doors together.',
	// 		is_official: true
	// 	},
	// 	adminOnly: true,
	// 	disabled: ['attendee_volunteer_show', 'use_shifts']
	// },
	// {
	// 	id: 'canvass-4-shifts-early',
	// 	name: 'Canvass - 4 Standard Shifts (earlier)',
	// 	defaultValues: {
	// 		name: 'Door knocking for Bernie',
	// 		description: 'You\'re invited to join your neighbors and supporters to knock on the doors of supporters and undecided voters. We\'ll provide you with a script, a list of voters that you\'ll be talking to, and a map of where to go. We\'ll also train you to use your time effectively out in the field. You\'ll be able to talk to real people about how this country belongs to all of us, not just the billionaire class. Our victory starts with us knocking on doors together.',
	// 		is_official: true
	// 	},
	// 	adminOnly: true,
	// 	disabled: ['attendee_volunteer_show', 'use_shifts']
	// },
	// {
	// 	id: 'primary-day',
	// 	name: 'GOTV - Primary Day',
	// 	adminOnly: true,
	// 	disabled: ['contact_phone', 'public_phone'],
	// 	defaultValues: {
	// 		name: 'Get Out the Vote For Bernie!',
	// 		description: 'Join other volunteers in the area to help get out the vote for Bernie. You’ll get training, materials, and anything else you might need to put Bernie over the top in the upcoming election. This is the final push, so let’s give it all we’ve got!',
	// 		is_official: true,
	// 		is_searchable: true,
	// 		host_receive_rsvp_emails: false,
	// 		attendee_volunteer_show: false,
	// 		duration_allday: true,
	// 		capacity: 0
	// 	}
	// },
	// {
	// 	id: 'get-out-the-vote',
	// 	name: 'GOTV - 4 Standard Shifts',
	// 	adminOnly: true,
	// 	disabled: ['contact_phone', 'public_phone'],
	// 	defaultValues: {
	// 		name: 'Get Out the Vote For Bernie!',
	// 		description: 'Join other volunteers in the area to help get out the vote for Bernie. You’ll get training, materials, and anything else you might need to put Bernie over the top in the upcoming election. This is the final push, so let’s give it all we’ve got!',
	// 		is_official: true,
	// 		is_searchable: true,
	// 		host_receive_rsvp_emails: false,
	// 		attendee_volunteer_show: false,
	// 		duration_allday: true,
	// 		capacity: 0
	// 	}
	// },
	// {
	// 	id: 'get-out-the-vote-training',
	// 	name: 'Election Day GOTV Training',
	// 	adminOnly: true,
	// 	defaultValues: {
	// 		name: 'Official Get Out the Vote and Election Day Training',
	// 		description: '<p>As we get closer to election day, we need to make sure that we get everyone out to vote for Bernie at the polls!</p><p>This will be one of the most important Bernie organizing meetings of the election. To bring home a victory in New York, we need as many supporters as possible trained to join the “Get Out the Vote” effort and signed up for volunteer shifts to help in the final push.</p><p>This is how we win!</p><p>This event is being organized by the Bernie Sanders Official Campaign in conjunction with the Working Families Party and local grassroots Bernie organizers.</p><p>Email questions to <a href="mailto:wfp4bernie@workingfamilies.org">wfp4bernie@workingfamilies.org</a><p>',
	// 		is_official: true,
	// 		is_searchable: true,
	// 		capacity: 0
	// 	},
	// 	disabled: ['use_shifts']
	// },
	// {
	// 	id: 'barnstorm',
	// 	name: 'Barnstorm',
	// 	defaultValues: {
	// 		name: 'Barnstorm Organizing Rally for Bernie',
	// 		description: '<p>Join other local volunteers and grassroots organizers for a “barnstorm" organizing rally and learn how to get to work for Bernie. A Bernie volunteer will present an update from the national campaign, talk about our plan to win and plug you into a voter contact program locally.</p><p>This will be a great opportunity to hear what\'s going on nationally and locally with the campaign, as well as a chance to meet other Bernie supporters from your community. Thank you for all that you\'ve contributed and all the hard work that you\'re about to do!</p>',
	//
	// 		is_official: false,
	// 		attendee_volunteer_show: false,
	// 		host_receive_rsvp_emails: false,
	// 		date: {
	// 			time: '18:30:00',
	// 		},
	// 		duration_num: 90,
	// 		duration_unit: 1,
	// 		cons_name: '',
	// 		cons_email: userEmail,
	// 		rsvp_email_reminder_hours: '24',
	// 	},
	// 	disabled: ['use_shifts'],
	// 	adminOnly: false,
	// 	nonAdminOnly: true
	// },
	// {
	// 	id: 'official-barnstorm',
	// 	name: 'Barnstorm',
	// 	defaultValues: {
	// 		name: 'Bernstorm - Organizing Rally with National Bernie Staff',
	// 		description: '<p>Join other local volunteers and grassroots organizers on [DOW, Month DD] as a representative from the national organizing staff, [STAFF] comes to [STATE] for a series of special organizing events.</p><p>We will discuss how we can rapidly grow our movement in the next several months as we enter the primary season. We will also be discussing local volunteer activities to help the early primary states.</p><p>This will be a great opportunity to hear what\'s going on nationally and locally with the campaign, as well as a chance to meet other Bernie supporters from your community. Thank you for all that you\'ve contributed and all the hard work that you\'re about to do!</p>',
	// 		is_official: true,
	// 		attendee_volunteer_show: true,
	// 		host_receive_rsvp_emails: false,
	// 		date: {
	// 			time: '18:00:00',
	// 		},
	// 		duration_num: 90,
	// 		duration_unit: 1,
	// 		cons_name: 'Bernie 2016',
	// 		cons_email: userEmail
	// 	},
	// 	disabled: ['contact_phone', 'public_phone', 'use_shifts'],
	// 	adminOnly: true
	// },
	// {
	// 	id: 'vol2vol',
	// 	name: 'Vol 2 Vol Turnout Shift',
	// 	defaultValues: {
	// 		name: 'Vol2Vol Turnout Shift',
	// 		description: '<div class="description"><p>Five minutes before your calling time, navigate to <a href="http://hubdialer.com/agent">hubdialer.com/agent</a>.</p><p>You can find the login codes and various tips in the FAQ: <a href="http://bernie.to/vol2volFAQ">http://bernie.to/vol2volFAQ</a></p><p>If it&#39;s your first time calling, read through the instructions and familiarize yourself with the script.</p><p>We encourage you to hop onto Slack and ask questions, raise concerns, and revel in your successes with us in real time! Here&#39;s a short video to get you set up: <a href="https://www.youtube.com/watch?v=2_BaZ4_9M6M"><u>https://www.youtube.com/watch?v=2_BaZ4_9M6M</u></a></p><p>Please keep in mind we\'re relying on you to fulfill your commitment. If you\'re not able to call for the full two hours, come online when you can and call for the time that you\'re able.</p><p>It&#39;s an honor to have you on the team!</p></div>',
	// 		is_searchable: 0,
	// 		is_official: true,
	// 		rsvp_email_reminder_hours: 4,
	// 		date: {
	// 			time: '17:00:00',
	// 		},
	// 		duration_num: 2,
	// 		duration_unit: 60,
	// 		venue_name: 'HubDialer (online event)',
	// 		venue_zip: '05401',
	// 		venue_city: 'Burlington',
	// 		venue_state_cd: 'VT',
	// 		start_tz: 'US/Eastern',
	// 		cons_name: 'Robert Reeves'
	// 	},
	// 	disabled: ['contact_phone', 'public_phone'],
	// 	adminOnly: true
	// },
	// {
	// 	id: 'voter-registration',
	// 	name: 'Voter Registration',
	// 	defaultValues: {
	// 		name: 'Register Voters in [CITY/NEIGHBORHOOD]',
	// 		description: 'Join us to register (and properly re-register!) our neighbors to vote. If we work together, we can register the necessary voters to bring us closer to a huge voter turnout –– and when voters turn out, we win.',
	// 		duration_num: 3,
	// 		duration_unit: 60
	// 	},
	// 	adminOnly: false
	// },
	{
		id: 'our-revolution-kickoff',
		name: 'Our Revolution Organizing Kickoff',
		defaultValues: {
			name: 'August 24th Our Revolution Organizing Kickoff',
			description: "On August 24th, 2016, we'll launch Our Revolution with a big Organizing Kickoff to get to work fighting for the political revolution—through November and beyond. Bernie will speak via livestream at 9 ET / 6 PT and lay out the path forward for our movement. We recommend arriving at least 30 minutes before the livestream starts.",
			date: {
				dateTime: new Date('August 24 2016 20:30:00'),
				timeZone: 'US/Eastern'
			},
			duration_num: 1,
			duration_unit: 60
		},
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
].sort(dynamicSort("name"));

var shiftSchema = null;

jQuery(document).ready(function() {
	var form = document.getElementById('secondform');

	$.ajax("/events/shift-schema.json")
	  .done(function(result) {
	  	shiftSchema = result;
	  })
	  .fail(function() {
	    console.log( "error fetching data" );
	  })
	  .always(function() {
	    generateShiftInputs();
	  });

	form.event_type_id.options[0] = new Option();
	eventTypes.forEach(function(type){
		// Don't show admin only event types on public form
		if (isPublic && type.adminOnly) {
			return
		};
		// Don't show public only event types on admin form
		if (!isPublic && type.nonAdminOnly) {
			return
		};
		form.event_type_id.options[form.event_type_id.options.length] = new Option(type.name, type.id);
	});

	form.event_type_id.selectedIndex = -1;

	$(form.event_type_id).on("change", function(e){
		setDefaults(e.target.value);
	});

	$(form.use_shifts).on("change", function(e){
		if (this.checked){
			$("#date-input-group")
				.hide()
				.find("input, select")
				.attr("disabled", true);
			$("#shift-wrapper")
				.show()
				.find("input, select")
				.removeAttr("disabled");
		}
		else{
			$("#shift-wrapper")
				.hide()
				.find("input, select")
				.attr("disabled", true);
			$("#date-input-group")
				.show()
				.find("input, select")
				.removeAttr("disabled");
		}
	});

	$("#add-shift").on("click", function(e){
		$(".shift-input-group")
			.last()
			.clone()
			.appendTo("#shift-inputs");
		if ($(".shift-input-group").length > 2)
			$("#remove-shift").show();
	});

	$("#remove-shift").on("click", function(e){
		$(".shift-input-group")
			.last()
			.remove()
		if ($(".shift-input-group").length <= 2)
			$(this).hide();
	});

	function generateShiftInputs(shiftSchema){
		var start = $(".time-inputs")
			.first()
			.clone();
		var end = $(".time-inputs")
			.first()
			.clone()
			.append("<br/>");
		end.find(".time-type").each(function() {
			$(this).html("End");
		});
		end.find("select").each(function() {
			$(this).attr("name", 'end_time[' + $(this).attr('name').split("[")[1]);
		});

		start.appendTo(".shift-input-group");
		end.appendTo(".shift-input-group");

		$("#add-shift").click();

		$("#shift-wrapper")
			.hide()
			.find("input, select")
			.attr("disabled", true);
	}
})

var disabledInputs = [];
function resetForm(){
	var form = document.getElementById('secondform');

	$(form.start_tz).off("change");
	clearEvents();
	updateFormValue('is_official', true);
	updateFormValue('cons_email', userEmail);
	updateFormValue('attendee_volunteer_show', false);
	$("label, select, input").show();
	$("#event_repeat_type").change();

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
			if ($(input).is(':checkbox')) {
				$(input).attr('checked', false).change()
			}
			else {
				$(input).val('').change()
			}
			$(input).removeProp('required').attr('disabled','disabled').hide();
			$("label[for='" + input.name + "']").hide();
			$("#" + input.name).hide();
		}
	};

	// show default shifts
	if (shiftSchema[eventTypeId] !== undefined) {
		var shifts = shiftSchema[eventTypeId];
		var shiftPreviews = shifts.map(function(shift, index) {
			var shiftNumber = index + 1;
			return '<div class="shift-preview">Shift ' + shiftNumber + ': ' + shift.start + ' to ' + shift.end + ' </div>'
		});

		$('#date-inputs').hide()
			.find("input, select")
			.attr("disabled", true);
		$('#shift-previews').html('<br/>' + shiftPreviews.join('<br/>')).show();
	}
	else {
		$('#date-inputs').show()
			.find("input, select")
			.removeAttr("disabled");
		$('#shift-previews').hide();

		$("#shift-wrapper")
			.hide()
			.find("input, select")
			.attr("disabled", true);
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
	  	var dateMoment;
	  	if (value.dateTime){
	  		dateMoment = moment(value.dateTime).tz(value.timeZone);
	  		setEventDate(dateMoment, true);

	  		$(form.start_tz).on("change", function(e){
	  			var newDateMoment = dateMoment.tz(e.target.value);
	  			setEventDate(newDateMoment, true);
	  			updateEventTime(newDateMoment);
	  		});
	  	}
	  	else if (value.time) {
	  		dateMoment = new moment(value.time, 'HH:mm:ss');
	  	}
	  	else {
	  		return
	  	}

	  	updateEventTime(dateMoment);
	    break;
	  default:
	  	if (typeof value === 'boolean') {
	  		if (form[property]){
	  			form[property].checked = value;
	  		}
	  	}
	  	else {
		    form[property].value = value;
		    form[property].placeholder = value;
	  	}

		  if (property === 'attendee_volunteer_show' || property === 'duration_allday' || property === 'use_shifts')
		  	$('[name="' + property + '"]').change()
		  break
	}
}

function setEventDate(dateMoment, auto_generated) {
	clearEvents();
	addEventDate(dateMoment, auto_generated);
}

function addEventDate(dateMoment, auto_generated) {
	if (moment().subtract(1, 'days') >= dateMoment) {
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
