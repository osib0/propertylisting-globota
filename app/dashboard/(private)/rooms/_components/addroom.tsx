"use client";

import { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import StepOne from "./roomstep/stepone";
import StepTwo from "./roomstep/steptwo";
import StepThree from "./roomstep/stepthree";
import StepFour from "./roomstep/stepfoure";

// Define step configuration
const STEPS = [
    { id: 1, component: StepOne },
    { id: 2, component: StepTwo },
    { id: 3, component: StepThree },
    { id: 4, component: StepFour },
];

// Define prop types
interface RoomAddProps {
    setAddRoom: (value: boolean) => void;
    propertyId: string | null;
    userId:string | undefined;
}


const RoomAdd = ({ setAddRoom, propertyId,userId }: RoomAddProps) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [maxStepReached, setMaxStepReached] = useState(1);
    const [sharedFormData, setSharedFormData] = useState({});


    // Handle step navigation with validation
    const handleStepChange = (newStep: number, canProceed: boolean = true) => {
        if (!canProceed) {
            toast.error("Please complete the current step before proceeding.");
            return;
        }
        if (newStep >= 1 && newStep <= STEPS.length && newStep <= maxStepReached + 1) {
            setStep(newStep);
            setMaxStepReached((prev) => Math.max(prev, newStep));
        } else {
            toast.error("Cannot navigate to this step yet.");
        }
    };

    
 
    // Memoize the current step component to prevent unnecessary re-renders
    const CurrentStepComponent = useMemo(() => {
        const { component: Component } = STEPS[step - 1] || {};
        return Component ? (
            <Component
                setStep={handleStepChange}
                setMaxStepReached={(newMax: number) =>
                    setMaxStepReached((prev) => Math.max(prev, newMax))
                }
                setLoading={setLoading}
                propertyId={propertyId}
                userId={userId}
                setAddRoom={step === STEPS.length ? setAddRoom : undefined}
                sharedFormData={sharedFormData}
                setSharedFormData={setSharedFormData}
            />
        ) : null;
    }, [step, propertyId, setAddRoom]);

    if (loading) {
        return (
            <div className="text-center p-4">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="w-full pb-5 room-add">
            {/* Header */}
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                <h6 className="m-0 flex items-center gap-1 text-lg font-semibold">
                    <span
                        className="font-semibold cursor-pointer"
                        onClick={() => setAddRoom(false)}
                        onKeyDown={(e) => e.key === "Enter" && setAddRoom(false)}
                        role="button"
                        aria-label="Back to Room"
                        tabIndex={0}
                    >
                        Room
                    </span>
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                    Add
                </h6>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAddRoom(false)}
                    onKeyDown={(e) => e.key === "Enter" && setAddRoom(false)}
                    className="font-semibold"
                    aria-label="Back"
                >
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                    Back
                </Button>
            </div>

            <div className="flex flex-col md:flex-row">
                {/* Sidebar Steps */}
                <div className="p-3 mb-3 md:mb-0 min-w-[100px]">
                    <h6 className="font-bold mb-3">Steps</h6>
                    <ul className="flex flex-row md:flex-col gap-3 p-0 m-0 list-none">
                        {STEPS.map(({ id: s }, i) => {
                            const isActive = s === step;
                            const isCompleted = s < maxStepReached;
                            const isAccessible = s <= maxStepReached;

                            return (
                                <li
                                    key={s}
                                    className={`flex items-center flex-col ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""} ${!isAccessible ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} gap-2`}
                                    onClick={() => isAccessible && handleStepChange(s, true)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && isAccessible) handleStepChange(s, true);
                                    }}
                                >
                                    <Button
                                        variant={
                                            isCompleted
                                                ? "default"
                                                : isActive
                                                    ? "secondary"
                                                    : "outline"
                                        }
                                        size="icon"
                                        aria-label={`Step ${s}`}
                                        className="rounded-full"
                                    >
                                        {isCompleted ? <Check className="w-4 h-4" /> : isActive ? <ChevronRight className="w-4 h-4" /> : s}
                                    </Button>

                                    {i < STEPS.length - 1 && (
                                        <div
                                            className={`h-10 w-0.5 mx-auto mt-2 hidden md:block ${maxStepReached > s ? "bg-zinc-400" : "bg-gray-200"}`}
                                        />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Step Content */}
                {CurrentStepComponent}
            </div>


        </div>
    );
};

export default RoomAdd;