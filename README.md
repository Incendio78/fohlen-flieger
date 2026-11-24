# Fohlen & Flieger ⚽✈️

Lernspiel für Gymnasium Klasse 7 (Mathe, Englisch, Deutsch) – reines HTML5/JavaScript, keine Abhängigkeiten.

## Starten (Laptop)

```bash
./start.sh        # dann http://localhost:8765 im Browser öffnen
```

## Spielmodi

- **Pokal-Weg (Elfmeterschießen)** – DFB-Pokal → Champions League → Klub-WM → Legenden-Liga. Pro Schuss läuft eine Uhr; in jedem neuen Wettbewerb gibt es weniger Zeit. Schießen: auf die richtige Antwort zielen. Halten: in die Ecke mit der richtigen Antwort springen. Zu langsam = gehalten bzw. Gegentor.
- **Passspiel** – Draufsicht aufs Feld, 16 Fragen = 90 Minuten: zum Mitspieler mit der richtigen Antwort passen; nach 3 Pässen dribbelt der Spieler in den Strafraum und schießt. Bei Ballverlust in den richtigen Raum laufen, um den Ball zurückzuerobern.
- **Torjagd 90'** – Kopfrechnen (Einmaleins, Plus/Minus, Geteilt, Punkt vor Strich, 4 Stufen) auf Zeit; Ergebnis über Ziffernblock eintippen. Nur hier gibt es **goldene Bälle** (1 pro 5 Tore, Fehler zählen dagegen; +1 erste Torjagd des Tages, +2 Rekord) – die braucht man zusätzlich zu Talern für Karten und Flugzeuge.
- **Cockpit** – aus dem Cockpit durch die richtige von vier Karten (2×2) steuern, 12 Tore pro Flug. Steuern mit Maus/Finger (Position im Fenster = Kurs) oder Pfeiltasten; Tore abwechselnd links/rechts (Kurven). Klick auf eine Karte = Vollgas zum Tor.
- **Mrija-Fracht** – mit der An-225 die Kiste mit der richtigen Antwort holen und mit Landeanflug am Flughafen mit der richtigen Antwort abliefern (5 Lieferungen).
- **Cargo-Flug** – mit Beluga & Co. durch das Tor mit der richtigen Antwort fliegen, 15 Tore (Touch/Stift, Maus oder ↑/↓/1–3). Ohne Gleichungen.
- **Hangar / Sammelalbum** – mit verdienten Talern Flugzeuge und Karten der aktuellen Borussia-Mannschaft und Weltstars freischalten (Kleindienst ab 5, Jens Castrop ab 8 Borussia-Karten; Nuno Mendes ab 3 internationalen Stars).
- **Fehler-Training** – falsch beantwortete Fragen kommen wieder, bis sie sitzen.
- **Eltern-Bereich** – Statistik und Stufe pro Thema, Themen an/aus, Tagesziel.

Bei einer falschen Antwort hält jedes Spiel an, bis „Weiter“ gedrückt wird. Ca. jede 10. Frage ist eine Fußball-Quizfrage (abschaltbar im Eltern-Bereich).

Schwierigkeit: Kopfrechnen hat 4, Mathe 3 Stufen pro Thema. Bewertet werden die letzten 6 Antworten: mind. 5 richtig und schnell → hoch; 3 Fehler oder sehr langsam → runter.

Preise: Flugzeuge nur nacheinander (A380 800 🪙 + 3 Bälle … An-225 8000 🪙 + 25 Bälle). Karten haben feste Preise, die in Album-Reihenfolge steigen (100 🪙 + 1 Ball … Ronaldo 2500 🪙 + 13 Bälle). Alles zusammen ≈ 43 000 Taler und ≈ 185 goldene Bälle.
Fortschritt wird lokal im Browser gespeichert (`localStorage`).

## Inhalte anpassen

- Fragen/Themen: `js/questions.js` (Mathe, Kopfrechnen, Grundgerüst) und `js/content.js` (Englisch/Deutsch-Generatoren)
- Flugzeuge, Spielerkarten, Gegner, Wettbewerbe: `js/data.js`
- Flugzeugfotos: `img/planes/<id>.jpg` (Hangar) und `img/planes/<id>-sprite.png` (freigestellt, Nase nach rechts, für die Spiele). Quellen: Wikimedia Commons, Urheber/Lizenz stehen im Hangar.
- Fortschritt zurücksetzen: Eltern-Bereich → „Alles zurücksetzen“.
- Nach Änderungen für installierte Tablet-Version: `VERSION` in `sw.js` erhöhen.

## Tablet (geplant)

Die App ist eine PWA (`manifest.webmanifest`, `sw.js`): über HTTPS gehostet (z. B. GitHub Pages) kann sie in Chrome auf Android per „Zum Startbildschirm hinzufügen“ installiert werden und läuft danach offline. Alternativ lässt sie sich als APK verpacken.
