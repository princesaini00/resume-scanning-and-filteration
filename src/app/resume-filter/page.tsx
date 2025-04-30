"use client";

import Filters from "./components/Filters";
import Chatbot from "./components/Chatbot";
import { useState, useEffect } from "react";

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Check if viewport width is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    checkIfMobile();
    
    // Add event listener
    window.addEventListener("resize", checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);
  
  return (
    <div className="flex min-h-screen relative">
      {/* Mobile toggle button for filters */}
      {isMobile && (
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="fixed bottom-4 right-4 z-50 bg-red-500 text-white p-3 rounded-full shadow-lg"
        >
          {showFilters ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          )}
        </button>
      )}
      
      {/* Filters Section (Left Sidebar) */}
      <div 
        className={`${isMobile ? 
          (showFilters ? 'fixed inset-0 z-40 bg-white' : 'hidden') : 
          'fixed top-0 left-0 h-screen w-1/4 bg-gray-100 overflow-y-auto'}`}
      >
        {isMobile && showFilters && (
          <div className="p-4 bg-red-500 text-white">
            <h2 className="text-xl font-bold">Resume Filters</h2>
          </div>
        )}
        <Filters />
      </div>
      
      {/* Chatbot Section */}
      <div className={isMobile ? 'w-full' : 'flex-1 ml-[25%]'}>
        <Chatbot />
      </div>
    </div>
  );
}