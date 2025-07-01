import React from "react";

export interface DropDownNotificationItemProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    time?: string;
    onClick?: () => void;
    read?: boolean;
}

const DropDownNotificationItem: React.FC<DropDownNotificationItemProps> = ({
    icon,
    title,
    description,
    time,
    onClick,
    read = false,
}) => {
    return (
        <div
            className={`dropdown-notification-item${read ? " read" : ""} flex items-start p-3 border-b border-gray-200 transition-colors duration-200 cursor-default ${
            read
                ? "bg-gray-100 hover:bg-gray-200"
                : "bg-white hover:bg-gray-100"
            }`}
        >
            {icon && (
            <div className="mr-3 text-[20px] flex-shrink-0">
                {icon}
            </div>
            )}
            <div className="flex-1">
            <div className={`text-[15px] ${read ? "font-normal" : "font-semibold"}`}>
                {title}
            </div>
            {description && (
                <div className="text-gray-600 text-[13px] mt-0.5">
                {description}
                </div>
            )}
            {time && (
                <div className="text-gray-400 text-[12px] mt-1">
                {time}
                </div>
            )}
            </div>
            <button
            onClick={onClick}
            className="ml-3 bg-gray-200 rounded px-2 py-1 text-xs cursor-pointer self-center border-none disabled:opacity-50"
            aria-label="Mark as read"
            disabled={read}
            >
            ✓
            </button>
        </div>
    );
};

export default DropDownNotificationItem;