import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  Gift,
  Calendar,
  Eye,
  Edit,
  Copy,
  CheckCircle,
  IndianRupee,
  Layers,
  Trash2,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useAdvancedSchemes,
  useDeleteAdvancedScheme,
  AdvancedScheme,
} from '@/hooks/useAdvancedSchemesData';

const schemeTypeColors: Record<string, string> = {
  slab: 'bg-primary/10 text-primary',
  buy_x_get_y: 'bg-success/10 text-success',
  combo: 'bg-secondary/10 text-secondary',
  bill_wise: 'bg-info/10 text-info',
  value_wise: 'bg-warning/10 text-warning',
  display: 'bg-destructive/10 text-destructive',
};

const schemeTypeLabels: Record<string, string> = {
  slab: 'Slab',
  buy_x_get_y: 'Buy X Get Y',
  combo: 'Combo',
  bill_wise: 'Bill-wise',
  value_wise: 'Value-wise',
  display: 'Display',
};

export default function AdvancedSchemesPage() {
  const navigate = useNavigate();
  const { data: schemes = [], isLoading } = useAdvancedSchemes();
  const deleteScheme = useDeleteAdvancedScheme();

  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredSchemes = selectedType === 'all' 
    ? schemes 
    : schemes.filter(s => s.type === selectedType);

  const stats = {
    activeSchemes: schemes.filter(s => s.status === 'active').length,
    totalClaims: schemes.reduce((sum, s) => sum + s.claims_generated, 0),
    approvedClaims: schemes.reduce((sum, s) => sum + s.claims_approved, 0),
    totalPayout: schemes.reduce((sum, s) => sum + Number(s.total_payout), 0),
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this scheme?')) {
      await deleteScheme.mutateAsync(id);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Scheme',
      render: (item: AdvancedScheme) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Gift size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: AdvancedScheme) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${schemeTypeColors[item.type] || 'bg-muted text-muted-foreground'}`}>
          {schemeTypeLabels[item.type] || item.type}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Benefit',
      render: (item: AdvancedScheme) => (
        <div className="max-w-[200px]">
          <p className="text-sm truncate">{item.description || '-'}</p>
          <p className="text-xs text-muted-foreground">{item.applicability}</p>
        </div>
      ),
    },
    {
      key: 'validity',
      header: 'Validity',
      render: (item: AdvancedScheme) => (
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-muted-foreground" />
          <span>
            {format(new Date(item.start_date), 'dd MMM')} - {format(new Date(item.end_date), 'dd MMM yyyy')}
          </span>
        </div>
      ),
    },
    {
      key: 'claims',
      header: 'Claims',
      render: (item: AdvancedScheme) => (
        <div className="text-sm">
          <p className="flex items-center gap-1">
            <CheckCircle size={12} className="text-success" />
            {item.claims_approved} approved
          </p>
          <p className="text-xs text-muted-foreground">{item.claims_generated} generated</p>
        </div>
      ),
    },
    {
      key: 'totalPayout',
      header: 'Payout',
      render: (item: AdvancedScheme) => (
        <span className="font-semibold text-primary">₹{(Number(item.total_payout) / 1000).toFixed(1)}K</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: AdvancedScheme) => <StatusBadge status={item.status as any} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: AdvancedScheme) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/master/schemes/view/${item.id}`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => navigate(`/master/schemes/edit/${item.id}`)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Copy size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Advanced Schemes Engine</h1>
          <p className="text-muted-foreground">Manage scheme types with auto-claim generation</p>
        </div>
        <button onClick={() => navigate('/master/schemes/new')} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Create Scheme
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Layers size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalClaims}</p>
              <p className="text-sm text-muted-foreground">Claims Generated</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <CheckCircle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.approvedClaims}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <IndianRupee size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{(stats.totalPayout / 100000).toFixed(1)}L</p>
              <p className="text-sm text-muted-foreground">Total Payout</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scheme Type Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedType === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          All Types
        </button>
        {Object.entries(schemeTypeLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedType(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Schemes Table */}
      {filteredSchemes.length > 0 ? (
        <DataTable data={filteredSchemes} columns={columns} searchPlaceholder="Search schemes..." />
      ) : (
        <div className="card p-12 text-center">
          <Gift size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Schemes Found</h3>
          <p className="text-muted-foreground mb-4">Create your first advanced scheme to get started</p>
          <button className="btn-primary" onClick={() => navigate('/master/schemes/new')}>
            <Plus size={18} className="mr-2" />
            Create Scheme
          </button>
        </div>
      )}
    </div>
  );
}
