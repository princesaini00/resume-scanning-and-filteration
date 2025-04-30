"use client";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle logout function
  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="shadow-md bg-white">
      <div className="flex justify-between items-center p-4 md:p-6">
        <Link href="/">
          <Image src="/images/logo.png" alt="Logo" width={120} height={40} className="md:w-[150px] md:h-[100%]" />
        </Link>

        {/* Hamburger menu for mobile */}
        <button 
          className="md:hidden flex flex-col justify-center items-center"
          onClick={toggleMenu}
        >
          <span className={`block w-6 h-0.5 bg-gray-900 mb-1.5 transition-transform ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-900 mb-1.5 transition-opacity ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-900 transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:block space-x-10 text-gray-900 font-bold">
          <a
            href="https://www.mahindra.com/about-us"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-500 transition"
          >
            About Us
          </a>
          <a
            href="https://www.mahindra.com/careers"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-500 transition">
            Careers
          </a>
          <a
            href="https://www.mahindra.com/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-500 transition"
          >
            Contact
          </a>
        </div>

        {/* Desktop User Status */}
        <div className="hidden md:block">
          {session ? (
            // If user is logged in, show email and logout button
            <div className="flex items-center">
              <span className="mr-2">{session.user?.email || "User"}</span>
              <button
                onClick={handleLogout}
                className="text-red-500 font-bold hover:underline"
              >
                Logout
              </button>
            </div>
          ) : (
            // If user is not logged in, show login/signup button
            <Link 
              href="/login" 
              className="text-red-500 font-semibold hover:underline"
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} pb-4 px-6 bg-white`}>
        <div className="flex flex-col space-y-4 border-t pt-4">
          <a
            href="https://www.mahindra.com/about-us"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-500 transition text-gray-900 font-bold"
          >
            About Us
          </a>
          <a
            href="https://www.mahindra.com/careers"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-500 transition text-gray-900 font-bold">
            Careers
          </a>
          <a
            href="https://www.mahindra.com/contact-us"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-500 transition text-gray-900 font-bold"
          >
            Contact
          </a>
          
          {/* Mobile User Status */}
          <div className="mt-4 pt-4 border-t">
            {session ? (
              // If user is logged in, show email and logout button
              <div className="flex flex-col space-y-2">
                <span>{session.user?.email || "User"}</span>
                <button
                  onClick={handleLogout}
                  className="text-red-500 font-bold hover:underline self-start"
                >
                  Logout
                </button>
              </div>
            ) : (
              // If user is not logged in, show login/signup button
              <Link 
                href="/login" 
                className="text-red-500 font-semibold hover:underline"
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}