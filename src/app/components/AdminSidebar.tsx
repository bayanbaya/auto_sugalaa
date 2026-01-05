'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  Settings, 
  PieChart, 
  LogOut,
  Bell
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Машины жагсаалт', icon: LayoutDashboard, href: '/admin' },
    { name: 'Хэрэглэгчид', icon: Users, href: '/admin/users' },
    { name: 'Статистик', icon: PieChart, href: '/admin/stats' },
    { name: 'Мэдэгдэл', icon: Bell, href: '/admin/notifications' },
    { name: 'Тохиргоо', icon: Settings, href: '/admin/settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-20">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Car className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
            Admin Panel
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
          <LogOut className="w-5 h-5" />
          Гарах
        </button>
      </div>
    </aside>
  );
}