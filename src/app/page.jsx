'use client';

import React, { useState } from 'react';
import { Youtube, Sparkles, Video, CheckCircle, Flame, Download, RefreshCw } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState('30s');
  const [style, setStyle] = useState('Karaoké');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // URL de ton backend Railway
  const BACKEND_URL = 'https://afroclip-backend-production.up.railway.app';

  const handleGenerate = async () => {
    if (!url) {
      alert('Veuillez entrer un lien YouTube valide');
      return;
    }
    setLoading(true);
    setVideoUrl(null);

    try {
      const response = await fetch(`${BACKEND_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          duration,
          style,
        }),
      });

      const data = await response.json();

      if (data.success && data.videoUrl) {
        setVideoUrl(data.videoUrl);
      } else {
        alert('Erreur lors de la génération du Short: ' + (data.error || 'Erreur inconnue'));
      }
    } catch (err) {
      console.error(err);
      alert('Impossible de contacter le serveur backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-extrabold text-xl tracking-wide">
          <div className="bg-gradient-to-tr from-purple-600 to-pink-500 p-2 rounded-xl text-white">
            <Video className="w-5 h-5" />
          </div>
          <span>AfroClip<span className="text-purple-500">.ai</span></span>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition">
          Connexion
        </button>
      </header>

      {/* Hero & Generator */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs px-3 py-1.5 rounded-full mb-6 mx-auto font-medium">
          <Flame className="w-4 h-4 text-orange-400" /> Le modèle IA #1 pour les créateurs africains
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Transforme tes vidéos YouTube en <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">Shorts viraux</span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg mb-8 max-w-2xl mx-auto">
          Colle un lien, l’IA découpe, sous-titre et recadre automatiquement. Prêt pour TikTok, Reels et Shorts en quelques secondes.
        </p>

        {/* Input Box */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-2xl backdrop-blur-md mb-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Youtube className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Colle un lien YouTube ici..."
                className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-left">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Durée du Clip
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['15s', '30s', '60s'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`py-2 rounded-xl text-xs font-bold transition border ${
                      duration === d
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Style de sous-titres
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Karaoké', 'Néon', 'Gros Blanc', 'Pop Orange'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-center truncate transition ${
                      style === s
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Générer les Shorts IA
              </>
            )}
          </button>
        </div>

        {/* Output Video Section */}
        {videoUrl && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl mt-4">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" /> Ton Short est prêt !
            </h3>
            <div className="max-w-xs mx-auto aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-2xl mb-4 border border-slate-800">
              <video src={videoUrl} controls className="w-full h-full object-cover" />
            </div>
            <a
              href={videoUrl}
              download
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-xl transition"
            >
              <Download className="w-4 h-4" /> Télécharger la vidéo
            </a>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        © 2026 AfroClip.ai — Découpage automatique & Sous-titres dynamiques par IA.
      </footer>
    </main>
  );
}
