import { cn } from '@/lib/utils';

type StatusType = 
  | 'active' | 'inactive' | 'pending'
  | 'approved' | 'rejected' | 'draft'
  | 'dispatched' | 'delivered' | 'cancelled'
  | 'paid' | 'partial' | 'overdue'
  | 'new' | 'contacted' | 'interested' | 'converted' | 'lost';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-muted-foreground/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  draft: 'bg-muted text-muted-foreground border-muted-foreground/20',
  dispatched: 'bg-info/10 text-info border-info/20',
  delivered: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  paid: 'bg-success/10 text-success border-success/20',
  partial: 'bg-warning/10 text-warning border-warning/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  new: 'bg-info/10 text-info border-info/20',
  contacted: 'bg-secondary/10 text-secondary border-secondary/20',
  interested: 'bg-warning/10 text-warning border-warning/20',
  converted: 'bg-success/10 text-success border-success/20',
  lost: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const statusLabels: Record<StatusType, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  draft: 'Draft',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  paid: 'Paid',
  partial: 'Partial',
  overdue: 'Overdue',
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  converted: 'Converted',
  lost: 'Lost',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
