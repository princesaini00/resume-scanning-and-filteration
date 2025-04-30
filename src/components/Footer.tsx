import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center text-sm">
      {/* Links for About, Privacy Policy, Contact, and Sign In/Sign Up - Mobile responsive grid */}
      <div className="grid grid-cols-2 md:block md:space-x-4 gap-y-2 py-4 px-4">
        <a
          href="https://www.mahindra.com/about-us"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-500 transition"
        >
          About Mahindra
        </a>
        <span className="hidden md:inline">|</span>
        <a
          href="https://www.mahindra.com/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-500 transition"
        >
          Privacy Policy
        </a>
        <span className="hidden md:inline">|</span>
        <a
          href="https://www.mahindra.com/contact-us"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-500 transition"
        >
          Contact
        </a>
        <span className="hidden md:inline">|</span>
        <a
          href="https://www.mahindra.com/terms-of-use"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-500 transition">
          Terms of Use
        </a>
        <span className="hidden md:inline">|</span>
        <a
          href="https://www.mahindra.com/careers"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-500 transition">
          Careers
        </a>
        <span className="hidden md:inline">|</span>
        <Link
          href="/login"
          className="hover:text-red-500 transition"
        >
          Sign In / Sign Up
        </Link>
      </div>

      {/* Social Media Links */}
      <div className="flex justify-center space-x-4 mb-4">
        <a
          href="https://www.facebook.com/MahindraRise"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/icons/facebook.png" alt="Facebook" width={20} className="hover:opacity-75 transition" />
        </a>
        <a
          href="https://www.instagram.com/mahindrarise/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/icons/instagram.png" alt="Instagram" width={20} className="hover:opacity-75 transition" />
        </a>
        <a
          href="https://www.linkedin.com/company/mahindrarise/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/icons/linkedin.png" alt="LinkedIn" width={20} className="hover:opacity-75 transition" />
        </a>
        <a
          href="https://www.youtube.com/user/MahindraRise"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/icons/youtube.png" alt="YouTube" width={20} className="hover:opacity-75 transition" />
        </a>
        <a
          href="https://twitter.com/MahindraRise"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/icons/twitter.png" alt="Twitter" width={20} className="hover:opacity-75 transition" />
        </a>
      </div>

      {/* Copyright Section */}
      <div className="bg-red-500 text-white py-3 px-4 md:h-12 md:py-0 grid place-items-center">
        <p className="text-xs md:text-sm">Copyright&copy; 2025 Mahindra & Mahindra Pvt Ltd. All Rights Reserved.</p>
      </div>
    </footer>
  );
}