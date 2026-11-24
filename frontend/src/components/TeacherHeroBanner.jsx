const TeacherHeroBanner = () => {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-md border border-blue-600/50 p-4 sm:p-6">
            {/* Background ambient highlights */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute right-0 -bottom-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-2xl" />

            <div className="relative flex items-center gap-4 sm:gap-6">
                {/* Teacher photo */}
                <div className="relative shrink-0">
                    <img
                        src="/teacher-photo.jpg"
                        alt="HG Kavinda"
                        className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover object-top shadow-md ring-2 ring-white/40"
                    />
                </div>

                {/* Teacher Details */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-100">
                            ඔබේ ගුරුතුමා · Your Teacher
                        </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight truncate">
                        HG Kavinda
                    </h2>
                    <p className="text-sm sm:text-base font-bold text-blue-200 mt-0.5">
                        ගණිතය · Mathematics
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="rounded-lg bg-white/20 border border-white/25 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                            Grade 6 – 11
                        </span>
                        <span className="text-xs font-semibold text-blue-100 hidden sm:inline">
                            Smart ලෙස ඉගෙන ගන්න · Learn Smarter
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherHeroBanner;
