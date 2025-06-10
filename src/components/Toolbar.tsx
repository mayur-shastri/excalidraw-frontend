import { ElementType, ToolOption } from '../types';
import { 
  MousePointer, 
  Pencil, 
  Square, 
  Circle, 
  ArrowUpRight, 
  Minus,
  Diamond,
  ChevronDown,
  Eraser,
  Type,
  Undo2,
  Redo2
} from 'lucide-react';

interface ToolbarProps {
  activeTool: ElementType;
  setActiveTool: (tool: ElementType) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo : boolean;
  canRedo : boolean;
}

export default function Toolbar({ activeTool, setActiveTool, onUndo, onRedo, canUndo, canRedo }: ToolbarProps) {
  const tools: ToolOption[] = [
    { type: 'selection', icon: 'pointer', label: 'Selection' },
    { type: 'freedraw', icon: 'pencil', label: 'Pen' },
    { type: 'rectangle', icon: 'square', label: 'Rectangle' },
    { type: 'ellipse', icon: 'circle', label: 'Ellipse' },
    { type: 'arrow', icon: 'arrow', label: 'Arrow' },
    { type: 'line', icon: 'line', label: 'Line' },
    { type: 'diamond', icon: 'diamond', label: 'Diamond' },
    { type: 'rhombus', icon: 'diamond', label: 'Rhombus' },
    { type: 'text', icon: 'text', label: 'Text' },
    { type: 'eraser', icon: 'eraser', label: 'Eraser' },
  ];

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'pointer': return <MousePointer size={20} />;
      case 'pencil': return <Pencil size={20} />;
      case 'square': return <Square size={20} />;
      case 'circle': return <Circle size={20} />;
      case 'arrow': return <ArrowUpRight size={20} />;
      case 'line': return <Minus size={20} />;
      case 'diamond': return <Diamond size={20} />;
      case 'text': return <Type size={20} />;
      case 'eraser': return <Eraser size={20} />;
      default: return <MousePointer size={20} />;
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-md p-1 flex items-center">
      <button
        className={`p-2 rounded-md mx-1 text-gray-600 ${canUndo? "hover:bg-gray-50" : "text-gray-300"}`}
        onClick={onUndo}
        title="Undo"
        type="button"
        disabled={!canUndo}
      >
        <Undo2 size={20} />
      </button>
      <button
        className={`p-2 rounded-md mx-1 text-gray-600 ${canRedo? "hover:bg-gray-50" : "text-gray-300"}`}
        onClick={onRedo}
        title="Redo"
        type="button"
        disabled={!canRedo}
      >
        <Redo2 size={20} />
      </button>

      <div className="h-6 w-px bg-gray-200 mx-2"></div>

      {tools.map((tool) => (
        <button
          key={tool.type}
          className={`p-2 rounded-md mx-1 transition-colors ${
            activeTool === tool.type 
              ? 'bg-gray-100 text-black' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTool(tool.type)}
          title={tool.label}
          type="button"
        >
          {renderIcon(tool.icon)}
        </button>
      ))}
      
      <div className="h-6 w-px bg-gray-200 mx-2"></div>
      
      <button className="p-2 rounded-md text-gray-600 hover:bg-gray-50" type="button">
        <ChevronDown size={20} />
      </button>
    </div>
  );
}