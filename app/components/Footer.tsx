export default function Footer() {
    return (
        <footer className="bg-[#171717] px-6 py-16 text-[#f7f5f0] md:px-10 md:py-20">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-16 md:grid-cols-12">
                    <div className="md:col-span-6">
                        <p className="font-sans text-xs tracking-[0.2em] uppercase">
                            The Scene Studio
                        </p>

                        <p className="mt-8 max-w-md font-serif text-4xl leading-[0.95] tracking-[-0.03em] md:text-6xl">
                            Stories worth remembering.
                        </p>

                        <p className="mt-8 font-sans text-xs tracking-[0.15em] uppercase text-[#9d9a93]">
                            Da Nang · Vietnam
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-10 md:col-span-4 md:col-start-9">
                        <div>
                            <p className="font-sans text-xs tracking-[0.15em] uppercase text-[#9d9a93]">
                                Explore
                            </p>

                            <nav className="mt-6 flex flex-col gap-4 font-sans text-sm">
                                <a
                                    href="/stories"
                                    className="transition-opacity hover:opacity-50"
                                >
                                    Stories
                                </a>

                                <a
                                    href="/films"
                                    className="transition-opacity hover:opacity-50"
                                >
                                    Films
                                </a>

                                <a
                                    href="/destinations"
                                    className="transition-opacity hover:opacity-50"
                                >
                                    Destinations
                                </a>

                                <a
                                    href="/about"
                                    className="transition-opacity hover:opacity-50"
                                >
                                    About
                                </a>

                                <a
                                    href="/contact"
                                    className="transition-opacity hover:opacity-50"
                                >
                                    Contact
                                </a>
                            </nav>
                        </div>

                        <div>
                            <p className="font-sans text-xs tracking-[0.15em] uppercase text-[#9d9a93]">
                                Connect
                            </p>

                            <nav className="mt-6 flex flex-col gap-4 font-sans text-sm">
                                <a
                                    href="#"
                                    className="transition-opacity hover:opacity-50"
                                >
                                    Instagram
                                </a>

                                <a
                                    href="mailto:thescenestudiovn@gmail.com"
                                    className="transition-opacity hover:opacity-50"
                                >
                                    Email
                                </a>
                            </nav>
                        </div>
                    </div>
                </div>

                <div className="mt-20 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 font-sans text-[10px] tracking-[0.15em] uppercase text-[#9d9a93] md:flex-row">
                    <p>© 2026 The Scene Studio</p>

                    <p>Da Nang · Vietnam</p>
                </div>
            </div>
        </footer>
    );
}