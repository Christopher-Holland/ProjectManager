"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ListChecks, Target, Calendar, NotebookPen, Settings } from "lucide-react";

const options = [
    { key: "goals", label: "Goals", icon: ListChecks },
    { key: "tasks", label: "Tasks", icon: Target },
    { key: "timeline", label: "Timeline", icon: Calendar },
    { key: "notes", label: "Notes", icon: NotebookPen },
    { key: "settings", label: "Settings", icon: Settings },
];

interface ToggleSegmentProps {
    value?: string;
    onChange?: (key: string) => void;
    defaultValue?: string;
}

export default function ToggleSegment({ value, onChange, defaultValue = "goals" }: ToggleSegmentProps) {
    const [internalSelected, setInternalSelected] = useState(defaultValue);
    const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });
    const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

    // Use controlled value if provided, otherwise use internal state
    const selected = value !== undefined ? value : internalSelected;

    const handleClick = (key: string) => {
        if (value === undefined) {
            setInternalSelected(key);
        }
        onChange?.(key);
    };

    useEffect(() => {
        const updateHighlight = () => {
            const activeButton = buttonRefs.current[selected];
            if (activeButton) {
                const container = activeButton.parentElement;
                if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const buttonRect = activeButton.getBoundingClientRect();
                    setHighlightStyle({
                        left: buttonRect.left - containerRect.left,
                        width: buttonRect.width,
                    });
                }
            }
        };

        // Update on mount and when selected changes
        updateHighlight();

        // Update on window resize
        window.addEventListener("resize", updateHighlight);
        return () => window.removeEventListener("resize", updateHighlight);
    }, [selected]);

    return (
        <div className="flex items-start">
            <div
                className="
          relative 
          flex 
          bg-gray-200 dark:bg-gray-700
          rounded-full 
          p-1.5 
          gap-1.5
          w-fit
        "
            >
                {/* Sliding highlight */}
                <motion.div
                    className="
            absolute 
            top-1.5 
            bottom-1.5 
            rounded-full 
            bg-white dark:bg-gray-900 
            shadow-md
          "
                    style={{
                        left: highlightStyle.left,
                        width: highlightStyle.width,
                    }}
                    transition={{ type: "spring", bounce: 0.25, duration: 0.45 }}
                />

                {/* Options */}
                {options.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = opt.key === selected;

                    return (
                        <button
                            key={opt.key}
                            ref={(el) => {
                                buttonRefs.current[opt.key] = el;
                            }}
                            onClick={() => handleClick(opt.key)}
                            className={cn(
                                "relative z-10 flex items-center justify-center gap-1",
                                "px-3 py-1.5 rounded-full",
                                "text-base font-medium transition-colors text-sm",
                                isActive
                                    ? "text-black dark:text-white"
                                    : "text-gray-600 dark:text-gray-300"
                            )}
                        >
                            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                            <span className="whitespace-nowrap">{opt.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}