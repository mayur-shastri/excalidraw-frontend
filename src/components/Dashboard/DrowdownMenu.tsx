import React, { useEffect, useRef } from "react";

interface DropdownMenuProps {
    show: boolean;
    children: React.ReactNode;
    className?: string;
    onClose?: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
    show,
    children,
    className = "",
    onClose,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!show) return;

        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose?.();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [show, onClose]);

    if (!show) return null;
    return (
        <div
            ref={ref}
            className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 ${className}`}
        >
            {children}
        </div>
    );
};

export default DropdownMenu;