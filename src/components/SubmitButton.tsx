import { FC } from "react";
import { SubmitButtonProps } from "../types/types";

const SubmitButton: FC<SubmitButtonProps> = ({ children, additionalStyles, disabled, testId }) => {
  return (
    <button
        type="submit"
        className={`
                    bg-green2 text-white px-4 py-2 rounded 
                    hover:bg-green3 transition-all
                    dark:bg-green3 dark:hover:bg-green4
                    disabled:opacity-50 disabled:cursor-not-allowed 
                    disabled:hover:bg-green2 disabled:dark:hover:bg-green3
                    ${additionalStyles}
                `}
        disabled={disabled}
        data-testid={testId}
    >
        {children}
    </button>
  );
};

export default SubmitButton;