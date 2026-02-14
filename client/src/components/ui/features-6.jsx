import { Cpu, Lock, Sparkles, Zap } from 'lucide-react';

export function Features() {
    return (
        <section className="py-16 md:py-32 bg-gray-950">
            <div className="mx-auto max-w-5xl space-y-12 px-6">
                <div className="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12">
                    <h2 className="text-4xl font-semibold text-white">The Universal Ecosystem for Scientific Data</h2>
                    <p className="max-w-sm text-white/50">Empower your research with workflows that adapt to your needs, whether you prefer automated AI tagging or specialized manual validation.</p>
                </div>
                <div className="relative rounded-3xl p-3 md:-mx-8 lg:col-span-3">
                    <div className="aspect-[88/36] relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                        <div className="bg-gradient-to-t z-1 from-[#121212] absolute inset-0 to-transparent"></div>
                        <img
                            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=2000"
                            className="absolute inset-0 z-10 w-full h-full object-cover opacity-60"
                            alt="Data Analysis Illustration"
                        />
                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                            <div className="text-center space-y-4 px-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold text-cyan-400 backdrop-blur-md">
                                    <Sparkles className="h-3 w-3" />
                                    <span>AI-Augmented Workflows</span>
                                </div>
                                <h3 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Real-time Data Intelligence</h3>
                                <p className="max-w-xl mx-auto text-white/60 text-sm md:text-base">Automatically categorize, tag, and verify scientific data from anywhere in the world.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4 text-yellow-400" />
                            <h3 className="text-sm font-medium text-white">High Velocity</h3>
                        </div>
                        <p className="text-white/40 text-sm">Instant synchronization across global research nodes.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Cpu className="size-4 text-purple-400" />
                            <h3 className="text-sm font-medium text-white">AI-Powered</h3>
                        </div>
                        <p className="text-white/40 text-sm">Deep learning models for automated classification.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Lock className="size-4 text-emerald-400" />
                            <h3 className="text-sm font-medium text-white">Encryption</h3>
                        </div>
                        <p className="text-white/40 text-sm">End-to-end data security for sensitive information.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4 text-cyan-400" />
                            <h3 className="text-sm font-medium text-white">Insights</h3>
                        </div>
                        <p className="text-white/40 text-sm">Intuitive dashboards for complex scientific datasets.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
