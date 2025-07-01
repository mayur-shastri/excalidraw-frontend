// TryItNowButton component
const OutlineButton = ({
    children,
    onClick,
    className = "",
    icon: Icon,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ElementType }) => (
    <button
        onClick={onClick}
        className={`bg-white text-indigo-700 border border-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50 hover:border-indigo-700 transition-all flex items-center justify-center shadow-md ${className}`}
        {...props}
    >
        {children}
        {Icon && <Icon className="w-5 h-5 ml-2" />}
    </button>
);

export default OutlineButton;