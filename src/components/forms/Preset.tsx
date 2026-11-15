import { PresetProps } from "../../types/types";
import { FC } from "react";
import { buttonPrimary } from "../../styles/ui";

const Preset: FC<PresetProps> = ({ name, index, clicked, loadPreset }) => {
    return (
        <button
            onClick={() => loadPreset(index)}
            className={`${buttonPrimary} ${clicked ? "opacity-80" : ""}`}
            data-testid={`load-slot-${index + 1}`}
        >
            {name}
        </button>
    )
}

export default Preset;