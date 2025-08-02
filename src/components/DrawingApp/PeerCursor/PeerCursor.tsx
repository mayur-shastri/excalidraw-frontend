import React from 'react';
import { Point } from '../../../types';

interface PeerCursorProps {
    position: Point;
    name: string;
    color: string;
}

const PeerCursor: React.FC<PeerCursorProps> = ({ position, name, color }) => {

    return (
        <div
            style={{
                position: 'absolute',
                top: position.y,
                left: position.x,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: -16, // move label above the dot
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '12px',
                    color,
                    whiteSpace: 'nowrap',
                }}
            >
                {name}
            </div>

            <div
                style={{
                    width: 10,
                    height: 10,
                    backgroundColor: color,
                    borderRadius: '50%',
                }}
            />
        </div>
    );
};

export default PeerCursor;
