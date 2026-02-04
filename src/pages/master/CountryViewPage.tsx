import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Globe, Edit, Calendar, Loader2 } from 'lucide-react';
import { useCountries } from '@/hooks/useGeoMasterData';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { format } from 'date-fns';

export default function CountryViewPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: countries = [], isLoading } = useCountries();
  const country = countries.find(c => c.id === id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!country) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Country not found</p>
        <button onClick={() => navigate('/master/countries')} className="btn-primary mt-4">
          Back to Countries
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/master/countries')} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="module-title">Country Details</h1>
            <p className="text-muted-foreground">View country information</p>
          </div>
        </div>
        <button onClick={() => navigate(`/master/countries/${id}/edit`)} className="btn-primary flex items-center gap-2">
          <Edit size={18} />
          Edit Country
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Globe size={24} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Country Name</p>
              <p className="font-medium text-foreground">{country.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Country Code</p>
              <p className="font-medium text-foreground">{country.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Currency</p>
              <p className="font-medium text-foreground">{country.currency}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={country.status} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-secondary/10">
              <Calendar size={24} className="text-secondary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">System Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium text-foreground">{format(new Date(country.created_at), 'PPpp')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium text-foreground">{format(new Date(country.updated_at), 'PPpp')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
