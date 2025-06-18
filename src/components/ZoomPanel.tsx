import { useCanvasContext } from "../contexts/CanvasContext/CanvasContext";

const ZoomPanel: React.FC = () => {

    const {scale, setScale} = useCanvasContext();

    const onClickMinus = (zoomStep: number, minScale: number) => {
        const steps = Math.round((scale - 1) / zoomStep);
        const newScale = Math.max(1 + (steps - 1) * zoomStep, minScale);
        setScale(Number(newScale.toFixed(2)));
    };

    const onClickPlus = (zoomStep: number, maxScale: number) => {
        const steps = Math.round((scale - 1) / zoomStep);
        const newScale = Math.min(1 + (steps + 1) * zoomStep, maxScale);
        setScale(Number(newScale.toFixed(2)));
    };

    // Use a fixed zoom step based on a constant base scale (e.g., 10% increments)
    const ZOOM_STEP = 0.1;
    const MIN_SCALE = 0.1;
    const MAX_SCALE = 5;

    return (
        <div className="flex items-center absolute bg-white rounded-md border shadow-sm bottom-4 left-8 px-2 py-1 text-sm mx-2">
            <button
                onClick={()=>{
                    return onClickMinus(ZOOM_STEP, MIN_SCALE);
                }}
                className="py-2 px-4 mx-1 font-bold rounded-md text-gray-600 hover:bg-gray-100">
                -
            </button>
            <div className="">
                {Math.round(scale * 100)}%
            </div>
            <button
                onClick={()=>{
                    return onClickPlus(ZOOM_STEP, MAX_SCALE);
                }}
                className="py-2 px-4 mx-1 font-bold rounded-md text-gray-600 hover:bg-gray-100">
                +
            </button>
        </div>
    );
};

export default ZoomPanel;