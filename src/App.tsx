// src/App.tsx
import React, { useState } from 'react';
import { Home } from 'lucide-react';
import Features from './components/Features';
import AvailabilityCalendar from './components/AvailabilityCalendar';

function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Smooth scroll utilities
  function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function smoothScrollTo(element: HTMLElement, duration = 900) {
    const start = window.scrollY || window.pageYOffset;
    const rect = element.getBoundingClientRect();
    const target = rect.top + start;
    const startTime = performance.now();

    function loop(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, Math.round(start + (target - start) * eased));
      if (elapsed < duration) requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  function scrollToAvailability() {
    const el = document.getElementById('availability');
    if (!el) return;
    smoothScrollTo(el, 900);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-screen">
        <img
          src="https://imgur.com/UfHFcuB.jpg"
          alt="Lac du Bourget"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 flex flex-col justify-start items-center text-white text-center px-4 pt-16 md:pt-24">
          <h1 className="text-6xl md:text-8xl font-bold mb-7 text-white font-serif">
            The Tiny Home
          </h1>
          <p className="text-3xl md:text-4xl mb-8 font-light">Lac du Bourget</p>
          <p className="text-2xl md:text-3xl mb-4 font-semibold">
            Séjour romantique en Duo 
            entre lac et montagne
          </p>
       
          <div className="mt-10 text-center px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Info et Réservation
            </h2>

            <div className="flex flex-col items-center gap-3 max-w-2xl mx-auto">
              <a
                href="mailto:thetinyhome73@gmail.com"
                className="break-all text-lg md:text-2xl font-semibold text-white-400 hover:text-green-200 text-center"
              >
                thetinyhome73@gmail.com
              </a>

              <span className="text-base md:text-lg text-gray-200">
                
              </span>

              <button
                onClick={scrollToAvailability}
                className="bg-[#FF385C] text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-[#E31C5F] transition whitespace-nowrap"
                aria-label="Voir les disponibilités"
              >
                <Home className="w-5 h-5" />
                Voir les disponibilités
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white" />
      </div>

      {/* Location and Description Section */}
      <div className="container mx-auto px-4 pt-20 pb-16 bg-white relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <img
            src="https://imgur.com/r0oO02w.jpg"
            alt="Logo Tiny Home"
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="flex flex-wrap gap-8 relative z-10">
          <div className="flex-1 min-w-[300px]">
            <h2 className="text-3xl font-bold mb-6">Emplacement Stratégique</h2>
            <p className="text-gray-700 mb-4">
              Située à Voglans (73420), notre Tiny Home vous offre un accès
              privilégié à de nombreuses attractions :
            </p>
            <ul className="space-y-2 text-gray-600">
              <li>• À quelques minutes du lac du Bourget</li>
              <li>• Proche d'Aix-les-Bains et ses thermes</li>
              <li>• À proximité de Chambéry et sa vieille ville</li>
              <li>• Accès aux sentiers de randonnée</li>
              <li>• 30 minutes des stations de ski</li>
              <li>• Accès direct à l'autoroute A41</li>
            </ul>
          </div>

          <div className="flex-1 min-w-[300px]">
            <h2 className="text-3xl font-bold mb-6">Description</h2>
            <p className="text-gray-700 mb-4">
              La Tiny House fait face au lac du Bourget d'un côté et au Massif
              des Bauges de l'autre. Elle comprend un séjour-cuisine avec un
              coin nuit et une salle de bains.
            </p>
            <div className="text-gray-700">
              <p className="mb-2">Services inclus :</p>
              <ul className="list-disc pl-5">
                <li>Linge de lit et serviettes de bain fournis</li>
                <li>Ménage inclus</li>
                <li>Nous demandons de rendre le logement rangé comme à votre arrivée</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-2 text-center">Notre Tiny en photo</h2>
        <p className="text-center text-gray-600 mb-8">Cliquez sur les photos pour agrandir.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            'https://i.imgur.com/vSD2lFT.jpg',
            'https://imgur.com/CtnAtAV.jpg',
            'https://imgur.com/UfHFcuB.jpg',
            'https://i.imgur.com/EmX9g4o.jpg',
            'https://imgur.com/C0h19OE.jpg',
            'https://i.imgur.com/HWvqhhM.jpg',
            'https://i.imgur.com/m6rM8W2.jpg',
            'https://imgur.com/vDQHmxR.jpg',
            'https://imgur.com/qQjCsKl.jpg',
            'https://i.imgur.com/5gSq0r6.jpg',
            'https://imgur.com/XV3y5VD.jpg',
            'https://imgur.com/0yIgOHu.jpg',
            'https://imgur.com/HVHOIir.jpg',
            'https://imgur.com/u6jNTR1.jpg',
            'https://i.imgur.com/wIHntLk.jpg',
            'https://i.imgur.com/AXLzhdy.jpg',
            'https://imgur.com/Dj8q05v.jpg',
            'https://imgur.com/9ZELmze.jpg',
          ].map((imageUrl, index) => (
            <div
              key={index}
              className="rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
              onClick={() => openModal(imageUrl)}
            >
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={`Tiny Home ${index + 1}`}
                  loading="fast"
                  decoding="async"
                  className="w-full h-80 object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition bg-blend-multiply" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-800">Voir en grand</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div className="relative max-w-full max-h-full">
            <img src={selectedImage} alt="Tiny Home en grand" className="max-w-full max-h-[90vh] rounded-lg" />
            <button onClick={closeModal} className="absolute top-4 right-4 bg-white text-black rounded-full p-2 hover:bg-gray-200 transition" aria-label="Fermer l'image">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Features Section */}
      <Features />

      {/* Calendar (centered and limited width) */}
      <AvailabilityCalendar />

      {/* Footer */}
      <div className="bg-white py-8 border-t border-gray-200 relative overflow-hidden">
        <img src="https://i.imgur.com/r0oO02w.jpg" alt="Tiny Home Logo" className="hidden md:block absolute bottom-8 left-4 w-20 opacity-100 pointer-events-none" />
        <img src="https://i.imgur.com/r0oO02w.jpg" alt="Tiny Home Logo" className="hidden md:block absolute bottom-8 right-4 w-20 opacity-100 pointer-events-none" />

        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24" stroke="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <p className="text-gray-700 font-semibold">The Tiny Home</p>
          </div>
          <p className="text-gray-600">Lac Du Bourget</p>
        </div>
      </div>
    </div>
  );
}

export default App;
