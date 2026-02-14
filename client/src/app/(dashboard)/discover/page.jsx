'use client';

import { useState, useEffect } from 'react';
import useAuthStore from '../../../store/authStore';
import {
    Search, Leaf, Droplets, PawPrint, Wind, TreePine, Globe,
    Users, MapPin, ChevronLeft, X, FlaskConical, FileText,
    ClipboardList, UserPlus, ArrowRight, Filter, Sparkles,
    Trophy, Eye, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const RESEARCH_FIELDS = [
    {
        id: 'Ecology',
        label: 'Ecology',
        desc: 'Study of ecosystems, habitats, and biodiversity patterns',
        icon: Leaf,
        color: '#10b981',
        gradient: 'from-emerald-500/20 to-emerald-600/5',
    },
    {
        id: 'Water Quality',
        label: 'Water Quality',
        desc: 'Monitoring freshwater and marine water conditions',
        icon: Droplets,
        color: '#3b82f6',
        gradient: 'from-blue-500/20 to-blue-600/5',
    },
    {
        id: 'Wildlife Conservation',
        label: 'Wildlife Conservation',
        desc: 'Tracking and protecting animal species and their habitats',
        icon: PawPrint,
        color: '#f59e0b',
        gradient: 'from-amber-500/20 to-amber-600/5',
    },
    {
        id: 'Botany',
        label: 'Botany',
        desc: 'Studying plant species, distribution, and phenology',
        icon: TreePine,
        color: '#22c55e',
        gradient: 'from-green-500/20 to-green-600/5',
    },
    {
        id: 'Air Quality',
        label: 'Air Quality',
        desc: 'Measuring atmospheric pollutants and air conditions',
        icon: Wind,
        color: '#8b5cf6',
        gradient: 'from-violet-500/20 to-violet-600/5',
    },
    {
        id: 'Environmental Science',
        label: 'Environmental Science',
        desc: 'Broad environmental monitoring and climate research',
        icon: Globe,
        color: '#00F2FF',
        gradient: 'from-cyan-500/20 to-cyan-600/5',
    },
];

const DATA_TYPES = ['Wildlife', 'Water', 'Air', 'Plant'];
const STATUS_OPTIONS = ['Open', 'Recruiting', 'Ongoing'];

const STATUS_CONFIG = {
    Open: { color: '#10b981', bg: 'bg-emerald-500/15', text: 'text-emerald-400', icon: CheckCircle2 },
    Recruiting: { color: '#f59e0b', bg: 'bg-amber-500/15', text: 'text-amber-400', icon: AlertCircle },
    Ongoing: { color: '#3b82f6', bg: 'bg-blue-500/15', text: 'text-blue-400', icon: Clock },
    Closed: { color: '#6b7280', bg: 'bg-gray-500/15', text: 'text-gray-400', icon: X },
};

export default function DiscoverPage() {
    const user = useAuthStore((s) => s.user);
    const [selectedField, setSelectedField] = useState(null);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [projectDetail, setProjectDetail] = useState(null);
    const [joining, setJoining] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState(false);

    // Filters
    const [filterDataType, setFilterDataType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterLocation, setFilterLocation] = useState('');

    // Fetch projects when field or filters change
    useEffect(() => {
        if (!selectedField) return;
        fetchProjects();
    }, [selectedField, filterDataType, filterStatus, filterLocation]);

    async function fetchProjects() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('field', selectedField);
            if (filterDataType) params.set('dataType', filterDataType);
            if (filterStatus) params.set('status', filterStatus);
            if (filterLocation) params.set('location', filterLocation);

            const res = await fetch(`${API_URL}/api/discover?${params}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            console.error('Failed to fetch projects:', err);
            setProjects([]);
        }
        setLoading(false);
    }

    async function openDetail(projectId) {
        setSelectedProject(projectId);
        setDetailLoading(true);
        setJoinSuccess(false);
        try {
            const res = await fetch(`${API_URL}/api/discover/${projectId}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setProjectDetail(data);
        } catch (err) {
            console.error('Failed to fetch detail:', err);
        }
        setDetailLoading(false);
    }

    async function handleJoin() {
        if (!projectDetail || !user) return;
        setJoining(true);
        try {
            const res = await fetch(`${API_URL}/api/missions/${projectDetail.id}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName: user.name || user.email }),
            });
            if (res.ok) {
                setJoinSuccess(true);
                // Refresh detail
                const updated = await fetch(`${API_URL}/api/discover/${projectDetail.id}`);
                if (updated.ok) setProjectDetail(await updated.json());
            }
        } catch (err) {
            console.error('Failed to join:', err);
        }
        setJoining(false);
    }

    // ─── Field Selection View ─────────────────────────────────
    if (!selectedField) {
        return (
            <div className="flex-1 overflow-y-auto" style={{ background: '#0B0E14' }}>
                <div className="mx-auto max-w-4xl px-6 py-10">
                    {/* Header */}
                    <div className="mb-10 text-center" style={{ animation: 'fadeSlideIn 0.4s ease' }}>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9D50FF]/20 to-[#3b82f6]/10 border border-[#9D50FF]/20">
                            <Search className="h-7 w-7 text-[#9D50FF]" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            Discover Research Projects
                        </h1>
                        <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">
                            Select your field of interest to explore ongoing citizen science projects looking for research collaboration.
                        </p>
                    </div>

                    {/* Field Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {RESEARCH_FIELDS.map((field, i) => (
                            <button
                                key={field.id}
                                onClick={() => setSelectedField(field.id)}
                                className="group relative flex flex-col items-start gap-3 rounded-2xl border border-white/[0.06] p-5 text-left transition-all duration-300 hover:border-white/[0.12] hover:scale-[1.02]"
                                style={{
                                    background: 'rgba(21, 25, 33, 0.5)',
                                    backdropFilter: 'blur(12px)',
                                    animation: `fadeSlideIn 0.4s ease ${i * 70}ms both`,
                                }}
                            >
                                {/* Glow on hover */}
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                    style={{
                                        background: `radial-gradient(ellipse at center, ${field.color}08 0%, transparent 70%)`,
                                    }}
                                />

                                <div className="relative flex items-center gap-3">
                                    <div
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                                        style={{ backgroundColor: `${field.color}15`, border: `1px solid ${field.color}25` }}
                                    >
                                        <field.icon className="h-5 w-5" style={{ color: field.color }} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-white group-hover:text-white/90">
                                            {field.label}
                                        </h3>
                                    </div>
                                </div>

                                <p className="relative text-xs text-white/35 leading-relaxed">
                                    {field.desc}
                                </p>

                                <div className="relative mt-auto flex items-center gap-1.5 text-[10px] font-medium" style={{ color: `${field.color}90` }}>
                                    <span>Explore projects</span>
                                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ─── Project Listing View ─────────────────────────────────
    const activeField = RESEARCH_FIELDS.find(f => f.id === selectedField);

    return (
        <div className="flex-1 overflow-y-auto" style={{ background: '#0B0E14' }}>
            <div className="mx-auto max-w-5xl px-6 py-6">
                {/* Top Bar */}
                <div className="mb-6 flex items-center gap-3" style={{ animation: 'fadeSlideIn 0.3s ease' }}>
                    <button
                        onClick={() => { setSelectedField(null); setProjects([]); setFilterDataType(''); setFilterStatus(''); setFilterLocation(''); }}
                        className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs text-white/50 transition-all hover:bg-white/[0.06] hover:text-white"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                        Back
                    </button>
                    <div className="flex items-center gap-2">
                        {activeField && (
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded-lg"
                                style={{ backgroundColor: `${activeField.color}15` }}
                            >
                                <activeField.icon className="h-4 w-4" style={{ color: activeField.color }} />
                            </div>
                        )}
                        <div>
                            <h2 className="text-base font-bold text-white">{selectedField}</h2>
                            <p className="text-[10px] text-white/30">{projects.length} project{projects.length !== 1 ? 's' : ''} found</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3" style={{ animation: 'fadeSlideIn 0.3s ease 80ms both' }}>
                    <Filter className="h-3.5 w-3.5 text-white/25" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/25">Filters</span>
                    <div className="h-4 w-px bg-white/[0.06]" />

                    {/* Location search */}
                    <div className="relative">
                        <MapPin className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-white/25" />
                        <input
                            type="text"
                            placeholder="Search location..."
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="rounded-lg border border-white/[0.06] bg-white/[0.03] py-1.5 pl-7 pr-3 text-xs text-white/80 placeholder-white/20 outline-none transition-all focus:border-[#9D50FF]/30 focus:bg-white/[0.05] w-40"
                        />
                    </div>

                    {/* Data type */}
                    <select
                        value={filterDataType}
                        onChange={(e) => setFilterDataType(e.target.value)}
                        className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 outline-none transition-all focus:border-[#9D50FF]/30 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                        <option value="">All Data Types</option>
                        {DATA_TYPES.map(dt => (
                            <option key={dt} value={dt}>{dt}</option>
                        ))}
                    </select>

                    {/* Status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-white/60 outline-none transition-all focus:border-[#9D50FF]/30 cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    {(filterDataType || filterStatus || filterLocation) && (
                        <button
                            onClick={() => { setFilterDataType(''); setFilterStatus(''); setFilterLocation(''); }}
                            className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] text-white/30 hover:text-white/60 transition-colors"
                        >
                            <X className="h-3 w-3" />
                            Clear
                        </button>
                    )}
                </div>

                {/* Project Cards Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9D50FF] border-t-transparent" />
                            <span className="text-xs text-white/40">Discovering projects...</span>
                        </div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20" style={{ animation: 'fadeSlideIn 0.4s ease' }}>
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                            <Search className="h-6 w-6 text-white/20" />
                        </div>
                        <h3 className="text-sm font-semibold text-white/50 mb-1">No projects found</h3>
                        <p className="text-xs text-white/30">Try adjusting your filters or selecting a different field.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projects.map((project, i) => {
                            const statusConf = STATUS_CONFIG[project.status] || STATUS_CONFIG.Open;
                            return (
                                <button
                                    key={project.id}
                                    onClick={() => openDetail(project.id)}
                                    className="group relative flex flex-col gap-3 rounded-2xl border border-white/[0.06] p-5 text-left transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.02]"
                                    style={{
                                        background: 'rgba(21, 25, 33, 0.4)',
                                        backdropFilter: 'blur(12px)',
                                        animation: `fadeSlideIn 0.3s ease ${i * 60}ms both`,
                                    }}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-white mb-1 group-hover:text-[#00F2FF] transition-colors truncate">
                                                {project.title}
                                            </h3>
                                            <p className="text-[11px] text-white/35 line-clamp-2 leading-relaxed">
                                                {project.description || 'No description available.'}
                                            </p>
                                        </div>
                                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusConf.bg} ${statusConf.text}`}>
                                            {project.status}
                                        </span>
                                    </div>

                                    {/* Meta */}
                                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-white/30">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span className="truncate max-w-[150px]">{project.coverageArea}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FlaskConical className="h-3 w-3" />
                                            <span>{project.dataType}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            <span>{project.volunteerCount} volunteer{project.volunteerCount !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Trophy className="h-3 w-3 text-amber-400/50" />
                                            <span>{project.bountyPoints} pts</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                                        <span className="text-[10px] text-white/20">by {project.createdBy}</span>
                                        <span className="flex items-center gap-1 text-[10px] font-medium text-[#9D50FF]/60 group-hover:text-[#9D50FF] transition-colors">
                                            View details
                                            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedProject && (
                <ProjectDetailModal
                    detail={projectDetail}
                    loading={detailLoading}
                    joining={joining}
                    joinSuccess={joinSuccess}
                    onJoin={handleJoin}
                    onClose={() => { setSelectedProject(null); setProjectDetail(null); }}
                    userName={user?.name || user?.email}
                />
            )}
        </div>
    );
}

/* ─── Project Detail Modal ──────────────────────────────────────── */
function ProjectDetailModal({ detail, loading, joining, joinSuccess, onJoin, onClose, userName }) {
    if (loading || !detail) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9D50FF] border-t-transparent" />
                    <span className="text-xs text-white/40">Loading project details...</span>
                </div>
            </div>
        );
    }

    const statusConf = STATUS_CONFIG[detail.status] || STATUS_CONFIG.Open;
    const alreadyJoined = detail.volunteers?.some(v => v.userName === userName);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
            <div
                className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/[0.08]"
                style={{ background: 'rgba(11, 14, 20, 0.97)', backdropFilter: 'blur(20px)', animation: 'fadeSlideIn 0.3s ease' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-white/40 transition-all hover:bg-white/[0.1] hover:text-white"
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusConf.bg} ${statusConf.text}`}>
                                {detail.status}
                            </span>
                            <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[10px] text-white/40">
                                {detail.dataType}
                            </span>
                            <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] text-amber-400">
                                {detail.bountyPoints} pts bounty
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">{detail.title}</h2>
                        <p className="text-xs text-white/40 leading-relaxed">{detail.description}</p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                            { label: 'Volunteers', value: detail.volunteerCount, icon: Users, color: '#9D50FF' },
                            { label: 'Observations', value: detail.observationCount, icon: Eye, color: '#00F2FF' },
                            { label: 'Data Req.', value: detail.dataRequirement, icon: ClipboardList, color: '#f59e0b' },
                        ].map(stat => (
                            <div key={stat.label} className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] py-3">
                                <stat.icon className="h-4 w-4 mb-0.5" style={{ color: stat.color }} />
                                <span className="text-sm font-bold text-white">{stat.value}</span>
                                <span className="text-[9px] text-white/25 uppercase tracking-wider">{stat.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Sections */}
                    <div className="space-y-5">
                        {/* Research Objective */}
                        {detail.scientificGoal && (
                            <DetailSection icon={FlaskConical} title="Research Objective" color="#9D50FF">
                                <p className="text-xs text-white/50 leading-relaxed">{detail.scientificGoal}</p>
                            </DetailSection>
                        )}

                        {/* Data Collection Protocol */}
                        {detail.dataProtocol && (
                            <DetailSection icon={ClipboardList} title="Data Collection Protocol" color="#00F2FF">
                                <p className="text-xs text-white/50 leading-relaxed whitespace-pre-line">{detail.dataProtocol}</p>
                            </DetailSection>
                        )}

                        {/* Coverage Area */}
                        <DetailSection icon={MapPin} title="Coverage Area" color="#10b981">
                            <p className="text-xs text-white/50">{detail.coverageArea}</p>
                        </DetailSection>

                        {/* Required Observations */}
                        <DetailSection icon={FileText} title="Required Data" color="#f59e0b">
                            <div className="flex flex-wrap gap-2">
                                {detail.dataRequirement === 'both' ? (
                                    <>
                                        <span className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-400">📷 Image required</span>
                                        <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-[11px] text-blue-400">📝 Text notes required</span>
                                    </>
                                ) : detail.dataRequirement === 'image' ? (
                                    <span className="rounded-lg bg-amber-500/10 px-3 py-1.5 text-[11px] text-amber-400">📷 Image required</span>
                                ) : (
                                    <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-[11px] text-blue-400">📝 Text notes required</span>
                                )}
                                <span className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/40">
                                    Type: {detail.dataType}
                                </span>
                            </div>
                        </DetailSection>

                        {/* Active Volunteers */}
                        {detail.volunteers?.length > 0 && (
                            <DetailSection icon={Users} title={`Active Volunteers (${detail.volunteers.length})`} color="#9D50FF">
                                <div className="flex flex-wrap gap-2">
                                    {detail.volunteers.map((v, i) => (
                                        <div key={i} className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-1.5">
                                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#9D50FF]/20 text-[8px] font-bold text-[#9D50FF]">
                                                {v.userName[0].toUpperCase()}
                                            </div>
                                            <span className="text-[11px] text-white/60">{v.userName}</span>
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded ${v.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'}`}>
                                                {v.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </DetailSection>
                        )}

                        {/* Recent Observations */}
                        {detail.recentObservations?.length > 0 && (
                            <DetailSection icon={Eye} title="Recent Observations" color="#00F2FF">
                                <div className="space-y-2">
                                    {detail.recentObservations.map(obs => (
                                        <div key={obs.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2">
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[11px] font-medium text-white/70">{obs.category}</span>
                                                {obs.aiLabel && <span className="text-[10px] text-[#9D50FF] ml-1.5">· {obs.aiLabel}</span>}
                                            </div>
                                            <span className="text-[10px] text-white/25">{obs.userName}</span>
                                            {obs.verified && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                                        </div>
                                    ))}
                                </div>
                            </DetailSection>
                        )}
                    </div>

                    {/* Join / Contact Button */}
                    <div className="mt-6 flex items-center gap-3 border-t border-white/[0.06] pt-5">
                        <div className="flex-1">
                            <p className="text-[10px] text-white/25">Created by</p>
                            <p className="text-xs font-medium text-white/60">{detail.createdBy}</p>
                        </div>

                        {alreadyJoined || joinSuccess ? (
                            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-2.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm font-medium text-emerald-400">Joined</span>
                            </div>
                        ) : (
                            <button
                                onClick={onJoin}
                                disabled={joining}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9D50FF] to-[#3b82f6] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#9D50FF]/20 disabled:opacity-50"
                            >
                                {joining ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <UserPlus className="h-4 w-4" />
                                )}
                                <span>{joining ? 'Joining...' : 'Join Mission'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Detail Section Helper ─────────────────────────────────── */
function DetailSection({ icon: Icon, title, color, children }) {
    return (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4">
            <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}12` }}>
                    <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <h4 className="text-xs font-bold text-white/70 uppercase tracking-wide">{title}</h4>
            </div>
            {children}
        </div>
    );
}
