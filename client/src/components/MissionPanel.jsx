'use client';

import { useState, useEffect } from 'react';
import { Target, Trophy, Clock, CheckCircle2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function MissionPanel({ missions = [], userLocation, userName = 'Anonymous' }) {
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'
    const [myMissions, setMyMissions] = useState([]);

    useEffect(() => {
        // Filter missions I've accepted (you would normally fetch from API)
        const accepted = missions.filter(m =>
            m.userMissions?.some(um => um.userName === userName)
        );
        setMyMissions(accepted);
    }, [missions, userName]);

    const handleAcceptMission = async (mission) => {
        try {
            const res = await fetch(`${API_URL}/api/missions/${mission.id}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName })
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || 'Failed to accept mission');
                return;
            }

            alert(`Mission accepted! 🎯 ${mission.bountyPoints} pts awaiting!`);
            // Refresh missions list
            window.location.reload();
        } catch (err) {
            console.error('Failed to accept mission:', err);
            alert('Failed to accept mission');
        }
    };

    const displayMissions = activeTab === 'all' ? missions : myMissions;

    return (
        <div className="flex h-full flex-col">
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'all'
                        ? 'border-b-2 border-cyan-400 text-cyan-400'
                        : 'text-white/60 hover:text-white/80'
                        }`}
                >
                    All Missions
                </button>
                <button
                    onClick={() => setActiveTab('my')}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'my'
                        ? 'border-b-2 border-cyan-400 text-cyan-400'
                        : 'text-white/60 hover:text-white/80'
                        }`}
                >
                    My Missions ({myMissions.length})
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {displayMissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-white/40">
                        <Target className="h-12 w-12 mb-2" />
                        <p className="text-sm">
                            {activeTab === 'all' ? 'No active missions' : 'No missions accepted yet'}
                        </p>
                    </div>
                ) : (
                    displayMissions.map((mission) => {
                        const isAccepted = mission.userMissions?.some(um => um.userName === userName);
                        const isCompleted = mission.userMissions?.some(
                            um => um.userName === userName && um.status === 'completed'
                        );

                        return (
                            <div
                                key={mission.id}
                                className="rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
                            >
                                <div className="mb-2 flex items-start justify-between">
                                    <h4 className="text-sm font-bold text-white">{mission.title}</h4>
                                    <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-400">
                                        🎯 {mission.bountyPoints}
                                    </span>
                                </div>

                                {mission.description && (
                                    <p className="mb-2 text-xs text-white/70">{mission.description}</p>
                                )}

                                <div className="flex items-center gap-2 text-xs text-white/50">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(mission.createdAt).toLocaleDateString()}</span>
                                </div>

                                {isCompleted ? (
                                    <div className="mt-2 flex items-center gap-1 rounded bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Completed
                                    </div>
                                ) : isAccepted ? (
                                    <div className="mt-2 flex items-center gap-1 rounded bg-cyan-500/20 px-2 py-1 text-xs font-medium text-cyan-400">
                                        <Trophy className="h-3 w-3" />
                                        In Progress
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleAcceptMission(mission)}
                                        className="mt-2 w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:brightness-110"
                                    >
                                        Accept Mission
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
