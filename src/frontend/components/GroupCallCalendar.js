import React from 'react';
import moment from 'moment';
import $ from 'jquery';
import fullCalendar from 'fullcalendar';

export default React.createClass({
  componentDidMount() {
    setupCalendar($('.jquery-calendar'));
  },

  render() {
    return (
      <div className="jquery-calendar">
      </div>
    );
  }
});

function setupCalendar(calendar) {
  calendar.fullCalendar({
    editable: true,
    events: [
      {
        title  : 'event1',
        start  : '2015-10-21'
      }
    ]
  });
}
