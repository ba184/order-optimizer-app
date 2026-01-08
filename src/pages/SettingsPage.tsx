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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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

  // Expense Policy Settings
  const [expensePolicy, setExpensePolicy] = useState({
    maxDailyAllowance: 1500,
    maxHotelPerNight: 3000,
    fuelRatePerKm: 12,
    requireBillAbove: 500,
    autoApproveBelow: 1000,
    approvalRequired: true,
    multiLevelApproval: true,
    maxClaimDays: 30,
  });

  // Payment Policy Settings
  const [paymentPolicy, setPaymentPolicy] = useState({
    defaultPaymentTerms: '30',
    maxCreditLimit: 500000,
    creditCheckRequired: true,
    autoBlockOverdue: true,
    overdueGraceDays: 7,
    interestOnOverdue: 1.5,
    partialPaymentAllowed: true,
    advancePaymentDiscount: 2,
  });

  // HR Policy Settings
  const [hrPolicy, setHrPolicy] = useState({
    casualLeavePerYear: 12,
    sickLeavePerYear: 10,
    earnedLeavePerYear: 15,
    maxConsecutiveLeave: 5,
    leaveApprovalRequired: true,
    attendanceGracePeriod: 15,
    halfDayHours: 4,
    fullDayHours: 8,
    weeklyOffDays: '0,6',
  });

  // Return Policy Settings
  const [returnPolicy, setReturnPolicy] = useState({
    returnWindowDays: 30,
    approvalRequired: true,
    maxReturnPercentage: 20,
    restockingFee: 5,
    qualityCheckRequired: true,
    refundProcessDays: 7,
    exchangeAllowed: true,
    damagedGoodsAccepted: false,
  });

  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  const handlePolicySave = (policyType: string) => {
    toast.success(`${policyType} policy updated successfully`);
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Expense Policy Settings
                </CardTitle>
                <CardDescription>
                  Configure expense claim limits, approval workflows, and allowance rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxDailyAllowance">Max Daily Allowance (₹)</Label>
                    <Input
                      id="maxDailyAllowance"
                      type="number"
                      value={expensePolicy.maxDailyAllowance}
                      onChange={(e) => setExpensePolicy({ ...expensePolicy, maxDailyAllowance: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxHotelPerNight">Max Hotel Per Night (₹)</Label>
                    <Input
                      id="maxHotelPerNight"
                      type="number"
                      value={expensePolicy.maxHotelPerNight}
                      onChange={(e) => setExpensePolicy({ ...expensePolicy, maxHotelPerNight: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fuelRatePerKm">Fuel Rate Per Km (₹)</Label>
                    <Input
                      id="fuelRatePerKm"
                      type="number"
                      value={expensePolicy.fuelRatePerKm}
                      onChange={(e) => setExpensePolicy({ ...expensePolicy, fuelRatePerKm: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requireBillAbove">Require Bill Above (₹)</Label>
                    <Input
                      id="requireBillAbove"
                      type="number"
                      value={expensePolicy.requireBillAbove}
                      onChange={(e) => setExpensePolicy({ ...expensePolicy, requireBillAbove: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="autoApproveBelow">Auto-Approve Below (₹)</Label>
                    <Input
                      id="autoApproveBelow"
                      type="number"
                      value={expensePolicy.autoApproveBelow}
                      onChange={(e) => setExpensePolicy({ ...expensePolicy, autoApproveBelow: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxClaimDays">Max Claim Days</Label>
                    <Input
                      id="maxClaimDays"
                      type="number"
                      value={expensePolicy.maxClaimDays}
                      onChange={(e) => setExpensePolicy({ ...expensePolicy, maxClaimDays: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Approval Required</Label>
                      <p className="text-sm text-muted-foreground">Require manager approval for expenses</p>
                    </div>
                    <Switch
                      checked={expensePolicy.approvalRequired}
                      onCheckedChange={(checked) => setExpensePolicy({ ...expensePolicy, approvalRequired: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Multi-Level Approval</Label>
                      <p className="text-sm text-muted-foreground">Enable hierarchical approval workflow</p>
                    </div>
                    <Switch
                      checked={expensePolicy.multiLevelApproval}
                      onCheckedChange={(checked) => setExpensePolicy({ ...expensePolicy, multiLevelApproval: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => handlePolicySave('Expense')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Expense Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Payment Policy Tab */}
        <TabsContent value="payment" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Payment Policy Settings
                </CardTitle>
                <CardDescription>
                  Configure payment terms, credit limits, and overdue handling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="defaultPaymentTerms">Default Payment Terms</Label>
                    <Select
                      value={paymentPolicy.defaultPaymentTerms}
                      onValueChange={(value) => setPaymentPolicy({ ...paymentPolicy, defaultPaymentTerms: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Net 7 Days</SelectItem>
                        <SelectItem value="15">Net 15 Days</SelectItem>
                        <SelectItem value="30">Net 30 Days</SelectItem>
                        <SelectItem value="45">Net 45 Days</SelectItem>
                        <SelectItem value="60">Net 60 Days</SelectItem>
                        <SelectItem value="90">Net 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxCreditLimit">Max Credit Limit (₹)</Label>
                    <Input
                      id="maxCreditLimit"
                      type="number"
                      value={paymentPolicy.maxCreditLimit}
                      onChange={(e) => setPaymentPolicy({ ...paymentPolicy, maxCreditLimit: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="overdueGraceDays">Overdue Grace Days</Label>
                    <Input
                      id="overdueGraceDays"
                      type="number"
                      value={paymentPolicy.overdueGraceDays}
                      onChange={(e) => setPaymentPolicy({ ...paymentPolicy, overdueGraceDays: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestOnOverdue">Interest on Overdue (%)</Label>
                    <Input
                      id="interestOnOverdue"
                      type="number"
                      step="0.1"
                      value={paymentPolicy.interestOnOverdue}
                      onChange={(e) => setPaymentPolicy({ ...paymentPolicy, interestOnOverdue: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="advancePaymentDiscount">Advance Payment Discount (%)</Label>
                    <Input
                      id="advancePaymentDiscount"
                      type="number"
                      step="0.1"
                      value={paymentPolicy.advancePaymentDiscount}
                      onChange={(e) => setPaymentPolicy({ ...paymentPolicy, advancePaymentDiscount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Credit Check Required</Label>
                      <p className="text-sm text-muted-foreground">Verify credit before order placement</p>
                    </div>
                    <Switch
                      checked={paymentPolicy.creditCheckRequired}
                      onCheckedChange={(checked) => setPaymentPolicy({ ...paymentPolicy, creditCheckRequired: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-Block Overdue</Label>
                      <p className="text-sm text-muted-foreground">Block orders for overdue accounts</p>
                    </div>
                    <Switch
                      checked={paymentPolicy.autoBlockOverdue}
                      onCheckedChange={(checked) => setPaymentPolicy({ ...paymentPolicy, autoBlockOverdue: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Partial Payment Allowed</Label>
                      <p className="text-sm text-muted-foreground">Allow partial invoice payments</p>
                    </div>
                    <Switch
                      checked={paymentPolicy.partialPaymentAllowed}
                      onCheckedChange={(checked) => setPaymentPolicy({ ...paymentPolicy, partialPaymentAllowed: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => handlePolicySave('Payment')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Payment Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* HR Policy Tab */}
        <TabsContent value="hr" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  HR Policy Settings
                </CardTitle>
                <CardDescription>
                  Configure leave entitlements, attendance rules, and work hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-foreground mb-4">Leave Entitlements (Per Year)</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="casualLeavePerYear">Casual Leave</Label>
                      <Input
                        id="casualLeavePerYear"
                        type="number"
                        value={hrPolicy.casualLeavePerYear}
                        onChange={(e) => setHrPolicy({ ...hrPolicy, casualLeavePerYear: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sickLeavePerYear">Sick Leave</Label>
                      <Input
                        id="sickLeavePerYear"
                        type="number"
                        value={hrPolicy.sickLeavePerYear}
                        onChange={(e) => setHrPolicy({ ...hrPolicy, sickLeavePerYear: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="earnedLeavePerYear">Earned Leave</Label>
                      <Input
                        id="earnedLeavePerYear"
                        type="number"
                        value={hrPolicy.earnedLeavePerYear}
                        onChange={(e) => setHrPolicy({ ...hrPolicy, earnedLeavePerYear: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxConsecutiveLeave">Max Consecutive Days</Label>
                      <Input
                        id="maxConsecutiveLeave"
                        type="number"
                        value={hrPolicy.maxConsecutiveLeave}
                        onChange={(e) => setHrPolicy({ ...hrPolicy, maxConsecutiveLeave: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-4">Attendance Settings</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="attendanceGracePeriod">Grace Period (mins)</Label>
                      <Input
                        id="attendanceGracePeriod"
                        type="number"
                        value={hrPolicy.attendanceGracePeriod}
                        onChange={(e) => setHrPolicy({ ...hrPolicy, attendanceGracePeriod: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="halfDayHours">Half Day Hours</Label>
                      <Input
                        id="halfDayHours"
                        type="number"
                        value={hrPolicy.halfDayHours}
                        onChange={(e) => setHrPolicy({ ...hrPolicy, halfDayHours: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullDayHours">Full Day Hours</Label>
                      <Input
                        id="fullDayHours"
                        type="number"
                        value={hrPolicy.fullDayHours}
                        onChange={(e) => setHrPolicy({ ...hrPolicy, fullDayHours: Number(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weeklyOffDays">Weekly Off Days</Label>
                      <Select
                        value={hrPolicy.weeklyOffDays}
                        onValueChange={(value) => setHrPolicy({ ...hrPolicy, weeklyOffDays: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sunday Only</SelectItem>
                          <SelectItem value="0,6">Sat & Sun</SelectItem>
                          <SelectItem value="5,6">Fri & Sat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Leave Approval Required</Label>
                      <p className="text-sm text-muted-foreground">Require manager approval for leaves</p>
                    </div>
                    <Switch
                      checked={hrPolicy.leaveApprovalRequired}
                      onCheckedChange={(checked) => setHrPolicy({ ...hrPolicy, leaveApprovalRequired: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => handlePolicySave('HR')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save HR Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Return Policy Tab */}
        <TabsContent value="return" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-primary" />
                  Return Policy Settings
                </CardTitle>
                <CardDescription>
                  Configure return windows, approval requirements, and refund processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="returnWindowDays">Return Window (Days)</Label>
                    <Input
                      id="returnWindowDays"
                      type="number"
                      value={returnPolicy.returnWindowDays}
                      onChange={(e) => setReturnPolicy({ ...returnPolicy, returnWindowDays: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxReturnPercentage">Max Return % of Order</Label>
                    <Input
                      id="maxReturnPercentage"
                      type="number"
                      value={returnPolicy.maxReturnPercentage}
                      onChange={(e) => setReturnPolicy({ ...returnPolicy, maxReturnPercentage: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restockingFee">Restocking Fee (%)</Label>
                    <Input
                      id="restockingFee"
                      type="number"
                      value={returnPolicy.restockingFee}
                      onChange={(e) => setReturnPolicy({ ...returnPolicy, restockingFee: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refundProcessDays">Refund Process Days</Label>
                    <Input
                      id="refundProcessDays"
                      type="number"
                      value={returnPolicy.refundProcessDays}
                      onChange={(e) => setReturnPolicy({ ...returnPolicy, refundProcessDays: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Approval Required</Label>
                      <p className="text-sm text-muted-foreground">Require approval for return requests</p>
                    </div>
                    <Switch
                      checked={returnPolicy.approvalRequired}
                      onCheckedChange={(checked) => setReturnPolicy({ ...returnPolicy, approvalRequired: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Quality Check Required</Label>
                      <p className="text-sm text-muted-foreground">Inspect items before processing return</p>
                    </div>
                    <Switch
                      checked={returnPolicy.qualityCheckRequired}
                      onCheckedChange={(checked) => setReturnPolicy({ ...returnPolicy, qualityCheckRequired: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Exchange Allowed</Label>
                      <p className="text-sm text-muted-foreground">Allow product exchange instead of refund</p>
                    </div>
                    <Switch
                      checked={returnPolicy.exchangeAllowed}
                      onCheckedChange={(checked) => setReturnPolicy({ ...returnPolicy, exchangeAllowed: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Damaged Goods Accepted</Label>
                      <p className="text-sm text-muted-foreground">Accept returns for damaged items</p>
                    </div>
                    <Switch
                      checked={returnPolicy.damagedGoodsAccepted}
                      onCheckedChange={(checked) => setReturnPolicy({ ...returnPolicy, damagedGoodsAccepted: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={() => handlePolicySave('Return')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Return Policy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
