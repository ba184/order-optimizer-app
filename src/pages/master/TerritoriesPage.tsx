import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import {
  Plus,
  MapPin,
  Globe,
  Building,
  Map,
  Navigation,
  Edit,
  Trash2,
  User,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface Territory {
  id: string;
  name: string;
  type: 'country' | 'state' | 'zone' | 'city' | 'area';
  parentId?: string;
  parentName?: string;
  managerId?: string;
  managerName?: string;
  distributors: number;
  retailers: number;
  employees: number;
}

const mockTerritories: Territory[] = [
  { id: 't-001', name: 'India', type: 'country', distributors: 250, retailers: 5000, employees: 150 },
  { id: 't-002', name: 'Delhi', type: 'state', parentId: 't-001', parentName: 'India', managerId: 'rsm-001', managerName: 'Vikram Singh', distributors: 45, retailers: 850, employees: 25 },
  { id: 't-003', name: 'North Zone', type: 'zone', parentId: 't-002', parentName: 'Delhi', managerId: 'asm-001', managerName: 'Priya Sharma', distributors: 15, retailers: 320, employees: 8 },
  { id: 't-004', name: 'New Delhi', type: 'city', parentId: 't-003', parentName: 'North Zone', distributors: 8, retailers: 180, employees: 4 },
  { id: 't-005', name: 'Connaught Place', type: 'area', parentId: 't-004', parentName: 'New Delhi', managerId: 'se-001', managerName: 'Rajesh Kumar', distributors: 3, retailers: 45, employees: 1 },
  { id: 't-006', name: 'Karol Bagh', type: 'area', parentId: 't-004', parentName: 'New Delhi', managerId: 'se-002', managerName: 'Amit Sharma', distributors: 2, retailers: 38, employees: 1 },
  { id: 't-007', name: 'South Zone', type: 'zone', parentId: 't-002', parentName: 'Delhi', managerId: 'asm-002', managerName: 'Rahul Mehta', distributors: 12, retailers: 280, employees: 6 },
  { id: 't-008', name: 'Maharashtra', type: 'state', parentId: 't-001', parentName: 'India', distributors: 65, retailers: 1200, employees: 35 },
];

const typeIcons = {
  country: Globe,
  state: Map,
  zone: Navigation,
  city: Building,
  area: MapPin,
};

const typeColors = {
  country: 'bg-primary/10 text-primary',
  state: 'bg-secondary/10 text-secondary',
  zone: 'bg-success/10 text-success',
  city: 'bg-warning/10 text-warning',
  area: 'bg-info/10 text-info',
};

export default function TerritoriesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [formData, setFormData] = useState({
    name: '',
    type: 'state',
    parentId: '',
    managerId: '',
  });

  const filteredTerritories = selectedType === 'all' 
    ? mockTerritories 
    : mockTerritories.filter(t => t.type === selectedType);

  const handleCreate = () => {
    if (!formData.name || !formData.type) {
      toast.error('Please fill required fields');
      return;
    }
    toast.success('Territory created successfully');
    setShowCreateModal(false);
    setFormData({ name: '', type: 'state', parentId: '', managerId: '' });
  };

  const columns = [
    {
      key: 'name',
      header: 'Territory',
      render: (item: Territory) => {
        const TypeIcon = typeIcons[item.type];
        return (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[item.type]}`}>
              <TypeIcon size={20} />
            </div>
            <div>
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'hierarchy',
      header: 'Hierarchy',
      render: (item: Territory) => (
        item.parentName ? (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>{item.parentName}</span>
            <ChevronRight size={14} />
            <span className="text-foreground">{item.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Root Level</span>
        )
      ),
    },
    {
      key: 'manager',
      header: 'Manager',
      render: (item: Territory) => (
        item.managerName ? (
          <div className="flex items-center gap-2">
            <User size={14} className="text-muted-foreground" />
            <span>{item.managerName}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      ),
    },
    {
      key: 'distributors',
      header: 'Distributors',
      render: (item: Territory) => <span className="font-medium">{item.distributors}</span>,
      sortable: true,
    },
    {
      key: 'retailers',
      header: 'Retailers',
      render: (item: Territory) => <span className="font-medium">{item.retailers}</span>,
      sortable: true,
    },
    {
      key: 'employees',
      header: 'Employees',
      render: (item: Territory) => <span className="font-medium">{item.employees}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Territory) => (
        <div className="flex items-center gap-1">
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

  const stats = {
    countries: mockTerritories.filter(t => t.type === 'country').length,
    states: mockTerritories.filter(t => t.type === 'state').length,
    zones: mockTerritories.filter(t => t.type === 'zone').length,
    cities: mockTerritories.filter(t => t.type === 'city').length,
    areas: mockTerritories.filter(t => t.type === 'area').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Territory Management</h1>
          <p className="text-muted-foreground">Manage geographical hierarchy and assignments</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Territory
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { type: 'country', label: 'Countries', count: stats.countries, icon: Globe },
          { type: 'state', label: 'States', count: stats.states, icon: Map },
          { type: 'zone', label: 'Zones', count: stats.zones, icon: Navigation },
          { type: 'city', label: 'Cities', count: stats.cities, icon: Building },
          { type: 'area', label: 'Areas', count: stats.areas, icon: MapPin },
        ].map((stat, index) => (
          <motion.div
            key={stat.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`stat-card cursor-pointer ${selectedType === stat.type ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedType(selectedType === stat.type ? 'all' : stat.type)}
          >
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${typeColors[stat.type as keyof typeof typeColors]}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.count}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Territories Table */}
      <DataTable data={filteredTerritories} columns={columns} searchPlaceholder="Search territories..." />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-foreground mb-6">Add Territory</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Territory Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="input-field"
                >
                  <option value="country">Country</option>
                  <option value="state">State</option>
                  <option value="zone">Zone</option>
                  <option value="city">City</option>
                  <option value="area">Area</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Parent Territory</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Parent</option>
                  {mockTerritories.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Assign Manager</label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select Manager</option>
                  <option value="rsm-001">Vikram Singh (RSM)</option>
                  <option value="asm-001">Priya Sharma (ASM)</option>
                  <option value="se-001">Rajesh Kumar (SE)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline">Cancel</button>
              <button onClick={handleCreate} className="btn-primary">Create</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
