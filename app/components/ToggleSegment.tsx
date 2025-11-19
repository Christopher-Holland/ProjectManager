"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ListChecks, Target, Calendar } from "lucide-react";

const options = [
    { key: "tasks", label: "Tasks", icon: ListChecks },
    { key: "goals", label: "Goals", icon: Target },
    { key: "timeline", label: "Timeline", icon: Calendar },
];

interface ToggleSegmentProps {
    onChange?: (key: string) => void;
}

export default function ToggleSegment({ onChange }: ToggleSegmentProps) {
    const [selected, setSelected] = useState("tasks");

    const handleClick = (key: string) => {
        setSelected(key);
        onChange?.(key);
    };

    return (
        <div className="flex items-start">
            <div
                className="
          relative 
          flex 
          bg-gray-200 dark:bg-gray-700
          rounded-full 
          p-3 
          gap-3
          w-fit
        "
            >
                {/* Sliding highlight */}
                <motion.div
                    layout
                    className="
            absolute 
            top-3 
            bottom-3 
            rounded-full 
            bg-white dark:bg-gray-900 
            shadow-md
          "
                    style={{
                        left: `${options.findIndex(o => o.key === selected) * 162 + 12}px`,
                        width: "150px",
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
                            onClick={() => handleClick(opt.key)}
                            className={cn(
                                "relative z-10 flex items-center justify-center gap-2",
                                "px-6 py-3 rounded-full",
                                "text-base font-medium transition-colors text-lg",
                                isActive
                                    ? "text-black dark:text-white"
                                    : "text-gray-600 dark:text-gray-300"
                            )}
                            style={{ width: 150 }}
                        >
                            <Icon className="size-6 " />
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}