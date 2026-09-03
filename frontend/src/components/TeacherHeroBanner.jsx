const TeacherHeroBanner = () => {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-[#0a1628] to-slate-950 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
            {/* Background glow orbs */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 right-32 h-48 w-48 rounded-full bg-blue-600/15 blur-2xl" />

            <div className="relative flex min-h-[200px] items-end justify-between sm:min-h-[240px]">
                {/* Left — Text content */}
                <div className="flex flex-col justify-center gap-3 p-6 sm:p-8 pb-7">
                    {/* Label badge */}
                    <div className="flex items-center gap-2">
                        <span className="h-[2px] w-6 rounded-full bg-cyan-400" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400">
                            ඔබේ ගුරුතුමා · Your Teacher
                        </span>
                    </div>

                    {/* Teacher Name */}
                    <div>
                        <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                            HG Kavinda
                        </h2>
                        <p className="mt-1 text-base font-bold text-cyan-300 sm:text-lg">
                            ගණිතය · Mathematics
                        </p>
                    </div>

                    {/* Grade & tagline */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                            Grade 6 – 11
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                            Smart ලෙස ඉගෙන ගන්න · Learn Smarter
                        </span>
                    </div>
                </div>

                {/* Right — Teacher photo */}
                <div className="relative mr-4 self-end sm:mr-8 flex-shrink-0">
                    {/* Glow ring behind photo */}
                    <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-2xl scale-125" />
                    <img
                        src="/teacher-photo.jpg"
                        alt="HG Kavinda"
                        className="relative z-10 h-44 w-36 rounded-xl object-cover object-top shadow-[0_0_40px_rgba(6,182,212,0.2)] sm:h-52 sm:w-44"
                        style={{ maskImage: 'linear-gradient(to top, transparent 0%, black 25%)', WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 25%)' }}
                    />
                </div>
            </div>

            {/* Bottom accent line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-cyan-500/0 via-cyan-400/60 to-cyan-500/0" />
        </div>
    );
};

export default TeacherHeroBanner;
