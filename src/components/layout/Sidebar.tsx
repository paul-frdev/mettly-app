'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Users,
  CalendarDays,
  Calendar,
  Settings,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@radix-ui/react-tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import Logo from '@/components/Logo';

const sidebarVariants = {
  open: { width: '16rem', opacity: 1 },
  closed: { width: '4.5rem', opacity: 1 },
};

const itemVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 1, x: 0 }, // Changed from opacity: 0 to 1 to keep icons visible
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const t = useTranslations('navigation');

  const userNavigation = [
    { name: 'dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
    { name: 'clients', href: '/clients', icon: <Users className="h-6 w-6" /> },
    { name: 'appointments', href: '/appointments', icon: <CalendarDays className="h-6 w-6" /> },
    { name: 'calendar', href: '/calendar', icon: <Calendar className="h-6 w-6" /> },
    { name: 'settings', href: '/settings/user', icon: <Settings className="h-6 w-6" /> },
  ];

  const clientNavigation = [
    { name: 'dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-6 w-6" /> },
    { name: 'appointments', href: '/appointments', icon: <CalendarDays className="h-6 w-6" /> },
    { name: 'settings', href: '/settings/client', icon: <Settings className="h-6 w-6" /> },
  ];

  const navigation = session?.user?.isClient ? clientNavigation : userNavigation;


  return (
    <motion.div
      className="hidden md:flex flex-col h-screen border-r shadow-sm bg-gradient-to-br from-gray-50 via-sky-50 to-blue-100"
      initial={false}
      animate={isCollapsed ? 'closed' : 'open'}
      variants={sidebarVariants}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex h-20 items-center px-4">
          <Link href="/dashboard" className="flex items-center w-full">
            <motion.div
              variants={itemVariants}
              animate={isCollapsed ? 'closed' : 'open'}
              className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'pl-2'}`}
            >
              {!isCollapsed ? (
                <Logo className="h-10 w-auto" />
              ) : (
                <div className="text-3xl font-bold text-blue-600">ML</div>
              )}
            </motion.div>
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 pt-6 pb-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname.includes(item.href);

              return (
                <TooltipProvider key={item.name} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        variants={itemVariants}
                        animate={isCollapsed ? 'closed' : 'open'}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all',
                            'hover:bg-blue-50 hover:text-blue-600',
                            isActive
                              ? 'bg-blue-50 text-blue-600 font-semibold'
                              : 'text-gray-700',
                            isCollapsed ? 'justify-center' : 'justify-start',
                            'group',
                            'overflow-visible' // Ensure tooltips are not cut off
                          )}
                        >
                          <span className={cn(
                            'flex items-center justify-center',
                            isCollapsed ? 'mr-0' : 'mr-4',
                            isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600',
                            'transition-colors duration-200' // Smooth color transitions
                          )}>
                            {item.icon}
                          </span>
                          {!isCollapsed && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ delay: 0.1 }}
                            >
                              {t(item.name)}
                            </motion.span>
                          )}
                        </Link>
                      </motion.div>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right" sideOffset={10} className="bg-gray-900 text-white text-xs px-2 py-1 rounded">
                        <p>{t(item.name)}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </ScrollArea>

        {/* Collapse button */}
        <div className="p-4 border-t border-blue-100 mt-2 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full ml-auto hover:bg-blue-50 hover:text-blue-600"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isCollapsed ? 'Expand' : 'Collapse'} sidebar
            </span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
