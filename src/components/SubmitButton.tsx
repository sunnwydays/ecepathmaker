import { FC } from "react";
import { SubmitButtonProps } from "../types/types";
import { buttonDanger, buttonPrimary } from "../styles/ui";

const SubmitButton: FC<SubmitButtonProps & { variant?: 'primary' | 'danger' }> = ({
  children,
  additionalStyles,
  disabled,
  testId,
  variant = 'primary'
}) => {
  const variants = {
    primary: `${buttonPrimary} disabled:hover:bg-green2 dark:disabled:hover:bg-green3`,
    danger: `${buttonDanger} disabled:hover:bg-comp2 dark:disabled:hover:bg-comp3`
  };

  return (
    <button
      type="submit"
      className={`
        whitespace-nowrap
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variants[variant]}
        ${additionalStyles ?? ""}
      `}
      disabled={disabled}
      data-testid={testId}
    >
      {children}
    </button>
  );
};

export default SubmitButton;
