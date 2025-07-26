import { PresetProps } from "../../types/types";
import { FC } from "react";

const Preset: FC<PresetProps> = ({ name, index, clicked, loadPreset }) => {
    return (
        <button
            onClick={() => loadPreset(index)}
            className={`
                        bg-green2 text-white px-1 py-2 rounded
                        hover:bg-green3 transition-all
                        dark:bg-green3 dark:hover:bg-green4
                        ${clicked && "opacity-80"}
                    `}
            data-testid={`load-slot-${index + 1}`}
        >
            {name}
        </button>
    )
}

export default Preset;