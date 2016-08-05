var $, events_cal;
var events = [];
var user_created_events = [];
var current_events = [];
var generated_events = [];

jQuery(document).ready(function() {

    $ = jQuery; // For some reason jQuery is not assigned to $

    var eventform = document.forms["secondform"];
    var currentMonth = moment().format('YYYY-MM');
    var nextMonth    = moment().add(1, 'month').format('YYYY-MM');

    events_cal = $('#mini-clndr').clndr({
        template: $('#mini-clndr-template').html(),
        events: events,
        constraints: {
            startDate: moment().format('YYYY-MM-DD'),
            endDate: '2020-12-31'
        },
        clickEvents: {
            click: function(target) {
                if(target.events.length) {
                    removeEventDate(target.date)
                }
                else if(!$(target.element).hasClass('inactive')) {
                    addEventDate(target.date, false);
                }
            }
        },
        adjacentDaysChangeMonth: true,
        forceSixRows: true,
        trackSelectedDate: false,
        ignoreInactiveDaysInSelection: true
    });

    $('#event_repeat_type').on('change', propagateEvents);
    $('#repeat_duration_num').on('change', propagateEvents);
    $('#repeat_duration_unit').on('change', propagateEvents);
    $('#attendee_volunteer_show').on('change', function(){
        if (this.checked){
            $('#avm_block').show();
        }
        else {
            $('#avm_block').hide();
        }
    });
    $('[name="duration_allday"]').on('change', function(){
        if (this.checked){
            $('[name="duration_num"').val('');
            $('[name="duration_unit"').prop('selectedIndex', -1);
        }
    });

    function propagateEvents(e){

        $('#repeat_duration_inputs').show();

        events_cal.removeEvents(function(event){
            return event.auto_generated == true;
        });

        var event_title = eventform.elements["name"].value;
        var event_location = eventform.elements["venue_name"].value;

        var max_days = eventform.elements["repeat_duration_num"].value * eventform.elements["repeat_duration_unit"].value;
        current_events = [];
        generated_events = [];

        // Determine how to propagate events
        switch (eventform.elements["event_repeat_type"].value) {
            case "never":
                // Event will not repeat.
                $('#repeat_duration_inputs').hide();
                break;
            case "weekly":
                // Event will repeat every week.
                for (var i=0; i<user_created_events.length; i++){

                    var current_event = user_created_events[i];

                    for (var days=7; days<=max_days; days+=7){

                        var next_date = moment(current_event.moment.format('YYYY-MM-DD'));
                        next_date.isoWeekday(next_date.isoWeekday() + days);

                        var new_event = {
                            date: next_date.format('YYYY-MM-DD'),
                            auto_generated: true,
                            moment: next_date
                        };

                        generated_events.push(new_event);
                    }
                }

                break;
            case "month_by_day":
                // Event will repeat every month on the same day and week.
                // This works until your reach a new year... have to figure that out.
                for (var i=0; i<user_created_events.length; i++){

                    var current_event = user_created_events[i];
                    var next_date = moment(current_event.moment.format('YYYY-MM-DD'));

                    week_of_month = Math.ceil(next_date.date() / 7);

                    while (next_date.diff(current_event.moment, 'days') <= max_days){

                        next_date.month(next_date.month() + 1);
                        next_date.date(1);

                        var match_found = false;
                        while (!match_found){
                            next_date.date(next_date.date() + 1);

                            if (next_date.day() == current_event.moment.day() && Math.ceil(next_date.date() / 7) == week_of_month){
                                match_found = true;
                            }
                        }

                        var new_event = {
                            date: next_date.format('YYYY-MM-DD'),
                            auto_generated: true,
                            moment: next_date
                        };

                        generated_events.push(new_event);
                    }

                }

                break;
            case "month_by_date":
                // Event will repeat every month on the same date.
                for (var i=0; i<user_created_events.length; i++){

                    var current_event = user_created_events[i];
                    var next_date = moment(current_event.moment.format('YYYY-MM-DD'));

                    while (next_date.diff(current_event.moment, 'days') <= max_days){

                        next_date.month(next_date.month() + 1);

                        next_date.date(current_event.moment.date());

                        var new_event = {
                            date: next_date.format('YYYY-MM-DD'),
                            auto_generated: true,
                            moment: next_date
                        };

                        if (current_event.moment.date() == next_date.date()){
                            generated_events.push(new_event);
                        }
                        else {
                            next_date.month(next_date.month() - 1);
                        }
                    }
                }

                break;
            default:
            // $('#repeat_duration_inputs').show();
        }

        // merge event arrays and push all events to calendar display
        current_events = $.merge( $.merge( [], user_created_events ), generated_events );
        events_cal.setEvents(current_events);
    }

    $('#secondform').submit(function(e){
        e.preventDefault();
        $("#event-success-message, #event-error-message").hide();

        current_events = $.merge( $.merge( [], user_created_events ), generated_events );
        if (current_events.length < 1){
            alert('Please select a date for your event from the calendar.');
            return
        }

        $('#submit_button').blur().addClass('in-progress');

        document.getElementById('description').value = CKEDITOR.instances.description.getData();

        var formdata = $(this).serializeArray();
        formdata.push({
            name: "event_dates",
            value: JSON.stringify(current_events)
        });

        $.ajax({
            dataType: "json",
            url: '/events/create',
            headers: { sourceurl: window.location.pathname },
            data: formdata,
            type: 'POST',
            success: function(response, textStatus) {
                setHashValue("event_ids", response.ids.join(','));
                window.scrollTo(0,0);
                // window.location.reload();
                $('#secondform')[0].reset();
                $('#secondform').hide();
                $("#event-success-message").show();
            },
            error: function(response){
                $('#submit_button').removeClass('in-progress');
                $("#event-error-message").show();
                $("#event-error-message-details").html('');
                if (response.responseJSON && response.responseJSON.errors) {
                    var errors = response.responseJSON.errors
                    $.each(errors, function(key, value) {
                        switch (key) {
                            case "is_searchable":
                                key = "make event public";
                                break;
                            default:
                                key = key.replace(/_/g, ' ');
                        }
                        $("#event-error-message-details").append("<li><span class='capitalized'>" + key + "</span> : " + value[0] + "</li>");
                    });
                }
                window.scrollTo(0,0);
            }
        });
    });


    // Disable until event ids are returned from BSD
    // // Show initial modal if we have an event_url in the hash (should have come from previous event creation)
    // var event_ids = getHashValue("event_ids");
    // if (event_ids){
    //     event_ids = event_ids.split(",")
    //     if (event_ids.length > 0) {
    //         for (var i=0; i < event_ids.length; i++){
    //             var event_link = eventsRootUrl + event_ids[i];
    //             $('#js-created-event-url-list').append(
    //                 '<li><a class="js-created-event-url" href="' + event_link
    //                 + '" target="_blank">' + event_link + '</a></li>');
    //         }
    //         $("#event-success-message").show();
    //     }
    // };

});
