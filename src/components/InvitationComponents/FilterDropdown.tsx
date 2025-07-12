import { ChevronDown, Filter, Mail, Pen, UserPlus, Users } from "lucide-react";
import OutlineButton from "../Buttons/OutlineButton";

const FilterDropdown: React.FC<{
    show: boolean;
    setShow: (v: boolean) => void;
    selected: string;
    setSelected: (v: 'all' | 'collaboration' | 'team' | 'workspace') => void;
}> = ({ show, setShow, selected, setSelected }) => {
    const filters = [
        { key: 'all', label: 'All Types', icon: Mail },
        { key: 'collaboration', label: 'Collaborations', icon: Users },
        { key: 'team', label: 'Teams', icon: UserPlus },
        { key: 'workspace', label: 'Workspaces', icon: Pen }
    ];
    return (
        <div className="relative">
            <OutlineButton
                onClick={() => setShow(!show)}
                className="flex items-center space-x-2 px-3 py-2 !shadow-none"
                icon={ChevronDown}
            >
                <Filter className="w-4 h-4 mr-2" />
                <span className="capitalize">{selected === 'all' ? 'All Types' : selected}</span>
            </OutlineButton>
            {show && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    {filters.map(filter => {
                        const FilterIcon = filter.icon;
                        return (
                            <button
                                key={filter.key}
                                onClick={() => {
                                    setSelected(filter.key as any);
                                    setShow(false);
                                }}
                                className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center space-x-3"
                            >
                                <FilterIcon className="w-4 h-4" />
                                <span>{filter.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;