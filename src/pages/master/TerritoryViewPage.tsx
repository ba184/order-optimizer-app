import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, MapPin, Loader2, Calendar, GitBranch } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useTerritories } from '@/hooks/useTerritoriesData';
import { format } from 'date-fns';

export default function TerritoryViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: territories = [], isLoading } = useTerritories();

  const territory = territories.find(t => t.id === id);
  const parentTerritory = territory?.parent_id ? territories.find(t => t.id === territory.parent_id) : null;
  const childTerritories = territories.filter(t => t.parent_id === id);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/master/territories')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <MapPin size={28} className="text-success" />
              <h1 className="module-title">{territory.name}</h1>
            </div>
            <p className="text-muted-foreground">{territory.type} • Territory</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/master/territories/${id}/edit`)}
          className="btn-primary flex items-center gap-2"
        >
          <Edit size={18} />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 lg:col-span-2"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Territory Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Territory Name</p>
              <p className="font-medium text-foreground">{territory.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium text-foreground capitalize">{territory.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={territory.status === 'active' ? 'active' : 'inactive'} />
            </div>
          </div>
        </motion.div>

        {/* Hierarchy Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <GitBranch size={20} className="text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Hierarchy</h2>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Parent Territory</p>
              {parentTerritory ? (
                <button
                  onClick={() => navigate(`/master/territories/${parentTerritory.id}`)}
                  className="font-medium text-primary hover:underline"
                >
                  {parentTerritory.name} ({parentTerritory.type})
                </button>
              ) : (
                <p className="font-medium text-foreground">Top Level</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Child Territories</p>
              {childTerritories.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {childTerritories.map(child => (
                    <button
                      key={child.id}
                      onClick={() => navigate(`/master/territories/${child.id}`)}
                      className="px-3 py-1 bg-success/20 text-success rounded-lg text-sm hover:bg-success/30"
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="font-medium text-foreground">None</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Timestamps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 lg:col-span-3"
        >
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={20} className="text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">
                {territory.created_at ? format(new Date(territory.created_at), 'PPpp') : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {territory.updated_at ? format(new Date(territory.updated_at), 'PPpp') : '-'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
