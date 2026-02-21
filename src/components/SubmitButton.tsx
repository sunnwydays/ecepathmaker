import { FC } from "react";
import { SubmitButtonProps } from "../types/types";

const SubmitButton: FC<SubmitButtonProps & { variant?: 'primary' | 'danger' }> = ({ 
  children, 
  additionalStyles, 
  disabled, 
  testId,
  variant = 'primary'
}) => {
  const variants = {
    primary: "bg-green2 hover:bg-green3 dark:bg-green3 dark:hover:bg-green4 disabled:hover:bg-green2",
    danger: "bg-comp2 hover:bg-comp3 dark:bg-comp3 dark:hover:bg-comp4 disabled:hover:bg-comp2"
  };

  return (
    <button
      type="submit"
      className={`
        text-white px-4 py-2 rounded transition-all whitespace-nowrap
        disabled:opacity-50 disabled:cursor-not-allowed 
        ${variants[variant]}
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