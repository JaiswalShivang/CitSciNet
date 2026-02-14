import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Testimonials() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-4xl font-medium lg:text-5xl text-white">Built by scientists, loved by thousand contributors</h2>
                    <p className="text-white/60">CitSciNet is evolving to be more than just a data platform. It supports an entire ecosystem of researchers and citizens helping to innovate across all scientific horizons.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
                    <Card className="grid grid-rows-[auto_1fr] gap-8 sm:col-span-2 sm:p-6 lg:row-span-2 bg-white/[0.03] border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <img
                                className="h-6 w-fit opacity-50 grayscale invert"
                                src="https://html.tailus.io/blocks/customers/nike.svg"
                                alt="Researcher Logo"
                                height="24"
                                width="auto"
                            />
                        </CardHeader>
                        <CardContent>
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6 text-white">
                                <p className="text-xl font-medium italic">"CitSciNet has transformed the way I gather environmental data. Their extensive collection of data points and real-time visualization has significantly accelerated my research. The flexibility to collaborate across dimensions allows me to discover unique insights."</p>

                                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                    <Avatar className="size-12 border border-white/20">
                                        <AvatarImage
                                            src="https://tailus.io/images/reviews/shekinah.webp"
                                            alt="Dr. Aris Thorne"
                                            height="400"
                                            width="400"
                                            loading="lazy"
                                        />
                                        <AvatarFallback className="bg-purple-900 text-white">AT</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <cite className="text-sm font-medium">Dr. Aris Thorne</cite>
                                        <span className="text-white/40 block text-sm">Environmental Scientist</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2 bg-white/[0.03] border-white/10 backdrop-blur-sm">
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6 text-white">
                                <p className="text-xl font-medium">"CitSciNet is really extraordinary and very practical for rapid data collection. A real gold mine for specialized researchers."</p>

                                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                    <Avatar className="size-12 border border-white/20">
                                        <AvatarImage
                                            src="https://tailus.io/images/reviews/jonathan.webp"
                                            alt="Prof. Elena Vance"
                                            height="400"
                                            width="400"
                                            loading="lazy"
                                        />
                                        <AvatarFallback className="bg-blue-900 text-white">EV</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <cite className="text-sm font-medium">Prof. Elena Vance</cite>
                                        <span className="text-white/40 block text-sm">Data Architect</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/[0.03] border-white/10 backdrop-blur-sm">
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6 text-white">
                                <p className="text-sm">"Great work on the datahub! This is one of the best platforms for community science that I have seen so far!"</p>

                                <div className="grid items-center gap-3 [grid-template-columns:auto_1fr]">
                                    <Avatar className="size-12 border border-white/20">
                                        <AvatarImage
                                            src="https://tailus.io/images/reviews/yucel.webp"
                                            alt="Marcus Chen"
                                            height="400"
                                            width="400"
                                            loading="lazy"
                                        />
                                        <AvatarFallback className="bg-cyan-900 text-white">MC</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <cite className="text-sm font-medium">Marcus Chen</cite>
                                        <span className="text-white/40 block text-sm">Community Lead</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/[0.03] border-white/10 backdrop-blur-sm">
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6 text-white">
                                <p className="text-sm">"The AI-assisted tagging makes it so easy for anyone to contribute high-quality data. Truly innovative!"</p>

                                <div className="grid grid-cols-[auto_1fr] gap-3">
                                    <Avatar className="size-12 border border-white/20">
                                        <AvatarImage
                                            src="https://tailus.io/images/reviews/rodrigo.webp"
                                            alt="Sonia Kapoor"
                                            height="400"
                                            width="400"
                                            loading="lazy"
                                        />
                                        <AvatarFallback className="bg-emerald-900 text-white">SK</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">Sonia Kapoor</p>
                                        <span className="text-white/40 block text-sm">Citizen Scientist</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}
