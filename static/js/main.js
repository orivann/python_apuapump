
(function(){
  const html = document.documentElement;
  const langBtn = document.getElementById('langToggle');
  const themeBtn = document.getElementById('themeToggle');

  // Defaults: EN + Light always for first load
  let lang = localStorage.getItem('lang') || 'en';
  let theme = localStorage.getItem('theme') || 'light';

  function applyTheme() {
    if (theme === 'dark') { html.classList.add('dark'); themeBtn.textContent = '🌙'; }
    else { html.classList.remove('dark'); themeBtn.textContent = '☀️'; }
    localStorage.setItem('theme', theme);
  }

  function applyLang() {
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    localStorage.setItem('lang', lang);
    fetch(`/static/locales/${lang}.json`).then(r => r.json()).then(dict => {
      // SEO meta
      document.title = dict.meta.title;
      const md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', dict.meta.description);

      // Header
      document.getElementById('brand').textContent = dict.header.brand;
      document.getElementById('navProducts').textContent = dict.header.nav_products;
      document.getElementById('navContact').textContent = dict.header.nav_contact;
      document.getElementById('ctaQuote').textContent = dict.header.cta_quote;

      const page = document.body.dataset.page || 'home';
      if (page === 'home') {
        document.getElementById('eyebrow').textContent = dict.hero.eyebrow;
        document.getElementById('title').textContent = dict.hero.title;
        document.getElementById('subtitle').textContent = dict.hero.subtitle;
        document.getElementById('primaryBtn').textContent = dict.hero.primary;
        document.getElementById('secondaryBtn').textContent = dict.hero.secondary;
        // Cards
        const cards = dict.sections.cards;
        for (let i=0; i<cards.length; i++) {
          document.querySelector(`#card${i+1} h3`).textContent = cards[i].title;
          document.querySelector(`#card${i+1} p`).textContent = cards[i].desc;
        }
        const stats = dict.sections.stats;
        for (let i=0; i<stats.length; i++) {
          document.querySelector(`#stat${i+1} .k`).textContent = stats[i].k;
          document.querySelector(`#stat${i+1} .v`).textContent = stats[i].v;
        }
      } else if (page === 'products') {
        document.getElementById('productsTitle').textContent = dict.products.title;
      } else if (page === 'contact') {
        document.getElementById('contactTitle').textContent = dict.contact.title;
        document.getElementById('nameLabel').textContent = dict.contact.name;
        document.getElementById('emailLabel').textContent = dict.contact.email;
        document.getElementById('messageLabel').textContent = dict.contact.message;
        document.getElementById('sendBtn').textContent = dict.contact.send;
      }

      langBtn.textContent = lang.toUpperCase();
    });
  }

  // Navigation actions
  document.getElementById('primaryBtn')?.addEventListener('click', () => location.href='/products');
  document.getElementById('secondaryBtn')?.addEventListener('click', () => location.href='/contact');

  // Toggles
  langBtn.addEventListener('click', () => { lang = (lang === 'en' ? 'he' : 'en'); applyLang(); });
  themeBtn.addEventListener('click', () => { theme = (theme === 'light' ? 'dark' : 'light'); applyTheme(); });

  // Scroll reveal animations
  const io = new IntersectionObserver((entries)=>{
    entries.forEach((e)=>{
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: .06 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // Initialize defaults (force EN + Light on first ever run)
  if (!localStorage.getItem('lang')) lang = 'en';
  if (!localStorage.getItem('theme')) theme = 'light';
  applyTheme();
  applyLang();
})();
