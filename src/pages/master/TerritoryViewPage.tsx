import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, User, ChevronRight, Edit, Calendar, Loader2, Globe, Map, Navigation, Building } from 'lucide-react';
import { useTerritories } from '@/hooks/useTerritoriesData';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { format } from 'date-fns';

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

export default function TerritoryViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: territories = [], isLoading } = useTerritories();
  const territory = territories.find(t => t.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!territory) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Territory not found</p>
        <button onClick={() => navigate('/master/territories')} className="btn-primary mt-4">
          Back to Territories
        </button>
      </div>
    );
  }

  const TypeIcon = typeIcons[territory.type as keyof typeof typeIcons] || MapPin;
  const typeColor = typeColors[territory.type as keyof typeof typeColors] || 'bg-muted text-muted-foreground';

  // Find child territories
  const children = territories.filter(t => t.parent_id === territory.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/master/territories')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="module-title">Territory Details</h1>
            <p className="text-muted-foreground">View territory information</p>
          </div>
        </div>
        <button onClick={() => navigate(`/master/territories/${id}/edit`)} className="btn-primary flex items-center gap-2">
          <Edit size={18} />
          Edit Territory
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-xl ${typeColor}`}>
              <TypeIcon size={24} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Territory Name</p>
              <p className="font-medium text-foreground">{territory.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${typeColor}`}>
                <TypeIcon size={14} />
                <span className="capitalize">{territory.type}</span>
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={territory.status} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-secondary/10">
              <ChevronRight size={24} className="text-secondary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Hierarchy</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Parent Territory</p>
              {territory.parent ? (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{(territory.parent as any)?.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">({(territory.parent as any)?.type})</span>
                </div>
              ) : (
                <p className="font-medium text-muted-foreground">Root Level</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Manager</p>
              <div className="flex items-center gap-2">
                <User size={16} className="text-muted-foreground" />
                <span className="font-medium text-foreground">{(territory.manager as any)?.name || 'Not assigned'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {children.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-info/10">
                <MapPin size={24} className="text-info" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Child Territories ({children.length})</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {children.map(child => {
                const ChildIcon = typeIcons[child.type as keyof typeof typeIcons] || MapPin;
                const childColor = typeColors[child.type as keyof typeof typeColors] || 'bg-muted';
                return (
                  <button
                    key={child.id}
                    onClick={() => navigate(`/master/territories/${child.id}`)}
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm ${childColor} hover:opacity-80 transition-opacity`}
                  >
                    <ChildIcon size={14} />
                    {child.name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-warning/10">
              <Calendar size={24} className="text-warning" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">System Information</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium text-foreground">{format(new Date(territory.created_at), 'PPpp')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium text-foreground">{format(new Date(territory.updated_at), 'PPpp')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
