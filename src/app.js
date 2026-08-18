/*
 * app.js — screens, rendering and input handling.
 */
(function (global) {
  'use strict';

  const MP = global.MP;
  const T = MP.taxonomy;
  const E = MP.engine;

  const $ = (sel, root) => (root || document).querySelector(sel);
  const app = () => $('#app');

  let settings = MP.store.loadSettings();
  let session = null;
  let answered = false; // has the current step been answered?
  let touched = false;  // has the user done anything since the screen was drawn?

  /* the four ways to practise */
  /*
   * The two directions. Taking a word apart is the harder way round and the
   * one that reads real text: you are given the surface and have to recover
   * the chart. Building goes the other way, from a root you already know to a
   * form. Both matter, but they are different exercises and were sitting in
   * one undifferentiated grid of six.
   */
  const MODE_GROUPS = [
    { id: 'apart', name: 'Take a word apart', desc: 'You are given the word and have to recover the chart.' },
    { id: 'build', name: 'Build it yourself', desc: 'You are given the root or the frame and have to produce the forms.' }
  ];

  const MODES = [
    { id: 'analysis', group: 'apart', name: 'Full analysis', desc: 'Walk a word down the chart, question by question.' },
    { id: 'sentences', group: 'apart', name: 'Sentences', desc: 'Fill the missing word into a real sentence, then translate it.' },
    { id: 'production', group: 'build', name: 'Build the form', desc: 'Given a root and a cell, produce the word yourself.' },
    { id: 'conjugation', group: 'build', name: 'Conjugation', desc: 'Ṣarf kabīr: conjugate a verb for any of the fourteen persons.' },
    { id: 'ilal', group: 'build', name: 'Weak letter rules', desc: 'Iʿlāl: build what Arabic really says, then name the rule that did it.' },
    { id: 'template', group: 'build', name: 'Fill the template', desc: 'The recitation frame with every form loose — drag or tap them into place.' }
  ];

  const currentMode = () => settings.mode || 'analysis';

  /* which questions a session asks — any combination */
  const FOCUS_MODES = [
    { id: 'baab', name: 'Bāb / form' },
    { id: 'voice', name: 'Active / passive' },
    { id: 'subtype', name: 'Ṣaḥīḥ / muʿtall type' },
    { id: 'ismType', name: 'Kind of noun' },
    { id: 'harfType', name: 'What a particle governs' },
    { id: 'sarf', name: 'Ṣarf ṣaghīr' },
    { id: 'root', name: 'Root & radicals' },
    { id: 'baseMadi', name: 'Back to the māḍī' },
    { id: 'context', name: 'Sentence gap' },
    { id: 'translation', name: 'Translation' }
  ];

  const focusOn = (id) => (settings.focus || []).indexOf(id) !== -1;

  function toggleFocus(id) {
    const list = (settings.focus || []).slice();
    const at = list.indexOf(id);
    if (at === -1) list.push(id);
    else list.splice(at, 1);
    settings.focus = list;
    MP.store.saveSettings(settings);
    refresh();
  }

  /* ------------------------------------------------------------------ */
  /* small helpers                                                       */
  /* ------------------------------------------------------------------ */

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.keys(attrs || {}).forEach((k) => {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach((c) => node.appendChild(c));
    return node;
  }

  function ar(text, cls) {
    return el('span', { class: 'ar ' + (cls || ''), dir: 'rtl', lang: 'ar', text: text });
  }

  function display(word) {
    /* an iʿlāl item is entirely about which vowel sits where, so stripping the
       ḥarakāt would leave nothing to reason about */
    if (word.kind === 'ilal') return word.w;
    return settings.showHarakat ? word.w : E.stripHarakat(word.w);
  }

  /*
   * Swap the screen. Toggling a chip is not navigation, so it must not throw
   * you back to the top of the page — pass keepScroll for in-place updates.
   */
  function setScreen(node, keepScroll) {
    const y = global.scrollY;
    touched = false;
    /* one class on the body drives the whole Arabic-first layout, including
       the reference overlay, which lives outside #app */
    document.body.classList.toggle('arabic-first', !!settings.arabicFirst);
    const root = app();
    root.innerHTML = '';
    root.appendChild(buildNav());
    root.appendChild(node);
    if (keepScroll) global.scrollTo(0, y);
    else global.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------------ */
  /* the nav bar                                                         */
  /* ------------------------------------------------------------------ */

  let view = 'practice';   // practice | learn | words | account

  const VIEWS = [
    { id: 'practice', name: 'Practice', title: 'Practice' },
    { id: 'drill', name: 'Drill', title: 'Drill' },
    { id: 'learn', name: 'Learn', title: 'Learn' },
    { id: 'dictionary', name: 'Dictionary', title: 'Dictionary' },
    { id: 'words', name: 'My words', title: 'My words' }
  ];

  function go(viewId) {
    view = viewId;
    render();
  }

  /*
   * How to redraw whatever is actually on screen.
   *
   * `view` only names the four nav destinations, so it says "practice" during
   * a drill, a tree walk and the summary alike. refresh() used to dispatch on
   * it, which meant hitting the theme or language button mid-drill threw you
   * out to the home screen. Every screen now records its own way of being
   * redrawn, and refresh() uses that.
   */
  let repaint = null;

  function refresh() {
    if (repaint) return repaint();
    render(true);
  }

  function render(keepScroll) {
    if (view === 'drill') return renderDrill(keepScroll);
    if (view === 'learn') return renderLearn(keepScroll);
    if (view === 'dictionary') return renderDictionary(keepScroll);
    if (view === 'words') return renderEditor();
    if (view === 'account') return renderAccount(keepScroll);
    return renderHome(keepScroll);
  }

  function buildNav() {
    const nav = el('nav', { class: 'nav' });

    const brand = el('button', {
      class: 'nav-brand', type: 'button', onclick: () => go('practice')
    }, [ar('الصَّرْف', 'nav-brand-ar'), el('span', { class: 'nav-brand-en', text: 'Ṣarf' })]);

    const links = el('div', { class: 'nav-links' });
    VIEWS.forEach((v) => {
      links.appendChild(el('button', {
        class: 'nav-link' + (view === v.id ? ' on' : ''), type: 'button', text: v.name,
        onclick: () => go(v.id)
      }));
    });

    const themeNow = MP.theme.current();
    const themeBtn = el('button', {
      class: 'nav-icon', type: 'button',
      title: 'Theme: ' + themeNow + ' — click to change',
      text: { light: '☀️', dim: '🌗', dark: '🌙', system: '⚙️' }[themeNow] || '🌗',
      onclick: () => { MP.theme.cycle(); refresh(); }
    });

    /* Which language leads, one tap away wherever you are. The button shows
       the script you are reading now, so it reads as a state, not a command. */
    const langBtn = el('button', {
      class: 'nav-icon lang' + (settings.arabicFirst ? ' on' : ''), type: 'button',
      title: settings.arabicFirst
        ? 'Arabic terms first — showing "fiʿl" with "Verb" underneath. Click for English.'
        : 'English first — showing "Verb" with "fiʿl" underneath. Click for the Arabic term.',
      'aria-pressed': settings.arabicFirst ? 'true' : 'false',
      text: settings.arabicFirst ? 'ع' : 'A',
      onclick: () => {
        settings.arabicFirst = !settings.arabicFirst;
        MP.store.saveSettings(settings);
        refresh();
      }
    });

    const signedIn = MP.sync.status().signedIn;
    const account = el('button', {
      class: 'nav-account' + (view === 'account' ? ' on' : '') + (signedIn ? ' in' : ''),
      type: 'button',
      title: signedIn ? 'Signed in' : 'Not signed in',
      onclick: () => go('account')
    }, [
      el('span', { class: 'nav-avatar', text: signedIn ? '●' : '○' }),
      el('span', { class: 'nav-account-label', text: signedIn ? 'Account' : 'Sign in' })
    ]);

    nav.appendChild(brand);
    nav.appendChild(links);
    nav.appendChild(el('div', { class: 'nav-right' }, [langBtn, themeBtn, account]));
    return nav;
  }

  /* ------------------------------------------------------------------ */
  /* learn + account views                                               */
  /* ------------------------------------------------------------------ */

  function renderLearn(keepScroll) {
    repaint = () => renderLearn(true);
    const wrap = el('div', { class: 'screen learn' });
    wrap.appendChild(el('h1', { class: 'view-title', text: 'Learn' }));
    wrap.appendChild(buildReference(
      refSection,
      (id) => { refSection = id; renderLearn(true); },
      () => renderLearn(true)
    ));
    setScreen(wrap, keepScroll);
  }

  /* ------------------------------------------------------------------ */
  /* drill: the app with every dial taken off                            */
  /* ------------------------------------------------------------------ */

  /*
   * The whole bank, every question, nothing to choose but how many words.
   *
   * Practice grew a mode picker, a deck picker, ten focus chips and nine stage
   * switches, which is the right amount of control for shaping a session and
   * far too much for someone who just wants to be handed words. This is the
   * original app: a word appears, you walk it down the chart, next word.
   *
   * It runs on its own settings object rather than the saved one, so nothing
   * chosen over on Practice is disturbed by drilling and nothing set here
   * leaks back.
   */
  const DRILL_LENGTHS = [10, 25, 50, 0];

  function drillSettings() {
    return Object.assign({}, settings, {
      mode: 'analysis',
      deckId: 'all',
      focus: [],                 // every question, no shortcuts
      length: settings.drillLength === undefined ? 10 : settings.drillLength,
      /* every stage on, explicitly, so a switch flipped on Practice cannot
         quietly narrow a drill */
      groups: {
        identity: true, features: true, structure: true, root: true,
        base: true, sarf: true, translation: true, context: true
      },
      /* ordering, not filtering: the words you are shakiest on come round
         first. Nothing is excluded either way. */
      weakestFirst: true
    });
  }

  function startDrill() {
    const cfg = drillSettings();
    if (!E.poolFor('analysis', 'all').length) {
      global.alert('There are no words to drill.');
      return;
    }
    startSession(null, cfg, 'drill');
  }

  function renderDrill(keepScroll) {
    repaint = () => renderDrill(true);
    const wrap = el('div', { class: 'screen drill-home' });

    if (sessionInProgress()) wrap.appendChild(resumeBanner());

    const total = E.poolFor('analysis', 'all').length;
    const chosen = settings.drillLength === undefined ? 10 : settings.drillLength;

    wrap.appendChild(el('header', { class: 'drill-hero' }, [
      el('h1', { class: 'title' }, [ar('دَرِّبْ'), el('span', { class: 'title-en', text: 'Drill' })]),
      el('p', { class: 'lede', text: 'Every word in the bank, every question on the chart, nothing to set up. A word appears, you take it apart, the next one comes.' })
    ]));

    const row = el('div', { class: 'chip-row drill-lengths' });
    DRILL_LENGTHS.forEach((n) => {
      row.appendChild(el('button', {
        class: 'chip big-chip' + (chosen === n ? ' on' : ''), type: 'button',
        text: n === 0 ? 'All ' + total : String(n),
        onclick: () => {
          settings.drillLength = n;
          MP.store.saveSettings(settings);
          refresh();
        }
      }));
    });

    wrap.appendChild(el('section', { class: 'panel drill-panel' }, [
      el('span', { class: 'drill-label', text: 'How many words' }),
      row,
      el('div', { class: 'cta-row' }, [
        el('button', { class: 'btn primary big', type: 'button', text: 'Start drilling', onclick: startDrill })
      ])
    ]));

    wrap.appendChild(el('p', { class: 'muted small drill-note', text:
      'Drawing on all ' + total + ' words — verbs, nouns and particles, every bāb and every form. Everything you have not seen for a while comes round first. Nothing here changes your Practice settings.' }));

    setScreen(wrap, keepScroll);
  }

  /* ---- the dictionary: every word in the app, as a catalogue ---- */

  let dictQuery = '';
  let dictGroup = 'all';
  let dictSound = 'all';

  function renderDictionary(keepScroll) {
    repaint = () => renderDictionary(true);
    const wrap = el('div', { class: 'screen dictionary' });
    wrap.appendChild(el('h1', { class: 'view-title', text: 'Dictionary' }));
    wrap.appendChild(el('p', { class: 'lede', text: 'Every word the app knows, one row per entry, with its principal parts side by side. Search in Arabic or English — ḥarakāt are ignored, so نصر finds نَصَرَ.' }));

    const all = MP.dictionary.entries();
    const list = el('div', { class: 'dict-list' });
    const count = el('p', { class: 'muted small' });

    /* the search box keeps its own focus and caret across a repaint, so the
       list can update on every keystroke without interrupting the typing */
    const search = el('input', {
      class: 'input dict-search', type: 'search', value: dictQuery,
      placeholder: 'Search — نصر, naṣara, to help…',
      autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false'
    });

    function paint() {
      const rows = MP.dictionary.filter(all, dictQuery, dictGroup, dictSound);
      count.textContent = rows.length + ' of ' + all.length + ' entries';
      list.innerHTML = '';

      if (!rows.length) {
        list.appendChild(el('p', { class: 'muted', text: 'Nothing matches that.' }));
        return;
      }

      list.appendChild(el('div', { class: 'dict-row dict-head' }, [
        el('span', { class: 'dict-meaning', text: 'Meaning' }),
        el('span', { class: 'dict-cell-h', text: 'māḍī' }),
        el('span', { class: 'dict-cell-h', text: 'muḍāriʿ' }),
        el('span', { class: 'dict-cell-h', text: 'maṣdar' }),
        el('span', { class: 'dict-cell-h', text: 'amr' })
      ]));

      rows.forEach((r) => {
        const meaning = el('span', { class: 'dict-meaning' }, [
          el('span', { class: 'dict-en', text: r.en || '—' }),
          el('span', { class: 'dict-meta' }, [
            r.root ? ar(r.root, 'dict-root') : el('span', {}),
            el('span', { class: 'dict-baab', text: r.baabEn || '' }),
            r.custom ? el('span', { class: 'dict-mine', text: 'yours' }) : el('span', {})
          ])
        ]);

        const cellOf = (v) => (v === MP.NOT_USED
          ? el('span', { class: 'dict-cell dash', text: MP.NOT_USED })
          : ar(v, 'dict-cell'));

        list.appendChild(el('div', { class: 'dict-row' + (r.kind === 'word' ? ' plain' : '') }, [
          meaning, cellOf(r.madi), cellOf(r.mudari), cellOf(r.masdar), cellOf(r.amr)
        ]));
      });
    }

    let typing = null;
    search.addEventListener('input', () => {
      dictQuery = search.value;
      global.clearTimeout(typing);
      typing = global.setTimeout(paint, 90);
    });

    const groupRow = el('div', { class: 'chip-row' });
    MP.dictionary.GROUPS.forEach((g) => {
      groupRow.appendChild(el('button', {
        class: 'chip' + (dictGroup === g.id ? ' on' : ''), type: 'button', text: g.name,
        onclick: () => { dictGroup = g.id; renderDictionary(true); }
      }));
    });

    const soundRow = el('div', { class: 'chip-row' });
    MP.dictionary.SOUNDNESS.forEach((s) => {
      soundRow.appendChild(el('button', {
        class: 'chip' + (dictSound === s.id ? ' on' : ''), type: 'button', text: s.name,
        onclick: () => { dictSound = s.id; renderDictionary(true); }
      }));
    });

    wrap.appendChild(el('section', { class: 'panel' }, [
      search, groupRow, soundRow, count
    ]));
    wrap.appendChild(list);

    paint();
    setScreen(wrap, keepScroll);
    if (dictQuery) {
      search.focus();
      search.setSelectionRange(dictQuery.length, dictQuery.length);
    }
  }

  function renderAccount(keepScroll) {
    repaint = () => renderAccount(true);
    const wrap = el('div', { class: 'screen account' });
    wrap.appendChild(el('h1', { class: 'view-title', text: 'Account' }));
    wrap.appendChild(el('p', { class: 'lede', text: 'Signing in carries your progress and your own words between devices. Everything works without it — the app is yours on this device either way.' }));
    wrap.appendChild(renderCloudPanel());

    wrap.appendChild(el('section', { class: 'panel' }, [
      el('h2', { class: 'panel-title', text: 'Appearance' }),
      el('div', { class: 'switches' }, MP.theme.THEMES.map((t) => el('button', {
        class: 'switch' + (MP.theme.current() === t.id ? ' on' : ''), type: 'button',
        onclick: () => { MP.theme.set(t.id); refresh(); }
      }, [
        el('span', { class: 'switch-name', text: t.name }),
        el('span', { class: 'switch-desc', text: t.desc })
      ])))
    ]));

    /* which language leads */
    wrap.appendChild(el('section', { class: 'panel' }, [
      el('h2', { class: 'panel-title', text: 'Which language leads' }),
      el('div', { class: 'switches' }, [
        el('button', {
          class: 'switch' + (settings.arabicFirst ? '' : ' on'), type: 'button',
          onclick: () => { settings.arabicFirst = false; MP.store.saveSettings(settings); refresh(); }
        }, [
          el('span', { class: 'switch-name', text: 'English first' }),
          el('span', { class: 'switch-desc', text: 'The English term leads and the Arabic sits beside it.' })
        ]),
        el('button', {
          class: 'switch' + (settings.arabicFirst ? ' on' : ''), type: 'button',
          onclick: () => { settings.arabicFirst = true; MP.store.saveSettings(settings); refresh(); }
        }, [
          el('span', { class: 'switch-name', text: 'Arabic first' }),
          el('span', { class: 'switch-desc', text: 'The Arabic is the headline and the English becomes small print underneath.' })
        ])
      ]),
      /* a live sample of the thing being described, in whichever mode is on */
      el('div', { class: 'lang-sample' }, [
        el('span', { class: 'muted small', text: 'Looks like this:' }),
        el('span', { class: 'option sample-option' }, [
          ar('سَالِم', 'option-ar'),
          el('span', { class: 'option-en' }, [
            el('span', { class: 'option-en-main', text: 'Perfectly sound' }),
            el('span', { class: 'option-tr', text: 'sālim' })
          ])
        ])
      ])
    ]));

    setScreen(wrap, keepScroll);
  }

  /* ------------------------------------------------------------------ */
  /* home                                                                */
  /* ------------------------------------------------------------------ */

  /*
   * A session is not thrown away when you leave it. Looking a thing up in the
   * middle of a drill is the normal way to use this, so the session stays in
   * memory and Practice offers to put you back where you were.
   */
  function sessionInProgress() {
    return !!(session && !session.finished && session.words.length);
  }

  function resumeSession() {
    if (!sessionInProgress()) return;
    /* if the step you left was already answered, carry on to the next one
       rather than asking it again and counting it twice */
    if (answered) goNext();
    else renderStep();
  }

  function resumeBanner() {
    const word = E.currentWord(session);
    return el('section', { class: 'panel resume' }, [
      el('div', { class: 'resume-main' }, [
        el('div', {}, [
          el('h2', { class: 'panel-title', text: 'Still going' }),
          el('p', { class: 'muted small', text: 'Word ' + (session.index + 1) + ' of ' + session.words.length +
            ', step ' + (session.stepIndex + 1) + ' of ' + session.steps.length + '.' })
        ]),
        word && word.w ? ar(display(word), 'resume-ar') : el('span', {})
      ]),
      el('div', { class: 'cta-row' }, [
        el('button', { class: 'btn primary', type: 'button', text: 'Pick up where you left off', onclick: resumeSession }),
        el('button', {
          class: 'btn ghost small', type: 'button', text: 'Discard it',
          onclick: () => { session = null; refresh(); }
        })
      ])
    ]);
  }

  function renderHome(keepScroll) {
    repaint = () => renderHome(true);
    const stats = MP.store.load();
    const wrap = el('div', { class: 'screen home' });

    if (sessionInProgress()) wrap.appendChild(resumeBanner());

    wrap.appendChild(el('header', { class: 'hero' }, [
      el('h1', { class: 'title' }, [ar('الصَّرْف'), el('span', { class: 'title-en', text: 'Morphology practice' })]),
      el('p', { class: 'lede', text: 'A word appears. You take it through the chart — type, tense, mood, voice, person, gender, number, then its root, bāb, ṣaḥīḥ or muʿtall, its place in the ṣarf ṣaghīr, and finally the meaning.' })
    ]));

    /* practice mode, split by which direction you are working in */
    const modePanel = [el('h2', { class: 'panel-title', text: 'Practice mode' })];
    MODE_GROUPS.forEach((g) => {
      const grid = el('div', { class: 'deck-grid' });
      MODES.filter((m) => m.group === g.id).forEach((m) => {
        const count = E.poolFor(m.id, settings.deckId).length;
        grid.appendChild(el('button', {
          class: 'deck' + (currentMode() === m.id ? ' selected' : ''), type: 'button',
          onclick: () => { settings.mode = m.id; MP.store.saveSettings(settings); refresh(); }
        }, [
          el('span', { class: 'deck-name', text: m.name }),
          el('span', { class: 'deck-desc', text: m.desc }),
          el('span', { class: 'deck-count', text: count + ' to draw from' })
        ]));
      });
      modePanel.push(el('div', {
        class: 'mode-group' + (MODES.some((m) => m.group === g.id && m.id === currentMode()) ? ' active' : '')
      }, [
        el('span', { class: 'mode-group-name', text: g.name }),
        el('span', { class: 'mode-group-desc', text: g.desc }),
        grid
      ]));
    });
    wrap.appendChild(el('section', { class: 'panel' }, modePanel));

    /* deck picker */
    const deckGrid = el('div', { class: 'deck-grid' });
    T.decks.forEach((d) => {
      const count = E.deckWords(d.id).length;
      if (d.id === 'mine' && !count) return;   // nothing added yet
      const countLabel = d.id === 'due' ? count + ' due now' : count + ' words';
      const card = el('button', {
        class: 'deck' + (settings.deckId === d.id ? ' selected' : ''),
        type: 'button',
        onclick: () => {
          settings.deckId = d.id;
          MP.store.saveSettings(settings);
          refresh();
        }
      }, [
        el('span', { class: 'deck-name', text: d.name }),
        el('span', { class: 'deck-desc', text: d.desc }),
        el('span', { class: 'deck-count', text: countLabel })
      ]);
      deckGrid.appendChild(card);
    });
    wrap.appendChild(el('section', { class: 'panel' }, [
      el('h2', { class: 'panel-title', text: 'Deck' }), deckGrid
    ]));

    /* session length */
    const lengths = [5, 10, 20, 0];
    const lenRow = el('div', { class: 'chip-row' });
    lengths.forEach((n) => {
      lenRow.appendChild(el('button', {
        class: 'chip' + (settings.length === n ? ' on' : ''), type: 'button',
        text: n === 0 ? 'Whole deck' : n + ' words',
        onclick: () => { settings.length = n; MP.store.saveSettings(settings); refresh(); }
      }));
    });

    /* what to ask */
    const groupRow = el('div', { class: 'switches' });
    E.STEP_GROUPS.forEach((g) => {
      const on = g.locked || settings.groups[g.id] !== false;
      groupRow.appendChild(el('button', {
        class: 'switch' + (on ? ' on' : '') + (g.locked ? ' locked' : ''),
        type: 'button',
        title: g.locked ? 'Always asked' : g.desc,
        onclick: () => {
          if (g.locked) return;
          settings.groups[g.id] = !on;
          MP.store.saveSettings(settings);
          refresh();
        }
      }, [
        el('span', { class: 'switch-name', text: g.name }),
        el('span', { class: 'switch-desc', text: g.desc })
      ]));
    });

    const toggles = el('div', { class: 'chip-row' }, [
      el('button', {
        class: 'chip' + (settings.showHarakat ? ' on' : ''), type: 'button', text: 'Ḥarakāt shown',
        onclick: () => { settings.showHarakat = !settings.showHarakat; MP.store.saveSettings(settings); refresh(); }
      }),
      el('button', {
        class: 'chip' + (settings.showTranslit ? ' on' : ''), type: 'button', text: 'Transliteration on options',
        onclick: () => { settings.showTranslit = !settings.showTranslit; MP.store.saveSettings(settings); refresh(); }
      }),
      el('button', {
        class: 'chip' + (settings.weakestFirst ? ' on' : ''), type: 'button', text: 'Weakest words first',
        onclick: () => { settings.weakestFirst = !settings.weakestFirst; MP.store.saveSettings(settings); refresh(); }
      }),
      /* also lives under Account → Appearance, but this is where you are when
         you notice you want it */
      el('button', {
        class: 'chip' + (settings.arabicFirst ? ' on' : ''), type: 'button', text: 'Arabic terms first',
        title: 'Read "fiʿl" with "Verb" underneath, rather than the other way round.',
        onclick: () => { settings.arabicFirst = !settings.arabicFirst; MP.store.saveSettings(settings); refresh(); }
      })
    ]);

    /* pick any combination of questions: everything, one, or a few */
    const chosen = settings.focus || [];
    const focusRow = el('div', { class: 'chip-row' });
    focusRow.appendChild(el('button', {
      class: 'chip' + (chosen.length ? '' : ' on'), type: 'button', text: 'Everything',
      onclick: () => { settings.focus = []; MP.store.saveSettings(settings); refresh(); }
    }));
    FOCUS_MODES.forEach((f) => {
      focusRow.appendChild(el('button', {
        class: 'chip' + (focusOn(f.id) ? ' on' : ''), type: 'button', text: f.name,
        onclick: () => toggleFocus(f.id)
      }));
    });

    const sessionPanel = [el('h2', { class: 'panel-title', text: 'Session' }), lenRow, toggles];
    if (currentMode() === 'analysis') {
      sessionPanel.push(
        el('h2', { class: 'panel-title', text: 'Which questions' }),
        el('p', { class: 'muted small', text: chosen.length
          ? 'Asking ' + chosen.length + ' question' + (chosen.length === 1 ? '' : 's') + ' per word. Tap more to add them, or Everything to go back to the full walk.'
          : 'The whole walk. Tap any of these to drill just those instead — one, three, however many you like.' }),
        focusRow,
        el('h2', { class: 'panel-title', text: 'Stages' + (chosen.length ? ' (ignored while specific questions are chosen)' : '') }),
        groupRow
      );
    }
    wrap.appendChild(el('section', { class: 'panel' }, sessionPanel));

    wrap.appendChild(el('div', { class: 'cta-row' }, [
      el('button', { class: 'btn primary big', type: 'button', text: 'Start practice', onclick: () => startSession() })
    ]));

    /* progress so far */
    if (stats.answered) {
      const pct = Math.round((stats.correct / stats.answered) * 100);
      const worst = Object.keys(stats.steps)
        .map((k) => ({ id: k, s: stats.steps[k] }))
        .filter((x) => x.s.total >= 3)
        .sort((a, b) => a.s.correct / a.s.total - b.s.correct / b.s.total)
        .slice(0, 4);

      const bars = el('div', { class: 'bars' });
      worst.forEach((x) => {
        const p = Math.round((x.s.correct / x.s.total) * 100);
        bars.appendChild(el('div', { class: 'bar-row' }, [
          el('span', { class: 'bar-label', text: stepName(x.id) }),
          el('span', { class: 'bar' }, [el('span', { class: 'bar-fill', style: 'width:' + p + '%' })]),
          el('span', { class: 'bar-pct', text: p + '%' })
        ]));
      });

      wrap.appendChild(el('section', { class: 'panel' }, [
        el('h2', { class: 'panel-title', text: 'Your progress' }),
        el('p', { class: 'stat-line', text: stats.answered + ' answers, ' + pct + '% correct, across ' + Object.keys(stats.words).length + ' words.' }),
        el('p', { class: 'muted small', text: scheduleLine(stats) }),
        worst.length ? el('p', { class: 'muted small', text: 'Weakest areas:' }) : el('span', {}),
        bars,
        el('button', {
          class: 'btn ghost small', type: 'button', text: 'Reset progress',
          onclick: () => {
            if (global.confirm('Clear all saved progress?')) { MP.store.reset(); refresh(); }
          }
        })
      ]));
    }

    if (!MP.store.storageAvailable) {
      wrap.appendChild(el('p', { class: 'muted small', text: 'Note: this browser is blocking local storage, so progress will not be kept between visits.' }));
    }

    setScreen(wrap, keepScroll);
  }

  /* one line describing the state of the review queue */
  function scheduleLine(stats) {
    const now = Date.now();
    const scheduled = Object.keys(stats.words)
      .map((k) => stats.words[k].due)
      .filter((d) => d && d > now)
      .sort((a, b) => a - b);
    const due = E.deckWords('due').length;
    if (!scheduled.length) return due + ' words are ready to study.';
    const hours = Math.round((scheduled[0] - now) / (60 * 60 * 1000));
    const when = hours < 24 ? 'in ' + Math.max(1, hours) + 'h' : 'in ' + Math.round(hours / 24) + ' day(s)';
    return due + ' due now · ' + scheduled.length + ' resting, next one comes back ' + when + '.';
  }

  /* ---- cloud sync ---- */

  function timeAgo(ts) {
    if (!ts) return 'never';
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + ' min ago';
    const hours = Math.round(mins / 60);
    if (hours < 24) return hours + 'h ago';
    return Math.round(hours / 24) + ' day(s) ago';
  }

  function renderCloudPanel() {
    const panel = el('section', { class: 'panel cloud' }, [
      el('h2', { class: 'panel-title', text: 'Sync' })
    ]);
    const st = MP.sync.status();

    if (!MP.sync.available()) {
      panel.appendChild(el('p', { class: 'muted small', text: 'Sync needs the app to be served over the web. Opened straight from a file it stays local-only — which is fine, everything still works.' }));
      return panel;
    }

    const status = el('p', { class: 'stat-line', text: '' });
    const body = el('div', {});

    function paint() {
      const s = MP.sync.status();
      status.textContent = s.signedIn
        ? 'Signed in as "' + s.label + '" · last synced ' + timeAgo(s.lastSync)
        : 'Not signed in — this device keeps everything to itself.';
      body.innerHTML = '';

      if (s.lastError) body.appendChild(el('p', { class: 'form-error', text: s.lastError }));

      if (!s.signedIn) {
        const pass = el('input', { class: 'input', type: 'password', placeholder: 'your passphrase', autocomplete: 'current-password' });
        const label = el('input', { class: 'input', type: 'text', placeholder: 'name this device (optional)' });
        const go = el('button', { class: 'btn primary', type: 'button', text: 'Sign in' });
        go.addEventListener('click', () => {
          go.disabled = true;
          go.textContent = 'Signing in…';
          MP.sync.signIn(pass.value, label.value)
            .then(() => { refresh(); })
            .catch(() => { go.disabled = false; go.textContent = 'Sign in'; paint(); });
        });
        pass.addEventListener('keydown', (e) => { if (e.key === 'Enter') go.click(); });
        body.appendChild(el('div', { class: 'grid-2' }, [
          field('Passphrase', pass),
          field('Device name', label)
        ]));
        body.appendChild(el('div', { class: 'cta-row' }, [go]));
        return;
      }

      const syncBtn = el('button', {
        class: 'btn primary', type: 'button', text: s.syncing ? 'Syncing…' : 'Sync now',
        onclick: () => {
          syncBtn.disabled = true;
          syncBtn.textContent = 'Syncing…';
          MP.sync.syncNow().then(() => refresh()).catch(() => { syncBtn.disabled = false; paint(); });
        }
      });

      const deviceList = el('div', { class: 'device-list' });
      MP.sync.devices().then((list) => {
        deviceList.innerHTML = '';
        list.forEach((d) => {
          deviceList.appendChild(el('div', { class: 'mine-row' }, [
            el('span', { class: 'mine-en', text: d.label + (d.current ? ' (this one)' : '') + ' · last seen ' + timeAgo(d.lastSeen) }),
            el('button', {
              class: 'btn ghost small', type: 'button', text: d.current ? 'Sign out' : 'Revoke',
              onclick: () => {
                if (!global.confirm(d.current ? 'Sign this device out?' : 'Revoke "' + d.label + '"?')) return;
                MP.sync.revoke(d.id).then(() => refresh()).catch(() => paint());
              }
            })
          ]));
        });
      }).catch(() => {
        deviceList.appendChild(el('p', { class: 'muted small', text: 'Could not list devices — offline, most likely.' }));
      });

      body.appendChild(el('div', { class: 'cta-row' }, [
        syncBtn,
        el('button', {
          class: 'btn ghost', type: 'button', text: 'Sign out of this device',
          onclick: () => { MP.sync.signOut(); refresh(); }
        })
      ]));
      body.appendChild(deviceList);
    }

    paint();
    panel.appendChild(status);
    panel.appendChild(el('p', { class: 'muted small', text: 'Progress and your own words are carried between devices. Everything keeps working offline; sync catches up when you are back.' }));
    panel.appendChild(body);
    return panel;
  }

  /* a small labelled control, shared with the editor's look */
  function field(labelText, control) {
    return el('label', { class: 'field' }, [
      el('span', { class: 'field-label', text: labelText }),
      control
    ]);
  }

  function stepName(id) {
    const names = {
      wordType: 'Word type', tense: 'Tense', mood: 'Iʿrāb / mood', voice: 'Voice',
      polarity: 'Affirmative/negative', person: 'Person', gender: 'Gender', number: 'Number',
      ismType: 'Kind of noun', harfType: 'Particle ʿamal',
      letters: 'Thulāthī / rubāʿī', augmentation: 'Mujarrad / mazīd',
      baab: 'Bāb / form', soundness: 'Ṣaḥīḥ / muʿtall', subtype: 'Sub-category',
      mahmuzPosition: 'Hamzah position', root: 'Root & radicals', sarf: 'Ṣarf ṣaghīr',
      translation: 'Translation', baseMadi: 'Back to the māḍī', context: 'In a sentence',
      production: 'Build the form', conjugation: 'Conjugation',
      ilalForm: 'Applying the rule', ilalRule: 'Naming the rule', template: 'Filling the template'
    };
    return names[id] || id;
  }

  /* ------------------------------------------------------------------ */
  /* the drill                                                           */
  /* ------------------------------------------------------------------ */

  /*
   * `config` lets a caller run a session on settings other than the saved
   * ones — Drill uses it so that nothing chosen there is written back over
   * the Practice screen. `origin` is the view to return to when it ends.
   */
  function startSession(only, config, origin) {
    const cfg = config || settings;
    session = E.buildSession({
      deckId: cfg.deckId,
      settings: cfg,
      only: Array.isArray(only) ? only : null
    });
    if (!session.words.length) {
      global.alert('That deck is empty.');
      return;
    }
    session.origin = origin || 'practice';
    MP.store.recordSession();
    answered = false;
    renderStep();
  }

  function renderStep() {
    /*
     * Redrawing a step that has already been graded would wipe the feedback
     * and re-enable the options, so a theme or language change mid-question
     * leaves the DOM where it is. Everything CSS-driven still updates from the
     * body class; only the option labels wait until the next question.
     */
    repaint = () => { if (!answered) renderStep(); };

    const word = E.currentWord(session);
    const step = E.currentStep(session);
    const wrap = el('div', { class: 'screen drill' });

    /* top bar */
    const doneSteps = session.stepIndex;
    wrap.appendChild(el('div', { class: 'topbar' }, [
      el('button', {
        class: 'btn ghost small', type: 'button',
        text: session.origin === 'drill' ? '← Drill' : '← Practice',
        onclick: () => go(session.origin || 'practice')
      }),
      el('span', { class: 'counter', text: 'Word ' + (session.index + 1) + ' of ' + session.words.length }),
      el('span', { class: 'counter', text: 'Step ' + (doneSteps + 1) + ' / ' + session.steps.length }),
      el('button', { class: 'btn ghost small', type: 'button', text: '📖 Reference', onclick: () => openReference(sectionForStep(step)) })
    ]));

    const pct = Math.round((doneSteps / session.steps.length) * 100);
    wrap.appendChild(el('div', { class: 'progress' }, [el('div', { class: 'progress-fill', style: 'width:' + pct + '%' })]));

    /* the word — but in the sentence drill the word IS the answer, so the
       sentence itself takes the place of the card */
    const hideWord = session.mode === 'sentences';
    if (!hideWord) {
      wrap.appendChild(el('div', { class: 'word-card' }, [
        ar(display(word), 'word'),
        word.sub ? el('div', { class: 'card-sub' }, [arabicAware(word.sub)]) : el('span', {}),
        el('div', { class: 'answered-so-far' }, answeredChips())
      ]));
    }

    /* the question, with its ? help */
    const hint = E.hintFor(step);
    const qBlock = el('div', { class: 'question' }, [
      el('div', { class: 'q-line' }, [
        el('h2', { class: 'q-en', text: step.q }),
        hint ? el('button', {
          class: 'help-btn', type: 'button', title: 'How do I tell?', 'aria-label': 'Help',
          text: '?', onclick: () => toggleHint(hint)
        }) : el('span', {})
      ]),
      step.qAr ? ar(step.qAr, 'q-ar') : el('span', {}),
      el('div', { class: 'hint-panel', id: 'hint-panel' })
    ]);
    wrap.appendChild(qBlock);

    if (step.kind === 'choice') wrap.appendChild(renderChoice(step));
    else if (step.kind === 'text') wrap.appendChild(renderText(step));
    else if (step.kind === 'sarf') wrap.appendChild(renderSarf(step, word));
    else if (step.kind === 'translate') wrap.appendChild(renderTranslate(step, word));
    else if (step.kind === 'radicals') wrap.appendChild(renderRadicals(step));
    else if (step.kind === 'cloze') wrap.appendChild(renderCloze(step));
    else if (step.kind === 'template') wrap.appendChild(renderTemplate(step, word));

    wrap.appendChild(el('div', { class: 'feedback', id: 'feedback' }));
    wrap.appendChild(el('div', { class: 'next-row', id: 'next-row' }));

    setScreen(wrap);
    answered = false;
  }

  /* chips summarising what has already been established about this word */
  function answeredChips() {
    const word = E.currentWord(session);
    const out = [];
    session.answers
      .filter((a) => a.wordId === word.id)
      .forEach((a) => {
        const step = session.steps.find((s) => s.id === a.stepId);
        if (!step) return;
        let text;
        if (step.kind === 'choice') {
          const o = T.option(step.groupId, step.answer);
          text = o ? o.ar : step.answer;
        } else if (step.id === 'root') {
          /* the root step answers with its letters in order */
          text = Array.isArray(step.answer) ? step.answer.join(' ') : step.answer;
        }
        else if (step.id === 'sarf') {
          const slot = T.sarfSlots.find((s) => s.id === step.answer);
          text = slot ? slot.ar : step.answer;
        } else return;
        out.push(el('span', { class: 'mini-chip' + (a.correct ? '' : ' bad') }, [ar(text)]));
      });
    return out;
  }

  /*
   * The two lines of text beside an option's Arabic.
   *
   * Normally the English meaning leads and the transliteration is a footnote:
   * "Verb" over "fiʿl". Arabic-first swaps them, so the Arabic term itself is
   * what you read and remember — "fiʿl" over "Verb" — which is the whole point
   * of the setting: to learn the term, not its translation.
   */
  function optionLabel(o) {
    const term = o.tr || o.en;
    const gloss = o.en;
    if (settings.arabicFirst) {
      return el('span', { class: 'option-en' }, [
        el('span', { class: 'option-en-main', text: term }),
        el('span', { class: 'option-tr', text: gloss })
      ]);
    }
    return el('span', { class: 'option-en' }, [
      el('span', { class: 'option-en-main', text: gloss }),
      settings.showTranslit ? el('span', { class: 'option-tr', text: term }) : el('span', {})
    ]);
  }

  /*
   * The same idea for a ṣarf ṣaghīr cell name, which has no transliteration to
   * promote. Arabic-first simply lets the English recede instead of swapping
   * anything — without this it inherited the styling meant for the
   * transliteration and came out bolder than it started.
   */
  function slotLabel(slot) {
    return el('span', { class: 'option-en' }, [
      settings.arabicFirst
        ? el('span', { class: 'option-tr', text: slot.en })
        : el('span', { class: 'option-en-main', text: slot.en })
    ]);
  }

  function renderChoice(step) {
    const box = el('div', { class: 'options' });
    E.optionsFor(step).forEach((o) => {
      const btn = el('button', {
        class: 'option', type: 'button', 'data-id': o.id,
        onclick: () => {
          if (answered) return;
          gradeChoice(step, o, btn, box);
        }
      }, [ar(o.ar, 'option-ar'), optionLabel(o)]);
      box.appendChild(btn);
    });

    box.appendChild(el('button', {
      class: 'option dunno', type: 'button', text: "I don't know — show me",
      onclick: () => { if (!answered) gradeChoice(step, null, null, box); }
    }));
    return box;
  }

  function gradeChoice(step, chosen, btn, box) {
    answered = true;
    const correct = !!chosen && chosen.id === step.answer;
    E.recordAnswer(session, correct);

    Array.prototype.forEach.call(box.querySelectorAll('.option'), (b) => {
      b.disabled = true;
      if (b.getAttribute('data-id') === step.answer) b.classList.add('correct');
    });
    if (btn && !correct) btn.classList.add('wrong');

    const right = T.option(step.groupId, step.answer);
    showFeedback(correct, right ? right.ar + ' — ' + right.en : step.answer, right ? right.hint : '');
  }

  function renderText(step) {
    const input = el('input', {
      class: 'text-input ar', type: 'text', dir: 'rtl', lang: 'ar',
      placeholder: step.placeholder || '', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false'
    });
    const submit = el('button', { class: 'btn primary', type: 'button', text: 'Check' });
    const form = el('div', { class: 'input-row' }, [input, submit]);

    function grade() {
      if (answered) return;
      answered = true;
      const correct = step.check(input.value);
      E.recordAnswer(session, correct);
      input.disabled = true;
      submit.disabled = true;
      input.classList.add(correct ? 'correct' : 'wrong');
      /* right letters, wrong vowels is a different mistake from not knowing
         the rule, and in this drill it is the more instructive one */
      const nearMiss = !correct && step.vowelsOnly && step.vowelsOnly(input.value);
      const miss = {
        ilalForm: nearMiss
          ? 'Every letter is right — it is the ḥarakāt that are wrong, and in iʿlāl the ḥarakāt are the rule. Look at which letter carries the vowel.'
          : 'Check the three in order: does a weak letter become an alif, hand its vowel back, or drop?',
        baseMadi: 'Strip the tense letter and the ending, keep the letters of the bāb.',
        production: 'Recite the ṣarf ṣaghīr of this bāb and stop at the cell you were asked for.',
        conjugation: 'Watch the stem: if the ending begins with a sukūn, a weak or doubled verb changes shape.'
      }[step.id];
      showFeedback(correct, step.answer, correct ? '' : miss || '');
    }
    submit.addEventListener('click', grade);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') grade(); });
    setTimeout(() => input.focus(), 30);

    const box = el('div', {}, [form, MP.keyboard.attach(input, { onEnter: grade }),
      el('button', {
        class: 'btn ghost small', type: 'button', text: "I don't know",
        onclick: () => {
          if (answered) return;
          answered = true;
          E.recordAnswer(session, false);
          input.disabled = true; submit.disabled = true;
          showFeedback(false, step.answer, '');
        }
      })
    ]);
    return box;
  }

  /* ---- pick the radicals out of the word, one slot at a time ---- */
  function renderRadicals(step) {
    const chosen = new Array(step.slots.length).fill(null);
    let cursor = 0;

    const box = el('div', { class: 'radicals' });
    const slotRow = el('div', { class: 'radical-slots', dir: 'rtl' });
    const keypad = el('div', { class: 'keypad', dir: 'rtl' });
    const submit = el('button', { class: 'btn primary', type: 'button', text: 'Check', disabled: 'disabled' });

    function paint() {
      slotRow.innerHTML = '';
      step.slots.forEach((slot, i) => {
        const filled = chosen[i];
        slotRow.appendChild(el('button', {
          class: 'radical-slot' + (filled ? ' filled' : '') + (i === cursor ? ' active' : ''),
          type: 'button',
          onclick: () => { if (!answered) { cursor = i; chosen[i] = null; paint(); } }
        }, [
          el('span', { class: 'radical-letter ar', dir: 'rtl', text: filled || '؟' }),
          el('span', { class: 'radical-name ar', dir: 'rtl', text: slot.ar })
        ]));
      });
      submit.disabled = chosen.some((c) => !c);
    }

    step.keypad.forEach((letter) => {
      keypad.appendChild(el('button', {
        class: 'key ar', type: 'button', dir: 'rtl', text: letter,
        onclick: () => {
          if (answered) return;
          const slot = chosen.indexOf(null);
          const target = chosen[cursor] === null ? cursor : slot;
          if (target === -1) return;
          chosen[target] = letter;
          cursor = chosen.indexOf(null) === -1 ? target : chosen.indexOf(null);
          paint();
        }
      }));
    });

    function grade() {
      if (answered) return;
      answered = true;
      const correct = chosen.every((c, i) => c === step.answer[i]);
      E.recordAnswer(session, correct);
      Array.prototype.forEach.call(keypad.querySelectorAll('.key'), (k) => (k.disabled = true));
      submit.disabled = true;
      Array.prototype.forEach.call(slotRow.querySelectorAll('.radical-slot'), (s, i) => {
        s.classList.add(chosen[i] === step.answer[i] ? 'correct' : 'wrong');
      });
      showFeedback(correct, step.answer.join(' '), 'The radicals are what is left once every added letter is stripped away.');
    }
    submit.addEventListener('click', grade);

    paint();
    box.appendChild(slotRow);
    box.appendChild(el('p', { class: 'muted small', text: 'Tap the letters in order. A weak radical may not be visible in the word — put it back.' }));
    box.appendChild(keypad);
    box.appendChild(el('div', { class: 'input-row' }, [
      submit,
      el('button', {
        class: 'btn ghost small', type: 'button', text: "I don't know",
        onclick: () => {
          if (answered) return;
          answered = true;
          E.recordAnswer(session, false);
          Array.prototype.forEach.call(keypad.querySelectorAll('.key'), (k) => (k.disabled = true));
          submit.disabled = true;
          showFeedback(false, step.answer.join(' '), '');
        }
      })
    ]));
    return box;
  }

  /* ---- fill the word into a real sentence ---- */
  function renderCloze(step) {
    const box = el('div', { class: 'cloze' });
    const parts = step.sentence.ar.split('{}');

    const line = el('div', { class: 'cloze-sentence ar', dir: 'rtl', lang: 'ar' });
    line.appendChild(document.createTextNode(parts[0] || ''));
    const gap = el('span', { class: 'cloze-gap', text: '؟؟؟' });
    line.appendChild(gap);
    line.appendChild(document.createTextNode(parts[1] || ''));

    box.appendChild(line);
    box.appendChild(el('p', { class: 'cloze-en', text: step.sentence.en }));

    const opts = el('div', { class: 'options' });
    step.choices.forEach((choice) => {
      const btn = el('button', {
        class: 'option', type: 'button', 'data-id': choice.id,
        onclick: () => {
          if (answered) return;
          answered = true;
          const correct = choice.id === step.answer;
          E.recordAnswer(session, correct);
          Array.prototype.forEach.call(opts.querySelectorAll('.option'), (b) => {
            b.disabled = true;
            if (b.getAttribute('data-id') === step.answer) b.classList.add('correct');
          });
          if (!correct) btn.classList.add('wrong');
          /* drop the right word into the gap */
          const answerWord = step.choices.find((c) => c.id === step.answer);
          gap.textContent = answerWord.w;
          gap.classList.add('filled');
          showFeedback(correct, answerWord.w + ' — ' + answerWord.en, step.sentence.en);
        }
      }, [ar(choice.w, 'option-ar'), el('span', { class: 'option-en' }, [el('span', { class: 'option-en-main', text: choice.en })])]);
      opts.appendChild(btn);
    });
    box.appendChild(opts);
    return box;
  }

  /* ---- the ṣarf ṣaghīr, with the word's own cell blanked out ---- */
  /*
   * The whole ṣarf ṣaghīr, filled in, with one cell marked. Used as the reveal
   * once the question has been answered.
   */
  function buildSarfTable(p, markSlot, gotItRight) {
    const table = el('div', { class: 'sarf', id: 'sarf-table' });
    T.sarfSlots.forEach((slot) => {
      const value = p[slot.id];
      const marked = slot.id === markSlot;
      table.appendChild(el('div', {
        class: 'sarf-row' + (marked ? ' target' + (gotItRight === false ? ' missed' : '') : '') +
          (value === MP.NOT_USED ? ' unused' : ''),
        'data-slot': slot.id
      }, [
        el('span', { class: 'sarf-label' }, [
          ar(slot.ar, 'sarf-label-ar'),
          el('span', { class: 'sarf-label-en', text: slot.en })
        ]),
        value === MP.NOT_USED
          ? el('span', { class: 'sarf-value dash', text: MP.NOT_USED })
          : ar(value, 'sarf-value' + (marked ? ' filled' : ''))
      ]));
    });
    return table;
  }

  function renderSarf(step, word) {
    const p = step.paradigm;
    const box = el('div', { class: 'sarf-wrap' });

    box.appendChild(el('div', { class: 'sarf-head' }, [
      el('span', { class: 'muted small', text: 'Ṣarf ṣaghīr of' }),
      ar(p.root, 'sarf-root'),
      el('span', { class: 'muted small', text: T.label(E.baabGroupId(p), p.baabId) })
    ]));

    /*
     * The table used to be on screen while the question was being asked, with
     * the target cell blanked out. That handed the answer over three times: the
     * blank row kept its own label, which is the answer written out; it sat at
     * its fixed place in the recited order, so even a blank label would have
     * given it away by position; and it was highlighted into the bargain.
     *
     * The question is now asked against the word alone — which is the point,
     * since knowing that يَرْمِي is a muḍāriʿ is the thing being tested — and
     * the whole table arrives afterwards as the reveal.
     */
    const reveal = el('div', { class: 'sarf-reveal' });

    const opts = el('div', { class: 'options compact' });
    T.sarfSlots
      .filter((s) => p[s.id] !== MP.NOT_USED)
      .forEach((slot) => {
        const btn = el('button', {
          class: 'option', type: 'button', 'data-id': slot.id,
          onclick: () => {
            if (answered) return;
            gradeSarf(step, slot.id, btn, opts, reveal, p);
          }
        }, [ar(slot.ar, 'option-ar'), slotLabel(slot)]);
        opts.appendChild(btn);
      });
    opts.appendChild(el('button', {
      class: 'option dunno', type: 'button', text: "I don't know — show me",
      onclick: () => { if (!answered) gradeSarf(step, null, null, opts, reveal, p); }
    }));
    box.appendChild(opts);
    box.appendChild(reveal);
    return box;
  }

  function gradeSarf(step, chosenId, btn, box, reveal, p) {
    answered = true;
    const correct = chosenId === step.answer;
    E.recordAnswer(session, correct);

    Array.prototype.forEach.call(box.querySelectorAll('.option'), (b) => {
      b.disabled = true;
      if (b.getAttribute('data-id') === step.answer) b.classList.add('correct');
    });
    if (btn && !correct) btn.classList.add('wrong');

    /* now the table, complete, with the word's own cell marked */
    reveal.innerHTML = '';
    reveal.appendChild(el('p', { class: 'muted small', text: 'The whole ṣarf ṣaghīr, with this word in its place:' }));
    reveal.appendChild(buildSarfTable(p, step.answer, correct));

    const slot = T.sarfSlots.find((s) => s.id === step.answer);
    showFeedback(correct, slot ? slot.ar + ' — ' + slot.en : step.answer,
      'The whole table is built from ' + p.root + ', so once you know the bāb you can rebuild every cell.');
  }

  /* ------------------------------------------------------------------ */
  /* the ṣarf ṣaghīr as it is recited — three lines, any form            */
  /* ------------------------------------------------------------------ */

  const BLANK_MODES = [
    { id: 'none', name: 'Show it all', desc: 'Read the three lines through.' },
    { id: 'some', name: 'Blank some', desc: 'About half the cells are gaps.' },
    { id: 'all', name: 'Blank them all', desc: 'Recite the whole thing from the root.' }
  ];

  /*
   * The overview, in whichever of the three states the user has chosen.
   * The English label under a cell is off by default and always off while
   * cells are blanked: an English gloss beside a gap gives the answer away by
   * matching, which is exactly what the recall is meant to test.
   */
  function renderSarfOverview(paradigm, opts) {
    const o = opts || {};
    const mode = o.mode || 'none';
    const showEnglish = !!o.showEnglish;
    const lines = MP.sarf.build(paradigm);
    const blanks = o.blanks || [];
    const inputs = {};

    const box = el('div', { class: 'sarf-overview' });

    box.appendChild(el('div', { class: 'sarf-overview-head' }, [
      el('span', { class: 'sarf-overview-title' }, [
        ar(paradigm.root, 'sarf-overview-root'),
        el('span', { class: 'muted small', text: T.label(E.baabGroupId(paradigm), paradigm.baabId) })
      ]),
      el('span', { class: 'muted small', text: paradigm.meaning })
    ]));

    lines.forEach((line) => {
      const row = el('div', { class: 'sarf-line' });
      row.appendChild(el('div', { class: 'sarf-line-label' }, [
        ar(line.ar, 'sarf-line-ar'),
        showEnglish ? el('span', { class: 'sarf-line-en', text: line.en }) : el('span', {})
      ]));

      /* an intransitive verb has no passive at all, so reciting a line of
         dashes says nothing — name the reason instead */
      if (line.parts.every((part) => !part.used)) {
        row.appendChild(el('p', { class: 'sarf-line-none muted small', text: line.id === 'majhul'
          ? 'This verb takes no object, so it has no passive.'
          : 'This bāb produces none of these.' }));
        box.appendChild(row);
        return;
      }

      const recite = el('div', { class: 'sarf-recite', dir: 'rtl', lang: 'ar' });
      line.parts.forEach((part) => {
        const cell = el('span', { class: 'sarf-part' + (part.used ? '' : ' unused') });
        /* the joining words and the form itself read as one phrase, right to
           left — وَالأَمْرُ مِنْهُ اُنْصُرْ — so they sit on one line together */
        const phrase = el('span', { class: 'sarf-phrase', dir: 'rtl' });
        cell.appendChild(phrase);
        if (part.sep) phrase.appendChild(el('span', { class: 'sarf-sep ar', dir: 'rtl', text: part.sep }));
        if (part.lead) phrase.appendChild(ar(part.lead, 'sarf-lead'));

        const blanked = part.used && blanks.indexOf(part.slot) !== -1;
        if (blanked) {
          const input = el('input', {
            class: 'sarf-input ar', type: 'text', dir: 'rtl', lang: 'ar',
            'data-slot': part.slot, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false',
            'aria-label': part.labelEn
          });
          inputs[part.slot] = input;
          phrase.appendChild(input);
        } else if (part.used) {
          phrase.appendChild(ar(part.value, 'sarf-word'));
        } else {
          phrase.appendChild(el('span', { class: 'sarf-word dash', text: MP.NOT_USED }));
        }

        /* the cell's own name, only when English is asked for */
        if (showEnglish) {
          cell.appendChild(el('span', { class: 'sarf-part-en', text: part.labelEn }));
        }
        recite.appendChild(cell);
      });
      row.appendChild(recite);
      box.appendChild(row);
    });

    if (!blanks.length) return box;

    /* ---- the fill-it-in drill ---- */
    const result = el('p', { class: 'sarf-result muted small' });

    function mark(reveal) {
      let right = 0;
      blanks.forEach((slot) => {
        const input = inputs[slot];
        if (!input) return;
        const ok = E.matchesArabic(input.value, paradigm[slot]);
        input.classList.remove('correct', 'wrong');
        input.classList.add(ok ? 'correct' : 'wrong');
        if (ok) right++;
        else if (reveal) input.value = paradigm[slot];
      });
      result.textContent = reveal
        ? 'Answers filled in. You had ' + right + ' of ' + blanks.length + '.'
        : right + ' of ' + blanks.length + ' right.';
    }

    box.appendChild(el('div', { class: 'input-row sarf-actions' }, [
      el('button', { class: 'btn primary', type: 'button', text: 'Check', onclick: () => mark(false) }),
      el('button', { class: 'btn ghost small', type: 'button', text: 'Show me', onclick: () => mark(true) }),
      el('button', {
        class: 'btn ghost small', type: 'button', text: 'Clear',
        onclick: () => {
          Object.keys(inputs).forEach((k) => {
            inputs[k].value = '';
            inputs[k].classList.remove('correct', 'wrong');
          });
          result.textContent = '';
        }
      })
    ]));
    box.appendChild(result);
    return box;
  }

  /*
   * The overview plus its controls: which blanking mode, and whether English
   * is shown at all. Both are remembered in settings, so the state you drill
   * in is the state you come back to.
   */
  function renderSarfPanel(paradigm, redraw) {
    const wrap = el('div', { class: 'sarf-panel' });
    const mode = settings.sarfBlank || 'none';

    const modeRow = el('div', { class: 'chip-row' });
    BLANK_MODES.forEach((m) => {
      modeRow.appendChild(el('button', {
        class: 'chip' + (mode === m.id ? ' on' : ''), type: 'button', text: m.name, title: m.desc,
        onclick: () => {
          settings.sarfBlank = m.id;
          MP.store.saveSettings(settings);
          redraw();
        }
      }));
    });
    modeRow.appendChild(el('button', {
      class: 'chip' + (settings.sarfEnglish ? ' on' : ''), type: 'button', text: 'English',
      title: 'Off by default — an English gloss next to a gap gives the answer away.',
      onclick: () => {
        settings.sarfEnglish = !settings.sarfEnglish;
        MP.store.saveSettings(settings);
        redraw();
      }
    }));
    wrap.appendChild(modeRow);

    wrap.appendChild(renderSarfOverview(paradigm, {
      mode: mode,
      showEnglish: !!settings.sarfEnglish,
      blanks: MP.sarf.blanksFor(paradigm, mode)
    }));

    if (mode !== 'none') {
      wrap.appendChild(el('button', {
        class: 'btn ghost small', type: 'button', text: '↻ New gaps', onclick: redraw
      }));
    }
    return wrap;
  }

  /* ------------------------------------------------------------------ */
  /* the recitation template, filled by dragging                          */
  /* ------------------------------------------------------------------ */

  /*
   * The frame is fixed and the forms are loose. Drag a form into a gap, or —
   * because dragging on a phone is miserable — tap a form and then tap a gap.
   * Both routes go through the same place() call, so they cannot drift apart.
   */
  function renderTemplate(step, word) {
    const p = step.paradigm;
    const lines = MP.sarf.template(p);
    const placed = {};        // slot id -> the form sitting in it
    let held = null;          // the tile picked up by tapping
    const slotNodes = {};

    const box = el('div', { class: 'tpl-wrap' });
    const frame = el('div', { class: 'tpl-frame' });
    const bank = el('div', { class: 'tpl-bank' });
    const result = el('p', { class: 'tpl-result muted small' });

    function paintBank() {
      bank.innerHTML = '';
      const loose = E.shuffle(step.slots.map((id) => p[id]))
        .filter((v) => Object.keys(placed).every((k) => placed[k] !== v) || false);
      /* a form already placed leaves the bank; identical strings are compared
         by how many of each are still needed, not by identity */
      const need = {};
      step.slots.forEach((id) => { need[p[id]] = (need[p[id]] || 0) + 1; });
      Object.keys(placed).forEach((k) => { need[placed[k]] = (need[placed[k]] || 0) - 1; });
      const tiles = [];
      Object.keys(need).forEach((v) => { for (let i = 0; i < need[v]; i++) tiles.push(v); });

      E.shuffle(tiles).forEach((value) => {
        const tile = el('button', {
          class: 'tpl-tile' + (held === value ? ' held' : ''), type: 'button', draggable: 'true',
          onclick: () => { if (answered) return; held = held === value ? null : value; paintBank(); },
          ondragstart: (ev) => { held = value; ev.dataTransfer.setData('text/plain', value); }
        }, [ar(value, 'tpl-tile-ar')]);
        bank.appendChild(tile);
      });
      if (!tiles.length) bank.appendChild(el('span', { class: 'muted small', text: 'All placed — press Check.' }));
      void loose;
    }

    function place(slot, value) {
      if (answered || !value) return;
      placed[slot] = value;
      held = null;
      paintSlot(slot);
      paintBank();
    }

    function paintSlot(slot) {
      const node = slotNodes[slot];
      if (!node) return;
      node.innerHTML = '';
      node.classList.toggle('filled', !!placed[slot]);
      if (placed[slot]) node.appendChild(ar(placed[slot], 'tpl-slot-ar'));
      else node.appendChild(el('span', { class: 'tpl-slot-hint', text: '؟' }));
    }

    lines.forEach((line) => {
      const row = el('div', { class: 'tpl-line' });
      row.appendChild(el('span', { class: 'tpl-line-label' }, [
        ar(line.ar, 'tpl-line-ar'),
        settings.arabicFirst ? el('span', {}) : el('span', { class: 'tpl-line-en', text: line.en })
      ]));
      const run = el('div', { class: 'tpl-run', dir: 'rtl', lang: 'ar' });
      line.parts.forEach((part) => {
        const cell = el('span', { class: 'tpl-part' });
        if (part.lead) cell.appendChild(ar(part.lead, 'tpl-lead'));
        const slot = el('span', {
          class: 'tpl-slot', 'data-slot': part.slot, title: part.labelEn,
          onclick: () => {
            if (answered) return;
            if (held) place(part.slot, held);
            else if (placed[part.slot]) { delete placed[part.slot]; paintSlot(part.slot); paintBank(); }
          },
          ondragover: (ev) => { ev.preventDefault(); slot.classList.add('over'); },
          ondragleave: () => slot.classList.remove('over'),
          ondrop: (ev) => {
            ev.preventDefault();
            slot.classList.remove('over');
            place(part.slot, ev.dataTransfer.getData('text/plain') || held);
          }
        });
        slotNodes[part.slot] = slot;
        cell.appendChild(slot);
        run.appendChild(cell);
      });
      row.appendChild(run);
      frame.appendChild(row);
    });

    Object.keys(slotNodes).forEach(paintSlot);
    paintBank();

    function grade(reveal) {
      if (answered) return;
      answered = true;
      let right = 0;
      step.slots.forEach((slot) => {
        const ok = placed[slot] === p[slot];
        if (ok) right++;
        else if (reveal) placed[slot] = p[slot];
        const node = slotNodes[slot];
        if (node) {
          node.classList.add(ok ? 'correct' : 'wrong');
          if (reveal && !ok) paintSlot(slot);
        }
      });
      const all = right === step.slots.length;
      E.recordAnswer(session, all);
      result.textContent = right + ' of ' + step.slots.length + ' in the right place.';
      showFeedback(all, MP.sarf.asText(p),
        all ? '' : 'Recite it in order — the frame never changes, only the words in it do.');
    }

    box.appendChild(frame);
    box.appendChild(el('p', { class: 'muted small', text: 'Drag a form into a gap, or tap the form then the gap. Tap a filled gap to take it back.' }));
    box.appendChild(bank);
    box.appendChild(result);
    box.appendChild(el('div', { class: 'input-row' }, [
      el('button', { class: 'btn primary', type: 'button', text: 'Check', onclick: () => grade(false) }),
      el('button', { class: 'btn ghost small', type: 'button', text: "I don't know — show me", onclick: () => grade(true) })
    ]));
    return box;
  }

  /* ---- translation: typed, then self-marked ---- */
  function renderTranslate(step, word) {
    const input = el('input', {
      class: 'text-input', type: 'text', placeholder: step.placeholder || '',
      autocomplete: 'off', autocapitalize: 'off'
    });
    const submit = el('button', { class: 'btn primary', type: 'button', text: 'Check' });
    const box = el('div', {}, [el('div', { class: 'input-row' }, [input, submit])]);

    function reveal() {
      if (answered) return;
      answered = true;
      input.disabled = true;
      submit.disabled = true;

      const guessLooksRight = E.translationLooksRight(input.value, step.answer);
      const fb = $('#feedback');
      fb.className = 'feedback neutral';
      fb.innerHTML = '';
      fb.appendChild(el('div', { class: 'fb-title', text: guessLooksRight ? 'That looks right — check it against the meaning:' : 'The meaning is:' }));
      fb.appendChild(el('div', { class: 'fb-answer', text: step.answer }));
      if (word.note) fb.appendChild(el('div', { class: 'fb-hint' }, [arabicAware(word.note)]));
      /* leave them with the word doing a job in a real sentence */
      const sentence = MP.sentences && MP.sentences[word.id];
      if (sentence && step.id === 'translation') {
        fb.appendChild(el('div', { class: 'fb-sentence' }, [
          el('div', { class: 'muted small', text: 'Seen in use:' }),
          ar(sentence.ar.replace('{}', word.w), 'fb-sentence-ar'),
          el('div', { class: 'muted small', text: sentence.en })
        ]));
      }
      fb.appendChild(el('div', { class: 'self-mark' }, [
        el('button', { class: 'btn ok', type: 'button', text: 'I knew it', onclick: () => { E.recordAnswer(session, true); showNext(); } }),
        el('button', { class: 'btn bad', type: 'button', text: 'I did not', onclick: () => { E.recordAnswer(session, false); showNext(); } })
      ]));
    }

    submit.addEventListener('click', reveal);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') reveal(); });
    setTimeout(() => input.focus(), 30);
    return box;
  }

  /* ------------------------------------------------------------------ */
  /* the decision tree, walked node by node                              */
  /* ------------------------------------------------------------------ */

  /*
   * The chain of questions the word was taken through, with the answer to
   * each and the piece of the word that gives that answer away.
   */
  function treeNodes(word, steps, answers) {
    const p = E.paradigmOf(word);
    const out = [];
    steps.forEach((step) => {
      if (step.kind === 'translate' || step.kind === 'cloze') return;
      let answerId = step.answer;
      let label;
      if (step.kind === 'choice') {
        const o = T.option(step.groupId, step.answer);
        label = o ? { ar: o.ar, en: o.en, tr: o.tr } : { ar: String(step.answer), en: '' };
      } else if (step.id === 'root') {
        const letters = Array.isArray(step.answer) ? step.answer.join(' ') : step.answer;
        label = { ar: letters, en: 'the radicals' };
      } else if (step.id === 'sarf') {
        const slot = T.sarfSlots.find((s) => s.id === step.answer);
        label = slot ? { ar: slot.ar, en: slot.en } : { ar: String(step.answer), en: '' };
      } else if (step.id === 'baseMadi') {
        label = { ar: step.answer, en: 'the bare māḍī it came from' };
      } else {
        label = { ar: String(step.answer), en: '' };
      }

      const record = (answers || []).find((a) => a.wordId === word.id && a.stepId === step.id);
      /* the other branches on this level of the chart, so the diagram can show
         what was ruled out as well as what was chosen */
      const siblings = step.kind === 'choice' ? (T.groups[step.groupId] || []) : [];
      out.push({
        id: step.id,
        question: step.q,
        questionAr: step.qAr || '',
        label: label,
        answerId: answerId,
        siblings: siblings,
        got: record ? record.correct : null,
        evidence: MP.evidence.forStep(word, p, step.id, answerId)
      });
    });
    return out;
  }

  /* The word with the evidence for one node lit up inside it. */
  function highlightedWord(text, indices) {
    const on = {};
    (indices || []).forEach((i) => { on[i] = true; });
    const box = el('span', { class: 'ar tree-word', dir: 'rtl', lang: 'ar' });
    let run = '';
    let runOn = false;

    const flush = () => {
      if (!run) return;
      box.appendChild(el('span', { class: runOn ? 'lit' : '', text: run }));
      run = '';
    };

    for (let i = 0; i < text.length; i++) {
      const isOn = !!on[i];
      if (isOn !== runOn) { flush(); runOn = isOn; }
      run += text[i];
    }
    flush();
    return box;
  }

  let treeAt = 0;

  function renderTreeWalk(word, steps, answers, onBack) {
    const nodes = treeNodes(word, steps, answers);
    if (treeAt >= nodes.length) treeAt = 0;

    /*
     * keepScroll on every move but the first: stepping from node to node is
     * not navigation, and being thrown back to the top each time means
     * scrolling down to the chart again to make the next move.
     */
    function paint(keepScroll) {
      repaint = () => paint(true);
      const node = nodes[treeAt];
      const wrap = el('div', { class: 'screen tree' });

      /* the same pair of controls sits at the top and the bottom, so you can
         step through from wherever you happen to be reading */
      const stepper = (extraClass) => {
        const prev = el('button', {
          class: 'btn ghost small', type: 'button', text: '← Previous',
          onclick: () => { if (treeAt > 0) { treeAt--; paint(true); } }
        });
        prev.disabled = treeAt === 0;
        const next = el('button', {
          class: 'btn small' + (extraClass === 'bottom' ? ' primary' : ''), type: 'button',
          text: treeAt === nodes.length - 1 ? 'Done' : 'Next →',
          onclick: () => { if (treeAt < nodes.length - 1) { treeAt++; paint(true); } else onBack(); }
        });
        return el('div', { class: 'tree-steps ' + (extraClass || '') }, [prev, next]);
      };

      wrap.appendChild(el('div', { class: 'topbar' }, [
        el('button', { class: 'btn ghost small', type: 'button', text: 'Skip ✕', onclick: onBack }),
        el('span', { class: 'counter', text: 'Node ' + (treeAt + 1) + ' of ' + nodes.length }),
        stepper('top')
      ]));

      /* the word, with this node's evidence lit */
      wrap.appendChild(el('div', { class: 'tree-card' }, [
        highlightedWord(word.w, node.evidence.indices),
        el('div', { class: 'tree-why' }, [arabicAware(node.evidence.why || '')])
      ]));

      /* the answer at this node */
      wrap.appendChild(el('div', { class: 'tree-answer' }, [
        el('div', { class: 'tree-q' }, [
          el('span', { class: 'tree-q-en', text: node.question }),
          node.questionAr ? ar(node.questionAr, 'tree-q-ar') : el('span', {})
        ]),
        el('div', { class: 'tree-verdict' + (node.got === false ? ' missed' : '') }, [
          ar(node.label.ar, 'tree-verdict-ar'),
          el('span', { class: 'tree-verdict-en' }, [
            el('span', { text: node.label.en || '' }),
            node.got === false ? el('span', { class: 'tree-flag', text: 'you missed this one' }) : el('span', {})
          ])
        ])
      ]));

      /*
       * The whole chart, drawn: a level per question, every alternative on
       * that level shown side by side the way the paper chart does, with the
       * branch this word actually took lit and the roads not taken faded.
       * Seeing جَمْع sitting next to مُفْرَد and مُثَنَّى is most of the lesson.
       */
      const diagram = el('div', { class: 'tree-diagram' });
      nodes.forEach((n, i) => {
        const level = el('div', { class: 'tree-level' + (i === treeAt ? ' on' : '') });
        level.appendChild(el('span', { class: 'tree-level-name', text: stepName(n.id) }));

        const branches = el('div', { class: 'tree-branches' });
        const siblings = n.siblings.length ? n.siblings : [n.label];
        siblings.forEach((s) => {
          const chosen = s.id === undefined ? true : s.id === n.answerId;
          branches.appendChild(el('button', {
            class: 'tree-branch' + (chosen ? ' chosen' : '') + (chosen && n.got === false ? ' missed' : ''),
            type: 'button',
            onclick: () => { treeAt = i; paint(true); }
          }, [
            ar(s.ar, 'tree-branch-ar'),
            el('span', { class: 'tree-branch-en', text: settings.arabicFirst ? (s.tr || s.en || '') : (s.en || '') })
          ]));
        });
        level.appendChild(branches);
        diagram.appendChild(level);
      });
      wrap.appendChild(el('section', { class: 'panel' }, [
        el('h2', { class: 'panel-title', text: 'The whole chart' }),
        el('p', { class: 'muted small', text: 'Every level of the chart, with the branch this word took lit up. Tap any level to see what gives it away.' }),
        diagram
      ]));

      wrap.appendChild(stepper('bottom'));

      setScreen(wrap, keepScroll);
    }

    paint(false);
  }

  function showFeedback(correct, answerText, hint) {
    const fb = $('#feedback');
    fb.className = 'feedback ' + (correct ? 'good' : 'bad');
    fb.innerHTML = '';
    fb.appendChild(el('div', { class: 'fb-title', text: correct ? 'Correct' : 'Not quite — the answer is:' }));
    fb.appendChild(el('div', { class: 'fb-answer ar', dir: 'rtl', text: answerText }));
    const word = E.currentWord(session);
    const step = E.currentStep(session);
    if (hint) fb.appendChild(el('div', { class: 'fb-hint', text: hint }));
    if (word.note && (step.id === 'baab' || step.id === 'subtype' || step.id === 'mood' || step.id === 'tense')) {
      fb.appendChild(el('div', { class: 'fb-hint word-note' }, [arabicAware(word.note)]));
    }
    /* an iʿlāl item carries the reason it came out that way — which is the
       whole point of the drill, so it is shown whether you got it right or not */
    if (word.why && (step.id === 'ilalForm' || step.id === 'ilalRule')) {
      fb.appendChild(el('div', { class: 'fb-hint word-note' }, [
        arabicAware(word.from + ' → ' + word.to + '. ' + word.why)
      ]));
    }
    /* got it wrong? offer the page of the reference that covers it */
    if (!correct) {
      const secId = sectionForStep(step);
      const sec = MP.reference.sections.find((s) => s.id === secId);
      if (sec) {
        fb.appendChild(el('button', {
          class: 'btn ghost small ref-link', type: 'button',
          text: '📖 Read up on it: ' + sec.name,
          onclick: () => openReference(secId)
        }));
      }
    }
    showNext();
  }

  function showNext() {
    const row = $('#next-row');
    if (!row) return;
    row.innerHTML = '';
    const last = session.stepIndex === session.steps.length - 1;
    const lastWord = session.index === session.words.length - 1;
    const label = last ? (lastWord ? 'Finish' : 'Next word →') : 'Next →';

    /* the analysis is done: the whole chain is now available to walk back
       through, with the evidence for each answer shown in the word itself */
    if (last && session.mode === 'analysis' && session.steps.length > 1) {
      const word = E.currentWord(session);
      row.appendChild(el('button', {
        class: 'btn ghost big', type: 'button', text: '🌳 Walk the tree',
        onclick: () => {
          treeAt = 0;
          /* walking the tree is the last thing done with this word, so
             leaving it carries straight on rather than back to the step */
          renderTreeWalk(word, session.steps, session.answers, goNext);
        }
      }));
    }

    const btn = el('button', { class: 'btn primary big', type: 'button', text: label, onclick: goNext });
    row.appendChild(btn);
    btn.focus();
  }

  function goNext() {
    const result = E.advance(session);
    if (result === 'done') renderSummary();
    else renderStep();
  }

  ['pointerdown', 'keydown'].forEach((evt) => {
    document.addEventListener(evt, () => { touched = true; }, true);
  });

  /* keyboard: Enter/Space to move on, 1–9 to pick an option */
  document.addEventListener('keydown', (e) => {
    if (!session) return;
    const nextBtn = $('#next-row .btn');
    if (nextBtn && (e.key === 'Enter' || e.key === ' ')) {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      e.preventDefault();
      nextBtn.click();
      return;
    }
    if (!answered && /^[1-9]$/.test(e.key)) {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      const opts = document.querySelectorAll('.options .option:not(.dunno)');
      const idx = parseInt(e.key, 10) - 1;
      if (opts[idx]) opts[idx].click();
    }
  });

  /* ------------------------------------------------------------------ */
  /* hints and the reference overlay                                     */
  /* ------------------------------------------------------------------ */

  function toggleHint(hint) {
    const panel = $('#hint-panel');
    if (!panel) return;
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
      panel.innerHTML = '';
      return;
    }
    panel.classList.add('open');
    panel.innerHTML = '';
    panel.appendChild(el('div', { class: 'hint-title', text: hint.title }));
    const ul = el('ul', { class: 'hint-list' });
    hint.bullets.forEach((b) => ul.appendChild(el('li', { class: 'hint-item' }, [arabicAware(b)])));
    panel.appendChild(ul);
  }

  /* Wraps runs of Arabic inside an English sentence so they get the Arabic
     font and the right direction, without breaking the sentence flow. */
  function arabicAware(raw) {
    /* Arabic commas inside a mixed sentence drag neighbouring words into the
       same bidi run and scramble the reading order — use a Latin one. */
    const text = String(raw).replace(/،/g, ',');
    const frag = document.createDocumentFragment();
    const re = /([؀-ۿ][؀-ۿ\sً-ْ]*)/g;
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      frag.appendChild(el('span', { class: 'ar inline-ar', dir: 'rtl', lang: 'ar', text: m[1].trim() }));
      last = m.index + m[1].length;
      if (/\s$/.test(m[1])) frag.appendChild(document.createTextNode(' '));
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    return frag;
  }

  /* which reference section is most useful for the question on screen */
  function sectionForStep(step) {
    const map = {
      baabThulathiMujarrad: 'gates',
      baabThulathiMazeed: 'forms',
      baabRubaiMujarrad: 'rubai',
      baabRubaiMazeed: 'rubai',
      sahihType: 'weak',
      mutalType: 'weak',
      ismType: 'nouns',
      harfType: 'particles'
    };
    if (!step) return 'gates';
    if (map[step.groupId]) return map[step.groupId];
    /* person, gender, number and iʿrāb all come down to the endings, which is
       exactly what the tricks page is for */
    if (['person', 'gender', 'number', 'mood'].indexOf(step.id) !== -1) return 'tricks';
    if (step.id === 'tense') return 'sighah';
    /* the ṣarf ṣaghīr question is about the cells, which is what the form
       tables lay out line by line */
    if (step.id === 'sarf') return 'forms-tables';
    /* the hard part of naming a root is the radical you cannot see, and what
       happened to it is the iʿlāl page rather than the categories page */
    if (step.id === 'root') return 'ilal';
    /* producing a weak form is a question about the rules, not the labels */
    if (step.id === 'baseMadi' || step.id === 'production' || step.id === 'conjugation') return 'ilal';
    if (step.id === 'ilalForm' || step.id === 'ilalRule') return 'ilal';
    return 'spotting';
  }

  let refSection = 'gates';
  /* which card of a multi-page section is open, per section id */
  const subPage = {};

  function openReference(sectionId) {
    refSection = sectionId || refSection;
    let overlay = $('#reference');
    if (!overlay) {
      overlay = el('div', { class: 'overlay', id: 'reference' });
      document.body.appendChild(overlay);
    }
    document.body.classList.add('locked');
    renderReference();
  }

  function closeReference() {
    const overlay = $('#reference');
    if (overlay) overlay.remove();
    document.body.classList.remove('locked');
  }

  /*
   * The reference content, without any chrome: used both by the Learn view and
   * by the overlay that opens from inside a session.
   */
  function buildReference(sectionId, onSelect, redraw) {
    const section = MP.reference.sections.find((s) => s.id === sectionId) || MP.reference.sections[0];
    const box = el('div', { class: 'ref-wrap' });
    /* Pages with their own inner picker need to redraw whichever container they
       are sitting in — the Learn view or the mid-session overlay. Without this
       they redrew the overlay unconditionally, so in Learn the picker was dead. */
    const again = redraw || (() => onSelect(sectionId));

    /*
     * Twelve sections in one flat row had stopped reading as a menu and
     * started reading as a wall. They are banded by subject now — the verb,
     * the weak ones, nouns and particles, the full tables, quick reference —
     * so finding a page is a matter of looking in the right band rather than
     * scanning the lot. The picker inside a section is unchanged.
     */
    const tabs = el('div', { class: 'ref-tabs' });
    const order = MP.reference.groupOrder || [];
    const bands = order.concat(['More']);

    bands.forEach((band) => {
      const inBand = MP.reference.sections.filter((s) => {
        const g = s.group && order.indexOf(s.group) !== -1 ? s.group : 'More';
        return g === band;
      });
      if (!inBand.length) return;

      const row = el('div', { class: 'ref-band-row' });
      inBand.forEach((s) => {
        row.appendChild(el('button', {
          class: 'chip' + (s.id === section.id ? ' on' : ''), type: 'button', text: s.name,
          onclick: () => onSelect(s.id)
        }));
      });
      tabs.appendChild(el('div', {
        class: 'ref-band' + (inBand.some((s) => s.id === section.id) ? ' active' : '')
      }, [el('span', { class: 'ref-band-label', text: band }), row]));
    });
    box.appendChild(tabs);

    const body = el('div', { class: 'ref-body' });
    body.appendChild(el('p', { class: 'ref-intro' }, [arabicAware(section.intro)]));

    if (section.kind === 'formtables') {
      body.appendChild(renderFormTables(again));
      box.appendChild(body);
      return box;
    }
    if (section.kind === 'conjugator') {
      body.appendChild(renderConjugator(again));
      box.appendChild(body);
      return box;
    }

    /*
     * The long sections are a page per card, not one page you scroll to the
     * bottom of: the six gates one at a time, Forms II–X one at a time. "All
     * of them" is still there for anyone who wants the whole run.
     */
    let cards = section.cards;
    if (section.subpages && cards.length > 1) {
      const chosen = subPage[section.id] === undefined ? 0 : subPage[section.id];
      const picker = el('div', { class: 'chip-row sub-picker' });
      cards.forEach((c, i) => {
        picker.appendChild(el('button', {
          class: 'chip' + (chosen === i ? ' on' : ''), type: 'button', text: c.title,
          onclick: () => { subPage[section.id] = i; again(); }
        }));
      });
      picker.appendChild(el('button', {
        class: 'chip' + (chosen === 'all' ? ' on' : ''), type: 'button', text: 'All of them',
        onclick: () => { subPage[section.id] = 'all'; again(); }
      }));
      body.appendChild(picker);
      if (chosen !== 'all') cards = [cards[chosen] || cards[0]];
    }

    cards.forEach((c) => {
      const card = el('div', { class: 'ref-card' });
      card.appendChild(el('div', { class: 'ref-card-head' }, [
        ar(c.ar, 'ref-card-ar'),
        el('span', { class: 'ref-card-titles' }, [
          el('span', { class: 'ref-card-title', text: c.title }),
          el('span', { class: 'ref-card-tag', text: c.tag })
        ])
      ]));

      if (c.rows && c.rows.length) {
        const rows = el('div', { class: 'ref-rows' });
        c.rows.forEach((r) => {
          rows.appendChild(el('div', { class: 'ref-row' }, [
            el('span', { class: 'ref-row-label' }, [arabicAware(r[0])]),
            el('span', { class: 'ref-row-value' }, [arabicAware(r[1])])
          ]));
        });
        card.appendChild(rows);
      }

      if (c.spot && c.spot.length) {
        card.appendChild(el('h4', { class: 'ref-sub', text: 'How to spot it' }));
        const ul = el('ul', { class: 'hint-list' });
        c.spot.forEach((b) => ul.appendChild(el('li', { class: 'hint-item' }, [arabicAware(b)])));
        card.appendChild(ul);
      }

      if (c.means && c.means.length) {
        card.appendChild(el('h4', { class: 'ref-sub', text: 'What it does to the meaning' }));
        const ul = el('ul', { class: 'hint-list' });
        c.means.forEach((b) => ul.appendChild(el('li', { class: 'hint-item' }, [arabicAware(b)])));
        card.appendChild(ul);
      }

      if (c.examples && c.examples.length) {
        const ex = el('div', { class: 'ref-examples' });
        c.examples.forEach((e) => {
          ex.appendChild(el('div', { class: 'ref-example' }, [
            ar(e.ar, 'ref-example-ar'),
            el('span', { class: 'ref-example-en', text: e.en })
          ]));
        });
        card.appendChild(ex);
      }

      body.appendChild(card);
    });

    box.appendChild(body);
    return box;
  }

  /* the overlay version, for looking something up mid-session */
  function renderReference() {
    const overlay = $('#reference');
    if (!overlay) return;
    overlay.innerHTML = '';
    overlay.appendChild(el('div', { class: 'ref-head' }, [
      el('h2', { class: 'ref-title', text: 'Reference' }),
      el('button', { class: 'btn ghost small', type: 'button', text: 'Close ✕', onclick: closeReference })
    ]));
    overlay.appendChild(buildReference(
      refSection,
      (id) => { refSection = id; renderReference(); },
      renderReference
    ));
    overlay.scrollTop = 0;
  }

  /* ---- one page per bāb, every line labelled ---- */
  let formPage = 'nasara';

  function renderFormTables(redraw) {
    const box = el('div', { class: 'form-tables' });

    /* picker, grouped the way the chart groups them */
    ['Thulāthī mujarrad', 'Mazīd fīh', 'Rubāʿī'].forEach((groupName) => {
      const row = el('div', { class: 'chip-row' });
      MP.tables.FORMS.filter((f) => f.group === groupName).forEach((f) => {
        row.appendChild(el('button', {
          class: 'chip' + (f.id === formPage ? ' on' : ''), type: 'button', text: f.label,
          onclick: () => { formPage = f.id; redraw(); }
        }));
      });
      box.appendChild(el('div', { class: 'picker-group' }, [
        el('span', { class: 'picker-label', text: groupName }), row
      ]));
    });

    const page = MP.tables.pageFor(formPage);
    if (!page) return box;

    box.appendChild(el('div', { class: 'form-head' }, [
      el('div', { class: 'form-head-main' }, [
        ar(page.headline, 'form-pattern'),
        el('span', { class: 'form-title', text: page.label })
      ]),
      el('div', { class: 'form-head-example' }, [
        ar(page.exampleHeadline, 'form-example-ar'),
        el('span', { class: 'muted small' }, [arabicAware(page.root + ' · ' + page.meaning)])
      ])
    ]));

    box.appendChild(el('div', { class: 'form-columns' }, [
      el('span', { class: 'form-col-label', text: '' }),
      el('span', { class: 'form-col-label', text: 'the pattern' }),
      el('span', { class: 'form-col-label', text: 'a real verb' })
    ]));

    page.groups.forEach((group) => {
      const g = el('div', { class: 'form-group' }, [
        el('div', { class: 'form-group-head' }, [
          ar(group.title, 'form-group-ar'),
          el('span', { class: 'form-group-en', text: group.titleEn })
        ])
      ]);
      group.rows.forEach((r) => {
        const unused = r.pattern === MP.NOT_USED && r.example === MP.NOT_USED;
        g.appendChild(el('div', { class: 'form-row' + (unused ? ' unused' : '') }, [
          el('span', { class: 'bubble' }, [
            ar(r.ar, 'bubble-ar'),
            el('span', { class: 'bubble-en', text: r.en })
          ]),
          el('span', { class: 'form-cell' }, [
            ar(r.pattern, 'form-cell-ar'),
            r.note ? el('span', { class: 'form-note', text: r.note }) : null
          ].filter(Boolean)),
          ar(r.example, 'form-cell-ar example')
        ]));
      });
      box.appendChild(g);
    });

    box.appendChild(el('p', { class: 'muted small', text: 'A dash means the bāb has no such form — an intransitive verb has no passive and no ism al-mafʿūl, and only the bare triliteral gives a ẓarf or an ālah.' }));
    return box;
  }

  /* ---- the conjugation table viewer inside the reference ---- */
  let conjVerb = 'nsr-I';

  function renderConjugator(redraw) {
    const box = el('div', { class: 'conjugator' });
    const ids = MP.conjugation.conjugatable();

    const picker = el('div', { class: 'chip-row conj-picker' });
    ids.forEach((id) => {
      const p = MP.paradigms[id];
      picker.appendChild(el('button', {
        class: 'chip' + (id === conjVerb ? ' on' : ''), type: 'button',
        onclick: () => { conjVerb = id; redraw(); }
      }, [ar(p.madi), el('span', { class: 'conj-pick-en', text: ' ' + p.meaning })]));
    });
    box.appendChild(picker);

    const table = MP.conjugation.tableFor(conjVerb);
    const p = MP.paradigms[conjVerb];
    box.appendChild(el('div', { class: 'ref-card-head' }, [
      ar(p.madi + ' ' + p.mudari, 'ref-card-ar'),
      el('span', { class: 'ref-card-titles' }, [
        el('span', { class: 'ref-card-title', text: p.meaning }),
        el('span', { class: 'ref-card-tag', text: p.root + ' · ' + T.label(E.baabGroupId(p), p.baabId) })
      ])
    ]));
    if (table.note) box.appendChild(el('p', { class: 'muted small' }, [arabicAware(table.note)]));

    const grid = el('div', { class: 'conj-grid' });
    [
      { key: 'madi', name: 'Māḍī — الماضي', pronouns: MP.conjugation.PRONOUNS },
      { key: 'mudari', name: 'Muḍāriʿ — المضارع', pronouns: MP.conjugation.PRONOUNS },
      { key: 'amr', name: 'Amr — الأمر', pronouns: MP.conjugation.AMR_PRONOUNS }
    ].forEach((col) => {
      const forms = table[col.key];
      if (!forms) return;
      const colBox = el('div', { class: 'conj-col' }, [el('h4', { class: 'ref-sub', text: col.name })]);
      forms.forEach((form, i) => {
        colBox.appendChild(el('div', { class: 'conj-row' }, [
          ar(col.pronouns[i].ar, 'conj-pronoun'),
          ar(form, 'conj-form')
        ]));
      });
      grid.appendChild(colBox);
    });
    box.appendChild(grid);
    box.appendChild(el('p', { class: 'muted small', text: table.source === 'authored'
      ? 'This table is written out by hand — the stem of this verb changes as it conjugates.'
      : 'Built from the māḍī and muḍāriʿ: this verb keeps its stem throughout.' }));

    /* the ṣarf ṣaghīr of the same verb, underneath the ṣarf kabīr — the three
       tables above are the fourteen persons, this is the eleven cells */
    box.appendChild(el('h4', { class: 'ref-sub', text: 'Ṣarf ṣaghīr — الصرف الصغير' }));
    box.appendChild(el('p', { class: 'muted small', text: 'The same verb said the other way round: three lines, recited.' }));
    box.appendChild(renderSarfPanel(p, redraw));
    return box;
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#reference')) closeReference();
  });

  /* ------------------------------------------------------------------ */
  /* summary                                                             */
  /* ------------------------------------------------------------------ */

  function renderSummary() {
    repaint = renderSummary;
    session.finished = true;  // nothing left to resume
    MP.sync.syncQuietly();   // a finished session is the natural moment to push
    const score = E.sessionScore(session);
    const bd = E.breakdown(session);
    const missed = session.missedWords.slice();
    const wrap = el('div', { class: 'screen summary' });

    wrap.appendChild(el('h1', { class: 'title', text: 'Session finished' }));
    wrap.appendChild(el('p', { class: 'score', text: score.correct + ' / ' + score.total + ' — ' + score.pct + '%' }));

    const bars = el('div', { class: 'bars' });
    Object.keys(bd).forEach((k) => {
      const p = Math.round((bd[k].correct / bd[k].total) * 100);
      bars.appendChild(el('div', { class: 'bar-row' }, [
        el('span', { class: 'bar-label', text: stepName(k) }),
        el('span', { class: 'bar' }, [el('span', { class: 'bar-fill' + (p < 60 ? ' low' : ''), style: 'width:' + p + '%' })]),
        el('span', { class: 'bar-pct', text: bd[k].correct + '/' + bd[k].total })
      ]));
    });
    wrap.appendChild(el('section', { class: 'panel' }, [el('h2', { class: 'panel-title', text: 'By question type' }), bars]));

    if (missed.length) {
      const list = el('div', { class: 'missed-list' });
      missed.forEach((id) => {
        const w = session.words.find((x) => x.id === id) || MP.words.find((x) => x.id === id);
        if (!w) return;
        const row = el('div', { class: 'missed' }, [
          ar(w.w, 'missed-ar'),
          el('span', { class: 'missed-en', text: w.en || w.sub || '' })
        ]);
        /* only an analysed word has a tree behind it */
        if (session.mode === 'analysis' && w.w) {
          row.appendChild(el('button', {
            class: 'btn ghost small', type: 'button', text: '🌳 Walk it',
            onclick: () => {
              treeAt = 0;
              renderTreeWalk(w, E.buildSteps(w, session.settings), session.answers, renderSummary);
            }
          }));
        }
        list.appendChild(row);
      });
      wrap.appendChild(el('section', { class: 'panel' }, [
        el('h2', { class: 'panel-title', text: 'Words that tripped you up' }), list
      ]));
    }

    /* a drill carries on as a drill: same settings, same place to go back to */
    const cfg = session.settings;
    const from = session.origin || 'practice';
    wrap.appendChild(el('div', { class: 'cta-row' }, [
      missed.length
        ? el('button', { class: 'btn primary big', type: 'button', text: 'Practise the ' + missed.length + ' missed', onclick: () => startSession(missed, cfg, from) })
        : el('span', {}),
      el('button', { class: 'btn big', type: 'button', text: 'Another session', onclick: () => startSession(null, cfg, from) }),
      el('button', { class: 'btn ghost big', type: 'button', text: from === 'drill' ? 'Drill' : 'Practice', onclick: () => go(from) })
    ]));

    setScreen(wrap);
  }

  /* ------------------------------------------------------------------ */

  function renderEditor() {
    repaint = renderEditor;
    const wrap = el('div', { class: 'screen words' });
    setScreen(wrap);
    MP.editor.render(wrap, () => go('practice'));
  }

  document.addEventListener('DOMContentLoaded', () => {
    MP.custom.apply();   // fold in anything the user has added
    render();
    /* Pull anything a second device did since we were last here — but never
       redraw under someone's finger: if they have already started tapping,
       the fresher data waits until the next time home is drawn. */
    MP.sync.syncQuietly().then((result) => {
      if (result && !touched && $('.home')) {
        MP.custom.apply();
        settings = MP.store.loadSettings();
        refresh();
      }
    });
  });
})(typeof window !== 'undefined' ? window : globalThis);
