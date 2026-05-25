"use client";

import { useState, useRef } from "react";

interface ImageData {
  id: string;
  dataUrl: string;
}

export default function HomePage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [extraInstructions, setExtraInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    const remaining = 10 - images.length;
    const toAdd = Array.from(files).slice(0, remaining);

    Promise.all(toAdd.map(file => {
      return new Promise<ImageData>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          id: `${Date.now()}-${Math.random()}`,
          dataUrl: reader.result as string,
        });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    })).then(newImages => {
      setImages(prev => [...prev, ...newImages]);
      setError(null);
    }).catch(() => {
      setError("Impossible de lire une des images.");
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(id: string) {
    setImages(prev => prev.filter(img => img.id !== id));
  }

  async function handleGenerate() {
    if (images.length === 0 || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map(i => i.dataUrl),
          extraInstructions,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la génération.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().slice(0, 10);
      a.download = `evaluation-${today}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur de connexion. Réessayez.");
      }
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Générateur d'évaluations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Transforme une page de cours en évaluation prête à imprimer.
          </p>
        </header>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
          {/* Bouton upload */}
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 10}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 disabled:opacity-50 border-2 border-dashed border-slate-300 rounded-xl text-slate-700 font-medium transition"
            >
              📸 Ajouter des photos
              <span className="block text-xs text-slate-500 mt-1">
                {images.length} / 10 images
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Aperçu images */}
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map(img => (
                <div key={img.id} className="relative aspect-square">
                  <img
                    src={img.dataUrl}
                    alt=""
                    className="w-full h-full object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md"
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Instructions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Instructions supplémentaires (optionnel)
            </label>
            <textarea
              value={extraInstructions}
              onChange={e => setExtraInstructions(e.target.value)}
              placeholder="Ex : 'niveau CM1', 'insiste sur la conjugaison des verbes en -er'…"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Bouton générer */}
          <button
            onClick={handleGenerate}
            disabled={images.length === 0 || isGenerating}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-300 text-white rounded-xl font-semibold transition flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Spinner />
                <span>Analyse du cours en cours… (peut prendre jusqu'à 1 minute)</span>
              </>
            ) : (
              <>✨ Générer l'évaluation</>
            )}
          </button>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Succès */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
              ✅ Évaluation prête ! Le téléchargement a démarré.
            </div>
          )}
        </div>

        <footer className="text-center text-xs text-slate-500 mt-6">
          Les photos ne sont pas stockées. Tout est traité à la volée.
        </footer>
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
