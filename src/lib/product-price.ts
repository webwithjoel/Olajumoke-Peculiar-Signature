const nairaFormatter = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

export function formatProductPrice(price: number | null): string {
  return price === null ? 'Price on request' : nairaFormatter.format(price);
}
