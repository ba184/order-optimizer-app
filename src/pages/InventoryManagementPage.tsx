import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge, StatusType } from '@/components/ui/StatusBadge';
import {
  Package,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Calendar,
  Eye,
  Plus,
  RefreshCw,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Download,
  Edit,
  Trash2,
  ShieldCheck,
  Clock,
  XCircle,
  DollarSign,
  Gauge,
  Zap,
  Snail,
  Archive,
  Timer,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  useInventoryBatches,
  useStockTransfers,
  useCreateInventoryBatch,
  useUpdateInventoryBatch,
  useUpdateInventoryBatchStatus,
  useDeleteInventoryBatch,
  useCreateStockTransfer,
  useUpdateStockTransferStatus,
  calculateInventorySummary,
  calculateInventoryKPIs,
  getExpiryAlerts,
  getAllExpiryItems,
  InventoryBatch,
  StockTransfer,
  ExpiryAlert,
  ExpiryStatus,
} from '@/hooks/useInventoryData';
import { useProducts } from '@/hooks/useOrdersData';
import { useDistributors } from '@/hooks/useOutletsData';
import { useWarehouses } from '@/hooks/useWarehousesData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const locationTypes = [
  { value: 'central', label: 'Central Warehouse' },
  { value: 'depot', label: 'Depot' },
];
const entryModes = [
  { value: 'manual', label: 'Manual Entry' },
  { value: 'purchase', label: 'Purchase/GRN' },
  { value: 'return', label: 'Return' },
  { value: 'transfer', label: 'Transfer' },
];

type TabType = 'overview' | 'stock-entry' | 'expiry' | 'transfers';
type ExpiryFilter = 'all' | 'warning' | 'expired';
type LocationFilter = 'all' | 'warehouse' | 'distributor';

export default function InventoryManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showStockModal, setShowStockModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<InventoryBatch | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<LocationFilter>('all');
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>('all');
  
  const { data: batches = [], isLoading: batchesLoading } = useInventoryBatches();
  const { data: transfers = [], isLoading: transfersLoading } = useStockTransfers();
  const { data: products = [] } = useProducts();
  const { data: distributors = [] } = useDistributors();
  const { data: warehousesList = [] } = useWarehouses();
  
  const createBatch = useCreateInventoryBatch();
  const updateBatch = useUpdateInventoryBatch();
  const updateBatchStatus = useUpdateInventoryBatchStatus();
  const deleteBatch = useDeleteInventoryBatch();
  const createTransfer = useCreateStockTransfer();
  const updateTransferStatus = useUpdateStockTransferStatus();

  const [stockForm, setStockForm] = useState({
    product_id: '',
    batch_number: '',
    quantity: '',
    manufacturing_date: '',
    expiry_date: '',
    location_type: '' as 'central' | 'depot' | '',
    warehouse: '',
    purchase_price: '',
    entry_mode: 'manual',
  });

  const [transferForm, setTransferForm] = useState({
    from_location: '',
    from_distributor_id: '',
    to_location: '',
    to_distributor_id: '',
    notes: '',
    items: [{ product_id: '', quantity: '' }],
  });

  const inventorySummary = useMemo(() => calculateInventorySummary(batches, products), [batches, products]);
  const inventoryKPIs = useMemo(() => calculateInventoryKPIs(batches, products), [batches, products]);
  const expiryAlerts = useMemo(() => getExpiryAlerts(batches), [batches]);
  const allExpiryItems = useMemo(() => getAllExpiryItems(batches), [batches]);

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [products]);

  // Filter inventory summary
  const filteredInventory = useMemo(() => {
    return inventorySummary.filter(item => {
      if (categoryFilter !== 'all' && item.product?.category !== categoryFilter) return false;
      if (locationFilter === 'warehouse' && Object.keys(item.distributorStock).length > 0 && item.warehouseStock === 0) return false;
      if (locationFilter === 'distributor' && item.warehouseStock > 0 && Object.keys(item.distributorStock).length === 0) return false;
      return true;
    });
  }, [inventorySummary, categoryFilter, locationFilter]);

  // Filter stock entries (active only, not deleted)
  const activeBatches = useMemo(() => {
    return batches.filter(b => b.status !== 'deleted');
  }, [batches]);

  // Filter expiry alerts
  const filteredExpiryAlerts = useMemo(() => {
    if (expiryFilter === 'all') return allExpiryItems;
    if (expiryFilter === 'warning') return allExpiryItems.filter(a => a.expiryStatus === 'warning');
    if (expiryFilter === 'expired') return allExpiryItems.filter(a => a.expiryStatus === 'expired');
    return allExpiryItems;
  }, [allExpiryItems, expiryFilter]);

  const resetStockForm = () => {
    setStockForm({
      product_id: '',
      batch_number: '',
      quantity: '',
      manufacturing_date: '',
      expiry_date: '',
      location_type: '',
      warehouse: '',
      purchase_price: '',
      entry_mode: 'manual',
    });
    setEditingBatch(null);
  };

  const handleCreateStock = async () => {
    if (!stockForm.product_id || !stockForm.batch_number || !stockForm.quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    const quantity = parseInt(stockForm.quantity);
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (stockForm.manufacturing_date && stockForm.expiry_date) {
      if (new Date(stockForm.manufacturing_date) >= new Date(stockForm.expiry_date)) {
        toast.error('Manufacturing date must be before expiry date');
        return;
      }
    }

    try {
      if (editingBatch) {
        await updateBatch.mutateAsync({
          id: editingBatch.id,
          quantity,
          manufacturing_date: stockForm.manufacturing_date || undefined,
          expiry_date: stockForm.expiry_date || undefined,
          warehouse: stockForm.warehouse || undefined,
          purchase_price: parseFloat(stockForm.purchase_price) || 0,
        });
      } else {
        await createBatch.mutateAsync({
          product_id: stockForm.product_id,
          batch_number: stockForm.batch_number,
          quantity,
          manufacturing_date: stockForm.manufacturing_date || undefined,
          expiry_date: stockForm.expiry_date || undefined,
          warehouse: stockForm.warehouse || undefined,
          purchase_price: parseFloat(stockForm.purchase_price) || 0,
          entry_mode: stockForm.entry_mode,
        });
      }
      setShowStockModal(false);
      resetStockForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEditBatch = (batch: InventoryBatch) => {
    setEditingBatch(batch);
    const matchedWarehouse = warehousesList.find(w => w.name === batch.warehouse);
    setStockForm({
      product_id: batch.product_id,
      batch_number: batch.batch_number,
      quantity: batch.quantity.toString(),
      manufacturing_date: batch.manufacturing_date || '',
      expiry_date: batch.expiry_date || '',
      location_type: matchedWarehouse?.location_type || '',
      warehouse: batch.warehouse || '',
      purchase_price: batch.purchase_price.toString(),
      entry_mode: batch.entry_mode || 'manual',
    });
    setShowStockModal(true);
  };

  const handleDeleteBatch = (id: string) => {
    if (confirm('Are you sure you want to delete this stock entry?')) {
      deleteBatch.mutate(id);
    }
  };

  const handleApproveStock = (id: string) => {
    updateBatchStatus.mutate({ id, status: 'approved' });
  };

  const handleRejectStock = (id: string) => {
    updateBatchStatus.mutate({ id, status: 'rejected' });
  };

  const handleCreateTransfer = async () => {
    const validItems = transferForm.items.filter(i => i.product_id && i.quantity);
    if (!transferForm.from_location && !transferForm.from_distributor_id) {
      toast.error('Please select source location');
      return;
    }
    if (!transferForm.to_location && !transferForm.to_distributor_id) {
      toast.error('Please select destination location');
      return;
    }
    if (validItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      await createTransfer.mutateAsync({
        from_location: transferForm.from_location,
        from_distributor_id: transferForm.from_distributor_id || undefined,
        to_location: transferForm.to_location,
        to_distributor_id: transferForm.to_distributor_id || undefined,
        notes: transferForm.notes || undefined,
        items: validItems.map(i => ({
          product_id: i.product_id,
          quantity: parseInt(i.quantity),
        })),
      });
      setShowTransferModal(false);
      setTransferForm({ from_location: '', from_distributor_id: '', to_location: '', to_distributor_id: '', notes: '', items: [{ product_id: '', quantity: '' }] });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleTransferStatusUpdate = (id: string, status: string) => {
    updateTransferStatus.mutate({ id, status });
  };

  const addTransferItem = () => {
    setTransferForm(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: '' }],
    }));
  };

  const updateTransferItem = (index: number, field: string, value: string) => {
    setTransferForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item),
    }));
  };

  const removeTransferItem = (index: number) => {
    if (transferForm.items.length > 1) {
      setTransferForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const handleExportToExcel = () => {
    toast.success('Export started. Download will begin shortly.');
  };

  const getExpiryStatusBadge = (status: ExpiryStatus, days: number) => {
    if (status === 'expired') {
      return <Badge variant="destructive" className="gap-1"><XCircle size={12} /> Expired</Badge>;
    }
    if (status === 'warning') {
      return <Badge variant="outline" className="gap-1 border-warning text-warning"><AlertTriangle size={12} /> {days} days</Badge>;
    }
    return <Badge variant="outline" className="gap-1 border-success text-success"><ShieldCheck size={12} /> Safe ({days} days)</Badge>;
  };

  const inventoryColumns = [
    {
      key: 'name',
      header: 'Product',
      render: (item: typeof inventorySummary[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">{item.product?.name || '-'}</p>
            <p className="text-xs text-muted-foreground">{item.product?.sku} • {item.product?.category || 'Uncategorized'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'warehouseStock',
      header: 'Warehouse',
      render: (item: typeof inventorySummary[0]) => <span className="font-medium">{item.warehouseStock.toLocaleString()}</span>,
    },
    {
      key: 'distributorStock',
      header: 'Distributor Stock',
      render: (item: typeof inventorySummary[0]) => (
        <div className="text-sm">
          {Object.entries(item.distributorStock).length > 0 ? (
            Object.entries(item.distributorStock).slice(0, 2).map(([dist, qty]) => (
              <div key={dist} className="flex justify-between">
                <span className="text-muted-foreground truncate max-w-[100px]">{dist.split(' ')[0]}:</span>
                <span>{(qty as number).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <span className="text-muted-foreground">--</span>
          )}
        </div>
      ),
    },
    {
      key: 'totalStock',
      header: 'Total',
      render: (item: typeof inventorySummary[0]) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{item.totalStock.toLocaleString()}</span>
          {item.isLowStock && (
            <Badge variant="destructive" className="text-xs">Low</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'expiryAlerts',
      header: 'Expiry Alerts',
      render: (item: typeof inventorySummary[0]) => (
        item.expiryAlerts > 0 ? (
          <Badge variant="outline" className="gap-1 border-warning text-warning">
            <AlertTriangle size={12} />
            {item.expiryAlerts}
          </Badge>
        ) : (
          <span className="text-muted-foreground">--</span>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Eye size={16} className="text-muted-foreground" />
        </button>
      ),
    },
  ];

  const stockEntryColumns = [
    {
      key: 'productName',
      header: 'Product',
      render: (item: InventoryBatch) => (
        <div>
          <p className="font-medium text-foreground">{item.product?.name || '-'}</p>
          <p className="text-xs text-muted-foreground">{item.product?.sku}</p>
        </div>
      ),
    },
    { key: 'batch_number', header: 'Batch #' },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (item: InventoryBatch) => <span className="font-medium">{item.quantity.toLocaleString()}</span>,
    },
    {
      key: 'dates',
      header: 'Mfg / Expiry',
      render: (item: InventoryBatch) => (
        <div className="text-sm">
          <p className="text-muted-foreground">Mfg: {item.manufacturing_date ? format(new Date(item.manufacturing_date), 'dd MMM yy') : '-'}</p>
          <p>Exp: {item.expiry_date ? format(new Date(item.expiry_date), 'dd MMM yy') : '-'}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (item: InventoryBatch) => (
        <div className="text-sm">
          <p>{item.distributor?.firm_name || item.warehouse || '-'}</p>
          <p className="text-xs text-muted-foreground">{item.distributor_id ? 'Distributor' : 'Warehouse'}</p>
        </div>
      ),
    },
    {
      key: 'purchase_price',
      header: 'Price',
      render: (item: InventoryBatch) => <span>₹{item.purchase_price.toLocaleString()}</span>,
    },
    {
      key: 'entry_mode',
      header: 'Entry Mode',
      render: (item: InventoryBatch) => (
        <Badge variant="secondary" className="text-xs capitalize">
          {item.entry_mode || 'Manual'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (item: InventoryBatch) => format(new Date(item.created_at), 'dd MMM yyyy'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: InventoryBatch) => <StatusBadge status={item.status as StatusType} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: InventoryBatch) => (
        <div className="flex items-center gap-1">
          {item.status === 'pending' && (
            <>
              <button
                onClick={() => handleApproveStock(item.id)}
                className="p-2 hover:bg-success/10 rounded-lg transition-colors"
                title="Approve"
              >
                <Check size={16} className="text-success" />
              </button>
              <button
                onClick={() => handleRejectStock(item.id)}
                className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                title="Reject"
              >
                <X size={16} className="text-destructive" />
              </button>
            </>
          )}
          <button 
            onClick={() => handleEditBatch(item)}
            className="p-2 hover:bg-muted rounded-lg transition-colors" 
            title="Edit"
          >
            <Edit size={16} className="text-muted-foreground" />
          </button>
          <button 
            onClick={() => handleDeleteBatch(item.id)}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors" 
            title="Delete"
          >
            <Trash2 size={16} className="text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  const expiryColumns = [
    {
      key: 'name',
      header: 'Product',
      render: (item: ExpiryAlert) => (
        <div>
          <p className="font-medium text-foreground">{item.product?.name || '-'}</p>
          <p className="text-xs text-muted-foreground">{item.product?.sku} • Batch: {item.batch_number}</p>
        </div>
      ),
    },
    {
      key: 'expiry_date',
      header: 'Expiry Date',
      render: (item: ExpiryAlert) => (
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-muted-foreground" />
          <span>{item.expiry_date ? format(new Date(item.expiry_date), 'dd MMM yyyy') : '-'}</span>
        </div>
      ),
    },
    {
      key: 'daysRemaining',
      header: 'Status',
      render: (item: ExpiryAlert) => getExpiryStatusBadge(item.expiryStatus, item.daysToExpiry),
    },
    {
      key: 'quantity',
      header: 'Qty Available',
      render: (item: ExpiryAlert) => <span className="font-medium">{item.quantity.toLocaleString()}</span>,
    },
    { key: 'location', header: 'Location' },
  ];

  const transferColumns = [
    {
      key: 'transfer_number',
      header: 'Transfer #',
      render: (item: StockTransfer) => (
        <p className="font-medium text-foreground">{item.transfer_number}</p>
      ),
    },
    {
      key: 'route',
      header: 'From → To',
      render: (item: StockTransfer) => (
        <div className="flex items-center gap-2 text-sm">
          <span>{item.from_distributor?.firm_name || item.from_location}</span>
          <ArrowRightLeft size={14} className="text-muted-foreground" />
          <span>{item.to_distributor?.firm_name || item.to_location}</span>
        </div>
      ),
    },
    {
      key: 'requested_by',
      header: 'Requested By',
      render: (item: StockTransfer) => <span>{item.requester?.name || '-'}</span>,
    },
    {
      key: 'approved_by',
      header: 'Approved By',
      render: (item: StockTransfer) => <span>{item.approver?.name || '-'}</span>,
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (item: StockTransfer) => format(new Date(item.created_at), 'dd MMM yyyy'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: StockTransfer) => <StatusBadge status={item.status as StatusType} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: StockTransfer) => (
        <div className="flex items-center gap-1">
          {item.status === 'pending' && (
            <>
              <button
                onClick={() => handleTransferStatusUpdate(item.id, 'approved')}
                className="p-1.5 hover:bg-success/10 rounded-lg transition-colors"
                title="Approve"
              >
                <Check size={14} className="text-success" />
              </button>
              <button
                onClick={() => handleTransferStatusUpdate(item.id, 'cancelled')}
                className="p-1.5 hover:bg-destructive/10 rounded-lg transition-colors"
                title="Cancel"
              >
                <X size={14} className="text-destructive" />
              </button>
            </>
          )}
          {item.status === 'approved' && (
            <button
              onClick={() => handleTransferStatusUpdate(item.id, 'in_transit')}
              className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-xs"
              title="Mark In Transit"
            >
              <Clock size={14} className="text-primary" />
            </button>
          )}
          {item.status === 'in_transit' && (
            <button
              onClick={() => handleTransferStatusUpdate(item.id, 'completed')}
              className="p-1.5 hover:bg-success/10 rounded-lg transition-colors"
              title="Mark Completed"
            >
              <Check size={14} className="text-success" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const stats = {
    totalSKUs: inventorySummary.length,
    lowStock: inventorySummary.filter(i => i.isLowStock).length,
    expiryAlerts: allExpiryItems.filter(e => e.expiryStatus !== 'safe').length,
    pendingTransfers: transfers.filter(t => t.status === 'pending' || t.status === 'in_transit').length,
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(2)} L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const isLoading = batchesLoading || transfersLoading;

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
          <h1 className="module-title">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels, manage batches, and monitor expiry</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportToExcel} className="btn-outline flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          <button 
            onClick={() => setShowTransferModal(true)}
            className="btn-outline flex items-center gap-2"
          >
            <ArrowRightLeft size={18} />
            Transfer Stock
          </button>
          <button 
            onClick={() => { resetStockForm(); setShowStockModal(true); }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Stock
          </button>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <Package size={20} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{formatNumber(inventoryKPIs.openingStock)}</p>
              <p className="text-xs text-muted-foreground">Opening Stock</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <ArrowDownToLine size={20} className="text-success" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{formatNumber(inventoryKPIs.inwards)}</p>
              <p className="text-xs text-muted-foreground">Inwards</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <ArrowUpFromLine size={20} className="text-destructive" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{formatNumber(inventoryKPIs.outwards)}</p>
              <p className="text-xs text-muted-foreground">Outwards</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Package size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{formatNumber(inventoryKPIs.closingStock)}</p>
              <p className="text-xs text-muted-foreground">Closing Stock</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/10">
              <DollarSign size={20} className="text-accent-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">₹{formatNumber(inventoryKPIs.inventoryValue)}</p>
              <p className="text-xs text-muted-foreground">Inventory Value</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-info/10">
              <Calendar size={20} className="text-info" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{inventoryKPIs.daysOfInventory}</p>
              <p className="text-xs text-muted-foreground">Days of Inventory</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Gauge size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{inventoryKPIs.stockTurnoverRatio}x</p>
              <p className="text-xs text-muted-foreground">Turnover Ratio</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <Zap size={20} className="text-success" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{inventoryKPIs.fastMoving}</p>
              <p className="text-xs text-muted-foreground">Fast Moving</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Snail size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{inventoryKPIs.slowMoving}</p>
              <p className="text-xs text-muted-foreground">Slow Moving</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-destructive/10">
              <Archive size={20} className="text-destructive" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{inventoryKPIs.deadStock}</p>
              <p className="text-xs text-muted-foreground">Dead Stock</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-warning/10">
              <Timer size={20} className="text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{inventoryKPIs.nearExpiry}</p>
              <p className="text-xs text-muted-foreground">Near Expiry</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Inventory Overview</TabsTrigger>
          <TabsTrigger value="stock-entry">Stock Entries</TabsTrigger>
          <TabsTrigger value="expiry">Expiry Alerts</TabsTrigger>
          <TabsTrigger value="transfers">Transfers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={(v) => setLocationFilter(v as LocationFilter)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="warehouse">Warehouse Only</SelectItem>
                <SelectItem value="distributor">Distributor Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable data={filteredInventory} columns={inventoryColumns} searchPlaceholder="Search inventory..." />
        </TabsContent>

        <TabsContent value="stock-entry" className="mt-4">
          <DataTable data={activeBatches} columns={stockEntryColumns} searchPlaceholder="Search stock entries..." />
        </TabsContent>

        <TabsContent value="expiry" className="mt-4">
          {/* Expiry Filter */}
          <div className="flex gap-4 mb-4">
            <Select value={expiryFilter} onValueChange={(v) => setExpiryFilter(v as ExpiryFilter)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="warning">Warning Only</SelectItem>
                <SelectItem value="expired">Expired Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable data={filteredExpiryAlerts} columns={expiryColumns} searchPlaceholder="Search expiry alerts..." />
        </TabsContent>

        <TabsContent value="transfers" className="mt-4">
          <DataTable data={transfers} columns={transferColumns} searchPlaceholder="Search transfers..." />
        </TabsContent>

      </Tabs>

      {/* Add/Edit Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">
                {editingBatch ? 'Edit Stock Entry' : 'Add Stock Entry'}
              </h2>
              <button onClick={() => { setShowStockModal(false); resetStockForm(); }} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product *</label>
                <select
                  value={stockForm.product_id}
                  onChange={e => setStockForm(prev => ({ ...prev, product_id: e.target.value }))}
                  className="input-field"
                  disabled={!!editingBatch}
                >
                  <option value="">Select Product</option>
                  {products.filter(p => p.status === 'active').map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Batch Number *</label>
                  <input
                    type="text"
                    value={stockForm.batch_number}
                    onChange={e => setStockForm(prev => ({ ...prev, batch_number: e.target.value }))}
                    className="input-field"
                    placeholder="e.g., BA2024001"
                    disabled={!!editingBatch}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={stockForm.quantity}
                    onChange={e => setStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="input-field"
                    placeholder="0"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Manufacturing Date</label>
                  <input
                    type="date"
                    value={stockForm.manufacturing_date}
                    onChange={e => setStockForm(prev => ({ ...prev, manufacturing_date: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Expiry Date *</label>
                  <input
                    type="date"
                    value={stockForm.expiry_date}
                    onChange={e => setStockForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location Type *</label>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={stockForm.location_type}
                    onChange={e => setStockForm(prev => ({ ...prev, location_type: e.target.value as 'central' | 'depot' | '', warehouse: '' }))}
                    className="input-field"
                  >
                    <option value="">Select Type</option>
                    {locationTypes.map(lt => (
                      <option key={lt.value} value={lt.value}>{lt.label}</option>
                    ))}
                  </select>
                  <select
                    value={stockForm.warehouse}
                    onChange={e => setStockForm(prev => ({ ...prev, warehouse: e.target.value }))}
                    className="input-field"
                    disabled={!stockForm.location_type}
                  >
                    <option value="">Select Warehouse</option>
                    {warehousesList
                      .filter(w => w.status === 'active' && w.location_type === stockForm.location_type)
                      .map(w => (
                        <option key={w.id} value={w.name}>{w.name} ({w.code})</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Purchase Price (₹)</label>
                  <input
                    type="number"
                    value={stockForm.purchase_price}
                    onChange={e => setStockForm(prev => ({ ...prev, purchase_price: e.target.value }))}
                    className="input-field"
                    placeholder="0.00"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Entry Mode</label>
                  <select
                    value={stockForm.entry_mode}
                    onChange={e => setStockForm(prev => ({ ...prev, entry_mode: e.target.value }))}
                    className="input-field"
                    disabled={!!editingBatch}
                  >
                    {entryModes.map(mode => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => { setShowStockModal(false); resetStockForm(); }} className="btn-outline flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleCreateStock}
                  disabled={createBatch.isPending || updateBatch.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {(createBatch.isPending || updateBatch.isPending) && <Loader2 size={16} className="animate-spin" />}
                  {editingBatch ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Stock Transfer Request</h2>
              <button onClick={() => setShowTransferModal(false)} className="p-2 hover:bg-muted rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">From *</label>
                <select
                  value={transferForm.from_location}
                  onChange={e => setTransferForm(prev => ({
                    ...prev,
                    from_location: e.target.value,
                    from_distributor_id: '',
                  }))}
                  className="input-field"
                >
                  <option value="">Select Source</option>
                  <optgroup label="Central Warehouses">
                    {warehousesList.filter(w => w.status === 'active' && w.location_type === 'central').map(w => (
                      <option key={w.id} value={w.name}>{w.name} ({w.code})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Depots">
                    {warehousesList.filter(w => w.status === 'active' && w.location_type === 'depot').map(w => (
                      <option key={w.id} value={w.name}>{w.name} ({w.code})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">To *</label>
                <select
                  value={transferForm.to_location}
                  onChange={e => setTransferForm(prev => ({
                    ...prev,
                    to_location: e.target.value,
                    to_distributor_id: '',
                  }))}
                  className="input-field"
                >
                  <option value="">Select Destination</option>
                  <optgroup label="Central Warehouses">
                    {warehousesList.filter(w => w.status === 'active' && w.location_type === 'central').map(w => (
                      <option key={w.id} value={w.name}>{w.name} ({w.code})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Depots">
                    {warehousesList.filter(w => w.status === 'active' && w.location_type === 'depot').map(w => (
                      <option key={w.id} value={w.name}>{w.name} ({w.code})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Items *</label>
                <div className="space-y-2">
                  {transferForm.items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={item.product_id}
                        onChange={e => updateTransferItem(index, 'product_id', e.target.value)}
                        className="input-field flex-1"
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateTransferItem(index, 'quantity', e.target.value)}
                        className="input-field w-24"
                        placeholder="Qty"
                        min="1"
                      />
                      {transferForm.items.length > 1 && (
                        <button
                          onClick={() => removeTransferItem(index)}
                          className="p-2 hover:bg-destructive/10 rounded-lg"
                        >
                          <X size={16} className="text-destructive" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addTransferItem} className="text-sm text-primary hover:underline">
                    + Add another item
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                <textarea
                  value={transferForm.notes}
                  onChange={e => setTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input-field"
                  rows={2}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowTransferModal(false)} className="btn-outline flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleCreateTransfer}
                  disabled={createTransfer.isPending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {createTransfer.isPending && <Loader2 size={16} className="animate-spin" />}
                  Create Transfer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}