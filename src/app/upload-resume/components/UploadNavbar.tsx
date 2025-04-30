"use client";

import Link from "next/link";
import Image from "next/image";
import { FaUserCircle } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi"; // Added menu icons
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function UploadNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle logout function
  const handleLogout = async () => {
    await signOut({ redirect: false });
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  // Navbar links with their paths
  const navLinks = [
    { name: "Dashboard", path: "/upload-resume" },
    { name: "Already Applied", path: "/already-applied" },
    { name: "Contact Us", path: "https://www.mahindra.com/contact-us" },
  ];

  return (
    <nav className="flex justify-between items-center p-4 sm:p-6 shadow-md bg-white relative">
      {/* Left: Logo */}
      <Link href="/" className="z-10">
        <Image src="/images/logo.png" alt="Logo" width={120} height={40} className="md:w-[150px] md:h-[100%]" />
      </Link>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden z-10 text-gray-700 focus:outline-none"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <HiX size={24} className="text-red-500" />
        ) : (
          <HiMenu size={24} className="text-red-500" />
        )}
      </button>

      {/* Desktop: Navigation Links */}
      <div className="hidden md:flex space-x-10 text-gray-900 font-bold">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.path}
            className={`hover:text-red-500 transition-colors ${
              pathname === link.path ? "text-red-500" : "text-gray-900"
            }`}
            target={link.path.startsWith("http") ? "_blank" : "_self"}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Desktop: Profile Icon with Dropdown */}
      <div className="hidden md:block relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="focus:outline-none"
        >
          <FaUserCircle size={28} className="text-red-500 cursor-pointer hover:text-red-600" />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="block px-4 py-2 text-gray-700 border-b border-gray-200">
              {session?.user?.email || "User"}
            </div>
            
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden fixed inset-0 z-20 bg-white pt-20"
        >
          <div className="flex flex-col items-center space-y-6 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`text-lg font-bold hover:text-red-500 transition-colors ${
                  pathname === link.path ? "text-red-500" : "text-gray-900"
                }`}
                target={link.path.startsWith("http") ? "_blank" : "_self"}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}

            {/* User Email and Logout in Mobile Menu */}
            <div className="w-full border-t border-gray-200 pt-4 mt-4">
              <div className="text-center text-gray-700 mb-2">
                {session?.user?.email || "User"}
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}