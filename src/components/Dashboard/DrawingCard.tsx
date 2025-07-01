import { Clock, MoreHorizontal } from "lucide-react";
import IconButton from "../Buttons/IconButton";
import StarButton from "../Buttons/StarButton";

// DrawingCard
const DrawingCard = ({ drawing }) => (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200/60 overflow-hidden">
        <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
            <img
                src={drawing.thumbnail}
                alt={drawing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Action buttons overlay */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
                <StarButton isStarred={drawing.isStarred} />
                <IconButton>
                    <MoreHorizontal className="w-4 h-4 text-slate-600" />
                </IconButton>
            </div>

        </div>

        <div className="p-4">
            <h3 className="font-semibold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                {drawing.title}
            </h3>

            <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {drawing.lastModified}
                    </div>
                    {/* {!isCollaboration && (
                        <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {drawing.views}
                        </div>
                    )} */}
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {/* {isCollaboration ? (
                        <div className="flex items-center">
                            <Users className="w-4 h-4 text-slate-400 mr-1" />
                            <span className="text-sm text-slate-600">
                                {drawing.collaborators.slice(0, 2).join(', ')}
                                {drawing.collaborators.length > 2 && ` +${drawing.collaborators.length - 2}`}
                            </span>
                        </div>
                    ) : ( */
                    // (
                    //     drawing.collaborators > 0 && (
                    //         <div className="flex items-center">
                    //             <Users className="w-4 h-4 text-slate-400 mr-1" />
                    //             <span className="text-sm text-slate-600">{drawing.collaborators}</span>
                    //         </div>
                    //     )
                    // )
                    }
                </div>
            </div>
        </div>
    </div>
);

export default DrawingCard;