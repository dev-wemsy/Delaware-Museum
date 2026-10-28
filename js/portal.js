/* Volunteer & Board portal — prototype behaviour.
   Reads the role cookie set at sign-in, shows Board-only items to Board
   members, fills the internal calendar and shared-drive links from the SITE
   block in site.js, and shows the demo accounts on the login page. */
(function(){
  'use strict';

  function cookie(name){
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  var role = cookie('dmm_role');

  /* ---- role-aware UI ---- */
  Array.prototype.forEach.call(document.querySelectorAll('[data-board-only]'), function(el){
    el.hidden = role !== 'board';
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-role-name]'), function(el){
    el.textContent = role === 'board' ? 'Board member' : 'Volunteer';
  });

  /* ---- internal (non-public) Google Calendar ---- */
  var cal = document.querySelector('[data-internal-calendar]');
  if (cal && window.SITE && SITE.internalCalendarId){
    var f = document.createElement('iframe');
    f.src = 'https://calendar.google.com/calendar/embed?src=' + encodeURIComponent(SITE.internalCalendarId)
      + '&ctz=America%2FNew_York&mode=AGENDA&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0';
    f.title = 'Volunteer schedule';
    f.loading = 'lazy';
    cal.innerHTML = '';
    cal.appendChild(f);
  }

  /* ---- shared Google Drive links ---- */
  if (window.SITE && SITE.driveFolder){
    Array.prototype.forEach.call(document.querySelectorAll('[data-drive]'), function(a){
      a.href = SITE.driveFolder; a.target = '_blank'; a.rel = 'noopener';
    });
  }

  /* ---- login page ---- */
  var form = document.getElementById('login');
  if (form){
    var q = new URLSearchParams(location.search);
    var next = q.get('next');
    if (next) form.elements.next.value = next;
    if (q.get('error')) document.getElementById('msg-error').hidden = false;
    if (q.get('out')) document.getElementById('msg-out').hidden = false;

    fetch('/api/login', { headers: { 'Accept': 'application/json' } })
      .then(function(r){ return r.json(); })
      .then(function(d){
        if (!d.demo) return;
        var box = document.getElementById('demo');
        box.querySelector('[data-demo-volunteer]').textContent = d.accounts.volunteer;
        box.querySelector('[data-demo-board]').textContent = d.accounts.board;
        box.hidden = false;
      })
      .catch(function(){});
  }
})();
