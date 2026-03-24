-- Run this in your Supabase SQL Editor

-- -------------------------------------------------------------
-- 1. Create the 'images' storage bucket
-- -------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- 2. Set up RLS Policies for Storage
-- (Ensures anyone can view, but only authorized can upload/delete)
-- -------------------------------------------------------------

-- POLICY: Allow Public Access to View Images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');

-- POLICY: Allow Uploads (We are using Anon for now, but you can restrict toইস্রায়েলেজ্রাকিসাকয়ে@gmail.com)
CREATE POLICY "Allow Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');

-- POLICY: Allow Updates
CREATE POLICY "Allow Updates" ON storage.objects FOR UPDATE USING (bucket_id = 'images');

-- POLICY: Allow Deletions
CREATE POLICY "Allow Deletions" ON storage.objects FOR DELETE USING (bucket_id = 'images');

-- -------------------------------------------------------------
-- 3. Create categories table
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT
);

-- Create banners table
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT,
  image TEXT
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT REFERENCES categories(id) ON DELETE SET NULL,
  price INT NOT NULL,
  "oldPrice" INT,
  rating FLOAT DEFAULT 0,
  reviews INT DEFAULT 0,
  image TEXT
);

-- Disable Row Level Security (RLS) or add policies so the Anon key can access them for now
-- If you want secure DB, you can enable RLS and write policies.
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Insert initial categories
INSERT INTO categories (id, name, image) VALUES 
('dresses', 'Dresses', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400'),
('office', 'Office', 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400'),
('suits', 'Suits', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'),
('casual', 'Casual', 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=400'),
('traditional', 'Ethnic', 'https://i.pinimg.com/1200x/19/4f/11/194f116e9b2704aa7ec6bcf8e30abe31.jpg'),
('sportswear', 'Sports', 'https://i.pinimg.com/1200x/41/7b/62/417b62bae6ae9c9a6b098969fffd3f44.jpg'),
('nightwear', 'Night', 'https://i.pinimg.com/736x/3a/5c/b9/3a5cb95d4938408d688c72e0cefc1d1c.jpg'),
('watches', 'Watches', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400'),
('shoes', 'Shoes', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400'),
('accessories', 'Style', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400')
ON CONFLICT (id) DO NOTHING;

-- Insert initial banners
INSERT INTO banners (title, text, image) VALUES 
('Exquisite Summer Collection', 'Premium fabrics designed for the modern woman. Up to 50% OFF.', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80'),
('Executive Business Tailoring', 'Command respect in every room with our bespoke office collection.', 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=1200&q=80'),
('Luxury Timepieces & Gems', 'The final touch of elegance for those who settle for nothing less.', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80');

-- Insert initial products
INSERT INTO products (name, category, price, "oldPrice", rating, reviews, image) VALUES 
('Floral Summer Dress', 'dresses', 170130, 332930, 4.8, 234, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400'),
('Business Blazer Set', 'office', 480930, 739930, 4.9, 156, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'),
('Elegant Evening Suit', 'suits', 702930, 1109930, 4.7, 89, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'),
('Casual Denim Jacket', 'casual', 221930, 369930, 4.6, 312, 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=400'),
('Traditional Kimono', 'traditional', 332930, 554930, 4.9, 178, 'https://images.unsplash.com/photo-1583391733950-2906d205fe6d?w=400'),
('Luxury Gold Watch', 'watches', 924930, 1479930, 4.8, 267, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400'),
('Classic Heels', 'shoes', 295930, 480930, 4.5, 445, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400'),
('Pearl Necklace Set', 'accessories', 147930, 295930, 4.7, 523, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400'),
('Maxi Boho Dress', 'dresses', 207130, 369930, 4.6, 198, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'),
('Office Pencil Skirt', 'office', 159030, 258930, 4.4, 267, 'https://images.unsplash.com/photo-1583496661160-fb5886a05d72?w=400'),
('Power Suit Pantsuit', 'suits', 591930, 924930, 4.8, 134, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'),
('Cotton Casual Tee', 'casual', 92430, 147930, 4.3, 678, 'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?w=400'),
('Ethnic Embroidered Dress', 'traditional', 355130, 591930, 4.9, 234, 'https://images.unsplash.com/photo-1583391733950-2906d205fe6d?w=400'),
('Smart Fitness Watch', 'watches', 554930, 850930, 4.7, 456, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'),
('Running Sneakers', 'shoes', 332930, 517930, 4.6, 589, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
('Designer Sunglasses', 'accessories', 258930, 443930, 4.5, 345, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400'),
('Cocktail Party Dress', 'dresses', 295930, 517930, 4.8, 267, 'https://images.unsplash.com/photo-1566173934679-5f8e5e78d0f0?w=400'),
('Formal Blazer', 'office', 369930, 628930, 4.7, 189, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400'),
('Casual Jumpsuit', 'casual', 240430, 406930, 4.6, 423, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400'),
('Leather Handbag', 'accessories', 443930, 739930, 4.9, 512, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400'),
('Ankle Boots', 'shoes', 351430, 554930, 4.7, 378, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
('Silver Bracelet', 'accessories', 129430, 221930, 4.5, 289, 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400'),
('Yoga Sports Set', 'sportswear', 184930, 295930, 4.8, 456, 'https://images.unsplash.com/photo-1518622358385-8ea7d0794b5c?w=400'),
('Running Shorts', 'sportswear', 73930, 129430, 4.6, 234, 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400'),
('Silk Nightgown', 'nightwear', 147930, 258930, 4.9, 178, 'https://images.unsplash.com/photo-1563178406-4cdc2923acce?w=400'),
('Satin Pajama Set', 'nightwear', 166430, 277430, 4.7, 289, 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=400');
