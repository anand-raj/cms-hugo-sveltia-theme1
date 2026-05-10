(function () {
  // Config is passed via data-attributes on #search-results (set by Hugo template)
  var el = document.getElementById('search-results');
  if (!el) return;

  var indexURL = location.origin + (el.dataset.indexUrl || '/index.json');
  var i18n = {
    noResults : el.dataset.noResults  || 'No results found for',
    enterTerm : el.dataset.enterTerm  || 'Enter a search term above.',
    unavailable: el.dataset.unavailable || 'Search unavailable. Please try again later.',
    resultFor : el.dataset.resultFor  || 'result for',
    resultsFor: el.dataset.resultsFor || 'results for',
  };

  function getQuery() {
    return new URLSearchParams(window.location.search).get('q') || '';
  }

  function sectionLabel(section) {
    return section.charAt(0).toUpperCase() + section.slice(1);
  }

  function highlight(text, query) {
    if (!text || !query) return text || '';
    var escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp('(' + escaped + ')', 'gi'), '<mark>$1</mark>');
  }

  function renderResults(results, query) {
    var container = document.getElementById('search-results');
    var status    = document.getElementById('search-status');

    if (!results.length) {
      status.textContent  = query ? i18n.noResults + ' \u201c' + query + '\u201d.' : i18n.enterTerm;
      container.innerHTML = '';
      return;
    }

    status.textContent = results.length + ' ' +
      (results.length === 1 ? i18n.resultFor : i18n.resultsFor) +
      ' \u201c' + query + '\u201d';

    container.innerHTML = results.map(function (r) {
      var item = r.item;
      return '<article class="search-result">' +
        '<div class="search-result-meta">' +
          '<span class="card-category">' + sectionLabel(item.section) + '</span>' +
          '<span class="search-result-date">' + item.date + '</span>' +
        '</div>' +
        '<h2 class="search-result-title">' +
          '<a href="' + item.url + '">' + highlight(item.title, query) + '</a>' +
        '</h2>' +
        (item.description
          ? '<p class="search-result-desc">' + highlight(item.description, query) + '</p>'
          : '') +
        '</article>';
    }).join('');
  }

  function initSearch(index) {
    var fuse = new Fuse(index, {
      keys: [
        { name: 'title',       weight: 0.6 },
        { name: 'description', weight: 0.3 },
        { name: 'content',     weight: 0.1 },
      ],
      includeScore: true,
      threshold: 0.35,
      minMatchCharLength: 2,
    });

    var input = document.getElementById('search-input');
    var query = getQuery();

    if (query) {
      input.value = query;
      renderResults(fuse.search(query), query);
    }

    input.addEventListener('input', function () {
      var q = this.value.trim();
      renderResults(q.length >= 2 ? fuse.search(q) : [], q);
      var url = new URL(window.location);
      if (q) { url.searchParams.set('q', q); } else { url.searchParams.delete('q'); }
      history.replaceState({}, '', url);
    });
  }

  // Both fuse.js and this script are loaded with defer — fuse.js runs first,
  // so Fuse is guaranteed to be defined when we reach here.
  fetch(indexURL)
    .then(function (r) {
      if (!r.ok) throw new Error('Failed to load search index');
      return r.json();
    })
    .then(initSearch)
    .catch(function (err) {
      document.getElementById('search-status').textContent = i18n.unavailable;
      console.error(err);
    });
})();
