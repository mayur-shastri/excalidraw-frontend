import { Star } from "lucide-react";
import IconButton from "./IconButton";

// Star Button
const StarButton = ({ isStarred, ...props }) => (
    <IconButton {...props}>
        <Star className={`w-4 h-4 ${isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'}`} />
    </IconButton>
);

export default StarButton;