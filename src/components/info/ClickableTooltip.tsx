import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Info } from "lucide-react";

type ToolbarTooltipProps = {
  children: string;
};

export const ClickableTooltip = ({ children }: ToolbarTooltipProps) => {
  return (
    <TooltipProvider>
      <Popover>
        <Tooltip delayDuration={100}>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <Button size="icon" variant="link" className="h-4 w-4 p-0 ml-1.5">
                <Info color="gray" />
                <span className="sr-only">Info</span>
              </Button>
            </TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent className="bg-neutral2 shadow-md text-foreground mb-1">
            <p>{children}</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent
          side="top"
          className="bg-neutral2 shadow-md text-foreground mb-1 w-fit text-xs py-1 px-3"
        >
          <div>{children}</div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};
