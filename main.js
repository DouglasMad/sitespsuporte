document.documentElement.classList.add('js');

const WHATSAPP_NUMBER = '351964848813';
const byId = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
  const year = byId('year');
  if (year) year.textContent = new Date().getFullYear();

  setupMenu();
  if (byId('brief')) setupForm();
  setupWhatsappFloat();
  setupCarousel();
  setupMotion();
});

function setupMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = byId('menu');
  if (!toggle || !menu) return;

  const setOpen = open => {
    menu.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

function setupForm() {
  const form = byId('brief');
  const result = byId('result');
  const send = byId('send-whatsapp');
  const copy = byId('copy');
  const textFields = [form.elements.nome, form.elements.ideia];
  let summary = '';

  document.querySelectorAll('[data-service]').forEach(link => {
    link.addEventListener('click', () => {
      byId('service').value = link.dataset.service;
    });
  });

  // "required" aceita campos só com espaços; aqui exige-se texto real.
  textFields.forEach(field => {
    field.addEventListener('input', () => field.setCustomValidity(''));
    field.addEventListener('invalid', () => {
      if (!field.value.trim()) field.setCustomValidity('Preencha este campo.');
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    const empty = textFields.find(field => !field.value.trim());
    if (empty) {
      empty.setCustomValidity('Preencha este campo.');
      empty.reportValidity();
      return;
    }

    const data = new FormData(form);
    summary = 'Pedido de orçamento — SP Suporte'
      + '\nNome: ' + data.get('nome').trim()
      + '\nServiço: ' + data.get('servico')
      + '\nProjeto: ' + data.get('ideia').trim();
    const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(summary);

    send.href = url;
    send.hidden = false;
    copy.hidden = false;
    copy.textContent = 'Copiar pedido';
    result.textContent = 'O seu pedido está pronto. Abra o WhatsApp e envie a mensagem.';
    window.open(url, '_blank', 'noopener,noreferrer');
  });

  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(summary);
      copy.textContent = 'Pedido copiado ✓';
    } catch {
      result.textContent = summary + '\nSelecione o texto acima e copie-o.';
    }
  });
}

// O botão flutuante não deve tapar o dashboard do topo nem o formulário.
function setupWhatsappFloat() {
  const float = document.querySelector('.whatsapp-float');
  const zones = [byId('inicio'), byId('contacto')].filter(Boolean);
  if (!float || !zones.length || !('IntersectionObserver' in window)) return;

  const visible = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    float.classList.toggle('is-hidden', visible.size > 0);
  }, { rootMargin: '-90px 0px 0px 0px' }); // desconta o cabeçalho fixo
  zones.forEach(zone => observer.observe(zone));
}

function setupCarousel() {
  const carousel = document.querySelector('.project-carousel');
  if (!carousel) return;

  const INTERVAL = 6000;
  const SWIPE_DISTANCE = 50;
  const slides = [...carousel.querySelectorAll('.project')];
  const dots = [...carousel.querySelectorAll('.carousel-dot')];
  const toggle = carousel.querySelector('.carousel-toggle');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer = null;
  let playing = !reduced.matches;
  let hovered = false;
  let focused = false;
  let inView = true;

  const show = index => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
    dots.forEach((dot, i) => {
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  // Só roda com o carrossel à vista e sem o visitante a interagir com ele.
  const restart = () => {
    clearInterval(timer);
    if (playing && !hovered && !focused && inView && !document.hidden) {
      timer = setInterval(() => show(current + 1), INTERVAL);
    }
  };

  const setPlaying = value => {
    playing = value;
    toggle.classList.toggle('is-paused', !playing);
    toggle.setAttribute('aria-label', playing ? 'Pausar a rotação dos projetos' : 'Retomar a rotação dos projetos');
    carousel.querySelector('.project-slides').setAttribute('aria-live', playing ? 'off' : 'polite');
    restart();
  };

  const go = index => {
    show(index);
    restart();
  };

  dots.forEach((dot, i) => dot.addEventListener('click', () => go(i)));
  carousel.querySelectorAll('[data-step]').forEach(arrow => {
    arrow.addEventListener('click', () => go(current + Number(arrow.dataset.step)));
  });
  toggle.addEventListener('click', () => setPlaying(!playing));

  carousel.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    restart();
  });
  carousel.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = false;
    restart();
  });
  // Um clique de rato deixa o foco no botão; só a navegação por teclado pausa.
  carousel.addEventListener('focusin', event => {
    focused = event.target.matches(':focus-visible');
    restart();
  });
  carousel.addEventListener('focusout', () => {
    focused = false;
    restart();
  });

  let touchStart = null;
  carousel.addEventListener('touchstart', event => {
    touchStart = event.touches[0];
  }, { passive: true });
  carousel.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.clientX;
    const dy = event.changedTouches[0].clientY - touchStart.clientY;
    touchStart = null;
    if (Math.abs(dx) > SWIPE_DISTANCE && Math.abs(dx) > Math.abs(dy)) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  document.addEventListener('visibilitychange', restart);
  reduced.addEventListener('change', event => {
    if (event.matches) setPlaying(false);
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries[entries.length - 1].isIntersecting;
      restart();
    }, { threshold: .4 }).observe(carousel);
  }

  setPlaying(playing);
}

function formatCount(el, value) {
  const [integer, decimals] = value.toFixed(Number(el.dataset.decimals || 0)).split('.');
  return integer.replace(/\B(?=(\d{3})+$)/g, '.') + (decimals ? ',' + decimals : '') + (el.dataset.suffix || '');
}

function animateCounts() {
  const duration = 1100;
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = Number(el.dataset.count);
    // Mantém a largura final para os cartões não saltarem durante a contagem.
    el.style.minWidth = el.offsetWidth + 'px';
    const start = performance.now();
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatCount(el, target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function setupMotion() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return;

  animateCounts();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });

  document.querySelectorAll('.hero-copy,.sectiontop,.service,.project-carousel,.portfolio-card,.about,.steps article,.contact').forEach((el, i) => {
    el.style.setProperty('--reveal-delay', el.matches('.service,.steps article') ? (i % 4) * 65 + 'ms' : '0ms');
    el.classList.add('motion-reveal');
    observer.observe(el);
  });

  document.querySelectorAll('.chart').forEach(chart => {
    chart.querySelectorAll('.bar').forEach((bar, i) => bar.style.setProperty('--bar-delay', i * 90 + 'ms'));
    chart.classList.add('motion-chart');
    observer.observe(chart);
  });

  reduced.addEventListener('change', event => {
    if (event.matches) {
      observer.disconnect();
      document.querySelectorAll('.motion-reveal,.motion-chart').forEach(el => el.classList.add('is-visible'));
    }
  });
}
