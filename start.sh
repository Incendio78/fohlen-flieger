#!/usr/bin/env bash
# Starts the game locally: open http://localhost:8765 in Chrome/Firefox.
cd "$(dirname "$0")"
echo "Fohlen & Flieger läuft auf: http://localhost:8765  (Beenden mit Strg+C)"
python3 -m http.server 8765 --bind 127.0.0.1
