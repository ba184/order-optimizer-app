import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Building2,
  Store,
  Package,
  AlertCircle,
  Check,
  Send,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

const mockProducts = [
  { id: 'p-001', name: 'Product Alpha 500ml', sku: 'PA-500', ptr: 120, mrp: 150, gst: 18, stock: 500 },
  { id: 'p-002', name: 'Product Beta 1L', sku: 'PB-1L', ptr: 220, mrp: 275, gst: 18, stock: 350 },
  { id: 'p-003', name: 'Product Gamma 250g', sku: 'PG-250', ptr: 85, mrp: 110, gst: 12, stock: 800 },
  { id: 'p-004', name: 'Product Delta Pack', sku: 'PD-PK', ptr: 350, mrp: 450, gst: 18, stock: 200 },
  { id: 'p-005', name: 'Product Epsilon 2L', sku: 'PE-2L', ptr: 380, mrp: 480, gst: 18, stock: 150 },
  { id: 'p-006', name: 'Product Zeta Combo', sku: 'PZ-CB', ptr: 550, mrp: 699, gst: 18, stock: 100 },
];

const mockDistributors = [
  { id: 'd-001', name: 'Krishna Traders', creditLimit: 500000, outstanding: 125000 },
  { id: 'd-002', name: 'Sharma Distributors', creditLimit: 750000, outstanding: 280000 },
  { id: 'd-003', name: 'Patel Trading Co', creditLimit: 1000000, outstanding: 450000 },
];

const mockRetailers = [
  { id: 'r-001', name: 'New Sharma Store', distributorId: 'd-001' },
  { id: 'r-002', name: 'Gupta General Store', distributorId: 'd-001' },
  { id: 'r-003', name: 'Jain Provision Store', distributorId: 'd-002' },
];

interface CartItem {
  productId: string;
  quantity: number;
  freeGoods: number;
  discount: number;
}

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState<'primary' | 'secondary'>('primary');
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const distributor = mockDistributors.find(d => d.id === selectedDistributor);
  const availableCredit = distributor ? distributor.creditLimit - distributor.outstanding : 0;

  const filteredProducts = mockProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRetailers = mockRetailers.filter(r =>
    r.distributorId === selectedDistributor
  );

  const updateCart = (productId: string, quantity: number) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        if (quantity <= 0) {
          return prev.filter(item => item.productId !== productId);
        }
        return prev.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        );
      }
      if (quantity > 0) {
        return [...prev, { productId, quantity, freeGoods: 0, discount: 0 }];
      }
      return prev;
    });
  };

  const getCartQuantity = (productId: string) => {
    return cartItems.find(item => item.productId === productId)?.quantity || 0;
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let gstAmount = 0;

    cartItems.forEach(item => {
      const product = mockProducts.find(p => p.id === item.productId);
      if (product) {
        const itemTotal = product.ptr * item.quantity;
        const gst = (itemTotal * product.gst) / 100;
        subtotal += itemTotal;
        gstAmount += gst;
      }
    });

    const discount = 0; // Can be calculated based on schemes
    const total = subtotal + gstAmount - discount;

    return { subtotal, gstAmount, discount, total };
  };

  const { subtotal, gstAmount, discount, total } = calculateTotals();

  const handleSubmit = (asDraft: boolean) => {
    if (!selectedDistributor) {
      toast.error('Please select a distributor');
      return;
    }
    if (orderType === 'secondary' && !selectedRetailer) {
      toast.error('Please select a retailer for secondary order');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Please add products to the order');
      return;
    }

    if (asDraft) {
      toast.success('Order saved as draft');
    } else {
      toast.success('Order submitted for approval');
    }
    navigate('/orders/list');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Create Order</h1>
          <p className="text-muted-foreground">Create new primary or secondary order</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Section - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type & Outlet Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Details</h2>
            
            {/* Order Type Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setOrderType('primary')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  orderType === 'primary'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Building2 size={24} className={orderType === 'primary' ? 'text-primary' : 'text-muted-foreground'} />
                <p className="font-medium mt-2">Primary Order</p>
                <p className="text-xs text-muted-foreground">Company to Distributor</p>
              </button>
              <button
                onClick={() => setOrderType('secondary')}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  orderType === 'secondary'
                    ? 'border-secondary bg-secondary/5'
                    : 'border-border hover:border-secondary/50'
                }`}
              >
                <Store size={24} className={orderType === 'secondary' ? 'text-secondary' : 'text-muted-foreground'} />
                <p className="font-medium mt-2">Secondary Order</p>
                <p className="text-xs text-muted-foreground">Distributor to Retailer</p>
              </button>
            </div>

            {/* Outlet Selection */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Distributor *
                </label>
                <select
                  value={selectedDistributor}
                  onChange={e => {
                    setSelectedDistributor(e.target.value);
                    setSelectedRetailer('');
                  }}
                  className="input-field"
                >
                  <option value="">Select Distributor</option>
                  {mockDistributors.map(dist => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name}
                    </option>
                  ))}
                </select>
                {distributor && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Available Credit: ₹{availableCredit.toLocaleString()}
                  </p>
                )}
              </div>

              {orderType === 'secondary' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Retailer *
                  </label>
                  <select
                    value={selectedRetailer}
                    onChange={e => setSelectedRetailer(e.target.value)}
                    className="input-field"
                    disabled={!selectedDistributor}
                  >
                    <option value="">Select Retailer</option>
                    {filteredRetailers.map(ret => (
                      <option key={ret.id} value={ret.id}>
                        {ret.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Add Products</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input-field pl-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
              {filteredProducts.map(product => {
                const quantity = getCartQuantity(product.id);
                return (
                  <div
                    key={product.id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      quantity > 0 ? 'bg-primary/5 border border-primary/20' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package size={24} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          SKU: {product.sku} • PTR: ₹{product.ptr} • GST: {product.gst}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {product.stock} units
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateCart(product.id, quantity - 1)}
                        disabled={quantity === 0}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={e => updateCart(product.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center input-field py-1"
                        min="0"
                      />
                      <button
                        onClick={() => updateCart(product.id, quantity + 1)}
                        className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right Section - Cart Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:sticky lg:top-24 h-fit"
        >
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary" />
              Order Summary
            </h2>

            {cartItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No products added yet
              </p>
            ) : (
              <div className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                  {cartItems.map(item => {
                    const product = mockProducts.find(p => p.id === item.productId);
                    if (!product) return null;
                    return (
                      <div key={item.productId} className="flex items-center justify-between py-2 border-b border-border">
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} x ₹{product.ptr}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">₹{(product.ptr * item.quantity).toLocaleString()}</p>
                          <button
                            onClick={() => updateCart(item.productId, 0)}
                            className="p-1 hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="pt-4 border-t border-border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST</span>
                    <span>₹{gstAmount.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Credit Warning */}
                {distributor && total > availableCredit && (
                  <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <p className="text-sm text-warning flex items-center gap-2">
                      <AlertCircle size={16} />
                      Order exceeds credit limit. Requires approval.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  <button
                    onClick={() => handleSubmit(false)}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Send size={18} />
                    Submit Order
                  </button>
                  <button
                    onClick={() => handleSubmit(true)}
                    className="btn-outline w-full flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    Save as Draft
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
