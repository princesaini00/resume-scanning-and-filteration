"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Hero() {
    const { data: session } = useSession();
    const router = useRouter();

    const handleResumeUpload = () => {
        if (session) {
            // If user is logged in, go directly to upload resume page
            router.push('/upload-resume');
        } else {
            // If not logged in, redirect to login page
            router.push('/login');
        }
    };

    return (
        <div className="relative w-full h-[85vh] min-h-[600px] overflow-hidden">
            {/* Background Image - full height */}
            <div className="absolute inset-0 w-full h-full">
                <Image
                    src="/images/hero-bg.webp"
                    alt="Hero Background"
                    fill
                    priority
                    style={{ objectFit: 'cover' }}
                />
            </div>

            {/* Mobile Layout - Stack the divs vertically */}
            <div className="md:hidden mt-5 flex flex-col items-center absolute inset-0 pt-4 px-4 overflow-y-auto">
                {/* Mobile Div 1 */}
                <div className="bg-black/60 text-white p-4 rounded-lg shadow-lg w-full mb-4">
                    <h2 className="text-xl font-bold mb-2">
                        Join Mahindra Rise: <br /> Where Innovation Meets Talent!
                    </h2>
                    <p className="text-sm mb-2">
                        Students, upload your resume. Hiring team, find the best talent. Powered by AI, built for the future.
                    </p>
                </div>

                {/* Mobile Div 2 */}
                <div className="flex bg-red-500 text-white p-4 rounded-lg shadow-lg w-full mb-4">
                    <div className="pr-3"><Image src="/icons/infowhite.png" alt="Info" width={30} height={30} /></div>
                    <div className="flex flex-col">
                        <h2 className="text-base font-bold">Kickstart Your Career with Mahindra Rise!</h2>
                        <p className="mt-2 text-xs opacity-80">
                            Upload your resume and let our AI optimize it for better visibility. Get noticed for exciting career opportunities at Mahindra.
                        </p>
                        <button 
                            onClick={handleResumeUpload}
                            className="mt-3 bg-white text-gray-800 font-semibold px-4 py-1 text-sm rounded-lg shadow self-start hover:scale-105 transition-transform duration-300"
                        >
                            Upload Resume
                        </button>
                    </div>
                </div>

                {/* Mobile Div 3 */}
                <div className="flex bg-white text-black p-4 rounded-lg shadow-lg w-full">
                    <div className="pr-3"><Image src="/icons/info.png" alt="Info" width={30} height={30} /></div>
                    <div className="flex flex-col">
                        <h2 className="text-base font-bold">Find the Best Talent for Mahindra!</h2>
                        <p className="mt-2 text-xs opacity-50">
                            Access AI-filtered resumes and streamline hiring. Discover top talent that aligns with Mahindra's vision and growth.
                        </p>
                        <button className="mt-3 bg-gray-800 text-white text-sm px-4 py-1 rounded-lg self-start hover:scale-105 transition-transform duration-300">
                            <a href="/admin-add-job">Admin Login</a>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Layout - Original positioning */}
            <div className="hidden md:block">
                {/* Floating Div 1 */}
                <div className="absolute flex top-[17%] left-[5%] bg-red-500 text-white p-4 rounded-lg shadow-lg w-[90%] sm:w-[40%] md:w-[35%] lg:w-[80%] max-w-[600px]">
                    <div className="pr-4"><Image src="/icons/infowhite.png" alt="Info" width={40} height={40} /></div>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">Kickstart Your Career with Mahindra Rise!</h2>
                        <p className="mt-3 text-sm opacity-80">
                            Upload your resume and let our AI optimize it for better visibility. Get noticed for exciting career opportunities at Mahindra.
                        </p>
                        <button 
                            onClick={handleResumeUpload}
                            className="mt-5 bg-white text-gray-800 font-semibold px-5 py-2 rounded-lg shadow self-start hover:scale-105 transition-transform duration-300"
                        >
                            Upload Resume
                        </button>
                    </div>
                </div>

                {/* Floating Div 2 */}
                <div className="absolute top-[18%] right-[5%] bg-black/60 text-white p-15 rounded-lg shadow-lg w-[90%] sm:w-[40%] md:w-[35%] lg:w-[50%] max-w-[500px]">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl mt-2 mb-8">
                        Join Mahindra Rise: <br /> Where Innovation Meets Talent!
                    </h2>
                    <p className="text-base sm:text-lg mb-5">
                        Students, upload your resume. Hiring team, find the best talent. Powered by AI, built for the future.
                    </p>
                </div>

                {/* Floating Div 3 */}
                <div className="absolute flex bottom-[17%] left-[5%] bg-white text-black p-4 rounded-lg shadow-lg w-[90%] sm:w-[40%] md:w-[35%] lg:w-[80%] max-w-[600px]">
                    <div className="pr-4"><Image src="/icons/info.png" alt="Info" width={40} height={40} /></div>
                    <div className="flex flex-col">
                        <h2 className="text-lg font-bold">Find the Best Talent for Mahindra!</h2>
                        <p className="mt-3 text-sm opacity-50">
                            Access AI-filtered resumes and streamline hiring. Discover top talent that aligns with Mahindra's vision and growth.
                        </p>
                        <button className="mt-5 bg-gray-800 text-white px-5 py-2 rounded-lg self-start hover:scale-105 transition-transform duration-300">
                            <a href="/admin-add-job">Admin Login</a>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}