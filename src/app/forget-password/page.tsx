'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Password reset link has been sent to your email address.'
        });
        // Clear the email field after successful submission
        setEmail('');
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Something went wrong. Please try again.'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again later.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Image Section */}
      <div className="hidden md:block md:w-1/2 lg:w-3/5 relative">
        <Image
          src="/images/login.webp"
          alt="Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
      </div>

      {/* Right Form Section - Added responsive padding and sizing */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col px-4 py-6 md:p-8 relative">
        <div className="mb-8 md:mb-16 text-center">
          <Image 
            src="/images/logo.png" 
            alt="Mahindra Logo" 
            width={150} 
            height={50} 
            priority 
            className="mx-auto"
          />
        </div>

        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-2">Forgot Password</h2>
          <p className="text-center text-gray-600 text-sm md:text-base mb-6 md:mb-8">
            Enter your email address and we'll send you a link on your email to reset your password.
          </p>

          {message.text && (
            <div 
              className={`mb-4 p-3 rounded-lg text-sm md:text-base ${
                message.type === 'success' 
                  ? 'bg-green-50 border-l-4 border-green-500 text-green-700' 
                  : 'bg-red-50 border-l-4 border-red-500 text-red-700'
              }`}
            >
              <p>{message.text}</p>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              <div className="flex space-x-3">
                <Link 
                  href="/login"
                  className="w-1/3 py-3 border border-gray-300 text-gray-700 rounded-lg text-center hover:bg-gray-50 transition duration-200 text-sm md:text-base"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition duration-200 font-medium disabled:opacity-70 text-sm md:text-base"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm md:text-base">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-red-500 font-semibold hover:text-red-600 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}