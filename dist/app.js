(() => {
  'use strict';
  const games = window.CHECKPOINT_GAMES;
  const statuses = window.CHECKPOINT_STATUSES;
  const main = document.querySelector('main');
  const key = 'checkpoint.library.v1';
  let library = {}, persistent = true, lastCatalog = '#/games', toastTimer, undoEntry = null;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => ({arrow:'↗',plus:'+',check:'✓',back:'←',search:'⌕'}[name] || '');
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      games.forEach(g => { if (statuses.includes(saved[g.id])) library[g.id] = saved[g.id]; });
    }
  } catch { persistent = false; }

  function save() {
    try { localStorage.setItem(key, JSON.stringify(library)); persistent = true; }
    catch { persistent = false; }
  }
  function notify(message, undo = false) {
    clearTimeout(toastTimer);
    const toast = document.querySelector('#toast');
    toast.innerHTML = `<span>${escape(message)}</span>${undo ? '<button type="button" data-action="undo">Undo</button>' : ''}`;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => { toast.classList.remove('visible'); undoEntry = null; }, undo ? 12000 : 5000);
  }
  function route() {
    const hash = location.hash.slice(1) || '/';
    const [path, query = ''] = hash.split('?');
    return {path, query: new URLSearchParams(query)};
  }
  function go(path) { location.hash = path; }
  const cover = g => `assets/${g.id}-cover.jpg`;
  const wide = g => g.art || `assets/${g.id}-wide.jpg`;
  const titleLink = g => `#/games/${g.id}`;
  function addButton(g, compact = false) {
    const saved = !!library[g.id];
    return `<button class="${compact ? 'card-save' : 'button primary'} ${saved?'is-saved':''}" type="button" data-action="${saved?'library':'save'}" data-id="${g.id}" aria-label="${saved?'View '+escape(g.title)+' in your library':'Add '+escape(g.title)+' to library'}">${compact ? icon(saved?'check':'plus') : `${icon(saved?'check':'plus')} ${saved?'In your library':'Add to library'}`}</button>`;
  }
  function card(g, index) {
    return `<article class="game-card"><div class="cover-wrap"><a class="cover-link" href="${titleLink(g)}" aria-label="Explore ${escape(g.title)}"><img src="${cover(g)}" alt="${escape(g.title)} cover art" width="600" height="900" loading="lazy"><span class="cover-shade"></span></a><span class="card-number">${String(index+1).padStart(2,'0')}</span>${addButton(g,true)}</div><div class="card-meta"><span>${escape(g.genres[0])}</span><span>${g.year}</span></div><h3><a href="${titleLink(g)}">${escape(g.title)}</a></h3><p>${escape(g.tag)}</p></article>`;
  }
  function sectionHead(kicker, heading, link, label) {
    return `<div class="section-heading"><div><p class="eyebrow">${kicker}</p><h2>${heading}</h2></div>${link?`<a class="text-link" href="${link}">${label} <span aria-hidden="true">↗</span></a>`:''}</div>`;
  }
  function home() {
    return `<div class="page-shell home"><div class="edition"><span>THE PLAYER’S EDITION</span><span>DISCOVER. PLAY. BELONG.</span><span>VOL. 01 / CHECKPOINT</span></div>
    <section class="feature-layout" aria-label="Featured games"><article class="hero"><img class="hero-art" src="assets/elden-ring-scene-1.jpg" alt="A lone rider beneath the golden Erdtree in Elden Ring" width="1920" height="1080" fetchpriority="high"><div class="hero-shade"></div><div class="hero-top"><span class="eyebrow light"><span class="tiny-cross">+</span> EDITOR’S SPOTLIGHT</span><span class="hero-index">FEATURE 01</span></div><div class="hero-copy"><span class="micro-label">ELDEN RING · OPEN-WORLD RPG</span><h1>A world worth<br>getting lost in.</h1><p>No wrong turns. Just another story waiting<br class="desktop-break"> beyond the horizon.</p><a class="button primary" href="#/games/elden-ring">Explore the Lands Between <span aria-hidden="true">↗</span></a></div><div class="hero-foot"><span>FROM THE CHECKPOINT COLLECTION</span><span aria-hidden="true">＋</span></div></article>
    <aside class="side-features" aria-label="More discoveries"><div class="side-intro"><p class="eyebrow">OFF THE MAIN PATH</p><h2>Different worlds.<br>Same obsession.</h2></div><a class="side-story" href="#/games/hades"><div class="side-image"><img src="assets/hades-wide.jpg" alt="Hades artwork" width="460" height="215"></div><p class="eyebrow">THE ONE-MORE-RUN CLUB</p><h3>There’s always<br>another way out. <span aria-hidden="true">↗</span></h3></a><a class="side-story compact-story" href="#/games/cyberpunk-2077"><div><p class="eyebrow">AFTER HOURS</p><h3>Night City<br>is calling. <span aria-hidden="true">↗</span></h3></div><img src="assets/cyberpunk-2077-cover.jpg" alt="Cyberpunk 2077 artwork" width="600" height="900"></a></aside></section>
    <section class="editor-picks">${sectionHead('THE EDITOR’S PICKS','Your next great escape.','#/games','Explore all games')}<div class="game-grid">${games.slice(0,4).map(card).join('')}</div></section>
    <section class="discovery-band"><div><p class="eyebrow">FIND YOUR KIND OF GAME</p><h2>Follow your curiosity.</h2></div><div class="genre-links">${['RPG','Adventure','Indie','Racing'].map((g,i)=>`<a href="#/games?genre=${g}"><span>0${i+1}</span>${g}<b aria-hidden="true">↗</b></a>`).join('')}</div></section>
    <section class="community-note"><div><span class="eyebrow">BETTER TOGETHER</span><h2>Every player<br>has a story.</h2></div><div><p>A great game stays with you. Build a library of the worlds you love—and the ones you haven’t found yet.</p><a class="text-link" href="#/my-library">Make room for your next adventure <span aria-hidden="true">↗</span></a><span class="quiet-note">Player reviews and public profiles are planned for launch.</span></div><span class="outline-cross" aria-hidden="true">+</span></section></div>`;
  }
  function select(name,label,values,value) {
    return `<label class="filter-field"><span>${label}</span><select name="${name}">${values.map(v=>`<option value="${escape(v.value)}"${value===v.value?' selected':''}>${escape(v.label)}</option>`).join('')}</select></label>`;
  }
  function catalog(query) {
    lastCatalog = location.hash || '#/games';
    const q = (query.get('q')||'').trim().slice(0,100);
    const genres = [...new Set(games.flatMap(g=>g.genres))].sort();
    const platforms = ['PC','PlayStation','Xbox','Nintendo'];
    const genre = genres.includes(query.get('genre')) ? query.get('genre') : '';
    const platform = platforms.includes(query.get('platform')) ? query.get('platform') : '';
    const sort = ['title','newest'].includes(query.get('sort')) ? query.get('sort') : 'editorial';
    let filtered = games.filter(g=>g.title.toLowerCase().includes(q.toLowerCase()) && (!genre||g.genres.includes(genre)) && (!platform||g.platforms.includes(platform)));
    if(sort==='title') filtered.sort((a,b)=>a.title.localeCompare(b.title));
    if(sort==='newest') filtered.sort((a,b)=>b.year-a.year||a.title.localeCompare(b.title));
    const chips = [['q',q],['genre',genre],['platform',platform]].filter(([,v])=>v);
    return `<div class="page-shell catalog"><div class="page-intro"><div><p class="eyebrow"><span class="tiny-cross">+</span> THE CHECKPOINT COLLECTION</p><h1>Find your next<br><span class="muted-heading">favorite.</span></h1></div><p>Big adventures. Small discoveries.<br>A collection for every kind of player.<span class="collection-count">${String(games.length).padStart(2,'0')} GAMES / HANDPICKED</span></p></div>
    <form id="catalog-form" class="catalog-controls"><label class="search-field"><span class="sr-only">Search games</span><span aria-hidden="true">⌕</span><input name="q" type="search" aria-label="Search games" placeholder="Search your next adventure..." value="${escape(q)}" maxlength="100"><button type="submit" aria-label="Search games">↗</button></label>${select('genre','Genre',[{value:'',label:'All genres'},...genres.map(g=>({value:g,label:g}))],genre)}${select('platform','Platform',[{value:'',label:'All platforms'},...platforms.map(g=>({value:g,label:g}))],platform)}${select('sort','Sort by',[{value:'editorial',label:'Editor’s picks'},{value:'title',label:'Title A–Z'},{value:'newest',label:'Release year'}],sort)}</form>
    <div class="results-bar"><p><strong>${filtered.length}</strong> ${filtered.length===1?'game':'games'} to discover</p><div class="filter-chips">${chips.map(([k,v])=>`<button type="button" data-action="clear-filter" data-key="${k}" aria-label="Remove ${escape(k)} filter ${escape(v)}">${escape(v)} <span aria-hidden="true">×</span></button>`).join('')}${chips.length?'<a class="clear-link" href="#/games">Clear all</a>':'<span class="micro-label">FIND SOMETHING THAT STAYS WITH YOU</span>'}</div></div>
    ${filtered.length?`<div class="game-grid">${filtered.map(card).join('')}</div>`:`<section class="empty-state"><span class="empty-symbol" aria-hidden="true">⌕</span><p class="eyebrow">A DIFFERENT PATH, MAYBE?</p><h2>No games found.</h2><p>Try another title or clear a filter to explore more of the collection.</p><a class="button primary" href="#/games">Clear filters <span aria-hidden="true">↗</span></a></section>`}<div class="end-note"><span>YOU’VE REACHED THE END OF THIS COLLECTION</span><span aria-hidden="true">＋</span><p>More worlds are waiting. This is just the first checkpoint.</p></div></div>`;
  }
  function statusSelect(g,cls='') {
    return `<label class="status-field ${cls}"><span class="sr-only">Status for ${escape(g.title)}</span><select data-status="${g.id}">${statuses.map(s=>`<option${library[g.id]===s?' selected':''}>${s}</option>`).join('')}</select></label>`;
  }
  function detail(id) {
    const g = games.find(g=>g.id===id);
    if(!g) return notFound('This game hasn’t reached our collection yet.');
    const saved = library[g.id];
    return `<div class="detail-page"><div class="page-shell"><a class="breadcrumb" href="${escape(lastCatalog)}">← Back to the collection</a></div><section class="detail-hero"><img src="${wide(g)}" alt="${escape(g.title)} game artwork" width="1920" height="1080" fetchpriority="high"><div class="detail-shade"></div><div class="page-shell detail-hero-content"><p class="eyebrow light">${escape(g.developer)} / ${g.year}</p><h1>${escape(g.title)}</h1><div class="detail-tags">${g.genres.map(x=>`<a href="#/games?genre=${encodeURIComponent(x)}">${escape(x)}</a>`).join('')}<span>${escape(g.platforms.join(' · '))}</span></div></div></section>
    <div class="page-shell detail-body"><div class="detail-main"><p class="eyebrow">THE ADVENTURE</p><h2>${escape(g.note)}</h2><p class="large-body">${escape(g.summary)}</p>${g.id==='elden-ring'?`<section class="screenshots"><h3>A glimpse of the world</h3><div>${[2,3].map(n=>`<a href="assets/elden-ring-scene-${n}.jpg" target="_blank" rel="noopener" aria-label="Open Elden Ring screenshot ${n-1} full size"><img src="assets/elden-ring-scene-${n}.jpg" width="1920" height="1080" alt="Elden Ring world screenshot ${n-1}" loading="lazy"></a>`).join('')}</div></section>`:''}<section class="review-empty"><div class="section-heading"><div><p class="eyebrow">FROM THE PLAYERS</p><h2>Your perspective belongs here.</h2></div><span class="review-count">0<br><small>REVIEWS</small></span></div><p>No community reviews yet. Reviews and public profiles will arrive with the full platform.</p></section></div><aside class="save-panel"><span class="eyebrow">YOUR NEXT CHECKPOINT</span><h2>${saved?'Make it your journey.':'A place in your library?'}</h2><p>${saved?'Keep track of where you are in this adventure.':'Save it for later. Come back when the time is right.'}</p>${addButton(g)}${saved?statusSelect(g,'detail-status'):''}<p class="storage-note">${persistent?'Saved in this browser for the design preview.':'Browser storage is unavailable. Changes last for this session only.'}</p><dl><div><dt>Developer</dt><dd>${escape(g.developer)}</dd></div><div><dt>First released</dt><dd>${g.year}</dd></div><div><dt>Platforms</dt><dd>${escape(g.platforms.join(', '))}</dd></div></dl><span class="corner-cross" aria-hidden="true">＋</span></aside></div><section class="page-shell related">${sectionHead('KEEP EXPLORING','Another world is waiting.','#/games','All games')}<div class="game-grid">${games.filter(x=>x.id!==g.id).slice(0,4).map(card).join('')}</div></section></div>`;
  }
  function libraryPage(query) {
    const active = statuses.includes(query.get('status'))?query.get('status'):'All games';
    const q = (query.get('q')||'').trim().slice(0,100);
    const owned = games.filter(g=>library[g.id]);
    const filtered = owned.filter(g=>(active==='All games'||library[g.id]===active)&&g.title.toLowerCase().includes(q.toLowerCase()));
    const counts = s => s==='All games'?owned.length:owned.filter(g=>library[g.id]===s).length;
    return `<div class="page-shell library-page"><div class="page-intro"><div><p class="eyebrow"><span class="tiny-cross">+</span> YOUR PERSONAL CHECKPOINT</p><h1>Good games.<br><span class="muted-heading">Your story.</span></h1></div><div class="library-stat"><strong>${String(owned.length).padStart(2,'0')}</strong><span>GAMES IN YOUR LIBRARY</span></div></div><div class="library-notice"><span class="notice-icon" aria-hidden="true">◇</span><p><strong>Your preview library.</strong> ${persistent?'Saved only in this browser. No account needed to try it.':'Storage is unavailable. Your changes will last for this session only.'}</p><span class="micro-label">BROWSER ONLY</span></div>
    <div class="library-toolbar"><div class="status-tabs" role="group" aria-label="Filter library by status">${['All games',...statuses].map(s=>`<button type="button" data-action="tab" data-status-tab="${s}" aria-pressed="${active===s}" class="${active===s?'active':''}">${s}<span>${counts(s)}</span></button>`).join('')}</div><form id="library-form"><label class="search-field small-search"><span class="sr-only">Search your library</span><span aria-hidden="true">⌕</span><input name="q" type="search" aria-label="Search your library" placeholder="Search your library" value="${escape(q)}" maxlength="100"><button type="submit" aria-label="Search your library">↗</button></label></form></div>
    <div class="library-results-bar" tabindex="-1"><span>${filtered.length} ${filtered.length===1?'game':'games'}${active==='All games'?'':` · ${escape(active)}`}</span>${q?'<a class="clear-link" href="#/my-library">Clear search and filters</a>':''}</div>
    ${filtered.length?`<div class="library-list">${filtered.map(g=>`<article class="library-row"><a href="${titleLink(g)}" class="library-cover"><img src="${cover(g)}" alt="${escape(g.title)} cover" width="600" height="900"></a><div class="library-game-info"><span class="eyebrow">${escape(g.genres[0])} / ${g.year}</span><h2><a href="${titleLink(g)}">${escape(g.title)}</a></h2><p>${escape(g.platforms.join(' · '))}</p></div>${statusSelect(g)}<a class="row-detail" href="${titleLink(g)}" aria-label="View ${escape(g.title)}">↗</a><button class="remove-button" type="button" data-action="remove" data-id="${g.id}" aria-label="Remove ${escape(g.title)} from library">×</button></article>`).join('')}</div>`:`<section class="empty-state library-empty"><span class="empty-symbol" aria-hidden="true">+</span><p class="eyebrow">${owned.length?'NOTHING ON THIS SHELF YET':'EVERY COLLECTION STARTS WITH ONE GAME'}</p><h2>${owned.length?'A little room for something new.':'Your next chapter starts here.'}</h2><p>${owned.length?'Try another status or search to find your saved games.':'Find a world you want to return to. Save a game, set your status, and make this space your own.'}</p><a class="button primary" href="${owned.length?'#/my-library':'#/games'}">${owned.length?'Show all saved games':'Discover your first game'} <span aria-hidden="true">↗</span></a>${!owned.length?'<button class="text-button" type="button" data-action="sample">Or try a sample library</button>':''}</section>`}
    <div class="library-bottom"><p>Your pace. Your playthrough.</p><a class="text-link" href="#/games">Keep discovering <span aria-hidden="true">↗</span></a></div></div>`;
  }
  function notFound(message='This path leads somewhere we haven’t built yet.') {
    return `<div class="page-shell"><section class="empty-state"><span class="eyebrow">CHECKPOINT NOT FOUND / 404</span><h1>Let’s find another path.</h1><p>${escape(message)}</p><a class="button primary" href="#/games">Back to the collection ↗</a></section></div>`;
  }
  function render(resetScroll = true) {
    const {path,query} = route(); let page,section,title;
    if(path==='/'){page=home();section='home';title='Discover';}
    else if(path==='/games'){page=catalog(query);section='games';title='Games';}
    else if(path.startsWith('/games/')){page=detail(path.slice(7));section='games';title=games.find(g=>g.id===path.slice(7))?.title||'Game not found';}
    else if(path==='/my-library'){page=libraryPage(query);section='library';title='My Library';}
    else {page=notFound();title='Not found';}
    main.innerHTML=page;
    document.title=`${title} · CHECKPOINT`;
    document.querySelectorAll('[data-nav]').forEach(a=>{a.classList.toggle('active',a.dataset.nav===section);if(a.dataset.nav===section)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    document.querySelector('#nav-count').textContent=Object.keys(library).length;
    main.querySelectorAll('img').forEach(img=>img.addEventListener('error',()=>{img.classList.add('image-failed');img.alt='Artwork unavailable';}));
    if(resetScroll) {window.scrollTo({top:0,behavior:'instant'});main.focus({preventScroll:true});}
  }
  function refreshKeepingFocus(selector) {
    const y=scrollY; render(false); window.scrollTo(0,y); if(selector)main.querySelector(selector)?.focus({preventScroll:true});
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('.skip-link')){event.preventDefault();main.focus();main.scrollIntoView();return;}
    const button=event.target.closest('[data-action]');if(!button)return;
    const action=button.dataset.action,id=button.dataset.id,g=games.find(g=>g.id===id);
    if(action==='save'&&g){library[id]='Wishlist';save();refreshKeepingFocus(`[data-action="library"][data-id="${id}"]`);notify(persistent?`${g.title} added to your wishlist.`:'Added for this session. Browser storage is unavailable.');}
    if(action==='library')go('/my-library');
    if(action==='remove'&&g){undoEntry={id,status:library[id]};delete library[id];save();refreshKeepingFocus('.library-results-bar');notify(`${g.title} removed.${persistent?'':' This session only.'}`,true);}
    if(action==='undo'&&undoEntry){library[undoEntry.id]=undoEntry.status;save();undoEntry=null;render(false);notify(persistent?'Game restored to your library.':'Restored for this session only.');}
    if(action==='sample'){games.slice(0,4).forEach((g,i)=>{if(!library[g.id])library[g.id]=['Playing','Backlog','Wishlist','Completed'][i];});save();render(false);notify(persistent?'Sample library loaded. Make it your own.':'Sample library loaded for this session only.');}
    if(action==='clear-filter'){const {query}=route();query.delete(button.dataset.key);go(`/games${query.size?'?'+query.toString():''}`);}
    if(action==='tab'){const {query}=route();if(button.dataset.statusTab==='All games')query.delete('status');else query.set('status',button.dataset.statusTab);go(`/my-library${query.size?'?'+query.toString():''}`);}
  });
  document.addEventListener('change',event=>{
    const id=event.target.dataset.status;
    if(id&&library[id]&&statuses.includes(event.target.value)){library[id]=event.target.value;save();refreshKeepingFocus(`[data-status="${id}"]`);notify(persistent?`Status changed to ${library[id]}.`:'Status changed for this session only.');}
    if(event.target.closest('#catalog-form')&&event.target.tagName==='SELECT')event.target.form.requestSubmit();
  });
  document.addEventListener('submit',event=>{
    if(event.target.id==='catalog-form'){event.preventDefault();const params=new URLSearchParams();for(const [k,v]of new FormData(event.target)){if(String(v).trim()&&!(k==='sort'&&v==='editorial'))params.set(k,String(v).trim());}go('/games'+(params.size?'?'+params:''));}
    if(event.target.id==='library-form'){event.preventDefault();const {query}=route();const q=String(new FormData(event.target).get('q')||'').trim();if(q)query.set('q',q);else query.delete('q');go('/my-library'+(query.size?'?'+query:''));}
  });
  window.addEventListener('hashchange',()=>render());
  render(false);
})();
