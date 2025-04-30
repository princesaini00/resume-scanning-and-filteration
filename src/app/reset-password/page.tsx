'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage({ 
  params 
}: { 
  params: { token: string } 
}) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [token, setToken] = useState('');
  const [isValidToken, setIsValidToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      
      // Verify token validity
      const verifyToken = async () => {
        try {
          const response = await fetch(`/api/auth/verify-reset-token?token=${tokenFromUrl}`);
          if (!response.ok) {
            setIsValidToken(false);
            setMessage({
              type: 'error',
              text: 'This password reset link is invalid or has expired. Please request a new one.'
            });
          }
        } catch (error) {
          setIsValidToken(false);
          setMessage({
            type: 'error',
            text: 'Failed to verify reset token. Please try again.'
          });
        }
      };
      
      verifyToken();
    } else {
      setIsValidToken(false);
      setMessage({
        type: 'error',
        text: 'No reset token provided. Please request a password reset again.'
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match.'
      });
      return;
    }

    if (password.length < 6) {
      setMessage({
        type: 'error',
        text: 'Password must be at least 6 characters long.'
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Your password has been reset successfully. You will be redirected to login page.'
        });
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Failed to reset password. Please try again.'
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          <h2 className="text-xl md:text-2xl font-semibold text-center mb-2">Reset Password</h2>
          <p className="text-center text-gray-600 text-sm md:text-base mb-6 md:mb-8">
            Please enter your new password
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

          {isValidToken && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      onClick={toggleConfirmPasswordVisibility}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition duration-200 font-medium disabled:opacity-70 text-sm md:text-base"
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            </div>
          )}

          {!isValidToken && (
            <div className="text-center mt-4">
              <Link
                href="/forget-password"
                className="bg-red-500 text-white px-6 py-3 rounded-lg inline-block hover:bg-red-600 transition duration-200 text-sm md:text-base"
              >
                Request New Reset Link
              </Link>
            </div>
          )}

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