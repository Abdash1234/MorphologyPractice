/*
 * editor.js — the "My words" screen: add roots and words from inside the app.
 *
 * Adding a root generates its whole ṣarf ṣaghīr from the pattern, so the only
 * typing is the root letters, the bāb and a meaning. Adding a word off an
 * existing root pre-fills the Arabic from the cell you pick and guesses the
 * grammar for you; you correct anything it got wrong.
 */
(function (global) {
  'use strict';

  const MP = global.MP;
  const T = MP.taxonomy;

  /* what picking a ṣarf ṣaghīr cell implies about the word */
  const SLOT_DEFAULTS = {
    madi: { type: 'fil', tense: 'madi', voice: 'malum', pol: 'muthbat', person: 'ghaib', gender: 'mudhakkar', number: 'mufrad' },
    mudari: { type: 'fil', tense: 'mudari', mood: 'marfu', voice: 'malum', pol: 'muthbat', person: 'ghaib', gender: 'mudhakkar', number: 'mufrad' },
    madiMajhul: { type: 'fil', tense: 'madi', voice: 'majhul', pol: 'muthbat', person: 'ghaib', gender: 'mudhakkar', number: 'mufrad' },
    mudariMajhul: { type: 'fil', tense: 'mudari', mood: 'marfu', voice: 'majhul', pol: 'muthbat', person: 'ghaib', gender: 'mudhakkar', number: 'mufrad' },
    amr: { type: 'fil', tense: 'amr', voice: 'malum', pol: 'muthbat', person: 'mukhatab', gender: 'mudhakkar', number: 'mufrad' },
    nahi: { type: 'fil', tense: 'mudari', mood: 'majzum', voice: 'malum', pol: 'manfi', person: 'mukhatab', gender: 'mudhakkar', number: 'mufrad' },
    masdar: { type: 'ism', ismType: 'masdar', gender: 'mudhakkar', number: 'mufrad' },
    ismFail: { type: 'ism', ismType: 'ismFail', gender: 'mudhakkar', number: 'mufrad' },
    ismMaful: { type: 'ism', ismType: 'ismMaful', gender: 'mudhakkar', number: 'mufrad' },
    zarf: { type: 'ism', ismType: 'ismZarf', gender: 'mudhakkar', number: 'mufrad' },
    aalah: { type: 'ism', ismType: 'ismAalah', gender: 'mudhakkar', number: 'mufrad' }
  };

  const BAAB_GROUPS = [
    { id: 'baabThulathiMujarrad', name: 'Thulāthī mujarrad — the six gates', letters: 'thulathi', augmentation: 'mujarrad' },
    { id: 'baabThulathiMazeed', name: 'Thulāthī mazīd fīh — Forms II–X', letters: 'thulathi', augmentation: 'mazeed' },
    { id: 'baabRubaiMujarrad', name: 'Rubāʿī mujarrad', letters: 'rubai', augmentation: 'mujarrad' },
    { id: 'baabRubaiMazeed', name: 'Rubāʿī mazīd fīh', letters: 'rubai', augmentation: 'mazeed' }
  ];

  /* draft state, kept between renders of the screen */
  let draft = null;      // the generated paradigm being edited
  let editingWord = null;
  let notice = null;

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.keys(attrs || {}).forEach((k) => {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach((c) => c && node.appendChild(c));
    return node;
  }

  function field(labelText, control, help) {
    return el('label', { class: 'field' }, [
      el('span', { class: 'field-label', text: labelText }),
      control,
      help ? el('span', { class: 'field-help', text: help }) : null
    ]);
  }

  function select(options, value, onChange, attrs) {
    const sel = el('select', Object.assign({ class: 'input' }, attrs || {}));
    options.forEach((o) => {
      const opt = el('option', { value: o.value, text: o.label });
      if (o.value === value) opt.selected = true;
      sel.appendChild(opt);
    });
    if (onChange) sel.addEventListener('change', () => onChange(sel.value));
    return sel;
  }

  function groupOptions(groupId) {
    return T.groups[groupId].map((o) => ({ value: o.id, label: o.ar + ' — ' + o.en }));
  }

  function input(value, placeholder, arabic) {
    return el('input', {
      class: 'input' + (arabic ? ' ar' : ''),
      type: 'text',
      dir: arabic ? 'rtl' : 'ltr',
      value: value || '',
      placeholder: placeholder || '',
      autocomplete: 'off',
      spellcheck: 'false'
    });
  }

  function say(kind, text) {
    notice = { kind: kind, text: text };
  }

  /* ------------------------------------------------------------------ */

  function render(host, onBack) {
    const wrap = el('div', { class: 'screen editor' });

    wrap.appendChild(el('h1', { class: 'view-title', text: 'My words' }));
    wrap.appendChild(el('p', { class: 'lede', text: 'Anything you add here joins the bank: it gets the same analysis questions, the same ṣarf ṣaghīr, the same drills and the same review schedule as the built-in words. It is kept in this browser, so export a copy if you want it elsewhere.' }));

    if (notice) {
      wrap.appendChild(el('div', { class: 'notice ' + notice.kind, text: notice.text }));
      notice = null;
    }

    wrap.appendChild(renderMine(host, onBack));
    wrap.appendChild(renderAddWord(host, onBack));
    wrap.appendChild(renderAddRoot(host, onBack));
    wrap.appendChild(renderBackup(host, onBack));

    host.innerHTML = '';
    host.appendChild(wrap);
    global.scrollTo(0, 0);
  }

  const refresh = (host, onBack) => render(host, onBack);

  /* ---- what you have added so far ---- */

  function renderMine(host, onBack) {
    const data = MP.custom.load();
    const panel = el('section', { class: 'panel' }, [
      el('h2', { class: 'panel-title', text: 'Yours so far — ' + data.words.length + ' words, ' + Object.keys(data.paradigms).length + ' roots' })
    ]);

    if (!data.words.length && !Object.keys(data.paradigms).length) {
      panel.appendChild(el('p', { class: 'muted small', text: 'Nothing yet. Add a word below — or add a root first if the word comes from one the bank does not have.' }));
      return panel;
    }

    Object.keys(data.paradigms).forEach((id) => {
      const p = data.paradigms[id];
      panel.appendChild(el('div', { class: 'mine-row' }, [
        el('span', { class: 'ar mine-ar', dir: 'rtl', text: p.madi + ' ' + p.mudari }),
        el('span', { class: 'mine-en', text: p.root + ' · ' + p.meaning }),
        el('button', {
          class: 'btn ghost small', type: 'button', text: 'Delete',
          onclick: () => {
            const n = MP.custom.removeParadigm(id);
            say('warn', 'Root removed' + (n ? ', along with ' + n + ' word(s) built on it.' : '.'));
            refresh(host, onBack);
          }
        })
      ]));
    });

    data.words.forEach((w) => {
      panel.appendChild(el('div', { class: 'mine-row' }, [
        el('span', { class: 'ar mine-ar', dir: 'rtl', text: w.w }),
        el('span', { class: 'mine-en', text: w.en + (MP.sentences[w.id] ? ' · has a sentence' : '') }),
        el('button', {
          class: 'btn ghost small', type: 'button', text: 'Edit',
          onclick: () => { editingWord = w.id; refresh(host, onBack); }
        }),
        el('button', {
          class: 'btn ghost small', type: 'button', text: 'Delete',
          onclick: () => { MP.custom.removeWord(w.id); say('warn', 'Word removed.'); refresh(host, onBack); }
        })
      ]));
    });
    return panel;
  }

  /* ---- add or edit a word ---- */

  function renderAddWord(host, onBack) {
    const existing = editingWord ? MP.custom.load().words.find((w) => w.id === editingWord) : null;
    const sentence = existing ? MP.sentences[existing.id] : null;

    const state = Object.assign({
      w: '', tr: '', en: '', p: '', slot: '', type: 'fil',
      tense: 'madi', mood: 'marfu', voice: 'malum', pol: 'muthbat',
      person: 'ghaib', gender: 'mudhakkar', number: 'mufrad', ismType: 'ismFail'
    }, existing || {});

    const panel = el('section', { class: 'panel' }, [
      el('h2', { class: 'panel-title', text: existing ? 'Edit this word' : 'Add a word' })
    ]);

    const arInput = input(state.w, 'الكَلِمَة بِالحَرَكَات', true);
    const trInput = input(state.tr, 'transliteration (optional)');
    const enInput = input(state.en, 'what it means in English');
    const sentAr = input(sentence ? sentence.ar : '', 'a sentence using it (optional)', true);
    const sentEn = input(sentence ? sentence.en : '', 'what the sentence means');

    const grammarBox = el('div', { class: 'grid-2' });
    const slotSelect = el('span', {});

    function paradigmOptions() {
      const ids = Object.keys(MP.paradigms).sort();
      return [{ value: '', label: '— none (jāmid noun or ḥarf) —' }].concat(
        ids.map((id) => {
          const p = MP.paradigms[id];
          return { value: id, label: p.root + ' · ' + p.madi + ' — ' + p.meaning };
        })
      );
    }

    function slotOptions() {
      const p = state.p ? MP.paradigms[state.p] : null;
      const base = [{ value: '', label: '— not one of the eleven cells —' }];
      if (!p) return base;
      return base.concat(
        T.sarfSlots.filter((s) => p[s.id] !== MP.NOT_USED)
          .map((s) => ({ value: s.id, label: s.ar + ' — ' + s.en + '  (' + p[s.id] + ')' }))
      );
    }

    function paintSlots() {
      const sel = select(slotOptions(), state.slot, (v) => {
        state.slot = v;
        const p = state.p ? MP.paradigms[state.p] : null;
        if (v && p) {
          arInput.value = p[v];                       // fill the word in for them
          Object.assign(state, SLOT_DEFAULTS[v] || {});
          paintGrammar();
        }
      });
      slotSelect.innerHTML = '';
      slotSelect.appendChild(sel);
    }

    function paintGrammar() {
      grammarBox.innerHTML = '';
      grammarBox.appendChild(field('Word type', select(groupOptions('wordType'), state.type, (v) => {
        state.type = v;
        paintGrammar();
      })));

      if (state.type === 'fil') {
        grammarBox.appendChild(field('Tense', select(groupOptions('tense'), state.tense, (v) => {
          state.tense = v;
          paintGrammar();
        })));
        if (state.tense === 'mudari') {
          grammarBox.appendChild(field('Iʿrāb', select(groupOptions('mood'), state.mood, (v) => (state.mood = v))));
        }
        grammarBox.appendChild(field('Voice', select(groupOptions('voice'), state.voice, (v) => (state.voice = v))));
        grammarBox.appendChild(field('Polarity', select(groupOptions('polarity'), state.pol, (v) => (state.pol = v))));
        grammarBox.appendChild(field('Person', select(groupOptions('person'), state.person, (v) => (state.person = v))));
      }
      if (state.type === 'ism') {
        grammarBox.appendChild(field('Kind of noun', select(groupOptions('ismType'), state.ismType, (v) => (state.ismType = v))));
      }
      if (state.type !== 'harf') {
        grammarBox.appendChild(field('Gender', select(
          groupOptions('gender').concat([{ value: 'any', label: 'either — 1st person' }]),
          state.gender, (v) => (state.gender = v)
        )));
        grammarBox.appendChild(field('Number', select(groupOptions('number'), state.number, (v) => (state.number = v))));
      }
    }

    paintSlots();
    paintGrammar();

    panel.appendChild(field('The word', arInput, 'Write it with its ḥarakāt — that is what you will be drilled on.'));
    panel.appendChild(el('div', { class: 'grid-2' }, [
      field('Translation', enInput),
      field('Transliteration', trInput)
    ]));
    panel.appendChild(field('Which root is it from?', select(paradigmOptions(), state.p, (v) => {
      state.p = v;
      state.slot = '';
      paintSlots();
    }), 'Pick the root and then the cell — the word and its grammar fill themselves in.'));
    panel.appendChild(field('Which cell of the ṣarf ṣaghīr?', slotSelect));
    panel.appendChild(grammarBox);
    panel.appendChild(el('div', { class: 'grid-2' }, [
      field('Sentence (optional)', sentAr, 'Use {} where the word goes, or just write the sentence with the word in it.'),
      field('Sentence meaning', sentEn)
    ]));

    const errorBox = el('div', { class: 'form-errors' });
    panel.appendChild(errorBox);

    panel.appendChild(el('div', { class: 'cta-row' }, [
      el('button', {
        class: 'btn primary', type: 'button', text: existing ? 'Save changes' : 'Add the word',
        onclick: () => {
          const word = Object.assign({}, state, {
            w: arInput.value.trim(),
            tr: trInput.value.trim(),
            en: enInput.value.trim(),
            p: state.p || null,
            slot: state.slot || null
          });
          if (word.type !== 'fil') { delete word.tense; delete word.mood; delete word.voice; delete word.pol; delete word.person; }
          if (word.type !== 'ism') delete word.ismType;
          if (word.tense !== 'mudari') delete word.mood;

          const result = MP.custom.saveWord(
            word,
            { ar: sentAr.value, en: sentEn.value },
            existing ? existing.id : null
          );
          errorBox.innerHTML = '';
          if (!result.ok) {
            result.errors.forEach((e) => errorBox.appendChild(el('p', { class: 'form-error', text: e })));
            return;
          }
          editingWord = null;
          say('good', 'Saved. It is in the bank now — pick the "Mine" deck to drill it.');
          refresh(host, onBack);
        }
      }),
      existing ? el('button', {
        class: 'btn ghost', type: 'button', text: 'Cancel',
        onclick: () => { editingWord = null; refresh(host, onBack); }
      }) : null
    ]));
    return panel;
  }

  /* ---- add a root, with the ṣarf ṣaghīr generated for you ---- */

  function renderAddRoot(host, onBack) {
    const panel = el('section', { class: 'panel' }, [
      el('h2', { class: 'panel-title', text: 'Add a root' }),
      el('p', { class: 'muted small', text: 'Type the root letters and pick the bāb — the whole ṣarf ṣaghīr is built from the pattern, and you correct anything that needs it before saving.' })
    ]);

    const rootInput = input(draft ? draft.root : '', 'ن ص ر', true);
    const meaningInput = input(draft ? draft.meaning : '', 'to help');

    let baabId = draft ? draft.baabId : 'nasara';
    const baabSelect = el('select', { class: 'input' });
    BAAB_GROUPS.forEach((g) => {
      const optGroup = el('optgroup', { label: g.name });
      T.groups[g.id].forEach((o) => {
        const opt = el('option', { value: o.id, text: o.ar + ' — ' + o.en });
        if (o.id === baabId) opt.selected = true;
        optGroup.appendChild(opt);
      });
      baabSelect.appendChild(optGroup);
    });
    baabSelect.addEventListener('change', () => (baabId = baabSelect.value));

    panel.appendChild(el('div', { class: 'grid-2' }, [
      field('Root letters', rootInput, 'Separated by spaces: ن ص ر'),
      field('Meaning', meaningInput, 'The plain meaning of the bare verb.')
    ]));
    panel.appendChild(field('Bāb / form', baabSelect));

    const preview = el('div', { class: 'preview' });
    const errorBox = el('div', { class: 'form-errors' });

    function paintPreview() {
      preview.innerHTML = '';
      if (!draft) return;

      (draft.warnings || []).forEach((wmsg) => {
        preview.appendChild(el('p', { class: 'notice warn', text: wmsg }));
      });

      preview.appendChild(el('div', { class: 'grid-2' }, [
        field('Ṣaḥīḥ / muʿtall', select(groupOptions('soundness'), draft.soundness, (v) => {
          draft.soundness = v;
          draft.subtype = T.groups[v === 'sahih' ? 'sahihType' : 'mutalType'][0].id;
          paintPreview();
        })),
        field('Sub-category', select(
          groupOptions(draft.soundness === 'sahih' ? 'sahihType' : 'mutalType'),
          draft.subtype, (v) => (draft.subtype = v)
        ))
      ]));

      const grid = el('div', { class: 'cells' });
      T.sarfSlots.forEach((slot) => {
        const cell = input(draft[slot.id], '—', true);
        cell.addEventListener('input', () => (draft[slot.id] = cell.value.trim() || MP.NOT_USED));
        grid.appendChild(el('div', { class: 'cell-row' }, [
          el('span', { class: 'cell-label' }, [
            el('span', { class: 'ar', dir: 'rtl', text: slot.ar }),
            el('span', { class: 'cell-label-en', text: slot.en })
          ]),
          cell
        ]));
      });
      preview.appendChild(grid);

      preview.appendChild(el('div', { class: 'cta-row' }, [
        el('button', {
          class: 'btn primary', type: 'button', text: 'Save this root',
          onclick: () => {
            const clean = Object.assign({}, draft);
            delete clean.warnings;
            delete clean.generated;
            const result = MP.custom.saveParadigm(clean);
            errorBox.innerHTML = '';
            if (!result.ok) {
              result.errors.forEach((e) => errorBox.appendChild(el('p', { class: 'form-error', text: e })));
              return;
            }
            draft = null;
            say('good', 'Root saved. Add words off it above — its cells are now in the list.');
            refresh(host, onBack);
          }
        }),
        el('button', { class: 'btn ghost', type: 'button', text: 'Discard', onclick: () => { draft = null; paintPreview(); } })
      ]));
    }

    panel.appendChild(el('div', { class: 'cta-row' }, [
      el('button', {
        class: 'btn', type: 'button', text: 'Generate the ṣarf ṣaghīr',
        onclick: () => {
          const letters = rootInput.value.trim().split(/\s+/).filter(Boolean);
          errorBox.innerHTML = '';
          if (letters.length < 3 || letters.length > 4) {
            errorBox.appendChild(el('p', { class: 'form-error', text: 'Give three or four root letters, separated by spaces.' }));
            return;
          }
          draft = MP.generator.draftParadigm(letters, baabSelect.value, meaningInput.value.trim());
          if (!draft) {
            errorBox.appendChild(el('p', { class: 'form-error', text: 'No pattern is known for that bāb.' }));
            return;
          }
          paintPreview();
        }
      })
    ]));
    panel.appendChild(errorBox);
    panel.appendChild(preview);
    paintPreview();
    return panel;
  }

  /* ---- export / import ---- */

  function renderBackup(host, onBack) {
    const panel = el('section', { class: 'panel' }, [
      el('h2', { class: 'panel-title', text: 'Backup & transfer' }),
      el('p', { class: 'muted small', text: 'Your words live in this browser only. Export the JSON to keep a copy, move it to your phone, or send it on to be merged into the app itself.' })
    ]);

    const box = el('textarea', { class: 'input json-box', rows: '8', spellcheck: 'false' });
    box.value = MP.custom.exportJSON();

    const status = el('div', { class: 'form-errors' });

    panel.appendChild(box);
    panel.appendChild(el('div', { class: 'cta-row' }, [
      el('button', {
        class: 'btn', type: 'button', text: 'Copy',
        onclick: () => {
          box.select();
          try {
            document.execCommand('copy');
            status.textContent = 'Copied.';
          } catch (e) {
            status.textContent = 'Select the text and copy it by hand.';
          }
        }
      }),
      el('button', {
        class: 'btn', type: 'button', text: 'Import (merge)',
        onclick: () => {
          const result = MP.custom.importJSON(box.value, 'merge');
          status.innerHTML = '';
          if (!result.ok) {
            result.errors.forEach((e) => status.appendChild(el('p', { class: 'form-error', text: e })));
            return;
          }
          say(result.errors.length ? 'warn' : 'good',
            'Imported ' + result.added + ' entries' + (result.errors.length ? ', ' + result.errors.length + ' skipped.' : '.'));
          refresh(host, onBack);
        }
      }),
      el('button', {
        class: 'btn ghost', type: 'button', text: 'Clear everything',
        onclick: () => {
          if (!global.confirm('Delete all of your own words and roots?')) return;
          MP.custom.save({ paradigms: {}, words: [], sentences: {} });
          say('warn', 'Your additions have been cleared.');
          refresh(host, onBack);
        }
      })
    ]));
    panel.appendChild(status);
    return panel;
  }

  MP.editor = { render };
})(typeof window !== 'undefined' ? window : globalThis);
