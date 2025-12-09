import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import {
  Users,
  MapPin,
  BarChart3,
  Shield,
  CreditCard,
  Building2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const roles: { value: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'sales_executive', label: 'Sales Executive', icon: Users, description: 'Field sales operations' },
  { value: 'asm', label: 'Area Sales Manager', icon: MapPin, description: 'Area management & team' },
  { value: 'rsm', label: 'Regional Sales Manager', icon: BarChart3, description: 'Regional oversight' },
  { value: 'admin', label: 'Admin / Back Office', icon: Shield, description: 'Full system access' },
  { value: 'credit_team', label: 'Credit Team', icon: CreditCard, description: 'Credit management' },
  { value: 'distributor', label: 'Distributor Portal', icon: Building2, description: 'Self-service portal' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('sales_executive');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    setIsLoading(true);
    const success = await login(email, password, selectedRole);
    setIsLoading(false);

    if (success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl bg-card rounded-2xl shadow-xl overflow-hidden border border-border"
      >
        <div className="grid md:grid-cols-2">
          {/* Left Panel - Branding */}
          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 md:p-12 flex flex-col justify-center text-primary-foreground">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                SalesForce<br />Automation Suite
              </h1>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Complete sales force automation with geo-tracking, order management, and real-time analytics.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Geo-Fenced Attendance</p>
                    <p className="text-sm text-primary-foreground/70">Real-time location tracking</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Live Analytics</p>
                    <p className="text-sm text-primary-foreground/70">21+ customizable reports</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="font-medium">Secure & Compliant</p>
                    <p className="text-sm text-primary-foreground/70">Role-based access control</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Login Form */}
          <div className="p-8 md:p-12">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
              <p className="text-muted-foreground mb-6">Select your role and sign in to continue</p>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map(role => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => setSelectedRole(role.value)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selectedRole === role.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <role.icon
                          size={20}
                          className={selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'}
                        />
                        <p className={`text-sm font-medium mt-1 ${
                          selectedRole === role.value ? 'text-primary' : 'text-foreground'
                        }`}>
                          {role.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input-field"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <p className="text-center text-sm text-muted-foreground">
                  Demo: Use any email and password (4+ chars)
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
