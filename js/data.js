'use strict';

const PLANES = [
  { id: 'beluga', photo: 'Marc Lacoste, CC BY-SA 4.0 (Wikimedia Commons)', name: 'Airbus BelugaXL', price: 0, balls: 0, mult: 1.0, speed: 1.0,
    facts: ['Transportiert Flugzeugteile wie Flügel und Rumpfstücke zwischen den Airbus-Werken, z. B. Hamburg-Finkenwerder und Toulouse.',
      'Die BelugaXL hat ein aufgemaltes Wal-Gesicht mit Augen und Lächeln.'] },
  { id: 'a380', photo: 'Acroterion, CC BY-SA 4.0 (Wikimedia Commons)', name: 'Airbus A380', price: 800, balls: 3, mult: 1.2, speed: 1.05,
    facts: ['Das größte Passagierflugzeug der Welt – mit zwei durchgehenden Passagierdecks.',
      'Bis zu 853 Passagiere sind erlaubt, die Spannweite beträgt fast 80 m.'] },
  { id: 'b747', photo: '4300streetcar, CC BY 4.0 (Wikimedia Commons)', name: 'Boeing 747', price: 2000, balls: 6, mult: 1.35, speed: 1.1,
    facts: ['Die „Queen of the Skies“: Erstflug 1969, erkennbar am Buckel mit dem Oberdeck.',
      'Nach über 50 Jahren wurde 2023 die letzte 747 ausgeliefert.'] },
  { id: 'dreamlifter', photo: 'Ktin, CC BY-SA 4.0 (Wikimedia Commons)', name: 'Boeing Dreamlifter', price: 3500, balls: 10, mult: 1.5, speed: 1.1,
    facts: ['Eine umgebaute 747, die Teile für die Boeing 787 transportiert.',
      'Das ganze Heck klappt zur Seite auf! Es gibt nur 4 Stück.'] },
  { id: 'an22', photo: '', name: 'Antonow An-22 „Antei“', price: 5500, balls: 15, mult: 1.75, speed: 1.15,
    facts: ['Das größte Propellerflugzeug (Turboprop) der Welt. Erstflug 1965.',
      'Vier Triebwerke mit je zwei gegenläufigen Propellern – also 8 Propeller!'] },
  { id: 'an225', photo: 'mark steven, CC BY-SA 3.0 (Wikimedia Commons)', name: 'Antonow An-225 „Mrija“', price: 8000, balls: 25, mult: 2.0, speed: 1.2,
    facts: ['Das größte und schwerste Flugzeug, das je gebaut wurde: 84 m lang, 6 Triebwerke.',
      'Es gab nur ein einziges Exemplar. Es wurde 2022 im Krieg in der Ukraine zerstört – hier fliegt es weiter!'] },
];

const CARDS = [
  { id: 'bmg', credit: "Borussia Mönchengladbach, Public domain (Wikimedia Commons)", name: 'Borussia Mönchengladbach', flag: '🐴', pos: 'Verein', no: '1900', price: 100, balls: 1, tier: 'green', club: true,
    fact: '„Die Fohlen“: 5× Deutscher Meister (1970, 71, 75, 76, 77), 2× UEFA-Pokal-Sieger (1975, 79). Stadion: Borussia-Park.' },
  { id: 'nicolas', credit: "borussia.de", highlight: "Begann als Feldspieler – bis er beim Hallentraining ins Tor gestellt wurde!", name: 'Moritz Nicolas', flag: '🇩🇪', pos: 'Torwart', no: '1', born: 1997, price: 150, balls: 1, tier: 'green', club: true },
  { id: 'chiarodia', credit: "borussia.de", highlight: "War mit 16 jüngster Profi der Werder-Geschichte – U19-Europameister 2023", name: 'Fabio Chiarodia', flag: '🇮🇹', pos: 'Abwehr', no: '2', born: 2005, price: 200, balls: 1, tier: 'green', club: true },
  { id: 'scally', highlight: "Stand zweimal im WM-Kader der USA: 2022 und 2026", credit: "borussia.de", name: 'Joe Scally', flag: '🇺🇸', pos: 'Abwehr', no: '29', born: 2002, price: 260, balls: 2, tier: 'green', club: true },
  { id: 'machino', highlight: "Mit Japan Ostasienmeister 2022 – und Torschützenkönig des Turniers!", credit: "borussia.de", name: 'Shuto Machino', flag: '🇯🇵', pos: 'Angriff', no: '18', born: 1999, price: 320, balls: 2, tier: 'green', club: true },
  { id: 'ullrich', credit: "borussia.de", highlight: "U21-Vize-Europameister 2025 und Bundesliga-Rookie des Monats (Februar 2025)", name: 'Lukas Ullrich', flag: '🇩🇪', pos: 'Abwehr', no: '26', born: 2004, price: 390, balls: 2, tier: 'green', club: true },
  { id: 'sander', highlight: "Schaffte 2024 mit Holstein Kiel den Aufstieg in die Bundesliga", credit: "borussia.de", name: 'Philipp Sander', flag: '🇩🇪', pos: 'Mittelfeld', no: '16', born: 1998, price: 460, balls: 3, tier: 'green', club: true },
  { id: 'neuhaus', highlight: "10 Länderspiele und 2 Tore für die deutsche Nationalmannschaft", credit: "borussia.de", name: 'Florian Neuhaus', flag: '🇩🇪', pos: 'Mittelfeld', no: '10', born: 1997, price: 540, balls: 3, tier: 'green', club: true },
  { id: 'uno', credit: "borussia.de", highlight: "Stieg in Japan zweimal in Folge als Zweitligameister auf (2023 und 2024)", name: 'Zento Uno', flag: '🇯🇵', pos: 'Mittelfeld', no: '47', born: 2003, price: 620, balls: 3, tier: 'green', club: true },
  { id: 'diks', highlight: "Dreimal dänischer Meister mit dem FC Kopenhagen (2022, 2023, 2025)", credit: "borussia.de", name: 'Kevin Diks', flag: '🇮🇩', pos: 'Abwehr', no: '4', born: 1996, price: 710, balls: 4, tier: 'green', club: true },
  { id: 'mohya', credit: "borussia.de", highlight: "Jüngster Profi der Gladbacher Vereinsgeschichte – mit 16 Jahren und 9 Monaten!", name: 'Wael Mohya', flag: '🇩🇪', pos: 'Mittelfeld', no: '36', born: 2008, price: 800, balls: 4, tier: 'green', club: true,
    fact: 'Der Jüngste im Profikader – Jahrgang 2008!' },
  { id: 'bolin', highlight: "Zweimal schwedischer Meister mit Malmö FF (2023 und 2024)", credit: "borussia.de", name: 'Hugo Bolin', flag: '🇸🇪', pos: 'Offensive', no: '38', born: 2003, price: 900, balls: 4, tier: 'green', club: true },
  { id: 'hack', credit: "borussia.de", highlight: "Schoss im April 2024 einen Bundesliga-Dreierpack gegen Ex-Klub Hoffenheim", name: 'Robin Hack', flag: '🇩🇪', pos: 'Angriff', no: '25', born: 1998, price: 1000, balls: 5, tier: 'green', club: true },
  { id: 'honorat', highlight: "Gab schon mit 17 Jahren sein Profidebüt in Frankreichs Ligue 1", credit: "borussia.de", name: 'Franck Honorat', flag: '🇫🇷', pos: 'Angriff', no: '9', born: 1996, price: 1100, balls: 5, tier: 'green', club: true },
  { id: 'kleindienst', highlight: "Torschützenkönig der 2. Liga 2022/23 (25 Tore) und Doppelpack für Deutschland beim 7:0", credit: "borussia.de", name: 'Tim Kleindienst', flag: '🇩🇪', pos: 'Angriff', no: '11', born: 1995, price: 1250, balls: 6, tier: 'silver', club: true,
    needs: { club: 5 } },
  { id: 'castrop', credit: "borussia.de", highlight: "Spielte bei der WM 2026 für Südkorea, die Heimat seiner Mutter", name: 'Jens Castrop', flag: '🇰🇷', pos: 'Mittelfeld', no: '17', born: 2003, price: 1800, balls: 10, tier: 'legend', club: true,
    needs: { club: 8 }, fact: 'Raphaels Lieblingsspieler! Spielt mit der 17 für die Fohlen und für die Nationalmannschaft von Südkorea.' },
  { id: 'kane', highlight: "Gewann den Ballon d'Or 2026 – und ist Englands Rekordtorschütze!", credit: "Bryan Berlin, CC BY-SA 4.0 (Wikimedia Commons)", clubName: "FC Bayern München", name: 'Harry Kane', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', pos: 'Sturm', no: '9', price: 1900, balls: 10, tier: 'silver',
    fact: 'Schoss für Bayern in zwei Bundesliga-Saisons je 36 Tore.' },
  { id: 'yamal', highlight: "Mit 17 Europameister (2024), mit 19 Weltmeister (2026)!", credit: "Bryan Berlin, CC BY-SA 4.0 (Wikimedia Commons)", clubName: "FC Barcelona", name: 'Lamine Yamal', flag: '🇪🇸', pos: 'Flügel', no: '10', price: 2000, balls: 11, tier: 'silver',
    fact: 'Jüngster Torschütze der EM-Geschichte (mit 16) und Europameister 2024.' },
  { id: 'mbappe', highlight: "Weltmeister 2018 und WM-Rekordtorschütze aller Zeiten (22 WM-Tore)", credit: "Bryan Berlin, CC BY-SA 4.0 (Wikimedia Commons)", clubName: "Real Madrid", name: 'Kylian Mbappé', flag: '🇫🇷', pos: 'Sturm', no: '10', price: 2100, balls: 11, tier: 'gold',
    fact: 'Mit 19 Weltmeister (2018), im WM-Finale 2022 erzielte er drei Tore.' },
  { id: 'nunomendes', highlight: "Champions-League-Sieger 2025 und 2026 mit Paris Saint-Germain", credit: "Bryan Berlin, CC BY-SA 4.0 (Wikimedia Commons)", clubName: "Paris Saint-Germain", name: 'Nuno Mendes', flag: '🇵🇹', pos: 'Abwehr', no: '25', price: 2200, balls: 12, tier: 'gold', needs: { intl: 3 },
    fact: 'Blitzschneller Linksverteidiger von Paris Saint-Germain und Portugal.' },
  { id: 'haaland', highlight: "Norwegens Rekordtorschütze: 68 Tore in 61 Länderspielen (Stand: Nov. 2026)", credit: "Bryan Berlin, CC BY-SA 4.0 (Wikimedia Commons)", clubName: "Manchester City", name: 'Erling Haaland', flag: '🇳🇴', pos: 'Sturm', no: '9', price: 2300, balls: 12, tier: 'gold',
    fact: 'Rekord: 36 Tore in einer Premier-League-Saison (2022/23).' },
  { id: 'ronaldo', highlight: "Weltrekord: 146 Länderspieltore – so viele wie kein anderer Mann!", credit: "Bryan Berlin, CC BY-SA 4.0 (Wikimedia Commons)", clubName: "Al-Nassr", name: 'Cristiano Ronaldo', flag: '🇵🇹', pos: 'Sturm', no: '7', price: 2500, balls: 13, tier: 'gold',
    fact: 'Rekordtorschütze aller Länderspiele (Männer) und 5× Champions-League-Sieger.' },

];

const TEAMS = [
  { id: 'koe', name: '1. FC Köln', short: 'KÖL', color: '#e2001a', derby: true },
  { id: 'fcb', name: 'FC Bayern', short: 'FCB', color: '#dc052d' },
  { id: 'bvb', name: 'Borussia Dortmund', short: 'BVB', color: '#fde100' },
  { id: 'b04', name: 'Bayer Leverkusen', short: 'B04', color: '#e32221' },
  { id: 'rma', name: 'Real Madrid', short: 'RMA', color: '#f5f5f5' },
  { id: 'mci', name: 'Manchester City', short: 'MCI', color: '#6cabdd' },
  { id: 'liv', name: 'FC Liverpool', short: 'LIV', color: '#c8102e' },
  { id: 'juv', name: 'Juventus Turin', short: 'JUV', color: '#222222' },
  { id: 'psg', name: 'Paris Saint-Germain', short: 'PSG', color: '#004170' },
];

// Cup path: each competition has a tighter shot clock (time factor) than the one before.
const COMPETITIONS = [
  { name: 'DFB-Pokal', icon: '🏆', time: 1.0, prize: 150,
    rounds: [['Achtelfinale', 'koe'], ['Viertelfinale', 'b04'], ['Halbfinale', 'bvb'], ['Finale', 'fcb']] },
  { name: 'Champions League', icon: '⭐', time: 0.8, prize: 250,
    rounds: [['Achtelfinale', 'juv'], ['Viertelfinale', 'liv'], ['Halbfinale', 'mci'], ['Finale', 'rma']] },
  { name: 'Klub-WM', icon: '🌍', time: 0.65, prize: 400,
    rounds: [['Viertelfinale', 'psg'], ['Halbfinale', 'fcb'], ['Finale', 'rma']] },
];
const LEGEND_LEAGUE = { name: 'Legenden-Liga', icon: '👑', time: 0.55, prize: 80 };

const RANKS = ['Bambini', 'F-Jugend', 'E-Jugend', 'D-Jugend', 'C-Jugend', 'B-Jugend', 'A-Jugend', 'Profi',
  'Stammspieler', 'Kapitän', 'Nationalspieler', 'Weltstar', 'Legende'];

const PILOT_RANKS = ['Flugschüler', 'Segelflieger', 'Privatpilot', 'Co-Pilot Kurzstrecke', 'Kapitän Kurzstrecke',
  'Co-Pilot Mittelstrecke', 'Kapitän Mittelstrecke', 'Co-Pilot Langstrecke', 'Kapitän Langstrecke',
  'Fracht-Kapitän', 'Testpilot', 'Chefpilot', 'Flieger-Legende'];
