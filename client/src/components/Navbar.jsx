'use client';

import { Globe, Wifi, WifiOff, Users, Eye } from 'lucide-react';
import useObservationStore from '../store/useObservationStore';

export default function Navbar() {
    const isConnected = useObservationStore((s) => s.isConnected);
    const clientCount = useObservationStore((s) => s.clientCount);
    const observationCount = useObservationStore((s) => s.observations.length);

    return (
        <nav className="flex items-center justify-between border-b border-white/10 bg-gray-950/80 px-6 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                    <Globe className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-white">
                        CitSci<span className="text-cyan-400">Net</span>
                    </h1>
                    <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">
                        Citizen Science Network
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                    <Eye className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="font-mono text-white/70">{observationCount}</span>
                    <span className="text-white/40">obs</span>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                    <Users className="h-3.5 w-3.5 text-purple-400" />
                    <span className="font-mono text-white/70">{clientCount}</span>
                    <span className="text-white/40">live</span>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">
                    {isConnected ? (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-40" />
                                <Wifi className="relative h-3.5 w-3.5 text-green-400" />
                            </div>
                            <span className="text-green-400">Live</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="h-3.5 w-3.5 text-red-400" />
                            <span className="text-red-400">Offline</span>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
