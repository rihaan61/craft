// BloomCraft Creations - Interactions
// - Sticky nav handled by CSS
// - Smooth scrolling via CSS and JS enhancement for offset
// - Mobile hamburger menu
// - Product "Order Now" -> prefill custom order form
// - Basic form validation and friendly errors
// - Feather icons init and dynamic year

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Feather icons
  if (window.feather) {
    window.feather.replace();
  }

  // Dynamic year in footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Hamburger menu toggle
  const hamburger = $('#hamburger');
  const nav = $('#navMenu');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click (mobile)
    $$('#navMenu a').forEach(a => a.addEventListener('click', () => {
      if (nav.classList.contains('open')) {
        nav.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    }));
  }

  // Smooth scroll offset (accounts for sticky header height)
  const header = $('.header');
  const headerHeight = () => header ? header.getBoundingClientRect().height : 0;

  $$('#navMenu a, .hero-actions a, .footer a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const target = $(href);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - (headerHeight() + 8);
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  // Product quick order -> prefill occasion and focus form
  const orderButtons = $$('.order-btn');
  const occasionInput = $('#occasion');
  const form = $('#orderForm');
  orderButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const product = btn.getAttribute('data-product') || 'Custom Gift';
      if (occasionInput) {
        occasionInput.value = product;
        occasionInput.focus({ preventScroll: true });
      }
      const target = $('#custom-order');
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - (headerHeight() + 8);
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Simple form validation
  const validators = {
    name: (v) => v.trim().length >= 2 || 'Please enter your full name.',
    phone: (v) => /[0-9+()\-\s]{7,}/.test(v) || 'Please enter a valid phone number.',
    occasion: (v) => v.trim().length > 0 || 'Please tell us the occasion.',
    budget: (v) => Number(v) > 0 || 'Please provide a budget greater than 0.'
  };

  function showError(input, message) {
    const group = input.closest('.input-group');
    const small = group ? group.querySelector('.error') : null;
    if (small) small.textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateInput(input) {
    const name = input.name;
    const val = input.value || '';
    const rule = validators[name];
    if (!rule) return true;
    const res = rule(val);
    if (res !== true) {
      showError(input, res);
      return false;
    }
    showError(input, '');
    return true;
  }

  if (form) {
    // Blur validation
    $$('#orderForm input[required], #orderForm textarea[required]').forEach(inp => {
      inp.addEventListener('blur', () => validateInput(inp));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = $$('#orderForm input[required], #orderForm textarea[required]');
      let allValid = true;
      inputs.forEach(inp => { if (!validateInput(inp)) allValid = false; });
      if (!allValid) return;

      // Simulate submit - In real scenario, send to backend or WhatsApp
      const data = Object.fromEntries(new FormData(form).entries());
      alert(`Thank you, ${data.name}! We will contact you at ${data.phone} to finalize your ${data.occasion}.`);
      form.reset();
    });
  }
})();
