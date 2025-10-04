import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { Input as ShadcnInput } from "@/components/ui/input";


export const inputVariants = cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro",
    },
  },
  defaultVariants: {
    font: "retro",
  },
});

export interface BitInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  asChild?: boolean;
}

function Input({ ...props }: BitInputProps) {
  const { className, font } = props;

  return (
    <div className="relative">
      <ShadcnInput
        {...props}
        className={cn(
          "rounded-none border-none ring-0 focus-visible:ring-0",
          font !== "normal" && "retro",
          className
        )}
      />

      {/* Pixelated border */}
      {/* Top horizontal bars */}
      <div className="absolute -top-1.5 w-1/2 left-1.5 h-1.5 bg-foreground dark:bg-ring pointer-events-none" />
      <div className="absolute -top-1.5 w-1/2 right-1.5 h-1.5 bg-foreground dark:bg-ring pointer-events-none" />

      {/* Bottom horizontal bars */}
      <div className="absolute -bottom-1.5 w-1/2 left-1.5 h-1.5 bg-foreground dark:bg-ring pointer-events-none" />
      <div className="absolute -bottom-1.5 w-1/2 right-1.5 h-1.5 bg-foreground dark:bg-ring pointer-events-none" />

      {/* Corner pixels */}
      <div className="absolute top-0 left-0 size-1.5 bg-foreground dark:bg-ring pointer-events-none" />
      <div className="absolute top-0 right-0 size-1.5 bg-foreground dark:bg-ring pointer-events-none" />
      <div className="absolute bottom-0 left-0 size-1.5 bg-foreground dark:bg-ring pointer-events-none" />
      <div className="absolute bottom-0 right-0 size-1.5 bg-foreground dark:bg-ring pointer-events-none" />

      {/* Vertical bars */}
      <div className="absolute top-1.5 -left-1.5 h-[calc(100%-12px)] w-1.5 bg-foreground dark:bg-ring pointer-events-none" />
      <div className="absolute top-1.5 -right-1.5 h-[calc(100%-12px)] w-1.5 bg-foreground dark:bg-ring pointer-events-none" />
    </div>
  );
}

export { Input };
