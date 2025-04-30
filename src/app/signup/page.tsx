"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [activeForm, setActiveForm] = useState<"default" | "email">("default");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Redirect to signup success page
      router.push('/signup-success');
    } catch (error) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError('');
    
    try {
      await signIn('google', { callbackUrl: '/upload-resume' });
    } catch (error) {
      setError('Failed to sign up with Google');
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Section with Image */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 relative">
        <Image
          src="/images/login.webp"
          alt="Signup Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      {/* Right Section for Signup */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col px-4 sm:px-8 py-6 sm:py-8 relative">
        <div className="mb-8 sm:mb-16 text-center">
          <Image src="/images/logo.png" alt="Mahindra Logo" width={150} height={50} priority className="mx-auto" />
        </div>

        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-3 sm:mb-6">Create Your Account</h2>
          <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">Join our community today</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm sm:text-base">
              <p>{error}</p>
            </div>
          )}

          {activeForm === "default" && (
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignup}
                className="w-full border border-gray-300 py-2.5 sm:p-3 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 sm:gap-3 transition duration-200 text-sm sm:text-base"
                disabled={loading}
              >
                <Image src="/icons/search.png" alt="Google" width={20} height={20} />
                <span className="font-medium">Sign up with Google</span>
              </button>

              <div className="relative my-4 sm:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 sm:px-3 bg-white text-gray-500 text-xs sm:text-sm">or sign up with email</span>
                </div>
              </div>

              <button
                onClick={() => setActiveForm("email")}
                className="w-full bg-red-500 text-white py-2.5 sm:p-3 rounded-lg hover:bg-red-600 transition duration-200 font-medium text-sm sm:text-base"
              >
                Sign up with Email
              </button>
            </div>
          )}

          {activeForm === "email" && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
              <form onSubmit={handleEmailSignup} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 py-2.5 px-3 sm:p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 py-2.5 px-3 sm:p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm sm:text-base"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-500 hover:text-gray-700"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-gray-300 py-2.5 px-3 sm:p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm sm:text-base"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-gray-500 hover:text-gray-700"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? <EyeOff size={18} className="sm:w-5 sm:h-5" /> : <Eye size={18} className="sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-red-500 text-white py-2.5 sm:p-3 rounded-lg hover:bg-red-600 transition duration-200 font-medium text-sm sm:text-base"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForm("default")}
                  className="text-center w-full text-gray-500 hover:text-gray-700 mt-2 text-xs sm:text-sm"
                >
                  ← Back to all options
                </button>
              </form>
            </div>
          )}

          <div className="text-center mt-4 sm:mt-6">
            <p className="text-gray-600 text-xs sm:text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-red-500 font-semibold hover:text-red-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6 sm:mt-8 mb-4 sm:mb-8">
            By signing up, you agree to Mahindra's{" "}
            <a
              href="https://www.mahindra.com/terms-of-use"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-500 transition underline">
              Terms of Use
            </a> and{" "}
            <a
              href="https://www.mahindra.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-500 transition underline"
            >
              Privacy Policy
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}