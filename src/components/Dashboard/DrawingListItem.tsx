import { Clock, MoreHorizontal, Star } from "lucide-react";
import IconButton from "../Buttons/IconButton";

// DrawingListItem
const DrawingListItem = ({ drawing }) => (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200/60 p-4">
        <div className="flex items-center space-x-4">
            <div className="w-16 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                <img
                    src={drawing.thumbnail}
                    alt={drawing.title}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {drawing.title}
                    </h3>
                    <div className="flex items-center space-x-2 ml-4">
                        {drawing.isStarred && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-6 mt-2 text-sm text-slate-500">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {drawing.lastModified}
                    </div>
                    <div className="flex items-center">
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton>
                    <MoreHorizontal className="w-4 h-4" />
                </IconButton>
            </div>
        </div>
    </div>
);

export default DrawingListItem;