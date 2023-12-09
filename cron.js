function cron_job() {
  const calendars = CalendarApp.getAllCalendars();
  const calendar = calendars.filter((c) => c.getName().includes('melpomene.webuntis.com'))[0];
  let inAMonth = new Date();
  inAMonth.setMonth(new Date().getMonth() + 4);
  let events = calendar.getEvents(new Date(), inAMonth).map((event) => ({
    event: event,
    title: event.getTitle(),
    start: event.getStartTime(),
    end: event.getEndTime(),
    location: event.getLocation(),
  }));

  const typeMap = {
    sa: 'sa',
    swh: 'swh',
    smü: 'swh',
    test: 'swh',
    praklf: 'plf',
  };

  const stundenplan = CalendarApp.getCalendarsByName('Stundenplan')[0];
  const swh = CalendarApp.getCalendarsByName('SWH')[0];
  const sa = CalendarApp.getCalendarsByName('SA')[0];
  const plf = CalendarApp.getCalendarsByName('PLF')[0];

  const calendarMap = {
    normal: stundenplan,
    swh: swh,
    sa: sa,
    plf: plf,
  };

  let oldEvents = stundenplan.getEvents(new Date(), inAMonth).map((event) => ({
    event: event,
    start: event.getStartTime(),
    end: event.getEndTime(),
    type: 'normal',
    title: event.getTitle(),
    location: event.getLocation(),
  }));
  oldEvents = oldEvents.concat(
    swh.getEvents(new Date(), inAMonth).map((event) => ({
      event: event,
      start: event.getStartTime(),
      end: event.getEndTime(),
      type: 'swh',
      title: event.getTitle(),
      location: event.getLocation(),
    }))
  );
  oldEvents = oldEvents.concat(
    sa.getEvents(new Date(), inAMonth).map((event) => ({
      event: event,
      start: event.getStartTime(),
      end: event.getEndTime(),
      type: 'sa',
      title: event.getTitle(),
      location: event.getLocation(),
    }))
  );
  oldEvents = oldEvents.concat(
    plf.getEvents(new Date(), inAMonth).map((event) => ({
      event: event,
      start: event.getStartTime(),
      end: event.getEndTime(),
      type: 'plf',
      title: event.getTitle(),
      location: event.getLocation(),
    }))
  );

  events = events.map((obj) => {
    let type = 'normal';
    let title = obj.title;
    if (obj.title.startsWith('[')) {
      let strs = obj.title.slice(1).split(']');
      type = typeMap[strs[0].toLocaleLowerCase()];
      title = strs[1].trim();
    }
    return {
      event: obj.event,
      start: obj.start,
      end: obj.end,
      type: type,
      title: title,
      location: obj.location,
    };
  });

  for (const event of oldEvents) {
    const newEvents = events.filter((e) => e.start.getTime() == event.start.getTime() && e.end.getTime() == event.end.getTime());
    if (newEvents.length == 0) {
      event.event.deleteEvent();
    } else if (newEvents.length == 1) {
      let newEvent = newEvents[0];
      events.splice(events.indexOf(newEvent), 1);
      if (newEvent.type == event.type) {
        refreshEventProperties(event, newEvent);
      } else {
        event.event.deleteEvent();
        calendarMap[newEvent.type].createEvent(newEvent.title, newEvent.start, newEvent.end, { location: newEvent.location });
      }
    }
  }
  for (const event of events) {
    calendarMap[event.type].createEvent(event.title, event.start, event.end, { location: event.location });
  }
}

function refreshEventProperties(oldEvent, newEvent) {
  let o = oldEvent.event;
  let n = newEvent.event;
  if (newEvent.title != oldEvent.title) {
    o.setTitle(newEvent.title);
  }
  if (newEvent.location != oldEvent.location) {
    o.setLocation(n.getLocation());
  }
}
