// Reusable IconButton
const IconButton = ({ children, className = '', ...props }) => (
    <button
        className={`p-1.5 text-slate-400 rounded-lg transition-colors ${className}`}
        {...props}
    >
        {children}
    </button>
);

export default IconButton;