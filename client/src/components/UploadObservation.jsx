'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle, Loader2, MapPin, Sparkles } from 'lucide-react';
import useObservationStore from '../store/useObservationStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const CATEGORIES = [
    { value: 'Bird', emoji: '🐦', color: '#22d3ee' },
    { value: 'Mammal', emoji: '🦊', color: '#a78bfa' },
    { value: 'Reptile', emoji: '🦎', color: '#34d399' },
    { value: 'Insect', emoji: '🦋', color: '#fbbf24' },
    { value: 'Plant', emoji: '🌿', color: '#4ade80' },
    { value: 'Fish', emoji: '🐟', color: '#60a5fa' },
    { value: 'Amphibian', emoji: '🐸', color: '#f472b6' },
    { value: 'Other', emoji: '🔬', color: '#94a3b8' },
];

const CATEGORY_KEYWORDS = {
    Bird: ['bird', 'parrot', 'eagle', 'hawk', 'owl', 'sparrow', 'crow', 'robin', 'swan', 'duck', 'goose', 'peacock', 'penguin', 'flamingo'],
    Mammal: ['cat', 'dog', 'horse', 'elephant', 'bear', 'lion', 'tiger', 'wolf', 'fox', 'deer', 'rabbit', 'squirrel', 'monkey', 'gorilla', 'zebra', 'giraffe', 'cow', 'sheep', 'pig'],
    Reptile: ['snake', 'lizard', 'gecko', 'iguana', 'chameleon', 'turtle', 'tortoise', 'crocodile', 'alligator'],
    Insect: ['butterfly', 'dragonfly', 'bee', 'wasp', 'ant', 'beetle', 'moth', 'fly', 'mosquito', 'grasshopper', 'cricket', 'ladybug'],
    Plant: ['flower', 'tree', 'leaf', 'plant', 'fern', 'moss', 'grass', 'rose', 'daisy', 'sunflower', 'orchid', 'cactus', 'succulent'],
    Fish: ['fish', 'goldfish', 'shark', 'whale', 'dolphin', 'ray', 'salmon', 'tuna'],
    Amphibian: ['frog', 'toad', 'salamander', 'newt'],
    Other: [],
};

export default function UploadObservation() {
    const [category, setCategory] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [userName, setUserName] = useState('');
    const [notes, setNotes] = useState('');
    const [imagePreview, setImagePreview] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [aiResult, setAiResult] = useState(null);
    const [aiWarning, setAiWarning] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');
    const imgRef = useRef(null);
    const fileInputRef = useRef(null);

    const detectLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLatitude(pos.coords.latitude.toFixed(6));
                    setLongitude(pos.coords.longitude.toFixed(6));
                },
                () => {
                    setLatitude('28.6139');
                    setLongitude('77.2090');
                }
            );
        }
    }, []);

    const runAIDetection = useCallback(
        async (imgElement) => {
            setIsAnalyzing(true);
            setAiResult(null);
            setAiWarning('');

            try {
                const mobilenet = await import('@tensorflow-models/mobilenet');
                await import('@tensorflow/tfjs');
                const model = await mobilenet.load();
                const predictions = await model.classify(imgElement);

                if (predictions.length > 0) {
                    const top = predictions[0];
                    setAiResult({
                        label: top.className,
                        score: top.probability,
                        allPredictions: predictions.slice(0, 3),
                    });

                    if (category) {
                        const keywords = CATEGORY_KEYWORDS[category] || [];
                        const detectedLower = top.className.toLowerCase();
                        const isMatch = keywords.some(keyword =>
                            detectedLower.includes(keyword) || keyword.includes(detectedLower)
                        );

                        if (!isMatch && category !== 'Other') {
                            setAiWarning(
                                `AI identified "${top.className}" (${(top.probability * 100).toFixed(0)}% confidence), which doesn't match "${category}". You can still submit.`
                            );
                        } else {
                            setAiWarning('');
                        }
                    }
                } else {
                    setAiResult({ label: 'Unknown', score: 0, allPredictions: [] });
                }
            } catch (err) {
                console.error('AI detection failed:', err);
                setAiResult(null);
            } finally {
                setIsAnalyzing(false);
            }
        },
        [category]
    );

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setImageBase64(reader.result);

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                imgRef.current = img;
                if (category) {
                    runAIDetection(img);
                }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    const handleCategoryChange = (val) => {
        setCategory(val);
        setAiWarning('');
        if (imgRef.current) {
            runAIDetection(imgRef.current);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitSuccess(false);

        if (!category || !latitude || !longitude) {
            setError('Please fill in category and location.');
            return;
        }

        setIsSubmitting(true);
        let uploadedUrl = null;

        try {
            // 1. Upload to Cloudinary if image exists
            if (imageBase64) {
                // Convert base64 to File object for multer
                const res = await fetch(imageBase64);
                const blob = await res.blob();
                const file = new File([blob], "observation.jpg", { type: "image/jpeg" });

                const formData = new FormData();
                formData.append('image', file);

                const uploadRes = await fetch(`${API_URL}/api/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    uploadedUrl = uploadData.url;
                } else {
                    // Fallback to base64 if upload fails
                    uploadedUrl = imageBase64;
                    console.warn('Cloudinary upload failed, falling back to base64');
                }
            }

            const body = {
                category,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                userName: userName || 'Anonymous',
                notes: notes || null,
                imageUrl: uploadedUrl,
                aiLabel: aiResult?.label || null,
                confidenceScore: aiResult?.score || null,
            };

            const res = await fetch(`${API_URL}/api/observations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Failed to submit');

            setSubmitSuccess(true);
            setCategory('');
            setLatitude('');
            setLongitude('');
            setNotes('');
            setImagePreview(null);
            setImageBase64(null);
            setAiResult(null);
            setAiWarning('');
            imgRef.current = null;

            setTimeout(() => setSubmitSuccess(false), 3000);
        } catch (err) {
            setError('Failed to submit observation. Is the server running?');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => handleCategoryChange(cat.value)}
                            className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-all duration-200 ${category === cat.value
                                ? 'border-cyan-400 bg-cyan-400/10 text-white shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10'
                                }`}
                        >
                            <span className="text-lg">{cat.emoji}</span>
                            <span>{cat.value}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Photo
                </label>
                <div
                    className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-white/20 bg-white/5 transition-all hover:border-cyan-400/50 hover:bg-white/10"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imagePreview ? (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-40 w-full rounded-xl object-cover"
                            />
                            {isAnalyzing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 text-cyan-400">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span className="text-sm font-medium">AI Analyzing...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-28 flex-col items-center justify-center gap-2 text-white/40">
                            <Camera className="h-8 w-8" />
                            <span className="text-xs">Click to upload photo</span>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </div>
            </div>

            {aiResult && (
                <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-3">
                    <div className="flex items-center gap-2 text-xs">
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span className="font-semibold text-purple-300">AI Detection</span>
                    </div>
                    <div className="mt-1 text-sm text-white/80">
                        Detected: <span className="font-bold text-white">{aiResult.label}</span>{' '}
                        <span className="text-cyan-400">
                            ({(aiResult.score * 100).toFixed(0)}%)
                        </span>
                    </div>
                    {aiResult.allPredictions.length > 1 && (
                        <div className="mt-1 flex gap-2 text-xs text-white/50">
                            {aiResult.allPredictions.slice(1).map((p, i) => (
                                <span key={i}>
                                    {p.className} ({(p.probability * 100).toFixed(0)}%)
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {aiWarning && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{aiWarning}</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        Latitude
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="28.6139"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                        Longitude
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="77.2090"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={detectLocation}
                className="flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-400 transition-all hover:bg-cyan-500/20"
            >
                <MapPin className="h-3.5 w-3.5" />
                Use My Location
            </button>

            <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Your Name
                </label>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Anonymous"
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                />
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Notes
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe what you observed..."
                    rows={3}
                    className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30"
                />
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{error}</span>
                </div>
            )}

            {submitSuccess && (
                <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span>Observation submitted successfully!</span>
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || !category}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                    </>
                ) : (
                    <>
                        <Upload className="h-4 w-4" />
                        Submit Observation
                    </>
                )}
            </button>
        </form>
    );
}
