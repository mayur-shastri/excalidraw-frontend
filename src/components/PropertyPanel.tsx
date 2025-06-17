import React from 'react';
import { DrawElement, ElementStyle } from '../types';
import { 
  Square as SquareIcon,
} from 'lucide-react';

interface PropertyPanelProps {
  selectedElements: DrawElement[];
  onStyleChange: (style: Partial<ElementStyle>) => void;
  onDelete: () => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ 
  selectedElements, 
  onStyleChange,
  onDelete 
}) => {
  if (selectedElements.length === 0) {
    return null;
  }

  // Get style from the first selected element (for simplicity)
  const style = selectedElements[0].style;
  
  // Available colors
  const colors = [
    '#1e1e1e', '#d62828', '#f77f00', '#fcbf49', 
    '#eae2b7', '#2a9d8f', '#264653', '#e76f51'
  ];
  
  // Available stroke widths
  const strokeWidths = [1, 2, 4, 8];

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-md p-3 flex items-center">
      <div className="mr-4">
        <p className="text-xs text-gray-500 mb-1">Stroke</p>
        <div className="flex space-x-1">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-5 h-5 rounded-full ${
                style.strokeColor === color ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onStyleChange({ strokeColor: color })}
            />
          ))}
        </div>
      </div>
      
      <div className="mr-4">
        <p className="text-xs text-gray-500 mb-1">Background</p>
        <div className="flex space-x-1">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-5 h-5 rounded-full ${
                style.backgroundColor === color ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onStyleChange({ backgroundColor: color })}
            />
          ))}
        </div>
      </div>
      
      <div className="mr-4">
        <p className="text-xs text-gray-500 mb-1">Stroke Width</p>
        <div className="flex space-x-1">
          {strokeWidths.map((width) => (
            <button
              key={width}
              className={`w-8 h-6 rounded border border-gray-300 flex items-center justify-center ${
                style.strokeWidth === width ? 'bg-gray-100 ring-1 ring-blue-500' : 'bg-white'
              }`}
              onClick={() => onStyleChange({ strokeWidth: width })}
            >
              <div 
                className="bg-black rounded-full" 
                style={{ 
                  width: Math.min(width * 2, 8), 
                  height: Math.min(width * 2, 8) 
                }}
              />
            </button>
          ))}
        </div>
      </div>
      
      <div className="mr-4">
        <p className="text-xs text-gray-500 mb-1">Fill</p>
        <div className="flex space-x-2">
          <button
            className={`w-8 h-6 rounded border border-gray-300 flex items-center justify-center ${
              style.fillStyle === 'solid' ? 'bg-gray-100 ring-1 ring-blue-500' : 'bg-white'
            }`}
            onClick={() => onStyleChange({ fillStyle: 'solid' })}
            title="Solid"
          >
            <SquareIcon size={14} className="fill-gray-700 text-gray-700" />
          </button>
          <button
            className={`w-8 h-6 rounded border border-gray-300 flex items-center justify-center ${
              style.fillStyle === 'hachure' ? 'bg-gray-100 ring-1 ring-blue-500' : 'bg-white'
            }`}
            onClick={() => onStyleChange({ fillStyle: 'hachure' })}
            title="Hachure"
          >
            <SquareIcon size={14} className="text-gray-700" />
          </button>
        </div>
      </div>
      
      <div className="mr-4">
        <p className="text-xs text-gray-500 mb-1">Opacity</p>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={style.opacity}
          onChange={(e) => onStyleChange({ opacity: parseFloat(e.target.value) })}
          className="w-24"
        />
      </div>
        <button
          className="p-2 rounded-md text-red-600 hover:bg-red-50 ml-1"
          onClick={onDelete}
          title="Delete"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
          </svg>
        </button>
    </div>
  );
};

export default PropertyPanel;