'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  // Countdown and redirect to upload-resume page after 10 seconds
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/upload-resume');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="flex min-h-screen">
      {/* Left Section with Image */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 relative">
        <Image
          src="/images/login.png"
          alt="Signup Success Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      {/* Right Section - Added responsive styles */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center items-center px-4 py-6 md:p-8 space-y-6 relative">
        <div className="absolute text-center top-6 md:top-8 z-10">
          <Image src="/images/logo.png" alt="Mahindra Logo" width={150} height={50} priority />
        </div>

        <div className="text-center max-w-md space-y-4 mt-16 px-4">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-16 md:w-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              
              {/* Animated pulse ring */}
              <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Account Created Successfully!</h1>
          
          <p className="text-gray-600 text-sm md:text-base">
            Thank you for joining Mahindra Rise. Your account has been created successfully.
          </p>
          
          {/* Countdown display */}
          <div className="bg-gray-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto border-2 border-red-100">
            <span className="text-red-500 text-xl font-semibold">{countdown}</span>
          </div>
          
          <p className="text-gray-500 text-sm">
            You will be redirected to the resume upload page in <span className="font-semibold">{countdown}</span> seconds...
          </p>
          
          <div className="mt-6 space-y-3">
            <Link href="/upload-resume">
              <button className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm md:text-base">
                Continue to Upload Resume
              </button>
            </Link>
            
            <Link href="/">
              <button className="w-full border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}