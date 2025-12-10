import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export type FieldType = 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date' | 'switch';

export interface FieldConfig {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  dependsOn?: string;
  getOptions?: (formData: Record<string, any>) => { value: string; label: string }[];
}

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FieldConfig[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  mode: 'create' | 'edit' | 'view';
}

export function CrudModal({
  isOpen,
  onClose,
  title,
  fields,
  initialData,
  onSubmit,
  mode,
}: CrudModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const defaultData: Record<string, any> = {};
      fields.forEach(f => {
        defaultData[f.key] = '';
      });
      setFormData(defaultData);
    }
  }, [initialData, fields]);

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {fields.map(field => {
            const options = field.getOptions ? field.getOptions(formData) : field.options;

            return (
              <div key={field.key}>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {field.label} {field.required && '*'}
                </label>

                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    disabled={isViewMode}
                    className="input-field disabled:opacity-60"
                  >
                    <option value="">Select {field.label}</option>
                    {options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={isViewMode}
                    className="input-field min-h-[80px] disabled:opacity-60"
                  />
                ) : field.type === 'switch' ? (
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData[field.key] || false}
                      onChange={e => handleChange(field.key, e.target.checked)}
                      disabled={isViewMode}
                      className="w-5 h-5 rounded border-border"
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData[field.key] ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] || ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    disabled={isViewMode}
                    className="input-field disabled:opacity-60"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-outline">
            {isViewMode ? 'Close' : 'Cancel'}
          </button>
          {!isViewMode && (
            <button onClick={handleSubmit} className="btn-primary">
              {mode === 'create' ? 'Create' : 'Update'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
