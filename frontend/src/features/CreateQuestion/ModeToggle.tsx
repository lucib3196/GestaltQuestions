import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useState } from "react";

type Mode = "blank" | "upload";
export default function ModeToggle() {
    const [mode, setMode] = useState<Mode>("blank");

    const handleModeChange = (
        _: React.MouseEvent<HTMLElement>,
        newMode: Mode
    ) => {
        setMode(newMode);
    };

    return (
        <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleModeChange}
            aria-label="text alignment"
        >
            <ToggleButton value="blank" aria-label="left aligned">
                Start Blank Template
            </ToggleButton>
            <ToggleButton value="upload" aria-label="left aligned">
                Upload Existing Question
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
