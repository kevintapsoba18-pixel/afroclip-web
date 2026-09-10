'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Video, Sparkles, CreditCard, Download, CheckCircle, AlertTriangle, 
  HelpCircle, LogOut, User, Lock, Mail, Loader2, Play, Layers, ArrowRight, X 
} from 'lucide-react';

// ==================================================
// CONFIGURATIONS SERVICES & SERVICES CONSTANTS
// ==================================================
const BACKEND_URL = 'https://afroclip-backend-production.up.railway.app';
const SUPABASE_URL = 'https://efevohzbezzgzmxmpvxy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZXZvaHpiZXp6Z3pteG1wdnh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5Njc5NjgsImV4cCI6MjEwNDU0Mzk2OH0.g7CmQa1zdNhZ8PQaZEwJXDF-Keq4xLiaP6lrDIf4UT4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  badge?: string;
  unitPrice: string;
  validity: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'plan_1000',
    name: 'Découverte',
    price: 1000,
    credits: 5,
    unitPrice: '200 FCFA / vidéo',
    validity: '30 jours',
    features: ['5 Vidéos courtes HD', 'Sous-titres automatiques', 'Découpe IA intelligente']
  },
  {
    id: 'plan_2500',
    name: 'Populaire 🔥',
    price: 2500,
    credits: 15,
    badge: 'Recommandé',
    unitPrice: '~166 FCFA / vidéo',
    validity: 'Sans limite de validité',
    features: ['15 Vidéos courtes HD', 'Traitement prioritaire', 'Découpe IA intelligente', 'Sans expiration']
  },
  {
    id: 'plan_5000',
    name: 'Pro / Agency',
    price: 5000,
    credits: 30,
    badge: 'Pro',
    unitPrice: '~166 FCFA / vidéo',
    validity: 'Sans limite de validité',
    features: ['30 Vidéos courtes Ultra HD', 'Traitement Ultra-rapide', 'Rendus priorités max', 'Support VIP']
  }
];

export default function AfroClipApp() {
  // --- États Authentification ---
  const [user, setUser] = useState<any>(null);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authMessage, setAuthMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // --- États Générateur ---
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [clipsCount, setClipsCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedClips, setGeneratedClips] = useState<Array<{ id: string; url: string; title: string }>>([]);

  // --- États Paiement & Modale Solde Insuffisant ---
  const [insufficientModalOpen, setInsufficientModalOpen] = useState<boolean>(false);
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);

  // --- Accordéon FAQ ---
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Charger la session utilisateur au démarrage
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchUserCredits(session.user.id);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserCredits(session.user.id);
      } else {
        setUser(null);
        setUserCredits(0);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchUserCredits = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setUserCredits(data.credits || 0);
      } else {
        // Solde par défaut pour nouveau compte de démonstration
        setUserCredits(5);
      }
    } catch {
      setUserCredits(5);
    }
  };

  // Gestion Connexion / Inscription
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setAuthMessage({ type: 'success', text: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthModalOpen(false);
      }
    } catch (err: any) {
      setAuthMessage({ type: 'error', text: err.message || 'Une erreur est survenue.' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Soumission de la génération de vidéo
  const handleGenerateClips = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!youtubeUrl.trim()) {
      setGenerationError('Veuillez entrer un lien YouTube valide.');
      return;
    }

    if (userCredits < clipsCount) {
      setInsufficientModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedClips([]);

    try {
      const response = await fetch(`${BACKEND_URL}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: youtubeUrl,
          clipsCount: clipsCount,
          userId: user.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du traitement de la vidéo.');
      }

      // Mise à jour locale du solde de crédits après génération réussie
      const newBalance = userCredits - clipsCount;
      setUserCredits(newBalance);

      // Traitement du résultat retourné
      if (data.clips && Array.isArray(data.clips)) {
        setGeneratedClips(data.clips);
      } else if (data.downloadUrl) {
        setGeneratedClips([
          { id: '1', url: data.downloadUrl, title: 'Clip Extrait #1' }
        ]);
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Impossible de contacter le serveur de traitement.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Intégration du Paiement PayDunya
  const handlePayment = async (plan: Plan) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setPayingPlanId(plan.id);

    try {
      const response = await fetch(`${BACKEND_URL}/api/paydunya/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.price,
          planName: plan.name,
          credits: plan.credits,
          userId: user.id
        })
      });

      const data = await response.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert('Erreur de création de la facture de paiement PayDunya.');
      }
    } catch (err) {
      alert('Impossible de vous rediriger vers la passerelle de paiement.');
    } finally {
      setPayingPlanId(null);
    }
  };

  const faqs = [
    {
      q: "Concrètement, c'est quoi 1 Crédit ?",
      a: "1 Crédit = 1 Vidéo générée. Vos crédits ne dépendent pas du nombre de liens YouTube collés, mais uniquement du nombre total de vidéos finales produites par l'IA."
    },
    {
      q: "Puis-je générer plusieurs vidéos avec un seul lien YouTube ?",
      a: "Oui ! Si vous collez le lien d'un podcast ou d'un cours de 45 minutes, vous pouvez demander à l'IA d'en extraire 5, 15 ou 30 clips d'un coup. Cela consommera simplement 5, 15 ou 30 crédits."
    },
    {
      q: "Puis-je traiter plusieurs liens différents avec un seul pack ?",
      a: "Absolument. Vous pouvez très bien coller 15 liens YouTube différents et générer 1 vidéo par lien. Vous avez une liberté totale."
    },
    {
      q: "Mes crédits expirent-ils après un certain temps ?",
      a: "Les crédits du pack Découverte (1 000 FCFA) sont valables 30 jours. Les crédits des packs Populaire (2 500 FCFA) et Pro (5 000 FCFA) n'expirent JAMAIS."
    },
    {
      q: "Quels sont les modes de paiement acceptés ?",
      a: "Nous acceptons les paiements Mobile Money (Wave, Orange Money, Moov, MTN) via PayDunya ainsi que les cartes bancaires Visa et Mastercard."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* HEADER / NAVIGATION */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-amber-500 to-amber-300 p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
              <Video className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              AfroClip<span className="text-amber-400">.ai</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 px-3.5 py-1.5 rounded-full">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-slate-300">Solde :</span>
                  <span className="text-sm font-extrabold text-amber-400">{userCredits} crédits</span>
                </div>

                <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-sm text-slate-200">
                  <User className="w-4 h-4 text-amber-400" />
                  <span className="max-w-[120px] truncate">{user.email}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/10 flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Se Connecter</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

        {/* HERO BANNER & REGLE DU SYSTEME */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 rounded-full text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recyclage Vidéo IA par excellence</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Transformez vos podcasts en <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">Clips Viraux</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg">
            Collez un lien YouTube, laissez l'IA extraire les meilleurs moments sous forme de vidéos courtes prêtes pour TikTok, Reels et Shorts.
          </p>

          <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 text-left shadow-xl backdrop-blur-sm flex items-start space-x-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0 mt-0.5">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-sm space-y-1">
              <p className="font-bold text-white">💡 La règle d'or : 1 Crédit = 1 Vidéo générée</p>
              <p className="text-slate-300 leading-relaxed">
                Utilisez vos crédits en toute liberté : extrayez 5 ou 15 clips à partir d'un seul long lien, ou traitez plusieurs liens YouTube différents (1 crédit consommé par clip).
              </p>
            </div>
          </div>
        </section>

        {/* SECTION GENERATEUR DE VIDEOS */}
        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleGenerateClips} className="space-y-6 max-w-2xl mx-auto">
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-200">
                Lien de la vidéo YouTube :
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-3.5 pl-11 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
                <Play className="w-5 h-5 text-slate-500 absolute left-4 top-4" />
              </div>
            </div>

            {/* SELECTION DU NOMBRE DE CLIPS */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-200">
                Combien de vidéos souhaitez-vous générer ?
              </label>
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {[1, 3, 5, 15, 30].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setClipsCount(num)}
                    className={`py-3 rounded-xl font-extrabold text-sm border transition-all ${
                      clipsCount === num
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {num} {num > 1 ? 'Clips' : 'Clip'}
                  </button>
                ))}
              </div>
            </div>

            {/* AVERTISSEMENT SOLDE/DEBIT */}
            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <span>Coût de cette génération : <strong className="text-amber-400">{clipsCount} crédits</strong></span>
              <span>Solde disponible : <strong className="text-white">{userCredits} crédits</strong></span>
            </div>

            {/* ERREUR EVENTUELLE */}
            {generationError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{generationError}</span>
              </div>
            )}

            {/* BOUTON DE GENERATION */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 text-base disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Traitement IA en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>GÉNÉRER MES {clipsCount} VIDÉOS ({clipsCount} CRÉDITS)</span>
                </>
              )}
            </button>
          </form>

          {/* CLIPS EXTRAITS RESULTAT */}
          {generatedClips.length > 0 && (
            <div className="mt-10 border-t border-slate-800 pt-8 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>Vidéos extraites avec succès :</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generatedClips.map((clip, idx) => (
                  <div key={clip.id || idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                    <div className="aspect-[9/16] bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden border border-slate-800">
                      <Play className="w-10 h-10 text-amber-400 opacity-80" />
                    </div>
                    <span className="text-xs font-semibold text-slate-300 truncate">{clip.title}</span>
                    <a
                      href={clip.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-2 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* SECTION TARIFS & FORFAITS */}
        <section className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-white">Tarifs Simples et Transparents</h2>
            <p className="text-slate-400 text-sm">Achetez vos crédits via Mobile Money (PayDunya) et utilisez-les immédiatement.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`bg-slate-900 rounded-3xl p-6 border flex flex-col justify-between relative transition-all ${
                  plan.badge 
                    ? 'border-amber-500 shadow-xl shadow-amber-500/10' 
                    : 'border-slate-800'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 right-6 bg-gradient-to-r from-amber-500 to-amber-300 text-slate-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  
                  <div>
                    <span className="text-4xl font-black text-white">{plan.price.toLocaleString()} FCFA</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <p className="text-amber-400 font-extrabold text-base">{plan.credits} Crédits (Vidéos)</p>
                    <p className="text-xs text-slate-400">{plan.unitPrice} • {plan.validity}</p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handlePayment(plan)}
                  disabled={payingPlanId === plan.id}
                  className={`w-full mt-6 py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all ${
                    plan.badge
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {payingPlanId === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Acheter {plan.credits} Crédits</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION FAQ Accordéon */}
        <section className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white flex items-center justify-center space-x-2">
              <HelpCircle className="w-6 h-6 text-amber-400" />
              <span>Foire Aux Questions</span>
            </h2>
            <p className="text-slate-400 text-sm">Tout ce que vous devez savoir sur vos crédits et le fonctionnement de la plateforme.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full text-left p-4 sm:p-5 font-bold text-white text-sm sm:text-base flex items-center justify-between"
                >
                  <span>{faq.q}</span>
                  <span className="text-amber-400 font-black">{openFaqIndex === index ? '−' : '+'}</span>
                </button>
                {openFaqIndex === index && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-300 border-t border-slate-800/60 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© 2026 AfroClip.ai — Plateforme de recyclage vidéo IA optimisée pour l'Afrique.</p>
      </footer>

      {/* MODALE AUTHENTIFICATION (Supabase) */}
      {authModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full relative space-y-6 shadow-2xl">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">
                {isSignUp ? 'Créer un compte' : 'Se Connecter'}
              </h3>
              <p className="text-xs text-slate-400">
                Accédez à AfroClip.ai et gérez votre solde de crédits
              </p>
            </div>

            {authMessage && (
              <div className={`p-3 rounded-xl text-xs ${
                authMessage.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
                {authMessage.text}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="exemple@domaine.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Mot de passe</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 text-sm"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{isSignUp ? "S'inscrire" : 'Se Connecter'}</span>}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthMessage(null);
                }}
                className="text-xs text-amber-400 hover:underline"
              >
                {isSignUp ? 'Vous avez déjà un compte ? Se connecter' : "Pas encore de compte ? S'inscrire"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE RECHARGE (Solde Insuffisant) */}
      {insufficientModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative space-y-6 shadow-2xl">
            <button
              onClick={() => setInsufficientModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Solde insuffisant pour démarrer</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Vous tentez de générer <strong className="text-amber-400">{clipsCount} vidéos</strong>, mais votre solde actuel est de <strong className="text-white">{userCredits} crédits</strong>. Rechargez votre compte pour continuer :
            </p>

            <div className="space-y-3">
              {PLANS.map((plan) => (
                <div key={plan.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{plan.name} — {plan.price.toLocaleString()} FCFA</p>
                    <p className="text-xs text-amber-400">{plan.credits} Crédits ({plan.unitPrice})</p>
                  </div>
                  <button
                    onClick={() => {
                      setInsufficientModalOpen(false);
                      handlePayment(plan);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1"
                  >
                    <span>Recharger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
