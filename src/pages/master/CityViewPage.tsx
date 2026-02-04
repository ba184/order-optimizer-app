import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Building, Loader2, Calendar, Globe, Map } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useCities } from '@/hooks/useGeoMasterData';
import { format } from 'date-fns';

export default function CityViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: cities = [], isLoading } = useCities();

  const city = cities.find(c => c.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!city) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">City not found</p>
        <button onClick={() => navigate('/master/cities')} className="btn-primary mt-4">
          Back to Cities
        </button>
      </div>
    );
  }

  const state = city.state as any;
  const country = state?.country as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/master/cities')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <Building size={28} className="text-info" />
              <h1 className="module-title">{city.name}</h1>
            </div>
            <p className="text-muted-foreground">{city.code} • City</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/master/cities/${id}/edit`)}
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
          <h2 className="text-lg font-semibold text-foreground mb-4">City Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">City Name</p>
              <p className="font-medium text-foreground">{city.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">City Code</p>
              <p className="font-mono font-medium text-primary">{city.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={city.status === 'active' ? 'active' : 'inactive'} />
            </div>
          </div>
        </motion.div>

        {/* Location Hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Globe size={20} className="text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Country</p>
                <p className="font-medium text-foreground">{country?.name || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Map size={20} className="text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground">State</p>
                <p className="font-medium text-foreground">{state?.name || '-'}</p>
              </div>
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
                {city.created_at ? format(new Date(city.created_at), 'PPpp') : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {city.updated_at ? format(new Date(city.updated_at), 'PPpp') : '-'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
