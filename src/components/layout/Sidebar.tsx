import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingCart,
  Gift,
  BarChart3,
  Database,
  Settings,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  FileText,
  Target,
  UserPlus,
  Building2,
  Package,
  ClipboardList,
  Wallet,
  Box,
  Calendar,
  GraduationCap,
  Layers,
  Navigation,
  CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/types';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: { label: string; path: string; icon: React.ElementType }[];
  roles: UserRole[];
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['sales_executive', 'asm', 'rsm', 'admin'],
  },
  {
    label: 'Sales Team',
    icon: Users,
    roles: ['asm', 'rsm', 'admin'],
    children: [
      { label: 'Attendance', path: '/sales-team/attendance', icon: MapPin },
      { label: 'Beat Plans', path: '/sales-team/beat-plans', icon: Target },
      { label: 'Daily Reports', path: '/sales-team/dsr', icon: FileText },
      { label: 'Leads', path: '/sales-team/leads', icon: UserPlus },
      { label: 'Leave Management', path: '/sales-team/leaves', icon: CalendarDays },
      { label: 'Live Tracking', path: '/sales-team/tracking', icon: Navigation },
    ],
  },
  {
    label: 'My Work',
    icon: Users,
    roles: ['sales_executive'],
    children: [
      { label: 'My Attendance', path: '/my-work/attendance', icon: MapPin },
      { label: 'My Beat Plan', path: '/my-work/beat-plan', icon: Target },
      { label: 'Submit DSR', path: '/my-work/dsr', icon: FileText },
      { label: 'My Leads', path: '/my-work/leads', icon: UserPlus },
      { label: 'My Expenses', path: '/my-work/expenses', icon: Wallet },
    ],
  },
  {
    label: 'Outlets',
    icon: Store,
    roles: ['sales_executive', 'asm', 'rsm', 'admin'],
    children: [
      { label: 'Distributors', path: '/outlets/distributors', icon: Building2 },
      { label: 'Retailers', path: '/outlets/retailers', icon: Store },
    ],
  },
  {
    label: 'Orders',
    icon: ShoppingCart,
    roles: ['sales_executive', 'asm', 'rsm', 'admin'],
    children: [
      { label: 'All Orders', path: '/orders/list', icon: ClipboardList },
      { label: 'Pending Approval', path: '/orders/pending', icon: FileText },
      { label: 'Create Order', path: '/orders/new', icon: ShoppingCart },
      { label: 'Pre-Orders', path: '/pre-orders', icon: Calendar },
    ],
  },
  {
    label: 'Inventory',
    icon: Box,
    path: '/inventory',
    roles: ['asm', 'rsm', 'admin'],
  },
  {
    label: 'Schemes',
    icon: Gift,
    roles: ['sales_executive', 'asm', 'rsm', 'admin'],
    children: [
      { label: 'Active Schemes', path: '/schemes', icon: Gift },
      { label: 'Advanced Schemes', path: '/schemes/advanced', icon: Layers },
    ],
  },
  {
    label: 'Expenses',
    icon: Wallet,
    path: '/expenses',
    roles: ['asm', 'rsm', 'admin'],
  },
  {
    label: 'Samples & Gifts',
    icon: Gift,
    path: '/samples',
    roles: ['sales_executive', 'asm', 'rsm', 'admin'],
  },
  {
    label: 'Training',
    icon: GraduationCap,
    path: '/training',
    roles: ['sales_executive', 'asm', 'rsm', 'admin'],
  },
  {
    label: 'Reports',
    icon: BarChart3,
    path: '/reports',
    roles: ['asm', 'rsm', 'admin'],
  },
  {
    label: 'Master Data',
    icon: Database,
    roles: ['admin'],
    children: [
      { label: 'Products', path: '/master/products', icon: Package },
      { label: 'Schemes', path: '/master/schemes', icon: Gift },
      { label: 'Territories', path: '/master/territories', icon: MapPin },
      { label: 'Users', path: '/master/users', icon: Users },
      { label: 'Presentations', path: '/master/presentations', icon: GraduationCap },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    roles: ['admin'],
  },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const filteredItems = navigationItems.filter(
    item => user && item.roles.includes(user.role)
  );

  const isActive = (path: string) => location.pathname === path;
  const isParentActive = (children?: { path: string }[]) =>
    children?.some(child => location.pathname.startsWith(child.path));

  const roleLabels: Record<UserRole, string> = {
    sales_executive: 'Sales Executive',
    asm: 'Area Sales Manager',
    rsm: 'Regional Sales Manager',
    admin: 'Administrator',
  };

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      className="h-screen bg-sidebar flex flex-col border-r border-sidebar-border sticky top-0"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-xl font-bold text-sidebar-foreground">TOAGOSEI</h1>
              <p className="text-xs text-sidebar-foreground/60">Sales Automation</p>
            </motion.div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3">
        <ul className="space-y-1">
          {filteredItems.map(item => (
            <li key={item.label}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      'nav-item w-full justify-between',
                      isParentActive(item.children) && 'nav-item-active'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronDown
                        size={16}
                        className={cn(
                          'transition-transform',
                          expandedItems.includes(item.label) && 'rotate-180'
                        )}
                      />
                    )}
                  </button>
                  <AnimatePresence>
                    {!collapsed && expandedItems.includes(item.label) && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-4 mt-1 space-y-1"
                      >
                        {item.children.map(child => (
                          <li key={child.path}>
                            <NavLink
                              to={child.path}
                              className={cn(
                                'nav-item text-sm',
                                isActive(child.path) && 'nav-item-active'
                              )}
                            >
                              <child.icon size={16} />
                              <span>{child.label}</span>
                            </NavLink>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  to={item.path!}
                  className={cn(
                    'nav-item',
                    isActive(item.path!) && 'nav-item-active'
                  )}
                >
                  <item.icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && user && (
          <div className="mb-3">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {roleLabels[user.role]}
            </p>
            {user.geoHierarchy && (
              <p className="text-xs text-sidebar-foreground/40 truncate">
                {user.geoHierarchy.zone} • {user.geoHierarchy.city || user.geoHierarchy.state}
              </p>
            )}
          </div>
        )}
        <button
          onClick={logout}
          className="nav-item w-full text-destructive hover:bg-destructive/10"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}