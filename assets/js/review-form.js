/* Review form (vanilla ES6). Guides the visitor, compresses photos in the browser (which also strips
   location data from them), and posts to /api/review-submit. Text goes in with textContent only. */
(function () {
  'use strict';
  var form = document.getElementById('rv-form');
  if (!form) return;
  var MAX_PHOTOS = 3, MIN_TEXT = 20, MAX_TEXT = 1500, MAX_EDGE = 1600, TARGET = 1300000;
  var photos = [];   // {blob, url}
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var summary = $('#rv-summary'), done = $('#rv-done'), submit = $('#rv-submit');
  var text = $('#rv-text'), count = $('#rv-count'), drop = $('#rv-drop'), file = $('#rv-file'), thumbs = $('#rv-thumbs');
  var starNote = $('#rv-stars-note');
  $('#rv-opened').value = String(Date.now());
  form.hidden = false;
  var nojs = document.getElementById('rv-nojs'); if (nojs) nojs.hidden = true;

  /* Star label */
  var words = { 1: 'Not for me', 2: 'It was okay', 3: 'Good', 4: 'Really good', 5: 'Loved it' };
  form.querySelectorAll('input[name="rating"]').forEach(function (r) {
    r.addEventListener('change', function () { starNote.textContent = words[r.value] || ''; });
  });

  /* Character counter */
  function updateCount() {
    var n = text.value.trim().length;
    count.textContent = n + ' / ' + MAX_TEXT + (n < MIN_TEXT ? ' (a few more words, please)' : '');
    count.classList.toggle('ok', n >= MIN_TEXT);
  }
  text.addEventListener('input', updateCount); updateCount();

  /* Starter prompts: add a sentence opener so a blank box is never the hurdle */
  form.querySelectorAll('[data-nudge]').forEach(function (b) {
    b.addEventListener('click', function () {
      var add = b.getAttribute('data-nudge');
      text.value = text.value ? text.value.replace(/\s*$/, '') + '\n\n' + add + ' ' : add + ' ';
      text.focus(); text.setSelectionRange(text.value.length, text.value.length); updateCount();
    });
  });

  /* Photos */
  function renderThumbs() {
    thumbs.textContent = '';
    photos.forEach(function (p, i) {
      var li = document.createElement('li'); li.className = 'rv-thumb';
      var img = document.createElement('img'); img.src = p.url; img.alt = 'Your photo ' + (i + 1);
      var x = document.createElement('button'); x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', 'Remove photo ' + (i + 1));
      x.addEventListener('click', function () { URL.revokeObjectURL(p.url); photos.splice(i, 1); renderThumbs(); });
      li.appendChild(img); li.appendChild(x); thumbs.appendChild(li);
    });
    var full = photos.length >= MAX_PHOTOS;
    drop.setAttribute('aria-disabled', String(full));
    $('#rv-drop-t').textContent = full ? 'Photo limit reached' : (photos.length ? 'Add another photo' : 'Add a photo');
    $('#rv-photo-count').textContent = photos.length + ' of ' + MAX_PHOTOS + ' added';
  }
  function compress(f) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(f), img = new Image();
      img.onload = function () {
        var s = Math.min(1, MAX_EDGE / Math.max(img.width, img.height)), w = Math.round(img.width * s), h = Math.round(img.height * s);
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        var cx = c.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h); cx.drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
        var q = 0.84;
        (function attempt() {
          c.toBlob(function (b) {
            if (!b) return reject(new Error('encode'));
            if (b.size > TARGET && q > 0.45) { q -= 0.12; return attempt(); }
            resolve(b);
          }, 'image/jpeg', q);
        })();
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }
  function addFiles(list) {
    var arr = Array.prototype.slice.call(list), photoErr = $('#rv-err-photos'); photoErr.textContent = '';
    (function next() {
      var f = arr.shift();
      if (!f) return;
      if (photos.length >= MAX_PHOTOS) { photoErr.textContent = 'You can add up to ' + MAX_PHOTOS + ' photos.'; return; }
      if (!/^image\//.test(f.type)) { photoErr.textContent = 'Please choose image files (JPG, PNG or WebP).'; return next(); }
      compress(f).then(function (b) { photos.push({ blob: b, url: URL.createObjectURL(b) }); renderThumbs(); next(); })
        .catch(function () { photoErr.textContent = 'We could not read one of those photos. Try a JPG or PNG.'; next(); });
    })();
  }
  drop.addEventListener('click', function () { if (drop.getAttribute('aria-disabled') !== 'true') file.click(); });
  drop.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); drop.click(); } });
  file.addEventListener('change', function () { addFiles(file.files); file.value = ''; });
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files); });
  renderThumbs();

  /* Errors */
  var fields = ['what', 'rating', 'text', 'name', 'email', 'consent', 'photos'];
  function clearErrors() {
    summary.hidden = true; summary.textContent = '';
    fields.forEach(function (f) { var e = $('#rv-err-' + f); if (e) e.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach(function (n) { n.removeAttribute('aria-invalid'); });
  }
  function showErrors(errs, general) {
    var first = null, n = 0;
    fields.forEach(function (f) {
      if (!errs[f]) return; n++;
      var e = $('#rv-err-' + f); if (e) e.textContent = errs[f];
      var inp = form.elements[f]; var node = inp && inp.length && !inp.tagName ? inp[0] : inp;
      if (node && node.setAttribute) { node.setAttribute('aria-invalid', 'true'); if (!first) first = node; }
      else if (!first && e) first = e;
    });
    summary.textContent = general || (n === 1 ? 'Please fix the field marked below.' : 'Please fix the ' + n + ' fields marked below.');
    summary.hidden = false;
    summary.setAttribute('tabindex', '-1'); summary.focus();
    if (first && first.scrollIntoView) setTimeout(function () { first.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 150);
  }
  function localCheck() {
    var errs = {}, v = function (n) { return (form.elements[n].value || '').trim(); };
    if (!form.querySelector('input[name="what"]:checked')) errs.what = 'Please choose what you are reviewing.';
    if (text.value.trim().length < MIN_TEXT) errs.text = 'Please write at least ' + MIN_TEXT + ' characters so others get a real picture.';
    if (v('name').length < 2) errs.name = 'Please add your first name.';
    if (v('email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) errs.email = 'That email address does not look right.';
    if (!form.elements.consent.checked) errs.consent = 'Please confirm you agree so I can share your review.';
    return errs;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault(); clearErrors();
    var errs = localCheck();
    if (Object.keys(errs).length) return showErrors(errs);
    var fd = new FormData(form); fd.delete('photos');
    photos.forEach(function (p, i) { fd.append('photos', new File([p.blob], 'photo-' + (i + 1) + '.jpg', { type: 'image/jpeg' })); });
    submit.disabled = true; submit.setAttribute('data-busy', ''); submit.querySelector('.rv-label').textContent = 'Sending…';
    fetch('/api/review-submit', { method: 'POST', body: fd }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) { return { ok: r.ok, data: data }; });
    }).then(function (res) {
      if (res.ok) {
        photos.forEach(function (p) { URL.revokeObjectURL(p.url); });
        $('#rv-thanks-name').textContent = (form.elements.name.value.trim().split(/\s+/)[0] || 'friend');
        form.hidden = true; done.hidden = false; done.setAttribute('tabindex', '-1'); done.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        showErrors(res.data.errors || {}, res.data.error || 'Something went wrong. Please try again.');
      }
    }).catch(function () {
      showErrors({}, 'We could not reach the server. Check your connection and try again. Your review is still here.');
    }).then(function () {
      submit.disabled = false; submit.removeAttribute('data-busy'); submit.querySelector('.rv-label').textContent = 'Send my review';
    });
  });
})();
