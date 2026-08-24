const paths = {
    home: 'M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-9ZM9 21v-6h6v6',
    students: 'M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-4A4.5 4.5 0 0 0 3 18.5V20M9.5 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 11a3.5 3.5 0 0 0 0-7M21 20v-1.5a4.5 4.5 0 0 0-3-4.24',
    classes: 'M4 4h16v16H4zM8 2v4M16 2v4M4 10h16M8 14h3M13 14h3',
    attendance: 'M5 12.5 9 16l10-10M3 3h18v18H3z',
    materials: 'M4 3h11l5 5v13H4zM14 3v6h6M8 14h8M8 18h6',
    marks: 'M4 19V5M4 19h16M8 15v-4M12 15V7M16 15v-7',
    fees: 'M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5zM8 9h8M8 14h4',
    reports: 'M5 3h11l3 3v15H5zM8 12h8M8 16h6M8 8h3',
    announce: 'M4 14V10l12-5v14L4 14ZM16 10l3 1v2l-3 1M7 15l1 4h3l-1-3',
    user: 'M20 21a8 8 0 0 0-16 0M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
    logout: 'M10 4H5v16h5M14 8l4 4-4 4M18 12H9',
    menu: 'M4 7h16M4 12h16M4 17h16',
    close: 'm6 6 12 12M18 6 6 18',
    chevron: 'm9 18 6-6-6-6',
    search: 'm21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2 2-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V20h-2.82v-.1A1.7 1.7 0 0 0 10.96 18.34a1.7 1.7 0 0 0-1.88.34l-.06.06-2-2 .06-.06A1.7 1.7 0 0 0 7.42 14.8 1.7 1.7 0 0 0 5.86 13.76h-.1v-2.82h.1A1.7 1.7 0 0 0 7.42 9.9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2-2 .06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 12 4.8v-.1h2.82v.1a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2 2-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04h.1v2.82h-.1A1.7 1.7 0 0 0 19.4 15Z',
};

const Icon = ({ name, size = 20, stroke = 1.8, className = '' }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={paths[name] || paths.home} />
    </svg>
);

export default Icon;
