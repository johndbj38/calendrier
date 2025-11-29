require('dotenv').config();
const express = require('express');
const ical = require('node-ical');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const ICAL_URL = process.env.ICAL_URL;

if (!ICAL_URL) {
  console.error('Erreur: ICAL_URL non défini dans .env');
  process.exit(1);
}

app.use(cors());

let cache = {
  ts: 0,
  ttlMs: 15 * 60 * 1000,
  data: null
};

function fetchIcs(url) {
  return new Promise((resolve, reject) => {
    ical.fromURL(url, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

function parseEvents(icsData) {
  const events = [];
  for (const k in icsData) {
    const ev = icsData[k];
    if (ev && ev.type === 'VEVENT') {
      events.push({
        uid: ev.uid || null,
        summary: ev.summary || null,
        start: ev.start ? ev.start.toISOString() : null,
        end: ev.end ? ev.end.toISOString() : null,
        allDay: !!ev.datetype,
        raw: {
          location: ev.location || null,
          description: ev.description || null
        }
      });
    }
  }
  events.sort((a, b) => new Date(a.start) - new Date(b.start));
  return events;
}

app.get('/api/availability', async (req, res) => {
  try {
    const now = Date.now();
    if (cache.data && (now - cache.ts) < cache.ttlMs) {
      return res.json({ source: 'cache', events: cache.data });
    }

    const ics = await fetchIcs(ICAL_URL);
    const events = parseEvents(ics);

    cache = { ts: now, ttlMs: cache.ttlMs, data: events };

    res.json({ source: 'remote', events });
  } catch (err) {
    console.error('Erreur fetch/parse ICS:', err);
    res.status(500).json({ error: 'Impossible de récupérer ou parser le calendrier' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend calendrier démarré sur http://localhost:${PORT}`);
});
