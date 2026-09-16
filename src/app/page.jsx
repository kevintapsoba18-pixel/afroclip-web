"use client"

import { useEffect, useRef, useState } from "react"
import {
  Play,
  Sparkles,
  Scissors,
  Subtitles,
  Video,
  Zap,
  Copy,
  Crown,
  Wand2,
  Download
} from "lucide-react"

// Remplace par l'URL publique de ton backend Railway si différente,
// ou définis NEXT_PUBLIC_API_URL dans les variables d'environnement Vercel.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://afroclip-backend-production.up.railway.app"

// Le backend attend des valeurs numériques / clés sans accents
const DURATION_TO_SECONDS = { "15s": 15, "30s": 30, "60s": 60 }
const STYLE_TO_KEY = {
  "Karaoké": "karaoke",
  "Néon": "neon",
  "Gras Blanc": "gras-blanc",
  "Pop Orange": "pop-orange"
}

const STATUS_LABELS = {
  idle: "",
  pending: "Préparation...",
  downloading: "Récupération de la vidéo...",
  analyzing: "Analyse de la vidéo...",
  processing: "Découpage et sous-titrage...",
  uploading: "Finalisation...",
  done: "Terminé !",
  error: "Erreur"
}

export default function AfroClipHome() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [clipDuration, setClipDuration] = useState("30s")
  const [subtitleStyle, setSubtitleStyle] = useState("Karaoké")
  const [job, setJob] = useState({ status: "idle", progress: 0, error: null, clips: [] })
  const pollRef = useRef(null)

  const isProcessing = ["pending", "downloading", "analyzing", "processing", "uploading"].includes(job.status)

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  useEffect(() => {
    return () => stopPolling()
  }, [])

  const startPolling = (jobId) => {
    stopPolling()
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/analyze/${jobId}`)
        if (!res.ok) throw new Error("Job introuvable")
        const data = await res.json()
        setJob(data)
        if (data.status === "done" || data.status === "error") {
          stopPolling()
        }
      } catch (err) {
        setJob((prev) => ({ ...prev, status: "error", error: err.message }))
        stopPolling()
      }
    }, 2500)
  }

  const handleGenerate = async () => {
    if (!youtubeUrl) return

    setJob({ status: "pending", progress: 0, error: null, clips: [] })

    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim(),
          clipDuration: DURATION_TO_SECONDS[clipDuration] || 30,
          subtitleStyle: STYLE_TO_KEY[subtitleStyle] || "gras-blanc"
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Lien YouTube invalide ou erreur serveur")
      }

      const data = await res.json()
      startPolling(data.jobId)
    } catch (err) {
      setJob({ status: "error", progress: 0, error: err.message, clips: [] })
    }
  }

  const handleReset = () => {
    stopPolling()
    setYoutubeUrl("")
    setJob({ status: "idle", progress: 0, error: null, clips: [] })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start p-4 sm:p-8 font-sans">
      {/* Header / Navbar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-4 border-b border-slate-800/80 mb-8 sm:mb-12">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[2px]">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            AfroClip<span className="text-purple-400">.ai</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            <span>0 Crédits</span>
          </div>
          <button className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition shadow-lg shadow-purple-900/20">
            S'inscrire
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-4xl flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/50 text-purple-300 text-xs font-medium mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Le studio IA n°1 pour les créateurs africains</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-tight mb-4">
          Transforme tes vidéos YouTube en <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Shorts viraux</span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed">
          Colle un lien, l'IA découpe, sous-titre et recadre automatiquement. Prêt pour TikTok, Reels et Shorts en quelques secondes.
        </p>

        {/* Form Card */}
        <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl mb-12">
          {/* Input Box */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Play className="h-5 w-5 text-purple-400 fill-purple-400/20" />
            </div>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="Colle le lien YouTube ici..."
              disabled={isProcessing}
              className="w-full pl-11 pr-12 py-3.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition disabled:opacity-60"
            />
            <button
              onClick={() => {
                navigator.clipboard.readText().then(text => setYoutubeUrl(text)).catch(() => {})
              }}
              disabled={isProcessing}
              className="absolute inset-y-1.5 right-1.5 px-3 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition disabled:opacity-60"
              title="Coller depuis le presse-papier"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-left">
            {/* Clip Duration */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Durée du clip
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "15s", label: "15 s", desc: "Punchy" },
                  { id: "30s", label: "30 s", desc: "Équilibré" },
                  { id: "60s", label: "60 s", desc: "Story" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setClipDuration(item.id)}
                    disabled={isProcessing}
                    className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center disabled:opacity-60 ${
                      clipDuration === item.id
                        ? "bg-purple-600/20 border-purple-500 text-white shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className="text-xs font-bold">{item.label}</span>
                    <span className="text-[10px] text-slate-500">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitle Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Style de sous-titres
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "Karaoké", label: "Karaoké", desc: "Jaune vibrant" },
                  { id: "Néon", label: "Néon", desc: "Glow violet" },
                  { id: "Gras Blanc", label: "Gras Blanc", desc: "Classique" },
                  { id: "Pop Orange", label: "Pop Orange", desc: "Style Afro" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSubtitleStyle(item.id)}
                    disabled={isProcessing}
                    className={`p-2 rounded-xl border text-left transition disabled:opacity-60 ${
                      subtitleStyle === item.id
                        ? "bg-purple-600/20 border-purple-500 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {job.status !== "done" && (
            <button
              onClick={handleGenerate}
              disabled={isProcessing || !youtubeUrl}
              className={`w-full py-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition shadow-xl ${
                isProcessing || !youtubeUrl
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:opacity-95 shadow-purple-950/50"
              }`}
            >
              {isProcessing ? (
                <>
                  <Zap className="h-5 w-5 animate-spin text-amber-300" />
                  <span>{STATUS_LABELS[job.status]} {job.progress}%</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 text-amber-300" />
                  <span>Générer les Shorts IA</span>
                </>
              )}
            </button>
          )}

          {/* Progress bar */}
          {isProcessing && (
            <div className="mt-3 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 transition-all duration-500"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          )}

          {/* Error */}
          {job.status === "error" && (
            <div className="mt-4 text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl p-3 flex items-center justify-between">
              <span>{job.error || "Erreur inconnue"}</span>
              <button onClick={handleReset} className="underline text-red-300">
                Réessayer
              </button>
            </div>
          )}

          {/* Résultats */}
          {job.status === "done" && (
            <div className="mt-2 text-left">
              <p className="text-sm font-semibold text-white mb-3">
                {job.clips.length} short{job.clips.length > 1 ? "s" : ""} prêt{job.clips.length > 1 ? "s" : ""} !
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {job.clips.map((clip, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                    <video src={clip.url} controls className="w-full aspect-[9/16] object-cover bg-black" />
                    <div className="p-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{clip.title}</span>
                      <a href={clip.url} download className="text-purple-400 font-medium flex items-center gap-1">
                        <Download className="h-3 w-3" /> DL
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl border border-slate-700 text-slate-200 text-sm font-medium hover:bg-slate-800/50 transition"
              >
                Analyser une autre vidéo
              </button>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left mb-16">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <Scissors className="h-6 w-6 text-purple-400 mb-2" />
            <h3 className="font-semibold text-sm text-white mb-1">Découpe Intelligente</h3>
            <p className="text-xs text-slate-400">Détection automatique des meilleurs moments forts de la vidéo.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <Subtitles className="h-6 w-6 text-pink-400 mb-2" />
            <h3 className="font-semibold text-sm text-white mb-1">Sous-titres Dynamiques</h3>
            <p className="text-xs text-slate-400">Mots surbrillés mot par mot pour maximiser la rétention.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <Video className="h-6 w-6 text-amber-400 mb-2" />
            <h3 className="font-semibold text-sm text-white mb-1">Format 9:16 Auto</h3>
            <p className="text-xs text-slate-400">Recadrage parfait centré sur le visage de la personne qui parle.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl border-t border-slate-900 py-6 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© 2026 AfroClip.ai — Le studio IA pour créateurs africains.</div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-400 transition">Conditions</a>
          <a href="#" className="hover:text-slate-400 transition">Confidentialité</a>
          <a href="#" className="hover:text-slate-400 transition">Contact</a>
        </div>
      </footer>
    </div>
  )
}
