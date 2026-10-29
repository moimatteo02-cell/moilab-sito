/* Compila i dati dell'attività da /data/azienda.json (nessun dato scritto nel codice della pagina) */
(function () {
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  var box = document.querySelector('[data-azienda]'); if (!box) return;
  var L = [['titolare', 'Titolare'], ['ragioneSociale', 'Ragione sociale'], ['partitaIva', 'Partita IVA'], ['sede', 'Sede'], ['email', 'Email'], ['pec', 'PEC'], ['telefono', 'Telefono'], ['whatsapp', 'WhatsApp']];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  fetch('/data/azienda.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
    box.innerHTML = '<dl>' + L.map(function (f) {
      var v = (d[f[0]] || '').trim();
      if (!v && (f[0] === 'pec' || f[0] === 'telefono' || f[0] === 'ragioneSociale')) return '';
      return '<dt>' + f[1] + '</dt><dd' + (v ? '' : ' class="lg-empty"') + '>' + (v ? esc(v) : 'da completare') + '</dd>';
    }).join('') + '</dl>';
  }).catch(function () { box.textContent = 'Dati non disponibili al momento.'; });
})();
