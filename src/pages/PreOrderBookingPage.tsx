import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Plus,
  ShoppingBag,
  Calendar,
  IndianRupee,
  TrendingUp,
  Eye,
  Edit,
  Package,
  CheckCircle,
  Loader2,
  MapPin,
  Tag,
  Gift,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePreOrders, usePreOrderSchemes, useCreatePreOrder, PreOrder } from '@/hooks/usePreOrdersData';
import { useDistributors } from '@/hooks/useOutletsData';
import { useProducts } from '@/hooks/useOrdersData';
import { useSchemeCalculation, useActiveSchemes, CartItemWithProduct } from '@/hooks/useSchemeEngine';
import { AppliedSchemesDisplay } from '@/components/orders/AppliedSchemesDisplay';
import { ProductSchemesBadge } from '@/components/orders/ProductSchemesBadge';

export default function PreOrderBookingPage() {
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [remarks, setRemarks] = useState('');

  const { data: preOrders = [], isLoading: preOrdersLoading } = usePreOrders();
  const { data: schemes = [], isLoading: schemesLoading } = usePreOrderSchemes();
  const { data: distributors = [] } = useDistributors();
  const { data: products = [] } = useProducts();
  const { data: activeSchemes = [] } = useActiveSchemes();
  const createPreOrder = useCreatePreOrder();

  // Build cart items for scheme calculation in modal
  const modalCartItems: CartItemWithProduct[] = useMemo(() => {
    if (!selectedProduct || !quantity) return [];
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return [];
    
    const qty = parseInt(quantity) || 1;
    return [{
      productId: product.id,
      productName: product.name,
      quantity: qty,
      unitPrice: product.ptr,
      total: product.ptr * qty,
      sku: product.sku,
      category: product.category,
    }];
  }, [selectedProduct, quantity, products]);

  // Calculate schemes for the modal
  const distributor = distributors.find(d => d.id === selectedDistributor);
  const schemeResult = useSchemeCalculation(
    modalCartItems,
    'distributor',
    distributor?.category || undefined
  );

  const columns = [
    {
      key: 'orderNumber',
      header: 'Pre-Order #',
      render: (item: PreOrder) => (
        <div>
          <p className="font-medium text-foreground">{item.order_number}</p>
          <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
        </div>
      ),
    },
    {
      key: 'distributorName',
      header: 'Distributor',
      render: (item: PreOrder) => item.distributor?.firm_name || '-',
    },
    {
      key: 'scheme',
      header: 'Scheme',
      render: (item: PreOrder) => (
        <span className="text-sm">{item.scheme?.name || '-'}</span>
      ),
    },
    {
      key: 'totalValue',
      header: 'Value',
      render: (item: PreOrder) => (
        <div>
          <p className="font-semibold">₹{Number(item.total_value).toLocaleString()}</p>
          <p className="text-xs text-success">Advance: ₹{Number(item.advance_collected).toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: 'expectedDelivery',
      header: 'Delivery',
      render: (item: PreOrder) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <span className="text-sm">{item.expected_delivery || '-'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: PreOrder) => <StatusBadge status={item.status as any || 'booked'} />,
    },
    {
      key: 'tracking',
      header: 'Tracking',
      render: (item: PreOrder) => (
        <button 
          onClick={() => navigate(`/pre-orders/${item.id}?tab=tracking`)}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors text-primary"
          title="Track Order"
        >
          <MapPin size={16} />
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: PreOrder) => (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => navigate(`/pre-orders/${item.id}`)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Eye size={16} className="text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
            <Edit size={16} className="text-muted-foreground" />
          </button>
        </div>
      ),
    },
  ];

  const stats = {
    totalPreOrders: preOrders.length,
    totalValue: preOrders.reduce((sum, p) => sum + Number(p.total_value), 0),
    advanceCollected: preOrders.reduce((sum, p) => sum + Number(p.advance_collected), 0),
    delivered: preOrders.filter(p => p.status === 'delivered').length,
  };

  const handleBookPreOrder = async () => {
    if (!selectedScheme || !selectedDistributor) {
      toast.error('Please select scheme and distributor');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    const items = selectedProduct && quantity ? [{
      productId: selectedProduct,
      quantity: parseInt(quantity) || 1,
      unitPrice: product?.ptr || 0,
    }] : [];

    const scheme = schemes.find(s => s.id === selectedScheme);

    await createPreOrder.mutateAsync({
      schemeId: selectedScheme,
      distributorId: selectedDistributor,
      items,
      advanceCollected: parseFloat(advanceAmount) || 0,
      expectedDelivery: scheme?.launch_date,
      remarks,
    });

    setShowBookingModal(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedScheme('');
    setSelectedDistributor('');
    setSelectedProduct('');
    setQuantity('');
    setAdvanceAmount('');
    setRemarks('');
  };

  const isLoading = preOrdersLoading || schemesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Pre-Order Booking</h1>
          <p className="text-muted-foreground">Book orders for upcoming schemes and launches</p>
        </div>
        <button onClick={() => setShowBookingModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Book Pre-Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <ShoppingBag size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalPreOrders}</p>
              <p className="text-sm text-muted-foreground">Total Pre-Orders</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <IndianRupee size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{(stats.totalValue / 100000).toFixed(1)}L</p>
              <p className="text-sm text-muted-foreground">Order Value</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <TrendingUp size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹{(stats.advanceCollected / 1000).toFixed(0)}K</p>
              <p className="text-sm text-muted-foreground">Advance Collected</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <CheckCircle size={24} className="text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.delivered}</p>
              <p className="text-sm text-muted-foreground">Delivered</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Schemes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Upcoming Schemes - Pre-Order Targets</h3>
        {schemes.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No active schemes available</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {schemes.map(scheme => {
              const progress = scheme.pre_order_target > 0 
                ? (scheme.pre_order_achieved / scheme.pre_order_target) * 100 
                : 0;
              return (
                <div key={scheme.id} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-foreground">{scheme.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} />
                        Launch: {scheme.launch_date}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${progress >= 100 ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Achieved: {scheme.pre_order_achieved.toLocaleString()}</span>
                      <span>Target: {scheme.pre_order_target.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Pre-Orders Table */}
      {preOrders.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No pre-orders found. Book your first pre-order!</p>
        </div>
      ) : (
        <DataTable data={preOrders} columns={columns} searchPlaceholder="Search pre-orders..." />
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-xl w-full max-w-lg"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Book Pre-Order</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Scheme *</label>
                <select 
                  value={selectedScheme}
                  onChange={e => setSelectedScheme(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Scheme</option>
                  {schemes.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.launch_date})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Distributor *</label>
                <select 
                  value={selectedDistributor}
                  onChange={e => setSelectedDistributor(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Distributor</option>
                  {distributors.map(d => (
                    <option key={d.id} value={d.id}>{d.firm_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product</label>
                <select 
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Product (Optional)</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ₹{p.ptr}</option>
                  ))}
                </select>
                {/* Show applicable schemes for selected product */}
                {selectedProduct && (
                  <div className="mt-2">
                    <ProductSchemesBadge 
                      schemes={activeSchemes} 
                      productId={selectedProduct} 
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Quantity</label>
                  <input 
                    type="number" 
                    placeholder="Enter quantity" 
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Advance Amount (₹)</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={advanceAmount}
                    onChange={e => setAdvanceAmount(e.target.value)}
                    className="input-field" 
                  />
                </div>
              </div>

              {/* Applied Schemes Preview */}
              {schemeResult.appliedSchemes.length > 0 && (
                <div className="mt-4">
                  <AppliedSchemesDisplay
                    result={schemeResult}
                    canOverride={false}
                  />
                </div>
              )}

              {/* Order Summary */}
              {selectedProduct && quantity && (
                <div className="p-4 bg-muted/30 rounded-lg mt-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>₹{schemeResult.originalTotal.toLocaleString()}</span>
                    </div>
                    {schemeResult.totalDiscount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Scheme Discount</span>
                        <span>-₹{schemeResult.totalDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    {schemeResult.totalFreeGoods.length > 0 && (
                      <div className="flex items-center gap-2 text-success">
                        <Gift size={12} />
                        <span className="text-xs">
                          +{schemeResult.totalFreeGoods.map(fg => `${fg.quantity}x ${fg.productName}`).join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-2 border-t border-border">
                      <span>Net Amount</span>
                      <span className="text-primary">₹{schemeResult.discountedTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Remarks</label>
                <textarea 
                  placeholder="Any special instructions..." 
                  rows={2} 
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="input-field resize-none" 
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => { setShowBookingModal(false); resetForm(); }} className="btn-outline">Cancel</button>
              <button 
                onClick={handleBookPreOrder} 
                disabled={createPreOrder.isPending}
                className="btn-primary flex items-center gap-2"
              >
                {createPreOrder.isPending && <Loader2 size={16} className="animate-spin" />}
                Book Pre-Order
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
