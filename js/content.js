'use strict';
// Extended question content for Englisch and Deutsch (Klasse 7, Gymnasium NRW, Green Line 3).
// Loaded after js/questions.js; overrides/extends ENGLISCH, DEUTSCH and SUBJECTS.
(function () {
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const fill = (t, o) => t.replace(/\{(\w+)\}/g, (m, k) => (o[k] !== undefined ? o[k] : m));
  const uniq = (correct, pool) => {
    const out = [];
    for (const x of pool) if (x && x !== correct && !out.includes(x)) out.push(x);
    return out;
  };
  // Build wrong choices: keep the given order of priority but shuffle within the first n candidates.
  const wr = (correct, pool, n = 3) => shuffle(uniq(correct, pool)).slice(0, n);

  // ================================================================ ENGLISCH helpers
  const PR = {
    m: { p: 'he', be: 'is', was: 'was', have: 'has', do: 'does', pos: 'his', obj: 'him', refl: 'himself', t3: true },
    f: { p: 'she', be: 'is', was: 'was', have: 'has', do: 'does', pos: 'her', obj: 'her', refl: 'herself', t3: true },
    pl: { p: 'they', be: 'are', was: 'were', have: 'have', do: 'do', pos: 'their', obj: 'them', refl: 'themselves', t3: false },
    I: { p: 'I', be: 'am', was: 'was', have: 'have', do: 'do', pos: 'my', obj: 'me', refl: 'myself', t3: false },
    we: { p: 'we', be: 'are', was: 'were', have: 'have', do: 'do', pos: 'our', obj: 'us', refl: 'ourselves', t3: false },
    you: { p: 'you', be: 'are', was: 'were', have: 'have', do: 'do', pos: 'your', obj: 'you', refl: null, t3: false },
  };
  const subj = (s, g) => ({ s, g, ...PR[g] });
  const MALE = ['Tom', 'Ben', 'Paul', 'Jonas', 'my dad', 'my brother', 'Kleindienst', 'Haaland', 'Harry Kane', 'Hugo Bolin', 'Jens Castrop', 'Bruno Fernandes'];
  const FEMALE = ['Lisa', 'Emma', 'Mia', 'Sophie', 'my mum', 'my sister', 'Mrs Miller'];
  const PLURAL = ['my friends', 'the players', 'the twins', 'my parents'];
  const SUBJ = [subj('I', 'I'), subj('we', 'we'),
    ...MALE.map(s => subj(s, 'm')), ...FEMALE.map(s => subj(s, 'f')), ...PLURAL.map(s => subj(s, 'pl'))];
  const SUBJ_PEOPLE = SUBJ.filter(s => !['Haaland', 'Harry Kane', 'Bruno Fernandes'].includes(s.s));
  const NEG = { is: "isn't", are: "aren't", was: "wasn't", were: "weren't", has: "hasn't", have: "haven't",
    does: "doesn't", do: "don't", did: "didn't", can: "can't", will: "won't", am: 'am not' };
  const otherHave = S => (S.have === 'has' ? 'have' : 'has');
  const otherBe = S => (S.be === 'is' ? 'are' : 'is');
  const reg = v => regularize(v);
  const en = topic => (q, c, w, e) => make('englisch', topic, q, c, w, e);
  const fillS = (t, S) => fill(t, { pos: S.pos, obj: S.obj, P: cap(S.p), p: S.p });

  // ---------------------------------------------------------------- irregular verbs
  // inf past pp | German | phrase for example sentences | x = no present-perfect sentence
  const IRR = [
    'become became become|werden|a goalkeeper', 'begin began begun|beginnen|a new book',
    'bite bit bitten|beißen|into an apple', 'blow blew blown|blasen, pusten|out the candles',
    'break broke broken|brechen, kaputt machen|a window', 'bring brought brought|bringen|a cake to school',
    'build built built|bauen|a model plane', 'buy bought bought|kaufen|new football boots',
    'catch caught caught|fangen|the ball', 'choose chose chosen|wählen, aussuchen|a new shirt',
    'come came come|kommen|home', 'cut cut cut|schneiden|the cake',
    'dig dug dug|graben|a hole in the garden', 'do did done|tun, machen|{pos} homework',
    'draw drew drawn|zeichnen|a Boeing 747', 'drink drank drunk|trinken|a glass of milk',
    'drive drove driven|fahren (Auto)|to the airport', 'eat ate eaten|essen|a huge pizza',
    'fall fell fallen|fallen|off the wall', 'feed fed fed|füttern|the cat',
    'feel felt felt|fühlen|much better', 'fight fought fought|kämpfen|for the ball',
    'find found found|finden|the missing ball', 'fly flew flown|fliegen|to London',
    'forget forgot forgotten|vergessen|{pos} keys', 'forgive forgave forgiven|verzeihen|{pos} friends',
    'get got got|bekommen|a new phone', 'give gave given|geben|the coach a present',
    'go went gone|gehen|to the stadium', 'have had had|haben|a great time',
    'hear heard heard|hören|the news', 'hide hid hidden|verstecken|the presents',
    'hit hit hit|schlagen, treffen|the post', 'hold held held|halten|the trophy',
    'hurt hurt hurt|verletzen|{pos} knees', 'keep kept kept|behalten|the ball',
    'know knew known|wissen, kennen|the answer|x', 'lead led led|führen|the team',
    'leave left left|verlassen|the house early', 'lend lent lent|verleihen|a friend some money',
    'let let let|lassen|the dog out', 'lose lost lost|verlieren|the tickets',
    'make made made|machen|a cake', 'meet met met|treffen|{pos} friends',
    'pay paid paid|bezahlen|for the tickets', 'put put put|legen, stellen|{pos} boots in the bag',
    'read read read|lesen|a book about planes', 'ride rode ridden|reiten, Rad fahren|a horse',
    'ring rang rung|klingeln|the bell', 'run ran run|rennen|to the bus stop',
    'say said said|sagen|hello', 'see saw seen|sehen|the Beluga',
    'sell sold sold|verkaufen|{pos} old toys', 'send sent sent|schicken|a message',
    'shake shook shaken|schütteln|hands with the coach', 'shoot shot shot|schießen|at the goal',
    'shut shut shut|schließen|the door', 'sing sang sung|singen|a song',
    'sit sat sat|sitzen|in the front row', 'sleep slept slept|schlafen|for ten hours',
    'speak spoke spoken|sprechen|to the coach', 'spend spent spent|ausgeben (Geld)|all {pos} money',
    'stand stood stood|stehen|in the rain', 'steal stole stolen|stehlen|the ball from the striker',
    'swim swam swum|schwimmen|in the lake', 'take took taken|nehmen|the bus',
    'teach taught taught|unterrichten, beibringen|the kids a trick', 'tell told told|erzählen|a joke',
    'think thought thought|denken|about the game', 'throw threw thrown|werfen|the ball',
    'understand understood understood|verstehen|the question', 'wear wore worn|tragen (Kleidung)|warm clothes',
    'win won won|gewinnen|the game', 'write wrote written|schreiben|a letter',
    'beat beat beaten|besiegen|the other team',
  ].map(s => {
    const [forms, de, frag, flag] = s.split('|');
    const [inf, past, pp] = forms.split(' ');
    return { inf, past, pp, de, frag, noPP: flag === 'x' };
  });
  const verbFakes = v => [reg(v.inf), v.inf + v.inf.slice(-1) + 'ed', v.past + 'ed', v.inf + 'en', v.inf + 's', v.pp + 'ed']
    .filter(x => x !== v.past && x !== v.pp);
  const VERB_SUBJ = ['I', 'we', 'Tom', 'Lisa', 'my parents', 'Ben', 'Emma', 'Kleindienst', 'my brother', 'the twins']
    .map(s => SUBJ.find(x => x.s === s));

  ENGLISCH.verbs = function () {
    const E = en('verbs');
    const t = rnd(0, 9);
    if (t === 9) {
      const S = pick(VERB_SUBJ);
      if (Math.random() < 0.5) {
        const other = S.was === 'was' ? 'were' : 'was';
        const tail = pick(['at the stadium yesterday', 'very tired last night', 'in London last week', 'at school on Monday']);
        return E(`${cap(S.s)} ___ (be) ${tail}.`, S.was, [other, 'been', S.be],
          `Simple past von be: I/he/she/it was – you/we/they were.`);
      }
      return E(`${cap(S.s)} ${S.have} already ___ (be) to London.`, 'been', ['was', 'were', 'be', 'being'],
        'be – was/were – been: nach have/has steht die 3. Form „been“.');
    }
    const v = pick(IRR);
    const f = shuffle(verbFakes(v));
    const forms = `${v.inf} – ${v.past} – ${v.pp}`;
    if (t <= 1) return E(`Simple past von „${v.inf}“ (${v.de})?`, v.past, wr(v.past, [v.pp !== v.past ? v.pp : null, ...f].filter(Boolean).slice(0, 4)), forms);
    if (t <= 3) return E(`3. Form (past participle) von „${v.inf}“ (${v.de})?`, v.pp, wr(v.pp, [v.past !== v.pp ? v.past : null, ...f].filter(Boolean).slice(0, 4)), forms);
    if (t === 4) return E(`Was heißt „${v.de}“ auf Englisch – mit allen drei Formen?`, forms,
      [`${v.inf} – ${reg(v.inf)} – ${reg(v.inf)}`, `${v.inf} – ${v.pp} – ${v.past}`, `${v.inf} – ${v.past} – ${reg(v.inf)}`, `${v.inf} – ${reg(v.inf)} – ${v.pp}`], forms);
    if (t === 5) {
      const others = shuffle(IRR.filter(x => x.inf !== v.inf && x.past !== v.past)).slice(0, 3).map(x => x.inf);
      return E(`Zu welchem Verb gehört die Form „${v.past}“?`, v.inf, others, forms);
    }
    const S = pick(VERB_SUBJ);
    const frag = fillS(v.frag, S);
    if (t <= 7 || v.noPP) {
      const pre = pick(['Yesterday', 'Last week', 'Last Saturday']);
      return E(`${pre} ${S.s} ___ (${v.inf}) ${frag}.`, v.past,
        wr(v.past, [v.pp !== v.past ? v.pp : null, `${S.have} ${v.pp}`, ...f.slice(0, 2)].filter(Boolean)),
        `„${pre}“ → simple past: ${forms}`);
    }
    return E(`${cap(S.s)} ${S.have} already ___ (${v.inf}) ${frag}.`, v.pp,
      wr(v.pp, [v.past !== v.pp ? v.past : null, v.inf !== v.pp ? v.inf : null, ...f.slice(0, 2)].filter(Boolean)),
      `have/has + 3. Form: ${forms}`);
  };

  // ---------------------------------------------------------------- simple past / present perfect
  const TV = [
    ['score', 'scores', 'scored', 'scored', 'a great goal'], ['play', 'plays', 'played', 'played', 'FIFA with {pos} cousin'],
    ['watch', 'watches', 'watched', 'watched', 'the game on TV'], ['visit', 'visits', 'visited', 'visited', 'the airport'],
    ['see', 'sees', 'saw', 'seen', 'the Airbus Beluga'], ['fly', 'flies', 'flew', 'flown', 'to Hamburg'],
    ['win', 'wins', 'won', 'won', 'the school cup'], ['buy', 'buys', 'bought', 'bought', 'new football boots'],
    ['eat', 'eats', 'ate', 'eaten', 'a huge pizza'], ['meet', 'meets', 'met', 'met', '{pos} friends in town'],
    ['write', 'writes', 'wrote', 'written', 'a letter to {pos} grandma'], ['take', 'takes', 'took', 'taken', 'a photo of the A380'],
    ['lose', 'loses', 'lost', 'lost', 'the tickets'], ['find', 'finds', 'found', 'found', '{pos} old football'],
    ['clean', 'cleans', 'cleaned', 'cleaned', '{pos} room'], ['go', 'goes', 'went', 'gone', 'to the Borussia-Park'],
    ['do', 'does', 'did', 'done', '{pos} homework'], ['make', 'makes', 'made', 'made', 'a model plane'],
    ['break', 'breaks', 'broke', 'broken', 'a window'], ['forget', 'forgets', 'forgot', 'forgotten', '{pos} PE kit'],
    ['read', 'reads', 'read', 'read', 'a book about planes'], ['sell', 'sells', 'sold', 'sold', '{pos} old toys'],
    ['ride', 'rides', 'rode', 'ridden', 'a horse'], ['help', 'helps', 'helped', 'helped', '{pos} grandpa in the garden'],
    ['phone', 'phones', 'phoned', 'phoned', '{pos} grandma'], ['draw', 'draws', 'drew', 'drawn', 'a Boeing 747'],
    ['bring', 'brings', 'brought', 'brought', 'a cake to school'], ['catch', 'catches', 'caught', 'caught', 'the bus'],
    ['speak', 'speaks', 'spoke', 'spoken', 'to the coach'], ['wear', 'wears', 'wore', 'worn', 'green and white shirts'],
  ].map(([base, s3, past, pp, obj]) => ({ base, s3, past, pp, obj }));
  const PAST_SIG = ['yesterday', 'last Saturday', 'last week', 'two days ago', 'an hour ago', 'last night', 'on Monday',
    'last summer', 'three weeks ago', 'in 2023'];
  const STATES = [
    ['be', 'is', 'are', 'was', 'were', 'been', 'a Gladbach fan', 'Gladbach fans'], ['be', 'is', 'are', 'was', 'were', 'been', 'in the school team', 'in the school team'],
    ['be', 'is', 'are', 'was', 'were', 'been', 'ill', 'ill'], ['know', 'knows', 'know', 'knew', 'knew', 'known', 'our new coach', 'our new coach'],
    ['have', 'has', 'have', 'had', 'had', 'had', '{pos} new bike', '{pos} new bikes'], ['live', 'lives', 'live', 'lived', 'lived', 'lived', 'in this town', 'in this town'],
    ['want', 'wants', 'want', 'wanted', 'wanted', 'wanted', 'a dog', 'a dog'], ['love', 'loves', 'love', 'loved', 'loved', 'loved', 'planes', 'planes'],
  ];
  const SINCE = ['2021', 'last summer', 'Monday', 'Christmas', 'January', 'the start of the season', 'the last holidays'];

  ENGLISCH.tenses = function () {
    const E = en('tenses');
    const t = rnd(0, 8);
    if (t === 8) return bankQ('englisch', 'tenses', EN_BANK.tenses);
    const v = pick(TV), S = pick(SUBJ_PEOPLE), obj = fillS(v.obj, S), sig = pick(PAST_SIG);
    const pres = S.t3 ? v.s3 : v.base;
    if (t === 0) {
      return E(`${cap(S.s)} ___ (${v.base}) ${obj} ${sig}.`, v.past,
        wr(v.past, [`${S.have} ${v.pp}`, pres, v.past !== v.base ? `did ${v.past}` : null, reg(v.base) !== v.past ? reg(v.base) : null, v.past + 'ed']),
        `„${sig}“ → simple past (Zeitpunkt in der Vergangenheit).`);
    }
    if (t === 1) {
      return E(`${cap(S.s)} ___ (not ${v.base}) ${obj} ${sig}.`, `didn't ${v.base}`,
        wr(`didn't ${v.base}`, [v.past !== v.base ? `didn't ${v.past}` : null, `${NEG[S.have]} ${v.pp}`, `${NEG[S.do]} ${v.base}`, `didn't ${v.s3}`]),
        `„${sig}“ → simple past; Verneinung: didn't + Grundform.`);
    }
    if (t === 2) {
      const Q = pick([subj('you', 'you'), subj('Tom', 'm'), subj('Lisa', 'f'), subj('your dad', 'm'), subj('the twins', 'pl'), subj('Kleindienst', 'm')]);
      const o = fillS(v.obj, Q), w = pick(['When', 'Where']);
      return E(`${w} ___ (${Q.s} – ${v.base}) ${o}?`, `did ${Q.s} ${v.base}`,
        wr(`did ${Q.s} ${v.base}`, [`${Q.have} ${Q.s} ${v.pp}`, v.past !== v.base ? `did ${Q.s} ${v.past}` : null, `${Q.do} ${Q.s} ${v.past}`, `${Q.was} ${Q.s} ${v.pp}`]),
        `Fragen mit „${w} …?“ fragen nach einem Zeitpunkt/Ort in der Vergangenheit → simple past (did + Grundform).`);
    }
    if (t === 3) {
      const c = `${S.have} just ${v.pp}`;
      return E(`${pick(['Look! ', 'Great! ', ''])}${cap(S.s)} ___ (just ${v.base}) ${obj}.`, c,
        wr(c, [`${otherHave(S)} just ${v.pp}`, v.past !== v.pp ? `${S.have} just ${v.past}` : null, v.base !== v.pp ? `${S.have} just ${v.base}` : null, `${S.have} just ${v.s3}`]),
        '„just“ → present perfect: have/has + 3. Form.');
    }
    if (t === 4) {
      const c = `${NEG[S.have]} ${v.pp}`;
      return E(`${cap(S.s)} ___ (not ${v.base}) ${obj} yet.`, c,
        wr(c, [`${NEG[otherHave(S)]} ${v.pp}`, v.past !== v.pp ? `${NEG[S.have]} ${v.past}` : null, v.base !== v.pp ? `${NEG[S.have]} ${v.base}` : null, `${NEG[S.have]} ${v.s3}`]),
        '„not … yet“ → present perfect: haven’t/hasn’t + 3. Form.');
    }
    if (t === 5) {
      const Q = pick([subj('you', 'you'), subj('Tom', 'm'), subj('Lisa', 'f'), subj('your parents', 'pl'), subj('Ben', 'm'), subj('Emma', 'f')]);
      const o = fillS(v.obj, Q), c = `${cap(Q.have)} ${Q.s} ever ${v.pp}`;
      return E(`___ (${Q.s} – ever ${v.base}) ${o}?`, c,
        wr(c, [`${cap(otherHave(Q))} ${Q.s} ever ${v.pp}`, v.past !== v.pp ? `${cap(Q.have)} ${Q.s} ever ${v.past}` : null,
          v.base !== v.pp ? `${cap(Q.have)} ${Q.s} ever ${v.base}` : null, v.pp !== v.base && v.pp !== v.past ? `Did ${Q.s} ever ${v.pp}` : null,
          `${cap(Q.have)} ${Q.s} ever ${v.base}ing`]),
        '„ever“ (jemals) → present perfect: Have/Has … ever + 3. Form?');
    }
    // t 6, 7: since + state verbs
    const [base, s3, plPres, past3, pastPl, pp, oSg, oPl] = pick(STATES);
    const pl = !S.t3 && S.p !== 'I';
    const o = fillS(pl ? oPl : oSg, S), point = pick(SINCE);
    const c = `${S.have} ${pp}`;
    const presF = S.p === 'I' && base === 'be' ? 'am' : (S.t3 ? s3 : plPres);
    const pastF = S.t3 || S.p === 'I' ? past3 : pastPl;
    return E(`${cap(S.s)} ___ (${base}) ${o} since ${point}.`, c,
      wr(c, [pastF, presF, `${otherHave(S)} ${pp}`]),
      '„since“ + Zeitpunkt → present perfect (seit … bis jetzt). Nicht simple present!');
  };
  // ---------------------------------------------------------------- will / going to
  const FA = [
    ['win', 'wins', 'the cup'], ['score', 'scores', 'a goal'], ['play', 'plays', 'in the first team'],
    ['fly', 'flies', 'to London'], ['visit', 'visits', '{pos} grandma'], ['watch', 'watches', 'the game on TV'],
    ['buy', 'buys', 'a new ball'], ['help', 'helps', '{pos} dad'], ['meet', 'meets', '{pos} friends'],
    ['clean', 'cleans', '{pos} room'], ['learn', 'learns', 'for the test'], ['train', 'trains', 'with the team'],
    ['be', 'is', 'late'], ['get', 'gets', 'a new phone'], ['go', 'goes', 'to the airport'], ['come', 'comes', 'to the party'],
  ];
  const FTIME = ['tomorrow', 'next week', 'next Saturday', 'on Sunday', 'tonight', 'next year', 'soon', 'in the summer holidays'];
  const PLANS = [
    ['{S} {have} already packed {pos} bag.', 'fly', 'to London tomorrow'],
    ['{S} {have} bought a new ball.', 'play', 'football after school'],
    ['{S} {have} bought tickets.', 'watch', 'Gladbach on Saturday'],
    ['{S} {have} borrowed a book about planes.', 'read', 'it at the weekend'],
    ['{S} {have} saved a lot of money.', 'buy', 'a new bike'],
    ['{S} {have} invited ten friends.', 'have', 'a party on Friday'],
    ['{S} {have} bought some paint.', 'paint', 'the garden fence'],
    ['{S} {have} found a cheap flight.', 'visit', 'Toulouse in May'],
    ['{S} {have} written a shopping list.', 'go', 'shopping later'],
    ['{S} {have} put on {pos} football boots.', 'train', 'with the team'],
    ['{S} {have} booked a table.', 'eat', 'at the pizzeria tonight'],
    ['{S} {have} downloaded the new game.', 'play', 'it tonight'],
  ];
  const EVIDENCE = [
    ['Look at those black clouds!', subj('it', 'm'), 'rain', ''], ['Look! The Beluga is on the runway.', subj('it', 'm'), 'take', 'off'],
    ['Watch out!', subj('you', 'you'), 'fall', 'off the ladder'], ['The sky is blue.', subj('it', 'm'), 'be', 'a lovely day'],
    ['I have eaten too much cake.', subj('I', 'I'), 'be', 'sick'], ['Gladbach is 4–0 up after 80 minutes.', subj('they', 'pl'), 'win', 'the game'],
    ['Look at the time!', subj('we', 'we'), 'miss', 'the bus'], ['The A380 is very low over the airport.', subj('it', 'm'), 'land', 'in a minute'],
  ];
  const STRIKERS = ['Kleindienst', 'Hugo Bolin', 'Harry Kane', 'Bruno Fernandes', 'Cristiano Ronaldo', 'Haaland', 'Jens Castrop'];
  const SPONT = [
    ['The phone is ringing.', 'answer', 'it'], ['This bag is too heavy for me.', null, null],
    ['It’s cold in here.', 'close', 'the window'], ['I’m thirsty.', 'get', 'a glass of water'],
    ['Oh no, I’ve forgotten my pencil case!', null, null], ['The dog is barking.', 'take', 'it for a walk'],
    ['These boots are great!', 'buy', 'them'], ['There’s no milk in the fridge.', 'go', 'to the shop'],
    ['Somebody is at the door.', 'open', 'it'], ['I can’t do this maths problem.', null, null],
  ];
  const goingWrongs = (S, base) => {
    const be = S.p === 'I' ? 'am' : S.be;
    const wrongBe = S.p === 'I' ? 'is' : otherBe(S);
    return { c: `${be} going to ${base}`, w: [`${wrongBe} going to ${base}`, `${be} going ${base}`, `${be} go to ${base}`, `will going to ${base}`] };
  };

  ENGLISCH.future = function () {
    const E = en('future');
    const t = rnd(0, 8);
    if (t === 8) return bankQ('englisch', 'future', EN_BANK.future);
    if (t === 0 || t === 1) {
      const S = pick(SUBJ_PEOPLE), [b, s3, rest] = pick(FA), intro = pick(['I think', 'I’m sure', 'Maybe', 'Perhaps', 'I bet']);
      const c = `will ${b}`;
      return E(`${intro} ${S.s} ___ (${b}) ${fillS(rest, S)} ${pick(FTIME)}.`, c, wr(c, [`will ${s3}`, `will to ${b}`, `wills ${b}`]),
        `Vermutung/Vorhersage („${intro}“) → will + Grundform.`);
    }
    if (t === 2) {
      const S = pick(SUBJ_PEOPLE), [ctx, b, rest] = pick(PLANS), g = goingWrongs(S, b);
      const q = `${cap(fill(ctx, { S: S.s, have: S.have, pos: S.pos }))} ${cap(S.p)} ___ (${b}) ${fillS(rest, S)}.`;
      return E(q, g.c, wr(g.c, g.w), 'Plan/Absicht steht schon fest → going to-future: am/is/are going to + Grundform.');
    }
    if (t === 3) {
      let ctx, S, b, rest;
      if (Math.random() < 0.5) {
        const name = pick(STRIKERS);
        ctx = `Look! ${name} is alone in front of the goal.`; S = subj('he', 'm'); b = 'score'; rest = '';
      } else [ctx, S, b, rest] = pick(EVIDENCE);
      const g = goingWrongs(S, b);
      return E(`${ctx} ${cap(S.p === 'he' || S.s === 'it' ? S.s : S.p)} ___ (${b})${rest ? ' ' + rest : ''}.`, g.c, wr(g.c, g.w),
        'Man sieht schon Anzeichen → going to-future.');
    }
    if (t === 4) {
      const [ctx, b, rest] = pick(SPONT.filter(x => x[1]));
      const c = `will ${b}`;
      return E(`${ctx} – OK, I ___ (${b}) ${rest}.`, c, wr(c, [`will ${b}s`, `am ${b}`, `will to ${b}`]),
        'Spontaner Entschluss → will (I’ll …).');
    }
    if (t === 5) {
      const S = pick(SUBJ_PEOPLE), [b, s3, rest] = pick(FA);
      const c = `won't ${b}`;
      return E(`I think ${S.s} ___ (not ${b}) ${fillS(rest, S)} ${pick(FTIME)}.`, c, wr(c, [`willn't ${b}`, `won't ${s3}`, `${NEG[S.do]} will ${b}`, `not will ${b}`]),
        'Verneinung des will-future: won’t (= will not) + Grundform.');
    }
    if (t === 6) {
      const S = pick(SUBJ_PEOPLE.filter(s => s.p !== 'I')), [b, , rest] = pick(FA);
      return E(`___ ${S.s} ${b} ${fillS(rest, S)} ${pick(FTIME)}, do you think?`, 'Will',
        [cap(S.be), 'Did', cap(S.have), cap(S.do)].filter(x => x !== 'Do' && x !== 'Does').concat(['Has']),
        'Frage im will-future: Will + Subjekt + Grundform?');
    }
    const S = pick(SUBJ_PEOPLE.filter(s => s.p !== 'I')), [b, , rest] = pick(FA);
    const be = cap(S.be);
    return E(`___ ${S.s} going to ${b} ${fillS(rest, S)} ${pick(FTIME)}?`, be,
      wr(be, [cap(otherBe(S)), 'Will', cap(S.do), 'Am']),
      'Frage im going to-future: Am/Is/Are + Subjekt + going to …?');
  };

  // ---------------------------------------------------------------- comparison
  const A = (b, c, s) => ({ b, c, s, long: c.startsWith('more ') });
  const ADJ = {
    tall: A('tall', 'taller', 'tallest'), fast: A('fast', 'faster', 'fastest'), young: A('young', 'younger', 'youngest'),
    old: A('old', 'older', 'oldest'), strong: A('strong', 'stronger', 'strongest'), funny: A('funny', 'funnier', 'funniest'),
    lazy: A('lazy', 'lazier', 'laziest'), slow: A('slow', 'slower', 'slowest'), small: A('small', 'smaller', 'smallest'),
    happy: A('happy', 'happier', 'happiest'), big: A('big', 'bigger', 'biggest'), loud: A('loud', 'louder', 'loudest'),
    heavy: A('heavy', 'heavier', 'heaviest'), long: A('long', 'longer', 'longest'), new: A('new', 'newer', 'newest'),
    safe: A('safe', 'safer', 'safest'), noisy: A('noisy', 'noisier', 'noisiest'), dirty: A('dirty', 'dirtier', 'dirtiest'),
    short: A('short', 'shorter', 'shortest'), easy: A('easy', 'easier', 'easiest'), hard: A('hard', 'harder', 'hardest'),
    hot: A('hot', 'hotter', 'hottest'), cold: A('cold', 'colder', 'coldest'), warm: A('warm', 'warmer', 'warmest'),
    sunny: A('sunny', 'sunnier', 'sunniest'), windy: A('windy', 'windier', 'windiest'), wet: A('wet', 'wetter', 'wettest'),
    rainy: A('rainy', 'rainier', 'rainiest'), nice: A('nice', 'nicer', 'nicest'), cheap: A('cheap', 'cheaper', 'cheapest'),
    good: A('good', 'better', 'best'), bad: A('bad', 'worse', 'worst'),
  };
  for (const w of ['careful', 'popular', 'nervous', 'creative', 'patient', 'modern', 'expensive', 'comfortable', 'powerful',
    'beautiful', 'exciting', 'boring', 'important', 'interesting', 'difficult']) ADJ[w] = A(w, 'more ' + w, 'most ' + w);
  const PEOPLE_N = ['Tom', 'Lisa', 'Ben', 'Emma', 'my brother', 'my sister', 'my cousin', 'our goalkeeper', 'Jonas', 'Mia', 'Paul', 'Sophie'];
  const CMP = [
    { X: PEOPLE_N, Y: PEOPLE_N, verb: 'is', sup: ['{X} is ___ player in our team.', '{X} is ___ pupil in our class.'],
      adj: 'tall fast young old strong funny lazy slow small happy careful popular nervous creative patient good bad',
      cf: { good: '{X} is a ___ player than {Y}.', bad: '{X} is a ___ singer than {Y}.' } },
    { X: ['This plane', 'The new jet', 'Our plane', 'The red plane', 'The cargo plane'], Y: ['that one', 'the old one', 'the blue plane', 'the white plane'],
      verb: 'is', sup: ['{X} is ___ plane at the airport.'],
      adj: 'big small fast slow loud heavy long new old modern expensive comfortable powerful beautiful safe noisy dirty' },
    { X: ['This game', 'Today’s match', 'The final', 'The derby'], Y: ['the last one', 'last week’s game', 'the first game'],
      verb: 'was', sup: ['{X} was ___ game of the season.'], adj: 'exciting boring good bad long short important interesting' },
    { X: ['The maths test', 'The English test', 'Today’s test', 'The German test'], Y: ['the last one', 'yesterday’s test', 'the history test'],
      verb: 'was', sup: ['{X} was ___ test of the year.'], adj: 'easy difficult long short hard important boring interesting' },
    { X: ['Today', 'This week', 'This summer', 'This month'], Y: { Today: 'yesterday', 'This week': 'last week', 'This summer': 'last summer', 'This month': 'last month' },
      verb: 'is', sup: ['It was ___ day of the year.', 'Yesterday was ___ day of the week.'], adj: 'hot cold warm sunny windy wet rainy nice good bad' },
    { X: ['This pizza', 'This shirt', 'This ball', 'This ticket', 'This phone', 'This bike'], Y: ['that one'], verb: 'is',
      sup: ['This is ___ {N} in the shop.'], adj: 'cheap expensive big small good nice' },
  ];
  const compWrongs = a => (a.b === 'good' ? ['gooder', 'more good', 'best', 'more better'] : a.b === 'bad' ? ['badder', 'more bad', 'worst', 'more worse']
    : a.long ? [a.b + 'er', 'most ' + a.b, 'more ' + a.b + 'er', a.b] : ['more ' + a.b, a.s, 'more ' + a.c, a.b]);
  const supWrongs = a => (a.b === 'good' ? ['the goodest', 'the most good', 'the better'] : a.b === 'bad' ? ['the baddest', 'the most bad', 'the worse']
    : a.long ? ['the ' + a.b + 'est', 'the more ' + a.b, 'the most ' + a.b + 'est'] : ['the most ' + a.b, 'the ' + a.c, 'the most ' + a.s]);

  function compareQ(E) {
    const cat = pick(CMP), a = ADJ[pick(cat.adj.split(' '))];
    const X = pick(cat.X);
    const Y = Array.isArray(cat.Y) ? pick(cat.Y.filter(y => y.toLowerCase() !== X.toLowerCase())) : cat.Y[X];
    const t = rnd(0, 5);
    if (t <= 2) {
      const frame = (cat.cf && cat.cf[a.b]) || `{X} ${cat.verb} ___ than {Y}.`;
      return E(cap(fill(frame, { X, Y })), a.c, wr(a.c, compWrongs(a)),
        a.b === 'good' || a.b === 'bad' ? `Unregelmäßig: ${a.b} – ${a.c} – the ${a.s}.` : a.long ? `Lange Adjektive: more + Adjektiv (${a.c}).` : `Kurze Adjektive: -er (${a.b} – ${a.c} – the ${a.s}).`);
    }
    if (t <= 4) {
      const N = X.replace(/^This /, '');
      const c = 'the ' + a.s;
      return E(cap(fill(pick(cat.sup), { X, N })), c, wr(c, supWrongs(a)),
        a.b === 'good' || a.b === 'bad' ? `Unregelmäßig: ${a.b} – ${a.c} – the ${a.s}.` : a.long ? 'Lange Adjektive: the most + Adjektiv.' : `Kurze Adjektive: the …-est (${a.b} – ${a.c} – the ${a.s}).`);
    }
    if (Math.random() < 0.5) {
      return E(cap(`${X} ${cat.verb} as ${a.b} ___ ${Y}.`), 'as', ['than', 'like', 'then'], 'as … as = genauso … wie.');
    }
    return E(cap(`${X} ${cat.verb} ${a.c} ___ ${Y}.`), 'than', ['as', 'then', 'like'], 'Nach dem Komparativ steht „than“ (= als).');
  }

  // ---------------------------------------------------------------- adverbs of manner
  const AD = {};
  [['quick', 'quickly', 'quickely', 'quicky'], ['slow', 'slowly', 'slowely', 'slowlly'], ['careful', 'carefully', 'carefuly', 'carefullly'],
    ['loud', 'loudly', 'loudely', 'loudlly'], ['quiet', 'quietly', 'quietely', 'quietlly'], ['happy', 'happily', 'happyly', 'happly'],
    ['easy', 'easily', 'easyly', 'easly'], ['angry', 'angrily', 'angryly', 'angrly'], ['beautiful', 'beautifully', 'beautifuly', 'beautifullly'],
    ['safe', 'safely', 'safly', 'safelly'], ['sad', 'sadly', 'sadely', 'sadlly'], ['nervous', 'nervously', 'nervousely', 'nervouslly'],
    ['perfect', 'perfectly', 'perfectely', 'perfectlly'], ['polite', 'politely', 'politly', 'politelly'], ['bad', 'badly', 'badely', 'badlly'],
    ['good', 'well', 'goodly', 'goodely'], ['fast', 'fast', 'fastly', 'fastely', 'fastful'], ['hard', 'hard', 'hardly', 'hardely', 'hardful'],
    ['terrible', 'terribly', 'terriblely', 'terribley'], ['brave', 'bravely', 'bravly', 'bravelly'], ['clear', 'clearly', 'clearely', 'clearlly'],
    ['calm', 'calmly', 'calmely', 'calmlly'], ['careless', 'carelessly', 'carelessely', 'carelesly'], ['patient', 'patiently', 'patientely', 'patientlly'],
    ['proud', 'proudly', 'proudely', 'proudlly'], ['brilliant', 'brilliantly', 'brilliantely', 'brillianly'], ['wild', 'wildly', 'wildely', 'wildlly'],
    ['noisy', 'noisily', 'noisyly', 'noisly'], ['lazy', 'lazily', 'lazyly', 'lazly'], ['correct', 'correctly', 'correctely', 'correctlly'],
    ['excellent', 'excellently', 'excellentely', 'excellenly']].forEach(([adj, adv, ...fakes]) => { AD[adj] = { adj, adv, fakes }; });
  const ADV_PEOPLE = ['Tom', 'Lisa', 'Ben', 'Emma', 'Kleindienst', 'Hugo Bolin', 'my brother', 'my sister', 'Mia', 'Jonas'];
  const gOf = s => (FEMALE.includes(s) || ['Lisa', 'Emma', 'Mia', 'my sister'].includes(s) ? 'f' : 'm');
  const ADVF = [
    ['{S} played ___ in the match yesterday.', 'good bad brilliant excellent careful nervous perfect terrible calm brave careless fast hard'],
    ['The pilot landed the plane ___.', 'safe careful perfect calm slow good bad brilliant'],
    ['{S} answered the question ___.', 'quick polite clear correct nervous calm angry perfect good'],
    ['{S} ran ___ to the bus stop.', 'quick fast slow happy nervous'],
    ['The fans sang ___ during the game.', 'loud beautiful happy proud quiet bad good wild noisy'],
    ['{S} worked ___ for the test.', 'hard careful quiet calm patient lazy good'],
    ['{S} waited ___ for the bus.', 'patient quiet calm nervous happy'],
    ['{S} drove ___ to the airport.', 'safe slow fast careful careless calm quick'],
    ['{S} shouted ___ at the referee.', 'angry loud wild'],
    ['{S} explained the rules ___.', 'clear patient calm good bad quick slow polite'],
    ['{S} smiled ___ at the camera.', 'happy proud nervous polite sad'],
    ['{S} did {pos} homework ___.', 'careful quick good bad careless perfect lazy correct'],
    ['{S} spoke ___ to the coach.', 'polite quiet calm angry nervous clear'],
  ];
  const ADJF = [
    ['{S} is a very ___ player.', 'good bad careful brilliant excellent fast nervous calm careless terrible slow quick'],
    ['{S} is a ___ driver.', 'careful safe slow fast good bad careless calm'],
    ['{S} was very ___ before the test.', 'nervous calm quiet happy'],
    ['The test was really ___.', 'easy hard terrible'],
    ['The pizza tastes ___.', 'good terrible perfect'],
    ['The fans were very ___ after the goal.', 'loud happy proud wild noisy'],
    ['{S} looks ___ today.', 'happy sad nervous angry calm'],
    ['{S} feels ___ after the game.', 'happy sad proud nervous calm'],
    ['Our teacher is always very ___.', 'patient polite calm'],
    ['The A380 is a ___ plane.', 'beautiful quiet safe'],
    ['Your answer is ___.', 'correct clear perfect'],
  ];
  function adverbQ(E) {
    const t = rnd(0, 4);
    const name = pick(ADV_PEOPLE), S = subj(name, gOf(name));
    if (t <= 1) {
      const [f, ks] = pick(ADVF), a = AD[pick(ks.split(' '))];
      const q = cap(fill(f, { S: name, pos: S.pos }));
      return E(q, a.adv, wr(a.adv, [a.adj !== a.adv ? a.adj : null, ...a.fakes]),
        a.adj === 'good' ? 'Das Adverb zu good ist well.' : a.adj === a.adv ? `${a.adj} ist Adjektiv und Adverb zugleich (kein -ly!).` : `Wie? → Adverb (beschreibt das Verb): ${a.adj} → ${a.adv}.`);
    }
    if (t <= 3) {
      const [f, ks] = pick(ADJF), a = AD[pick(ks.split(' '))];
      const q = cap(fill(f, { S: name, pos: S.pos }));
      return E(q, a.adj, wr(a.adj, [a.adv !== a.adj ? a.adv : null, ...a.fakes]),
        'Beschreibt ein Nomen oder steht nach be/look/feel/taste → Adjektiv (kein -ly).');
    }
    const a = AD[pick(Object.keys(AD))];
    return E(`Bilde das Adverb zu „${a.adj}“.`, a.adv, wr(a.adv, [a.adj !== a.adv ? a.adj : null, ...a.fakes]),
      a.adj === 'good' ? 'good → well (unregelmäßig).' : a.adj === a.adv ? `${a.adj} bleibt ${a.adv} (unregelmäßig).` : `${a.adj} → ${a.adv}`);
  }
  ENGLISCH.compare = function () {
    const E = en('compare');
    const r = Math.random();
    if (r < 0.08) return bankQ('englisch', 'compare', EN_BANK.compare);
    if (r < 0.25) return adverbQ(E);
    return compareQ(E);
  };
  ENGLISCH.adverbs = () => adverbQ(en('adverbs'));
  // ---------------------------------------------------------------- relative clauses, do/does (grammar mix)
  const REL_P = ['the player', 'the girl', 'the boy', 'the pilot', 'the teacher', 'the woman', 'the man', 'the coach'];
  const REL_PC = ['scored the winning goal', 'sits next to me in maths', 'lives next door', 'flew the Beluga to Hamburg',
    'won the race', 'helped me with my homework', 'sold me the tickets', 'found my phone'];
  const REL_T = [['the plane', ['carries parts of other planes', 'landed late yesterday', 'we saw at the airport']],
    ['the ball', ['Haaland signed', 'is in my bag', 'I got for my birthday']], ['the bike', ['my dad bought me', 'is in the garage']],
    ['the shirt', ['I wear on Saturdays', 'has my name on it']], ['the book', ['is about the A380', 'my teacher recommended']],
    ['the game', ['ended 3–3', 'we watched last night']], ['the app', ['shows all the flights', 'I use for my vocabulary']]];
  const REL_W = ['the stadium', 'the airport', 'the town', 'the café', 'the park', 'the school'];
  const REL_WC = ['we play football', 'my dad works', 'I saw the A380', 'we met Hugo Bolin', 'my grandma lives', 'we had lunch'];
  const REL_WH = ['dad is a pilot', 'sister plays in the school team', 'bike was stolen', 'phone is broken', 'dog is very loud', 'mum is our coach'];
  const REL_INTRO = ['That’s {N} ___ {C}.', 'I know {N} ___ {C}.', 'Do you know {N} ___ {C}?', 'Where is {N} ___ {C}?'];
  function relativeQ(E) {
    const t = rnd(0, 3), intro = pick(t === 1 ? REL_INTRO.slice(0, 3) : REL_INTRO);
    if (t === 0) return E(fill(intro, { N: pick(REL_P), C: pick(REL_PC) }), 'who', ['which', 'whose', 'where', 'what'], 'who → für Personen.');
    if (t === 1) {
      const [n, cs] = pick(REL_T);
      return E(fill(intro, { N: n, C: pick(cs) }), 'which', ['who', 'whose', 'where', 'what'], 'which → für Dinge und Tiere.');
    }
    if (t === 2) return E(fill(intro, { N: pick(REL_W), C: pick(REL_WC) }), 'where', ['which', 'who', 'whose', 'what'], 'where → für Orte (wo).');
    return E(fill(intro, { N: pick(['the boy', 'the girl', 'the player', 'the woman', 'the man']), C: pick(REL_WH) }), 'whose', ['who', 'which', 'where', 'what'], 'whose = dessen/deren (Besitz).');
  }
  const DO_V = ['like pizza', 'play football', 'watch every Gladbach game', 'live near the airport', 'want a new bike', 'love planes', 'speak English', 'go to school by bus'];
  function doQ(E) {
    const S = pick(SUBJ_PEOPLE.filter(s => s.p !== 'I')), vp = pick(DO_V);
    if (Math.random() < 0.5) {
      return E(`___ ${S.s} ${vp}?`, cap(S.do), wr(cap(S.do), [S.t3 ? 'Do' : 'Does', cap(S.be), cap(S.have)]),
        S.t3 ? 'he/she/it (Einzahl) → Does …?' : 'I/you/we/they → Do …?');
    }
    const c = NEG[S.do];
    return E(`${cap(S.s)} ___ ${vp}.`, c, wr(c, [S.t3 ? "don't" : "doesn't", NEG[S.be], 'not', `${S.t3 ? 'does' : 'do'} not to`]),
      S.t3 ? 'he/she/it → doesn’t + Grundform.' : 'I/you/we/they → don’t + Grundform.');
  }

  // ---------------------------------------------------------------- conditional sentences type 1 and 2
  // c: [base, s3, past, rest]; m: [subject ({P}=pronoun of S), base, s3, past, rest, negative?]; cs: fixed if-subject
  const IFP = [
    { c: ['train', 'trains', 'trained', 'harder'], m: ['{P}', 'play', 'plays', 'played', 'in the first team'] },
    { c: ['get', 'gets', 'got', 'up late'], m: ['{P}', 'miss', 'misses', 'missed', 'the bus'] },
    { c: ['score', 'scores', 'scored', 'a goal'], m: ['the fans', 'cheer', 'cheer', 'cheered', 'loudly'] },
    { c: ['have', 'has', 'had', 'enough money'], m: ['{P}', 'buy', 'buys', 'bought', 'a new ball'] },
    { c: ['win', 'wins', 'won', 'the game'], m: ['{P}', 'celebrate', 'celebrates', 'celebrated', 'all night'] },
    { c: ['go', 'goes', 'went', 'to Toulouse'], m: ['{P}', 'see', 'sees', 'saw', 'the Beluga'] },
    { c: ['eat', 'eats', 'ate', 'too much cake'], m: ['{P}', 'feel', 'feels', 'felt', 'sick'] },
    { c: ['forget', 'forgets', 'forgot', '{pos} homework'], m: ['the teacher', 'be', 'is', 'was', 'angry'] },
    { c: ['study', 'studies', 'studied', 'for the test'], m: ['{P}', 'get', 'gets', 'got', 'a good mark'] },
    { c: ['visit', 'visits', 'visited', 'London'], m: ['{P}', 'take', 'takes', 'took', 'lots of photos'] },
    { c: ['ask', 'asks', 'asked', 'the coach'], m: ['he', 'help', 'helps', 'helped', '{obj}'] },
    { c: ['miss', 'misses', 'missed', 'the plane'], m: ['{P}', 'take', 'takes', 'took', 'the next one'] },
    { c: ['run', 'runs', 'ran', 'fast'], m: ['{P}', 'catch', 'catches', 'caught', 'the bus'] },
    { c: ['lose', 'loses', 'lost', '{pos} tickets'], m: ['{P}', 'get', 'gets', 'got', 'into the stadium', true] },
    { c: ['tidy', 'tidies', 'tidied', '{pos} room'], m: ['{pos} parents', 'be', 'are', 'were', 'happy'] },
    { c: ['leave', 'leaves', 'left', 'now'], m: ['{P}', 'be', 'is', 'was', 'on time'] },
    { c: ['buy', 'buys', 'bought', 'a new phone'], m: ['{P}', 'have', 'has', 'had', 'any money left', true] },
    { c: ['meet', 'meets', 'met', 'Harry Kane'], m: ['{P}', 'ask', 'asks', 'asked', 'him for an autograph'] },
    { c: ['get', 'gets', 'got', 'the tickets'], m: ['{P}', 'take', 'takes', 'took', '{pos} best friend to the game'] },
    { c: ['help', 'helps', 'helped', '{pos} dad'], m: ['{pos} dad', 'give', 'gives', 'gave', '{obj} some pocket money'] },
    { c: ['watch', 'watches', 'watched', 'too much TV'], m: ['{pos} eyes', 'hurt', 'hurt', 'hurt', ''] },
    { c: ['rain', 'rains', 'rained', 'on Saturday'], m: ['we', 'play', 'play', 'played', 'in the sports hall'], cs: subj('it', 'm') },
    { c: ['snow', 'snows', 'snowed', 'tomorrow'], m: ['we', 'build', 'build', 'built', 'a snowman'], cs: subj('it', 'm') },
    { c: ['be', 'is', 'were', 'late again'], m: ['the coach', 'be', 'is', 'was', 'angry'], cs: subj('the bus', 'm'), noT2: true },
  ];
  const IF_SUBJ = [subj('I', 'I'), subj('you', 'you'), subj('we', 'we'), subj('Tom', 'm'), subj('Lisa', 'f'), subj('Ben', 'm'),
    subj('Emma', 'f'), subj('my brother', 'm'), subj('my sister', 'f'), subj('my friends', 'pl'), subj('the twins', 'pl'), subj('Jonas', 'm')];
  const IF_ADVICE = ['ask the coach', 'go to bed early', 'take the bus', 'buy the blue boots', 'tell the teacher', 'learn the words every day', 'say sorry'];

  function ifQ(E, type) {
    let p = pick(IFP);
    if (type === 2 && p.noT2) p = IFP[0];
    if (type === 2 && Math.random() < 0.15) {
      const adv = pick(IF_ADVICE);
      if (Math.random() < 0.5) return E(`If I ___ you, I would ${adv}.`, 'were', ['am', 'would be', 'be', 'will be'], 'Ratschlag: If I were you, I would … (if-Satz Typ 2).');
      const b = adv.split(' ')[0], rest = adv.split(' ').slice(1).join(' ');
      return E(`If I were you, I ___ (${b}) ${rest}.`, `would ${b}`, [`will ${b}`, `would ${b}s`, `would to ${b}`, `${b}ed`].filter(x => x !== `would ${b}`), 'if-Satz Typ 2: Hauptsatz mit would + Grundform.');
    }
    const S = p.cs || pick(IF_SUBJ);
    const [cb, c3, cp, crRaw] = p.c, [msRaw, mb, m3, mp, mrRaw, mneg] = p.m;
    const cr = fillS(crRaw, S), mr = fillS(mrRaw, S);
    const ms = fill(msRaw, { P: S.p, pos: S.pos });
    const cPres = S.t3 ? c3 : cb, cWrongAgr = S.t3 ? cb : c3;
    const condSubj = S.s;
    const mainTail = mr ? ' ' + mr : '';
    if (type === 1) {
      const mc = mneg ? `won't ${mb}` : `will ${mb}`;
      if (Math.random() < 0.5) {
        return E(`If ${condSubj} ___ (${cb}) ${cr}, ${ms} ${mc}${mainTail}.`, cPres,
          wr(cPres, [`will ${cb}`, `would ${cb}`, cWrongAgr !== cPres ? cWrongAgr : null, `${cb}ing`]),
          'if-Satz Typ 1: Im if-Teil steht simple present – kein will!');
      }
      const mw = mneg ? [`won't ${m3}`, `willn't ${mb}`, `not will ${mb}`, `wouldn't ${mp}`] : [`will ${m3 !== mb ? m3 : mb + 's'}`, `will to ${mb}`, mp !== mb ? mp : null, mp !== mb ? `would ${mp}` : `will ${mb}ing`];
      return E(`If ${condSubj} ${cPres} ${cr}, ${ms} ___ (${mneg ? 'not ' : ''}${mb})${mainTail}.`, mc, wr(mc, mw),
        'if-Satz Typ 1: Hauptsatz mit will/won’t + Grundform.');
    }
    const condPast = cb === 'be' ? (S.t3 || S.p === 'I' ? 'was' : 'were') : cp;
    const mc = mneg ? `wouldn't ${mb}` : `would ${mb}`;
    if (Math.random() < 0.5) {
      return E(`If ${condSubj} ___ (${cb}) ${cr}, ${ms} ${mc}${mainTail}.`, condPast,
        wr(condPast, [`would ${cb}`, cPres, `will ${cb}`, `had ${cb}`]),
        'if-Satz Typ 2: Im if-Teil steht simple past – kein would!');
    }
    const mw = mneg ? [`won't ${mb}`, mp !== mb ? `wouldn't ${mp}` : `wouldn't ${m3}`, `not would ${mb}`]
      : [`will ${mb}`, mp !== mb ? `would ${mp}` : `would ${m3}`, `would to ${mb}`, `would ${mb}${/s$/.test(mb) ? 'es' : 's'}`];
    return E(`If ${condSubj} ${condPast} ${cr}, ${ms} ___ (${mneg ? 'not ' : ''}${mb})${mainTail}.`, mc, wr(mc, mw),
      'if-Satz Typ 2: Hauptsatz mit would/wouldn’t + Grundform.');
  }
  ENGLISCH.if1 = () => ifQ(en('if1'), 1);
  ENGLISCH.if2 = () => ifQ(en('if2'), 2);
  ENGLISCH.grammar = function () {
    const E = en('grammar'), r = Math.random();
    if (r < 0.15) return bankQ('englisch', 'grammar', EN_BANK.grammar);
    if (r < 0.55) return relativeQ(E);
    if (r < 0.8) return doQ(E);
    return ifQ(E, 1);
  };

  // ---------------------------------------------------------------- some/any/no/every compounds
  const CMPD = {
    thing: { some: 'something', any: 'anything', no: 'nothing', every: 'everything', de: { some: 'etwas', no: 'nichts', every: 'alles' } },
    body: { some: 'somebody', any: 'anybody', no: 'nobody', every: 'everybody', de: { some: 'jemand', no: 'niemand', every: 'alle' } },
    where: { some: 'somewhere', any: 'anywhere', no: 'nowhere', every: 'everywhere', de: { some: 'irgendwo', no: 'nirgendwo', every: 'überall' } },
  };
  const CMPD_V = {
    thing: [['buy', 'bought'], ['eat', 'ate'], ['say', 'said'], ['drink', 'drank'], ['hear', 'heard'], ['find', 'found'],
      ['bring', 'brought'], ['see', 'saw'], ['draw', 'drew'], ['write', 'wrote'], ['sell', 'sold'], ['understand', 'understood']],
    body: [['meet', 'met'], ['see', 'saw'], ['call', 'called'], ['invite', 'invited'], ['ask', 'asked'], ['help', 'helped'], ['visit', 'visited']],
    where: [['go', 'went'], ['travel', null], ['look', 'looked']],
  };
  const CMPD_T = ['yesterday', 'at the weekend', 'after school', 'last Saturday', 'in the holidays'];
  const CMPD_S = ['I', 'we', 'Tom', 'Lisa', 'my brother', 'my friends', 'Ben', 'Emma', 'Mia', 'the twins'];
  ENGLISCH.somebody = function () {
    const E = en('somebody');
    const kind = pick(['thing', 'thing', 'body', 'body', 'where']), C = CMPD[kind];
    const pol = pick(['neg', 'neg', 'some', 'no', 'every']);
    const all = [C.some, C.any, C.no, C.every];
    const tail = pick(CMPD_T);
    if (Math.random() < 0.2 && kind !== 'where') {
      // compound as subject
      const preds = kind === 'thing' ? ['was in the box', 'fell off the shelf', 'was on the table', 'was in my bag'] : ['came to the training', 'called me', 'knew the answer', 'scored in the second half', 'came to my party', 'laughed at the joke'];
      const p = pol === 'neg' ? pick(['no', 'some', 'every']) : pol;
      const c = cap(C[p]);
      return E(`___ ${pick(preds)}. (= ${C.de[p]})`, c, all.map(cap).filter(x => x !== c),
        p === 'no' ? 'no-Wörter (nobody, nothing …) sind schon verneint.' : p === 'some' ? 'some-Wörter in bejahten Aussagesätzen.' : 'every- = alle/alles/überall.');
    }
    const S = pick(CMPD_S), [base, past] = pick(CMPD_V[kind].filter(v => (pol === 'neg' || v[1]) && !(v[0] === 'look' && (pol === 'no' || pol === 'some'))));
    let verb = kind === 'where' && base === 'look' ? 'for {pos} keys ' : '';
    verb = fill(verb, { pos: (SUBJ.find(x => x.s === S) || subj(S, 'm')).pos });
    if (pol === 'neg') {
      return E(`${cap(S)} didn't ${base} ${verb}___ ${tail}. (= ${C.de.no})`, C.any, [C.no, C.some, C.every],
        'Verneinter Satz (didn’t) → any-Wort. Kein doppeltes Nein (nicht: didn’t … nothing)!');
    }
    const c = C[pol];
    return E(`${cap(S)} ${past} ${verb}___ ${tail}. (= ${C.de[pol]})`, c, all.filter(x => x !== c),
      pol === 'no' ? 'no-Wörter (nothing, nobody, nowhere) stehen im bejahten Satz und bedeuten schon „nicht“.' : pol === 'some' ? 'Bejahter Aussagesatz → some-Wort.' : 'every- = alles/alle/überall.');
  };

  // ---------------------------------------------------------------- reflexive pronouns
  const RF_S = [subj('I', 'I'), subj('we', 'we'), subj('Tom', 'm'), subj('Ben', 'm'), subj('my dad', 'm'), subj('Kleindienst', 'm'),
    subj('Lisa', 'f'), subj('Emma', 'f'), subj('my mum', 'f'), subj('my sister', 'f'), subj('my friends', 'pl'), subj('the players', 'pl'), subj('the twins', 'pl'),
    subj('Mia', 'f'), subj('Jonas', 'm'), subj('Haaland', 'm'), subj('my brother', 'm'), subj('my parents', 'pl')];
  const RF_V = ['hurt ___ in the match', 'enjoyed ___ at the party', 'introduced ___ to the new coach', 'looked at ___ in the mirror',
    'made ___ a sandwich', 'bought ___ a new ball', 'taught ___ to juggle the ball', 'cut ___ with a knife', 'took a photo of ___',
    'blamed ___ for the defeat', 'prepared ___ for the test', 'told ___ to stay calm', 'dried ___ with a towel', 'asked ___ a question',
    'built the model plane all by ___', 'painted the room ___', 'enjoyed ___ on holiday', 'bought ___ an ice cream',
    'wrote ___ a note', 'cooked ___ some pasta', 'promised ___ to train harder', 'introduced ___ to the class', 'hurt ___ on the trampoline',
    'fixed the bike ___', 'did the homework all by ___', 'looked after ___ very well'];
  const ALL_RF = ['myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'yourselves', 'themselves'];
  const FAKE_RF = { himself: 'hisself', themselves: 'theirselves', ourselves: 'ourselfs', herself: 'herselves', myself: 'meself', yourself: 'yourselfs', yourselves: 'yourselfs' };
  ENGLISCH.reflexive = function () {
    const E = en('reflexive');
    const r = Math.random();
    if (r < 0.15) {
      const name = pick(['Tom', 'Lisa', 'Ben', 'Mia', 'Jonas']), kids = pick(['kids', 'boys', 'girls', 'everyone']);
      if (Math.random() < 0.5) {
        const f = pick(['Did you hurt ___, {n}?', 'Help ___ to some pizza, {n}!', 'Enjoy ___ at the party, {n}!', 'Be careful, {n}! Don’t cut ___!']);
        return E(fill(f, { n: name }), 'yourself', ['yourselves', 'yourselfs', 'himself', 'herself'],
          'you (eine Person) → yourself.');
      }
      const f = pick(['Did you enjoy ___, {k}?', 'Help ___ to some cake, {k}!', 'Don’t hurt ___, {k}!', 'Look at ___ in the photo, {k}!']);
      return E(fill(f, { k: kids }), 'yourselves', ['yourself', 'yourselfs', 'themselves', 'ourselves'], 'you (mehrere Personen) → yourselves.');
    }
    if (r < 0.22) {
      const q = pick(['Tom and Lisa are best friends. They phone ___ every day.', 'We have known ___ since kindergarten.',
        'Mia and Emma send ___ messages every evening.', 'The two teams shook hands with ___ after the game.']);
      return E(q, 'each other', ['themselves', 'theirselves', 'each others'].concat(q.startsWith('We') ? ['ourselves'] : []),
        'each other = sich gegenseitig/einander.');
    }
    const S = pick(RF_S), v = pick(RF_V);
    const c = S.refl;
    const pool = ALL_RF.filter(x => x !== c && x !== 'yourself' && x !== 'yourselves' && x !== 'itself');
    return E(`${cap(S.s)} ${v.replace('___', '___')}.`, c, wr(c, [FAKE_RF[c], ...shuffle(pool).slice(0, 3)]).slice(0, 3),
      `${S.p} → ${c}`);
  };

  // ---------------------------------------------------------------- question tags
  const TAG_S = [subj('I', 'I'), subj('you', 'you'), subj('we', 'we'), subj('Tom', 'm'), subj('Ben', 'm'), subj('your dad', 'm'), subj('Haaland', 'm'),
    subj('Lisa', 'f'), subj('Emma', 'f'), subj('your mum', 'f'), subj('the players', 'pl'), subj('your friends', 'pl'), subj('the twins', 'pl')];
  const TAG_ALT = { is: 'does', are: 'do', am: 'do', was: 'did', were: 'did', does: 'is', do: 'are', did: 'was', has: 'is', have: 'are', can: 'does', will: 'does' };
  ENGLISCH.tags = function () {
    const E = en('tags');
    const S = pick(TAG_S), t = rnd(0, 6), negStmt = Math.random() < 0.4;
    let aux, stmt;
    const I = S.p === 'I';
    if (t === 0) {
      aux = I ? 'am' : S.be;
      const x = pick(['tired', 'in the team', 'at the airport', 'late again', 'hungry', 'from Mönchengladbach', 'ready']);
      stmt = `${cap(S.s)} ${negStmt ? NEG[aux] : aux} ${x}`;
    } else if (t === 1) {
      aux = S.was;
      stmt = `${cap(S.s)} ${negStmt ? NEG[aux] : aux} ${pick(['at the stadium yesterday', 'ill last week', 'very happy after the game', 'at home on Sunday'])}`;
    } else if (t === 2) {
      aux = S.do;
      const [b, s3, o] = pick([['like', 'likes', 'planes'], ['play', 'plays', 'football every day'], ['love', 'loves', 'pizza'],
        ['live', 'lives', 'near the stadium'], ['want', 'wants', 'a new bike'], ['watch', 'watches', 'every Gladbach game']]);
      stmt = negStmt ? `${cap(S.s)} ${NEG[aux]} ${b} ${o}` : `${cap(S.s)} ${S.t3 ? s3 : b} ${o}`;
    } else if (t === 3) {
      aux = 'did';
      const [b, p, o] = pick([['score', 'scored', 'a goal yesterday'], ['see', 'saw', 'the Beluga last week'], ['win', 'won', 'the game on Saturday'],
        ['forget', 'forgot', 'the tickets'], ['call', 'called', 'Grandma last night'], ['buy', 'bought', 'a new ball']]);
      stmt = negStmt ? `${cap(S.s)} didn't ${b} ${o}` : `${cap(S.s)} ${p} ${o}`;
    } else if (t === 4) {
      aux = S.have;
      stmt = `${cap(S.s)} ${negStmt ? NEG[aux] : aux} ${pick(['seen the A380', 'finished the homework', 'been to London', 'eaten all the cookies', 'met Hugo Bolin'])}`;
    } else if (t === 5) {
      aux = 'can';
      stmt = `${cap(S.s)} ${negStmt ? "can't" : 'can'} ${pick(['swim very well', 'speak English', 'juggle a ball', 'play the piano', 'ride a horse'])}`;
    } else {
      aux = 'will';
      stmt = `${cap(S.s)} ${negStmt ? "won't" : 'will'} ${pick(['come to the party', 'be at the game', 'help us', 'call back later'])}`;
    }
    const p = S.p;
    let c, w;
    if (I && aux === 'am') {
      c = negStmt ? 'am I' : "aren't I";
      w = negStmt ? ["aren't I", 'do I', 'are I'] : ['am I', "isn't I", "don't I"];
    } else {
      const tagAux = negStmt ? aux : NEG[aux], sameAux = negStmt ? NEG[aux] : aux;
      const alt = TAG_ALT[aux] === 'does' && !S.t3 ? 'do' : TAG_ALT[aux] === 'is' && !S.t3 ? 'are' : TAG_ALT[aux] === 'was' && !S.t3 && !I ? 'were' : TAG_ALT[aux];
      const altF = negStmt ? alt : NEG[alt];
      const wrongP = p === 'he' ? 'she' : p === 'she' ? 'he' : p === 'they' ? 'he' : p === 'we' ? 'they' : p === 'you' ? 'they' : 'you';
      c = `${tagAux} ${p}`;
      w = [`${sameAux} ${p}`, `${altF} ${p}`, `${tagAux} ${wrongP}`];
      if (S.s !== p && !['your dad', 'your mum', 'the players', 'your friends', 'the twins'].includes(S.s)) w.push(`${tagAux} ${S.s}`);
    }
    return E(`${stmt}, ___?`, c, wr(c, w), 'Bejahter Satz → verneinter Anhang, verneinter Satz → bejahter Anhang; Hilfsverb + Pronomen.');
  };
  // ---------------------------------------------------------------- passive (simple present / simple past)
  // s, plural?, pp, base, s3, past, present tail, past tail, agent
  const PV = [
    ['The plane', false, 'cleaned', 'clean', 'cleans', 'cleaned', 'after every flight', 'last night', 'the cleaning team'],
    ['The planes', true, 'checked', 'check', 'checks', 'checked', 'before every flight', 'yesterday', 'the mechanics'],
    ['The Beluga', false, 'loaded', 'load', 'loads', 'loaded', 'every morning', 'two hours ago', 'the workers'],
    ['The tickets', true, 'sold', 'sell', 'sells', 'sold', 'online', 'last week', 'the club'],
    ['The match', false, 'shown', 'show', 'shows', 'showed', 'on TV', 'on TV last Saturday', null],
    ['The goal', false, 'scored', 'score', 'scores', 'scored', null, 'in the last minute', 'Kleindienst'],
    ['The letters', true, 'written', 'write', 'writes', 'wrote', 'in English', 'last Monday', 'the pupils'],
    ['The pizzas', true, 'made', 'make', 'makes', 'made', 'in a stone oven', 'an hour ago', 'Mario'],
    ['The window', false, 'broken', 'break', 'breaks', 'broke', null, 'last night', 'a football'],
    ['My bike', false, 'stolen', 'steal', 'steals', 'stole', null, 'last week', null],
    ['The shirts', true, 'washed', 'wash', 'washes', 'washed', 'after every game', 'yesterday', 'the kit manager'],
    ['English', false, 'spoken', 'speak', 'speaks', 'spoke', 'in many countries', null, null],
    ['The new sports hall', false, 'built', 'build', 'builds', 'built', null, 'two years ago', 'a big company'],
    ['The parcels', true, 'sent', 'send', 'sends', 'sent', 'every day', 'yesterday', 'the shop'],
    ['The classrooms', true, 'cleaned', 'clean', 'cleans', 'cleaned', 'every afternoon', 'yesterday', 'the caretaker'],
    ['The cake', false, 'eaten', 'eat', 'eats', 'ate', null, 'in five minutes', 'the kids'],
    ['The photos', true, 'taken', 'take', 'takes', 'took', null, 'last summer', 'my dad'],
    ['Breakfast', false, 'served', 'serve', 'serves', 'served', 'at seven o’clock', 'at seven o’clock yesterday', null],
    ['The car', false, 'repaired', 'repair', 'repairs', 'repaired', null, 'yesterday', 'my uncle'],
    ['The homework', false, 'checked', 'check', 'checks', 'checked', 'every Monday', 'yesterday', 'the teacher'],
    ['The game', false, 'played', 'play', 'plays', 'played', null, 'last Saturday', null],
    ['Many planes', true, 'built', 'build', 'builds', 'built', 'in Toulouse', null, null],
    ['The doors', true, 'opened', 'open', 'opens', 'opened', 'at six o’clock', 'an hour ago', null],
    ['The trophy', false, 'won', 'win', 'wins', 'won', null, 'last season', 'our school team'],
    ['The tests', true, 'marked', 'mark', 'marks', 'marked', 'every week', 'last weekend', 'Mrs Miller'],
    ['The emails', true, 'answered', 'answer', 'answers', 'answered', 'every morning', 'yesterday', 'the coach'],
    ['The ball', false, 'kicked', 'kick', 'kicks', 'kicked', null, 'over the fence yesterday', 'my brother'],
    ['The new players', true, 'presented', 'present', 'presents', 'presented', null, 'last Friday', 'the club'],
    ['The food', false, 'cooked', 'cook', 'cooks', 'cooked', 'fresh every day', 'last night', 'my mum'],
    ['The songs', true, 'sung', 'sing', 'sings', 'sang', 'before every game', 'last Saturday', 'the fans'],
    ['The new boots', true, 'bought', 'buy', 'buys', 'bought', null, 'last week', 'my dad'],
    ['The fence', false, 'painted', 'paint', 'paints', 'painted', null, 'last summer', 'my grandpa'],
    ['The keys', true, 'found', 'find', 'finds', 'found', null, 'under the sofa yesterday', 'my sister'],
    ['The email', false, 'sent', 'send', 'sends', 'sent', null, 'an hour ago', 'the coach'],
    ['The suitcases', true, 'loaded', 'load', 'loads', 'loaded', 'onto the plane', 'an hour ago', 'the ground crew'],
    ['The penalty', false, 'saved', 'save', 'saves', 'saved', null, 'in the last minute', 'our goalkeeper'],
    ['The new song', false, 'played', 'play', 'plays', 'played', 'on the radio', 'on the radio yesterday', null],
    ['The windows', true, 'cleaned', 'clean', 'cleans', 'cleaned', 'every Friday', 'last Friday', 'the window cleaner'],
    ['The pupils', true, 'taught', 'teach', 'teaches', 'taught', 'English every day', null, null],
    ['The stadium', false, 'filled', 'fill', 'fills', 'filled', null, 'in ten minutes', 'the fans'],
    ['The museum', false, 'visited', 'visit', 'visits', 'visited', 'by many tourists', 'last weekend', 'our class'],
  ].map(([s, pl, pp, base, s3, past, tp, tpast, agent]) => ({ s, pl, pp, base, s3, past, tp, tpast, agent }));
  const capAgent = a => a;
  const lowS = s => (/^(The|My|Many) /.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s);
  ENGLISCH.passive = function () {
    const E = en('passive');
    const v = pick(PV), t = rnd(0, 6);
    const be = v.pl ? 'are' : 'is', wbe = v.pl ? 'is' : 'are', was = v.pl ? 'were' : 'was', wwas = v.pl ? 'was' : 'were';
    if ((t === 0 || t === 1) && v.tp) {
      const c = `${be} ${v.pp}`;
      return E(`Passive (simple present): ${v.s} ___ (${v.base}) ${v.tp}.`, c,
        wr(c, [`${wbe} ${v.pp}`, v.pl ? v.base : v.s3, v.base !== v.pp ? `${be} ${v.base}` : null, v.past !== v.pp ? `${be} ${v.past}` : `${be} ${v.s3}`]),
        'Passiv simple present: am/is/are + 3. Form.');
    }
    if (t <= 2 && v.tpast) {
      const c = `${was} ${v.pp}`;
      return E(`Passive (simple past): ${v.s} ___ (${v.base}) ${v.tpast}.`, c,
        wr(c, [`${wwas} ${v.pp}`, `${be} ${v.pp}`, v.past, v.base !== v.pp ? `${was} ${v.base}` : `${was} ${v.base}ed`]),
        'Passiv simple past: was/were + 3. Form.');
    }
    if (t === 5 && Math.random() < 0.6 && (v.tp || v.tpast)) {
      const past = !v.tp || (v.tpast && Math.random() < 0.5);
      const tail = past ? v.tpast : v.tp, aux = past ? was : be, waux = past ? wwas : wbe;
      if (Math.random() < 0.5) {
        const c = `${NEG[aux]} ${v.pp}`;
        return E(`Passive (simple ${past ? 'past' : 'present'}): ${v.s} ___ (not ${v.base}) ${tail}.`, c,
          wr(c, [`${NEG[waux]} ${v.pp}`, `${NEG[past ? 'did' : (v.pl ? 'do' : 'does')]} ${v.base}`, v.base !== v.pp ? `${NEG[aux]} ${v.base}` : `${NEG[aux]} ${v.base}ed`]),
          `Verneintes Passiv: ${NEG[aux]} + 3. Form.`);
      }
      const c = cap(aux);
      return E(`Passive: ___ ${lowS(v.s)} ${v.pp} ${tail}?`, c, wr(c, [cap(waux), past ? 'Did' : (v.pl ? 'Do' : 'Does'), past ? cap(be) : (v.pl ? 'Have' : 'Has')]),
        `Frage im Passiv: ${aux} + Subjekt + 3. Form?`);
    }
    if (t === 3 && v.agent) {
      const pre = v.tpast ? `${v.s} ${was} ${v.pp} ___ ${capAgent(v.agent)}.` : `${v.s} ${be} ${v.pp} ___ ${v.agent}.`;
      return E(pre, 'by', ['from', 'of', 'at'], 'Wer etwas tut, wird im Passiv mit „by“ angeschlossen.');
    }
    if (t === 4 && v.agent && v.tpast) {
      const agentS = cap(v.agent);
      const act = `${agentS} ${v.past} ${lowS(v.s)}.`;
      const c = `${v.s} ${was} ${v.pp} by ${v.agent}.`;
      if (c.length <= 46) {
        return E(`Setze ins Passiv: „${act}“`, c,
          [`${v.s} ${wwas} ${v.pp} by ${v.agent}.`, `${v.s} ${be} ${v.pp} by ${v.agent}.`, `${v.s} ${was} ${v.past === v.pp ? v.base : v.past} by ${v.agent}.`],
          'Objekt wird Subjekt; was/were + 3. Form; Handelnder mit „by“.');
      }
    }
    // active or passive?
    const passive = !v.tpast || Math.random() < 0.5;
    let sent;
    if (passive) sent = v.tpast ? `${v.s} ${was} ${v.pp} ${v.tpast}.` : `${v.s} ${be} ${v.pp} ${v.tp}.`;
    else {
      const ag = v.agent ? cap(v.agent) : pick(['Tom', 'My dad', 'Lisa']);
      sent = `${ag} ${v.past} ${lowS(v.s)} ${v.tpast}.`;
    }
    return E(`Active oder Passive? „${sent}“`, passive ? 'Passive' : 'Active', [passive ? 'Active' : 'Passive'],
      passive ? 'be (is/are/was/were) + 3. Form → Passive.' : 'Das Subjekt handelt selbst → Active.');
  };

  // ---------------------------------------------------------------- much / many / a lot of / a few / a little
  const QN_C = [['goals', 'score', 'scored'], ['tickets', 'buy', 'bought'], ['photos', 'take', 'took'], ['friends', 'meet', 'met'],
    ['books', 'read', 'read'], ['apples', 'eat', 'ate'], ['planes', 'see', 'saw'], ['games', 'win', 'won'], ['mistakes', 'make', 'made'],
    ['questions', 'ask', 'asked'], ['points', 'get', 'got'], ['emails', 'write', 'wrote'], ['sandwiches', 'make', 'made'],
    ['cookies', 'bake', 'baked'], ['bottles of water', 'drink', 'drank'], ['postcards', 'send', 'sent']];
  const QN_U = [['water', 'drink', 'drank'], ['money', 'spend', 'spent'], ['homework', 'do', 'did'], ['juice', 'drink', 'drank'],
    ['bread', 'eat', 'ate'], ['time', 'spend', 'spent'], ['fun', 'have', 'had'], ['luggage', 'take', 'took'], ['information', 'find', 'found'],
    ['milk', 'drink', 'drank'], ['rice', 'eat', 'ate'], ['music', 'listen to', 'listened to'], ['advice', 'get', 'got'],
    ['cheese', 'buy', 'bought'], ['pasta', 'cook', 'cooked'], ['chocolate', 'eat', 'ate']];
  const QN_S = [subj('you', 'you'), subj('Tom', 'm'), subj('Lisa', 'f'), subj('your friends', 'pl'), subj('the team', 'm'), subj('Ben', 'm'),
    subj('Emma', 'f'), subj('your parents', 'pl'), subj('Kleindienst', 'm'), subj('Mia', 'f')];
  const QN_T = ['yesterday', 'last week', 'at the weekend', 'in the holidays', 'on Saturday'];
  ENGLISCH.quantity = function () {
    const E = en('quantity');
    const count = Math.random() < 0.5, [n, b, p] = pick(count ? QN_C : QN_U);
    const S = pick(QN_S), t = rnd(0, 3), tail = pick(QN_T);
    const S2 = S.s === 'you' ? 'I' : S.s, s2 = S.s === 'the team' ? 'The team' : cap(S2);
    if (n === 'goals' && S.s === 'you' && t === 0) return ENGLISCH.quantity();
    if (t === 0) {
      const c = count ? 'many' : 'much';
      return E(`How ___ ${n} did ${S.s} ${b}?`, c, count ? ['much', 'a lot', 'lot of'] : ['many', 'a lot', 'lot of'],
        count ? `„${n}“ ist zählbar → How many …?` : `„${n}“ ist nicht zählbar → How much …?`);
    }
    if (t === 1) {
      const c = count ? 'many' : 'much';
      return E(`${s2} didn't ${b} ___ ${n} ${tail}.`, c, count ? ['much', 'lot', 'a few of'] : ['many', 'lot', 'a few'],
        count ? 'zählbar + Verneinung → not many.' : 'nicht zählbar + Verneinung → not much.');
    }
    if (t === 2) {
      return E(`${s2} ${p} ___ ${n} ${tail}. (= viel${count ? 'e' : ''})`, 'a lot of', count ? ['much', 'a lot', 'lot'] : ['many', 'a lot', 'lot'],
        'In bejahten Sätzen: a lot of (für zählbare und nicht zählbare Nomen).');
    }
    const c = count ? 'a few' : 'a little';
    return E(`${s2} ${p} ___ ${n} ${tail}. (= ${count ? 'ein paar' : 'ein bisschen'})`, c, count ? ['a little', 'much', 'a lot'] : ['a few', 'many', 'a lot'],
      count ? 'zählbar → a few (ein paar).' : 'nicht zählbar → a little (ein bisschen).');
  };

  // ---------------------------------------------------------------- present perfect progressive
  const PPA = [['wait', 'waiting', 'for the bus'], ['play', 'playing', 'FIFA'], ['learn', 'learning', 'English'],
    ['train', 'training', 'for the big game'], ['watch', 'watching', 'planes at the airport'], ['read', 'reading', 'this book'],
    ['practise', 'practising', 'penalties'], ['look', 'looking', 'for {pos} boots'], ['work', 'working', 'on the project'],
    ['sit', 'sitting', 'here'], ['run', 'running', 'in the park'], ['write', 'writing', '{pos} essay'], ['clean', 'cleaning', '{pos} room'],
    ['talk', 'talking', 'on the phone'], ['build', 'building', 'a model of the A380'], ['save', 'saving', 'money for new boots'],
    ['tidy', 'tidying', 'the garage'], ['sing', 'singing', 'in the choir']];
  const PP_SINCE = ['8 o’clock', 'Monday', 'this morning', 'lunchtime', '2022', 'last summer', 'the start of the lesson', 'breakfast', 'Christmas'];
  const PP_FOR = ['two hours', 'ten minutes', 'three weeks', 'a long time', 'ages', 'half an hour', 'two years', 'five days'];
  ENGLISCH.perfprog = function () {
    const E = en('perfprog');
    const S = pick(SUBJ_PEOPLE), [base, ing, restRaw] = pick(PPA), rest = fillS(restRaw, S);
    const useSince = Math.random() < 0.5, time = pick(useSince ? PP_SINCE : PP_FOR), sf = useSince ? 'since' : 'for';
    const be = S.p === 'I' ? 'am' : S.be;
    const t = rnd(0, 4);
    const expl = useSince ? '„since“ + Zeitpunkt (seit 8 Uhr, seit Montag).' : '„for“ + Zeitraum (seit zwei Stunden, seit drei Wochen).';
    if (t <= 1) {
      return E(`${cap(S.s)} ${S.have} been ${ing} ${rest} ___ ${time}.`, sf, [useSince ? 'for' : 'since', 'ago', 'from'], expl);
    }
    if (t <= 3) {
      const c = `${S.have} been ${ing}`;
      if (Math.random() < 0.25) {
        const cr = 'has been raining';
        return E(`It ___ (rain) ${sf} ${time}.`, cr, ['have been raining', 'is raining', 'has been rain', 'has raining'],
          'Handlung dauert bis jetzt an → present perfect progressive: has/have been + -ing.');
      }
      return E(`${cap(S.s)} ___ (${base}) ${rest} ${sf} ${time}.`, c,
        wr(c, [`${otherHave(S)} been ${ing}`, `${S.have} been ${base}`, `${be} ${ing}`, `${S.have} ${ing}`]),
        'Handlung dauert bis jetzt an → present perfect progressive: have/has + been + -ing.');
    }
    const Q = pick([subj('you', 'you'), subj('Tom', 'm'), subj('Lisa', 'f'), subj('your friends', 'pl'), subj('the twins', 'pl'), subj('Ben', 'm'), subj('Mia', 'f')]);
    const c = cap(Q.have);
    return E(`How long ___ ${Q.s} been ${ing} ${fillS(restRaw, Q)}?`, c, wr(c, [cap(otherHave(Q)), cap(Q.be), cap(Q.do)]),
      'Frage im present perfect progressive: How long have/has … been + -ing?');
  };

  Object.assign(SUBJECTS.englisch.topics, {
    perfprog: 'Present perfect progressive', if1: 'If-clauses type 1', if2: 'If-clauses type 2',
    somebody: 'some-, any-, no-, every-', reflexive: 'Reflexive pronouns', tags: 'Question tags',
    passive: 'Passive', quantity: 'much, many, a lot of', adverbs: 'Adverbs of manner',
  });
  // ================================================================ DEUTSCH
  const de = topic => (q, c, w, e) => make('deutsch', topic, q, c, w, e);

  // ---------------------------------------------------------------- das / dass
  const DASS_C = ['Gladbach heute gewinnt', 'Kleindienst zweimal trifft', 'die Beluga morgen landet', 'wir am Samstag ins Stadion gehen',
    'der Test leicht wird', 'es morgen regnet', 'Tom ein neues Fahrrad bekommt', 'der A380 zwei Decks hat', 'unser Flug Verspätung hat',
    'die Ferien bald beginnen', 'Lisa ihre Hausaufgaben vergessen hat', 'Hugo Bolin heute spielt', 'das Training ausfällt',
    'Oma uns am Sonntag besucht', 'wir eine Klassenfahrt machen', 'der Trainer zufrieden ist', 'Papa heute Pizza bestellt',
    'das Spiel spannend wird', 'Mia die beste Torhüterin ist', 'wir im Sommer nach Toulouse fliegen'];
  const DASS_I = ['Ich hoffe,', 'Ich glaube,', 'Der Trainer sagt,', 'Lisa erzählt,', 'Papa meint,', 'Ich habe gehört,', 'Wir wissen,',
    'Tom behauptet,', 'Mama sagt,', 'Ich denke,', 'Ich bin sicher,', 'Im Radio heißt es,'];
  const DASS_IQ = ['Weißt du,', 'Hast du gehört,', 'Glaubst du,'];
  const DASS_R = ['freut mich.', 'finde ich super.', 'ist eine gute Nachricht.', 'überrascht mich.', 'hat mir Tom erzählt.'];
  const DAS_REL = [
    ['Flugzeug', ['dort drüben landet', 'wir gestern gesehen haben', 'aus Hamburg kommt'], ['ist eine Beluga', 'ist riesig', 'hat Verspätung']],
    ['Trikot', ['ich mir wünsche', 'Tom heute trägt', 'im Schaufenster hängt'], ['ist grün-weiß', 'kostet 80 Euro', 'ist von Gladbach']],
    ['Spiel', ['wir gestern gesehen haben', 'am Samstag stattfand', 'Papa im Radio gehört hat'], ['war spannend', 'endete unentschieden', 'dauerte sehr lange']],
    ['Fahrrad', ['ich zum Geburtstag bekommen habe', 'vor der Schule steht', 'Lisa gehört'], ['ist rot', 'hat zehn Gänge', 'ist ganz neu']],
    ['Buch', ['ich gerade lese', 'auf dem Tisch liegt', 'Oma mir geschenkt hat'], ['handelt von Flugzeugen', 'ist spannend', 'hat 300 Seiten']],
    ['Tor', ['Kleindienst geschossen hat', 'in der letzten Minute fiel', 'alle bejubelt haben'], ['war wunderschön', 'entschied das Spiel', 'war das 2:1']],
    ['Mädchen', ['neben mir sitzt', 'im Tor steht', 'so schnell rennt'], ['heißt Mia', 'ist meine Cousine', 'spielt im Verein']],
    ['Handy', ['ich verloren habe', 'auf dem Sofa liegt', 'Papa gekauft hat'], ['ist neu', 'hat eine blaue Hülle', 'gehört meiner Schwester']],
    ['Stadion', ['wir besuchen', 'in Mönchengladbach steht', 'heute voll ist'], ['ist riesig', 'ist ausverkauft', 'hat ein Dach']],
    ['Training', ['heute stattfindet', 'um 17 Uhr beginnt', 'der neue Trainer leitet'], ['dauert zwei Stunden', 'ist anstrengend', 'macht Spaß']],
    ['Geschenk', ['ich von Oma bekommen habe', 'unter dem Baum liegt', 'Tom eingepackt hat'], ['ist ein Ball', 'ist riesig', 'ist für dich']],
    ['Ticket', ['ich gewonnen habe', 'in meiner Tasche steckt', 'Papa online gekauft hat'], ['ist für das Derby', 'gilt für Samstag', 'war teuer']],
    ['Video', ['wir gedreht haben', 'im Internet läuft', 'Tom gepostet hat'], ['ist lustig', 'zeigt die Beluga', 'hat viele Klicks']],
    ['Auto', ['vor unserem Haus parkt', 'Papa gekauft hat', 'so laut hupt'], ['ist rot', 'ist sehr alt', 'gehört dem Nachbarn']],
  ];
  const NEUTR = ['Flugzeug', 'Trikot', 'Spiel', 'Fahrrad', 'Buch', 'Tor', 'Handy', 'Stadion', 'Training', 'Geschenk', 'Ticket', 'Video', 'Auto', 'Foto', 'Zeugnis'];
  const DAS_ART = ['Ich finde ___ neue {N} super.', 'Hast du ___ {N} gesehen?', 'Tom mag ___ {N} sehr.', 'Wo ist ___ {N}?', '___ {N} ist toll.', 'Zeig mir mal ___ {N}!'];
  const DAS_DEM = ['___ ist ja super!', 'Hast du ___ gehört?', '___ glaube ich nicht.', 'Wer hat ___ gemacht?', '___ war ein tolles Spiel!',
    'Ich weiß ___ schon.', '___ stimmt nicht!', 'Kannst du ___ noch einmal sagen?', '___ ist mein Lieblingsflugzeug.', 'Wer hat dir ___ erzählt?',
    '___ habe ich nicht gewusst.', 'Ist ___ dein Trikot?'];
  const dasOpts = q => (q.startsWith('___') ? ['Das', 'Dass'] : ['das', 'dass']);
  DEUTSCH.dassdas = function () {
    const D = de('dassdas'), t = rnd(0, 5);
    const EX_DASS = '„dass“ ist eine Konjunktion: Sie leitet einen Nebensatz ein und lässt sich nicht durch „dieses“ oder „welches“ ersetzen.';
    if (t <= 1) {
      const qi = Math.random() < 0.2;
      const q = `${pick(qi ? DASS_IQ : DASS_I)} ___ ${pick(DASS_C)}${qi ? '?' : '.'}`;
      return D(`Ergänze: ${q}`, 'dass', ['das'], EX_DASS);
    }
    if (t === 2) return D(`Ergänze: ___ ${pick(DASS_C)}, ${pick(DASS_R)}`, 'Dass', ['Das'], EX_DASS);
    if (t === 3) {
      const [n, rel, pred] = pick(DAS_REL);
      return D(`Ergänze: Das ${n}, ___ ${pick(rel)}, ${pick(pred)}.`, 'das', ['dass'], 'Relativpronomen „das“ – man kann „welches“ einsetzen.');
    }
    if (t === 4) {
      const f = pick(DAS_ART), q = fill(f, { N: pick(NEUTR) });
      const opts = dasOpts(q);
      return D(`Ergänze: ${q}`, opts[0], [opts[1]], 'Artikel „das“ vor einem Nomen.');
    }
    const q = pick(DAS_DEM), opts = dasOpts(q);
    return D(`Ergänze: ${q}`, opts[0], [opts[1]], '„das“ als Pronomen – man kann „dies“ einsetzen.');
  };

  // ---------------------------------------------------------------- tagged sentences (Wortarten + Satzglieder)
  // Phrases separated by " | ", "CODE: tokens". Token "Wort_T" (T = Wortart), untagged words have no suffix, "~" joins names.
  const WA = { N: 'Nomen', V: 'Verb', J: 'Adjektiv', A: 'Artikel', R: 'Präposition', K: 'Konjunktion', D: 'Adverb', U: 'Pronomen' };
  const WA_ART = { N: 'ein Nomen', V: 'ein Verb', J: 'ein Adjektiv', A: 'ein Artikel', R: 'eine Präposition', K: 'eine Konjunktion', D: 'ein Adverb', U: 'ein Pronomen' };
  const SG = { S: 'Subjekt', P: 'Prädikat', AO: 'Akkusativobjekt', DO: 'Dativobjekt', Z: 'Adverbiale (Zeit)', O: 'Adverbiale (Ort)', G: 'Adverbiale (Grund)', W: 'Adverbiale (Art und Weise)' };
  const SG_FIND = { S: 'das Subjekt (Wer oder was?)', P: 'das Prädikat', AO: 'das Akkusativobjekt (Wen oder was?)', DO: 'das Dativobjekt (Wem?)',
    Z: 'die Zeitangabe (Wann?)', O: 'die Ortsangabe (Wo? Wohin?)', G: 'die Begründung (Warum?)', W: 'die Art und Weise (Wie?)' };
  const SG_Q = { S: 'Wer oder was?', AO: 'Wen oder was?', DO: 'Wem?', Z: 'Wann?', O: 'Wo oder wohin?', G: 'Warum?', W: 'Wie?' };
  const TS_RAW = [
    'S: Der_A schnelle_J Stürmer_N | P: schießt_V | AO: den_A Ball_N | O: ins_R Tor_N',
    'Z: Am_R Samstag_N | P: spielt_V | S: Gladbach_N | O: im_R Borussia-Park_N',
    'S: Die_A riesige_J Beluga_N | P: landet_V | Z: heute_D | O: in_R Hamburg_N',
    'S: Der_A Trainer_N | P: gibt_V | DO: dem_A jungen_J Spieler_N | AO: einen_A Tipp_N',
    'S: Wir_U | P: fliegen_V | Z: morgen_D | O: nach_R Toulouse_N',
    'S: Haaland_N | P: schenkt_V | DO: dem_A Kind_N | AO: einen_A Ball_N',
    'Z: Gestern_D | P: half_V | S: ich_U | DO: der_A Lehrerin_N',
    'S: Die_A Fans_N | P: singen_V | W: laut | O: im_R Stadion_N',
    'G: Wegen_R des_A Regens_N | X: fällt_V | S: das_A Training_N | X: aus',
    'S: Der_A Pilot_N | P: begrüßt_V | AO: die_A Passagiere_N | W: sehr freundlich',
    'S: Mia_N | P: wirft_V | DO: dem_A Torwart_N | AO: den_A Ball_N',
    'S: Der_A Airbus_N | P: startet_V | Z: um_R acht Uhr_N',
    'S: Die_A Lehrerin_N | P: erklärt_V | DO: uns_U | AO: die_A Aufgabe_N',
    'Z: Nach_R dem_A Spiel_N | P: feiern_V | S: die_A Spieler_N | O: in_R der_A Kabine_N',
    'S: Er_U | P: trainiert_V | G: wegen_R der_A Verletzung_N | O: im_R Kraftraum_N',
    'S: Das_A kleine_J Mädchen_N | P: bewundert_V | AO: das_A große_J Flugzeug_N',
    'S: Wir_U | P: besuchen_V | Z: oft_D | AO: die_A Großeltern_N',
    'S: Kleindienst_N | P: köpft_V | AO: den_A Ball_N | W: mit_R voller_J Wucht_N',
    'O: Im_R Hangar_N | P: steht_V | S: eine_A alte_J Antonow_N',
    'S: Die_A Kinder_N | P: warten_V | W: geduldig | O: am_R Gate_N',
    'S: Ich_U | P: schreibe_V | DO: dem_A Spieler_N | AO: einen_A Brief_N',
    'S: Der_A Schiedsrichter_N | P: zeigt_V | DO: dem_A Verteidiger_N | AO: eine_A Karte_N',
    'G: Aus_R Angst_N | P: schließt_V | S: Ben_N | AO: die_A Augen_N',
    'S: Wir_U | P: spielen_V | Z: morgen_D | O: dort_D',
    'Z: Bald_D | P: beginnen_V | S: die_A Ferien_N',
    'S: Der_A Ball_N | P: liegt_V | O: unter_R der_A Bank_N',
    'S: Tom_N | P: kauft_V | DO: seiner Oma_N | AO: Blumen_N',
    'S: Ich_U | P: lerne_V | Z: jeden Tag_N | AO: neue_J Vokabeln_N',
    'S: Die_A Mannschaft_N | P: verliert_V | X: leider_D | AO: das_A Finale_N',
    'S: Er_U | P: rennt_V | O: über_R den_A Platz_N',
    'S: Der_A Torwart_N | P: hält_V | AO: den_A Elfmeter_N | Z: in_R der_A letzten_J Minute_N',
    'S: Ronaldo_N | P: unterschreibt_V | DO: dem_A Jungen_N | AO: ein_A Trikot_N',
    'S: Die_A Passagiere_N | P: steigen_V | O: in_R den_A A380_N',
    'W: Mit_R großer_J Freude_N | P: begrüßen_V | S: die_A Fans_N | AO: das_A Team_N',
    'Z: Jetzt_D | P: erzählt_V | S: Opa_N | DO: uns_U | AO: eine_A Geschichte_N',
    'G: Wegen_R des_A Nebels_N | P: wartet_V | S: das_A Flugzeug_N | O: auf_R dem_A Rollfeld_N',
    'S: Die_A Schüler_N | P: lesen_V | AO: ein_A spannendes_J Buch_N',
    'S: Lisa_N | P: trinkt_V | Z: morgens_D | AO: Kakao_N',
    'Z: Im_R Winter_N | P: trainieren_V | S: wir_U | O: in_R der_A Halle_N',
    'S: Der_A Mechaniker_N | P: repariert_V | Z: heute_D | AO: den_A Motor_N',
    'S: Opa_N | P: schenkt_V | DO: mir_U | AO: ein_A neues_J Trikot_N',
    'S: Die_A Beluga_N | P: transportiert_V | AO: riesige_J Flügel_N',
    'Z: Am_R Abend_N | P: schauen_V | S: wir_U | AO: das_A Spiel_N',
    'S: Bruno~Fernandes_N | P: passt_V | AO: den_A Ball_N | W: sehr genau',
    'S: Die_A Fans_N | P: feiern_V | G: wegen_R des_A Sieges_N | O: auf_R der_A Straße_N',
    'S: Der_A Pilot_N | P: landet_V | AO: die_A Maschine_N | W: ganz sanft',
    'O: Auf_R dem_A Schulhof_N | P: spielen_V | S: die_A Kinder_N | AO: Fußball_N',
    'S: Die_A Oma_N | P: backt_V | DO: uns_U | AO: einen_A leckeren_J Kuchen_N',
    'S: Sie_U | P: liest_V | Z: abends_D | AO: Comics_N',
    'S: Jens~Castrop_N | P: läuft_V | O: zur_R Eckfahne_N',
    'G: Wegen_R der_A Hitze_N | P: trinken_V | S: die_A Spieler_N | AO: viel Wasser_N',
    'S: Hugo~Bolin_N | P: zeigt_V | DO: den_A Fans_N | AO: sein Trikot_N',
    'Z: Am_R Montag_N | P: schreiben_V | S: wir_U | AO: einen_A schweren_J Test_N',
    'S: Der_A neue_J Torwart_N | P: hält_V | Z: heute_D | AO: jeden Ball_N',
    'S: Papa_N | P: kauft_V | DO: mir_U | AO: ein_A Modellflugzeug_N | O: in_R Toulouse_N',
    'X: Wir_U spielen_V, weil_K es_U Spaß_N macht_V',
    'X: Ich_U trainiere_V, obwohl_K es_U regnet_V',
    'X: Tom_N lacht_V, denn_K das_A Video_N ist_V lustig_J',
    'X: Kleindienst_N trifft_V, aber_K Gladbach_N verliert_V',
    'X: Wir_U warten_V, bis_K das_A Flugzeug_N landet_V',
    'X: Ich_U hoffe_V, dass_K wir_U gewinnen_V',
    'X: Lisa_N liest_V und_K Ben_N malt_V',
    'X: Sie_U fliegen_V nach_R London_N, sobald_K der_A Nebel_N verschwindet_V',
    'X: Wenn_K die_A Sonne_N scheint_V, spielen_V wir_U draußen_D',
    'X: Die_A Fans_N jubeln_V, nachdem_K Haaland_N getroffen_V hat_V',
    'X: Ich_U esse_V Pizza_N oder_K ich_U koche_V Nudeln_N',
    'X: Bevor_K das_A Spiel_N beginnt_V, singen_V die_A Fans_N',
    'X: Das_A Wetter_N ist_V heute_D schön_J',
    'X: Wir_U fahren_V mit_R dem_A Bus_N zum_R Flughafen_N',
  ];
  const TS = TS_RAW.map(raw => raw.split(' | ').map(ph => {
    const i = ph.indexOf(': ');
    const code = ph.slice(0, i);
    const toks = ph.slice(i + 2).split(' ').map(tk => {
      const m = tk.match(/^([^_,]+)(?:_([A-Z]))?(,?)$/);
      return { w: m[1].replace(/~/g, ' '), tag: m[2] || null, punct: m[3] };
    });
    return { code, toks };
  }));
  const tokStr = t => t.w + t.punct;
  const sentStr = (s, markTok, markPh) => {
    const parts = s.map((ph, pi) => {
      const words = ph.toks.map(t => (t === markTok ? `„${t.w}“${t.punct}` : tokStr(t))).join(' ');
      return pi === markPh ? `„${words}“` : words;
    });
    return parts.join(' ') + '.';
  };
  DEUTSCH.wortarten = function () {
    const D = de('wortarten');
    if (Math.random() < 0.06) {
      const [s, c] = pick(WORTARTEN);
      return D(`Welche Wortart hat das markierte Wort? ${mark(s)}`, c, shuffle(WA_ALL), 'Bestimme die Wortart mit der Ersatz- bzw. Frageprobe.');
    }
    const s = pick(TS), toks = s.flatMap(ph => ph.toks), tagged = toks.filter(t => t.tag);
    if (Math.random() < 0.55) {
      const t = pick(tagged), c = WA[t.tag];
      return D(`Welche Wortart hat das markierte Wort? ${sentStr(s, t, -1)}`, c, shuffle(WA_ALL.filter(x => x !== c)).slice(0, 3),
        `„${t.w}“ ist ${WA_ART[t.tag]}.`);
    }
    const t = pick(tagged), tag = t.tag;
    const sameTagWords = new Set(toks.filter(x => x.tag === tag).map(x => x.w));
    const wrongs = shuffle([...new Set(tagged.filter(x => x.tag !== tag && !sameTagWords.has(x.w)).map(x => x.w))]).slice(0, 3);
    if (wrongs.length < 2) return DEUTSCH.wortarten();
    return D(`Welches Wort ist ${WA_ART[tag]}? „${sentStr(s, null, -1)}“`, t.w, wrongs, `„${t.w}“ ist ${WA_ART[tag]}.`);
  };
  DEUTSCH.satzglieder = function () {
    const D = de('satzglieder');
    if (Math.random() < 0.05) {
      const [s, c] = pick(SATZGLIEDER);
      return D(`Welches Satzglied ist markiert? ${mark(s)}`, c, shuffle(SG_ALL.filter(x => x !== c)).slice(0, 3),
        'Frage: Wer/Was? → Subjekt, Wem? → Dativobjekt, Wen/Was? → Akkusativobjekt, Wann/Wo/Warum/Wie? → Adverbiale.');
    }
    const s = pick(TS.filter(x => x.some(ph => SG[ph.code])));
    const coded = s.filter(ph => SG[ph.code]);
    const ph = pick(coded), pi = s.indexOf(ph), phText = ph.toks.map(t => t.w).join(' ');
    const t = rnd(0, 2);
    const ex = `„${phText}“ → ${SG[ph.code]}${SG_Q[ph.code] ? ' (' + SG_Q[ph.code] + ')' : ''}.`;
    if (t === 0) {
      return D(`Welches Satzglied ist markiert? ${sentStr(s, null, pi)}`, SG[ph.code], shuffle(SG_ALL.filter(x => x !== SG[ph.code])).slice(0, 3), ex);
    }
    if (t === 1 && SG_Q[ph.code]) {
      const c = SG_Q[ph.code];
      return D(`Mit welcher Frage findest du „${phText}“? ${sentStr(s, null, -1)}`, c,
        shuffle(Object.values(SG_Q).filter(x => x !== c)).slice(0, 3), ex);
    }
    const others = coded.filter(x => x !== ph).map(x => x.toks.map(t2 => t2.w).join(' '));
    const extra = s.filter(x => !SG[x.code]).map(x => x.toks.map(t2 => t2.w).join(' '));
    const wrongs = [...others, ...extra].slice(0, 3);
    if (wrongs.length < 2) return DEUTSCH.satzglieder();
    return D(`Finde ${SG_FIND[ph.code]}: ${sentStr(s, null, -1)}`, phText, wrongs, ex);
  };
  // ---------------------------------------------------------------- Kommasetzung (also used for Satzarten)
  const KM = [['wir', 'spielen', 'Fußball'], ['Tom', 'geht', 'ins Stadion'], ['ich', 'mache', 'meine Hausaufgaben'], ['Lisa', 'ruft', 'ihre Oma an'],
    ['Papa', 'grillt', 'Würstchen'], ['die Fans', 'singen', 'laut'], ['ich', 'lese', 'ein Buch'], ['Mia', 'trainiert', 'draußen'],
    ['die Kinder', 'spielen', 'im Garten'], ['Ben', 'fährt', 'mit dem Rad'], ['wir', 'gehen', 'ins Kino'], ['Oma', 'backt', 'einen Kuchen'],
    ['ich', 'höre', 'Musik'], ['wir', 'machen', 'ein Picknick'], ['Tom', 'spielt', 'FIFA'], ['die Klasse', 'besucht', 'den Flughafen']];
  const KN = [['obwohl', 'es regnet'], ['obwohl', 'es kalt ist'], ['wenn', 'das Wetter gut ist'], ['weil', 'heute Samstag ist'],
    ['sobald', 'alle da sind'], ['nachdem', 'die Schule aus ist'], ['bevor', 'es dunkel wird'], ['während', 'Papa schläft'],
    ['weil', 'wir Ferien haben'], ['obwohl', 'es schon spät ist'], ['weil', 'es Spaß macht'], ['wenn', 'die Sonne scheint']];
  const KUMZU = [['Wir fliegen nach Toulouse', 'um die Beluga zu sehen'], ['Tom trainiert jeden Tag', 'um besser zu werden'],
    ['Lisa spart ihr Taschengeld', 'um ein Trikot zu kaufen'], ['Ich stehe früh auf', 'um den Bus zu erreichen'],
    ['Wir fahren zum Flughafen', 'um Oma abzuholen'], ['Ben lernt Vokabeln', 'um eine gute Note zu bekommen'],
    ['Die Fans kommen früh', 'um gute Plätze zu bekommen'], ['Mia geht nach draußen', 'um Fußball zu spielen'],
    ['Papa kauft Tickets', 'um mit uns ins Stadion zu gehen'], ['Wir bleiben wach', 'um das Spiel zu sehen']];
  const KZEIT = ['Heute', 'Am Samstag', 'Nach der Schule', 'Morgen', 'Am Abend', 'Jeden Tag', 'Im Sommer'];
  const KLIST = ['Schuhe', 'Trikot', 'Ball', 'Handtuch', 'Trinkflasche', 'Stutzen', 'Schienbeinschoner'];
  const lowSubj = x => (['ich', 'wir'].includes(x) || x.startsWith('die ') ? x : x);
  const kmPair = () => {
    for (;;) {
      const m = pick(KM), n = pick(KN);
      if (!n[1].split(' ').some(w => m.join(' ').split(' ').includes(w) && w.length > 3)) return [m, n];
    }
  };
  const buildHN = (m, n, nsFirst) => (nsFirst
    ? { s: `${cap(n[0])} ${n[1]}, ${m[1]} ${lowSubj(m[0])} ${m[2]}.`, hs: `${m[1]} ${lowSubj(m[0])} ${m[2]}`, ns: `${cap(n[0])} ${n[1]}`, at: m[1] }
    : { s: `${cap(m[0])} ${m[1]} ${m[2]}, ${n[0]} ${n[1]}.`, hs: `${cap(m[0])} ${m[1]} ${m[2]}`, ns: `${n[0]} ${n[1]}`, at: n[0] });
  const wordsOf = s => s.replace(/[.,?!]/g, '').split(' ');
  function kommaQ(D, sentence, atWord, ex) {
    const plain = sentence.replace(/,/g, '');
    const ws = wordsOf(plain);
    const once = w => ws.filter(x => x === w).length === 1;
    if (atWord && !once(atWord)) return null;
    const cands = ws.slice(1).filter(w => w !== atWord && once(w)).map(w => `vor „${w}“`);
    const c = atWord ? `vor „${atWord}“` : 'kein Komma nötig';
    const wrongs = shuffle(cands).slice(0, atWord && Math.random() < 0.3 ? 2 : 3);
    if (atWord && wrongs.length < 3) wrongs.push('kein Komma nötig');
    return D(`Wo fehlt das Komma? „${plain}“`, c, wrongs, ex);
  }
  DEUTSCH.komma = function () {
    const D = de('komma'), t = rnd(0, 9);
    let r = null;
    if (t <= 3) {
      const [m, n] = kmPair(), b = buildHN(m, n, t <= 1);
      r = kommaQ(D, b.s, b.at, `Haupt- und Nebensatz werden durch ein Komma getrennt („${n[0]}“ leitet den Nebensatz ein).`);
    } else if (t === 4) {
      const intro = pick(DASS_I).replace(',', '');
      r = kommaQ(D, `${intro}, dass ${pick(DASS_C)}.`, 'dass', 'Vor „dass“ steht immer ein Komma.');
    } else if (t === 5) {
      const [a, b] = pick(KUMZU);
      r = kommaQ(D, `${a}, ${b}.`, 'um', 'Infinitivgruppen mit „um … zu“ werden mit Komma abgetrennt.');
    } else if (t === 6) {
      const m = pick(KM), z = pick(KZEIT);
      r = kommaQ(D, `${z} ${m[1]} ${lowSubj(m[0])} ${m[2]}.`, null, 'Nur ein Hauptsatz mit einer Zeitangabe – hier steht kein Komma.');
    } else if (t === 7) {
      const [a, b, c] = shuffle(KLIST);
      const intro = pick(['Ich packe', 'Tom vergisst', 'Lisa braucht', 'Wir kaufen']);
      const s = `${intro} ${a}, ${b} und ${c}${intro === 'Ich packe' ? ' ein' : ''}.`;
      r = kommaQ(D, s, b, 'Aufzählung: Komma zwischen den Gliedern – aber nicht vor „und“.');
    } else {
      const [n, rel, pred] = pick(DAS_REL), rl = pick(rel), pr = pick(pred);
      const s = `Das ${n} das ${rl} ${pr}.`, ws = wordsOf(s), first = pr.split(' ')[0];
      if (ws.filter(w => w === first).length === 1 && ws.filter(w => w === 'das').length === 1) {
        const other = pick(ws.slice(2).filter(w => w !== first && w !== 'das' && ws.filter(x => x === w).length === 1));
        r = D(`Wo fehlen die Kommas? „${s}“`, `vor „das“ und vor „${first}“`,
          ['nur vor „das“', `nur vor „${first}“`, `vor „das“ und vor „${other}“`],
          'Der Relativsatz wird vorne und hinten durch Kommas abgetrennt.');
      }
    }
    return r || DEUTSCH.komma();
  };

  // ---------------------------------------------------------------- Zeitformen
  // inf, Präsens 3sg, Präteritum 3sg, Präteritum Plural, Partizip II, Hilfsverb (h = haben, s = sein), Ergänzung
  const DV = [
    ['spielen', 'spielt', 'spielte', 'spielten', 'gespielt', 'h', 'Fußball'], ['schießen', 'schießt', 'schoss', 'schossen', 'geschossen', 'h', 'ein Tor'],
    ['fliegen', 'fliegt', 'flog', 'flogen', 'geflogen', 's', 'nach Hamburg'], ['gewinnen', 'gewinnt', 'gewann', 'gewannen', 'gewonnen', 'h', 'das Spiel'],
    ['verlieren', 'verliert', 'verlor', 'verloren', 'verloren', 'h', 'den Schlüssel'], ['singen', 'singt', 'sang', 'sangen', 'gesungen', 'h', 'ein Lied'],
    ['lesen', 'liest', 'las', 'lasen', 'gelesen', 'h', 'ein Buch'], ['schreiben', 'schreibt', 'schrieb', 'schrieben', 'geschrieben', 'h', 'einen Brief'],
    ['essen', 'isst', 'aß', 'aßen', 'gegessen', 'h', 'eine Pizza'], ['trinken', 'trinkt', 'trank', 'tranken', 'getrunken', 'h', 'einen Kakao'],
    ['kaufen', 'kauft', 'kaufte', 'kauften', 'gekauft', 'h', 'neue Schuhe'], ['sehen', 'sieht', 'sah', 'sahen', 'gesehen', 'h', 'die Beluga'],
    ['finden', 'findet', 'fand', 'fanden', 'gefunden', 'h', 'den Ball'], ['rennen', 'rennt', 'rannte', 'rannten', 'gerannt', 's', 'zum Bus'],
    ['fahren', 'fährt', 'fuhr', 'fuhren', 'gefahren', 's', 'nach Köln'], ['kommen', 'kommt', 'kam', 'kamen', 'gekommen', 's', 'zu spät'],
    ['gehen', 'geht', 'ging', 'gingen', 'gegangen', 's', 'ins Stadion'], ['laufen', 'läuft', 'lief', 'liefen', 'gelaufen', 's', 'nach Hause'],
    ['treffen', 'trifft', 'traf', 'trafen', 'getroffen', 'h', 'das Tor'], ['werfen', 'wirft', 'warf', 'warfen', 'geworfen', 'h', 'den Ball'],
    ['halten', 'hält', 'hielt', 'hielten', 'gehalten', 'h', 'den Elfmeter'], ['helfen', 'hilft', 'half', 'halfen', 'geholfen', 'h', 'dem Trainer'],
    ['lernen', 'lernt', 'lernte', 'lernten', 'gelernt', 'h', 'Vokabeln'], ['besuchen', 'besucht', 'besuchte', 'besuchten', 'besucht', 'h', 'die Oma'],
    ['feiern', 'feiert', 'feierte', 'feierten', 'gefeiert', 'h', 'den Sieg'], ['warten', 'wartet', 'wartete', 'warteten', 'gewartet', 'h', 'auf den Bus'],
    ['packen', 'packt', 'packte', 'packten', 'gepackt', 'h', 'die Tasche'], ['bauen', 'baut', 'baute', 'bauten', 'gebaut', 'h', 'ein Modellflugzeug'],
    ['trainieren', 'trainiert', 'trainierte', 'trainierten', 'trainiert', 'h', 'im Verein'], ['schlafen', 'schläft', 'schlief', 'schliefen', 'geschlafen', 'h', 'lange'],
    ['bleiben', 'bleibt', 'blieb', 'blieben', 'geblieben', 's', 'zu Hause'], ['springen', 'springt', 'sprang', 'sprangen', 'gesprungen', 's', 'über den Zaun'],
    ['fallen', 'fällt', 'fiel', 'fielen', 'gefallen', 's', 'vom Fahrrad'], ['malen', 'malt', 'malte', 'malten', 'gemalt', 'h', 'ein Bild'],
  ].map(([inf, pr, pt, ptp, p2, aux, rest]) => ({ inf, pr, pt, ptp, p2, aux, rest }));
  const DSUBJ = [['Tom', false], ['Lisa', false], ['Der Pilot', false], ['Kleindienst', false], ['Mia', false], ['Opa', false],
    ['Wir', true], ['Die Kinder', true], ['Die Fans', true]];
  const TENSES = ['Präsens', 'Präteritum', 'Perfekt', 'Plusquamperfekt', 'Futur I'];
  const tenseSent = (v, S, pl, tense, auxOverride) => {
    const aux = auxOverride || v.aux;
    const hv = { h: pl ? ['haben', 'hatten'] : ['hat', 'hatte'], s: pl ? ['sind', 'waren'] : ['ist', 'war'] }[aux];
    switch (tense) {
      case 'Präsens': return `${S} ${pl ? v.inf : v.pr} ${v.rest}.`;
      case 'Präteritum': return `${S} ${pl ? v.ptp : v.pt} ${v.rest}.`;
      case 'Perfekt': return `${S} ${hv[0]} ${v.rest} ${v.p2}.`;
      case 'Plusquamperfekt': return `${S} ${hv[1]} ${v.rest} ${v.p2}.`;
      default: return `${S} ${pl ? 'werden' : 'wird'} ${v.rest} ${v.inf}.`;
    }
  };
  DEUTSCH.tempus = function () {
    const D = de('tempus'), t = rnd(0, 6);
    const v = pick(DV), [S, pl] = pick(DSUBJ);
    if (t <= 2) {
      const tense = pick(TENSES);
      const ex = { Präsens: 'Gebeugtes Verb in der Gegenwartsform → Präsens.', Präteritum: 'Einfache Vergangenheitsform → Präteritum.',
        Perfekt: 'haben/sein im Präsens + Partizip II → Perfekt.', Plusquamperfekt: 'hatte/war + Partizip II → Plusquamperfekt.',
        'Futur I': 'werden + Infinitiv → Futur I.' }[tense];
      return D(`Welche Zeitform? „${tenseSent(v, S, pl, tense)}“`, tense, shuffle(TENSES.filter(x => x !== tense)).slice(0, 3), ex);
    }
    if (t <= 4) {
      const target = pick(TENSES.filter(x => x !== 'Präsens'));
      const c = tenseSent(v, S, pl, target);
      const wrongTenses = shuffle(TENSES.filter(x => x !== target)).slice(0, 2).map(x => tenseSent(v, S, pl, x));
      const extra = target === 'Perfekt' || target === 'Plusquamperfekt' ? tenseSent(v, S, pl, target, v.aux === 'h' ? 's' : 'h')
        : target === 'Präteritum' && v.pt.endsWith('te') === false ? `${S} ${(pl ? v.inf.slice(0, -2) + 'ten' : v.inf.slice(0, -2) + 'te')} ${v.rest}.` : tenseSent(v, S, pl, TENSES.filter(x => x !== target && !wrongTenses.includes(x))[0]);
      return D(`Setze ins ${target}: „${tenseSent(v, S, pl, 'Präsens')}“`, c, wr(c, [...wrongTenses, extra]),
        target === 'Perfekt' ? `Perfekt: ${v.aux === 'h' ? 'haben' : 'sein'} + Partizip II (${v.p2}).` : target === 'Plusquamperfekt' ? `Plusquamperfekt: ${v.aux === 'h' ? 'hatte' : 'war'} + Partizip II.` : target === 'Futur I' ? 'Futur I: werden + Infinitiv.' : `Präteritum von ${v.inf}: ${pl ? v.ptp : v.pt}.`);
    }
    if (t === 5) {
      const c = v.aux === 'h' ? (pl ? 'haben' : 'hat') : (pl ? 'sind' : 'ist');
      const w = v.aux === 'h' ? (pl ? 'sind' : 'ist') : (pl ? 'haben' : 'hat');
      return D(`Ergänze das Perfekt: „${S} ___ ${v.rest} ${v.p2}.“`, c, [w],
        v.aux === 's' ? 'Verben der Bewegung/Ortsveränderung bilden das Perfekt meist mit „sein“.' : 'Die meisten Verben bilden das Perfekt mit „haben“.');
    }
    const stem = v.inf.replace(/en$/, '').replace(/n$/, '');
    const c = v.p2;
    return D(`Wie heißt das Partizip II von „${v.inf}“?`, c, wr(c, [`ge${stem}t`, `ge${v.inf}`, v.pt, `ge${v.pt}`]),
      `${v.inf} – ${v.pt} – ${v.aux === 'h' ? 'hat' : 'ist'} ${v.p2}`);
  };

  // ---------------------------------------------------------------- Aktiv / Passiv
  const AG = {
    trainer: ['der Trainer', 'vom Trainer', false], lehrerin: ['die Lehrerin', 'von der Lehrerin', false], fans: ['die Fans', 'von den Fans', true],
    pilot: ['der Pilot', 'vom Piloten', false], mech: ['der Mechaniker', 'vom Mechaniker', false], kd: ['Kane', 'von Kane', false],
    team: ['die Mannschaft', 'von der Mannschaft', false], vater: ['mein Vater', 'von meinem Vater', false], kinder: ['die Kinder', 'von den Kindern', true],
    torwart: ['der Torwart', 'vom Torwart', false], arbeiter: ['die Arbeiter', 'von den Arbeitern', true], verein: ['der Verein', 'vom Verein', false],
    firma: ['die Firma', 'von der Firma', false], oma: ['die Oma', 'von der Oma', false],
  };
  const wrongAgentCase = n => (n.startsWith('der ') || n.startsWith('die ') || n.startsWith('das ') ? `von ${n}` : n.startsWith('mein ') ? `von ${n}` : null);
  // [inf, Präs 3sg, Präs pl, Prät 3sg, Prät pl, Partizip II, agents, patients [acc, nom, plural]]
  const PSV = [
    ['halten', 'hält', 'halten', 'hielt', 'hielten', 'gehalten', ['torwart'], [['den Ball', 'der Ball', false], ['den Elfmeter', 'der Elfmeter', false], ['den Schuss', 'der Schuss', false]]],
    ['loben', 'lobt', 'loben', 'lobte', 'lobten', 'gelobt', ['trainer', 'lehrerin'], [['den Spieler', 'der Spieler', false], ['die Schülerin', 'die Schülerin', false], ['die Kinder', 'die Kinder', true]]],
    ['feiern', 'feiert', 'feiern', 'feierte', 'feierten', 'gefeiert', ['fans'], [['den Sieg', 'der Sieg', false], ['die Mannschaft', 'die Mannschaft', false], ['den Torschützen', 'der Torschütze', false]]],
    ['reparieren', 'repariert', 'reparieren', 'reparierte', 'reparierten', 'repariert', ['mech', 'vater'], [['den Jet', 'der Jet', false], ['den Motor', 'der Motor', false], ['die Tür', 'die Tür', false], ['die Räder', 'die Räder', true]]],
    ['beladen', 'belädt', 'beladen', 'belud', 'beluden', 'beladen', ['arbeiter'], [['die Beluga', 'die Beluga', false], ['das Flugzeug', 'das Flugzeug', false], ['den Laster', 'der Laster', false]]],
    ['schießen', 'schießt', 'schießen', 'schoss', 'schossen', 'geschossen', ['kd'], [['den Elfmeter', 'der Elfmeter', false], ['das Siegtor', 'das Siegtor', false]]],
    ['trainieren', 'trainiert', 'trainieren', 'trainierte', 'trainierten', 'trainiert', ['trainer'], [['das Team', 'das Team', false], ['die Torhüter', 'die Torhüter', true]]],
    ['bauen', 'baut', 'bauen', 'baute', 'bauten', 'gebaut', ['firma', 'arbeiter'], [['das Flugzeug', 'das Flugzeug', false], ['die Halle', 'die Halle', false], ['den Flügel', 'der Flügel', false]]],
    ['kontrollieren', 'kontrolliert', 'kontrollieren', 'kontrollierte', 'kontrollierten', 'kontrolliert', ['pilot'], [['die Maschine', 'die Maschine', false], ['den Tank', 'der Tank', false]]],
    ['putzen', 'putzt', 'putzen', 'putzte', 'putzten', 'geputzt', ['kinder'], [['das Zimmer', 'das Zimmer', false], ['die Tafel', 'die Tafel', false], ['die Fenster', 'die Fenster', true]]],
    ['verkaufen', 'verkauft', 'verkaufen', 'verkaufte', 'verkauften', 'verkauft', ['verein'], [['die Tickets', 'die Tickets', true], ['die Trikots', 'die Trikots', true], ['den Schal', 'der Schal', false]]],
    ['kaufen', 'kauft', 'kaufen', 'kaufte', 'kauften', 'gekauft', ['vater', 'oma'], [['die Tickets', 'die Tickets', true], ['den Ball', 'der Ball', false], ['das Trikot', 'das Trikot', false]]],
    ['korrigieren', 'korrigiert', 'korrigieren', 'korrigierte', 'korrigierten', 'korrigiert', ['lehrerin'], [['den Test', 'der Test', false], ['die Hefte', 'die Hefte', true]]],
    ['begrüßen', 'begrüßt', 'begrüßen', 'begrüßte', 'begrüßten', 'begrüßt', ['pilot'], [['die Gäste', 'die Gäste', true], ['den Fluggast', 'der Fluggast', false]]],
    ['fotografieren', 'fotografiert', 'fotografieren', 'fotografierte', 'fotografierten', 'fotografiert', ['fans'], [['den Spieler', 'der Spieler', false], ['die Beluga', 'die Beluga', false]]],
    ['waschen', 'wäscht', 'waschen', 'wusch', 'wuschen', 'gewaschen', ['vater', 'kinder'], [['das Auto', 'das Auto', false], ['die Trikots', 'die Trikots', true]]],
    ['backen', 'backt', 'backen', 'backte', 'backten', 'gebacken', ['oma'], [['den Kuchen', 'der Kuchen', false], ['die Plätzchen', 'die Plätzchen', true]]],
    ['besiegen', 'besiegt', 'besiegen', 'besiegte', 'besiegten', 'besiegt', ['team'], [['den Gegner', 'der Gegner', false], ['die Gäste', 'die Gäste', true]]],
  ];
  DEUTSCH.passiv = function () {
    const D = de('passiv');
    if (Math.random() < 0.05) return bankQ('deutsch', 'passiv', DE_BANK.passiv);
    const [inf, pr, prp, pt, ptp, p2, ags, pats] = pick(PSV);
    const [an, ad, apl] = AG[pick(ags)];
    const [pa, pn, ppl] = pick(pats);
    const past = Math.random() < 0.5;
    const actV = past ? (apl ? ptp : pt) : (apl ? prp : pr);
    const active = `${cap(an)} ${actV} ${pa}.`;
    const wAux = (tpast, plur) => (tpast ? (plur ? 'wurden' : 'wurde') : (plur ? 'werden' : 'wird'));
    const pass = (aux, subjN = pn, agent = ad) => `${cap(subjN)} ${aux} ${agent} ${p2}.`;
    const t = rnd(0, 5);
    if (t <= 2) {
      const c = pass(wAux(past, ppl));
      const pool = [pass(wAux(!past, ppl)), pass(wAux(past, !ppl))];
      const wa = wrongAgentCase(an);
      if (wa) pool.push(pass(wAux(past, ppl), pn, wa));
      if (pa !== pn) pool.push(pass(wAux(past, ppl), pa));
      pool.push(`${cap(pn)} ${ppl ? 'haben' : 'hat'} ${ad} ${p2}.`);
      return D(`Forme ins Passiv um: „${active}“`, c, wr(c, pool),
        `Passiv ${past ? 'Präteritum: wurde(n)' : 'Präsens: wird/werden'} + Partizip II; der Handelnde steht mit „von“ + Dativ (${ad}).`);
    }
    if (t === 3) {
      const r = rnd(0, 3);
      let s, c, ex;
      if (r === 0) { s = active; c = 'Aktiv'; ex = 'Der Handelnde ist Subjekt → Aktiv.'; }
      else if (r === 1) { s = pass(wAux(past, ppl)); c = 'Passiv'; ex = 'werden + Partizip II → Passiv.'; }
      else if (r === 2) { s = `${cap(an)} ${apl ? 'werden' : 'wird'} ${pa} ${inf}.`; c = 'Aktiv'; ex = 'werden + Infinitiv = Futur I im Aktiv (kein Partizip II).'; }
      else { s = `${cap(pn)} ${ppl ? 'wurden' : 'wurde'} ${p2}.`; c = 'Passiv'; ex = 'Passiv ohne Handelnden: wurde + Partizip II.'; }
      return D(`Aktiv oder Passiv? „${s}“`, c, [c === 'Aktiv' ? 'Passiv' : 'Aktiv'], ex);
    }
    if (t === 4) {
      const r = rnd(0, 2);
      const s = r === 0 ? pass(wAux(false, ppl)) : r === 1 ? pass(wAux(true, ppl)) : `${cap(pn)} ${ppl ? 'sind' : 'ist'} ${ad} ${p2} worden.`;
      const c = ['Präsens', 'Präteritum', 'Perfekt'][r];
      return D(`In welcher Zeitform steht der Passivsatz? „${s}“`, c, TENSES.filter(x => x !== c).slice(0, 4).filter(x => x !== 'Plusquamperfekt'),
        ['wird/werden + Partizip II → Präsens Passiv.', 'wurde/wurden + Partizip II → Präteritum Passiv.', 'ist/sind + Partizip II + worden → Perfekt Passiv.'][r]);
    }
    const c = wAux(past, ppl);
    return D(`Ergänze das Passiv (${past ? 'Präteritum' : 'Präsens'}): „${cap(pn)} ___ ${ad} ${p2}.“`, c,
      wr(c, [wAux(!past, ppl), wAux(past, !ppl), ppl ? 'haben' : 'hat']), `${past ? 'Präteritum' : 'Präsens'} Passiv: ${c} + Partizip II.`);
  };
  // ---------------------------------------------------------------- Rechtschreibung
  const SEID_P = ['die Besten', 'echt schnell', 'heute dran', 'zu spät', 'meine besten Freunde', 'super Fans', 'ganz schön laut',
    'richtig gut', 'sehr fleißig', 'herzlich eingeladen', 'schon fertig', 'unschlagbar'];
  const SEIT_T = ['gestern', 'Montag', 'drei Tagen', 'einer Woche', 'dem Spiel', 'den Ferien', '2020', 'heute Morgen', 'Stunden', 'dem Frühstück'];
  const SEIT_C = ['regnet es', 'trainiert Tom jeden Tag', 'warte ich auf den Bus', 'habe ich Bauchweh', 'ist das Stadion ausverkauft',
    'spielt Mia im Verein', 'lerne ich für den Test', 'steht die Beluga im Hangar'];
  const WIEDER = [['Kannst du die Frage bitte ___?', 'wiederholen', 'widerholen'], ['Auf ___!', 'Wiedersehen', 'Widersehen'],
    ['Nächste Woche haben wir eine ___ der Vokabeln.', 'Wiederholung', 'Widerholung'], ['Tom hat seinen Schlüssel ___.', 'wiedergefunden', 'widergefunden'],
    ['Komm bald ___!', 'wieder', 'wider'], ['Gladbach hat ___ gewonnen!', 'wieder', 'wider'], ['Die Beluga kommt morgen ___.', 'wieder', 'wider'],
    ['Du sollst deiner Lehrerin nicht ___.', 'widersprechen', 'wiedersprechen'], ['Die Abwehr leistet großen ___.', 'Widerstand', 'Wiederstand'],
    ['Der Geruch ist echt ___.', 'widerlich', 'wiederlich'], ['Das ist ein klarer ___!', 'Widerspruch', 'Wiederspruch'],
    ['Lisa wusste nicht, was sie ___ sollte.', 'erwidern', 'erwiedern'], ['Der See kann die Berge ___.', 'widerspiegeln', 'wiederspiegeln'],
    ['Er tat es ohne ___.', 'Widerrede', 'Wiederrede'], ['Ich habe meinen Ball ___!', 'wieder', 'wider'],
    ['Wir sehen uns ___ beim Training.', 'wieder', 'wider'], ['Wann fliegt die Beluga ___ nach Hamburg?', 'wieder', 'wider']];
  const SPELL = [
    ['Straße', 'Strasse', 'Strase', 'Strahse'], ['Fußball', 'Fussball', 'Fusball', 'Fuhsball'], ['groß', 'gross', 'gros', 'grohs'],
    ['heißen', 'heissen', 'heisen', 'heißßen'], ['Spaß', 'Spass', 'Spas', 'Spahs'], ['Fuß', 'Fuss', 'Fus', 'Fuhs'], ['Gruß', 'Gruss', 'Grus', 'Gruhs'],
    ['süß', 'süss', 'süs', 'sühs'], ['draußen', 'draussen', 'drausen', 'drauhsen'], ['fleißig', 'fleissig', 'fleisig', 'fleißich'],
    ['schließen', 'schliessen', 'schliesen', 'schlißen'], ['gießen', 'giessen', 'giesen', 'gißen'], ['beißen', 'beissen', 'beisen', 'beisßen'],
    ['Kuss', 'Kuß', 'Kus', 'Kuhs'], ['Fluss', 'Fluß', 'Flus', 'Fluhs'], ['Schluss', 'Schluß', 'Schlus', 'Schlusss'], ['muss', 'muß', 'mus', 'mußs'],
    ['Pass', 'Paß', 'Pas', 'Pahs'], ['nass', 'naß', 'nas', 'nahs'], ['Wasser', 'Waßer', 'Waser', 'Wahser'], ['besser', 'beßer', 'beser', 'bässer'],
    ['Schlüssel', 'Schlüßel', 'Schlüsel', 'Schlühsel'], ['vergessen', 'vergeßen', 'vergesen', 'fergessen'], ['Tasse', 'Taße', 'Tase', 'Tahse'],
    ['Klasse', 'Klaße', 'Klase', 'Klahse'], ['Adresse', 'Adreße', 'Adrese', 'Addresse'], ['Messer', 'Meßer', 'Meser', 'Mässer'],
    ['Schloss', 'Schloß', 'Schlos', 'Schlohs'], ['Ergebnis', 'Ergebniss', 'Ergebniß', 'Ergäbnis'], ['Zeugnis', 'Zeugniss', 'Zeugniß', 'Zeuchnis'],
    ['Erlebnis', 'Erlebniss', 'Erlebniß', 'Erläbnis'], ['Geheimnis', 'Geheimniss', 'Geheimniß', 'Geheimnihs'], ['Haus', 'Hauß', 'Hauss', 'Hauz'],
    ['Bus', 'Buss', 'Buß', 'Buhs'], ['Glas', 'Glass', 'Glaß', 'Glahs'], ['Maschine', 'Maschiene', 'Machine', 'Maschinne'],
    ['Rhythmus', 'Rythmus', 'Rhytmus', 'Rytmus'], ['Theater', 'Teater', 'Theather', 'Tiater'], ['Physik', 'Fysik', 'Physick', 'Füsik'],
    ['Mathematik', 'Matematik', 'Mathematick', 'Mathemathik'], ['Thema', 'Tema', 'Themma', 'Thehma'], ['Training', 'Treening', 'Trening', 'Trainning'],
    ['Trainer', 'Trainner', 'Träner', 'Treiner'], ['Restaurant', 'Restaurang', 'Restorant', 'Restaurent'], ['Garage', 'Garasche', 'Garrage', 'Garahge'],
    ['Ingenieur', 'Inschenieur', 'Ingeneur', 'Ingenieuer'], ['Pilot', 'Pielot', 'Pillot', 'Pilott'], ['Stadion', 'Stadjon', 'Schtadion', 'Stahdion'],
    ['Interview', 'Interwiew', 'Intervju', 'Interwju'], ['Chemie', 'Kemie', 'Chemi', 'Schemie'], ['Biologie', 'Biology', 'Biolohgie', 'Bijologie'],
    ['Toilette', 'Toilete', 'Toalette', 'Twalette'], ['Kabine', 'Kabiene', 'Kabinne', 'Kahbine'], ['Medizin', 'Medizien', 'Meditzin', 'Mediezin'],
    ['Musik', 'Musick', 'Muhsik', 'Mussik'], ['Kapitän', 'Kapitähn', 'Kapiten', 'Kapetän'], ['Passagier', 'Passagir', 'Passaschier', 'Passagiehr'],
    ['Turbine', 'Turbiene', 'Turbinne', 'Thurbine'], ['Propeller', 'Propeler', 'Prohpeller', 'Propellor'], ['Cockpit', 'Kockpit', 'Cokpit', 'Cockpitt'],
    ['Ticket', 'Tiket', 'Tickett', 'Tikket'], ['Team', 'Tiem', 'Teem', 'Tihm'], ['Gymnasium', 'Gymnasjum', 'Gümnasium', 'Gymnasiumm'],
    ['endlich', 'entlich', 'endtlich', 'ändlich'], ['vielleicht', 'vieleicht', 'fielleicht', 'vielleich'], ['nämlich', 'nähmlich', 'nämmlich', 'nemlich'],
    ['Standard', 'Standart', 'Schtandard', 'Standarth'], ['eigentlich', 'eigendlich', 'eigentlig', 'aigentlich'], ['Fahrrad', 'Farrad', 'Fahrad', 'Fahrrat'],
    ['wohnen', 'wonen', 'wohnnen', 'wohen'], ['Lehrer', 'Lerer', 'Leerer', 'Lehrrer'], ['Stuhl', 'Stul', 'Stuul', 'Schtuhl'], ['Spiel', 'Spil', 'Spihl', 'Schpiel'],
    ['Ziel', 'Zil', 'Zihl', 'Ziehl'], ['Brief', 'Brif', 'Brihf', 'Brieff'], ['fliegen', 'fligen', 'flihgen', 'fliegenn'], ['Mannschaft', 'Manschaft', 'Mannschafft', 'Mansschaft'],
    ['kommen', 'komen', 'kohmen', 'kommmen'], ['Sonne', 'Sone', 'Sonnhe', 'Sohne'], ['rennen', 'renen', 'rännen', 'rennnen'], ['treffen', 'trefen', 'träffen', 'treffenn'],
    ['Himmel', 'Himel', 'Himmell', 'Hiemel'], ['Wetter', 'Weter', 'Wätter', 'Wettter'], ['Platz', 'Plaz', 'Platzz', 'Plats'], ['Blitz', 'Bliz', 'Blits', 'Blitzz'],
    ['Jacke', 'Jake', 'Jakke', 'Jacce'], ['Glück', 'Glük', 'Glükk', 'Glüch'], ['Brücke', 'Brüke', 'Brükke', 'Brüccke'], ['Schreck', 'Schrek', 'Schrekk', 'Schräck'],
  ];
  const NOM_V = ['Lesen', 'Schwimmen', 'Fliegen', 'Laufen', 'Rechnen', 'Schreiben', 'Lernen', 'Trainieren', 'Kochen', 'Malen', 'Tanzen',
    'Singen', 'Zeichnen', 'Basteln', 'Spielen', 'Turnen', 'Backen'];
  const NOM_UP = ['Beim ___ bin ich richtig gut.', 'Das ___ macht mir Spaß.', 'Beim ___ vergesse ich die Zeit.', 'Am liebsten mag ich das ___.',
    'Vom vielen ___ bin ich müde.', 'Zum ___ brauche ich Ruhe.'];
  const NOM_LOW = ['Ich will heute ___.', 'Wir können morgen ___.', 'Tom möchte gern ___.', 'Hast du Lust, heute zu ___?', 'Mia kann sehr gut ___.'];
  const NOM_ADJ = [['Wir haben etwas ___ erlebt.', ['Neues', 'Spannendes', 'Tolles', 'Lustiges', 'Schönes', 'Besonderes', 'Unglaubliches']],
    ['Im Fernsehen kam nichts ___.', ['Neues', 'Spannendes', 'Lustiges', 'Interessantes', 'Besonderes', 'Gutes']],
    ['Gibt es etwas ___ zu essen?', ['Leckeres', 'Süßes', 'Warmes', 'Gesundes']], ['Ich wünsche dir alles ___!', ['Gute', 'Liebe']],
    ['Heute habe ich viel ___ gelernt.', ['Neues', 'Interessantes', 'Wichtiges']]];
  const LOW_ADJ = [['Das Spiel war ___.', ['spannend', 'toll', 'lustig', 'langweilig']], ['Die Beluga ist sehr ___.', ['groß', 'schwer', 'laut', 'schön']],
    ['Haaland läuft am ___.', ['schnellsten']], ['Wer springt am ___?', ['höchsten', 'weitesten']], ['Unsere Fans singen am ___.', ['lautesten', 'schönsten']],
    ['Mia spielt am ___.', ['besten']]];
  const TIME_W = [['Wir trainieren am ___.', ['Abend', 'Morgen', 'Nachmittag', 'Montag', 'Freitag'], true], ['Wir spielen heute ___.', ['Abend', 'Nachmittag'], true],
    ['Ich trainiere immer ___.', ['abends', 'morgens', 'montags', 'freitags', 'nachmittags'], false], ['Gestern ___ hat es geregnet.', ['Abend', 'Morgen'], true]];
  DEUTSCH.rechtschreibung = function () {
    const D = de('rechtschreibung'), t = rnd(0, 11);
    if (t === 0) {
      const q = Math.random() < 0.6 ? `Ihr ___ ${pick(SEID_P)}!` : `___ ihr ${pick(SEID_P)}?`;
      const c = q.startsWith('___') ? 'Seid' : 'seid';
      return D(`Ergänze: „${q}“`, c, [c === 'Seid' ? 'Seit' : 'seit'], '„seid“ kommt vom Verb „sein“ (ihr seid); „seit“ ist eine Zeitangabe.');
    }
    if (t === 1) {
      const q = Math.random() < 0.6 ? `___ ${pick(SEIT_T)} ${pick(SEIT_C)}.` : `Ich warte schon ___ ${pick(SEIT_T)}.`;
      const c = q.startsWith('___') ? 'Seit' : 'seit';
      return D(`Ergänze: „${q}“`, c, [c === 'Seit' ? 'Seid' : 'seid'], '„seit“ gibt einen Zeitpunkt/Zeitraum an; „seid“ ist eine Form von „sein“.');
    }
    if (t === 2) {
      const [q, c, w] = pick(WIEDER);
      return D(`Welche Schreibweise ist richtig? „${q}“`, c, [w], c.toLowerCase().startsWith('wieder') ? '„wieder“ = noch einmal, zurück.' : '„wider“ = gegen, entgegen.');
    }
    if (t <= 5) {
      const [c, ...w] = pick(SPELL);
      return D('Welche Schreibweise ist richtig?', c, w.filter(x => x !== c),
        /ß/.test(c) ? 'Nach langem Vokal oder Doppellaut (au, ei, eu) steht ß.' : /ss/.test(c) ? 'Nach kurzem Vokal steht ss.' : 'Merkwort – so wird es geschrieben.');
    }
    if (t <= 7) {
      const v = pick(NOM_V);
      if (Math.random() < 0.6) return D(`Groß oder klein? „${pick(NOM_UP)}“`, v, [v.toLowerCase()], 'Signalwort (Artikel, beim, zum, vom …) → Verb wird zum Nomen → groß.');
      return D(`Groß oder klein? „${pick(NOM_LOW)}“`, v.toLowerCase(), [v], 'Hier ist es ein Verb (Tätigkeit) → klein.');
    }
    if (t === 8) {
      const [f, ws] = pick(NOM_ADJ), w = pick(ws);
      return D(`Groß oder klein? „${f}“`, w, [w.toLowerCase()], 'Nach etwas, nichts, viel, alles wird das Adjektiv zum Nomen → groß.');
    }
    if (t === 9) {
      const [f, ws] = pick(LOW_ADJ), w = pick(ws);
      return D(`Groß oder klein? „${f}“`, w, [cap(w)], f.includes('am ___') ? '„am …sten“ (Superlativ) wird kleingeschrieben.' : 'Adjektiv (Wie ist etwas?) → klein.');
    }
    if (t === 10) {
      const [f, ws, up] = pick(TIME_W), w = pick(ws);
      return D(`Groß oder klein? „${f}“`, w, [up ? w.toLowerCase() : cap(w)], up ? 'Tageszeit nach am/heute/gestern ist ein Nomen → groß.' : 'Zeitangaben mit -s (abends, montags) sind Adverbien → klein.');
    }
    return bankQ('deutsch', 'rechtschreibung', DE_BANK.rechtschreibung);
  };
  // ---------------------------------------------------------------- sprachliche Bilder / Stilmittel
  const ST_PERS = ['Haaland', 'Tom', 'Kleindienst', 'Mein Opa', 'Die Torhüterin', 'Unser Stürmer', 'Lisa', 'Der Verteidiger', 'Hugo Bolin', 'Mein Bruder'];
  const ST_VGL = ['rennt wie ein Gepard', 'ist stark wie ein Bär', 'springt wie ein Känguru', 'schläft wie ein Murmeltier', 'ist so flink wie ein Wiesel',
    'kämpft wie ein Löwe', 'isst wie ein Scheunendrescher', 'ist so groß wie ein Baum', 'ist so schlau wie ein Fuchs', 'ist so leise wie eine Maus',
    'zittert wie Espenlaub', 'brüllt wie ein Löwe'];
  const ST_PLANE = ['Die Beluga', 'Der A380', 'Die Boeing 747', 'Die Antonow', 'Der Dreamlifter'];
  const ST_PVGL = ['gleitet wie ein Adler durch die Luft', 'ist so dick wie ein Wal', 'glänzt wie ein Spiegel', 'dröhnt wie ein Gewitter', 'ist schwer wie ein Haus'];
  const ST_MP = ['Tom', 'Lisa', 'Mia', 'Ben', 'Mein Bruder', 'Meine Schwester', 'Jonas', 'Emma'];
  const ST_MET = ['ist eine echte Tormaschine', 'ist ein Fels in der Abwehr', 'ist der Motor der Mannschaft', 'ist das Herz des Teams',
    'ist eine Rakete auf dem Flügel', 'ist ein Bücherwurm', 'ist eine Leseratte', 'ist ein Sonnenschein'];
  const ST_MET2 = ['Mein Zimmer ist ein Schweinestall.', 'Die Beluga ist ein fliegender Wal.', 'Das Stadion ist ein Hexenkessel.',
    'Der A380 ist ein Riese der Lüfte.', 'Die Abwehr ist eine Festung.', 'Mein Kopf ist ein Sieb.', 'Die Fans sind der zwölfte Mann.',
    'Der Flughafen ist ein Ameisenhaufen.', 'Mein Opa ist ein wandelndes Lexikon.', 'Unser Trainer ist ein alter Fuchs.', 'Das Flugzeug ist ein Vogel aus Stahl.'];
  const ST_PER = [['Die Sonne', ['lacht vom Himmel', 'kitzelt mich an der Nase', 'versteckt sich hinter den Wolken']],
    ['Der Wind', ['heult ums Haus', 'flüstert in den Bäumen', 'spielt mit dem Ball']], ['Der Ball', ['küsst den Pfosten', 'tanzt auf der Linie', 'will einfach nicht ins Tor']],
    ['Die Beluga', ['lächelt die Zuschauer an', 'schläft im Hangar', 'träumt vom Himmel']], ['Der Regen', ['weint auf die Stadt', 'tanzt auf dem Dach']],
    ['Das Flugzeug', ['seufzt nach dem langen Flug', 'schläft in der Halle']], ['Der Wecker', ['schreit mich an']], ['Das Stadion', ['hält den Atem an', 'träumt vom Titel']],
    ['Die Stadt', ['schläft noch']], ['Der Mond', ['schaut durchs Fenster']], ['Mein Handy', ['ruft nach mir']], ['Die Bäume', ['winken im Wind']],
    ['Der Motor', ['hustet und stottert']], ['Die Wolken', ['weinen dicke Tränen']]];
  const ST_UP = ['Tom', 'Lisa', 'Mein Bruder', 'Papa', 'Oma', 'Mia', 'Ben', 'Meine Schwester'];
  const ST_UEB = ['hat mir das schon tausendmal gesagt', 'wartet seit einer Ewigkeit auf den Bus', 'hat einen Berg von Hausaufgaben',
    'hat eine Million Fragen', 'kennt alle Flugzeuge der Welt', 'hat heute keine Sekunde Zeit', 'hat schon hundert Jahre nicht mehr angerufen'];
  const ST_ALL = { K: [['Kleine', 'Kluge'], ['Kinder', 'Kicker'], ['kicken', 'kämpfen'], ['kraftvoll', 'konzentriert']],
    M: [['Mutige', 'Müde'], ['Mädchen', 'Musiker'], ['marschieren', 'machen'], ['munter', 'mühsam']],
    W: [['Wilde', 'Wütende'], ['Wölfe', 'Wikinger'], ['warten', 'wandern'], ['weiter', 'wochenlang']],
    F: [['Fröhliche', 'Freche'], ['Fans', 'Freunde'], ['feiern', 'fahren'], ['fleißig', 'flott']],
    P: [['Pünktliche', 'Prima'], ['Piloten', 'Passagiere'], ['parken', 'packen'], ['perfekt', 'pausenlos']],
    L: [['Lustige', 'Laute'], ['Lehrer', 'Läufer'], ['lachen', 'laufen'], ['lange', 'locker']] };
  const ST_RF = ['Wer will schon gegen Gladbach verlieren?', 'Ist das nicht ein wunderschönes Tor?', 'Wer hat schon Lust auf Hausaufgaben?',
    'Was gibt es Schöneres als Fußball?', 'Wie oft soll ich das noch sagen?', 'Wer liebt keine Ferien?', 'Gibt es ein schöneres Flugzeug als die Beluga?',
    'Habe ich es nicht gleich gesagt?', 'Wer kann da schon Nein sagen?', 'Muss das wirklich sein?', 'Wer braucht schon Regen am Samstag?', 'Bin ich etwa dein Diener?'];
  const ST_LM = ['Peng! Der Ball knallt an die Latte.', 'Der Motor macht brumm, brumm.', 'Tatütata! Der Krankenwagen kommt.', 'Klirr! Die Scheibe ist kaputt.',
    'Wusch! Der Jet rast vorbei.', 'Rums! Tom fällt vom Stuhl.', 'Ticktack macht die Uhr.', 'Kikeriki! Der Hahn weckt mich.', 'Platsch! Der Ball landet im Pool.',
    'Zisch! Die Limo ist offen.', 'Bumm! Die Tür knallt zu.', 'Wauwau! Der Hund bellt.'];
  const ST_WRONG = { Vergleich: ['Metapher', 'Personifikation', 'Rhetorische Frage', 'Lautmalerei'],
    Metapher: ['Vergleich', 'Alliteration', 'Rhetorische Frage', 'Lautmalerei'],
    Personifikation: ['Vergleich', 'Alliteration', 'Rhetorische Frage', 'Lautmalerei'],
    Übertreibung: ['Personifikation', 'Alliteration', 'Rhetorische Frage', 'Lautmalerei'],
    Alliteration: ['Vergleich', 'Personifikation', 'Rhetorische Frage', 'Übertreibung'],
    'Rhetorische Frage': ['Vergleich', 'Personifikation', 'Alliteration', 'Lautmalerei'],
    Lautmalerei: ['Vergleich', 'Metapher', 'Rhetorische Frage', 'Alliteration'] };
  const ST_EX = { Vergleich: 'Zwei Dinge werden mit „wie“ verglichen → Vergleich.', Metapher: 'Bildhafter Ausdruck ohne „wie“ → Metapher.',
    Personifikation: 'Ein Ding oder Tier handelt wie ein Mensch → Personifikation.', Übertreibung: 'Stark übertrieben → Übertreibung (Hyperbel).',
    Alliteration: 'Mehrere Wörter beginnen mit demselben Laut → Alliteration.', 'Rhetorische Frage': 'Frage, auf die man keine Antwort erwartet → rhetorische Frage.',
    Lautmalerei: 'Ein Wort ahmt ein Geräusch nach → Lautmalerei.' };
  DEUTSCH.stilmittel = function () {
    const D = de('stilmittel'), r = rnd(0, 11);
    let s, c;
    if (r <= 1) { s = `${pick(ST_PERS)} ${pick(ST_VGL)}.`; c = 'Vergleich'; }
    else if (r === 2) { s = `${pick(ST_PLANE)} ${pick(ST_PVGL)}.`; c = 'Vergleich'; }
    else if (r === 3) { s = `${pick(ST_MP)} ${pick(ST_MET)}.`; c = 'Metapher'; }
    else if (r === 4) { s = pick(ST_MET2); c = 'Metapher'; }
    else if (r <= 6) { const [a, vs] = pick(ST_PER); s = `${a} ${pick(vs)}.`; c = 'Personifikation'; }
    else if (r === 7) { s = `${pick(ST_UP)} ${pick(ST_UEB)}.`; c = 'Übertreibung'; }
    else if (r === 8) { const [a, n, v, adv] = ST_ALL[pick(Object.keys(ST_ALL))]; s = `${pick(a)} ${pick(n)} ${pick(v)} ${pick(adv)}.`; c = 'Alliteration'; }
    else if (r === 9) { s = pick(ST_RF); c = 'Rhetorische Frage'; }
    else if (r === 10) { s = pick(ST_LM); c = 'Lautmalerei'; }
    else return bankQ('deutsch', 'stilmittel', DE_BANK.stilmittel);
    return D(`Welches sprachliche Mittel? „${s}“`, c, shuffle(ST_WRONG[c]).slice(0, 3), ST_EX[c]);
  };

  // ---------------------------------------------------------------- indirekte Rede (Konjunktiv I)
  // inf, Präsens ich, Präsens er, Konjunktiv I er, Konjunktiv II er (null = gleich Präteritum), Präteritum er, Ergänzungen
  const KV = [
    ['sein', 'bin', 'ist', 'sei', 'wäre', 'war', ['müde', 'heute sehr glücklich', 'schon fertig', 'krank', 'ein großer Fan von Gladbach']],
    ['haben', 'habe', 'hat', 'habe', 'hätte', 'hatte', ['Hunger', '{p}e Hausaufgaben vergessen', '{p}en Schlüssel verloren', 'keine Zeit', 'Bauchweh']],
    ['kommen', 'komme', 'kommt', 'komme', 'käme', 'kam', ['morgen zum Training', 'später nach Hause']],
    ['spielen', 'spiele', 'spielt', 'spiele', null, 'spielte', ['am Samstag im Tor', 'jeden Tag Fußball']],
    ['gehen', 'gehe', 'geht', 'gehe', 'ginge', 'ging', ['heute ins Stadion', 'früh ins Bett']],
    ['können', 'kann', 'kann', 'könne', 'könnte', 'konnte', ['sehr schnell rennen', 'heute nicht kommen']],
    ['müssen', 'muss', 'muss', 'müsse', 'müsste', 'musste', ['noch Vokabeln lernen', '{p} Zimmer aufräumen']],
    ['wollen', 'will', 'will', 'wolle', null, 'wollte', ['Pilot werden', 'einen A380 sehen']],
    ['dürfen', 'darf', 'darf', 'dürfe', 'dürfte', 'durfte', ['heute länger aufbleiben']],
    ['wissen', 'weiß', 'weiß', 'wisse', 'wüsste', 'wusste', ['die Antwort', 'alles über Flugzeuge']],
    ['fliegen', 'fliege', 'fliegt', 'fliege', 'flöge', 'flog', ['im Sommer nach London']],
    ['trainieren', 'trainiere', 'trainiert', 'trainiere', null, 'trainierte', ['dreimal pro Woche']],
    ['sehen', 'sehe', 'sieht', 'sehe', 'sähe', 'sah', ['die Beluga am Himmel']],
    ['laufen', 'laufe', 'läuft', 'laufe', 'liefe', 'lief', ['jeden Morgen zum Bäcker']],
    ['werden', 'werde', 'wird', 'werde', 'würde', 'wurde', ['bald zwölf']],
    ['lesen', 'lese', 'liest', 'lese', 'läse', 'las', ['gerade ein spannendes Buch']],
    ['brauchen', 'brauche', 'braucht', 'brauche', null, 'brauchte', ['neue Fußballschuhe']],
    ['finden', 'finde', 'findet', 'finde', 'fände', 'fand', ['das Spiel langweilig']],
    ['essen', 'esse', 'isst', 'esse', 'äße', 'aß', ['gern Pizza']],
  ];
  const KSP = [['Tom', 'er', 'sein'], ['Lisa', 'sie', 'ihr'], ['Der Trainer', 'er', 'sein'], ['Die Pilotin', 'sie', 'ihr'], ['Oma', 'sie', 'ihr'],
    ['Papa', 'er', 'sein'], ['Mia', 'sie', 'ihr'], ['Ben', 'er', 'sein'], ['Kleindienst', 'er', 'sein'], ['Die Lehrerin', 'sie', 'ihr']];
  const KPL = [['Die Spieler', ['müde', 'bereit für das Spiel', 'sehr glücklich', 'zu spät']], ['Die Fans', ['stolz auf das Team', 'heiser']],
    ['Die Kinder', ['hungrig', 'schon fertig']], ['Meine Eltern', ['stolz auf mich', 'gleich da']]];
  DEUTSCH.indirekt = function () {
    const D = de('indirekt'), t = rnd(0, 6);
    if (t === 6) {
      const [sp, rs] = pick(KPL), r = pick(rs);
      return D(`${sp} sagen: „Wir sind ${r}.“ → Sie sagen, sie ___ ${r}.`, 'seien', ['sind', 'sei', 'waren'],
        'Konjunktiv I von „sein“ (Plural): sie seien.');
    }
    const [inf, i1, i3, k1, k2, pt, rests] = pick(KV);
    if (t === 5) {
      return D(`Wie heißt der Konjunktiv I von „${inf}“ (er, sie, es)?`, k1, wr(k1, [i3, pt, k2 || inf]),
        `Konjunktiv I: Stamm + e → er ${k1}.`);
    }
    const [sp, pron, pos] = pick(KSP), restRaw = pick(rests);
    const rd = fill(restRaw, { p: 'mein' }), ri = fill(restRaw, { p: pos });
    const direct = `${sp} sagt: „Ich ${i1} ${rd}.“`;
    if (t <= 2) {
      return D(`${direct} → ${cap(pron)} sagt, ${pron} ___ ${ri}.`, k1, wr(k1, [i3, pt, inf === 'sein' ? 'seien' : inf]),
        `Indirekte Rede mit Konjunktiv I: ${pron} ${k1}.`);
    }
    const c = `${pron} ${k1} ${ri}`;
    const otherP = pron === 'er' ? 'sie' : 'er', otherPos = pos === 'sein' ? 'ihr' : 'sein';
    const pool = [`${pron} ${i3} ${ri}`, `${otherP} ${k1} ${fill(restRaw, { p: otherPos })}`, `ich ${k1} ${rd}`, `${pron} ${pt} ${ri}`];
    return D(`${direct} Wie lautet das in indirekter Rede (Konjunktiv I)?`, c, wr(c, pool),
      'Pronomen anpassen (ich → er/sie, mein → sein/ihr) und Konjunktiv I verwenden.');
  };

  // ---------------------------------------------------------------- Satzarten, Haupt- und Nebensatz
  const IMP = ['Mach deine Hausaufgaben!', 'Pass den Ball zu Kleindienst!', 'Komm sofort her!', 'Hört bitte zu!', 'Gib mir den Ball!', 'Lauf schneller!',
    'Setzt euch hin!', 'Räum dein Zimmer auf!', 'Schnallt euch an!', 'Schieß aufs Tor!', 'Bring mir bitte die Tickets!', 'Vergiss deine Schuhe nicht!'];
  const AUSRUF = ['Was für ein tolles Tor!', 'Wie groß die Beluga ist!', 'So ein Pech!', 'Wie laut der A380 ist!',
    'Was für ein Spiel!', 'Wie schnell Haaland ist!', 'Was für ein riesiges Flugzeug!'];
  const SA_LABEL = { gef: 'Satzgefüge (Haupt- und Nebensatz)', reihe: 'Satzreihe (zwei Hauptsätze)', einf: 'einfacher Satz (ein Hauptsatz)' };
  DEUTSCH.saetze = function () {
    const D = de('saetze'), t = rnd(0, 7);
    if (t <= 1) {
      const k = pick(['gef', 'gef', 'reihe', 'einf']);
      let s;
      if (k === 'gef') { const [m, n] = kmPair(); s = buildHN(m, n, Math.random() < 0.5).s; }
      else if (k === 'reihe') {
        const a = pick(KM), b = pick(KM.filter(x => x[0] !== a[0]));
        const conj = pick([' und', ', aber']);
        s = `${cap(a[0])} ${a[1]} ${a[2]}${conj} ${b[0]} ${b[1]} ${b[2]}.`;
      } else { const m = pick(KM); s = `${pick(KZEIT)} ${m[1]} ${m[0]} ${m[2]}.`; }
      return D(`Was für ein Satz ist das? „${s}“`, SA_LABEL[k], Object.values(SA_LABEL),
        k === 'gef' ? 'Ein Nebensatz (Verb am Ende, z. B. mit weil, wenn, obwohl) hängt am Hauptsatz → Satzgefüge.'
          : k === 'reihe' ? 'Zwei Hauptsätze (Verb an 2. Stelle), verbunden mit und/aber → Satzreihe.' : 'Nur ein Hauptsatz mit einem gebeugten Verb.');
    }
    if (t === 2) {
      const [m, n] = kmPair(), b = buildHN(m, n, Math.random() < 0.5);
      const ws = wordsOf(b.s).filter(w => w.toLowerCase() !== n[0]);
      const wrongs = shuffle([...new Set(ws)]).slice(0, 3);
      return D(`Welches Wort leitet den Nebensatz ein? „${b.s}“`, b.ns.split(' ')[0], wrongs, `„${n[0]}“ ist eine Konjunktion und leitet den Nebensatz ein.`);
    }
    if (t === 3) {
      const [m, n] = kmPair(), b = buildHN(m, n, Math.random() < 0.5);
      return D(`Welcher Teil ist der Nebensatz? „${b.s}“`, b.ns, [b.hs, 'Es gibt keinen Nebensatz.'],
        'Im Nebensatz steht das gebeugte Verb am Ende.');
    }
    if (t === 4) {
      const [m, n] = kmPair(), b = buildHN(m, n, false);
      return D(`Wo steht im Nebensatz „${b.ns}“ das gebeugte Verb?`, 'am Ende', ['an zweiter Stelle', 'an erster Stelle'],
        'Im Nebensatz steht das gebeugte Verb am Ende.');
    }
    const r = rnd(0, 4);
    if (r === 0) { const m = pick(KM); return D(`Welche Satzart? „${cap(m[0])} ${m[1]} ${m[2]}.“`, 'Aussagesatz', ['Fragesatz', 'Aufforderungssatz', 'Ausrufesatz'], 'Eine Feststellung mit Punkt → Aussagesatz.'); }
    if (r === 1) {
      const m = pick(KM), w = pick(['', 'Wann ', 'Warum ', 'Wo ']);
      return D(`Welche Satzart? „${w}${w ? m[1] : cap(m[1])} ${m[0]} ${m[2]}?“`, 'Fragesatz', ['Aussagesatz', 'Aufforderungssatz', 'Ausrufesatz'], 'Fragezeichen am Ende → Fragesatz.');
    }
    if (r <= 3) return D(`Welche Satzart? „${pick(IMP)}“`, 'Aufforderungssatz', ['Aussagesatz', 'Fragesatz'], 'Befehl oder Bitte (Imperativ) → Aufforderungssatz.');
    return D(`Welche Satzart? „${pick(AUSRUF)}“`, 'Ausrufesatz', ['Aussagesatz', 'Fragesatz'], 'Ausruf von Staunen oder Freude → Ausrufesatz.');
  };

  Object.assign(SUBJECTS.deutsch.topics, { indirekt: 'Indirekte Rede (Konjunktiv I)', saetze: 'Satzarten & Nebensätze' });
})();

// Attribute (Cornelsen Deutschbuch 7): the marked part describes a noun more closely.
(function () {
  const ATTR = [
    ['Der „schnelle“ Stürmer läuft los.', 'Adjektivattribut'],
    ['Wir sehen die „riesige“ Beluga.', 'Adjektivattribut'],
    ['Das „neue“ Trikot ist grün.', 'Adjektivattribut'],
    ['Der „mutige“ Torwart hält den Elfmeter.', 'Adjektivattribut'],
    ['Ich mag den „lauten“ Jubel der Fans.', 'Adjektivattribut'],
    ['Die Flügel „des Flugzeugs“ sind sehr lang.', 'Genitivattribut'],
    ['Das Tor „des Kapitäns“ war wunderschön.', 'Genitivattribut'],
    ['Die Fans „der Borussia“ singen laut.', 'Genitivattribut'],
    ['Der Rucksack „meines Bruders“ ist schwer.', 'Genitivattribut'],
    ['Die Farbe „des Balls“ ist weiß.', 'Genitivattribut'],
    ['Das Spiel „gegen Köln“ war spannend.', 'Präpositionalattribut'],
    ['Der Flug „nach Toulouse“ dauert zwei Stunden.', 'Präpositionalattribut'],
    ['Die Tribüne „hinter dem Tor“ ist voll.', 'Präpositionalattribut'],
    ['Das Buch „über Flugzeuge“ gehört mir.', 'Präpositionalattribut'],
    ['Die Kiste „mit den Ersatzteilen“ ist schwer.', 'Präpositionalattribut'],
    ['Jens Castrop, „unser Mittelfeldspieler“, trifft.', 'Apposition'],
    ['Die An-225, „das größte Flugzeug der Welt“, landet.', 'Apposition'],
    ['Herr Weber, „unser Trainer“, pfeift.', 'Apposition'],
    ['Hamburg, „eine große Hafenstadt“, liegt im Norden.', 'Apposition'],
    ['Haaland, „der norwegische Stürmer“, jubelt.', 'Apposition'],
    ['Der Spieler, „der das Tor schoss“, jubelt.', 'Relativsatz'],
    ['Das Flugzeug, „das dort landet“, ist eine Beluga.', 'Relativsatz'],
    ['Die Kiste, „die du suchst“, steht im Hangar.', 'Relativsatz'],
    ['Der Ball, „den ich bekommen habe“, ist neu.', 'Relativsatz'],
    ['Die Fans, „die aus Köln kommen“, sind laut.', 'Relativsatz'],
  ];
  const TYPES = ['Adjektivattribut', 'Genitivattribut', 'Präpositionalattribut', 'Apposition', 'Relativsatz'];
  const EXPL = {
    Adjektivattribut: 'Ein Adjektiv steht vor dem Nomen und beschreibt es.',
    Genitivattribut: 'Wessen? – Ein Nomen im Genitiv steht hinter dem Nomen.',
    Präpositionalattribut: 'Eine Wortgruppe mit Präposition beschreibt das Nomen genauer.',
    Apposition: 'Ein Nomen im gleichen Fall, durch Kommas abgetrennt.',
    Relativsatz: 'Ein Nebensatz mit der/die/das, der das Nomen beschreibt.',
  };
  DEUTSCH.attribute = () => {
    const [s, c] = pick(ATTR);
    return make('deutsch', 'attribute', `Welches Attribut ist markiert? ${s}`, c, shuffle(TYPES), EXPL[c]);
  };
  SUBJECTS.deutsch.topics.attribute = 'Attribute';
})();

// Negations across tenses (focus topic: Raphael still mixes up tenses and negations).
(function () {
  // [base, 3rd person, past, past participle, -ing, object]
  const V = [
    ['play', 'plays', 'played', 'played', 'playing', 'football'], ['score', 'scores', 'scored', 'scored', 'scoring', 'a goal'],
    ['watch', 'watches', 'watched', 'watched', 'watching', 'the match'], ['win', 'wins', 'won', 'won', 'winning', 'the game'],
    ['fly', 'flies', 'flew', 'flown', 'flying', 'to Hamburg'], ['buy', 'buys', 'bought', 'bought', 'buying', 'a new ball'],
    ['do', 'does', 'did', 'done', 'doing', 'the homework'], ['eat', 'eats', 'ate', 'eaten', 'eating', 'pizza'],
    ['see', 'sees', 'saw', 'seen', 'seeing', 'the Beluga'], ['write', 'writes', 'wrote', 'written', 'writing', 'an email'],
    ['go', 'goes', 'went', 'gone', 'going', 'to school'], ['take', 'takes', 'took', 'taken', 'taking', 'the bus'],
    ['read', 'reads', 'read', 'read', 'reading', 'a book'], ['tidy', 'tidies', 'tidied', 'tidied', 'tidying', 'the room'],
    ['train', 'trains', 'trained', 'trained', 'training', 'hard'], ['call', 'calls', 'called', 'called', 'calling', 'his friend'],
  ];
  const SUBJ = [['I', 1], ['You', 2], ['We', 2], ['They', 2], ['He', 3], ['She', 3], ['Raphael', 3], ['Jens Castrop', 3],
    ['My sister', 3], ['Our team', 3], ['My friends', 2], ['The pilot', 3]];
  const TENSES = [
    { key: 'present', sig: ['every day', 'on Saturdays', 'often'], de: 'Simple Present' },
    { key: 'past', sig: ['yesterday', 'last week', 'two days ago'], de: 'Simple Past' },
    { key: 'perfect', sig: ['yet', 'so far', 'this week'], de: 'Present Perfect' },
    { key: 'progressive', sig: ['right now', 'at the moment'], de: 'Present Progressive' },
    { key: 'will', sig: ['tomorrow', 'next week'], de: 'will-Future' },
  ];
  const third = p => p === 3;
  const neg = (t, [b, s3, past, pp, ing], subj, p) => {
    if (t === 'present') return { c: `${third(p) ? "doesn't" : "don't"} ${b}`, w: [`${third(p) ? "doesn't" : "don't"} ${s3}`, `${third(p) ? "don't" : "doesn't"} ${b}`, `not ${third(p) ? s3 : b}`] };
    if (t === 'past') return { c: `didn't ${b}`, w: [`didn't ${past}`, `doesn't ${b}`, `not ${past}`] };
    if (t === 'perfect') return { c: `${third(p) ? "hasn't" : "haven't"} ${pp}`, w: [`${third(p) ? "hasn't" : "haven't"} ${past === pp ? b : past}`, `${third(p) ? "haven't" : "hasn't"} ${pp}`, `didn't ${pp}`] };
    if (t === 'progressive') {
      const be = subj === 'I' ? "am not" : third(p) ? "isn't" : "aren't";
      const wrongBe = subj === 'I' ? "isn't" : third(p) ? "aren't" : "isn't";
      return { c: `${be} ${ing}`, w: [`${be} ${b}`, `${wrongBe} ${ing}`, `don't ${ing}`] };
    }
    return { c: `won't ${b}`, w: [`won't ${third(p) ? s3 : past}`, `don't will ${b}`, `willn't ${b}`] };
  };
  const EXPL = {
    present: 'Simple Present: don’t / doesn’t (he, she, it) + Grundform – das -s fällt weg!',
    past: 'Simple Past: didn’t + Grundform (nicht die 2. Form!).',
    perfect: 'Present Perfect: haven’t / hasn’t + 3. Form.',
    progressive: 'Present Progressive: am not / isn’t / aren’t + -ing.',
    will: 'will-Future: won’t (= will not) + Grundform.',
  };
  ENGLISCH.negation = () => {
    const T = pick(TENSES), v = pick(V), [subj, p] = pick(SUBJ), sig = pick(T.sig);
    const { c, w } = neg(T.key, v, subj, p);
    const q = `${subj} ___ (not ${v[0]}) ${v[5]} ${sig}.`;
    return make('englisch', 'negation', q, c, w, `Signalwort „${sig}“ → ${EXPL[T.key]}`);
  };
  SUBJECTS.englisch.topics.negation = 'Verneinung (alle Zeiten)';
})();
