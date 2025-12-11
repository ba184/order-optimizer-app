import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useOrders, useOrderItems, useUpdateOrderStatus } from '@/hooks/useOrdersData';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import {
  ArrowLeft,
  FileText,
  Printer,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Loader2,
  Building2,
  Store,
  Calendar,
  User,
  IndianRupee,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';

const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
export default function OrderViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showInvoice, setShowInvoice] = useState(searchParams.get('invoice') === 'true');

  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: orderItems = [], isLoading: itemsLoading } = useOrderItems(id);
  const updateStatus = useUpdateOrderStatus();

  const order = orders.find(o => o.id === id);

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    await updateStatus.mutateAsync({ id, status: newStatus });
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (ordersLoading || itemsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Order not found</p>
        <button onClick={() => navigate('/orders/list')} className="btn-primary">
          Back to Orders
        </button>
      </div>
    );
  }

  const subtotal = Number(order.subtotal);
  const gstAmount = Number(order.gst_amount);
  const discount = Number(order.discount);
  const total = Number(order.total_amount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders/list')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{order.order_number}</h1>
            <p className="text-muted-foreground">
              Created on {format(new Date(order.created_at), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInvoice(true)}
            className="btn-outline flex items-center gap-2"
          >
            <FileText size={18} />
            View Invoice
          </button>
        </div>
      </div>

      {/* Order Info Cards */}
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
          <p className="font-medium text-foreground">{order.distributor?.firm_name || '-'}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            order.order_type === 'primary' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
          }`}>
            {order.order_type === 'primary' ? 'Primary Order' : 'Secondary Order'}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-info/10">
              <Store size={20} className="text-info" />
            </div>
            <h3 className="font-semibold text-foreground">Retailer</h3>
          </div>
          <p className="font-medium text-foreground">{order.retailer?.shop_name || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">
            {order.order_type === 'secondary' ? 'Secondary order recipient' : 'Not applicable for primary orders'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-success/10">
              <User size={20} className="text-success" />
            </div>
            <h3 className="font-semibold text-foreground">Created By</h3>
          </div>
          <p className="font-medium text-foreground">{order.creator?.name || '-'}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar size={14} />
            {format(new Date(order.created_at), 'dd MMM yyyy')}
          </p>
        </motion.div>
      </div>

      {/* Status & Actions */}
      <div className="card p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Status</p>
              <StatusBadge status={order.status as StatusType} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
              <StatusBadge status={order.payment_status as StatusType} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {order.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusChange('approved')}
                  disabled={updateStatus.isPending}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle size={16} /> Approve
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={updateStatus.isPending}
                  className="btn-outline text-destructive flex items-center gap-2"
                >
                  <XCircle size={16} /> Cancel
                </button>
              </>
            )}
            {order.status === 'approved' && (
              <button
                onClick={() => handleStatusChange('dispatched')}
                disabled={updateStatus.isPending}
                className="btn-primary flex items-center gap-2"
              >
                <Truck size={16} /> Mark Dispatched
              </button>
            )}
            {order.status === 'dispatched' && (
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

      {/* Order Items */}
      <div className="card">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">Order Items ({orderItems.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Qty</th>
                <th className="text-center p-4 text-sm font-medium text-muted-foreground">Free</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Unit Price</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">GST</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Discount</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Total</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="p-4">
                    <p className="font-medium text-foreground">{item.product?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{item.product?.sku || '-'}</p>
                  </td>
                  <td className="p-4 text-center">{item.quantity}</td>
                  <td className="p-4 text-center text-success">{item.free_goods || 0}</td>
                  <td className="p-4 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="p-4 text-right">
                    <p>{formatCurrency(item.gst_amount)}</p>
                    <p className="text-xs text-muted-foreground">{item.gst_percent}%</p>
                  </td>
                  <td className="p-4 text-right text-destructive">-{formatCurrency(item.discount)}</td>
                  <td className="p-4 text-right font-semibold">{formatCurrency(item.total_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Summary */}
        <div className="p-5 bg-muted/30">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">GST</span>
              <span>{formatCurrency(gstAmount)}</span>
            </div>
            <div className="flex justify-between text-sm text-destructive">
              <span>Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="card p-5">
          <h3 className="font-semibold text-foreground mb-2">Notes</h3>
          <p className="text-muted-foreground">{order.notes}</p>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoice && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:bg-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none"
          >
            {/* Invoice Header Actions - Hide on print */}
            <div className="p-4 border-b border-border flex items-center justify-between print:hidden">
              <h2 className="text-lg font-semibold">Invoice</h2>
              <div className="flex items-center gap-2">
                <button onClick={handlePrintInvoice} className="btn-outline flex items-center gap-2">
                  <Printer size={16} /> Print
                </button>
                <button onClick={() => setShowInvoice(false)} className="btn-outline">
                  Close
                </button>
              </div>
            </div>

            {/* Invoice Content */}
            <div className="p-8 print:p-4" id="invoice-content">
              {/* Company Header */}
              <div className="text-center mb-8 border-b border-border pb-6">
                <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
                <p className="text-muted-foreground mt-1">Your Company Name</p>
                <p className="text-sm text-muted-foreground">123 Business Street, City, State - 123456</p>
                <p className="text-sm text-muted-foreground">GSTIN: 00AAAAA0000A0A0</p>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Bill To:</h3>
                  <p className="font-medium">{order.distributor?.firm_name || 'N/A'}</p>
                  {order.retailer?.shop_name && (
                    <p className="text-sm text-muted-foreground">c/o {order.retailer.shop_name}</p>
                  )}
                </div>
                <div className="text-right">
                  <p><span className="text-muted-foreground">Invoice No:</span> <span className="font-medium">{order.order_number}</span></p>
                  <p><span className="text-muted-foreground">Date:</span> <span className="font-medium">{format(new Date(order.created_at), 'dd MMM yyyy')}</span></p>
                  <p><span className="text-muted-foreground">Order Type:</span> <span className="font-medium capitalize">{order.order_type}</span></p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full mb-8 border border-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 border-b border-border">#</th>
                    <th className="text-left p-3 border-b border-border">Product</th>
                    <th className="text-center p-3 border-b border-border">Qty</th>
                    <th className="text-right p-3 border-b border-border">Rate</th>
                    <th className="text-right p-3 border-b border-border">GST</th>
                    <th className="text-right p-3 border-b border-border">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">
                        <p className="font-medium">{item.product?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">SKU: {item.product?.sku || '-'}</p>
                      </td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="p-3 text-right">{item.gst_percent}%</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(item.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Invoice Summary */}
              <div className="flex justify-end">
                <div className="w-72 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST</span>
                    <span>{formatCurrency(gstAmount)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-destructive">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total Amount</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
                <p>Thank you for your business!</p>
                <p>This is a computer-generated invoice and does not require a signature.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
