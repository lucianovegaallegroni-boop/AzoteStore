/**
 * Migration Script: Move base64 images from DB columns to Supabase Storage
 * 
 * This script:
 * 1. Reads all products and product_variants with base64 image data
 * 2. Decodes and uploads each image to the 'product-images' Storage bucket
 * 3. Updates each row's `image` column with the resulting public URL
 * 
 * Run with: node scripts/migrate-images-to-storage.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xbpwskecvxuixnagizov.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhicHdza2Vjdnh1aXhuYWdpem92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjE5NDYsImV4cCI6MjA5ODk5Nzk0Nn0.Sd5g1kaJ-V_cvAatph9QED7cBXiisBfYQekF3z2hoL8';
const BUCKET = 'product-images';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Decode a data URI (data:image/png;base64,...) into a Buffer and its MIME type.
 */
function decodeBase64DataUri(dataUri) {
  const match = dataUri.match(/^data:(image\/\w+);base64,(.+)$/s);
  if (!match) return null;
  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, 'base64');
  return { buffer, mimeType };
}

/**
 * Get file extension from MIME type.
 */
function extFromMime(mime) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return map[mime] || 'png';
}

/**
 * Upload a base64 data URI to Supabase Storage and return the public URL.
 */
async function uploadImage(dataUri, folder, filename) {
  const decoded = decodeBase64DataUri(dataUri);
  if (!decoded) {
    console.warn(`  ⚠ Could not decode image for ${folder}/${filename}, skipping.`);
    return null;
  }

  const ext = extFromMime(decoded.mimeType);
  const path = `${folder}/${filename}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, decoded.buffer, {
      contentType: decoded.mimeType,
      upsert: true,
    });

  if (error) {
    console.error(`  ✗ Upload failed for ${path}:`, error.message);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

async function migrateProducts() {
  console.log('━━━ Fetching products with base64 images... ━━━');

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, image');

  if (error) {
    console.error('Failed to fetch products:', error.message);
    return;
  }

  const base64Products = products.filter(p => p.image && p.image.startsWith('data:'));
  console.log(`Found ${base64Products.length} products with base64 images.\n`);

  for (const product of base64Products) {
    const safeName = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
    const filename = `main-${safeName}`;
    console.log(`📦 Product: "${product.name}" (${product.id})`);

    const publicUrl = await uploadImage(product.image, 'products', filename);
    if (publicUrl) {
      const { error: updateErr } = await supabase
        .from('products')
        .update({ image: publicUrl })
        .eq('id', product.id);

      if (updateErr) {
        console.error(`  ✗ DB update failed:`, updateErr.message);
      } else {
        console.log(`  ✓ Migrated → ${publicUrl}`);
      }
    }
  }
}

async function migrateVariants() {
  console.log('\n━━━ Fetching product_variants with base64 images... ━━━');

  const { data: variants, error } = await supabase
    .from('product_variants')
    .select('id, product_id, title, image');

  if (error) {
    console.error('Failed to fetch variants:', error.message);
    return;
  }

  const base64Variants = variants.filter(v => v.image && v.image.startsWith('data:'));
  console.log(`Found ${base64Variants.length} variants with base64 images.\n`);

  for (const variant of base64Variants) {
    const safeTitle = variant.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    const filename = `variant-${safeTitle}-${variant.id.slice(0, 8)}`;
    console.log(`🎨 Variant: "${variant.title}" (${variant.id})`);

    const publicUrl = await uploadImage(variant.image, 'variants', filename);
    if (publicUrl) {
      const { error: updateErr } = await supabase
        .from('product_variants')
        .update({ image: publicUrl })
        .eq('id', variant.id);

      if (updateErr) {
        console.error(`  ✗ DB update failed:`, updateErr.message);
      } else {
        console.log(`  ✓ Migrated → ${publicUrl}`);
      }
    }
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  AzoteStore: Base64 → Supabase Storage Migration ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  await migrateProducts();
  await migrateVariants();

  console.log('\n✅ Migration complete!');
}

main().catch(console.error);
