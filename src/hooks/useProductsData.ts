import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Product {
  id: string;
  product_code: string | null;
  product_type: string | null;
  name: string;
  sku: string;
  variant: string | null;
  category: string | null;
  pack_type: string | null;
  sku_size: string | null;
  pack_size: string | null;
  mrp: number;
  ptr: number;
  pts: number | null;
  gst: number;
  stock: number;
  status: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductData {
  product_type?: string;
  name: string;
  sku: string;
  variant?: string;
  category?: string;
  pack_type?: string;
  sku_size?: string;
  pack_size?: string;
  mrp: number;
  ptr: number;
  pts?: number;
  gst: number;
  stock?: number;
  status?: string;
}

export function useProducts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user,
  });
}

export function useProduct(id: string | undefined) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: CreateProductData) => {
      const { data, error } = await supabase
        .from('products')
        .insert({
          product_type: productData.product_type || 'product',
          name: productData.name,
          sku: productData.sku,
          variant: productData.variant || null,
          category: productData.category || productData.variant || null,
          pack_type: productData.pack_type || null,
          sku_size: productData.sku_size || null,
          pack_size: productData.pack_size || null,
          mrp: productData.mrp || 0,
          ptr: productData.ptr || 0,
          pts: productData.pts || 0,
          gst: productData.gst || 0,
          stock: productData.stock || 0,
          status: productData.status || 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...productData }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          product_type: productData.product_type,
          name: productData.name,
          sku: productData.sku,
          variant: productData.variant,
          category: productData.category || productData.variant,
          pack_type: productData.pack_type,
          sku_size: productData.sku_size,
          pack_size: productData.pack_size,
          mrp: productData.mrp,
          ptr: productData.ptr,
          pts: productData.pts,
          gst: productData.gst,
          stock: productData.stock,
          status: productData.status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
}
