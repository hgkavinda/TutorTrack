const BrandLogo = ({ size = 'md', className = '' }) => {
    const sizeMap = {
        sm: 'h-8 w-8',
        md: 'h-11 w-11 sm:h-12 sm:w-12',
        lg: 'h-14 w-14',
        xl: 'h-20 w-20',
    };

    const containerSize = sizeMap[size] || sizeMap.md;

    return (
        <div className={`relative flex ${containerSize} shrink-0 items-center justify-center ${className}`}>
            <img
                src="/hgk-mathematics-monogram.png"
                alt="HGK Mathematics"
                className="h-full w-full object-contain select-none transition-transform hover:scale-105"
            />
        </div>
    );
};

export default BrandLogo;
