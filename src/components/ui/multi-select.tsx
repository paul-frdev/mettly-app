"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { Badge } from "@/components/ui/badge";

const multiSelectVariants = cva(
  "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface MultiSelectProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof multiSelectVariants> {
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  onValueChange: (value: string[]) => void;
  defaultValue?: string[];
  placeholder?: string;
  animation?: number;
  maxCount?: number;
  asChild?: boolean;
  className?: string;
}

export const MultiSelect = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  MultiSelectProps
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      placeholder = "Select options",
      animation,
      maxCount,
      className,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (JSON.stringify(selectedValues) !== JSON.stringify(defaultValue)) {
        setSelectedValues(defaultValue);
      }
    }, [defaultValue, selectedValues]);

    // Close popover when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        const commandElement = inputRef.current?.closest('[data-command-root]');

        if (commandElement && !commandElement.contains(target)) {
          setIsPopoverOpen(false);
        }
      };

      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsPopoverOpen(false);
          inputRef.current?.blur();
        }
      };

      if (isPopoverOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }, [isPopoverOpen]);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Escape") {
        setIsPopoverOpen(false);
        event.currentTarget.blur();
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (value: string) => {
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : maxCount && selectedValues.length >= maxCount
          ? selectedValues
          : [...selectedValues, value];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    return (
      <Command
        ref={ref}
        {...props}
        data-command-root="true"
        className={cn(
          "overflow-visible bg-transparent flex flex-col space-y-2",
          className
        )}
      >
        <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <div className="flex gap-1 flex-wrap">
            {selectedValues.map((value) => {
              const option = options.find((o) => o.value === value);
              const Icon = option?.icon;
              return (
                <Badge
                  key={value}
                  className={cn(multiSelectVariants({ variant }))}
                  style={{ animationDelay: `${animation}s` }}
                >
                  {Icon && <Icon className="mr-2 h-4 w-4" />}
                  {option?.label}
                  <X
                    className="ml-2 h-4 w-4 cursor-pointer"
                    onClick={() => toggleOption(value)}
                  />
                </Badge>
              );
            })}
            <CommandPrimitive.Input
              ref={inputRef}
              placeholder={placeholder}
              className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
              onKeyDown={handleInputKeyDown}
              onFocus={() => setIsPopoverOpen(true)}
            />
          </div>
        </div>
        <div className="relative">
          {isPopoverOpen && (
            <CommandList className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isDisabled = !isSelected && maxCount && selectedValues.length >= maxCount;
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      style={{
                        pointerEvents: "auto",
                        opacity: isDisabled ? 0.5 : 1,
                      }}
                      className={cn("cursor-pointer", isDisabled && "cursor-not-allowed")}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        {/* Checkbox check icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          )}
        </div>
      </Command>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
