const StudentPageHeader = ({ eyebrow, title, description, children }) => (
    <header className="student-page-header">
        <div className="min-w-0">
            {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
            <h1 className="page-title mt-1">{title}</h1>
            {description && <p className="page-copy mt-2">{description}</p>}
        </div>
        {children && <div className="student-page-header__action">{children}</div>}
    </header>
);

export default StudentPageHeader;
