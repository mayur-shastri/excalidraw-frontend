// DropdownMenu (for user and filter)
const DropdownMenu = ({ show, children, className = '' }) => {
    if (!show) return null;
    return (
        <div className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 ${className}`}>
            {children}
        </div>
    );
};

export default DropdownMenu;