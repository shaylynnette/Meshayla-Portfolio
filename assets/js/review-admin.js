/* Owner approval page (vanilla ES6). The token lives only in sessionStorage for this tab. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var login = $('#ad-login'), panel = $('#ad-panel'), list = $('#ad-list'), msg = $('#ad-msg'), tabs = $('#ad-tabs');
  var status = 'pending', blobUrls = [];
  function tok() { try { return sessionStorage.getItem('rv-token') || ''; } catch (e) { return ''; } }
  function api(path, opts) {
    opts = opts || {}; opts.headers = Object.assign({ authorization: 'Bearer ' + tok() }, opts.headers || {});
    return fetch(path, opts);
  }
  function say(t, bad) { msg.textContent = t; msg.style.color = bad ? '#B3261E' : '#2F5A17'; }
  function el(tag, cls, t) { var n = document.createElement(tag); if (cls) n.className = cls; if (t != null) n.textContent = t; return n; }

  $('#ad-go').addEventListener('click', function () {
    var v = $('#ad-token').value.trim(); if (!v) return;
    try { sessionStorage.setItem('rv-token', v); } catch (e) { }
    $('#ad-token').value = ''; load();
  });
  $('#ad-out').addEventListener('click', function () { try { sessionStorage.removeItem('rv-token'); } catch (e) { } show(false); });
  tabs.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-s]'); if (!b) return; status = b.dataset.s;
    tabs.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); load();
  });
  function show(on) { login.hidden = on; panel.hidden = !on; }

  function load() {
    blobUrls.forEach(URL.revokeObjectURL); blobUrls = []; say('Loading…');
    api('/api/review-admin?status=' + status).then(function (r) {
      return r.json().then(function (d) { return { r: r, d: d }; });
    }).then(function (x) {
      if (x.r.status === 401 || x.r.status === 503) { try { sessionStorage.removeItem('rv-token'); } catch (e) { } show(false); $('#ad-loginmsg').textContent = x.d.error || 'Not authorized.'; return; }
      show(true); say(''); render(x.d.reviews || []);
    }).catch(function () { say('Could not load reviews. Check your connection.', true); });
  }
  function stars(n) { return n ? '★'.repeat(n) + '☆'.repeat(5 - n) : 'No rating'; }
  function render(items) {
    list.textContent = '';
    if (!items.length) { list.appendChild(el('div', 'ad-empty', status === 'pending' ? 'Nothing waiting for review.' : 'Nothing here yet.')); return; }
    items.forEach(function (r) {
      var card = el('article', 'ad-item');
      var top = el('div', 'ad-top'); top.appendChild(el('b', '', r.name + ' · ' + r.what));
      top.appendChild(el('small', '', stars(r.rating) + ' · ' + r.createdAt.slice(0, 10) + (r.email ? ' · ' + r.email : '')));
      card.appendChild(top); card.appendChild(el('p', 'ad-text', r.text));
      if (r.photos.length) {
        var pics = el('div', 'rv-pics');
        r.photos.forEach(function (p) {
          var img = el('img'); img.alt = 'Photo from ' + r.name; var b = el('button'); b.type = 'button'; b.appendChild(img); pics.appendChild(b);
          api('/api/review-admin?photo=' + r.id + '/' + p.n).then(function (x) { return x.blob(); }).then(function (bl) { var u = URL.createObjectURL(bl); blobUrls.push(u); img.src = u; }).catch(function () { img.alt = 'Photo could not be loaded'; });
        });
        card.appendChild(pics);
      }
      var acts = el('div', 'ad-actions');
      function act(label, cls, action, confirmText) {
        var b = el('button', cls, label); b.type = 'button';
        b.addEventListener('click', function () {
          if (confirmText && !confirm(confirmText)) return;
          b.disabled = true;
          api('/api/review-admin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: r.id, action: action }) })
            .then(function (x) { return x.json(); }).then(function (d) { if (d.ok) { say('Done.'); load(); } else { say(d.error || 'Failed.', true); b.disabled = false; } })
            .catch(function () { say('Failed. Try again.', true); b.disabled = false; });
        });
        acts.appendChild(b);
      }
      if (r.status !== 'approved') act('Approve and publish', 'ad-yes', 'approve');
      if (r.status === 'approved') act('Unpublish', 'ad-no', 'reject');
      if (r.status === 'pending') act('Reject', 'ad-no', 'reject');
      act('Delete forever', 'ad-del', 'delete', 'Delete this review and its photos permanently?');
      card.appendChild(acts);

      var rep = el('div', 'ad-reply'), id = 'rp-' + r.id;
      var lab = el('label', '', 'Your public reply'); lab.setAttribute('for', id);
      var ta = el('textarea'); ta.id = id; ta.maxLength = 800; ta.value = r.reply ? r.reply.text : ''; ta.placeholder = 'Thank them, answer a question, or share what you did next. Shown under the review once it is published.';
      var save = el('button', 'ad-save', r.reply ? 'Update reply' : 'Save reply'); save.type = 'button';
      var note = el('small', '', r.status === 'approved' ? '' : 'Visible to the public only after the review is published.');
      save.addEventListener('click', function () {
        save.disabled = true;
        api('/api/review-admin', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: r.id, action: 'reply', text: ta.value }) })
          .then(function (x) { return x.json(); }).then(function (d) { save.disabled = false; if (d.ok) { note.textContent = d.reply ? 'Reply saved.' : 'Reply removed.'; save.textContent = d.reply ? 'Update reply' : 'Save reply'; } else note.textContent = d.error || 'Could not save.'; })
          .catch(function () { save.disabled = false; note.textContent = 'Could not save. Try again.'; });
      });
      rep.appendChild(lab); rep.appendChild(ta); rep.appendChild(save); rep.appendChild(note); card.appendChild(rep);
      list.appendChild(card);
    });
  }
  if (tok()) load(); else show(false);
})();
