-- Seed business partners for PortalJualan ID MVP
-- Embeddings will be generated on first use if not pre-computed

insert into business_partners (id, name, partner_type, location, served_business_categories, description, suitable_needs, suitable_business_scale, contact_label, contact_url, embedding_text, embedding_model, is_active)
values
  -- Distributor
  ('11111111-1111-1111-1111-111111111101', 'PT Sumber Poultry Indonesia', 'distributor', 'Jakarta Timur', array['food', 'frozen food', 'restaurant', 'catering'], 'Distributor ayam potong dan bahan baku frozen food terpercaya untuk UMKM. Pengiriman harian ke Jabodetabek dengan harga kompetitif.', array['distributor_bahan_baku', '冷链_logistics', 'cold_storage'], array['micro', 'small', 'medium'], 'Hubungi Sales', 'https://wa.me/6281234567801', 'Distributor ayam potong frozen food terpercaya Jakarta', null, true),

  ('11111111-1111-1111-1111-111111111102', 'CV Berkah Frozen Distribution', 'distributor', 'Bekasi', array['frozen food', 'food'], 'Distributor frozen food wholesale untuk warung dan kantin. Minimum order 5 kg, gratis ongkir untuk area Bekasi dan sekitarnya.', array['distributor_bahan_baku', 'cold_storage'], array['micro', 'small'], 'Chat WhatsApp', 'https://wa.me/6281234567802', 'Distributor frozen food murah Bekasi', null, true),

  -- Packaging Supplier
  ('11111111-1111-1111-1111-111111111103', 'Toko Kemasan Jaya', 'packaging_supplier', 'Jakarta Pusat', array['food', 'frozen food', 'snack', 'beverage', 'beauty', 'fashion'], 'Supplier kemasan food grade dan non-food grade. Tersedia plastik, box, label, dan kertas bungkus. Grosir dan ecer.', array['packaging', 'label_design', 'packaging_design'], array['micro', 'small', 'medium'], 'Kunjungi Toko', 'https://tokokemasanjayagroup.com', 'Supplier kemasan food grade murah Jakarta', null, true),

  ('11111111-1111-1111-1111-111111111104', 'PackPro Indonesia', 'packaging_supplier', 'Bandung', array['fashion', 'beauty', 'handicraft', 'food'], 'Produsen kemasan kardus dan foam box custom. Cocok untuk usaha online dan export. MOQ 100 pcs.', array['packaging', 'shipping_materials', 'custom_packaging'], array['small', 'medium'], 'Hubungi Kami', 'https://packpro.co.id', 'Produsen kemasan kardus custom Bandung', null, true),

  -- Digital Marketing Agency
  ('11111111-1111-1111-1111-111111111105', 'UmkmGo Digital', 'digital_marketing', 'Jakarta Selatan', array['food', 'frozen food', 'fashion', 'beauty', 'service'], 'Agensi digital marketing khusus UMKM. Services: social media management, Google Ads, SEO, content creation. Paket mulai Rp 500rb/bulan.', array['digital_marketing', 'social_media', 'branding', 'online_sales'], array['small', 'medium'], 'Konsultasi Gratis', 'https://umkmgo.id/konsultasi', 'Agensi digital marketing UMKM Jakarta', null, true),

  ('11111111-1111-1111-1111-111111111106', 'Solo Social Media', 'digital_marketing', 'Solo', array['food', 'fashion', 'beauty', 'handicraft'], ' Freelance social media manager untuk bisnis kecil. Paket simple: 20 posts/bulan + story. Rp 350rb/bulan.', array['social_media', 'content_creation', 'online_sales'], array['micro', 'small'], 'Chat WA', 'https://wa.me/6281234567806', 'Social media manager freelance Solo', null, true),

  -- Logistic / Shipping
  ('11111111-1111-1111-1111-111111111107', 'SiCepat Express', 'logistic', 'Jakarta', array['frozen food', 'food', 'fashion', 'beauty', 'handicraft'], 'Jasa pengiriman same-day, next-day, dan reguler. Ada layanan cold chain untuk frozen food. Coverage nasional.', array['cold_chain', 'pengiriman', 'cold_storage', 'shipping'], array['micro', 'small', 'medium'], 'Cek Tarif', 'https://sicepat.co.id', 'Jasa pengiriman cold chain nasional', null, true),

  ('11111111-1111-1111-1111-111111111108', 'J&T Express', 'logistic', 'Bandung', array['fashion', 'beauty', 'handicraft', 'food'], 'Jasa kirim ekonomis untuk usaha online. Tracking real-time, pick-up gratis. Tersedia layanan COD.', array['pengiriman', 'cod', 'shipping'], array['micro', 'small'], 'Daftar Merchant', 'https://jet.co.id/merchant', 'Jasa kirim ekonomis online shop', null, true),

  -- Ingredient Supplier
  ('11111111-1111-1111-1111-111111111109', 'PT Nippon Indomik Indonesia', 'ingredient_supplier', 'Jakarta', array['food', 'frozen food', 'restaurant', 'catering', 'snack'], 'Importir dan distributor bahan makanan: MSG, bumbu instan, tepung, minyak goreng industri. Bulk pricing.', array['distributor_bahan_baku', 'bulk_pricing'], array['small', 'medium'], 'Sales Inquiry', 'mailto:sales@nipponindomik.co.id', 'Distributor bahan makanan importir Jakarta', null, true),

  ('11111111-1111-1111-1111-111111111110', 'PasarTani Supply', 'ingredient_supplier', 'Bogor', array['food', 'frozen food', 'restaurant'], 'Supplier bahan pertanian segar dan frozen untuk restoran dan catering. 100+ SKU. Pengiriman H+1.', array['fresh_ingredients', '冷链_logistics', 'cold_storage'], array['small', 'medium'], 'Hubungi via WA', 'https://wa.me/6281234567810', 'Supplier bahan pertanian segar Bogor', null, true),

  -- Equipment Rental
  ('11111111-1111-1111-1111-111111111111', 'SewaAlat Kitchen Studio', 'equipment_rental', 'Depok', array['food', 'frozen food', 'restaurant', 'catering'], 'Sewa alat kitchen: mixer industri, oven, vacuum packager, cold storage container. Per hari atau per bulan.', array['equipment_rental', '冷链_logistics', 'food_processing'], array['micro', 'small', 'medium'], 'Lihat Katalog', 'https://sewaalat.id/kitchen', 'Sewa alat kitchen industri Depok', null, true),

  -- Co-Working / Kitchen
  ('11111111-1111-1111-1111-111111111112', 'Dapur Komunal Bogor', 'shared_kitchen', 'Bogor', array['food', 'frozen food', 'snack', 'beverage'], 'Shared kitchen lengkap: oven, fryer, cold storage, packing area. Bisa per jam atau per bulan. Lokasi strategis dekat pasar.', array['shared_kitchen', '冷链_logistics', 'cold_storage', 'food_processing'], array['micro', 'small'], 'Booking Kunjungan', 'https://dapurkomunalbogor.space', 'Shared kitchen Bogor lengkap', null, true),

  -- HR / Staffing
  ('11111111-1111-1111-1111-111111111113', 'KerjaBagus.id', 'hr_staffing', 'Jakarta', array['retail', 'fashion', 'beauty', 'food', 'service'], 'Platform rekrutmen khusus UMKM. Posting lowongan gratis. Ada paket screening CV dan interview guide Rp 50rb.', array['recruitment', 'hr_consulting', 'training'], array['micro', 'small', 'medium'], 'Posting Lowongan', 'https://kerjabagus.id/umkm', 'Platform rekrutmen UMKM Indonesia', null, true),

  -- Market Access
  ('11111111-1111-1111-1111-111111111114', 'GoFood Partner', 'market_access', 'Jakarta', array['food', 'frozen food', 'restaurant', 'catering'], 'Gabung jadi merchant GoFood. Jangkauan lebih luas, pengiriman ditangani kurir. Proses registrasi 3 hari kerja.', array['online_sales', 'delivery_platform', 'branding'], array['micro', 'small', 'medium'], 'Daftar Merchant', 'https://gofood.co.id/merchant/signup', 'Merchant GoFood terdaftar', null, true),

  ('11111111-1111-1111-1111-111111111115', 'Tokopedia Seller Center', 'market_access', 'Jakarta', array['fashion', 'beauty', 'handicraft', 'food', 'frozen food'], 'Platform marketplace dengan 100jt+ pembeli. Gratis mendaftar, fee per transaksi. Ada program pelatihan seller.', array['online_sales', 'marketplace', 'branding'], array['micro', 'small', 'medium'], 'Mulai Jualan', 'https://seller tokopedia.com', 'Seller Tokopedia resmi', null, true),

  -- Financial Admin
  ('11111111-1111-1111-1111-111111111116', 'Jurnal by Mekari', 'financial_admin', 'Jakarta', array['fashion', 'beauty', 'food', 'service', 'retail'], 'Software akuntansi online untuk UMKM. Fitur:invoice, laporan keuangan, pajak PPh 21. Paket starter gratis.', array['accounting', 'invoicing', 'tax_reporting', 'financial_planning'], array['small', 'medium'], 'Coba Gratis', 'https://jurnal.id', 'Software akuntansi online Mekari', null, true),

  -- Technology / POS
  ('11111111-1111-1111-1111-111111111117', 'Moka POS Indonesia', 'pos_system', 'Jakarta', array['food', 'frozen food', 'retail', 'beauty'], 'Sistem kasir dan POS untuk F&B dan retail. Fitur: kasir, inventory, laporan penjualan, QRIS payment. Gratis plan tersedia.', array['pos_system', 'inventory_management', 'payment_integration', 'online_sales'], array['small', 'medium'], 'Demo', 'https://mokapos.com/demo', 'Sistem POS kasir Indonesia', null, true),

  ('11111111-1111-1111-1111-111111111118', 'QrMac', 'pos_system', 'Surabaya', array['retail', 'food', 'frozen food', 'beauty', 'fashion'], 'Kasir sederhana via HP/laptop. Scan QRIS, catat penjualan, laporan harian. Rp 15rb/bulan.', array['pos_system', 'payment_integration', 'simple_inventory'], array['micro'], 'Daftar', 'https://qrmac.id', 'Kasir QRIS sederhana Surabaya', null, true),

  -- Packaging Design
  ('11111111-1111-1111-1111-111111111119', 'BuatPack Studio', 'packaging_design', 'Jakarta Selatan', array['food', 'frozen food', 'beauty', 'fashion', 'handicraft'], 'Jasa desain kemasan: label, box, pouch. termasuk prototyping. Tim desainer profesional dengan pengalaman 5+ tahun.', array['packaging_design', 'label_design', 'branding'], array['small', 'medium'], 'Konsultasi', 'https://buatpack.id', 'Jasa desain kemasan profesional Jakarta', null, true),

  ('11111111-1111-1111-1111-111111111120', 'Canva for Business', 'design_tool', 'Online', array['fashion', 'beauty', 'food', 'handicraft'], 'Platform desain template: logo, kemasan, media sosial. Template 1M+ gratis. Versi tim dengan brand kit.', array['design_tool', 'branding', 'label_design'], array['micro', 'small', 'medium'], 'Mulai Desain', 'https://canva.com/business', 'Template desain kemasan gratis Canva', null, true)
on conflict (id) do update set
  name = excluded.name,
  partner_type = excluded.partner_type,
  location = excluded.location,
  served_business_categories = excluded.served_business_categories,
  description = excluded.description,
  suitable_needs = excluded.suitable_needs,
  suitable_business_scale = excluded.suitable_business_scale,
  contact_label = excluded.contact_label,
  contact_url = excluded.contact_url,
  is_active = excluded.is_active;
