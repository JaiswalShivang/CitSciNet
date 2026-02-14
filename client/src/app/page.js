'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import SocketProvider from '../providers/SocketProvider';
import Navbar from '../components/Navbar';
import UploadObservation from '../components/UploadObservation';
import ObservationFeed from '../components/ObservationFeed';
import useObservationStore from '../store/useObservationStore';
import { Layers, ChevronDown } from 'lucide-react';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
        <span className="text-sm text-cyan-400/70">Loading map...</span>
      </div>
    </div>
  ),
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const setObservations = useObservationStore((s) => s.setObservations);

  const { data } = useQuery({
    queryKey: ['observations'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/observations`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    retry: 3,
    retryDelay: 2000,
  });

  useEffect(() => {
    if (data) {
      setObservations(data);
    }
  }, [data, setObservations]);

  return (
    <SocketProvider>
      <div className="flex h-screen flex-col bg-[#050510]">
        <Navbar />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative">
            <MapComponent />

            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs backdrop-blur-sm">
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-white/70">Satellite 3D</span>
              </div>
            </div>
          </div>

          <aside className="flex w-[380px] shrink-0 flex-col border-l border-white/10 bg-gray-950/50 backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3.5">
              <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              <h2 className="text-sm font-bold tracking-tight text-white">
                New Observation
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <UploadObservation />

              <div className="my-6 border-t border-white/10" />

              <ObservationFeed />
            </div>

            <div className="border-t border-white/10 px-5 py-3">
              <div className="flex items-center justify-center gap-1 text-[10px] text-white/30">
                <span>CitSciNet v1.0</span>
                <span>•</span>
                <span>Built for Hackathon 2026</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SocketProvider>
  );
}
