import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

// 1. Status Step Component
const StatusStep = ({ stepNumber, title, date, status }) => {
    const isCompleted = status === 'completed';
    const isCurrent = status === 'current';
    const isPending = status === 'pending';

    return (
        <div className="flex flex-col items-center text-center">
            {/* Circle and Number */}
            <motion.div 
                className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500
                    ${isCompleted ? 'bg-green-500 border-green-500' : ''}
                    ${isCurrent ? 'bg-white border-green-500' : ''}
                    ${isPending ? 'bg-white border-gray-300' : ''}
                `}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                {isCompleted && <Check size={24} className="text-white" />}
                {!isCompleted && <span className={`font-bold ${isCurrent ? 'text-green-500' : 'text-gray-400'}`}>{stepNumber}</span>}
                {isCurrent && <div className="absolute w-10 h-10 rounded-full border-2 border-green-500 animate-ping"></div>}
            </motion.div>
            {/* Text Content */}
            <div className="mt-3">
                <p className={`font-semibold text-sm ${isCurrent ? 'text-black' : 'text-gray-600'}`}>{title}</p>
                <p className="text-xs text-gray-500 mt-1">{date}</p>
            </div>
        </div>
    );
};

// Main Order Status Tracker Component
const TrackOrder = () => {
    const [currentStep, setCurrentStep] = useState(3); // The current active step (1-based index)
    const steps = [
        { number: 1, title: 'Order Received', date: 'May 26, 2024' },
        { number: 2, title: 'In Transit', date: 'May 27, 2024' },
        { number: 3, title: 'On Shorting Center', date: 'May 29, 2024' },
        { number: 4, title: 'On the Way', date: 'May 29, 2024' },
        { number: 5, title: 'Delivered', date: 'June 06, 2024' },
    ];
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => (prev >= steps.length ? 1 : prev + 1));
        }, 3000);
        return () => clearInterval(interval);
    }, [steps.length]);
    return (
        <div className="w-full h-full flex items-center justify-center p-0 font-sans">
            <div className="w-full p-0">
                <div className="flex items-start justify-between relative">
                    {/* Progress Bar */}
                    <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-300"></div>
                    <motion.div 
                        className="absolute top-5 left-0 h-0.5 bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                    ></motion.div>
                    {steps.map((step, index) => (
                        <div key={step.number} className="z-10 w-1/5">
                             <StatusStep
                                stepNumber={step.number}
                                title={step.title}
                                date={step.date}
                                status={
                                    index + 1 < currentStep ? 'completed' :
                                    index + 1 === currentStep ? 'current' :
                                    'pending'
                                }
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TrackOrder; 