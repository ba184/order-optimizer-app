-- Extend distributors table with additional columns
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS payment_terms TEXT DEFAULT '30';
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS agreement_start_date DATE;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS agreement_end_date DATE;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS territory_exclusive BOOLEAN DEFAULT false;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS minimum_order_value NUMERIC DEFAULT 0;
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS return_policy TEXT DEFAULT 'standard';
ALTER TABLE distributors ADD COLUMN IF NOT EXISTS agreement_file_url TEXT;

-- Extend retailers table with additional columns
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS alt_phone TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS pincode TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS shop_area TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS employee_count INTEGER DEFAULT 1;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS years_in_business INTEGER DEFAULT 1;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS shop_type TEXT DEFAULT 'kirana';
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS weekly_off TEXT DEFAULT 'sunday';
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS market_share TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS competitor_strength TEXT;
ALTER TABLE retailers ADD COLUMN IF NOT EXISTS opportunities TEXT;

-- Distributor Products (many-to-many with margin)
CREATE TABLE distributor_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  margin_percent NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(distributor_id, product_id)
);

-- Distributor Pricing Tiers
CREATE TABLE distributor_pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  min_qty INTEGER NOT NULL,
  max_qty INTEGER NOT NULL,
  margin_percent NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Distributor Schemes (many-to-many)
CREATE TABLE distributor_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(distributor_id, scheme_id)
);

-- Distributor KYC Documents
CREATE TABLE distributor_kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Distributor Secondary Counters
CREATE TABLE distributor_secondary_counters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  distributor_id UUID NOT NULL REFERENCES distributors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Retailer Competitor Analysis
CREATE TABLE retailer_competitor_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  products TEXT,
  pricing TEXT,
  display_quality TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Retailer Schemes (many-to-many)
CREATE TABLE retailer_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(retailer_id, scheme_id)
);

-- Retailer Images
CREATE TABLE retailer_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE distributor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE distributor_secondary_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for distributor_products
CREATE POLICY "Authenticated users can view distributor_products" ON distributor_products FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage distributor_products" ON distributor_products FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage distributor_products" ON distributor_products FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- RLS Policies for distributor_pricing_tiers
CREATE POLICY "Authenticated users can view distributor_pricing_tiers" ON distributor_pricing_tiers FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage distributor_pricing_tiers" ON distributor_pricing_tiers FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage distributor_pricing_tiers" ON distributor_pricing_tiers FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- RLS Policies for distributor_schemes
CREATE POLICY "Authenticated users can view distributor_schemes" ON distributor_schemes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage distributor_schemes" ON distributor_schemes FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage distributor_schemes" ON distributor_schemes FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- RLS Policies for distributor_kyc_documents
CREATE POLICY "Authenticated users can view distributor_kyc_documents" ON distributor_kyc_documents FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage distributor_kyc_documents" ON distributor_kyc_documents FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage distributor_kyc_documents" ON distributor_kyc_documents FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- RLS Policies for distributor_secondary_counters
CREATE POLICY "Authenticated users can view distributor_secondary_counters" ON distributor_secondary_counters FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage distributor_secondary_counters" ON distributor_secondary_counters FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage distributor_secondary_counters" ON distributor_secondary_counters FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- RLS Policies for retailer_competitor_analysis
CREATE POLICY "Authenticated users can view retailer_competitor_analysis" ON retailer_competitor_analysis FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage retailer_competitor_analysis" ON retailer_competitor_analysis FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage retailer_competitor_analysis" ON retailer_competitor_analysis FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- RLS Policies for retailer_schemes
CREATE POLICY "Authenticated users can view retailer_schemes" ON retailer_schemes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage retailer_schemes" ON retailer_schemes FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage retailer_schemes" ON retailer_schemes FOR ALL USING (get_user_role_level(auth.uid()) <= 3);

-- RLS Policies for retailer_images
CREATE POLICY "Authenticated users can view retailer_images" ON retailer_images FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage retailer_images" ON retailer_images FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Managers can manage retailer_images" ON retailer_images FOR ALL USING (get_user_role_level(auth.uid()) <= 3);