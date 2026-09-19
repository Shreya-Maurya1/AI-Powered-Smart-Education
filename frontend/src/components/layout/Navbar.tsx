'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';
import { BookOpen, LogOut, User as UserIcon, Menu, X } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!user) return null;

  const isTeacher = user.role === 'TEACHER';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={isTeacher ? '/teacher/dashboard' : '/dashboard'} className="flex items-center gap-2">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-gray-900">AdaptiveMind</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-6">
            {!isTeacher ? (
              <>
                <Link href="/dashboard" className={`text-sm font-medium ${pathname === '/dashboard' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Dashboard</Link>
                <Link href="/courses" className={`text-sm font-medium ${pathname.startsWith('/courses') ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Courses</Link>
                <Link href="/profile" className={`text-sm font-medium ${pathname === '/profile' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Profile</Link>
              </>
            ) : (
              <>
                <Link href="/teacher/dashboard" className={`text-sm font-medium ${pathname === '/teacher/dashboard' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Overview</Link>
                <Link href="/teacher/students" className={`text-sm font-medium ${pathname === '/teacher/students' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Students</Link>
                <Link href="/teacher/analytics" className={`text-sm font-medium ${pathname === '/teacher/analytics' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>Analytics</Link>
              </>
            )}

            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-xs">
                {getInitials(user.name)}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-semibold text-gray-900">{user.name}</p>
                <p className="text-[10px] text-gray-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 px-4 pt-2 pb-4 space-y-2">
          {!isTeacher ? (
            <>
              <Link href="/dashboard" className="block py-2 text-sm text-gray-700">Dashboard</Link>
              <Link href="/courses" className="block py-2 text-sm text-gray-700">Courses</Link>
              <Link href="/profile" className="block py-2 text-sm text-gray-700">Profile</Link>
            </>
          ) : (
            <>
              <Link href="/teacher/dashboard" className="block py-2 text-sm text-gray-700">Dashboard</Link>
              <Link href="/teacher/students" className="block py-2 text-sm text-gray-700">Students</Link>
              <Link href="/teacher/analytics" className="block py-2 text-sm text-gray-700">Analytics</Link>
            </>
          )}
          <button onClick={logout} className="w-full text-left py-2 text-sm text-red-600 font-medium">Logout</button>
        </div>
      )}
    </nav>
  );
}
