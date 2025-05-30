import React, { useState, useEffect, useRef } from 'react';
import { ElementStyle } from '../types';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TextEditorProps {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: ElementStyle;
  onSave: (text: string, style: Partial<ElementStyle>) => void;
  onCancel: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  text,
  x,
  y,
  width,
  height,
  style,
  onSave,
  onCancel
}) => {
  const [editedText, setEditedText] = useState(text);
  const [editedStyle, setEditedStyle] = useState(style);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      editorRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      onSave(editedText, editedStyle);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
  const fontFamilies = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

  return (
    <div
      className="absolute bg-white rounded-lg shadow-lg p-2"
      style={{
        left: x,
        top: y,
        minWidth: Math.max(width, 200),
        minHeight: Math.max(height, 100),
        zIndex: 1000
      }}
    >
      <div className="flex gap-2 mb-2 border-b pb-2">
        <select
          value={editedStyle.fontFamily || 'Arial'}
          onChange={(e) => setEditedStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
          className="border rounded px-2 py-1"
        >
          {fontFamilies.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
        
        <select
          value={editedStyle.fontSize || 16}
          onChange={(e) => setEditedStyle(prev => ({ ...prev, fontSize: Number(e.target.value) }))}
          className="border rounded px-2 py-1"
        >
          {fontSizes.map(size => (
            <option key={size} value={size}>{size}px</option>
          ))}
        </select>

        <div className="flex border rounded">
          <button
            className={`p-1 ${editedStyle.textAlign === 'left' ? 'bg-gray-100' : ''}`}
            onClick={() => setEditedStyle(prev => ({ ...prev, textAlign: 'left' }))}
          >
            <AlignLeft size={16} />
          </button>
          <button
            className={`p-1 ${editedStyle.textAlign === 'center' ? 'bg-gray-100' : ''}`}
            onClick={() => setEditedStyle(prev => ({ ...prev, textAlign: 'center' }))}
          >
            <AlignCenter size={16} />
          </button>
          <button
            className={`p-1 ${editedStyle.textAlign === 'right' ? 'bg-gray-100' : ''}`}
            onClick={() => setEditedStyle(prev => ({ ...prev, textAlign: 'right' }))}
          >
            <AlignRight size={16} />
          </button>
        </div>
      </div>

      <textarea
        ref={editorRef}
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{
          fontFamily: editedStyle.fontFamily,
          fontSize: editedStyle.fontSize,
          textAlign: editedStyle.textAlign,
        }}
        className="w-full min-h-[100px] p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter text..."
      />

      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={onCancel}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(editedText, editedStyle)}
          className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default TextEditor;