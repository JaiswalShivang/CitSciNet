'use client';

import { Activity, MapPin } from 'lucide-react';
import useObservationStore from '../store/useObservationStore';

const CATEGORY_COLORS = {
    Bird: '#22d3ee',
    Mammal: '#a78bfa',
    Reptile: '#34d399',
    Insect: '#fbbf24',
    Plant: '#4ade80',
    Fish: '#60a5fa',
    Amphibian: '#f472b6',
    Other: '#94a3b8',
};

function timeAgo(timestamp) {
    const diff = Date.now() - new Date(timestamp).getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
}

export default function ObservationFeed() {
    const observations = useObservationStore((s) => s.observations);
    const setSelectedObservation = useObservationStore(
        (s) => s.setSelectedObservation
    );

    if (observations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-white/30">
                <Activity className="mb-3 h-10 w-10" />
                <p className="text-sm font-medium">No observations yet</p>
                <p className="text-xs">Submit one to get started!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                <Activity className="h-3.5 w-3.5" />
                Live Feed
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            </h3>

            <div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin">
                {observations.slice(0, 20).map((obs, index) => (
                    <div
                        key={obs.id}
                        onClick={() => setSelectedObservation(obs)}
                        className="group cursor-pointer rounded-lg border border-white/5 bg-white/5 p-3 transition-all duration-200 hover:border-cyan-500/30 hover:bg-white/10"
                        style={{
                            animationDelay: `${index * 50}ms`,
                            animation: 'fadeSlideIn 0.3s ease forwards',
                        }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-2.5 w-2.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            CATEGORY_COLORS[obs.category] || '#94a3b8',
                                        boxShadow: `0 0 8px ${CATEGORY_COLORS[obs.category] || '#94a3b8'}50`,
                                    }}
                                />
                                <span className="text-sm font-medium text-white/90">
                                    {obs.category}
                                </span>
                            </div>
                            <span className="text-[10px] text-white/40">
                                {timeAgo(obs.createdAt)}
                            </span>
                        </div>

                        {obs.notes && (
                            <p className="mt-1 line-clamp-2 text-xs text-white/50">
                                {obs.notes}
                            </p>
                        )}

                        <div className="mt-1.5 flex items-center gap-3 text-[10px] text-white/30">
                            <span className="flex items-center gap-1">
                                <MapPin className="h-2.5 w-2.5" />
                                {obs.latitude.toFixed(2)}, {obs.longitude.toFixed(2)}
                            </span>
                            <span>by {obs.userName}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
