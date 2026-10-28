/* ==========================================================================
   Delaware Military Museum — shared site script

   MUSEUM STAFF: everything you are likely to change lives in the SITE block
   just below. Paste the real link between the quotes and save. Leave a value
   as "" (empty) and the site hides or softens that link automatically.
   ========================================================================== */

var SITE = {
  // Public Google Calendar ID for programs and events.
  // Find it in Google Calendar > Settings > (calendar) > "Integrate calendar" > Calendar ID.
  // It usually looks like: abc123@group.calendar.google.com
  calendarId: "",

  // Links. Paste full URLs starting with https://
  facebook:       "",   // Museum Facebook page
  unitsFacebook:  "",   // Reenacting units' Facebook page
  youtube:        "",   // Museum YouTube channel (only once access is recovered)
  guidestar:      "",   // Candid / GuideStar nonprofit profile
  newsletter:     "",   // Current newsletter (PDF or web link)
  donate:         "",   // Online donation page
  membership:     "",   // Membership sign-up page
  portal:         "",   // Volunteer / Board login (Phase 2)

  // Where the Contact page's inquiry form sends mail.
  contactEmail:   "DirectorDMHEF@gmail.com"
};

/* -------------------------------------------------------------------------- */
(function(){
  'use strict';

  /* ---- fill links marked data-link="key" from the SITE block ---- */
  var links = document.querySelectorAll('[data-link]');
  Array.prototype.forEach.call(links, function(a){
    var key = a.getAttribute('data-link');
    var url = SITE[key];
    if (url){
      a.href = url;
      if (/^https?:/i.test(url)){ a.target = '_blank'; a.rel = 'noopener'; }
    } else if (a.hasAttribute('data-hide-empty')){
      // Optional links (e.g. YouTube) disappear until a URL is supplied.
      var li = a.closest('li');
      (li || a).hidden = true;
    } else {
      // Keep the button visible so the layout reads correctly, but say it's pending.
      a.setAttribute('aria-disabled', 'true');
      a.title = 'Link coming soon';
      a.addEventListener('click', function(e){ e.preventDefault(); });
    }
  });

  /* ---- mobile menu ---- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('primary-nav');
  if (menuBtn && nav){
    menuBtn.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && nav.classList.contains('open')){
        nav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.focus();
      }
    });
  }

  /* ---- public Google Calendar embed ---- */
  var cal = document.querySelector('[data-calendar]');
  if (cal){
    if (SITE.calendarId){
      var src = 'https://calendar.google.com/calendar/embed'
        + '?src=' + encodeURIComponent(SITE.calendarId)
        + '&ctz=America%2FNew_York&mode=AGENDA'
        + '&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0';
      var frame = document.createElement('iframe');
      frame.src = src;
      frame.title = 'Upcoming public programs and events';
      frame.loading = 'lazy';
      cal.innerHTML = '';
      cal.appendChild(frame);
      var full = document.querySelector('[data-calendar-link]');
      if (full){
        full.href = 'https://calendar.google.com/calendar/embed?src=' + encodeURIComponent(SITE.calendarId);
        full.target = '_blank'; full.rel = 'noopener';
      }
    }
    else {
      // No calendarId yet: the "coming soon" message written in the HTML stays,
      // and the "open full calendar" button is hidden so it never dead-ends.
      var pending = document.querySelector('[data-calendar-link]');
      if (pending) pending.hidden = true;
    }
  }

  /* ---- home hero slideshow ---- */
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero .slide'));
  var dotsEl = document.getElementById('dots');
  if (slides.length > 1 && dotsEl){
    var captionEl = document.getElementById('caption');
    var i = 0, timer = null;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    slides.forEach(function(_, n){
      var d = document.createElement('button');
      d.className = 'dot' + (n === 0 ? ' on' : '');
      d.setAttribute('aria-label', 'Go to photo ' + (n + 1));
      d.addEventListener('click', function(){ go(n); restart(); });
      dotsEl.appendChild(d);
    });
    var dots = Array.prototype.slice.call(dotsEl.children);

    function go(n){
      slides[i].classList.remove('on');
      dots[i].classList.remove('on');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('on');
      dots[i].classList.add('on');
      if (captionEl) captionEl.textContent = slides[i].getAttribute('data-caption') || '';
    }
    function next(){ go(i + 1); }
    function restart(){
      if (reduced) return;
      clearInterval(timer);
      timer = setInterval(next, 6000);
    }

    var prevBtn = document.getElementById('prev');
    var nextBtn = document.getElementById('next');
    if (nextBtn) nextBtn.addEventListener('click', function(){ next(); restart(); });
    if (prevBtn) prevBtn.addEventListener('click', function(){ go(i - 1); restart(); });

    var hero = document.querySelector('.hero');
    hero.addEventListener('mouseenter', function(){ clearInterval(timer); });
    hero.addEventListener('mouseleave', restart);
    hero.addEventListener('keydown', function(e){
      if (e.key === 'ArrowRight'){ next(); restart(); }
      if (e.key === 'ArrowLeft'){ go(i - 1); restart(); }
    });
    document.addEventListener('visibilitychange', function(){
      if (document.hidden) clearInterval(timer); else restart();
    });
    restart();
  }

  /* ---- contact inquiry form: opens the visitor's email app, pre-filled ---- */
  var form = document.getElementById('inquiry');
  if (form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var f = form.elements;
      var subject = '[Website] ' + f.topic.value + ' — ' + f.name.value;
      var body = f.message.value
        + '\n\n—\nName: ' + f.name.value
        + '\nEmail: ' + f.email.value
        + (f.phone.value ? '\nPhone: ' + f.phone.value : '');
      window.location.href = 'mailto:' + SITE.contactEmail
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
    });
    var direct = document.querySelector('[data-contact-email]');
    if (direct){ direct.href = 'mailto:' + SITE.contactEmail; direct.textContent = SITE.contactEmail; }
  }

  /* ---- footer year ---- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
