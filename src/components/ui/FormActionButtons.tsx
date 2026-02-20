import { Loader2, Save, RotateCcw, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormActionButtonsProps {
  isEdit: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onReset: () => void;
  onSubmit?: () => void;
  onAddMore?: () => void;
  entityName: string;
  /** If true, uses type="submit" on Create button instead of onClick */
  submitViaForm?: boolean;
  /** Hide Add More in edit mode by default */
  hideAddMoreOnEdit?: boolean;
}

export function FormActionButtons({
  isEdit,
  isSubmitting,
  onCancel,
  onReset,
  onSubmit,
  onAddMore,
  entityName,
  submitViaForm = false,
  hideAddMoreOnEdit = true,
}: FormActionButtonsProps) {
  const showAddMore = onAddMore && !(isEdit && hideAddMoreOnEdit);

  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <X className="h-4 w-4 mr-2" />
        Cancel
      </Button>

      <Button
        type="button"
        variant="secondary"
        onClick={onReset}
        disabled={isSubmitting}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset
      </Button>

      {showAddMore && (
        <Button
          type="button"
          variant="outline"
          onClick={onAddMore}
          disabled={isSubmitting}
          className="border-primary text-primary hover:bg-primary/10"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add More
        </Button>
      )}

      <Button
        type={submitViaForm ? 'submit' : 'button'}
        onClick={submitViaForm ? undefined : onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {isEdit ? 'Update' : 'Create'} {entityName}
      </Button>
    </div>
  );
}
