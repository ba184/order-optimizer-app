import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Package,
  FileText,
  Store,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  Loader2,
  Upload,
  FileSpreadsheet,
  Truck,
  Users,
  Image,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useDistributor, useCreateDistributor, useUpdateDistributor } from '@/hooks/useOutletsData';
import { useProducts } from '@/hooks/useProductsData';
import { useSchemes } from '@/hooks/useSchemesData';
import { useCountries, useStates, useCities, useZones } from '@/hooks/useGeoMasterData';
import {
  useDistributorProducts,
  useDistributorSchemes,
  useDistributorSecondaryCounters,
  useDistributorWarehouses,
  useDistributorPreorders,
  useDistributorVehicles,
  useDistributorStaff,
  useSaveDistributorExtendedData,
  uploadDistributorFile,
} from '@/hooks/useDistributorExtendedData';
import { supabase } from '@/integrations/supabase/client';

type Step = {
  id: string;
  title: string;
  icon: React.ElementType;
};

const steps: Step[] = [
  { id: 'basic', title: 'Basic Details', icon: Building2 },
  { id: 'commercial', title: 'Product & Commercial', icon: Package },
  { id: 'kyc', title: 'KYC Details', icon: FileText },
  { id: 'counters', title: 'Counters, Warehouses & Fleet', icon: Store },
  { id: 'preorder', title: 'Pre-Order & Staff', icon: ShoppingCart },
];

const distributorCategories = [
  { value: 'super_stockist', label: 'Super Stockist' },
  { value: 'stockist', label: 'Stockist' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'retail', label: 'Retail' },
  { value: 'standard', label: 'Standard' },
];

const paymentTermsOptions = [
  { value: 'credit', label: 'Credit' },
  { value: 'advance', label: 'Advance' },
  { value: 'net_15', label: 'Net 15 Days' },
  { value: 'net_30', label: 'Net 30 Days' },
  { value: 'net_45', label: 'Net 45 Days' },
  { value: 'net_60', label: 'Net 60 Days' },
];

const msmeTypes = [
  { value: 'micro', label: 'Micro' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
];

// GSTIN validation regex
const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export default function DistributorFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { user, userRole } = useAuth();
  const isAdmin = userRole === 'admin';

  // Fetch data
  const { data: distributor, isLoading: distributorLoading } = useDistributor(id || '');
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: schemes, isLoading: schemesLoading } = useSchemes();
  const { data: countries } = useCountries();
  const { data: states } = useStates();
  const { data: cities } = useCities();
  const { data: zones } = useZones();
  const { data: existingProducts } = useDistributorProducts(id);
  const { data: existingSchemes } = useDistributorSchemes(id);
  const { data: existingCounters } = useDistributorSecondaryCounters(id);
  const { data: existingWarehouses } = useDistributorWarehouses(id);
  const { data: existingPreorders } = useDistributorPreorders(id);
  const { data: existingVehicles } = useDistributorVehicles(id);
  const { data: existingStaff } = useDistributorStaff(id);

  // Mutations
  const createDistributor = useCreateDistributor();
  const updateDistributor = useUpdateDistributor();
  const saveExtendedData = useSaveDistributorExtendedData();

  // File input refs
  const agreementInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [uploadingAgreement, setUploadingAgreement] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState({
    // Step 1 - Basic Details
    firmName: '',
    gstNumber: '',
    category: 'standard',
    contactName: '',
    phone: '',
    email: '',
    altPhone: '',
    country: 'India',
    state: '',
    city: '',
    zone: '',
    pincode: '',
    address: '',
    
    // Step 2 - Product & Commercial
    selectedProducts: [] as string[],
    assignedSchemes: [] as string[],
    paymentTerms: 'net_30',
    creditLimit: 500000,
    
    // Step 3 - KYC Details
    panNumber: '',
    tanNumber: '',
    msmeRegistered: false,
    msmeType: '',
    msmeNumber: '',
    registeredAddress: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    agreementSigned: false,
    agreementFileUrl: '',
    kycStatus: 'pending',
    
    // Step 4 - Secondary Counters, Warehouse & Vehicles
    secondaryCounters: [] as { name: string; contactPerson: string; phone: string; address: string }[],
    warehouses: [] as { name: string; address: string; contactPerson: string; phone: string; photos: string[] }[],
    vehicles: [] as { vehicleNumber: string; vehicleType: string; capacity: string; photos: string[] }[],
    
    // Step 5 - Pre-Order & Staff Details
    preorders: [] as { productId: string; quantity: number; expectedDelivery: string }[],
    staff: [] as { name: string; role: string; phone: string; email: string }[],
  });

  // Load existing data for edit mode
  useEffect(() => {
    if (isEdit && distributor) {
      setFormData(prev => ({
        ...prev,
        firmName: distributor.firm_name || '',
        gstNumber: distributor.gstin || '',
        category: (distributor as any).category || 'standard',
        contactName: (distributor as any).contact_name || distributor.owner_name || '',
        phone: distributor.phone || '',
        email: distributor.email || '',
        altPhone: (distributor as any).alt_phone || '',
        country: (distributor as any).country || 'India',
        state: distributor.state || '',
        city: distributor.city || '',
        zone: (distributor as any).zone || '',
        pincode: (distributor as any).pincode || '',
        address: distributor.address || '',
        paymentTerms: distributor.payment_terms || 'net_30',
        creditLimit: Number(distributor.credit_limit) || 500000,
        panNumber: (distributor as any).pan_number || '',
        tanNumber: (distributor as any).tan_number || '',
        msmeRegistered: (distributor as any).msme_registered || false,
        msmeType: (distributor as any).msme_type || '',
        msmeNumber: (distributor as any).msme_number || '',
        registeredAddress: (distributor as any).registered_address || '',
        bankName: (distributor as any).bank_name || '',
        accountNumber: (distributor as any).account_number || '',
        ifscCode: (distributor as any).ifsc_code || '',
        agreementSigned: (distributor as any).agreement_signed || false,
        kycStatus: (distributor as any).kyc_status || 'pending',
      }));
    }
  }, [isEdit, distributor]);

  // Load extended data
  useEffect(() => {
    if (existingProducts?.length) {
      setFormData(prev => ({
        ...prev,
        selectedProducts: existingProducts.map(p => p.product_id),
      }));
    }
  }, [existingProducts]);

  useEffect(() => {
    if (existingSchemes?.length) {
      setFormData(prev => ({
        ...prev,
        assignedSchemes: existingSchemes.map(s => s.scheme_id),
      }));
    }
  }, [existingSchemes]);

  useEffect(() => {
    if (existingCounters?.length) {
      setFormData(prev => ({
        ...prev,
        secondaryCounters: existingCounters.map(c => ({
          name: c.name,
          contactPerson: (c as any).contact_person || '',
          phone: c.phone || '',
          address: c.address || '',
        })),
      }));
    }
  }, [existingCounters]);

  useEffect(() => {
    if (existingWarehouses?.length) {
      setFormData(prev => ({
        ...prev,
        warehouses: existingWarehouses.map(w => ({
          name: w.name,
          address: w.address || '',
          contactPerson: w.contact_person || '',
          phone: w.phone || '',
          photos: w.photos || [],
        })),
      }));
    }
  }, [existingWarehouses]);

  useEffect(() => {
    if (existingPreorders?.length) {
      setFormData(prev => ({
        ...prev,
        preorders: existingPreorders.map(p => ({
          productId: p.product_id || '',
          quantity: p.quantity,
          expectedDelivery: p.expected_delivery || '',
        })),
      }));
    }
  }, [existingPreorders]);

  useEffect(() => {
    if (existingVehicles?.length) {
      setFormData(prev => ({
        ...prev,
        vehicles: existingVehicles.map(v => ({
          vehicleNumber: v.vehicle_number,
          vehicleType: v.vehicle_type,
          capacity: v.capacity || '',
          photos: v.photos || [],
        })),
      }));
    }
  }, [existingVehicles]);

  useEffect(() => {
    if (existingStaff?.length) {
      setFormData(prev => ({
        ...prev,
        staff: existingStaff.map(s => ({
          name: s.name,
          role: s.role || '',
          phone: s.phone || '',
          email: s.email || '',
        })),
      }));
    }
  }, [existingStaff]);

  const validateStep = (stepIndex: number): boolean => {
    const errors: Record<string, string> = {};
    
    switch (stepIndex) {
      case 0: // Basic Details
        if (!formData.firmName.trim()) errors.firmName = 'Firm Name is required';
        if (!formData.contactName.trim()) errors.contactName = 'Contact Name is required';
        if (!formData.phone.trim()) errors.phone = 'Phone Number is required';
        if (formData.gstNumber && !gstinRegex.test(formData.gstNumber)) {
          errors.gstNumber = 'Invalid GSTIN format';
        }
        break;
      case 1: // Product & Commercial
        // No required fields
        break;
      case 2: // KYC Details
        // No required fields, but validate formats if provided
        break;
      case 3: // Secondary Counters & Warehouse
        // No required fields
        break;
      case 4: // Pre-Order Details
        // No required fields
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProductToggle = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(productId)
        ? prev.selectedProducts.filter(id => id !== productId)
        : [...prev.selectedProducts, productId],
    }));
  };

  const handleSchemeToggle = (schemeId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedSchemes: prev.assignedSchemes.includes(schemeId)
        ? prev.assignedSchemes.filter(id => id !== schemeId)
        : [...prev.assignedSchemes, schemeId],
    }));
  };

  const addSecondaryCounter = () => {
    setFormData(prev => ({
      ...prev,
      secondaryCounters: [...prev.secondaryCounters, { name: '', contactPerson: '', phone: '', address: '' }],
    }));
  };

  const removeSecondaryCounter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      secondaryCounters: prev.secondaryCounters.filter((_, i) => i !== index),
    }));
  };

  const addWarehouse = () => {
    setFormData(prev => ({
      ...prev,
      warehouses: [...prev.warehouses, { name: '', address: '', contactPerson: '', phone: '', photos: [] }],
    }));
  };

  const removeWarehouse = (index: number) => {
    setFormData(prev => ({
      ...prev,
      warehouses: prev.warehouses.filter((_, i) => i !== index),
    }));
  };

  const addVehicle = () => {
    setFormData(prev => ({
      ...prev,
      vehicles: [...prev.vehicles, { vehicleNumber: '', vehicleType: 'van', capacity: '', photos: [] }],
    }));
  };

  const removeVehicle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index),
    }));
  };

  const addStaff = () => {
    setFormData(prev => ({
      ...prev,
      staff: [...prev.staff, { name: '', role: '', phone: '', email: '' }],
    }));
  };

  const removeStaff = (index: number) => {
    setFormData(prev => ({
      ...prev,
      staff: prev.staff.filter((_, i) => i !== index),
    }));
  };

  const addPreorder = () => {
    setFormData(prev => ({
      ...prev,
      preorders: [...prev.preorders, { productId: '', quantity: 0, expectedDelivery: '' }],
    }));
  };

  const removePreorder = (index: number) => {
    setFormData(prev => ({
      ...prev,
      preorders: prev.preorders.filter((_, i) => i !== index),
    }));
  };

  // File upload handlers
  const handleAgreementUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }
    
    setUploadingAgreement(true);
    try {
      const tempId = id || `temp-${Date.now()}`;
      const url = await uploadDistributorFile(file, tempId, 'agreements');
      setFormData(prev => ({ ...prev, agreementFileUrl: url, agreementSigned: true }));
      toast.success('Agreement uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload agreement: ' + error.message);
    } finally {
      setUploadingAgreement(false);
    }
  };

  const handleWarehousePhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingPhotos(prev => ({ ...prev, [`warehouse-${index}`]: true }));
    try {
      const tempId = id || `temp-${Date.now()}`;
      const url = await uploadDistributorFile(file, tempId, `warehouses/${index}`);
      setFormData(prev => {
        const warehouses = [...prev.warehouses];
        warehouses[index] = { ...warehouses[index], photos: [...warehouses[index].photos, url] };
        return { ...prev, warehouses };
      });
      toast.success('Photo uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload photo: ' + error.message);
    } finally {
      setUploadingPhotos(prev => ({ ...prev, [`warehouse-${index}`]: false }));
    }
  };

  const handleVehiclePhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingPhotos(prev => ({ ...prev, [`vehicle-${index}`]: true }));
    try {
      const tempId = id || `temp-${Date.now()}`;
      const url = await uploadDistributorFile(file, tempId, `vehicles/${index}`);
      setFormData(prev => {
        const vehicles = [...prev.vehicles];
        vehicles[index] = { ...vehicles[index], photos: [...vehicles[index].photos, url] };
        return { ...prev, vehicles };
      });
      toast.success('Photo uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload photo: ' + error.message);
    } finally {
      setUploadingPhotos(prev => ({ ...prev, [`vehicle-${index}`]: false }));
    }
  };

  const removeWarehousePhoto = (warehouseIndex: number, photoIndex: number) => {
    setFormData(prev => {
      const warehouses = [...prev.warehouses];
      warehouses[warehouseIndex] = {
        ...warehouses[warehouseIndex],
        photos: warehouses[warehouseIndex].photos.filter((_, i) => i !== photoIndex),
      };
      return { ...prev, warehouses };
    });
  };

  const removeVehiclePhoto = (vehicleIndex: number, photoIndex: number) => {
    setFormData(prev => {
      const vehicles = [...prev.vehicles];
      vehicles[vehicleIndex] = {
        ...vehicles[vehicleIndex],
        photos: vehicles[vehicleIndex].photos.filter((_, i) => i !== photoIndex),
      };
      return { ...prev, vehicles };
    });
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Simple CSV parsing for secondary counters
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const counters = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          return {
            name: values[headers.indexOf('name')] || values[0] || '',
            contactPerson: values[headers.indexOf('contact')] || values[headers.indexOf('contact_person')] || values[1] || '',
            phone: values[headers.indexOf('phone')] || values[2] || '',
            address: values[headers.indexOf('address')] || values[3] || '',
          };
        }).filter(c => c.name);
        
        if (counters.length > 0) {
          setFormData(prev => ({
            ...prev,
            secondaryCounters: [...prev.secondaryCounters, ...counters],
          }));
          toast.success(`Imported ${counters.length} secondary counters`);
        } else {
          toast.error('No valid data found in file');
        }
      } catch (error) {
        toast.error('Failed to parse file. Please use CSV format with headers: name, contact, phone, address');
      }
    };
    reader.readAsText(file);
  };

  const calculatePreorderValue = () => {
    return formData.preorders.reduce((total, po) => {
      const product = products?.find(p => p.id === po.productId);
      if (product) {
        return total + (Number(product.ptr) * po.quantity);
      }
      return total;
    }, 0);
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateCode = () => {
    const prefix = 'DIST';
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    return `${prefix}-${timestamp}`;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    if (!formData.firmName || !formData.contactName || !formData.phone) {
      toast.error('Please fill in required fields: Firm Name, Contact Name, Phone');
      return;
    }

    try {
      // Determine approval status based on user role
      const approvalStatus = isAdmin ? 'approved' : 'pending';
      
      const distributorData = {
        code: isEdit ? undefined : generateCode(),
        firm_name: formData.firmName,
        owner_name: formData.contactName, // Map to existing column
        contact_name: formData.contactName,
        gstin: formData.gstNumber || undefined,
        phone: formData.phone,
        email: formData.email || undefined,
        alt_phone: formData.altPhone || undefined,
        country: formData.country,
        state: formData.state || undefined,
        city: formData.city || undefined,
        zone: formData.zone || undefined,
        pincode: formData.pincode || undefined,
        address: formData.address || undefined,
        category: formData.category,
        credit_limit: formData.creditLimit,
        payment_terms: formData.paymentTerms,
        interested_products: formData.selectedProducts,
        pan_number: formData.panNumber || undefined,
        tan_number: formData.tanNumber || undefined,
        msme_registered: formData.msmeRegistered,
        msme_type: formData.msmeType || undefined,
        msme_number: formData.msmeNumber || undefined,
        registered_address: formData.registeredAddress || undefined,
        bank_name: formData.bankName || undefined,
        account_number: formData.accountNumber || undefined,
        ifsc_code: formData.ifscCode || undefined,
        agreement_signed: formData.agreementSigned,
        agreement_file_url: formData.agreementFileUrl || undefined,
        kyc_status: formData.kycStatus,
        approval_status: approvalStatus,
        status: approvalStatus === 'approved' ? 'active' : 'pending',
        created_by: isEdit ? undefined : user?.id,
        approved_by: approvalStatus === 'approved' ? user?.id : undefined,
        approved_at: approvalStatus === 'approved' ? new Date().toISOString() : undefined,
      };

      let distributorId = id;

      if (isEdit && id) {
        await updateDistributor.mutateAsync({ id, ...distributorData });
      } else {
        const result = await createDistributor.mutateAsync(distributorData as any);
        distributorId = result.id;
      }

      // Save extended data
      if (distributorId) {
        await saveExtendedData.mutateAsync({
          distributorId,
          products: formData.selectedProducts.map(productId => ({
            product_id: productId,
            margin_percent: 0,
          })),
          pricingTiers: [],
          schemes: formData.assignedSchemes,
          kycDocuments: [],
          secondaryCounters: formData.secondaryCounters
            .filter(c => c.name)
            .map(c => ({
              name: c.name,
              contact_person: c.contactPerson || undefined,
              address: c.address || undefined,
              phone: c.phone || undefined,
            })),
          warehouses: formData.warehouses
            .filter(w => w.name)
            .map(w => ({
              name: w.name,
              address: w.address || undefined,
              contact_person: w.contactPerson || undefined,
              phone: w.phone || undefined,
              photos: w.photos || [],
            })),
          preorders: formData.preorders
            .filter(p => p.productId && p.quantity > 0)
            .map(p => ({
              product_id: p.productId,
              quantity: p.quantity,
              expected_delivery: p.expectedDelivery || undefined,
              preorder_value: (() => {
                const product = products?.find(pr => pr.id === p.productId);
                return product ? Number(product.ptr) * p.quantity : 0;
              })(),
            })),
          vehicles: formData.vehicles
            .filter(v => v.vehicleNumber)
            .map(v => ({
              vehicle_number: v.vehicleNumber,
              vehicle_type: v.vehicleType,
              capacity: v.capacity || undefined,
              photos: v.photos || [],
            })),
          staff: formData.staff
            .filter(s => s.name)
            .map(s => ({
              name: s.name,
              role: s.role || undefined,
              phone: s.phone || undefined,
              email: s.email || undefined,
            })),
        });
      }

      toast.success(isEdit ? 'Distributor updated successfully' : 'Distributor created successfully');
      navigate('/outlets/distributors');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save distributor');
    }
  };

  const isLoading = distributorLoading || productsLoading || schemesLoading;
  const isSaving = createDistributor.isPending || updateDistributor.isPending || saveExtendedData.isPending;

  // Check if distributor is rejected and can be edited
  const isRejected = distributor && (distributor as any).approval_status === 'rejected';

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'basic':
        return (
          <div className="space-y-6">
            {/* Business Details */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">1.1 Business Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Firm Name *</label>
                  <input
                    type="text"
                    value={formData.firmName}
                    onChange={e => setFormData({ ...formData, firmName: e.target.value })}
                    placeholder="Enter firm name"
                    className={`input-field ${validationErrors.firmName ? 'border-destructive' : ''}`}
                  />
                  {validationErrors.firmName && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.firmName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">GST Number (GSTIN)</label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={e => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                    placeholder="22AAAAA0000A1Z5"
                    className={`input-field ${validationErrors.gstNumber ? 'border-destructive' : ''}`}
                  />
                  {validationErrors.gstNumber && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.gstNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Distributor Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    {distributorCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">1.2 Contact Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Contact Name *</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Enter contact name"
                    className={`input-field ${validationErrors.contactName ? 'border-destructive' : ''}`}
                  />
                  {validationErrors.contactName && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.contactName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="+91 98765 43210"
                    className={`input-field ${validationErrors.phone ? 'border-destructive' : ''}`}
                  />
                  {validationErrors.phone && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email ID</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Alternate Phone Number</label>
                  <input
                    type="tel"
                    value={formData.altPhone}
                    onChange={e => setFormData({ ...formData, altPhone: e.target.value.replace(/\D/g, '') })}
                    placeholder="Alternate phone"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Country</label>
                  <select
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value, state: '', city: '' })}
                    className="input-field"
                  >
                    <option value="India">India</option>
                    {countries?.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">State</label>
                  <select
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value, city: '' })}
                    className="input-field"
                  >
                    <option value="">Select State</option>
                    {states?.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">City</label>
                  <select
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select City</option>
                    {cities?.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Zone</label>
                  <select
                    value={formData.zone}
                    onChange={e => setFormData({ ...formData, zone: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Zone</option>
                    {zones?.map(z => (
                      <option key={z.id} value={z.name}>{z.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="110001"
                    maxLength={6}
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                    rows={3}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'commercial':
        return (
          <div className="space-y-6">
            {/* Product & Pricing */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">2.1 Product & Pricing</h3>
              <p className="text-sm text-muted-foreground mb-4">Select interested products (Price lists will be auto-mapped)</p>
              
              {productsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : products?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No products available.
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                  {products?.map(product => {
                    const isSelected = formData.selectedProducts.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleProductToggle(product.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`}>
                            {isSelected && <Check size={10} className="text-primary-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              PTR: ₹{product.ptr} | MRP: ₹{product.mrp}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-2">{formData.selectedProducts.length} products selected</p>
            </div>

            {/* Commercial Terms */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">2.2 Commercial Terms</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Scheme Selection</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-3">
                    {schemesLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    ) : schemes?.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No schemes available</p>
                    ) : (
                      schemes?.map(scheme => (
                        <div
                          key={scheme.id}
                          onClick={() => handleSchemeToggle(scheme.id)}
                          className={`p-2 rounded-lg cursor-pointer transition-all flex items-center gap-2 ${
                            formData.assignedSchemes.includes(scheme.id)
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            formData.assignedSchemes.includes(scheme.id)
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}>
                            {formData.assignedSchemes.includes(scheme.id) && (
                              <Check size={10} className="text-primary-foreground" />
                            )}
                          </div>
                          <span className="text-sm">{scheme.name}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Payment Terms</label>
                    <select
                      value={formData.paymentTerms}
                      onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                      className="input-field"
                    >
                      {paymentTermsOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Credit Limit (₹)</label>
                    <input
                      type="number"
                      value={formData.creditLimit}
                      onChange={e => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'kyc':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">KYC Details</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">PAN</label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={e => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">GST</label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={e => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                  placeholder="22AAAAA0000A1Z5"
                  className="input-field"
                  disabled
                />
                <p className="text-xs text-muted-foreground mt-1">From Step 1</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">TAN</label>
                <input
                  type="text"
                  value={formData.tanNumber}
                  onChange={e => setFormData({ ...formData, tanNumber: e.target.value.toUpperCase() })}
                  placeholder="ABCD12345E"
                  maxLength={10}
                  className="input-field"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <input
                  type="checkbox"
                  id="msmeRegistered"
                  checked={formData.msmeRegistered}
                  onChange={e => setFormData({ ...formData, msmeRegistered: e.target.checked })}
                  className="w-5 h-5 rounded border-border"
                />
                <label htmlFor="msmeRegistered" className="text-foreground font-medium">
                  Registered MSME
                </label>
              </div>
              {formData.msmeRegistered && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Type of MSME</label>
                    <select
                      value={formData.msmeType}
                      onChange={e => setFormData({ ...formData, msmeType: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select Type</option>
                      {msmeTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">MSME Registration No</label>
                    <input
                      type="text"
                      value={formData.msmeNumber}
                      onChange={e => setFormData({ ...formData, msmeNumber: e.target.value })}
                      placeholder="UDYAM-XX-00-0000000"
                      className="input-field"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Registered Address</label>
              <textarea
                value={formData.registeredAddress}
                onChange={e => setFormData({ ...formData, registeredAddress: e.target.value })}
                placeholder="Enter registered address"
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bank Name</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="Bank name"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Account Number</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={e => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="Account number"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={e => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="SBIN0001234"
                  maxLength={11}
                  className="input-field"
                />
              </div>
            </div>

            {/* Agreement Upload Section */}
            <div className="p-4 border border-border rounded-xl space-y-4">
              <h4 className="font-medium text-foreground">Agreement Document</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <input
                    type="checkbox"
                    id="agreementSigned"
                    checked={formData.agreementSigned}
                    onChange={e => setFormData({ ...formData, agreementSigned: e.target.checked })}
                    className="w-5 h-5 rounded border-border"
                  />
                  <label htmlFor="agreementSigned" className="text-foreground font-medium">
                    Agreement Signed
                  </label>
                </div>
                <div className="flex-1">
                  <input
                    ref={agreementInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleAgreementUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => agreementInputRef.current?.click()}
                    disabled={uploadingAgreement}
                    className="btn-outline flex items-center gap-2"
                  >
                    {uploadingAgreement ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Upload size={16} />
                    )}
                    Upload Agreement PDF
                  </button>
                </div>
              </div>
              {formData.agreementFileUrl && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <Check size={16} />
                  <span>Agreement uploaded</span>
                  <a
                    href={formData.agreementFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    View PDF
                  </a>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">KYC Status</label>
                <select
                  value={formData.kycStatus}
                  onChange={e => setFormData({ ...formData, kycStatus: e.target.value })}
                  className="input-field"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'counters':
        return (
          <div className="space-y-6">
            {/* Secondary Counters */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">4.1 Secondary Counter</h3>
                  <p className="text-sm text-muted-foreground">Add secondary business locations (repeatable)</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={excelInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleExcelImport}
                    className="hidden"
                  />
                  <button
                    onClick={() => excelInputRef.current?.click()}
                    className="btn-outline text-sm flex items-center gap-1"
                  >
                    <FileSpreadsheet size={14} /> Import Excel/CSV
                  </button>
                  <button onClick={addSecondaryCounter} className="btn-outline text-sm flex items-center gap-1">
                    <Plus size={14} /> Add Counter
                  </button>
                </div>
              </div>

              {formData.secondaryCounters.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                  <Store size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No secondary counters added</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.secondaryCounters.map((counter, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-foreground">Counter {index + 1}</h5>
                        <button
                          onClick={() => removeSecondaryCounter(index)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Counter Name</label>
                          <input
                            type="text"
                            value={counter.name}
                            onChange={e => {
                              const counters = [...formData.secondaryCounters];
                              counters[index].name = e.target.value;
                              setFormData({ ...formData, secondaryCounters: counters });
                            }}
                            placeholder="Counter name"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Contact Person</label>
                          <input
                            type="text"
                            value={counter.contactPerson}
                            onChange={e => {
                              const counters = [...formData.secondaryCounters];
                              counters[index].contactPerson = e.target.value;
                              setFormData({ ...formData, secondaryCounters: counters });
                            }}
                            placeholder="Contact person"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={counter.phone}
                            onChange={e => {
                              const counters = [...formData.secondaryCounters];
                              counters[index].phone = e.target.value.replace(/\D/g, '');
                              setFormData({ ...formData, secondaryCounters: counters });
                            }}
                            placeholder="Phone number"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Address</label>
                          <textarea
                            value={counter.address}
                            onChange={e => {
                              const counters = [...formData.secondaryCounters];
                              counters[index].address = e.target.value;
                              setFormData({ ...formData, secondaryCounters: counters });
                            }}
                            placeholder="Address"
                            rows={2}
                            className="input-field resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Warehouse Details */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">4.2 Warehouse Details</h3>
                  <p className="text-sm text-muted-foreground">Optional warehouse information</p>
                </div>
                <button onClick={addWarehouse} className="btn-outline text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Warehouse
                </button>
              </div>

              {formData.warehouses.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                  <Building2 size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No warehouses added (optional)</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.warehouses.map((warehouse, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-foreground">Warehouse {index + 1}</h5>
                        <button
                          onClick={() => removeWarehouse(index)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Warehouse Name</label>
                          <input
                            type="text"
                            value={warehouse.name}
                            onChange={e => {
                              const warehouses = [...formData.warehouses];
                              warehouses[index].name = e.target.value;
                              setFormData({ ...formData, warehouses });
                            }}
                            placeholder="Warehouse name"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Contact Person</label>
                          <input
                            type="text"
                            value={warehouse.contactPerson}
                            onChange={e => {
                              const warehouses = [...formData.warehouses];
                              warehouses[index].contactPerson = e.target.value;
                              setFormData({ ...formData, warehouses });
                            }}
                            placeholder="Contact person"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={warehouse.phone}
                            onChange={e => {
                              const warehouses = [...formData.warehouses];
                              warehouses[index].phone = e.target.value.replace(/\D/g, '');
                              setFormData({ ...formData, warehouses });
                            }}
                            placeholder="Phone number"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Address</label>
                          <textarea
                            value={warehouse.address}
                            onChange={e => {
                              const warehouses = [...formData.warehouses];
                              warehouses[index].address = e.target.value;
                              setFormData({ ...formData, warehouses });
                            }}
                            placeholder="Address"
                            rows={2}
                            className="input-field resize-none"
                          />
                        </div>
                      </div>
                      {/* Warehouse Photos */}
                      <div className="mt-4">
                        <label className="block text-xs text-muted-foreground mb-2">Photos</label>
                        <div className="flex flex-wrap gap-2">
                          {warehouse.photos.map((photo, photoIdx) => (
                            <div key={photoIdx} className="relative group">
                              <img src={photo} alt="" className="w-20 h-20 object-cover rounded-lg" />
                              <button
                                onClick={() => removeWarehousePhoto(index, photoIdx)}
                                className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                          <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                            {uploadingPhotos[`warehouse-${index}`] ? (
                              <Loader2 size={20} className="animate-spin text-muted-foreground" />
                            ) : (
                              <Image size={20} className="text-muted-foreground" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleWarehousePhotoUpload(index, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delivery Vehicles */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">4.3 Delivery Vehicles</h3>
                  <p className="text-sm text-muted-foreground">Vehicle fleet details with photos</p>
                </div>
                <button onClick={addVehicle} className="btn-outline text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Vehicle
                </button>
              </div>

              {formData.vehicles.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                  <Truck size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No vehicles added</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.vehicles.map((vehicle, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-foreground">Vehicle {index + 1}</h5>
                        <button onClick={() => removeVehicle(index)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Vehicle Number</label>
                          <input
                            type="text"
                            value={vehicle.vehicleNumber}
                            onChange={e => {
                              const vehicles = [...formData.vehicles];
                              vehicles[index].vehicleNumber = e.target.value.toUpperCase();
                              setFormData({ ...formData, vehicles });
                            }}
                            placeholder="MH12AB1234"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Vehicle Type</label>
                          <select
                            value={vehicle.vehicleType}
                            onChange={e => {
                              const vehicles = [...formData.vehicles];
                              vehicles[index].vehicleType = e.target.value;
                              setFormData({ ...formData, vehicles });
                            }}
                            className="input-field"
                          >
                            <option value="bike">Bike</option>
                            <option value="van">Van</option>
                            <option value="tempo">Tempo</option>
                            <option value="truck">Truck</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Capacity</label>
                          <input
                            type="text"
                            value={vehicle.capacity}
                            onChange={e => {
                              const vehicles = [...formData.vehicles];
                              vehicles[index].capacity = e.target.value;
                              setFormData({ ...formData, vehicles });
                            }}
                            placeholder="e.g., 500 kg"
                            className="input-field"
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {vehicle.photos.map((photo, photoIdx) => (
                          <div key={photoIdx} className="relative group">
                            <img src={photo} alt="" className="w-20 h-20 object-cover rounded-lg" />
                            <button
                              onClick={() => removeVehiclePhoto(index, photoIdx)}
                              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                          {uploadingPhotos[`vehicle-${index}`] ? (
                            <Loader2 size={20} className="animate-spin text-muted-foreground" />
                          ) : (
                            <Image size={20} className="text-muted-foreground" />
                          )}
                          <input type="file" accept="image/*" onChange={(e) => handleVehiclePhotoUpload(index, e)} className="hidden" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'preorder':
        return (
          <div className="space-y-6">
            {/* Staff Details */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">5.1 Staff Details</h3>
                  <p className="text-sm text-muted-foreground">Add distributor staff members</p>
                </div>
                <button onClick={addStaff} className="btn-outline text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Staff
                </button>
              </div>

              {formData.staff.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                  <Users size={40} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No staff added</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.staff.map((member, index) => (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-foreground">Staff {index + 1}</h5>
                        <button onClick={() => removeStaff(index)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Name</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={e => {
                              const staff = [...formData.staff];
                              staff[index].name = e.target.value;
                              setFormData({ ...formData, staff });
                            }}
                            placeholder="Staff name"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Role</label>
                          <input
                            type="text"
                            value={member.role}
                            onChange={e => {
                              const staff = [...formData.staff];
                              staff[index].role = e.target.value;
                              setFormData({ ...formData, staff });
                            }}
                            placeholder="e.g., Driver, Salesman"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Phone</label>
                          <input
                            type="tel"
                            value={member.phone}
                            onChange={e => {
                              const staff = [...formData.staff];
                              staff[index].phone = e.target.value.replace(/\D/g, '');
                              setFormData({ ...formData, staff });
                            }}
                            placeholder="Phone number"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Email</label>
                          <input
                            type="email"
                            value={member.email}
                            onChange={e => {
                              const staff = [...formData.staff];
                              staff[index].email = e.target.value;
                              setFormData({ ...formData, staff });
                            }}
                            placeholder="Email"
                            className="input-field"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pre-Orders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">5.2 Pre-Order Details</h3>
                  <p className="text-sm text-muted-foreground">Add pre-order products for this distributor</p>
                </div>
                <button onClick={addPreorder} className="btn-outline text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Pre-Order
                </button>
              </div>

            {formData.preorders.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-border rounded-xl text-center">
                <ShoppingCart size={40} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No pre-orders added</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.preorders.map((preorder, index) => {
                  const selectedProduct = products?.find(p => p.id === preorder.productId);
                  const lineValue = selectedProduct ? Number(selectedProduct.ptr) * preorder.quantity : 0;
                  
                  return (
                    <div key={index} className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-foreground">Pre-Order {index + 1}</h5>
                        <button
                          onClick={() => removePreorder(index)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs text-muted-foreground mb-1">Pre-Order Product</label>
                          <select
                            value={preorder.productId}
                            onChange={e => {
                              const preorders = [...formData.preorders];
                              preorders[index].productId = e.target.value;
                              setFormData({ ...formData, preorders });
                            }}
                            className="input-field"
                          >
                            <option value="">Select Product</option>
                            {products?.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (₹{p.ptr})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Quantity</label>
                          <input
                            type="number"
                            value={preorder.quantity}
                            onChange={e => {
                              const preorders = [...formData.preorders];
                              preorders[index].quantity = Number(e.target.value);
                              setFormData({ ...formData, preorders });
                            }}
                            min="0"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Expected Delivery</label>
                          <input
                            type="date"
                            value={preorder.expectedDelivery}
                            onChange={e => {
                              const preorders = [...formData.preorders];
                              preorders[index].expectedDelivery = e.target.value;
                              setFormData({ ...formData, preorders });
                            }}
                            className="input-field"
                          />
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <span className="text-sm text-muted-foreground">Line Value: </span>
                        <span className="font-medium text-foreground">₹{lineValue.toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {formData.preorders.length > 0 && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Total Pre-Order Value (Auto-calculated)</span>
                  <span className="text-xl font-bold text-primary">₹{calculatePreorderValue().toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading && isEdit) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/outlets/distributors')} className="p-2 hover:bg-muted rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEdit ? 'Edit Distributor' : 'Add New Distributor'}
            </h1>
            <p className="text-muted-foreground">
              {isEdit 
                ? isRejected 
                  ? 'Edit and resubmit rejected distributor'
                  : 'Update distributor information' 
                : isAdmin 
                  ? 'Distributor will be auto-approved' 
                  : 'Distributor will require admin approval'}
            </p>
          </div>
        </div>
        {isRejected && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-destructive/10 text-destructive">
            Previously Rejected
          </span>
        )}
      </div>

      {/* Steps Indicator */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between overflow-x-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex items-center min-w-max">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`flex flex-col items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : isCompleted
                      ? 'text-success'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted'
                  }`}>
                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <span className="text-xs font-medium hidden md:block">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    isCompleted ? 'bg-success' : 'bg-border'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card rounded-xl border border-border p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="btn-outline flex items-center gap-2 disabled:opacity-50"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="flex items-center gap-3">
          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className="btn-primary flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
              {isEdit ? 'Update Distributor' : 'Create Distributor'}
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary flex items-center gap-2">
              Next
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}