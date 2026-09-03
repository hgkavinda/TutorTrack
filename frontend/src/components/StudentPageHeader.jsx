const StudentPageHeader = ({ eyebrow, title, description, children }) => (
    <header className="flex items-end justify-between gap-4 border-b border-white/10 pb-6 mb-2">
        <div className="min-w-0">
            {eyebrow && (
                <p className="page-eyebrow mb-2 flex items-center gap-2">
                    <span className="h-px w-5 bg-cyan-400"></span>
                    {eyebrow}
                </p>
            )}
            <h1 className="page-title mt-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">{title}</h1>
            {description && <p className="page-copy mt-2">{description}</p>}
        </div>
        {children && <div className="flex-none">{children}</div>}
    </header>
);

export default StudentPageHeader;
