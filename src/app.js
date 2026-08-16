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

  /* the four ways to practise */
  const MODES = [
    { id: 'analysis', name: 'Full analysis', desc: 'Walk a word down the chart, question by question.' },
    { id: 'production', name: 'Build the form', desc: 'Given a root and a cell, produce the word yourself.' },
    { id: 'conjugation', name: 'Conjugation', desc: 'Ṣarf kabīr: conjugate a verb for any of the fourteen persons.' },
    { id: 'sentences', name: 'Sentences', desc: 'Fill the missing word into a real sentence, then translate it.' }
  ];

  const currentMode = () => settings.mode || 'analysis';

  /* single-question drills */
  const FOCUS_MODES = [
    { id: null, name: 'Everything' },
    { id: 'baab', name: 'Bāb / form' },
    { id: 'voice', name: 'Active / passive' },
    { id: 'subtype', name: 'Ṣaḥīḥ / muʿtall type' },
    { id: 'radicals', name: 'Radicals' },
    { id: 'ismType', name: 'Kind of noun' },
    { id: 'sarf', name: 'Ṣarf ṣaghīr' },
    { id: 'root', name: 'Root' },
    { id: 'baseMadi', name: 'Back to the māḍī' },
    { id: 'context', name: 'Sentence gap' },
    { id: 'translation', name: 'Translation' }
  ];

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
    return settings.showHarakat ? word.w : E.stripHarakat(word.w);
  }

  function setScreen(node) {
    const root = app();
    root.innerHTML = '';
    root.appendChild(node);
    root.scrollTop = 0;
    global.scrollTo(0, 0);
  }

  /* ------------------------------------------------------------------ */
  /* home                                                                */
  /* ------------------------------------------------------------------ */

  function renderHome() {
    const stats = MP.store.load();
    const wrap = el('div', { class: 'screen home' });

    wrap.appendChild(el('header', { class: 'hero' }, [
      el('h1', { class: 'title' }, [ar('الصَّرْف'), el('span', { class: 'title-en', text: 'Morphology practice' })]),
      el('p', { class: 'lede', text: 'A word appears. You take it through the chart — type, tense, mood, voice, person, gender, number, then its root, bāb, ṣaḥīḥ or muʿtall, its place in the ṣarf ṣaghīr, and finally the meaning.' })
    ]));

    /* practice mode */
    const modeGrid = el('div', { class: 'deck-grid' });
    MODES.forEach((m) => {
      const count = E.poolFor(m.id, settings.deckId).length;
      modeGrid.appendChild(el('button', {
        class: 'deck' + (currentMode() === m.id ? ' selected' : ''), type: 'button',
        onclick: () => { settings.mode = m.id; MP.store.saveSettings(settings); renderHome(); }
      }, [
        el('span', { class: 'deck-name', text: m.name }),
        el('span', { class: 'deck-desc', text: m.desc }),
        el('span', { class: 'deck-count', text: count + ' to draw from' })
      ]));
    });
    wrap.appendChild(el('section', { class: 'panel' }, [
      el('h2', { class: 'panel-title', text: 'Practice mode' }), modeGrid
    ]));

    /* deck picker */
    const deckGrid = el('div', { class: 'deck-grid' });
    T.decks.forEach((d) => {
      const count = E.deckWords(d.id).length;
      const countLabel = d.id === 'due' ? count + ' due now' : count + ' words';
      const card = el('button', {
        class: 'deck' + (settings.deckId === d.id ? ' selected' : ''),
        type: 'button',
        onclick: () => {
          settings.deckId = d.id;
          MP.store.saveSettings(settings);
          renderHome();
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
        onclick: () => { settings.length = n; MP.store.saveSettings(settings); renderHome(); }
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
          renderHome();
        }
      }, [
        el('span', { class: 'switch-name', text: g.name }),
        el('span', { class: 'switch-desc', text: g.desc })
      ]));
    });

    const toggles = el('div', { class: 'chip-row' }, [
      el('button', {
        class: 'chip' + (settings.showHarakat ? ' on' : ''), type: 'button', text: 'Ḥarakāt shown',
        onclick: () => { settings.showHarakat = !settings.showHarakat; MP.store.saveSettings(settings); renderHome(); }
      }),
      el('button', {
        class: 'chip' + (settings.showTranslit ? ' on' : ''), type: 'button', text: 'Transliteration on options',
        onclick: () => { settings.showTranslit = !settings.showTranslit; MP.store.saveSettings(settings); renderHome(); }
      }),
      el('button', {
        class: 'chip' + (settings.weakestFirst ? ' on' : ''), type: 'button', text: 'Weakest words first',
        onclick: () => { settings.weakestFirst = !settings.weakestFirst; MP.store.saveSettings(settings); renderHome(); }
      })
    ]);

    /* focus mode — one question type, many words, fast reps */
    const focusRow = el('div', { class: 'chip-row' });
    FOCUS_MODES.forEach((f) => {
      focusRow.appendChild(el('button', {
        class: 'chip' + (settings.focus === f.id ? ' on' : ''), type: 'button', text: f.name,
        onclick: () => { settings.focus = f.id; MP.store.saveSettings(settings); renderHome(); }
      }));
    });

    const sessionPanel = [el('h2', { class: 'panel-title', text: 'Session' }), lenRow, toggles];
    if (currentMode() === 'analysis') {
      sessionPanel.push(
        el('h2', { class: 'panel-title', text: 'Drill one thing only' }),
        el('p', { class: 'muted small', text: 'Fast reps on a single question, across many words. Everything else is skipped.' }),
        focusRow,
        el('h2', { class: 'panel-title', text: 'What to ask' + (settings.focus ? ' (ignored while drilling one thing)' : '') }),
        groupRow
      );
    }
    wrap.appendChild(el('section', { class: 'panel' }, sessionPanel));

    wrap.appendChild(el('div', { class: 'cta-row' }, [
      el('button', { class: 'btn primary big', type: 'button', text: 'Start practice', onclick: startSession }),
      el('button', { class: 'btn big', type: 'button', text: '📖 Reference & bāb summary', onclick: () => openReference('gates') })
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
            if (global.confirm('Clear all saved progress?')) { MP.store.reset(); renderHome(); }
          }
        })
      ]));
    }

    if (!MP.store.storageAvailable) {
      wrap.appendChild(el('p', { class: 'muted small', text: 'Note: this browser is blocking local storage, so progress will not be kept between visits.' }));
    }

    setScreen(wrap);
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

  function stepName(id) {
    const names = {
      wordType: 'Word type', tense: 'Tense', mood: 'Iʿrāb / mood', voice: 'Voice',
      polarity: 'Affirmative/negative', person: 'Person', gender: 'Gender', number: 'Number',
      ismType: 'Kind of noun', letters: 'Thulāthī / rubāʿī', augmentation: 'Mujarrad / mazīd',
      baab: 'Bāb / form', soundness: 'Ṣaḥīḥ / muʿtall', subtype: 'Sub-category',
      mahmuzPosition: 'Hamzah position', root: 'Root', sarf: 'Ṣarf ṣaghīr', translation: 'Translation'
    };
    return names[id] || id;
  }

  /* ------------------------------------------------------------------ */
  /* the drill                                                           */
  /* ------------------------------------------------------------------ */

  function startSession(only) {
    session = E.buildSession({
      deckId: settings.deckId,
      settings: settings,
      only: Array.isArray(only) ? only : null
    });
    if (!session.words.length) {
      global.alert('That deck is empty.');
      return;
    }
    MP.store.recordSession();
    answered = false;
    renderStep();
  }

  function renderStep() {
    const word = E.currentWord(session);
    const step = E.currentStep(session);
    const wrap = el('div', { class: 'screen drill' });

    /* top bar */
    const doneSteps = session.stepIndex;
    wrap.appendChild(el('div', { class: 'topbar' }, [
      el('button', { class: 'btn ghost small', type: 'button', text: '← Home', onclick: renderHome }),
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
        } else if (step.id === 'root') text = step.answer;
        else if (step.id === 'sarf') {
          const slot = T.sarfSlots.find((s) => s.id === step.answer);
          text = slot ? slot.ar : step.answer;
        } else return;
        out.push(el('span', { class: 'mini-chip' + (a.correct ? '' : ' bad') }, [ar(text)]));
      });
    return out;
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
      }, [
        ar(o.ar, 'option-ar'),
        el('span', { class: 'option-en' }, [
          el('span', { class: 'option-en-main', text: o.en }),
          settings.showTranslit ? el('span', { class: 'option-tr', text: o.tr }) : el('span', {})
        ])
      ]);
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
      const miss = {
        root: 'Say the letters of the māḍī with no additions and no vowels.',
        baseMadi: 'Strip the tense letter and the ending, keep the letters of the bāb.',
        production: 'Recite the ṣarf ṣaghīr of this bāb and stop at the cell you were asked for.',
        conjugation: 'Watch the stem: if the ending begins with a sukūn, a weak or doubled verb changes shape.'
      }[step.id];
      showFeedback(correct, step.answer, correct ? '' : miss || '');
    }
    submit.addEventListener('click', grade);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') grade(); });
    setTimeout(() => input.focus(), 30);

    const box = el('div', {}, [form,
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
  function renderSarf(step, word) {
    const p = step.paradigm;
    const box = el('div', { class: 'sarf-wrap' });

    const table = el('div', { class: 'sarf', id: 'sarf-table' });
    T.sarfSlots.forEach((slot) => {
      const value = p[slot.id];
      const isTarget = slot.id === step.answer;
      const row = el('div', {
        class: 'sarf-row' + (isTarget ? ' target' : '') + (value === MP.NOT_USED ? ' unused' : ''),
        'data-slot': slot.id
      }, [
        el('span', { class: 'sarf-label' }, [ar(slot.ar, 'sarf-label-ar'), el('span', { class: 'sarf-label-en', text: slot.en })]),
        isTarget ? el('span', { class: 'sarf-value blank', text: '؟' }) : ar(value, 'sarf-value')
      ]);
      table.appendChild(row);
    });
    box.appendChild(el('div', { class: 'sarf-head' }, [
      el('span', { class: 'muted small', text: 'Ṣarf ṣaghīr of' }),
      ar(p.root, 'sarf-root'),
      el('span', { class: 'muted small', text: T.label(E.baabGroupId(p), p.baabId) })
    ]));
    box.appendChild(table);

    const opts = el('div', { class: 'options compact' });
    T.sarfSlots
      .filter((s) => p[s.id] !== MP.NOT_USED)
      .forEach((slot) => {
        const btn = el('button', {
          class: 'option', type: 'button', 'data-id': slot.id,
          onclick: () => {
            if (answered) return;
            gradeSarf(step, slot.id, btn, opts, table, p);
          }
        }, [ar(slot.ar, 'option-ar'), el('span', { class: 'option-en' }, [el('span', { class: 'option-en-main', text: slot.en })])]);
        opts.appendChild(btn);
      });
    opts.appendChild(el('button', {
      class: 'option dunno', type: 'button', text: "I don't know — show me",
      onclick: () => { if (!answered) gradeSarf(step, null, null, opts, table, p); }
    }));
    box.appendChild(opts);
    return box;
  }

  function gradeSarf(step, chosenId, btn, box, table, p) {
    answered = true;
    const correct = chosenId === step.answer;
    E.recordAnswer(session, correct);

    Array.prototype.forEach.call(box.querySelectorAll('.option'), (b) => {
      b.disabled = true;
      if (b.getAttribute('data-id') === step.answer) b.classList.add('correct');
    });
    if (btn && !correct) btn.classList.add('wrong');

    /* fill the blank in */
    const row = table.querySelector('.sarf-row.target');
    if (row) {
      const cell = row.querySelector('.sarf-value');
      cell.classList.remove('blank');
      cell.classList.add('ar', 'filled');
      cell.setAttribute('dir', 'rtl');
      cell.textContent = p[step.answer];
    }

    const slot = T.sarfSlots.find((s) => s.id === step.answer);
    showFeedback(correct, slot ? slot.ar + ' — ' + slot.en : step.answer,
      'The whole table is built from ' + p.root + ', so once you know the bāb you can rebuild every cell.');
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
    const btn = el('button', { class: 'btn primary big', type: 'button', text: label, onclick: goNext });
    row.appendChild(btn);
    btn.focus();
  }

  function goNext() {
    const result = E.advance(session);
    if (result === 'done') renderSummary();
    else renderStep();
  }

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
      ismType: 'nouns'
    };
    if (!step) return 'gates';
    if (map[step.groupId]) return map[step.groupId];
    if (step.id === 'person' || step.id === 'gender' || step.id === 'number' || step.id === 'tense') return 'sighah';
    if (step.id === 'sarf' || step.id === 'root') return 'nouns';
    return 'spotting';
  }

  let refSection = 'gates';

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

  function renderReference() {
    const overlay = $('#reference');
    if (!overlay) return;
    const section = MP.reference.sections.find((s) => s.id === refSection) || MP.reference.sections[0];

    overlay.innerHTML = '';
    const head = el('div', { class: 'ref-head' }, [
      el('h2', { class: 'ref-title', text: 'Reference' }),
      el('button', { class: 'btn ghost small', type: 'button', text: 'Close ✕', onclick: closeReference })
    ]);

    const tabs = el('div', { class: 'ref-tabs' });
    MP.reference.sections.forEach((s) => {
      tabs.appendChild(el('button', {
        class: 'chip' + (s.id === section.id ? ' on' : ''), type: 'button', text: s.name,
        onclick: () => { refSection = s.id; renderReference(); }
      }));
    });

    const body = el('div', { class: 'ref-body' });
    body.appendChild(el('p', { class: 'ref-intro' }, [arabicAware(section.intro)]));

    if (section.kind === 'conjugator') {
      body.appendChild(renderConjugator());
      overlay.appendChild(head);
      overlay.appendChild(tabs);
      overlay.appendChild(body);
      overlay.scrollTop = 0;
      return;
    }

    section.cards.forEach((c) => {
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

    overlay.appendChild(head);
    overlay.appendChild(tabs);
    overlay.appendChild(body);
    overlay.scrollTop = 0;
  }

  /* ---- the conjugation table viewer inside the reference ---- */
  let conjVerb = 'nsr-I';

  function renderConjugator() {
    const box = el('div', { class: 'conjugator' });
    const ids = MP.conjugation.conjugatable();

    const picker = el('div', { class: 'chip-row conj-picker' });
    ids.forEach((id) => {
      const p = MP.paradigms[id];
      picker.appendChild(el('button', {
        class: 'chip' + (id === conjVerb ? ' on' : ''), type: 'button',
        onclick: () => { conjVerb = id; renderReference(); }
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
    return box;
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#reference')) closeReference();
  });

  /* ------------------------------------------------------------------ */
  /* summary                                                             */
  /* ------------------------------------------------------------------ */

  function renderSummary() {
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
        list.appendChild(el('div', { class: 'missed' }, [
          ar(w.w, 'missed-ar'),
          el('span', { class: 'missed-en', text: w.en || w.sub || '' })
        ]));
      });
      wrap.appendChild(el('section', { class: 'panel' }, [
        el('h2', { class: 'panel-title', text: 'Words that tripped you up' }), list
      ]));
    }

    wrap.appendChild(el('div', { class: 'cta-row' }, [
      missed.length
        ? el('button', { class: 'btn primary big', type: 'button', text: 'Practise the ' + missed.length + ' missed', onclick: () => startSession(missed) })
        : el('span', {}),
      el('button', { class: 'btn big', type: 'button', text: 'Another session', onclick: () => startSession() }),
      el('button', { class: 'btn ghost big', type: 'button', text: 'Home', onclick: renderHome })
    ]));

    setScreen(wrap);
  }

  /* ------------------------------------------------------------------ */

  document.addEventListener('DOMContentLoaded', renderHome);
})(typeof window !== 'undefined' ? window : globalThis);
