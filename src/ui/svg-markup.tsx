import { memo } from "react";
import { cn } from "./cn";

// Renders SVG built as a string, so the same markup can be exported to files.
export const SvgMarkup = memo(function SvgMarkup({
  markup,
  className,
}: {
  markup: string;
  className?: string;
}) {
  return (
    <div
      className={cn("size-full [&>svg]:block", className)}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
});
