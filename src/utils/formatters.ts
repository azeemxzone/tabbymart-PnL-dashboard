/**
 * Indian Number & Currency Formatting Utilities
 * Standardizes INR representation (Lakhs, Crores, and standard Indian comma notation)
 */

export function formatINR(value: number, options?: { showSign?: boolean; maximumFractionDigits?: number }): string {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  
  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const fractionDigits = options?.maximumFractionDigits ?? 0;
  
  // Format with en-IN locale
  const formatted = absValue.toLocaleString('en-IN', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  });

  const sign = isNegative ? '-₹' : options?.showSign ? '+₹' : '₹';
  return `${sign}${formatted}`;
}

/**
 * Compact Indian Currency Notation (e.g. ₹14.8 L or ₹1.24 Cr)
 */
export function formatCompactINR(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '₹0';
  
  const isNegative = value < 0;
  const abs = Math.abs(value);
  const sign = isNegative ? '-' : '';

  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(2)} L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}₹${abs.toFixed(0)}`;
}

export function formatPercent(value: number, decimals = 1, showSign = false): string {
  if (value === undefined || value === null || isNaN(value)) return '0.0%';
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatNumberIN(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return value.toLocaleString('en-IN');
}
