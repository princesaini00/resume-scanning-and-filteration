"use client"; // Required for using hooks like usePathname and useState

import Link from "next/link";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa"; // Profile icon
import { useState, useRef, useEffect } from "react"; // For managing dropdown state and click outside logic
import { useSession, signOut } from "next-auth/react"; // Import these from next-auth/react
import { usePathname, useRouter } from "next/navigation";

export default function UploadNavbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Dropdown state
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false); // Close dropdown
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fully clear the session and force redirect
  const forceLogout = () => {
    // Clear any local storage items that might persist session data
    localStorage.clear();
    
    // Clear session cookies by setting expiry to past date
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Redirect to admin login
    if (session?.user?.role === 'admin') {
      window.location.href = '/admin-login?logout=true&t=' + Date.now();
    } else {
      window.location.href = '/?logout=true&t=' + Date.now();
    }
  };

  // Handle logout function - Complete session termination approach
  const handleLogout = async () => {
    try {
      setIsDropdownOpen(false);
      
      // For admins, we need a special approach
      if (session?.user?.role === 'admin') {
        // Call signOut to clear the session
        await signOut({ redirect: false });
        
        // Then force complete cleanup and redirect
        setTimeout(forceLogout, 100);
      } else {
        // For regular users, trigger signOut with redirect
        await signOut({ redirect: false });
        setTimeout(forceLogout, 100);
      }
    } catch (error) {
      console.error("Logout error:", error);
      // If the normal signOut fails, fall back to our force logout
      forceLogout();
    }
  };

  return (
    <nav className="flex justify-between items-center p-4 bg-white relative shadow">
      {/* Left: Logo */}
      <Link href="/">
        <Image 
          src="/images/logo.png" 
          alt="Logo" 
          width={120} 
          height={40} 
          className="w-[100px] h-auto md:w-[150px] md:h-[100%]" 
        />
      </Link>

      {/* Right: Profile Icon with Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="focus:outline-none"
        >
          <FaUserCircle size={28} className="text-red-500 cursor-pointer hover:text-red-600" />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="block px-4 py-2 text-gray-700 border-b border-gray-200 text-sm md:text-base truncate">
              {session?.user?.email || "Admin"}
              {session?.user?.role === 'admin' && (
                <span className="ml-1 text-xs font-semibold text-red-500">(Admin)</span>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm md:text-base"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}