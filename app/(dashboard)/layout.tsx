'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  Calendar,
  Users,
  CheckSquare,
  DollarSign,
  ShoppingBag,
  Globe,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Calendar },
    { name: 'Events', href: '/dashboard/events', icon: Heart },
    { name: 'Guests', href: '/dashboard/guests', icon: Users },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Budget', href: '/dashboard/budget', icon: DollarSign },
    { name: 'Vendors', href: '/dashboard/vendors', icon: ShoppingBag },
    { name: 'Website', href: '/dashboard/website', icon: Globe },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link href="/dashboard" className="flex items-center ml-2">
                <Heart className="h-8 w-8 text-pink-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">WeddingPlanner</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 relative">
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-pink-600 rounded-full"></span>
              </button>

              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-pink-600 flex items-center justify-center text-white font-semibold">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-16`}
      >
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  isActive
                    ? 'bg-pink-50 text-pink-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <p className="font-semibold">Role: {user.role}</p>
            <p className="truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pt-16">
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
