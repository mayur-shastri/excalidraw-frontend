// components/ui/ButtonGroup.tsx
import React from "react";
import InviteButton from "./InviteButton";
import SaveButton from "./SaveButton";

const ButtonGroup: React.FC = () => {

    return (
        <div className="fixed top-4 right-4 rounded-lg  flex items-center space-x-3 z-40">
            <InviteButton />
            <SaveButton />
        </div>

    );
};

export default ButtonGroup;
