import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Globe, Loader2, Calendar, DollarSign } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useCountries } from '@/hooks/useGeoMasterData';
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
            <div className="flex items-center gap-3">
              <Globe size={28} className="text-primary" />
              <h1 className="module-title">{country.name}</h1>
            </div>
            <p className="text-muted-foreground">{country.code} • Country</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/master/countries/${id}/edit`)}
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
          <h2 className="text-lg font-semibold text-foreground mb-4">Country Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Country Name</p>
              <p className="font-medium text-foreground">{country.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Country Code</p>
              <p className="font-mono font-medium text-primary">{country.code}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <StatusBadge status={country.status === 'active' ? 'active' : 'inactive'} />
            </div>
          </div>
        </motion.div>

        {/* Currency Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-foreground mb-4">Currency</h2>
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-3">
              <DollarSign size={32} className="text-primary" />
            </div>
            <p className="text-3xl font-bold text-foreground">{country.currency}</p>
            <p className="text-sm text-muted-foreground mt-1">Default Currency</p>
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
                {country.created_at ? format(new Date(country.created_at), 'PPpp') : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {country.updated_at ? format(new Date(country.updated_at), 'PPpp') : '-'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
