import { useState, useMemo, useCallback } from 'react';
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
  Send,
  FileText,
  Loader2,
  Tag,
  ArrowLeft,
  FlaskConical,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProducts, useCreateOrder, CartItem } from '@/hooks/useOrdersData';
import { useDistributors, useRetailers } from '@/hooks/useOutletsData';
import { useSchemeCalculation, useLogSchemeOverride, useActiveSchemes, CartItemWithProduct, AppliedScheme } from '@/hooks/useSchemeEngine';
import { AppliedSchemesDisplay } from '@/components/orders/AppliedSchemesDisplay';
import { ProductSchemesBadge } from '@/components/orders/ProductSchemesBadge';
import { OrderCollateralSelector, OrderCollateralItem } from '@/components/orders/OrderCollateralSelector';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useCountries, useStates, useCities } from '@/hooks/useGeoMasterData';
import { useTerritories } from '@/hooks/useTerritoriesData';
import { useSamples } from '@/hooks/useSamplesData';

export default function CreateOrderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderType, setOrderType] = useState<'primary' | 'secondary'>('primary');
  const [selectedDistributor, setSelectedDistributor] = useState('');
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState('');
  const [orderCollaterals, setOrderCollaterals] = useState<OrderCollateralItem[]>([]);

  // Location filter state
  const [filterCountry, setFilterCountry] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterTerritory, setFilterTerritory] = useState('');

  // Product/Sample tab
  const [productTab, setProductTab] = useState<'products' | 'samples'>('products');

  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: distributors = [], isLoading: distributorsLoading } = useDistributors();
  const { data: retailers = [] } = useRetailers();
  const { data: activeSchemes = [] } = useActiveSchemes();
  const { data: countries = [] } = useCountries();
  const { data: states = [] } = useStates();
  const { data: cities = [] } = useCities();
  const { data: territories = [] } = useTerritories();
  const { data: samples = [] } = useSamples();
  const createOrder = useCreateOrder();
  const logOverride = useLogSchemeOverride();

  // Filter geo data cascading
  const filteredStates = useMemo(() => {
    if (!filterCountry) return states.filter(s => s.status === 'active');
    return states.filter(s => s.status === 'active' && s.country_id === filterCountry);
  }, [states, filterCountry]);

  const filteredCities = useMemo(() => {
    if (!filterState) return cities.filter(c => c.status === 'active');
    return cities.filter(c => c.status === 'active' && c.state_id === filterState);
  }, [cities, filterState]);

  const filteredTerritories = useMemo(() => {
    let filtered = territories.filter(t => t.status === 'active');
    if (filterCity) filtered = filtered.filter(t => t.city_id === filterCity);
    else if (filterState) filtered = filtered.filter(t => t.state_id === filterState);
    else if (filterCountry) filtered = filtered.filter(t => t.country_id === filterCountry);
    return filtered;
  }, [territories, filterCountry, filterState, filterCity]);

  // Filter distributors by location
  const locationFilteredDistributors = useMemo(() => {
    let filtered = distributors.filter(d => d.status === 'active' || d.status === 'approved');
    if (filterCountry) {
      const countryName = countries.find(c => c.id === filterCountry)?.name;
      if (countryName) filtered = filtered.filter(d => d.country === countryName);
    }
    if (filterState) {
      const stateName = states.find(s => s.id === filterState)?.name;
      if (stateName) filtered = filtered.filter(d => d.state === stateName);
    }
    if (filterCity) {
      const cityName = cities.find(c => c.id === filterCity)?.name;
      if (cityName) filtered = filtered.filter(d => d.city === cityName);
    }
    if (filterTerritory) {
      const territoryName = territories.find(t => t.id === filterTerritory)?.name;
      if (territoryName) filtered = filtered.filter(d => d.territory === territoryName);
    }
    return filtered;
  }, [distributors, filterCountry, filterState, filterCity, filterTerritory, countries, states, cities, territories]);

  // Filter retailers by location
  const locationFilteredRetailers = useMemo(() => {
    let filtered = retailers.filter(r => r.status === 'active' || r.status === 'approved');
    if (filterCountry) {
      const countryName = countries.find(c => c.id === filterCountry)?.name;
      if (countryName) filtered = filtered.filter(r => r.country === countryName);
    }
    if (filterState) {
      const stateName = states.find(s => s.id === filterState)?.name;
      if (stateName) filtered = filtered.filter(r => r.state === stateName);
    }
    if (filterCity) {
      const cityName = cities.find(c => c.id === filterCity)?.name;
      if (cityName) filtered = filtered.filter(r => r.city === cityName);
    }
    if (filterTerritory) {
      const territoryName = territories.find(t => t.id === filterTerritory)?.name;
      if (territoryName) filtered = filtered.filter(r => r.zone === territoryName);
    }
    return filtered;
  }, [retailers, filterCountry, filterState, filterCity, filterTerritory, countries, states, cities, territories]);

  const distributor = distributors.find(d => d.id === selectedDistributor);
  const retailer = retailers.find(r => r.id === selectedRetailer);
  const availableCredit = distributor ? Number(distributor.credit_limit || 0) - Number(distributor.outstanding_amount || 0) : 0;

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSamples = samples.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show retailers filtered by distributor for secondary orders
  const filteredRetailers = selectedDistributor 
    ? locationFilteredRetailers.filter(r => !r.distributor_id || r.distributor_id === selectedDistributor)
    : locationFilteredRetailers;

  // Build cart items with product details for scheme calculation
  const cartItemsWithProducts: CartItemWithProduct[] = useMemo(() => {
    return cartItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name || '',
        quantity: item.quantity,
        unitPrice: product?.ptr || 0,
        total: (product?.ptr || 0) * item.quantity,
        sku: product?.sku || '',
        category: product?.category,
      };
    });
  }, [cartItems, products]);

  // Use scheme calculation engine
  const customerType = orderType === 'primary' ? 'distributor' : 'retailer';
  const customerCategory = orderType === 'primary' 
    ? distributor?.category 
    : retailer?.category;

  const schemeResult = useSchemeCalculation(
    cartItemsWithProducts,
    customerType,
    customerCategory || undefined
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

  // Handle scheme override
  const handleSchemeOverride = useCallback((
    schemeId: string,
    newDiscount: number,
    newFreeQty: number,
    reason: string
  ) => {
    const originalScheme = schemeResult.appliedSchemes.find(s => s.schemeId === schemeId);
    if (originalScheme) {
      schemeResult.addOverride({
        schemeId,
        originalBenefit: originalScheme,
        overrideBenefit: {
          discountAmount: newDiscount,
          freeQuantity: newFreeQty,
        },
        reason,
      });
    }
  }, [schemeResult]);

  const calculateTotals = () => {
    let subtotal = 0;
    let gstAmount = 0;

    cartItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const itemTotal = Number(product.ptr) * item.quantity;
        const gst = (itemTotal * Number(product.gst)) / 100;
        subtotal += itemTotal;
        gstAmount += gst;
      }
    });

    // Apply scheme discount
    const schemeDiscount = schemeResult.totalDiscount;
    const total = subtotal + gstAmount - schemeDiscount;

    return { subtotal, gstAmount, discount: schemeDiscount, total };
  };

  const { subtotal, gstAmount, discount, total } = calculateTotals();

  const handleSubmit = async (asDraft: boolean) => {
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

    try {
      await createOrder.mutateAsync({
        orderType,
        distributorId: selectedDistributor,
        retailerId: orderType === 'secondary' ? selectedRetailer : undefined,
        cartItems,
        products,
        status: asDraft ? 'draft' : 'pending',
        notes,
        orderCollaterals,
      });
      navigate('/orders/list');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = productsLoading || distributorsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/orders/list')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={18} />
        Back to Orders
      </Button>

      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Create Order</h1>
          <p className="text-muted-foreground">Create new primary or secondary order</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit(true)}
            disabled={createOrder.isPending || cartItems.length === 0}
            className="btn-outline flex items-center gap-2"
          >
            <FileText size={18} />
            Save
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={createOrder.isPending || cartItems.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            {createOrder.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            Submit
          </button>
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
                onClick={() => {
                  setOrderType('primary');
                  setSelectedDistributor('');
                  setSelectedRetailer('');
                }}
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
                onClick={() => {
                  setOrderType('secondary');
                  setSelectedDistributor('');
                  setSelectedRetailer('');
                }}
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

            {/* Location Filters */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">Filter by Location</label>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <select
                  value={filterCountry}
                  onChange={e => {
                    setFilterCountry(e.target.value);
                    setFilterState('');
                    setFilterCity('');
                    setFilterTerritory('');
                    setSelectedDistributor('');
                    setSelectedRetailer('');
                  }}
                  className="input-field text-sm"
                >
                  <option value="">All Countries</option>
                  {countries.filter(c => c.status === 'active').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={filterState}
                  onChange={e => {
                    setFilterState(e.target.value);
                    setFilterCity('');
                    setFilterTerritory('');
                    setSelectedDistributor('');
                    setSelectedRetailer('');
                  }}
                  className="input-field text-sm"
                >
                  <option value="">All States</option>
                  {filteredStates.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>

                <select
                  value={filterCity}
                  onChange={e => {
                    setFilterCity(e.target.value);
                    setFilterTerritory('');
                    setSelectedDistributor('');
                    setSelectedRetailer('');
                  }}
                  className="input-field text-sm"
                >
                  <option value="">All Cities</option>
                  {filteredCities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={filterTerritory}
                  onChange={e => {
                    setFilterTerritory(e.target.value);
                    setSelectedDistributor('');
                    setSelectedRetailer('');
                  }}
                  className="input-field text-sm"
                >
                  <option value="">All Territories</option>
                  {filteredTerritories.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
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
                  {locationFilteredDistributors.map(dist => (
                    <option key={dist.id} value={dist.id}>
                      {dist.firm_name}
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
                        {ret.shop_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="input-field"
                rows={2}
                placeholder="Add any notes for this order..."
              />
            </div>
          </motion.div>

          {/* Product & Sample Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-xl border border-border p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-foreground">Add Products</h2>
                <div className="flex bg-muted rounded-lg p-0.5">
                  <button
                    onClick={() => setProductTab('products')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      productTab === 'products'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Package size={14} />
                      Products
                    </span>
                  </button>
                  <button
                    onClick={() => setProductTab('samples')}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      productTab === 'samples'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <FlaskConical size={14} />
                      Samples
                    </span>
                  </button>
                </div>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input
                  type="text"
                  placeholder={productTab === 'products' ? 'Search products...' : 'Search samples...'}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="input-field pl-9 text-sm"
                />
              </div>
            </div>

            {productTab === 'products' ? (
              /* Products List */
              products.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No products available. Please add products first.</p>
                </div>
              ) : (
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
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              SKU: {product.sku} • PTR: ₹{product.ptr} • GST: {product.gst}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Stock: {product.stock} units
                            </p>
                            <ProductSchemesBadge 
                              schemes={activeSchemes} 
                              productId={product.id} 
                            />
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
              )
            ) : (
              /* Samples List */
              samples.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FlaskConical size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No samples available. Please add samples first.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
                  {filteredSamples.map(sample => {
                    const quantity = getCartQuantity(sample.id);
                    return (
                      <div
                        key={sample.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                          quantity > 0 ? 'bg-accent/10 border border-accent/20' : 'bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                            <FlaskConical size={24} className="text-accent-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{sample.name}</p>
                            <p className="text-sm text-muted-foreground">
                              SKU: {sample.sku} • Type: {sample.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Stock: {sample.stock} units
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateCart(sample.id, quantity - 1)}
                            disabled={quantity === 0}
                            className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            onChange={e => updateCart(sample.id, parseInt(e.target.value) || 0)}
                            className="w-16 text-center input-field py-1"
                            min="0"
                          />
                          <button
                            onClick={() => updateCart(sample.id, quantity + 1)}
                            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </motion.div>

          {/* Marketing Collateral Section - Below Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Marketing Collateral</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Add marketing materials to be sent with this order
            </p>
            
            <OrderCollateralSelector
              items={orderCollaterals}
              onChange={setOrderCollaterals}
            />
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
                    const product = products.find(p => p.id === item.productId);
                    const sample = samples.find(s => s.id === item.productId);
                    const itemName = product?.name || sample?.name || 'Unknown';
                    const itemPrice = product?.ptr || 0;
                    const isSample = !!sample && !product;

                    return (
                      <div key={item.productId} className="flex items-center justify-between py-2 border-b border-border">
                        <div>
                          <p className="text-sm font-medium flex items-center gap-1.5">
                            {isSample && <FlaskConical size={12} className="text-accent-foreground" />}
                            {itemName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isSample ? `${item.quantity} units (Sample)` : `${item.quantity} x ₹${itemPrice}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isSample && (
                            <p className="font-medium">₹{(Number(itemPrice) * item.quantity).toLocaleString()}</p>
                          )}
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

                {/* Applied Schemes */}
                {schemeResult.appliedSchemes.length > 0 && (
                  <AppliedSchemesDisplay
                    result={schemeResult}
                    canOverride={true}
                    onOverride={handleSchemeOverride}
                    onRemoveOverride={(schemeId) => schemeResult.removeOverride(schemeId)}
                    isOverridden={(schemeId) => schemeResult.manualOverrides.has(schemeId)}
                  />
                )}

                {/* Free Goods from Schemes */}
                {schemeResult.totalFreeGoods.length > 0 && (
                  <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                    <p className="text-sm font-medium text-success flex items-center gap-2">
                      <Tag size={14} />
                      Free Products Included
                    </p>
                    <div className="mt-2 space-y-1">
                      {schemeResult.totalFreeGoods.map((fg, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground">
                          +{fg.quantity}x {fg.productName}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

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
                      <span>Scheme Discount</span>
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
                    disabled={createOrder.isPending}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {createOrder.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                    Submit Order
                  </button>
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={createOrder.isPending}
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
