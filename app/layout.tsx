"use client"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { FaChess, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { useStore } from "@/app/stores/store";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isClient, setIsClient] = useState(false);
  const { user, setUser } = useStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    // Implement logout logic here
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    setUser(null);
    // You might also want to redirect to the home page after logout
    window.location.href = '/login';
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="flex-shrink-0 flex items-center">
                    <FaChess className="h-8 w-8 text-indigo-600" />
                    <span className="ml-2 text-2xl font-bold text-gray-800">Chesslive</span>
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <Link href="/profile" className="text-gray-600 hover:text-indigo-600 transition duration-150 ease-in-out font-medium">
                    Profile
                  </Link>
                  {isClient && (user ? (
                    <button 
                      onClick={handleLogout}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
                    >
                      <FaSignOutAlt className="mr-2" /> Logout
                    </button>
                  ) : (
                    <Link href='/login'>
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center">
                        <FaSignInAlt className="mr-2" /> Login
                      </button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
          <main className="flex-1">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );  
}