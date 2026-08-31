-- ==========================================================
-- KATHIR XEROX & E-SERVICE CENTRE (கதிர் ஜெராக்ஸ்)
-- PostgreSQL / Supabase Database Schema Blueprint
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Services Catalogue Table
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_ta VARCHAR(255),
    category VARCHAR(50) NOT NULL CHECK (category IN ('XEROX', 'PRINT', 'E_SERVICE', 'LAMINATION', 'STATIONERY', 'OTHER')),
    default_unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    unit_label VARCHAR(50) DEFAULT 'unit',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Daily Books Table (Daybook Register Cycle 12:00:00 AM - 11:59:59 PM)
CREATE TABLE IF NOT EXISTS daily_books (
    id VARCHAR(64) PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    total_cash DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_upi DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_due DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total_transactions INT NOT NULL DEFAULT 0,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Transactions Table (Header Level)
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(64) PRIMARY KEY,
    book_id VARCHAR(64) REFERENCES daily_books(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    token_no VARCHAR(50) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('CASH', 'UPI', 'DUE', 'SPLIT')),
    customer_ref VARCHAR(255),
    customer_phone VARCHAR(20),
    grand_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cash_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    upi_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    due_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Transaction Items Table (Line Item Level)
CREATE TABLE IF NOT EXISTS transaction_items (
    id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    service_id VARCHAR(64) REFERENCES services(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_transactions_book_id ON transactions(book_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_mode ON transactions(payment_mode);
CREATE INDEX IF NOT EXISTS idx_transaction_items_tx ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_category ON transaction_items(category);

-- ==========================================================
-- Preloaded Service Catalogue Seed Data
-- ==========================================================
INSERT INTO services (id, name, name_ta, category, default_unit_price, unit_label, is_active) VALUES
('srv-xerox-bw-ss', 'Xerox B&W (Single Side)', 'ஜெராக்ஸ் கருப்பு-வெள்ளை (ஒரு பக்கம்)', 'XEROX', 2.00, 'page', true),
('srv-xerox-bw-ds', 'Xerox B&W (Double Side)', 'ஜெராக்ஸ் கருப்பு-வெள்ளை (இரு பக்கம்)', 'XEROX', 3.00, 'sheet', true),
('srv-xerox-col-ss', 'Color Xerox (Single Side)', 'வண்ண ஜெராக்ஸ் (ஒரு பக்கம்)', 'XEROX', 10.00, 'page', true),
('srv-xerox-col-ds', 'Color Xerox (Double Side)', 'வண்ண ஜெராக்ஸ் (இரு பக்கம்)', 'XEROX', 18.00, 'sheet', true),
('srv-print-bw', 'B&W Document Printout (A4)', 'கருப்பு-வெள்ளை பிரிண்ட் (A4)', 'PRINT', 5.00, 'page', true),
('srv-print-col', 'Color Document Printout (A4)', 'வண்ண பிரிண்ட் (A4)', 'PRINT', 15.00, 'page', true),
('srv-print-photo-pass', 'Passport Size Photo (8 Copies)', 'பாஸ்போர்ட் புகைப்படம் (8 பிரதிகள்)', 'PRINT', 50.00, 'set', true),
('srv-print-photo-gloss', 'Glossy Photo Print (4x6 / A4)', 'புகைப்பட பிரிண்ட் (Glossy)', 'PRINT', 40.00, 'photo', true),
('srv-lam-id', 'ID Card / Aadhaar Lamination', 'அடையாள அட்டை லேமினேஷன்', 'LAMINATION', 20.00, 'card', true),
('srv-lam-a4', 'A4 Certificate Lamination', 'A4 சான்றிதழ் லேமினேஷன்', 'LAMINATION', 40.00, 'sheet', true),
('srv-bind-spiral', 'Spiral Binding (Document / Project)', 'ஸ்பைரல் பைண்டிங்', 'LAMINATION', 50.00, 'book', true),
('srv-scan-mail', 'Scanning & PDF / Email Send', 'ஸ்கேனிங் & இமெயில்', 'LAMINATION', 15.00, 'doc', true),
('srv-esev-cert', 'Community / Income / Nativity Certificate', 'சாதி / வருமானம் / இருப்பிட சான்றிதழ்', 'E_SERVICE', 120.00, 'appl', true),
('srv-esev-patta', 'Patta / Chitta / FMB Download & Print', 'பட்டா / சிட்டா நகல்', 'E_SERVICE', 80.00, 'copy', true),
('srv-esev-pan', 'New PAN Card / Correction Application', 'புதிய பான் கார்டு விண்ணப்பம்', 'E_SERVICE', 150.00, 'appl', true),
('srv-esev-aadhaar', 'Aadhaar Download / PVC Card Order', 'ஆதார் பதிவிறக்கம் / PVC அட்டை', 'E_SERVICE', 50.00, 'card', true),
('srv-esev-eb', 'TNEB Electricity Bill Payment (Service Charge)', 'மின் கட்டணம் செலுத்துதல்', 'E_SERVICE', 20.00, 'bill', true),
('srv-esev-voter', 'Voter ID Application / Address Change', 'வாக்காளர் அடையாள அட்டை மாற்றம்', 'E_SERVICE', 80.00, 'appl', true),
('srv-esev-money', 'Money Transfer / AEPS Cash Withdrawal (Commission)', 'பணம் அனுப்புதல் / எடுக்கும் கட்டணம்', 'E_SERVICE', 30.00, 'tx', true),
('srv-stat-pen', 'Ball Pen / Gel Pen (Blue / Black)', 'பேனா (நீலம் / கருப்பு)', 'STATIONERY', 10.00, 'piece', true),
('srv-stat-file', 'Office Stick File / Folder', 'ஸ்டிக் ஃபைல் / கோப்பு', 'STATIONERY', 15.00, 'piece', true),
('srv-stat-env', 'Cloth Envelope (A4 / Legal)', 'துணி உறை (A4 கவர்)', 'STATIONERY', 10.00, 'piece', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    name_ta = EXCLUDED.name_ta,
    default_unit_price = EXCLUDED.default_unit_price;
