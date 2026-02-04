import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building, Map, Globe, Edit, Calendar, Loader2 } from 'lucide-react';
import { useCities } from '@/hooks/useGeoMasterData';
import { StatusBadge } from '@/components/ui/StatusBadge';
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/master/cities')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="module-title">City Details</h1>
            <p className="text-muted-foreground">View city information</p>
          </div>
        </div>
        <button onClick={() => navigate(`/master/cities/${id}/edit`)} className="btn-primary flex items-center gap-2">
          <Edit size={18} />
          Edit City
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-info/10">
              <Building size={24} className="text-info" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">City Name</p>
              <p className="font-medium text-foreground">{city.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">City Code</p>
              <p className="font-medium text-foreground">{city.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={city.status} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Map size={24} className="text-secondary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Location</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">State</p>
              <p className="font-medium text-foreground">{(city.state as any)?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Country</p>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-muted-foreground" />
                <span className="font-medium text-foreground">{(city.state as any)?.country?.name || '-'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-warning/10">
              <Calendar size={24} className="text-warning" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">System Information</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium text-foreground">{format(new Date(city.created_at), 'PPpp')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium text-foreground">{format(new Date(city.updated_at), 'PPpp')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
