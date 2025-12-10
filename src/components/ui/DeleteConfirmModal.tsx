import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-full bg-destructive/10">
            <AlertTriangle className="text-destructive" size={24} />
          </div>
          <p className="text-muted-foreground">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
