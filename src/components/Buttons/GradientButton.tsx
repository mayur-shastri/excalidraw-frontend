const GradientButton = ({
    children,
    onClick,
    className = "",
    icon: Icon,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { icon?: React.ElementType }) => (
    <button
        onClick={onClick}
        className={`bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center ${className}`}
        {...props}
    >
        {children}
        {Icon && <Icon className="w-5 h-5 ml-2" />}
    </button>
);

export default GradientButton;