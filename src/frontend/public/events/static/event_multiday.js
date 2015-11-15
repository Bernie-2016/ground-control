if (typeof(bQuery) == 'undefined') bQuery = jQuery;

bQuery(document).ready(function() {
    BSD.MultipleDays.initialize();
});

BSD.Day = function(iteration, domNode) {

    this.iteration = iteration;
    this.domNode = domNode;

    // Attach Points
    this.shiftlist =                YAHOO.util.Dom.getElementsByClassName('event_shifts_list', 'UL', this.domNode)[0];
    this.button_addanothershift =   YAHOO.util.Dom.getElementsByClassName('button_addanothershift', 'A', this.domNode)[0];
    this.starttime_shifted =        YAHOO.util.Dom.getElementsByClassName('starttime_shifted', 'INPUT', this.domNode)[0];
    this.start_time_interface =     YAHOO.util.Dom.getElementsByClassName('start_time_interface', 'SPAN', this.domNode)[0];
    this.shifts_or_interface =      YAHOO.util.Dom.getElementsByClassName('shifts_or_interface', 'SPAN', this.domNode)[0];
    this.event_shifts =             YAHOO.util.Dom.getElementsByClassName('event_shifts', 'DIV', this.domNode)[0];
    this.duration_num =             YAHOO.util.Dom.getElementsByClassName('duration_num', 'INPUT', this.domNode)[0];
    this.button_start_day_cal =     YAHOO.util.Dom.getElementsByClassName('start_day_cal', 'INPUT', this.domNode)[0];
    this.button_remove_day =        YAHOO.util.Dom.getElementsByClassName('button_remove_day', 'A', this.domNode)[0];

    // Create Calendar and Bind
    this.start_day_cal = new Calendar(0, new Date(2007, 7, 27), function(cal,date) {
        return update_form_from_cal (cal, date, "start_day" + iteration);
    }, function(cal) {
        cal.hide();
    });

    this.start_day_cal.setDateFormat("%m %e %Y");
    this.start_day_cal.weekNumbers = false;
    this.start_day_cal.create();
	update_cal_from_form (this.start_day_cal, 'start_day' + iteration);    // Initialize the calendar with the same day contained in the form

	YAHOO.util.Event.addListener(this.button_start_day_cal, 'click', function(e) {

        YAHOO.util.Event.preventDefault(e);

        var node = YAHOO.util.Event.getTarget(e);
        this.start_day_cal.showAtElement(node);

        return false;

    }, null, this);

    var els = YAHOO.util.Dom.getElementsBy(function (el) {
        return (el.name.substr(0,9) == 'start_day');
    }, 'SELECT', this.domNode);

    for (var i = 0; i < els.length; i++) {

        var node = els[i];
        YAHOO.util.Event.addListener(node, 'change', this.updateCalendar, null, this);


    }

    if (this.domNode.getAttribute('event_id') && (YAHOO.env.ua.ie > 5 && YAHOO.env.ua.ie < 7)) {
        this.button_remove_day.href = '#';
    }

    els = YAHOO.util.Dom.getElementsByClassName('button_deleteshift', 'A', this.shiftlist);
    for (var i = 0; i < els.length; i++) {
        YAHOO.util.Event.addListener(els[i], 'click', this.delete_shift, null, this);
    }

    YAHOO.util.Event.addListener(this.button_remove_day, 'click', function() {

        if (BSD.MultipleDays.event_form.elements['iteration_event_id' + this.iteration] && BSD.MultipleDays.event_form.elements['iteration_event_id' + this.iteration].value != 0) {

            var answer = confirm(BSD.MultipleDays.remove_confirm_str);

            if (answer) {

                var delete_url = '';

                if (document.secondform) {
                    delete_url = BSD.MultipleDays.deleteurl + BSD.MultipleDays.event_form.elements['iteration_event_oid' + this.iteration].value;
                } else {
                    delete_url = BSD.MultipleDays.deleteurl + BSD.MultipleDays.event_form.elements['iteration_event_id' + this.iteration].value;
                }

                window.location.href = delete_url;

            }

        } else {

            this.domNode.parentNode.removeChild(this.domNode);

        }


    }, null, this);

	YAHOO.util.Event.addListener(this.button_addanothershift, 'click', function() {

        var c = YAHOO.util.Dom.getFirstChild(this.shiftlist);

        var newshift = c.cloneNode(true);

        newshift.innerHTML = newshift.innerHTML.replace('Shift 1', 'Shift ' + (YAHOO.util.Dom.getChildren(this.shiftlist).length + 1));

        var shifts = YAHOO.util.Dom.getElementsByClassName('shiftnum', 'SPAN', newshift);

        for (var i = 0; i < shifts.length; i++) {

            el = shifts[i];
            el.innerHTML = (YAHOO.util.Dom.getChildren(this.shiftlist).length + 1);

        }

        var button_deleteshift = YAHOO.util.Dom.getElementsByClassName('button_deleteshift', 'A', newshift)[0];

        YAHOO.util.Event.addListener(button_deleteshift, 'click', this.delete_shift, null, this);

        this.shiftlist.appendChild(newshift);

        var shift_id = YAHOO.util.Dom.getElementsByClassName('shift_id', 'INPUT', newshift)[0];
        shift_id.value = '';

        if (YAHOO.util.Dom.getChildren(this.shiftlist).length == 12) {
            this.button_addanothershift.style.display = 'none';
        }

	}, null, this);

    if (this.starttime_shifted) {
        YAHOO.util.Event.addListener(this.starttime_shifted, 'click', this.cascadeShiftDisplay, null, this);
        this.cascadeShiftDisplay();
    }

}

BSD.Day.prototype.updateCalendar = function(e) {

    update_cal_from_form(this.start_day_cal, 'start_day' + this.iteration);

}

BSD.Day.prototype.cascadeShiftDisplay = function() {

    var durationrow = this.duration_num;

    do {
        durationrow = durationrow.parentNode;
    } while (durationrow.tagName != 'TR');

    if (this.starttime_shifted.checked) {

        this.start_time_interface.style.display = 'none';
        this.shifts_or_interface.style.display = 'none';

        durationrow.setAttribute('style', 'display: none');

    } else {

        this.event_shifts.style.display = 'none';

        if (BSD.EventType && !BSD.EventType.allowShifts()) {
            this.shifts_or_interface.style.display = 'none';
        } else {
            this.shifts_or_interface.style.display = 'inline';
        }

        this.start_time_interface.style.display = 'inline';

        durationrow.setAttribute('style', '');

    }

}

BSD.Day.prototype.delete_shift = function(e) {

    var node = YAHOO.util.Event.getTarget(e);

    if (YAHOO.util.Dom.getChildren(this.shiftlist).length > 1) {

        var shift_id = YAHOO.util.Dom.getElementsByClassName('shift_id', 'INPUT', node.parentNode)[0];

        var answer = true;

        if (shift_id.value != '' && shift_id.value > 0) {

            answer = confirm('This is an existing shift. If you would like to remove this shift, click OK.');

        }

        if (answer) {

            YAHOO.util.Event.purgeElement(node.parentNode, true);
            node.parentNode.parentNode.removeChild(node.parentNode);
            this.reorder_shifts();
            this.button_addanothershift.style.display = 'inline';

        }

    }

}

BSD.Day.prototype.reorder_shifts = function() {

    shiftindex = 1;
    YAHOO.util.Dom.getElementsByClassName('shiftnum', 'SPAN', this.shiftlist, function(el) {
        el.innerHTML = shiftindex;
        shiftindex++;
    });

}

BSD.MultipleDays = {

    iteration: 1,
    dayurl: '',
    deleteurl: '',

    initialize: function() {
        if (document.secondform) {
            BSD.MultipleDays.event_form = document.secondform;
            BSD.MultipleDays.dayurl = '/modules/event2/event_edit_day_ajax.php?iteration=';
            BSD.MultipleDays.deleteurl = '/page/event/delete/';
        }

        if (BSD.MultipleDays.event_form && BSD.MultipleDays.event_form._multiple_day_iteration) { // There are additional days that were slipstreamed into this event by the backend

            if (BSD.MultipleDays.event_form._multiple_day_iteration.value > BSD.MultipleDays.iteration) {

                BSD.MultipleDays.iteration = BSD.MultipleDays.event_form._multiple_day_iteration.value;

            }

            // Bind existing days

            var days = YAHOO.util.Dom.getElementsByClassName('additional_day', 'TABLE', BSD.MultipleDays.event_form);

            for (var i = 0; i < days.length; i++) {

                var day = new BSD.Day(days[i].getAttribute('iteration'), days[i]);

            }

        }

        if (BSD.EventType) {

            YAHOO.util.Event.addListener(document.event.event_type_id, 'change', BSD.EventType.validateEventTypeAllowMultipleDays);
            BSD.EventType.validateEventTypeAllowMultipleDays();

        }

        if (BSD.MultipleDays.event_form && BSD.MultipleDays.event_form.has_multiple_days) {
            YAHOO.util.Event.addListener(BSD.MultipleDays.event_form.has_multiple_days, 'click', BSD.MultipleDays.checkboxChange);
            YAHOO.util.Event.addListener(document.getElementById('add_another_date'), 'click', BSD.MultipleDays.addDay);
        }

        if (document.secondform) {
            BSD.MultipleDays.checkboxChange();
        }
    },

    checkboxChange: function(ev) {

        if (BSD.MultipleDays.event_form && BSD.MultipleDays.event_form.has_multiple_days && BSD.MultipleDays.event_form.has_multiple_days.checked) {

            if (BSD.MultipleDays.iteration == 1) {

                BSD.MultipleDays.addDay();
                document.getElementById('add_another_date_container').style.display = '';

            } else {

                document.getElementById('add_another_date_container').style.display = '';
                var els = YAHOO.util.Dom.getElementsByClassName('additional_day', 'TABLE', document.getElementById('event'));
                for (var i = 0; i < els.length; i++) {
                    els[i].style.display = '';
                }

            }


        } else {

            document.getElementById('add_another_date_container').style.display = 'none';
            var els = YAHOO.util.Dom.getElementsByClassName('additional_day', 'TABLE', document.getElementById('event'));
            for (var i = 0; i < els.length; i++) {

                if (els[i].getAttribute('event_id')) {

                } else {
                    els[i].style.display = 'none';
                }

            }

        }

    },

    addDay: function() {

        BSD.MultipleDays.iteration++;

        var transaction = YAHOO.util.Connect.asyncRequest('GET', BSD.MultipleDays.dayurl + BSD.MultipleDays.iteration, {

            success: function(response) {

                var el = document.createElement('div');
                el.innerHTML = response.responseText;
                el = YAHOO.util.Dom.getFirstChild(el);

                YAHOO.util.Dom.addClass(el, 'additional_day');

                YAHOO.util.Dom.insertBefore(el, document.getElementById('add_another_date_container'));

                var day = new BSD.Day(BSD.MultipleDays.iteration, el);

            }

        });

    }

}
