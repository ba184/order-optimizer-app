import { useState } from 'react';
import { motion } from 'framer-motion';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Package,
  Plus,
  Image as ImageIcon,
  Edit,
  Trash2,
  Eye,
  FileText,
  Search,
} from 'lucide-react';

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  subCategory: string;
  mrp: number;
  ptr: number;
  gst: number;
  unit: string;
  packSize: number;
  status: 'active' | 'inactive';
}

const mockProducts: Product[] = [
  {
    id: 'p-001',
    sku: 'PA-500',
    name: 'Product Alpha 500ml',
    category: 'Beverages',
    subCategory: 'Energy Drinks',
    mrp: 150,
    ptr: 120,
    gst: 18,
    unit: 'Bottle',
    packSize: 24,
    status: 'active',
  },
  {
    id: 'p-002',
    sku: 'PB-1L',
    name: 'Product Beta 1L',
    category: 'Beverages',
    subCategory: 'Health Drinks',
    mrp: 275,
    ptr: 220,
    gst: 18,
    unit: 'Bottle',
    packSize: 12,
    status: 'active',
  },
  {
    id: 'p-003',
    sku: 'PG-250',
    name: 'Product Gamma 250g',
    category: 'Food',
    subCategory: 'Snacks',
    mrp: 110,
    ptr: 85,
    gst: 12,
    unit: 'Pack',
    packSize: 48,
    status: 'active',
  },
  {
    id: 'p-004',
    sku: 'PD-PK',
    name: 'Product Delta Pack',
    category: 'Combo',
    subCategory: 'Value Pack',
    mrp: 450,
    ptr: 350,
    gst: 18,
    unit: 'Combo',
    packSize: 6,
    status: 'active',
  },
  {
    id: 'p-005',
    sku: 'PE-2L',
    name: 'Product Epsilon 2L',
    category: 'Beverages',
    subCategory: 'Family Pack',
    mrp: 480,
    ptr: 380,
    gst: 18,
    unit: 'Bottle',
    packSize: 6,
    status: 'inactive',
  },
];

const columns = [
  {
    key: 'name',
    header: 'Product',
    render: (item: Product) => (
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          <Package size={24} className="text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="text-xs text-muted-foreground">SKU: {item.sku}</p>
        </div>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'category',
    header: 'Category',
    render: (item: Product) => (
      <div>
        <p className="text-sm">{item.category}</p>
        <p className="text-xs text-muted-foreground">{item.subCategory}</p>
      </div>
    ),
    sortable: true,
  },
  {
    key: 'mrp',
    header: 'MRP',
    render: (item: Product) => <span className="font-medium">₹{item.mrp}</span>,
    sortable: true,
  },
  {
    key: 'ptr',
    header: 'PTR',
    render: (item: Product) => <span className="font-medium text-primary">₹{item.ptr}</span>,
    sortable: true,
  },
  {
    key: 'gst',
    header: 'GST',
    render: (item: Product) => <span>{item.gst}%</span>,
  },
  {
    key: 'packSize',
    header: 'Pack Size',
    render: (item: Product) => <span>{item.packSize} {item.unit}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (item: Product) => <StatusBadge status={item.status} />,
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (item: Product) => (
      <div className="flex items-center gap-1">
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Eye size={16} className="text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Edit size={16} className="text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <FileText size={16} className="text-muted-foreground" />
        </button>
      </div>
    ),
  },
];

export default function ProductsPage() {
  const stats = {
    total: mockProducts.length,
    active: mockProducts.filter(p => p.status === 'active').length,
    inactive: mockProducts.filter(p => p.status === 'inactive').length,
    categories: [...new Set(mockProducts.map(p => p.category))].length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Product Master</h1>
          <p className="text-muted-foreground">Manage product catalog and pricing</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <Package size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-success/10">
              <Package size={24} className="text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-muted">
              <Package size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.inactive}</p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10">
              <ImageIcon size={24} className="text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.categories}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select className="input-field w-40">
          <option value="">All Categories</option>
          <option value="beverages">Beverages</option>
          <option value="food">Food</option>
          <option value="combo">Combo</option>
        </select>
        <select className="input-field w-40">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        data={mockProducts}
        columns={columns}
        searchPlaceholder="Search products by name or SKU..."
      />
    </div>
  );
}
