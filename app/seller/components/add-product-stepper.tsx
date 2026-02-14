import React from "react";
import { Check } from "lucide-react";

interface Step {
    number: number;
    label: string;
}

interface AddProductStepperProps {
    currentStep: number;
    steps: Step[];
}

export default function AddProductStepper({
    currentStep,
    steps,
}: AddProductStepperProps) {
    return (
        <div className="flex w-full items-center justify-center">
            <div className="flex w-full max-w-4xl items-center justify-between gap-1 sm:gap-2">
                {steps.map((step, index) => {
                    const isActive = step.number === currentStep;
                    const isCompleted = step.number < currentStep;
                    const isLast = index === steps.length - 1;

                    return (
                        <React.Fragment key={step.number}>
                            {/* Step Circle & Label */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                {/* Circle */}
                                <div
                                    className={`flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 ${isActive
                                        ? "bg-[#E87A3F] text-white"
                                        : isCompleted
                                            ? "bg-[#E87A3F] text-white"
                                            : "bg-[#FDF7F4] text-[#E87A3F]"
                                        }`}
                                    style={{
                                        backgroundColor: isActive || isCompleted ? "#E87A3F" : "#FDF7F4",
                                        color: isActive || isCompleted ? "#fff" : "#E87A3F",
                                    }}
                                >
                                    {isCompleted ? (
                                        <Check className="size-3 sm:size-4 text-white" />
                                    ) : (
                                        <span>{step.number}</span>
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={`hidden text-sm font-medium md:block ${isActive
                                        ? "text-[#E87A3F]"
                                        : isCompleted
                                            ? "text-gray-900"
                                            : "text-gray-500"
                                        } ${isActive ? "block" : "hidden md:block"}`} // Optional: show label only if active on mobile?
                                    // Actually, keeping it hidden on mobile is cleaner if the screen is very small.
                                    // Let's hide all labels on sm screens to be safe.
                                    style={{
                                        color: isActive ? "#E87A3F" : "#1F2937",
                                        display: isActive ? "block" : undefined // Show only active label on mobile
                                    }}
                                >
                                    <span className="sm:inline hidden md:inline ml-1 font-medium text-xs sm:text-sm">
                                        {step.label}
                                    </span>
                                    {/* On mobile, only show the text if active */}
                                    <span className="md:hidden text-[10px] font-semibold">
                                        {isActive && step.label}
                                    </span>
                                </span>
                            </div>

                            {/* Connector Line */}
                            {!isLast && (
                                <div className="mx-1 sm:mx-4 flex-1 h-[1px] bg-[#FFE0D6] min-w-[10px] sm:min-w-[40px]" />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
