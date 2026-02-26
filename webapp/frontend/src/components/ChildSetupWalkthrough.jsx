import React from "react";
import Joyride, { STATUS } from "react-joyride";

export default function ChildSetupWalkthrough({ run, onFinish }) {
    const steps = [
        {
            target: ".tour-add-child",
            title: "Add Child Profile",
            content: "To get started with tracking, please add your child's profile here first.",
            placement: "right",
            disableBeacon: true,
        }
    ];

    const handleCallback = (data) => {
        const { status } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
            if (onFinish) onFinish();
        }
    };

    const CustomTooltip = ({
        index,
        size,
        step,
        tooltipProps,
        primaryProps,
        skipProps,
        backProps,
        isLastStep,
    }) => {
        return (
            <div
                {...tooltipProps}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl w-80 max-w-[90vw] border border-slate-100 dark:border-slate-700 font-sans"
            >
                <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                        {step.title || "Quick Guide"}
                    </h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 mt-2">
                    {step.content}
                </p>

                <div className="flex items-center justify-between mt-4">
                    <div>
                        {!isLastStep && (
                            <button
                                {...skipProps}
                                className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                Skip
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {index > 0 && (
                            <button
                                {...backProps}
                                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                            >
                                Back
                            </button>
                        )}
                        <button
                            {...primaryProps}
                            className="px-5 py-2 text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl transition-all shadow-lg shadow-pink-200 dark:shadow-pink-900/20 active:scale-95"
                        >
                            {index + 1}/{size} {isLastStep ? "Got it!" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            callback={handleCallback}
            continuous={true}
            showProgress={true}
            showSkipButton={true}
            disableScrolling={true}
            disableScrollParentFix={true}
            tooltipComponent={CustomTooltip}
            styles={{
                options: {
                    zIndex: 10000,
                    arrowColor: "var(--tw-colors-white, #ffffff)",
                },
            }}
        />
    );
}
