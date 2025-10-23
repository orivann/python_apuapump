(function () {
  const html = document.documentElement;
  const body = document.body;
  const nav = document.querySelector('.nav');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const langBtn = document.getElementById('langToggle');
  const themeBtn = document.getElementById('themeToggle');
  const chat = document.querySelector('.chatbot');
  const chatToggle = document.getElementById('chatToggle');
  const chatClose = document.getElementById('chatClose');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const contactForm = document.getElementById('contactForm');

  let lang = localStorage.getItem('lang') || 'en';
  let theme = localStorage.getItem('theme') || 'light';

  function applyTheme() {
    const isDark = theme === 'dark';
    html.classList.toggle('dark', isDark);
    themeBtn.textContent = isDark ? '🌙' : '☀️';
    themeBtn.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    localStorage.setItem('theme', theme);
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && typeof text === 'string') {
      el.textContent = text;
    }
  }

  function applyLang() {
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    localStorage.setItem('lang', lang);
    fetch(`/static/locales/${lang}.json`)
      .then((response) => response.json())
      .then((dict) => {
        document.title = dict.meta.title;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', dict.meta.description);
        }

        setText('brand', dict.header.brand);
        setText('navProducts', dict.header.nav_products);
        setText('navContact', dict.header.nav_contact);
        setText('ctaQuote', dict.header.cta_quote);

        const page = body.dataset.page || 'home';
        if (page === 'home') {
          setText('eyebrow', dict.hero.eyebrow);
          setText('title', dict.hero.title);
          setText('subtitle', dict.hero.subtitle);
          setText('primaryBtn', dict.hero.primary);
          setText('secondaryBtn', dict.hero.secondary);
          setText('expertiseTitle', dict.sections.expertise || '');
          setText('expertiseLead', dict.sections.lead || '');
          const cards = dict.sections.cards || [];
          cards.forEach((card, index) => {
            const cardRoot = document.getElementById(`card${index + 1}`);
            if (cardRoot) {
              const heading = cardRoot.querySelector('h3');
              const paragraph = cardRoot.querySelector('p');
              if (heading) heading.textContent = card.title;
              if (paragraph) paragraph.textContent = card.desc;
            }
          });
          const stats = dict.sections.stats || [];
          stats.forEach((stat, index) => {
            const statRoot = document.getElementById(`stat${index + 1}`);
            if (statRoot) {
              const value = statRoot.querySelector('.stat__value');
              const label = statRoot.querySelector('.stat__label');
              if (value) value.textContent = stat.k;
              if (label) label.textContent = stat.v;
            }
          });
        } else if (page === 'products') {
          setText('productsTitle', dict.products.title);
        } else if (page === 'contact') {
          setText('contactTitle', dict.contact.title);
          setText('nameLabel', dict.contact.name);
          setText('emailLabel', dict.contact.email);
          setText('messageLabel', dict.contact.message);
          setText('sendBtn', dict.contact.send);
        }

        langBtn.textContent = lang.toUpperCase();
      })
      .catch(() => {
        console.warn('Missing locale file for', lang);
      });
  }

  function toggleNav(forceState) {
    if (!nav) return;
    const open = typeof forceState === 'boolean' ? forceState : nav.dataset.open !== 'true';
    nav.dataset.open = open;
    navToggle?.setAttribute('aria-expanded', open);
    navMenu?.setAttribute('aria-hidden', !open);
  }

  if (nav) {
    nav.dataset.open = 'false';
  }
  navMenu?.setAttribute('aria-hidden', 'true');

  navToggle?.addEventListener('click', () => toggleNav());

  navMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => toggleNav(false));
  });

  langBtn?.addEventListener('click', () => {
    lang = lang === 'en' ? 'he' : 'en';
    applyLang();
  });

  themeBtn?.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    applyTheme();
  });

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function appendMessage(text, sender = 'user') {
    if (!chatMessages) return;
    const bubble = document.createElement('div');
    bubble.className = sender === 'user' ? 'message message--user' : 'message message--bot';
    const safeText = escapeHtml(text);
    bubble.innerHTML = `<p>${safeText}</p><span class="message__time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
  }

  function setChatState(open) {
    if (!chat) return;
    chat.dataset.state = open ? 'open' : 'closed';
    chatToggle?.setAttribute('aria-expanded', open);
    const chatWindow = document.getElementById('chatWindow');
    chatWindow?.setAttribute('aria-hidden', (!open).toString());
    if (open) {
      setTimeout(() => chatInput?.focus(), 150);
    }
  }

  chatToggle?.addEventListener('click', () => {
    const open = chat?.dataset.state !== 'open';
    setChatState(open);
  });

  chatClose?.addEventListener('click', () => setChatState(false));

  chatForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = chatInput?.value?.trim();
    if (!value) return;
    appendMessage(value, 'user');
    chatInput.value = '';
    setTimeout(() => {
      appendMessage('Thanks! A specialist will reach out shortly.', 'bot');
    }, 600);
  });

  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = contactForm.querySelectorAll('.form__field');
    let hasErrors = false;
    fields.forEach((field) => {
      const input = field.querySelector('input, textarea');
      if (!input) return;
      const isValid = input.checkValidity();
      field.classList.toggle('is-error', !isValid);
      if (!isValid) {
        hasErrors = true;
      }
    });
    if (!hasErrors) {
      contactForm.reset();
      fields.forEach((field) => field.classList.remove('is-error'));
      appendMessage('Thanks for reaching out! We will contact you shortly.', 'bot');
      setChatState(true);
    }
  });

  document.addEventListener('click', (event) => {
    if (!chat || chat.dataset.state !== 'open') return;
    const target = event.target;
    if (target instanceof Node && !chat.contains(target)) {
      setChatState(false);
    }
  });

  // Initial load
  applyTheme();
  applyLang();
})();
