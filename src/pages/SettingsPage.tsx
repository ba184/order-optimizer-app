import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Save,
  Camera,
  FileText,
  Receipt,
  CreditCard,
  Users,
  RotateCcw,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import PolicyDocumentUpload from '@/components/settings/PolicyDocumentUpload';

type SettingsSection = 'profile' | 'expense' | 'payment' | 'hr' | 'return';

const settingsMenu = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    isSubmodule: false,
  },
  {
    id: 'policy',
    label: 'Policy',
    icon: FileText,
    isSubmodule: true,
    children: [
      { id: 'expense', label: 'Expense & Allowance', icon: Receipt },
      { id: 'payment', label: 'Payment', icon: CreditCard },
      { id: 'hr', label: 'HR', icon: Users },
      { id: 'return', label: 'Return', icon: RotateCcw },
    ],
  },
];

export default function SettingsPage() {
  const { profile } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [openSubmodules, setOpenSubmodules] = useState<string[]>(['policy']);
  const [formData, setFormData] = useState({
    name: profile?.name || 'Admin User',
    email: profile?.email || 'admin@toagosei.com',
    phone: profile?.phone || '+91 98765 00000',
    designation: 'System Administrator',
    department: 'IT & Operations',
    address: 'Corporate Office, New Delhi',
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const toggleSubmodule = (id: string) => {
    setOpenSubmodules((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderContent = () => {
    if (activeSection === 'profile') {
      return (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-start gap-6 mb-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={40} className="text-primary" />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-primary-foreground shadow-lg hover:opacity-90 transition-opacity">
                  <Camera size={16} />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{formData.name}</h2>
                <p className="text-muted-foreground">{formData.designation}</p>
                <p className="text-sm text-muted-foreground mt-1">{formData.department}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Profile Information
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <User size={14} className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Mail size={14} className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Phone size={14} className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Building size={14} className="inline mr-2" />
                    Designation
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <Building size={14} className="inline mr-2" />
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <MapPin size={14} className="inline mr-2" />
                    Office Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>

          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Company Information</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Company Name</p>
                <p className="font-medium text-foreground">TOAGOSEI India Pvt. Ltd.</p>
              </div>
              <div>
                <p className="text-muted-foreground">Industry</p>
                <p className="font-medium text-foreground">Manufacturing & Distribution</p>
              </div>
              <div>
                <p className="text-muted-foreground">Headquarters</p>
                <p className="font-medium text-foreground">New Delhi, India</p>
              </div>
              <div>
                <p className="text-muted-foreground">Active Since</p>
                <p className="font-medium text-foreground">January 2024</p>
              </div>
            </div>
          </motion.div>
        </>
      );
    }

    // Policy sections
    const policyConfig: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
      expense: {
        title: 'Expense & Allowance Policy',
        description: "Upload your company's expense and allowance policy document (PDF or Word)",
        icon: <Receipt className="h-5 w-5 text-primary" />,
      },
      payment: {
        title: 'Payment Policy',
        description: "Upload your company's payment terms and credit policy document (PDF or Word)",
        icon: <CreditCard className="h-5 w-5 text-primary" />,
      },
      hr: {
        title: 'HR Policy',
        description: "Upload your company's HR policy document covering leaves, attendance, and employee guidelines (PDF or Word)",
        icon: <Users className="h-5 w-5 text-primary" />,
      },
      return: {
        title: 'Return Policy',
        description: "Upload your company's return and refund policy document (PDF or Word)",
        icon: <RotateCcw className="h-5 w-5 text-primary" />,
      },
    };

    const config = policyConfig[activeSection];
    if (!config) return null;

    return (
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PolicyDocumentUpload
          policyType={activeSection}
          title={config.title}
          description={config.description}
          icon={config.icon}
        />
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and configure system policies</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 shrink-0">
          <div className="bg-sidebar rounded-xl border border-border overflow-hidden">
            <div className="p-3 border-b border-border bg-sidebar-accent/50">
              <div className="flex items-center gap-2 text-sidebar-foreground font-medium">
                <Settings size={18} />
                <span>Settings Menu</span>
              </div>
            </div>
            <nav className="p-2">
              {settingsMenu.map((item) => {
                if (item.isSubmodule && item.children) {
                  const isOpen = openSubmodules.includes(item.id);
                  const hasActiveChild = item.children.some(
                    (child) => child.id === activeSection
                  );

                  return (
                    <Collapsible
                      key={item.id}
                      open={isOpen}
                      onOpenChange={() => toggleSubmodule(item.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            hasActiveChild
                              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon size={18} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronDown
                            size={16}
                            className={cn(
                              'transition-transform duration-200',
                              isOpen && 'rotate-180'
                            )}
                          />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => setActiveSection(child.id as SettingsSection)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                              activeSection === child.id
                                ? 'bg-primary text-primary-foreground'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                            )}
                          >
                            <child.icon size={16} />
                            <span>{child.label}</span>
                          </button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as SettingsSection)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      activeSection === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    )}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">{renderContent()}</div>
      </div>
    </div>
  );
}
