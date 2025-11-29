// src/components/AvailabilityCalendar.tsx
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type EventItem = {
  uid: string | null;
  summary: string | null;
  start: string | null;
  end: string | null;
};

const DEFAULT_PRICE_PER_NIGHT = 139; // € / nuit par défaut

// Définition des prix spéciaux par date
// Format: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', price: Number }
// Les dates sont inclusives.
const SPECIAL_PRICES = [
  { start: '2025-12-24', end: '2025-12-26', price: 250 }, // Noël 2025
  { start: '2026-02-14', end: '2026-02-14', price: 250 }, // Saint-Valentin 2026
  // Ajoute d'autres dates spéciales ici
  // Exemple: { start: '2026-01-01', end: '2026-01-02', price: 200 }, // Nouvel An
];

const TARGET_EMAIL = 'thetinyhome73@gmail.com';

export default function AvailabilityCalendar() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disabledSet, setDisabledSet] = useState<Set<string>>(new Set());

  const [range, setRange] = useState<Date[] | null>(null);

  // Form fields
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';
        const res = await fetch(`${API_BASE}/api/availability`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const ev: EventItem[] = json.events || [];
        setEvents(ev);

        const s = new Set<string>();
        for (const e of ev) {
          if (!e.start || !e.end) continue;
          const start = new Date(e.start);
          const end = new Date(e.end);
          for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            s.add(dateToYMD(new Date(d)));
          }
        }
        setDisabledSet(s);
      } catch (err: any) {
        setError(err.message || 'Erreur inconnue');
        setDisabledSet(new Set());
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  function dateToYMD(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function tileDisabled({ date, view }: { date: Date; view: string }) {
    if (view !== 'month') return false;
    return disabledSet.has(dateToYMD(date));
  }

  function formatDate(d: Date) {
    return d.toLocaleDateString('fr-FR');
  }

  function calcNightsAndPrice(range: Date[] | null) {
    if (!range || range.length !== 2 || !range[0] || !range[1]) return { nights: 0, price: 0 };
    const start = new Date(range[0]);
    const end = new Date(range[1]);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.round((end.getTime() - start.getTime()) / msPerDay);
    const nights = diff > 0 ? diff : 0;

    let totalPrice = 0;
    if (nights > 0) {
      for (let d = new Date(start); d.getTime() < end.getTime(); d.setDate(d.getDate() + 1)) {
        const currentDayYMD = dateToYMD(d);
        let priceForThisNight = DEFAULT_PRICE_PER_NIGHT;

        // Vérifier si la date actuelle est dans une période de prix spécial
        for (const specialPrice of SPECIAL_PRICES) {
          const specialStart = new Date(specialPrice.start);
          const specialEnd = new Date(specialPrice.end);
          specialStart.setHours(0,0,0,0); // Normaliser pour comparaison
          specialEnd.setHours(0,0,0,0); // Normaliser pour comparaison

          if (d.getTime() >= specialStart.getTime() && d.getTime() <= specialEnd.getTime()) {
            priceForThisNight = specialPrice.price;
            break; // On a trouvé un prix spécial pour cette nuit, pas besoin de chercher plus
          }
        }
        totalPrice += priceForThisNight;
      }
    }

    return { nights, price: totalPrice };
  }

  const { nights, price } = calcNightsAndPrice(range);

  function validateForm() {
    setFormError(null);
    if (!nom.trim()) return setFormError('Le nom est requis.');
    if (!prenom.trim()) return setFormError('Le prénom est requis.');
    if (!email.trim()) return setFormError("L'adresse mail est requise.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setFormError('Adresse mail invalide.');
    if (!tel.trim()) return setFormError('Le numéro de téléphone est requis.');
    if (!range || range.length !== 2 || nights <= 0) return setFormError('Veuillez sélectionner une plage de dates valide (au moins 1 nuit).');
    if (range && range.length === 2) {
      const s = new Date(range[0]);
      const e = new Date(range[1]);
      for (let d = new Date(s); d < e; d.setDate(d.getDate() + 1)) {
        if (disabledSet.has(dateToYMD(new Date(d)))) {
          return setFormError('La plage sélectionnée contient des dates indisponibles. Choisissez une autre plage.');
        }
      }
    }
    return true;
  }

  function buildMailBody() {
    if (!range || range.length !== 2) return '';
    const startStr = formatDate(range[0]);
    const endStr = formatDate(range[1]);
    return [
      'Demande de réservation - The Tiny Home',
      '',
      `Nom : ${nom}`,
      `Prénom : ${prenom}`,
      `Téléphone : ${tel}`,
      `Adresse e-mail : ${email}`,
      '',
      `Arrivée : ${startStr}`,
      `Départ : ${endStr}`,
      `Nuits : ${nights}`,
      `Prix total : ${price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`,
      '',
      'Merci de revenir vers moi au plus vite pour confirmer la réservation.',
    ].join('\n');
  }

  function buildMailtoLink() {
    const subject = `Demande de réservation - The Tiny Home (${prenom} ${nom})`;
    const body = buildMailBody();
    const params = new URLSearchParams({
      subject,
      body,
    });
    return `mailto:${TARGET_EMAIL}?${params.toString()}`;
  }

  async function copyToClipboard() {
    setFormError(null);
    if (!validateForm()) return;
    const text = `À : ${TARGET_EMAIL}\n\n${buildMailBody()}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
    } catch (err: any) {
      setFormError('Impossible de copier dans le presse-papiers.');
    }
  }

  async function copyEmailOnly() {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(TARGET_EMAIL);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = TARGET_EMAIL;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2500);
    } catch (err: any) {
      setFormError('Impossible de copier l\'adresse e-mail.');
    }
  }

  function openMailClient() {
    setFormError(null);
    if (!validateForm()) return;
    const mailto = buildMailtoLink();
    window.location.href = mailto;
  }

  // Détermine le prix par nuit à afficher sous le formulaire
  // Si une plage est sélectionnée et qu'un prix spécial s'applique à la première nuit, on l'affiche.
  // Sinon, on affiche le prix par défaut.
  const displayedPricePerNight = (() => {
    if (range && range.length === 2) {
      const startDay = new Date(range[0]);
      startDay.setHours(0,0,0,0);
      for (const specialPrice of SPECIAL_PRICES) {
        const specialStart = new Date(specialPrice.start);
        const specialEnd = new Date(specialPrice.end);
        specialStart.setHours(0,0,0,0);
        specialEnd.setHours(0,0,0,0);
        if (startDay.getTime() >= specialStart.getTime() && startDay.getTime() <= specialEnd.getTime()) {
          return specialPrice.price;
        }
      }
    }
    return DEFAULT_PRICE_PER_NIGHT;
  })();


  return (
    <section id="availability" className="py-12 bg-white">
      <div className="max-w-3xl mx-auto px-4">
        <h3 className="text-2xl font-bold mb-6 text-center">Calendrier & Réservations</h3>

        {loading && <p className="text-center">Chargement…</p>}
        {error && <p className="text-red-500 text-center">Erreur (availability) : {error}</p>}

        <div className="flex justify-center mb-6">
          <div className="w-full max-w-md">
            <Calendar
              className="mx-auto w-full"
              tileDisabled={tileDisabled}
              selectRange={true}
              onChange={(val: Date | Date[] | null) => {
                if (Array.isArray(val)) setRange(val as Date[]);
                else if (val instanceof Date) setRange([val]);
                else setRange(null);
              }}
              value={range as any}
            />
          </div>
        </div>

        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600">
            Sélectionnez une plage de dates (check‑in / check‑out). Les jours gris sont indisponibles.
          </p>
        </div>

        <form className="bg-gray-50 p-6 rounded-md shadow-sm" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input type="tel" value={tel} onChange={(e) => setTel(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date d'arrivée</label>
              <input
                readOnly
                value={range && range.length === 2 ? formatDate(range[0]) : ''}
                placeholder="Sélectionnez sur le calendrier"
                className="mt-1 block w-full border rounded-md px-3 py-2 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date de départ</label>
              <input
                readOnly
                value={range && range.length === 2 ? formatDate(range[1]) : ''}
                placeholder="Sélectionnez sur le calendrier"
                className="mt-1 block w-full border rounded-md px-3 py-2 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Prix total</label>
              <input
                readOnly
                value={price > 0 ? price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '—'}
                className="mt-1 block w-full border rounded-md px-3 py-2 bg-white"
              />
            </div>
          </div>

          {formError && <p className="mt-4 text-red-500">{formError}</p>}

          <div className="mt-6 flex flex-col md:flex-row items-center gap-3 justify-between">
            <div className="flex gap-3">

              <button
                type="button"
                onClick={openMailClient}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                Envoyer la demande de reservation (pré‑rempli)
              </button>

              <button
                type="button"
                onClick={copyToClipboard}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Copier le formulaire.
              </button>
            </div>

            <div className="text-sm text-gray-600">
              <p>Prix par nuit : <strong>{displayedPricePerNight.toLocaleString('fr-FR')}€</strong></p>
              <p>Nuits sélectionnées : <strong>{nights}</strong></p>
            </div>
          </div>

          {copied && (
            <div
              role="status"
              aria-live="polite"
              className="mt-6 p-4 rounded-md border bg-green-50 border-green-200 text-green-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <p className="mb-1 font-medium">Le formulaire a été copié.</p>
                <p>
                  Envoyez-nous votre formulaire à{' '}
                  <a href={`mailto:${TARGET_EMAIL}`} className="underline font-semibold">
                    {TARGET_EMAIL}
                  </a>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={copyEmailOnly}
                  className="bg-white border px-3 py-1 rounded-md text-sm hover:bg-gray-50 transition"
                >
                  {emailCopied ? 'Adresse copiée ✓' : 'Copier l\'adresse'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}