import React from "react";
import Joyride, { STATUS } from "react-joyride";

export default function TutorialWalkthrough({ run, onFinish, setActiveTab }) {
    const steps = [
        {
            target: ".tour-home",
            title: "Dashboard Overview",
            content: "Welcome to StimTrack! This dashboard shows your daily activity summary.",
            placement: "right",
            disableBeacon: true,
        },
        {
            target: ".tour-home-content",
            title: "Activity Feed",
            content: "Your latest detections show up right here on the home page for quick access.",
            placement: "bottom",
            disableBeacon: true,
        },
        {
            target: ".tour-detections",
            title: "Live Detections",
            content: "Here you can track stimming patterns and frequency in real-time.",
            placement: "right",
        },
        {
            target: ".tour-reports",
            title: "Detailed Reports",
            content: "Generate and download PDF reports formatted perfectly for clinicians.",
            placement: "right",
        },
        {
            target: ".tour-profile",
            title: "User Profile",
            content: "Manage your account, role, and your child's profile settings here.",
            placement: "right",
        },
        {
            target: ".tour-theme",
            title: "Appearance",
            content: "Toggle between light and dark modes to suit your viewing preference!",
            placement: "right",
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
                            className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 active:scale-95"
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
