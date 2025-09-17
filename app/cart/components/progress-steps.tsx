"use client"

interface ProgressStepsProps {
  currentStep: number
  onStepChange?: (step: number) => void
}

export default function ProgressSteps({ currentStep, onStepChange }: ProgressStepsProps) {
  const steps = [
    { number: 1, label: "Shopping cart" },
    { number: 2, label: "Checkout details" },
    { number: 3, label: "Order complete" },
  ]

  return (
    <div className="flex flex-row items-center justify-center mb-8 px-2 space-x-3 sm:space-x-8 max-[446px]:space-x-2">
      {steps.map((step, index) => {
        const isDone = step.number < currentStep
        const isCurrent = step.number === currentStep

        const circleClasses =
          "rounded-full flex items-center justify-center font-medium shrink-0 " +
          (isCurrent
            ? "bg-black text-white"
            : isDone
            ? "bg-[#E87A3F] text-white"
            : "bg-gray-300 text-gray-600")

        return (
          <div key={step.number} className="flex items-center min-w-0">
            <button
              type="button"
              onClick={onStepChange ? () => onStepChange(step.number) : undefined}
              className="flex items-center focus:outline-none min-w-0"
              aria-current={isCurrent ? "step" : undefined}
              aria-disabled={!onStepChange}
            >
              {/* Circle — gets smaller under 446px */}
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 max-[446px]:w-5 max-[446px]:h-5 ${circleClasses} text-[11px] sm:text-sm max-[446px]:text-[10px]`}
              >
                {isDone ? (
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
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
                className={`ml-2 sm:ml-3 max-[446px]:ml-1 text-[11px] sm:text-sm max-[446px]:text-[10px] truncate whitespace-nowrap max-w-[92px] sm:max-w-none max-[446px]:max-w-[72px] min-w-0 ${
                  step.number <= currentStep ? "font-medium text-black" : "text-gray-500"
                }`}
                title={step.label}
              >
                {step.label}
              </span>
            </button>

            {/* Connector — shorter under 446px */}
            {index < steps.length - 1 && (
              <div className="w-6 sm:w-16 max-[446px]:w-4 h-px bg-gray-300 ml-3 sm:ml-8 max-[446px]:ml-2"></div>
            )}
          </div>
        )
      })}
    </div>
  )
}
