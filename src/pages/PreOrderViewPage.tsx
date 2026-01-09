import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePreOrders, usePreOrderItems, useUpdatePreOrderStatus } from '@/hooks/usePreOrdersData';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import {
  ArrowLeft,
  FileText,
  Printer,
  CheckCircle,
  Truck,
  Package,
  Loader2,
  Building2,
  Calendar,
  User,
  IndianRupee,
  MapPin,
  Package2,
  CheckCircle2,
  Clock,
  Tag,
} from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

// Pre-order tracking stages
const PREORDER_STAGES = [
  { key: 'booked', label: 'Booked', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'dispatched', label: 'Dispatched', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export default function PreOrderViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');

  const { data: preOrders = [], isLoading: preOrdersLoading } = usePreOrders();
  const { data: preOrderItems = [], isLoading: itemsLoading } = usePreOrderItems(id);
  const updateStatus = useUpdatePreOrderStatus();

  const preOrder = preOrders.find(o => o.id === id);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    const actualDelivery = newStatus === 'delivered' ? new Date().toISOString().split('T')[0] : undefined;
    await updateStatus.mutateAsync({ id, status: newStatus, actualDelivery });
  };

  // Get current stage index for tracking
  const getStageIndex = (status: string | null) => {
    if (!status) return 0;
    const index = PREORDER_STAGES.findIndex(s => s.key === status);
    return index >= 0 ? index : 0;
  };

  if (preOrdersLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!preOrder) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Pre-order not found</p>
        <button onClick={() => navigate('/pre-orders')} className="btn-primary">
          Back to Pre-Orders
        </button>
      </div>
    );
  }

  const totalValue = Number(preOrder.total_value);
  const advanceCollected = Number(preOrder.advance_collected);
  const currentStage = getStageIndex(preOrder.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/pre-orders')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{preOrder.order_number}</h1>
            <p className="text-muted-foreground">
              Created on {format(new Date(preOrder.created_at), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={preOrder.status as StatusType || 'booked'} />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Package size={16} />
            Pre-Order Details
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <MapPin size={16} />
            Live Tracking
          </TabsTrigger>
        </TabsList>

        {/* Pre-Order Details Tab */}
        <TabsContent value="details" className="space-y-6 mt-6">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">Distributor</h3>
              </div>
              <p className="font-medium text-foreground">{preOrder.distributor?.firm_name || '-'}</p>
              <p className="text-sm text-muted-foreground">Pre-order recipient</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-info/10">
                  <Tag size={20} className="text-info" />
                </div>
                <h3 className="font-semibold text-foreground">Scheme</h3>
              </div>
              <p className="font-medium text-foreground">{preOrder.scheme?.name || 'N/A'}</p>
              <p className="text-sm text-muted-foreground">Pre-order scheme</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-success/10">
                  <Calendar size={20} className="text-success" />
                </div>
                <h3 className="font-semibold text-foreground">Expected Delivery</h3>
              </div>
              <p className="font-medium text-foreground">
                {preOrder.expected_delivery ? format(new Date(preOrder.expected_delivery), 'dd MMM yyyy') : '-'}
              </p>
              {preOrder.actual_delivery && (
                <p className="text-sm text-success">
                  Delivered: {format(new Date(preOrder.actual_delivery), 'dd MMM yyyy')}
                </p>
              )}
            </motion.div>
          </div>

          {/* Status & Actions */}
          <div className="card p-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Advance Collected</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(advanceCollected)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Balance Due</p>
                  <p className="text-2xl font-bold text-warning">{formatCurrency(totalValue - advanceCollected)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {preOrder.status === 'booked' && (
                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={updateStatus.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Confirm
                  </button>
                )}
                {preOrder.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange('dispatched')}
                    disabled={updateStatus.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Truck size={16} /> Mark Dispatched
                  </button>
                )}
                {preOrder.status === 'dispatched' && (
                  <button
                    onClick={() => handleStatusChange('delivered')}
                    disabled={updateStatus.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Package size={16} /> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Pre-Order Items */}
          <div className="card">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">Pre-Order Items ({preOrderItems.length})</h3>
            </div>
            {preOrderItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                      <th className="text-center p-4 text-sm font-medium text-muted-foreground">Quantity</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Unit Price</th>
                      <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preOrderItems.map((item) => (
                      <tr key={item.id} className="border-b border-border">
                        <td className="p-4">
                          <p className="font-medium text-foreground">{item.product?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{item.product?.sku || '-'}</p>
                        </td>
                        <td className="p-4 text-center">{item.quantity}</td>
                        <td className="p-4 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="p-4 text-right font-semibold">{formatCurrency(item.total_amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No items added to this pre-order
              </div>
            )}

            {/* Summary */}
            <div className="p-5 bg-muted/30">
              <div className="max-w-xs ml-auto space-y-2">
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>Total Value</span>
                  <span className="text-primary">{formatCurrency(totalValue)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks/Notes */}
          {preOrder.remarks && (
            <div className="card p-5">
              <h3 className="font-semibold text-foreground mb-2">Pre-Order Notes</h3>
              <p className="text-muted-foreground">{preOrder.remarks}</p>
            </div>
          )}
        </TabsContent>

        {/* Live Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6 mt-6">
          {/* Pre-Order Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Pre-Order Tracking</h3>
                <p className="text-sm text-muted-foreground">Track your pre-order status</p>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="relative">
              <div className="flex justify-between items-center">
                {PREORDER_STAGES.map((stage, index) => {
                  const isCompleted = index <= currentStage;
                  const isCurrent = index === currentStage;
                  const StageIcon = stage.icon;
                  
                  return (
                    <div key={stage.key} className="flex flex-col items-center relative z-10">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isCompleted 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      } ${isCurrent ? 'ring-4 ring-primary/30' : ''}`}>
                        <StageIcon size={20} />
                      </div>
                      <p className={`text-sm mt-2 font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {stage.label}
                      </p>
                      {isCompleted && index < currentStage && (
                        <p className="text-xs text-muted-foreground">Completed</p>
                      )}
                      {isCurrent && (
                        <p className="text-xs text-primary">Current</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted -z-0">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(currentStage / (PREORDER_STAGES.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Tracking Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h3 className="font-semibold text-foreground mb-4">Tracking Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-primary/10">
                  <Clock size={16} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Pre-order Booked</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(preOrder.created_at), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>

              {preOrder.expected_delivery && (
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-info/10">
                    <Calendar size={16} className="text-info" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Expected Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(preOrder.expected_delivery), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              )}

              {preOrder.actual_delivery && (
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-success/10">
                    <CheckCircle2 size={16} className="text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Delivered</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(preOrder.actual_delivery), 'dd MMM yyyy')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Status Update Actions */}
          {preOrder.status !== 'delivered' && preOrder.status !== 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="font-semibold text-foreground mb-4">Update Status</h3>
              <div className="flex gap-3">
                {preOrder.status === 'booked' && (
                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={updateStatus.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Confirm Pre-Order
                  </button>
                )}
                {preOrder.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange('dispatched')}
                    disabled={updateStatus.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Truck size={16} /> Mark as Dispatched
                  </button>
                )}
                {preOrder.status === 'dispatched' && (
                  <button
                    onClick={() => handleStatusChange('delivered')}
                    disabled={updateStatus.isPending}
                    className="btn-primary flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} /> Mark as Delivered
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
