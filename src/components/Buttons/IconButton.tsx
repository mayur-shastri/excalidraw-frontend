// Reusable IconButton
const IconButton = ({ children, className = '', ...props }) => (
    <button
        className={`p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ${className}`}
        {...props}
    >
        {children}
    </button>
);

export default IconButton;