/* Idée Déco — démonstration non officielle. Aucun envoi de données, aucun traceur. */
(function () {
  var html = document.documentElement;
  html.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* Mode « photos masquées » : utile pour une présentation tant que les droits ne sont pas confirmés */
  if (store('idd-nophotos') === '1') html.classList.add('no-photos');
  document.querySelectorAll('[data-toggle-photos]').forEach(function (b) {
    function label() { b.textContent = html.classList.contains('no-photos') ? 'Afficher les photos' : 'Masquer les photos'; b.setAttribute('aria-pressed', html.classList.contains('no-photos')); }
    label();
    b.addEventListener('click', function () {
      html.classList.toggle('no-photos');
      store('idd-nophotos', html.classList.contains('no-photos') ? '1' : '0');
      document.querySelectorAll('[data-toggle-photos]').forEach(function (x) { x.textContent = html.classList.contains('no-photos') ? 'Afficher les photos' : 'Masquer les photos'; x.setAttribute('aria-pressed', html.classList.contains('no-photos')); });
    });
  });

  /* Annotations de la démonstration (informations à confirmer) */
  if (store('idd-noanno') === '1') html.classList.add('no-anno');
  function annoLabel() { document.querySelectorAll('[data-toggle-anno]').forEach(function (x) { var off = html.classList.contains('no-anno'); x.textContent = off ? 'Afficher les annotations' : 'Masquer les annotations'; x.setAttribute('aria-pressed', off); }); }
  annoLabel();
  document.querySelectorAll('[data-toggle-anno]').forEach(function (b) {
    b.addEventListener('click', function () { html.classList.toggle('no-anno'); store('idd-noanno', html.classList.contains('no-anno') ? '1' : '0'); annoLabel(); });
  });

  /* Menu mobile */
  var burger = document.querySelector('.burger'), nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      if (open) { var f = nav.querySelector('a'); if (f) f.focus(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Ouvrir le menu'); burger.focus(); }
    });
  }

  /* Longueur des tracés pour l'animation « dessin au trait » */
  document.querySelectorAll('.draw').forEach(function (svg) {
    svg.querySelectorAll('path,line,rect,circle,polyline').forEach(function (p) {
      try { p.style.setProperty('--len', Math.ceil(p.getTotalLength()) + 1); } catch (e) {}
    });
  });

  /* Apparitions au défilement */
  var targets = document.querySelectorAll('.reveal,.draw,.aplat');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (t) { t.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* Filtres des réalisations */
  var filters = document.querySelector('.filters');
  if (filters) {
    var items = document.querySelectorAll('.chantier'), out = document.getElementById('count');
    function apply(cat) {
      var n = 0;
      items.forEach(function (it) { var ok = cat === 'tout' || (' ' + it.dataset.cat + ' ').indexOf(' ' + cat + ' ') > -1; it.hidden = !ok; if (ok) n++; });
      filters.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.f === cat); });
      if (out) out.textContent = n + (n > 1 ? ' chantiers affichés' : ' chantier affiché');
    }
    filters.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; apply(b.dataset.f); if (history.replaceState) history.replaceState(null, '', b.dataset.f === 'tout' ? location.pathname : '#' + b.dataset.f); });
    var h = location.hash.slice(1);
    apply(filters.querySelector('[data-f="' + h + '"]') ? h : 'tout');
  }

  /* Visionneuse photo */
  var zooms = Array.prototype.slice.call(document.querySelectorAll('.zoom'));
  if (zooms.length && window.HTMLDialogElement) {
    var dlg = document.createElement('dialog');
    dlg.className = 'lb';
    dlg.setAttribute('aria-label', 'Visionneuse photo');
    dlg.innerHTML = '<div class="lb-in"><button class="lb-close" type="button">Fermer ✕</button><img alt=""><p class="lb-cap"></p>' +
      '<button class="lb-btn lb-prev" type="button" aria-label="Photo précédente"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button class="lb-btn lb-next" type="button" aria-label="Photo suivante"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></div>';
    document.body.appendChild(dlg);
    var img = dlg.querySelector('img'), cap = dlg.querySelector('.lb-cap'), group = [], idx = 0, opener = null;
    function show(i) { idx = (i + group.length) % group.length; var z = group[idx], im = z.querySelector('img'); img.src = z.dataset.full || im.src; img.alt = im.alt; cap.textContent = (z.dataset.cap || im.alt) + '  ·  ' + (idx + 1) + ' / ' + group.length; }
    zooms.forEach(function (z) {
      z.addEventListener('click', function () {
        var scope = z.closest('[data-group]');
        group = scope ? Array.prototype.slice.call(scope.querySelectorAll('.zoom')) : [z];
        opener = z; show(group.indexOf(z)); dlg.showModal();
        dlg.querySelector('.lb-prev').hidden = dlg.querySelector('.lb-next').hidden = group.length < 2;
      });
    });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  }

  /* Préparation d'un e-mail : ouvre la messagerie de l'utilisateur, n'envoie rien depuis ce site */
  var comp = document.getElementById('composer');
  if (comp) {
    comp.addEventListener('submit', function (e) {
      e.preventDefault();
      var needs = Array.prototype.map.call(comp.querySelectorAll('input[name=besoin]:checked'), function (i) { return i.value; });
      var lieu = comp.querySelector('#lieu').value.trim(), msg = comp.querySelector('#msg').value.trim();
      var subject = 'Demande d’information' + (needs.length ? ' – ' + needs.join(', ') : '');
      var body = 'Bonjour,\n\n' + (needs.length ? 'Mon projet concerne : ' + needs.join(', ') + '.\n' : '') + (lieu ? 'Commune du chantier : ' + lieu + '.\n' : '') + (msg ? '\n' + msg + '\n' : '') + '\nCordialement,\n';
      window.location.href = 'mailto:contact@ideedeco-peintre.fr?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      var st = document.getElementById('composer-status');
      if (st) st.textContent = 'Votre logiciel de messagerie devrait s’ouvrir avec ce message prérempli. Rien n’a été envoyé : vérifiez le message puis envoyez-le depuis votre messagerie.';
    });
  }
})();
