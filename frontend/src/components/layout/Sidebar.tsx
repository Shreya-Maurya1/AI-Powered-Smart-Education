'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, BookOpen, User, GraduationCap, BarChart2, Sparkles, MessageSquare, Code } from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isTeacher = user.role === 'TEACHER';

  const studentLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Adaptive Learning', href: '/learning', icon: Sparkles },
    { name: 'Socratic Tutor', href: '/tutor', icon: MessageSquare },
    { name: 'Coding Mentor', href: '/coding', icon: Code },
    { name: 'Browse Courses', href: '/courses', icon: BookOpen },
    { name: 'My Profile', href: '/profile', icon: User },
  ];

  const teacherLinks = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/teacher/students', icon: GraduationCap },
    { name: 'Analytics', href: '/teacher/analytics', icon: BarChart2 },
  ];

  const links = isTeacher ? teacherLinks : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 hidden md:block">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          {isTeacher ? 'Teacher Menu' : 'Student Menu'}
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/dashboard' && link.href !== '/teacher/dashboard' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              {link.name}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
