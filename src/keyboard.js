/*
 * keyboard.js — an on-screen Arabic keypad for the typed answers.
 *
 * Laid out in alphabet order rather than the ض ص ث qwerty-style order: when
 * you are still learning, hunting for a letter you know by its place in the
 * alphabet is far quicker than hunting for it by muscle memory you do not
 * have yet.
 *
 * Ḥarakāt are on their own row and are entirely optional — answers are
 * checked on the letters, so vowels only matter if you want the practice.
 */
(function (global) {
  'use strict';

  const MP = (global.MP = global.MP || {});

  const LETTERS = [
    ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ'],
    ['د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص'],
    ['ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق'],
    ['ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي']
  ];

  const EXTRAS = ['ء', 'أ', 'إ', 'آ', 'ؤ', 'ئ', 'ة', 'ى'];

  const HARAKAT = [
    { ch: 'َ', name: 'fatḥah' },
    { ch: 'ِ', name: 'kasrah' },
    { ch: 'ُ', name: 'ḍammah' },
    { ch: 'ْ', name: 'sukūn' },
    { ch: 'ّ', name: 'shaddah' },
    { ch: 'ً', name: 'fatḥatān' },
    { ch: 'ٍ', name: 'kasratān' },
    { ch: 'ٌ', name: 'ḍammatān' }
  ];

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.keys(attrs || {}).forEach((k) => {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach((c) => c && node.appendChild(c));
    return node;
  }

  /* insert at the caret, so it behaves like a keyboard rather than an append */
  function insert(input, text) {
    const start = input.selectionStart === null ? input.value.length : input.selectionStart;
    const end = input.selectionEnd === null ? input.value.length : input.selectionEnd;
    input.value = input.value.slice(0, start) + text + input.value.slice(end);
    const at = start + text.length;
    input.setSelectionRange(at, at);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  }

  function backspace(input) {
    const start = input.selectionStart === null ? input.value.length : input.selectionStart;
    const end = input.selectionEnd === null ? input.value.length : input.selectionEnd;
    if (start !== end) {
      input.value = input.value.slice(0, start) + input.value.slice(end);
      input.setSelectionRange(start, start);
    } else if (start > 0) {
      input.value = input.value.slice(0, start - 1) + input.value.slice(start);
      input.setSelectionRange(start - 1, start - 1);
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.focus();
  }

  /*
   * Build a keypad bound to an input. `opts.onEnter` is called when the tick
   * is pressed, so the keypad can submit the answer.
   */
  function attach(input, opts) {
    const options = opts || {};
    const pad = el('div', { class: 'arabic-kb-panel' });

    const key = (ch, cls, label) => el('button', {
      class: 'kb-key ' + (cls || ''),
      type: 'button',
      tabindex: '-1',
      title: label || '',
      /* mousedown would steal focus from the input before the click lands */
      onmousedown: (e) => e.preventDefault(),
      onclick: () => insert(input, ch)
    }, [el('span', { class: 'ar', dir: 'rtl', text: ch })]);

    LETTERS.forEach((row) => {
      pad.appendChild(el('div', { class: 'kb-row', dir: 'rtl' }, row.map((ch) => key(ch))));
    });

    pad.appendChild(el('div', { class: 'kb-row', dir: 'rtl' }, EXTRAS.map((ch) => key(ch, 'extra'))));

    /* ḥarakāt, clearly marked as optional */
    const harakatRow = el('div', { class: 'kb-row harakat', dir: 'rtl' },
      HARAKAT.map((h) => key(h.ch, 'haraka', h.name)));

    const controls = el('div', { class: 'kb-row controls' }, [
      el('button', {
        class: 'kb-key wide', type: 'button', tabindex: '-1', text: '␣',
        onmousedown: (e) => e.preventDefault(),
        onclick: () => insert(input, ' ')
      }),
      el('button', {
        class: 'kb-key wide', type: 'button', tabindex: '-1', text: '⌫',
        onmousedown: (e) => e.preventDefault(),
        onclick: () => backspace(input)
      }),
      el('button', {
        class: 'kb-key wide', type: 'button', tabindex: '-1', text: 'clear',
        onmousedown: (e) => e.preventDefault(),
        onclick: () => {
          input.value = '';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.focus();
        }
      }),
      options.onEnter ? el('button', {
        class: 'kb-key wide go', type: 'button', tabindex: '-1', text: '✓',
        onmousedown: (e) => e.preventDefault(),
        onclick: () => options.onEnter()
      }) : null
    ]);

    const harakatToggle = el('button', {
      class: 'btn ghost small', type: 'button', text: 'Ḥarakāt +',
      onclick: () => {
        const on = harakatRow.classList.toggle('open');
        harakatToggle.textContent = on ? 'Ḥarakāt −' : 'Ḥarakāt +';
      }
    });

    const wrap = el('div', { class: 'arabic-kb' }, [
      el('div', { class: 'arabic-kb-head' }, [
        el('span', { class: 'muted small', text: 'Ḥarakāt are optional — answers are checked on the letters.' }),
        harakatToggle
      ]),
      pad
    ]);
    pad.appendChild(harakatRow);
    pad.appendChild(controls);
    return wrap;
  }

  MP.keyboard = { attach, insert, backspace, LETTERS, EXTRAS, HARAKAT };
})(typeof window !== 'undefined' ? window : globalThis);
