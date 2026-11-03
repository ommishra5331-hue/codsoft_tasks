(() => {
  const profile = {
    name: 'Om Mishra',
    degree: 'BTech · CSE',
    school: 'NIET, Greater Noida',
    focus: 'DSA / Web / AI',
    bio: 'I\'m a Computer Science Engineering student learning to turn curiosity into code. I explore software development, DSA, web development, and Artificial Intelligence—one practical build at a time.',
    github: 'https://github.com/ommishra5331-hue',
    linkedin: 'https://www.linkedin.com/in/your-profile',
    email: 'om.mishra.dev@gmail.com'
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const body = document.body;
  const menuToggle = $('#menuToggle');
  const mobileNav = $('#mobileNav');
  const themeToggle = $('#themeToggle');
  const toast = $('#toast');
  let toastTimer;

  function applyProfileInfo() {
    const nameNode = $('#profileName');
    if (nameNode) nameNode.innerHTML = `${profile.name}<span class="lime">.</span>`;

    const bioNode = $('#profileBio');
    if (bioNode) bioNode.textContent = profile.bio;

    const degreeNode = $('#profileDegree');
    if (degreeNode) degreeNode.textContent = profile.degree;

    const schoolNode = $('#profileSchool');
    if (schoolNode) schoolNode.textContent = profile.school;

    const focusNode = $('#profileFocus');
    if (focusNode) focusNode.textContent = profile.focus;

    const githubLink = $('[href="https://github.com/ommishra5331-hue"]');
    if (githubLink) githubLink.href = profile.github;

    const linkedinLink = $('a[href="https://www.linkedin.com/in/your-profile"]');
    if (linkedinLink) linkedinLink.href = profile.linkedin;

    const emailLink = $('a[href="mailto:om.mishra.dev@gmail.com"]');
    if (emailLink) emailLink.href = `mailto:${profile.email}`;

    const emailText = $('#contactEmailText');
    if (emailText) emailText.textContent = profile.email;
  }

  $('#year').textContent = new Date().getFullYear();
  applyProfileInfo();

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  // Restore theme only when a saved preference exists; otherwise use the designed dark default.
  try {
    if (localStorage.getItem('om-portfolio-theme') === 'light') body.classList.add('light-theme');
  } catch (_) { /* Storage may be unavailable in private browsing. */ }
  function updateThemeButton() {
    const light = body.classList.contains('light-theme');
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    themeToggle.title = light ? 'Switch to dark theme' : 'Switch to light theme';
    $('.theme-icon', themeToggle).textContent = light ? '☾' : '☼';
    document.querySelector('meta[name="theme-color"]').setAttribute('content', light ? '#f4f6f0' : '#0b0d0c');
  }
  updateThemeButton();
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    updateThemeButton();
    try { localStorage.setItem('om-portfolio-theme', body.classList.contains('light-theme') ? 'light' : 'dark'); } catch (_) { /* Non-blocking. */ }
  });

  function closeMobileMenu() {
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }
  menuToggle.addEventListener('click', () => {
    const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(willOpen));
    menuToggle.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
    mobileNav.hidden = !willOpen;
  });
  $$('a[href^="#"]', mobileNav).forEach(link => link.addEventListener('click', closeMobileMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMobileMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 850) closeMobileMenu(); });

  // Reveal sections as they enter view, with a graceful fallback for older browsers.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else revealItems.forEach(item => item.classList.add('is-visible'));

  // Active navigation is shared by the main nav and the floating quick rail.
  const sections = $$('main section[id]');
  const navLinks = $$('.nav-link, .rail-link');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('active', active);
        if (link.classList.contains('nav-link')) {
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0, .1, .25, .5] });
    sections.forEach(section => sectionObserver.observe(section));
  }

  // Skill category filter.
  const filterButtons = $$('.filter-button');
  const skillCards = $$('.skill-card');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.toggle('active', item === button));
    const filter = button.dataset.filter;
    skillCards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.hidden = !show;
      if (show) card.classList.add('is-visible');
    });
  }));

  const projectData = {
    workflow: {
      title: 'Employee Workflow Management System',
      type: 'College team project',
      summary: 'A project focused on organising employee work, tracking task status, and improving visibility into workflow progress.',
      approach: 'The intended product direction is to make tasks and progress easier to understand. Confirm the implemented features with your team before adding specifics such as user roles, authentication, dashboards, or database choices.',
      learning: 'Team coordination, workflow modelling, UI/UX decisions, and translating a practical organisational need into software.',
      tags: ['Web development', 'Workflow management', 'Team project', 'UI/UX']
    },
    hospital: {
      title: 'Intelligent Hospital Bed Allocation',
      type: 'Academic project',
      summary: 'An academic project exploring how structured information and computational approaches could support bed availability management and patient allocation.',
      approach: 'The problem space involves representing bed availability and allocation constraints. Add the actual algorithm, data structures, interface, and evaluation only after confirming what was implemented.',
      learning: 'Problem representation, structured data, AI concepts, and thinking about technology in a healthcare setting.',
      tags: ['AI concepts', 'Problem solving', 'Healthcare technology', 'Academic project']
    },
    entrepreneurship: {
      title: 'Intelligent Entrepreneurship Support System',
      type: 'Problem-Based Learning project',
      summary: 'A concept intended to help aspiring entrepreneurs organise ideas, analyse opportunities, and identify structured next steps.',
      approach: 'The concept begins with helping a user clarify a business idea and break it into manageable questions. Specific recommendation engines, datasets, or AI features are not claimed here.',
      learning: 'Problem analysis, idea structuring, entrepreneurship, and identifying user needs.',
      tags: ['Problem analysis', 'Entrepreneurship', 'Computer science', 'Innovation']
    },
    rentflow: {
      title: 'RentFlow: Tenant Expense Tracker',
      type: 'Personal project concept · Planned',
      summary: 'A proposed application for tracking rent, shared household expenses, and payment history through a simple, organised dashboard.',
      approach: 'A possible first version could let a household record expenses, split shared costs, and review payment history. This is a concept, not a completed or deployed application.',
      learning: 'Frontend architecture, user flows, data presentation, and designing a focused product around a practical everyday problem.',
      tags: ['Personal project', 'Frontend development', 'Expense tracking', 'Product design']
    },
    portfolio: {
      title: 'Personal Portfolio Website',
      type: 'Personal project · In development',
      summary: 'A responsive personal portfolio showcasing education, technical interests, projects, and an ongoing learning journey.',
      approach: 'Built with semantic HTML, CSS, and vanilla JavaScript. It includes responsive navigation, a theme toggle, project-detail dialogs, skill filters, scroll-based section highlighting, and reduced-motion support.',
      learning: 'Responsive layout, accessibility, DOM interactions, animation restraint, semantic structure, and maintainable frontend code.',
      tags: ['HTML', 'CSS', 'JavaScript', 'Responsive design', 'Accessibility']
    }
  };
  const dialog = $('#projectDialog');
  const dialogContent = $('#dialogContent');
  $$('.project-details').forEach(button => button.addEventListener('click', () => {
    const project = projectData[button.dataset.project];
    if (!project) return;
    dialogContent.replaceChildren();
    const type = document.createElement('div');
    type.className = 'section-index';
    type.textContent = project.type.toUpperCase();
    const title = document.createElement('h2');
    title.id = 'dialogTitle';
    title.textContent = project.title;
    const summary = document.createElement('p');
    summary.textContent = project.summary;
    const approachHeading = document.createElement('h3');
    approachHeading.textContent = 'Approach / current scope';
    const approach = document.createElement('p');
    approach.textContent = project.approach;
    const learningHeading = document.createElement('h3');
    learningHeading.textContent = 'Learning outcomes';
    const learning = document.createElement('p');
    learning.textContent = project.learning;
    const tags = document.createElement('div');
    tags.className = 'dialog-tags';
    project.tags.forEach(label => { const tag = document.createElement('span'); tag.textContent = label; tags.append(tag); });
    dialogContent.append(type, title, summary, approachHeading, approach, learningHeading, learning, tags);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else showToast('Project details are available in the page source if dialogs are unsupported.');
  }));
  $('#dialogClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

  $('#copyGithub').addEventListener('click', async () => {
    const url = 'https://github.com/ommishra5331-hue';
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(url);
      else {
        const helper = document.createElement('textarea'); helper.value = url; helper.style.position = 'fixed'; helper.style.opacity = '0';
        document.body.append(helper); helper.select();
        const copied = document.execCommand('copy'); helper.remove();
        if (!copied) throw new Error('Copy unavailable');
      }
      $('#copyStatus').textContent = 'GitHub link copied. LinkedIn and email are waiting for your real details.';
      showToast('GitHub link copied');
    } catch (_) {
      $('#copyStatus').textContent = `Your GitHub profile: ${url}`;
      showToast('Copy is unavailable here — GitHub link shown below.');
    }
  });
  $('#backTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));

  // Desktop-only ambient cursor light. It is decorative and never intercepts input.
  const cursorGlow = $('.cursor-glow');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.addEventListener('pointermove', event => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });
  } else cursorGlow.hidden = true;
})();
