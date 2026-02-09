import { Bell, Search, User, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const roleLabels: Record<string, string> = {
  sales_executive: 'Sales Executive',
  manager: 'Manager',
  admin: 'Administrator',
  warehouse_manager: 'Warehouse Manager',
};

export function Header() {
  const { profile, userRole } = useAuth();

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search orders, retailers, products..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Region Badge */}
        {profile?.region && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
            <MapPin size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">
              {profile.region} {profile.territory && `• ${profile.territory}`}
            </span>
          </div>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell size={20} className="text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* User Info */}
        {profile && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">{profile.name}</p>
              <p className="text-xs text-muted-foreground">
                {userRole ? roleLabels[userRole] || userRole : 'User'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <User size={20} className="text-primary-foreground" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
