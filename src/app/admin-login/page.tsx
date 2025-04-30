'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams?.get('callbackUrl') || '/admin-add-job';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email: username, // Using email field for username since that's what your auth expects
                password,
                isAdmin: 'true', // Flag to indicate this is an admin login
                redirect: false,
                callbackUrl
            });

            if (result?.error) {
                setError('Invalid admin credentials');
                setLoading(false);
            } else if (result?.url) {
                router.push(result.url);
            }
        } catch (error) {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
                    <h2 className="text-xl md:text-2xl font-semibold text-center mb-2">Admin Login</h2>
                    <p className="text-center text-gray-600 text-sm md:text-base mb-6 md:mb-8">
                        Enter your credentials to access admin dashboard
                    </p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm md:text-base">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 md:p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                    Admin ID
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    placeholder="Enter your admin ID"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={20} />
                                        ) : (
                                            <Eye size={20} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition duration-200 font-medium disabled:opacity-70"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}