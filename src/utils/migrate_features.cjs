const { Client } = require('/home/almuxtaar/Documents/backendalkarimvision/node_modules/pg');
require('/home/almuxtaar/Documents/backendalkarimvision/node_modules/dotenv').config({ path: '/home/almuxtaar/Documents/backendalkarimvision/.env' });

async function run() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    console.log("Début de la migration des nouvelles fonctionnalités...");
    
    // 1. Ajouter mrp à la table products
    await client.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS mrp numeric(12,2) DEFAULT 0;
    `);
    console.log("Colonne 'mrp' ajoutée à la table products.");

    // 2. Créer la table coupons
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code varchar(50) UNIQUE NOT NULL,
        type varchar(20) NOT NULL DEFAULT 'percentage',
        value numeric(12,2) NOT NULL,
        min_order_amount numeric(12,2) DEFAULT 0,
        is_active boolean DEFAULT TRUE,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Table 'coupons' créée ou vérifiée.");

    // 3. Ajouter les colonnes de coupon à la table orders
    await client.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS coupon_id integer REFERENCES coupons(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS discount_amount numeric(12,2) DEFAULT 0;
    `);
    console.log("Colonnes de coupon ajoutées à la table orders.");

    // 4. Insérer des coupons par défaut pour test si la table est vide
    const couponsRes = await client.query("SELECT COUNT(*) FROM coupons");
    if (parseInt(couponsRes.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO coupons (code, type, value, min_order_amount) VALUES
        ('BIENVENUE10', 'percentage', 10.00, 0.00),
        ('KARIM2026', 'fixed', 5000.00, 30000.00);
      `);
      console.log("Coupons de test insérés (BIENVENUE10 et KARIM2026).");
    }

    console.log("Succès ! Migration des nouvelles fonctionnalités terminée.");
  } catch (err) {
    console.error("Erreur lors de la migration :", err);
  } finally {
    await client.end();
    process.exit(0);
  }
}
run();
