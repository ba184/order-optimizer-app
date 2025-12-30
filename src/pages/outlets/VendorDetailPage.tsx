import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Truck,
  MapPin,
  Phone,
  Mail,
  IndianRupee,
  Edit,
  Calendar,
  User,
  FileText,
  Building2,
} from 'lucide-react';
import { useVendor } from '@/hooks/useVendorsData';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const businessTypeLabels: Record<string, string> = {
  supplier: 'Supplier',
  manufacturer: 'Manufacturer',
  wholesaler: 'Wholesaler',
  importer: 'Importer',
};

export default function VendorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  const { data: vendor, isLoading } = useVendor(id || '');

  const formatCurrency = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Vendor not found</p>
        <button onClick={() => navigate('/outlets/vendors')} className="btn-primary">
          Back to Vendors
        </button>
      </div>
    );
  }

  const creditLimit = Number(vendor.credit_limit) || 0;
  const outstandingAmount = Number(vendor.outstanding_amount) || 0;
  const creditUtilization = creditLimit > 0 ? (outstandingAmount / creditLimit) * 100 : 0;
  const availableCredit = creditLimit - outstandingAmount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{vendor.firm_name}</h1>
              <p className="text-muted-foreground">{vendor.vendor_code}</p>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
          vendor.status === 'active' 
            ? 'bg-success/10 text-success border-success/20' 
            : 'bg-muted text-muted-foreground border-muted'
        }`}>
          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
        </span>
        {isAdmin && (
          <button 
            onClick={() => navigate(`/outlets/vendors/${id}/edit`)}
            className="btn-outline flex items-center gap-2"
          >
            <Edit size={16} />
            Edit
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <IndianRupee size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(creditLimit)}</p>
              <p className="text-xs text-muted-foreground">Credit Limit</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <IndianRupee size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(outstandingAmount)}</p>
              <p className="text-xs text-muted-foreground">Outstanding</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <IndianRupee size={20} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(availableCredit)}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Calendar size={20} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{vendor.credit_days}</p>
              <p className="text-xs text-muted-foreground">Credit Days</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Business Information */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-primary" />
            Business Information
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendor Code</span>
              <span className="font-medium text-foreground">{vendor.vendor_code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Business Type</span>
              <span className="font-medium text-foreground">{businessTypeLabels[vendor.business_type] || vendor.business_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GSTIN</span>
              <span className="font-medium text-foreground">{vendor.gstin || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PAN</span>
              <span className="font-medium text-foreground">{vendor.pan || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Since</span>
              <span className="font-medium text-foreground">{formatDate(vendor.since_date)}</span>
            </div>
          </div>
        </motion.div>

        {/* Contact & Location */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User size={18} className="text-primary" />
            Contact & Location
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <User size={16} className="text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground">{vendor.contact_person}</p>
                <p className="text-sm text-muted-foreground">Contact Person</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-muted-foreground" />
              <div>
                <span className="text-foreground">{vendor.contact_number}</span>
                {vendor.alternate_number && (
                  <span className="text-muted-foreground ml-2">/ {vendor.alternate_number}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-muted-foreground" />
              <span className="text-foreground">{vendor.email}</span>
            </div>
            <div className="flex items-start gap-3 pt-2 border-t border-border">
              <MapPin size={16} className="text-muted-foreground mt-1" />
              <div>
                <p className="font-medium text-foreground">{vendor.address}</p>
                <p className="text-sm text-muted-foreground">{vendor.city}, {vendor.state}</p>
                {vendor.zone && <p className="text-sm text-muted-foreground">Zone: {vendor.zone}</p>}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Credit Utilization */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <IndianRupee size={18} className="text-primary" />
            Credit Utilization
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Used</span>
              <span className="text-foreground">{formatCurrency(outstandingAmount)} / {formatCurrency(creditLimit)}</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  creditUtilization > 80 ? 'bg-destructive' : creditUtilization > 50 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${Math.min(creditUtilization, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Utilization</span>
              <span className={`font-medium ${
                creditUtilization > 80 ? 'text-destructive' : creditUtilization > 50 ? 'text-warning' : 'text-success'
              }`}>
                {creditUtilization.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Available Credit: <span className="text-success font-medium">{formatCurrency(availableCredit)}</span>
            </p>
          </div>
        </motion.div>

        {/* Assigned Manager */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User size={18} className="text-primary" />
            Assigned Team
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purchase Manager</span>
              <span className="font-medium text-foreground">
                {vendor.assigned_manager?.name || 'Not Assigned'}
              </span>
            </div>
            {vendor.assigned_manager?.email && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground">{vendor.assigned_manager.email}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Future Integration Placeholder */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
        className="bg-card rounded-xl border border-border p-6 shadow-sm"
      >
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          Purchase History & Documents
        </h3>
        <p className="text-muted-foreground text-sm">
          Purchase orders, GRN history, and document attachments will be available here once integrated with the Purchase Order module.
        </p>
      </motion.div>
    </div>
  );
}
