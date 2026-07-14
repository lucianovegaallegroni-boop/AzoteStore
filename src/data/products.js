export const products = [

];

export const getProductById = (id) => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (categorySlug) => {
  if (!categorySlug) return products;
  return products.filter(p => p.categorySlug.toLowerCase() === categorySlug.toLowerCase());
};

export const searchProducts = (query) => {
  if (!query) return products;
  const lowerQuery = query.toLowerCase();
  return products.filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.category.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery)
  );
};
