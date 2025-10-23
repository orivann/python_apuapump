(function () {
  const html = document.documentElement;
  const body = document.body;
  const nav = document.querySelector('.nav');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const langBtn = document.getElementById('langToggle');
  const themeBtn = document.getElementById('themeToggle');
  const themeIcon = themeBtn?.querySelector('[data-theme-icon]');
  const chat = document.querySelector('.chatbot');
  const chatToggle = document.getElementById('chatToggle');
  const chatClose = document.getElementById('chatClose');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const contactForm = document.getElementById('contactForm');
  const appConfig = window.APP_CONFIG || {};
  const supabaseConfig = appConfig.supabase || {};
  const CONTACT_TABLE = supabaseConfig.contact_table || 'contact_messages';
  const chatbotConfig = appConfig.chatbot || {};
  const chatbotReady = Boolean(chatbotConfig.api_key_set);

  let lang = localStorage.getItem('lang') || 'en';
  let theme = localStorage.getItem('theme') || 'light';
  let langRequestToken = 0;

  langBtn?.setAttribute('dir', 'ltr');

  function applyTheme() {
    const isDark = theme === 'dark';
    html.classList.toggle('dark', isDark);
    if (themeIcon) {
      themeIcon.textContent = isDark ? '🌙' : '☀️';
    } else if (themeBtn) {
      themeBtn.textContent = isDark ? '🌙' : '☀️';
    }
    themeBtn?.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    localStorage.setItem('theme', theme);
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el && typeof text === 'string') {
      el.textContent = text;
    }
  }

  async function applyLang() {
    const requestId = ++langRequestToken;
    html.setAttribute('lang', lang);
    html.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    localStorage.setItem('lang', lang);
    try {
      const response = await fetch(`/static/locales/${lang}.json`, { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error(`Missing locale file for ${lang}`);
      }
      const dict = await response.json();
      if (requestId !== langRequestToken) {
        return;
      }
      document.title = dict.meta.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', dict.meta.description);
      }

      setText('brand', dict.header.brand);
      setText('navProducts', dict.header.nav_products);
      setText('navTechnology', dict.header.nav_technology);
      setText('navSustainability', dict.header.nav_sustainability);
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
        setText('phoneLabel', dict.contact.phone);
        setText('emailLabel', dict.contact.email);
        setText('messageLabel', dict.contact.message);
        setText('sendBtn', dict.contact.send);
      }

      if (langBtn) {
        langBtn.textContent = lang.toUpperCase();
      }
    } catch (error) {
      console.warn(error.message);
    }
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
    toggleNav(false);
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

  function buildContactPayload(form) {
    const formData = new FormData(form);
    return {
      name: (formData.get('name') || '').toString().trim(),
      phone: (formData.get('phone') || '').toString().trim(),
      email: (formData.get('email') || '').toString().trim(),
      message: (formData.get('message') || '').toString().trim(),
      submitted_at: new Date().toISOString(),
    };
  }

  async function queueContactSubmission(payload) {
    if (!supabaseConfig?.url || !supabaseConfig?.anon_key) {
      return { queued: false, reason: 'missing-credentials' };
    }
    console.info('[Supabase] Pending integration', {
      table: CONTACT_TABLE,
      endpoint: supabaseConfig.url,
      payload,
    });
    return { queued: true, table: CONTACT_TABLE };
  }

  chatForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = chatInput?.value?.trim();
    if (!value) return;
    appendMessage(value, 'user');
    chatInput.value = '';
    const placeholderReply = chatbotReady
      ? 'Connecting you with AquaBot… (integration coming soon).'
      : 'Thanks! A specialist will reach out shortly.';
    if (chatbotReady) {
      console.info('Chatbot API key detected. Plug backend integration here.', chatbotConfig);
    }
    setTimeout(() => {
      appendMessage(placeholderReply, 'bot');
    }, 600);
  });

  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = contactForm.querySelectorAll('.form__field');
    let hasErrors = false;
    fields.forEach((field) => {
      const input = field.querySelector('input, textarea');
      if (!input) return;
      input.setCustomValidity('');
      if (input.name === 'phone') {
        const digits = (input.value || '').replace(/\D/g, '');
        if (digits.length < 7) {
          input.setCustomValidity('Please provide a valid phone number.');
        }
      }
      const isValid = input.checkValidity();
      field.classList.toggle('is-error', !isValid);
      if (!isValid) {
        hasErrors = true;
      }
    });
    if (!hasErrors) {
      const payload = buildContactPayload(contactForm);
      queueContactSubmission(payload).catch((error) => {
        console.warn('Supabase queue placeholder failed', error);
      });
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
