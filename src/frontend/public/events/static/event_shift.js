YAHOO.util.Event.addListener(window, "load", function() {

    shiftlist = YAHOO.util.Dom.get('event_shifts_list')

    YAHOO.util.Dom.getElementsByClassName('button_deleteshift', 'A', shiftlist, function(el) {
        YAHOO.util.Event.addListener(el, 'click', delete_shift);
    });
	
	YAHOO.util.Event.addListener(YAHOO.util.Dom.get('button_addanothershift'), 'click', function() {
	   	   
        var c = YAHOO.util.Dom.getFirstChild((shiftlist));
        var newshift = c.cloneNode(true);

        newshift.innerHTML = newshift.innerHTML.replace('Shift 1', 'Shift ' + (YAHOO.util.Dom.getChildren(shiftlist).length + 1));

        YAHOO.util.Dom.getElementsByClassName('shiftnum', 'SPAN', newshift, function(el) {
            el.innerHTML = (YAHOO.util.Dom.getChildren(shiftlist).length + 1);
        });

        YAHOO.util.Dom.getElementsByClassName('button_deleteshift', 'A', newshift, function(el) {
            YAHOO.util.Event.addListener(el, 'click', delete_shift);
        });

        YAHOO.util.Dom.get('event_shifts_list').appendChild(newshift);

        var shift_id = YAHOO.util.Dom.getElementsByClassName('shift_id', 'INPUT', newshift)[0];
        shift_id.value = '';        
      
        if (YAHOO.util.Dom.getChildren(shiftlist).length == 12) {
            YAHOO.util.Dom.get('button_addanothershift').style.display = 'none';
        }
	    
	});

    if (document.getElementById('starttime_shifted')) {
        YAHOO.util.Event.addListener(document.getElementById('starttime_shifted'), 'click', cascadeShiftDisplay);        
        cascadeShiftDisplay();
    }

});

function cascadeShiftDisplay () {
    starttime_shifted = document.getElementById('starttime_shifted');    

    durationrow = starttime_shifted.form.duration_num.parentNode.parentNode;

    if (starttime_shifted.checked) {
        document.getElementById('start_time_interface').style.display = 'none'; 
        document.getElementById('shifts_or_interface').style.display = 'none'; 

        durationrow.setAttribute('style', 'display: none'); 
        durationrow.style.cssText = 'display: none';
    } else {
        document.getElementById('event_shifts').style.display = 'none';

        if (BSD.EventType && !BSD.EventType.allowShifts()) {
            document.getElementById('shifts_or_interface').style.display = 'none';
        } else {
            document.getElementById('shifts_or_interface').style.display = 'inline';
        }

        document.getElementById('start_time_interface').style.display = 'inline';

        durationrow.setAttribute('style', '');
        durationrow.style.cssText = '';
    }
}

function delete_shift (e) {

    if (YAHOO.util.Dom.getChildren(shiftlist).length > 1) {

        var shift_id = YAHOO.util.Dom.getElementsByClassName('shift_id', 'INPUT', this.parentNode)[0];

        var answer = true;

        if (shift_id.value != '' && shift_id.value > 0) {

            answer = confirm('This is an existing shift. If you would like to remove this shift, click OK.');
            
        }

        if (answer) {

            YAHOO.util.Event.purgeElement(this.parentNode, true);
            this.parentNode.parentNode.removeChild(this.parentNode);
            reorder_shifts();
            YAHOO.util.Dom.get('button_addanothershift').style.display = 'inline';

        }

    }
    
}

function reorder_shifts() {

    shiftindex = 1;
    YAHOO.util.Dom.getElementsByClassName('shiftnum', 'SPAN', shiftlist, function(el) {
        el.innerHTML = shiftindex;                
        shiftindex++;
    });
    
}
