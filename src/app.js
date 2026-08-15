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

    /* deck picker */
    const deckGrid = el('div', { class: 'deck-grid' });
    T.decks.forEach((d) => {
      const count = E.deckWords(d.id).length;
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
        el('span', { class: 'deck-count', text: count + ' words' })
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

    wrap.appendChild(el('section', { class: 'panel' }, [
      el('h2', { class: 'panel-title', text: 'Session' }), lenRow, toggles,
      el('h2', { class: 'panel-title', text: 'What to ask' }), groupRow
    ]));

    wrap.appendChild(el('div', { class: 'cta-row' }, [
      el('button', { class: 'btn primary big', type: 'button', text: 'Start practice', onclick: startSession })
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
      el('span', { class: 'counter', text: 'Step ' + (doneSteps + 1) + ' / ' + session.steps.length })
    ]));

    const pct = Math.round((doneSteps / session.steps.length) * 100);
    wrap.appendChild(el('div', { class: 'progress' }, [el('div', { class: 'progress-fill', style: 'width:' + pct + '%' })]));

    /* the word */
    wrap.appendChild(el('div', { class: 'word-card' }, [
      ar(display(word), 'word'),
      el('div', { class: 'answered-so-far' }, answeredChips())
    ]));

    /* the question */
    wrap.appendChild(el('div', { class: 'question' }, [
      el('h2', { class: 'q-en', text: step.q }),
      step.qAr ? ar(step.qAr, 'q-ar') : el('span', {})
    ]));

    if (step.kind === 'choice') wrap.appendChild(renderChoice(step));
    else if (step.kind === 'text') wrap.appendChild(renderText(step));
    else if (step.kind === 'sarf') wrap.appendChild(renderSarf(step, word));
    else if (step.kind === 'translate') wrap.appendChild(renderTranslate(step, word));

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
      showFeedback(correct, step.answer, correct ? '' : 'Say the three letters of the māḍī with no additions and no vowels.');
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
      if (word.note) fb.appendChild(el('div', { class: 'fb-hint', text: word.note }));
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
      fb.appendChild(el('div', { class: 'fb-hint word-note', text: word.note }));
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
        const w = MP.words.find((x) => x.id === id);
        if (!w) return;
        list.appendChild(el('div', { class: 'missed' }, [
          ar(w.w, 'missed-ar'),
          el('span', { class: 'missed-en', text: w.en })
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
