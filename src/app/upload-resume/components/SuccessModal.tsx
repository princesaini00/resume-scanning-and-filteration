"use client";

import { useEffect } from "react";
import { FiCheckCircle } from "react-icons/fi";

interface SuccessModalProps {
    onClose: () => void;
    applicationId: string; // Still accepting it, just not using it
}

export default function SuccessModal({ onClose }: SuccessModalProps) {
    // Close modal after 10 seconds automatically
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 10000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            {/* Backdrop overlay */}
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[500px] shadow-xl relative z-10 border-1 border-gray-400">
            
            {/* Modal container - adjusted width for mobile */}
            <div className="bg-white rounded-lg p-6 w-full mx-4 sm:w-96 shadow-xl relative z-10 border border-gray-400 max-w-sm">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                        <FiCheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mt-3">
                        Application Submitted Successfully!
                    </h3>
                    <div className="mt-2 text-sm text-gray-500">
                        <p>Thank you for applying.</p>
                        <p className="mt-2">We'll review your application and get back to you shortly.</p>
                    </div>
                    <div className="mt-6">
                        <button
                            type="button"
                            className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 w-full sm:w-auto"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}