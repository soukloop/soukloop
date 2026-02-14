"use client";

interface ProgressStepsProps {
  currentStep: number;
  onStepChange?: (step: number) => void;
}

export default function ProgressSteps({
  currentStep,
  onStepChange,
}: ProgressStepsProps) {
  const steps = [
    { number: 1, label: "Shopping cart" },
    { number: 2, label: "Checkout details" },
    { number: 3, label: "Order complete" },
  ];

  return (
    <div className="mb-8 flex flex-row items-center justify-center space-x-3 px-2 max-[446px]:space-x-2 sm:space-x-8">
      {steps.map((step, index) => {
        const isDone = step.number < currentStep;
        const isCurrent = step.number === currentStep;

        const circleClasses =
          "rounded-full flex items-center justify-center font-medium shrink-0 " +
          (isCurrent
            ? "bg-black text-white"
            : isDone
            ? "bg-[#E87A3F] text-white"
            : "bg-gray-300 text-gray-600");

        return (
          <div key={step.number} className="flex min-w-0 items-center">
            <button
              type="button"
              onClick={
                onStepChange ? () => onStepChange(step.number) : undefined
              }
              className="flex min-w-0 items-center focus:outline-none"
              aria-current={isCurrent ? "step" : undefined}
              aria-disabled={!onStepChange}
            >
              {/* Circle — gets smaller under 446px */}
              <div
                className={`size-6 max-[446px]:size-5 sm:size-8 ${circleClasses} text-[11px] max-[446px]:text-[10px] sm:text-sm`}
              >
                {isDone ? (
                  <svg
                    className="size-3 sm:size-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>

              {/* Label — tighter margins & truncation under 446px */}
              <span
                className={`ml-2 min-w-0 max-w-[92px] truncate whitespace-nowrap text-[11px] max-[446px]:ml-1 max-[446px]:max-w-[72px] max-[446px]:text-[10px] sm:ml-3 sm:max-w-none sm:text-sm ${
                  step.number <= currentStep
                    ? "font-medium text-black"
                    : "text-gray-500"
                }`}
                title={step.label}
              >
                {step.label}
              </span>
            </button>

            {/* Connector — shorter under 446px */}
            {index < steps.length - 1 && (
              <div className="ml-3 h-px w-6 bg-gray-300 max-[446px]:ml-2 max-[446px]:w-4 sm:ml-8 sm:w-16"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
