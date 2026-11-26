const StudentPageHeader = ({ eyebrow, title, description, children }) => (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/90 pb-4 mb-5">
        <div className="min-w-0">
            {eyebrow && (
                <p className="text-xs font-extrabold uppercase tracking-widest text-blue-700 mb-1 flex items-center gap-1.5">
                    <span className="h-1 w-4 rounded-full bg-blue-600"></span>
                    {eyebrow}
                </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold sm:font-extrabold tracking-[-0.01em] text-slate-900 leading-snug">{title}</h1>
            {description && <p className="text-sm sm:text-base font-medium text-slate-600 mt-1">{description}</p>}
        </div>
        {children && <div className="w-full flex-none sm:w-auto">{children}</div>}
    </header>
);

export default StudentPageHeader;
