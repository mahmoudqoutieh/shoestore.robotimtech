CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'sport',
  price TEXT NOT NULL DEFAULT '',
  old_price TEXT NOT NULL DEFAULT '',
  badge TEXT NOT NULL DEFAULT '',
  sizes TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO products (name, category, price, old_price, badge, sizes, image)
SELECT 'حذاء الجري كوبالت', 'sport', '', '', 'جديد', '40,41,42,43,44', '/assets/products/runner.webp'
WHERE NOT EXISTS (SELECT 1 FROM products);
INSERT INTO products (name, category, price, old_price, badge, sizes, image)
SELECT 'حذاء كرة السلة العالي', 'sport', '', '', 'الأكثر طلباً', '41,42,43,44,45', '/assets/products/hightop.webp'
WHERE (SELECT COUNT(*) FROM products) = 1;
INSERT INTO products (name, category, price, old_price, badge, sizes, image)
SELECT 'حذاء التدريب الرمادي', 'sport', '', '', '', '40,41,42,43', '/assets/products/trail.webp'
WHERE (SELECT COUNT(*) FROM products) = 2;
INSERT INTO products (name, category, price, old_price, badge, sizes, image)
SELECT 'أوكسفورد جلد أسود', 'formal', '', '', 'رسمي', '40,41,42,43,44', '/assets/products/oxford.webp'
WHERE (SELECT COUNT(*) FROM products) = 3;
INSERT INTO products (name, category, price, old_price, badge, sizes, image)
SELECT 'بروغ جلد بني', 'formal', '', '', '', '41,42,43,44', '/assets/products/brogue.webp'
WHERE (SELECT COUNT(*) FROM products) = 4;
INSERT INTO products (name, category, price, old_price, badge, sizes, image)
SELECT 'لوفر جلد كحلي', 'formal', '', '', 'جديد', '40,41,42,43', '/assets/products/loafer.webp'
WHERE (SELECT COUNT(*) FROM products) = 5;
