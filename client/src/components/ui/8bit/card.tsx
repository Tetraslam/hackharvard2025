/* eslint-disable react-refresh/only-export-components */
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

import {
  Card as ShadcnCard,
  CardAction as ShadcnCardAction,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from "@/components/ui/card";

export const cardVariants = cva("", {
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

export interface BitCardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

function Card({ children, ...props }: BitCardProps) {
  const { className, font } = props;

  return (
    <div className="relative">
      <ShadcnCard
        {...props}
        className={cn(
          "rounded-none border-none",
          font !== "normal" && "retro",
          className,
        )}
      >
        {children}
      </ShadcnCard>

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

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <ShadcnCardHeader className={className} {...props} />;
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <ShadcnCardTitle className={className} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <ShadcnCardDescription className={className} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <ShadcnCardAction className={className} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <ShadcnCardContent className={className} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <ShadcnCardFooter className={className} {...props} />;
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
