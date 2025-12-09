import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  MapPin,
  Globe,
  Building,
  Map,
  Edit,
  Trash2,
  Eye,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

type GeoType = 'country' | 'state' | 'city';

interface GeoRecord {
  id: string;
  name: string;
  code: string;
  type: GeoType;
  parent?: string;
  zones?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

const mockGeoData: GeoRecord[] = [
  { id: 'c-001', name: 'India', code: 'IN', type: 'country', zones: 'North, South, East, West', status: 'active', createdAt: '2024-01-01' },
  { id: 's-001', name: 'Delhi NCR', code: 'DL', type: 'state', parent: 'India', zones: 'North Zone', status: 'active', createdAt: '2024-01-01' },
  { id: 's-002', name: 'Maharashtra', code: 'MH', type: 'state', parent: 'India', zones: 'West Zone', status: 'active', createdAt: '2024-01-01' },
  { id: 's-003', name: 'Karnataka', code: 'KA', type: 'state', parent: 'India', zones: 'South Zone', status: 'active', createdAt: '2024-01-01' },
  { id: 's-004', name: 'West Bengal', code: 'WB', type: 'state', parent: 'India', zones: 'East Zone', status: 'active', createdAt: '2024-01-01' },
  { id: 'ct-001', name: 'New Delhi', code: 'NDL', type: 'city', parent: 'Delhi NCR', status: 'active', createdAt: '2024-01-01' },
  { id: 'ct-002', name: 'Mumbai', code: 'MUM', type: 'city', parent: 'Maharashtra', status: 'active', createdAt: '2024-01-01' },
  { id: 'ct-003', name: 'Bangalore', code: 'BLR', type: 'city', parent: 'Karnataka', status: 'active', createdAt: '2024-01-01' },
  { id: 'ct-004', name: 'Kolkata', code: 'KOL', type: 'city', parent: 'West Bengal', status: 'active', createdAt: '2024-01-01' },
  { id: 'ct-005', name: 'Pune', code: 'PUN', type: 'city', parent: 'Maharashtra', status: 'active', createdAt: '2024-01-01' },
  { id: 'ct-006', name: 'Gurgaon', code: 'GGN', type: 'city', parent: 'Delhi NCR', status: 'active', createdAt: '2024-01-01' },
  { id: 'ct-007', name: 'Noida', code: 'NOI', type: 'city', parent: 'Delhi NCR', status: 'active', createdAt: '2024-01-01' },
];

const typeLabels: Record<GeoType, string> = {
  country: 'Country',
  state: 'State',
  city: 'City',
};

const typeIcons: Record<GeoType, React.ElementType> = {
  country: Globe,
  state: Map,
  city: Building,
};

const typeColors: Record<GeoType, string> = {
  country: 'bg-primary/10 text-primary',
  state: 'bg-secondary/10 text-secondary',
  city: 'bg-info/10 text-info',
};

export default function GeoMasterPage() {
  const [typeFilter, setTypeFilter] = useState<GeoType | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState<GeoRecord | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'city' as GeoType,
    parent: '',
    zones: '',
  });

  const filteredData = typeFilter === 'all' 
    ? mockGeoData 
    : mockGeoData.filter(g => g.type === typeFilter);

  const stats = {
    countries: mockGeoData.filter(g => g.type === 'country').length,
    states: mockGeoData.filter(g => g.type === 'state').length,
    cities: mockGeoData.filter(g => g.type === 'city').length,
  };

  const handleCreate = () => {
    if (!formData.name || !formData.code) {
      toast.error('Please fill required fields');
      return;
    }
    toast.success(`${typeLabels[formData.type]} created successfully`);
    setShowCreateModal(false);
    setFormData({ name: '', code: '', type: 'city', parent: '', zones: '' });
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (item: GeoRecord) => {
        const Icon = typeIcons[item.type];
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeColors[item.type]}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.code}</p>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'type',
      header: 'Type',
      render: (item: GeoRecord) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[item.type]}`}>
          {typeLabels[item.type]}
        </span>
      ),
    },
    {
      key: 'parent',
      header: 'Parent',
      render: (item: GeoRecord) => (
        <span className="text-sm">{item.parent || '-'}</span>
      ),
    },
    {
      key: 'zones',
      header: 'Zones',
      render: (item: GeoRecord) => (
        <span className="text-sm text-muted-foreground">{item.zones || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: GeoRecord) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: GeoRecord) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setShowViewModal(item)} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Geographical Master</h1>
          <p className="text-muted-foreground">Manage countries, states, and cities</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Location
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`stat-card cursor-pointer ${typeFilter === 'country' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setTypeFilter(typeFilter === 'country' ? 'all' : 'country')}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Globe size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.countries}</p>
              <p className="text-sm text-muted-foreground">Countries</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`stat-card cursor-pointer ${typeFilter === 'state' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setTypeFilter(typeFilter === 'state' ? 'all' : 'state')}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Map size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.states}</p>
              <p className="text-sm text-muted-foreground">States</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`stat-card cursor-pointer ${typeFilter === 'city' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setTypeFilter(typeFilter === 'city' ? 'all' : 'city')}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Building size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.cities}</p>
              <p className="text-sm text-muted-foreground">Cities</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Table */}
      <DataTable data={filteredData} columns={columns} searchPlaceholder="Search locations..." />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Add Location</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as GeoType })}
                  className="input-field"
                >
                  <option value="country">Country</option>
                  <option value="state">State</option>
                  <option value="city">City</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., IN, DL"
                    className="input-field"
                  />
                </div>
              </div>

              {formData.type !== 'country' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Parent</label>
                  <select
                    value={formData.parent}
                    onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select parent</option>
                    {formData.type === 'state' && 
                      mockGeoData.filter(g => g.type === 'country').map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))
                    }
                    {formData.type === 'city' && 
                      mockGeoData.filter(g => g.type === 'state').map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))
                    }
                  </select>
                </div>
              )}

              {formData.type !== 'city' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Zones</label>
                  <input
                    type="text"
                    value={formData.zones}
                    onChange={(e) => setFormData({ ...formData, zones: e.target.value })}
                    placeholder="North, South, East, West"
                    className="input-field"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleCreate} className="btn-primary">Create</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Location Details</h2>
              <button onClick={() => setShowViewModal(null)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${typeColors[showViewModal.type]}`}>
                  {(() => { const Icon = typeIcons[showViewModal.type]; return <Icon size={24} />; })()}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{showViewModal.name}</h3>
                  <p className="text-sm text-muted-foreground">{showViewModal.code}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{typeLabels[showViewModal.type]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="mt-1"><StatusBadge status={showViewModal.status} /></div>
                </div>
                {showViewModal.parent && (
                  <div>
                    <p className="text-sm text-muted-foreground">Parent</p>
                    <p className="font-medium">{showViewModal.parent}</p>
                  </div>
                )}
                {showViewModal.zones && (
                  <div>
                    <p className="text-sm text-muted-foreground">Zones</p>
                    <p className="font-medium">{showViewModal.zones}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowViewModal(null)} className="btn-outline">Close</button>
              <button className="btn-primary">Edit</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}