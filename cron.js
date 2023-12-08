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
  }));

  const stundenplan = CalendarApp.getCalendarsByName('Stundenplan')[0];
  const swh = CalendarApp.getCalendarsByName('SWH')[0];
  const sa = CalendarApp.getCalendarsByName('SA')[0];
  const plf = CalendarApp.getCalendarsByName('PLF')[0];

  let oldEvents = stundenplan.getEvents(new Date(), inAMonth);
  oldEvents = oldEvents.concat(swh.getEvents(new Date(), inAMonth));
  oldEvents = oldEvents.concat(sa.getEvents(new Date(), inAMonth));
  oldEvents = oldEvents.concat(plf.getEvents(new Date(), inAMonth));

  for (const event of oldEvents) {
    event.deleteEvent();
  }

  const specialEvents = events
    .filter((e) => e.title.startsWith('['))
    .map((obj) => {
      let strs = obj.title.slice(1).split(']');
      return {
        event: obj.event,
        type: strs[0].toLowerCase(),
        title: strs[1].trim(),
      };
    });
  events = events.filter((e) => !e.title.startsWith('['));

  for (const ev of events) {
    let start = ev.event.getStartTime();
    let end = ev.event.getEndTime();
    stundenplan.createEvent(ev.title, start, end, { location: ev.event.getLocation() });
  }

  for (const ev of specialEvents) {
    if (ev.type == 'sa') {
      let start = ev.event.getStartTime();
      let end = ev.event.getEndTime();
      sa.createEvent(ev.title, start, end, { location: ev.event.getLocation() });
    } else if (ev.type == 'swh' || ev.type == 'smü' || ev.type == 'test') {
      let start = ev.event.getStartTime();
      let end = ev.event.getEndTime();
      swh.createEvent(ev.title, start, end, { location: ev.event.getLocation() });
    } else if (ev.type == 'praklf') {
      let start = ev.event.getStartTime();
      let end = ev.event.getEndTime();
      plf.createEvent(ev.title, start, end, { location: ev.event.getLocation() });
    }
  }
}
