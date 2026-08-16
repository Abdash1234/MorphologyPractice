# Ṣarf — Arabic morphology practice

A drill app for taking an Arabic word apart the way the Morphology Word Analysis
Chart does it, one question at a time, ending with the meaning.

A word appears. You answer, step by step:

1. **Ism, fiʿl or ḥarf?**
2. **Verbs** — tense (māḍī / muḍāriʿ / amr), iʿrāb of the muḍāriʿ (marfūʿ,
   manṣūb, majzūm, muʾakkad), maʿlūm or majhūl, muthbat or manfī, person,
   gender, number.
   **Nouns** — which kind: maṣdar, ism al-fāʿil, ism al-mafʿūl, ṣifah
   mushabbahah, ism al-tafḍīl, ism al-ẓarf, ism al-ālah, or jāmid — then gender
   and number.
3. **Thulāthī or rubāʿī?**
4. **Mujarrad or mazīd fīh** — and then *which* bāb: one of the six
   (naṣara, ḍaraba, fataḥa, ʿalima, karuma, ḥasiba), or Forms II–X, or the
   rubāʿī patterns.
5. **Ṣaḥīḥ or muʿtall** — and the sub-category: sālim, muḍāʿaf, mahmūz (with the
   position of the hamzah), or mithāl, ajwaf, nāqiṣ, lafīf mafrūq, lafīf maqrūn.
6. **The root** — typed in.
7. **The ṣarf ṣaghīr** — the whole eleven-cell table is shown for that root with
   **the word's own cell left blank**, and you say which cell it is. Answer, and
   the blank fills in.
8. **The translation** — typed from memory, then revealed and self-marked.

Every answer is graded immediately with a one-line explanation, and the chips
under the word keep a running summary of the analysis so far.

## Help while you are stuck

Every question carries a **?** button. It opens the tells for that exact
decision before you answer — how the vowels give away a passive (ḍammah at the
front, fatḥah before the last letter in the muḍāriʿ), how the māḍī vowel narrows
the six gates down, which added letter belongs to which form, how to spot a
lafīf from an ajwaf. Get one wrong and the feedback also offers a link into the
matching page of the reference.

## The reference

A **📖 Reference** button on the home screen and in the top bar of every
question, opening over the drill without losing your place. Seven tabs:

- **The six gates** — each bāb with its vowel pattern, how to recognise it, what
  kind of verbs live there, and example verbs.
- **Forms II–X** — for every form: the shape of the māḍī, muḍāriʿ, maṣdar, ism
  al-fāʿil, ism al-mafʿūl and amr; how to spot it; and **what it does to the
  meaning** — Form II makes a verb transitive or intensive, Form IV is
  causative, Form V takes the effect back onto the subject, Form X is seeking,
  and so on, each with worked examples (عَلِمَ he knew → عَلَّمَ he taught →
  تَعَلَّمَ he learned → اِسْتَعْلَمَ he sought information).
- **Rubāʿī** — faʿlala and its three augmented patterns.
- **Noun patterns** — fāʿil, mafʿūl, ṣifah mushabbahah, tafḍīl, ẓarf, ālah, and
  the fixed maṣdar of every mazīd bāb.
- **Ṣaḥīḥ & muʿtall** — every category with what actually changes in the verb.
- **The 14 forms** — ṣarf kabīr: the full person/gender/number endings for the
  māḍī, muḍāriʿ and amr on the فَعَلَ pattern.
- **Quick spotting guide** — the tells worth memorising, gathered on one page.

## Drilling one thing at a time

"Drill one thing only" on the home screen turns a session into fast reps of a
single question across many words: bāb identification, active/passive,
ṣaḥīḥ/muʿtall category, kind of noun, ṣarf ṣaghīr placement, root, or
translation. Twenty words, one question each.

## Spaced repetition

Every word sits in a Leitner box. Analyse a word with no mistakes and it moves
up a box (1, 2, 4, 8, 16, 32 days); slip on any question and it drops back and
returns sooner. The **Due for review** deck is whatever the boxes say you are
closest to forgetting, most overdue first — that is the deck to open daily once
the vocabulary starts building up.

## Running it

It is plain HTML, CSS and JavaScript — no build step, no dependencies.

- **Simplest:** open `index.html` in a browser.
- **Over a local server** (nicer on a phone on the same wifi):

  ```sh
  python3 -m http.server 8000
  # then visit http://localhost:8000
  ```

- **On your phone anywhere:** switch on GitHub Pages for this repo
  (Settings → Pages → deploy from branch, root folder) and the app is a URL you
  can add to your home screen.

Progress is kept in the browser's local storage — accuracy per word and per
question type, so the home screen can show your weakest areas and the
"weakest words first" switch can put them in front of you sooner.

## Session options

On the home screen:

- **Decks** — everything, verbs only, nouns only, thulāthī mujarrad, mazīd fīh,
  ṣaḥīḥ, muʿtall, or a starter set of the most common words.
- **Length** — 5, 10, 20 words, or the whole deck.
- **What to ask** — switch off whole stages while you are drilling one thing.
  Want nothing but bāb identification? Turn off verb details, root, ṣarf ṣaghīr
  and translation.
- **Ḥarakāt** — turn the vowels off to make it properly hard.

Keyboard: `1`–`9` pick an option, `Enter` moves on.

## What's in the bank

163 words over 44 ṣarf ṣaghīr tables, covering all six abwāb of thulāthī
mujarrad, Forms II–X, rubāʿī mujarrad and mazīd, muḍāʿaf, all three positions of
mahmūz, and every muʿtall category including both lafīfs.

## Adding your own words

Vocabulary lives in two files.

**`src/paradigms.js`** — one entry per root + bāb, holding the eleven cells of
its ṣarf ṣaghīr. Use `'—'` for a cell the verb does not have (an intransitive
verb has no passive or ism al-mafʿūl):

```js
'ktb-I': {
  root: 'ك ت ب', baabId: 'nasara', meaning: 'to write',
  madi: 'كَتَبَ', mudari: 'يَكْتُبُ', masdar: 'كِتَابَةً',
  madiMajhul: 'كُتِبَ', mudariMajhul: 'يُكْتَبُ',
  ismFail: 'كَاتِبٌ', ismMaful: 'مَكْتُوبٌ',
  amr: 'اُكْتُبْ', nahi: 'لَا تَكْتُبْ', zarf: 'مَكْتَبٌ', aalah: '—'
},
```

Then add its structure to the `structures` table lower down the same file:
`[letters, augmentation, soundness, sub-type, (hamzah position)]`, e.g.
`'ktb-I': ['thulathi', 'mujarrad', 'sahih', 'salim'],`.

**`src/words.js`** — one entry per word form. `p` points at the paradigm and
`slot` says which of its cells this word is:

```js
v({ id: 'ktb-mud-3ms', w: 'يَكْتُبُ', tr: 'yaktubu', en: 'he writes',
    p: 'ktb-I', slot: 'mudari',
    tense: 'mudari', mood: 'marfu', person: 'ghaib' }),
```

`v()` fills in the usual verb defaults (maʿlūm, muthbat, mudhakkar, mufrad), so
you only state what differs; `n()` does the same for nouns. Use
`gender: 'any'` for 1st-person forms, which do not show gender — the app then
skips that question. An optional `note:` is shown with the answer.

Check your additions with:

```sh
node tools/validate.js
```

It verifies that every word points at a real paradigm and a real cell, that no
word claims a cell marked `'—'`, that every question it generates has an answer
inside its option list, that root letter counts match thulāthī/rubāʿī, that
every question has a **?** hint behind it, and that each focus mode still has
enough words to drill.

## Files

| file | what it holds |
| --- | --- |
| `src/taxonomy.js` | the chart itself — every category, its Arabic term, English, and a one-line explanation |
| `src/reference.js` | the "?" hints and the browsable reference (gates, forms, patterns, spotting guide) |
| `src/paradigms.js` | the ṣarf ṣaghīr tables and the structural facts of each root |
| `src/words.js` | the word bank |
| `src/engine.js` | turns a word into its question sequence, grades answers, keeps score |
| `src/store.js` | settings and progress in local storage |
| `src/app.js` | screens and rendering |
| `tools/validate.js` | data integrity check |
