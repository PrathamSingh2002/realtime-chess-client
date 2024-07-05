import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="flex-shrink-0">
                    <span className="ml-2 text-white text-xl font-bold">Chesslive</span>
                  </Link>
                </div>
                <div className="flex items-center space-x-4">
                  <Link href="/profile" className="text-gray-300 hover:text-white transition duration-150 ease-in-out">
                    Profile
                  </Link>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Login
                  </button>
                </div>
              </div>
            </div>
          </nav>
          <main className="flex-1 bg-gray-100">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );  
}