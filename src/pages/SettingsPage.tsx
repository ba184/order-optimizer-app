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
  Receipt,
  CreditCard,
  Users,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PolicyDocumentUpload from '@/components/settings/PolicyDocumentUpload';

export default function SettingsPage() {
  const { profile } = useAuth();
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and configure system policies</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="expense" className="flex items-center gap-2">
            <Receipt size={16} />
            <span className="hidden sm:inline">Expense</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard size={16} />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="hr" className="flex items-center gap-2">
            <Users size={16} />
            <span className="hidden sm:inline">HR</span>
          </TabsTrigger>
          <TabsTrigger value="return" className="flex items-center gap-2">
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Return</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 max-w-3xl">
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
        </TabsContent>

        {/* Expense Policy Tab */}
        <TabsContent value="expense" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PolicyDocumentUpload
              policyType="expense"
              title="Expense & Allowance Policy"
              description="Upload your company's expense and allowance policy document (PDF or Word)"
              icon={<Receipt className="h-5 w-5 text-primary" />}
            />
          </motion.div>
        </TabsContent>

        {/* Payment Policy Tab */}
        <TabsContent value="payment" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PolicyDocumentUpload
              policyType="payment"
              title="Payment Policy"
              description="Upload your company's payment terms and credit policy document (PDF or Word)"
              icon={<CreditCard className="h-5 w-5 text-primary" />}
            />
          </motion.div>
        </TabsContent>

        {/* HR Policy Tab */}
        <TabsContent value="hr" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PolicyDocumentUpload
              policyType="hr"
              title="HR Policy"
              description="Upload your company's HR policy document covering leaves, attendance, and employee guidelines (PDF or Word)"
              icon={<Users className="h-5 w-5 text-primary" />}
            />
          </motion.div>
        </TabsContent>

        {/* Return Policy Tab */}
        <TabsContent value="return" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PolicyDocumentUpload
              policyType="return"
              title="Return Policy"
              description="Upload your company's return and refund policy document (PDF or Word)"
              icon={<RotateCcw className="h-5 w-5 text-primary" />}
            />
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
