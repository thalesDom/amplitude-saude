/* ---------- Preloader ---------- */
const preloaderStart = performance.now();
window.addEventListener('load', () => {
  const elapsed = performance.now() - preloaderStart;
  const minDelay = Math.max(0, 700 - elapsed);
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    preloader.classList.add('hide');
    document.body.classList.remove('is-loading');
    setTimeout(() => preloader.remove(), 700);
  }, minDelay);
});

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Scroll progress bar ---------- */
  const progress = document.getElementById('scrollProgress');
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');
  const themeToggleFloat = document.querySelector('.theme-toggle-float');

  function onScroll(){
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + '%';
    navbar.classList.toggle('scrolled', h.scrollTop > 40);
    const backVisible = h.scrollTop > 600;
    backToTop.classList.toggle('show', backVisible);
    if(themeToggleFloat) themeToggleFloat.classList.toggle('up', backVisible);
  }
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  backToTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');
  function closeMenu(){
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    navOverlay.classList.remove('show');
  }
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    navOverlay.classList.toggle('show');
  });
  navOverlay.addEventListener('click', closeMenu);
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- Login modal ---------- */
  const loginTrigger = document.getElementById('loginTrigger');
  const loginModal = document.getElementById('loginModal');
  if(loginTrigger && loginModal){
    const loginModalOverlay = document.getElementById('loginModalOverlay');
    const loginModalClose = document.getElementById('loginModalClose');
    const openLogin = () => loginModal.classList.add('open');
    const closeLogin = () => loginModal.classList.remove('open');
    loginTrigger.addEventListener('click', openLogin);
    loginModalOverlay.addEventListener('click', closeLogin);
    loginModalClose.addEventListener('click', closeLogin);
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeLogin(); });
  }

  /* ---------- Network ticker (auto-scroll + manual arrows) ---------- */
  const ticker = document.getElementById('ticker');
  const tickerPrev = document.getElementById('tickerPrev');
  const tickerNext = document.getElementById('tickerNext');
  if(ticker){
    const tickerStep = 220;
    const tickerSpeed = 45; // px per second
    let tickerRAF, tickerLastTs;
    function tickerAuto(){
      cancelAnimationFrame(tickerRAF);
      tickerLastTs = null;
      const frame = (ts) => {
        if(tickerLastTs !== null){
          const dt = ts - tickerLastTs;
          const half = ticker.scrollWidth / 2;
          ticker.scrollLeft = (ticker.scrollLeft + (tickerSpeed * dt) / 1000) % half;
        }
        tickerLastTs = ts;
        tickerRAF = requestAnimationFrame(frame);
      };
      tickerRAF = requestAnimationFrame(frame);
    }
    function tickerPause(){ cancelAnimationFrame(tickerRAF); tickerLastTs = null; }
    function tickerResumeSoon(){ clearTimeout(ticker._resumeT); ticker._resumeT = setTimeout(tickerAuto, 2500); }
    ticker.addEventListener('mouseenter', tickerPause);
    ticker.addEventListener('mouseleave', tickerAuto);
    ticker.addEventListener('touchstart', tickerPause, {passive:true});
    ticker.addEventListener('touchend', tickerResumeSoon, {passive:true});
    if(tickerPrev) tickerPrev.addEventListener('click', () => {
      tickerPause();
      ticker.scrollBy({left: -tickerStep, behavior:'smooth'});
      tickerResumeSoon();
    });
    if(tickerNext) tickerNext.addEventListener('click', () => {
      tickerPause();
      ticker.scrollBy({left: tickerStep, behavior:'smooth'});
      tickerResumeSoon();
    });
    tickerAuto();
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if(entry.isIntersecting){
        setTimeout(() => entry.target.classList.add('in'), (i * 60) % 240);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:.12, rootMargin:'0px 0px -60px 0px'});
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Hero carousel ---------- */
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const heroEyebrow = document.getElementById('heroEyebrow');
  const heroTitle = document.getElementById('heroTitle');
  const heroSub = document.getElementById('heroSub');
  const heroCount = document.getElementById('heroCount');
  const heroTrack = document.getElementById('heroTrack');
  const heroDots = document.getElementById('heroDots');
  let heroIndex = 0;
  const heroTotal = slides.length;
  const heroDuration = 6000;
  let heroTimer, trackTimer;

  if(heroTotal){
  slides.forEach((s, i) => {
    const g1 = s.style.getPropertyValue('--g1');
    const g2 = s.style.getPropertyValue('--g2');
    const iconEl = s.querySelector('.art-icon');
    const icon = iconEl ? iconEl.textContent.trim() : 'favorite';
    const photoEl = s.querySelector('.art-img');

    const thumb = document.createElement('button');
    thumb.className = 'hero-thumb';
    thumb.style.setProperty('--g1', g1);
    thumb.style.setProperty('--g2', g2);
    if(photoEl){
      thumb.style.backgroundImage = 'url(' + photoEl.getAttribute('src') + ')';
      thumb.classList.add('has-photo');
    } else {
      thumb.innerHTML = '<span class="material-symbols-rounded">' + icon + '</span>';
    }
    thumb.setAttribute('aria-label', 'Ir para slide ' + (i + 1));
    if(i === 0) thumb.classList.add('active');
    thumb.addEventListener('click', () => goToSlide(i));
    heroDots.appendChild(thumb);
  });

  function renderHero(i){
    const s = slides[i];
    slides.forEach(sl => sl.classList.remove('active'));
    s.classList.add('active');
    heroEyebrow.innerHTML = '<span class="material-symbols-rounded" style="font-size:16px">favorite</span> ' + s.dataset.eyebrow;
    heroTitle.textContent = s.dataset.title;
    heroSub.textContent = s.dataset.sub;
    heroCount.textContent = String(i + 1).padStart(2, '0') + '/' + String(heroTotal).padStart(2, '0');
    heroDots.querySelectorAll('.hero-thumb').forEach((d, di) => d.classList.toggle('active', di === i));
  }

  function startTrack(){
    clearInterval(trackTimer);
    let pct = 0;
    heroTrack.style.width = '0%';
    trackTimer = setInterval(() => {
      pct += 100 / (heroDuration / 50);
      heroTrack.style.width = Math.min(pct, 100) + '%';
    }, 50);
  }

  function goToSlide(i){
    heroIndex = (i + heroTotal) % heroTotal;
    renderHero(heroIndex);
    resetHeroTimer();
  }

  function resetHeroTimer(){
    clearTimeout(heroTimer);
    startTrack();
    heroTimer = setTimeout(() => goToSlide(heroIndex + 1), heroDuration);
  }

  renderHero(0);
  resetHeroTimer();
  }

  /* ---------- Locations: list + detail panel ---------- */
  const locations = [
    {name:'Luzia', area:'Luzia, Aracaju – SE', addr:'Av. Luiz Alves, 350 – Luzia, Aracaju – SE, 49040-010', hours:'Segunda à Sexta: 06:00 às 17:00 · Sábado: 06:00 às 11:00', coleta:'Segunda à Sexta: 06:00 às 09:00', phone:'(79) 3216-1001', whats:'(79) 9 9101-0001', email:'luzia@amplitudesaude.com.br'},
    {name:'Garcia', area:'Garcia, Aracaju – SE', addr:'Rua José do Prado Franco, 210 – Garcia, Aracaju – SE, 49030-320', hours:'Segunda à Sexta: 06:00 às 17:00 · Sábado: 06:00 às 11:00', coleta:'Segunda à Sexta: 06:00 às 09:00', phone:'(79) 3216-1002', whats:'(79) 9 9101-0002', email:'garcia@amplitudesaude.com.br'},
    {name:'Aruana', area:'Aruana, Aracaju – SE', addr:'Av. Santos Dumont, 88 – Aruana, Aracaju – SE, 49025-040', hours:'Segunda à Sexta: 06:00 às 17:00 · Sábado: 06:00 às 11:00', coleta:'Segunda à Sexta: 06:00 às 09:00', phone:'(79) 3216-1003', whats:'(79) 9 9101-0003', email:'aruana@amplitudesaude.com.br'},
    {name:'Lagarto', area:'São José, Lagarto – SE', addr:'Praça Filomeno Hora, 45 – São José, Lagarto – SE, 49400-000', hours:'Segunda à Sexta: 06:00 às 17:00 · Sábado: 06:00 às 11:00', coleta:'Segunda à Sexta: 06:00 às 09:00', phone:'(79) 3216-1004', whats:'(79) 9 9101-0004', email:'lagarto@amplitudesaude.com.br'},
    {name:'Farolândia', area:'Farolândia, Aracaju – SE', addr:'Av. Euclides Figueiredo, 520 – Farolândia, Aracaju – SE, 49030-470', hours:'Segunda à Sexta: 06:00 às 17:00 · Sábado: 06:00 às 11:00', coleta:'Segunda à Sexta: 06:00 às 09:00', phone:'(79) 3216-1005', whats:'(79) 9 9101-0005', email:'farolandia@amplitudesaude.com.br'},
    {name:'Barra dos Coqueiros', area:'Centro, Barra dos Coqueiros – SE', addr:'Av. Beira Mar, 12 – Centro, Barra dos Coqueiros – SE, 49140-000', hours:'Segunda à Sexta: 06:00 às 17:00 · Sábado: 06:00 às 11:00', coleta:'Segunda à Sexta: 06:00 às 09:00', phone:'(79) 3216-1006', whats:'(79) 9 9101-0006', email:'barradoscoqueiros@amplitudesaude.com.br'},
    {name:'Jardins', area:'Jardins, Aracaju – SE', addr:'Av. Ministro Geraldo Barreto Sobral, 1800 – Jardins, Aracaju – SE, 49026-010', hours:'Segunda à Sexta: 06:00 às 17:00 · Sábado: 06:00 às 11:00', coleta:'Segunda à Sexta: 06:00 às 09:00', phone:'(79) 3216-1007', whats:'(79) 9 9101-0007', email:'jardins@amplitudesaude.com.br'},
    {name:'Treze de Julho', area:'Treze de Julho, Aracaju – SE', addr:'Rua Dr. Celso Oliva, 465 – Treze de Julho, Aracaju – SE, 49020-090', hours:'Segunda à Sexta: 06:00 às 17:00 · Sábado: 06:00 às 11:00', coleta:'Segunda à Sexta: 06:00 às 09:00', phone:'(79) 3216-1008', whats:'(79) 9 9101-0008', email:'trezedejulho@amplitudesaude.com.br'},
    {name:'Salgado Filho', area:'Salgado Filho, Aracaju – SE', addr:'Av. Adélia Franco, 300 – Salgado Filho, Aracaju – SE, 49048-010', hours:'Segunda à Sexta: 06:00 às 17:00 · Sábado: 06:00 às 11:00', coleta:'Segunda à Sexta: 06:00 às 09:00', phone:'(79) 3216-1009', whats:'(79) 9 9101-0009', email:'salgadofilho@amplitudesaude.com.br'},
    {name:'Coroa do Meio', area:'Coroa do Meio, Aracaju – SE', addr:'Av. Melício Machado, 77 – Coroa do Meio, Aracaju – SE, 49035-160', hours:'Segunda à Sexta: 06:00 às 17:00 · Sábado: 06:00 às 11:00', coleta:'Segunda à Sexta: 06:00 às 09:00', phone:'(79) 3216-1010', whats:'(79) 9 9101-0010', email:'coroadomeio@amplitudesaude.com.br'},
    {name:'Centro Médico Amplitude', area:'Centro, Aracaju – SE', addr:'Av. Barão de Maruim, 900 – Centro, Aracaju – SE, 49010-410', hours:'Segunda à Sexta: 06:00 às 17:00 · Sábado: 06:00 às 11:00', coleta:'Segunda à Sexta: 06:00 às 09:00', phone:'(79) 3216-1011', whats:'(79) 9 9101-0011', email:'centro@amplitudesaude.com.br'},
  ];

  const locListEl = document.getElementById('locList');
  const locDetailEl = document.getElementById('locDetail');

  function renderLocDetail(loc){
    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(loc.addr);
    locDetailEl.innerHTML = `
      <h4>Unidade ${loc.name}</h4>
      <ul class="loc-detail-rows">
        <li><span class="material-symbols-rounded">location_on</span> ${loc.addr}</li>
        <li><span class="material-symbols-rounded">call</span> ${loc.phone}</li>
        <li><span class="material-symbols-rounded">chat</span> ${loc.whats}</li>
        <li><span class="material-symbols-rounded">mail</span> ${loc.email}</li>
        <li><span class="material-symbols-rounded">schedule</span> <b>Atendimento:</b> ${loc.hours}</li>
        <li><span class="material-symbols-rounded">biotech</span> <b>Coleta:</b> ${loc.coleta}</li>
      </ul>
      <a href="${mapsUrl}" target="_blank" rel="noopener" class="btn btn-teal btn-sm">Abrir no Maps <span class="material-symbols-rounded">open_in_new</span></a>`;
  }

  if(locListEl && locDetailEl){
    locations.forEach((loc, i) => {
      const item = document.createElement('button');
      item.className = 'loc-item' + (i === 0 ? ' active' : '');
      item.innerHTML = `
        <span class="material-symbols-rounded">location_on</span>
        <span><h5>${loc.name}</h5><small>${loc.area}</small></span>`;
      item.addEventListener('click', () => {
        locListEl.querySelectorAll('.loc-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        renderLocDetail(loc);
      });
      locListEl.appendChild(item);
    });
    renderLocDetail(locations[0]);
  }

  /* ---------- Generic count-up (any [data-count] not already handled) ---------- */
  const countEls = document.querySelectorAll('[data-count]:not(.hstat strong):not(.cstat strong)');
  if(countEls.length){
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const el = entry.target;
          const target = parseFloat(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          const start = performance.now();
          const duration = 1400;
          function tick(now){
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(target * eased).toLocaleString('pt-BR') + suffix;
            if(p < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString('pt-BR') + suffix;
          }
          requestAnimationFrame(tick);
          countObserver.unobserve(el);
        }
      });
    }, {threshold:.6});
    countEls.forEach(el => countObserver.observe(el));
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.accordion-item').forEach(item => {
    item.querySelector('.accordion-head').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- Contact form ---------- */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if(!form.checkValidity()){ form.reportValidity(); return; }
      success.classList.add('show');
      form.reset();
      setTimeout(() => success.classList.remove('show'), 5000);
    });
  }

  /* ---------- Lead strip form ---------- */
  const leadForm = document.getElementById('leadForm');
  const leadSuccess = document.getElementById('leadFormSuccess');
  if(leadForm){
    leadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if(!leadForm.checkValidity()){ leadForm.reportValidity(); return; }
      leadSuccess.classList.add('show');
      leadForm.reset();
      setTimeout(() => leadSuccess.classList.remove('show'), 5000);
    });
  }

  /* ---------- Animated community stat ---------- */
  const communityStat = document.getElementById('communityStat');
  if(communityStat){
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const target = 120000;
          const start = performance.now();
          function tick(now){
            const p = Math.min((now - start) / 1400, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            communityStat.textContent = '+' + Math.floor(target * eased).toLocaleString('pt-BR');
            if(p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          statObserver.unobserve(communityStat);
        }
      });
    }, {threshold:.6});
    statObserver.observe(communityStat);
  }

  /* ---------- Active nav on scroll ---------- */
  const sections = ['heroSection','sobre','planos','rede','telemedicina','faq'].map(id => document.getElementById(id)).filter(Boolean);
  const navA = document.querySelectorAll('.nav-links a');
  const navHrefFor = id => id === 'sobre' ? 'sobre-nos.html' : id === 'heroSection' ? '#top' : ('#' + id);
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const target = navHrefFor(entry.target.id);
        navA.forEach(a => a.classList.toggle('active', a.getAttribute('href') === target));
      }
    });
  }, {rootMargin:'-40% 0px -55% 0px'});
  sections.forEach(s => spyObserver.observe(s));

  /* ---------- Theme toggle (dark/light) ---------- */
  const themeToggle = document.getElementById('themeToggle');
  if(themeToggle){
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', current);
      localStorage.setItem('amplitude-theme', current);
    });
  }

  /* ---------- Cookie consent banner ---------- */
  const cookieBanner = document.getElementById('cookieBanner');
  if(cookieBanner){
    const consent = localStorage.getItem('amplitude-cookie-consent');
    if(!consent){
      setTimeout(() => cookieBanner.classList.add('show'), 1200);
    }
    const dismiss = (value) => {
      localStorage.setItem('amplitude-cookie-consent', value);
      cookieBanner.classList.remove('show');
    };
    document.getElementById('cookieAccept').addEventListener('click', () => dismiss('accepted'));
    document.getElementById('cookieReject').addEventListener('click', () => dismiss('rejected'));
    document.addEventListener('click', (e) => {
      if(cookieBanner.classList.contains('show') && !cookieBanner.contains(e.target)){
        dismiss('dismissed');
      }
    });
  }

});
