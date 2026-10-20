export type MarketplaceId = 'amazon' | 'flipkart' | 'meesho';

export type FinancialYear = 'FY 2024-25' | 'FY 2025-26';

export type FinancialLens = 'economic_pl' | 'settlement_cash' | 'gst_tax';

export interface MonthlyChannelData {
  marketplace: MarketplaceId;
  grossSales: number;
  returnsValue: number;
  netRevenue: number;
  cogs: number;
  referralFee: number;
  closingFee: number;
  weightHandlingFee: number;
  platformFee: number;
  totalFees: number;
  rtoCourierFreightLoss: number;
  reverseLogisticsFee: number;
  damagedGoodsLoss: number;
  packagingCost: number; // synthetic estimate
  cm1: number; // Net Revenue - COGS - totalFees - logistics losses - packagingCost
  adSpend: number;
  cm2: number; // cm1 - adSpend
  ordersCount: number;
  deliveredOrders: number;
  rtoOrders: number;
  customerReturnOrders: number;
  disbursedToBank: number;
  reserveWithheld: number;
  unsettledInTransit: number;
}

export interface MonthlyMetric {
  month: string; // e.g., "Apr 24", "May 24"
  monthName: string; // "April", "May"
  year: number; // 2024, 2025
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  grossSales: number;
  returnsValue: number;
  netRevenue: number;
  cogs: number;
  marketplaceFees: number;
  // Specific logistics and packaging breakdown
  shippingFees: number; // forward freight
  rtoCourierFreightLoss: number; // RTO doorstep bounce forward freight loss
  reverseLogisticsFee: number; // customer return reverse shipping penalty
  damagedGoodsLoss: number; // damaged / scrap inventory
  packagingCost: number; // synthetic estimate
  // Documented Contribution Profit Tiers
  cm1: number; // Net Revenue - COGS - marketplaceFees - logistics/return losses - packaging
  cm1MarginPct: number;
  adSpend: number;
  cm2: number; // cm1 - adSpend
  cm2MarginPct: number;
  fixedOverheads: number;
  netBusinessProfit: number; // cm2 - fixedOverheads
  netMarginPct: number;
  // Order counts
  ordersCount: number;
  deliveredOrders: number;
  rtoOrders: number;
  customerReturnOrders: number;
  // Lens specific: Settlement / Cash
  settlementDisbursed: number;
  settlementReserveHeld: number;
  settlementPending: number;
  // Lens specific: GST Statutory Tax
  gstOutwardTax: number;
  taxableSuppliesBase?: number; // Net value of taxable supplies under Section 52 (Gross taxable supplies minus returns)
  gstTcsCollected: number; // Reconciled from GSTR-8 / dated supply split
  gstTcsCalculationType?: 'reconciled_gstr8' | 'dated_split_actual' | 'illustrative_estimate';
  gstTcsRatePct: number | null; // null for transition months with dual rates
  gstTcsNote?: string;
  gstTcsDatedSplit?: {
    preJulySupplies: number; // 1–9 July 2024 (1.0%)
    preJulyTcs: number;
    postJulySupplies: number; // 10–31 July 2024 (0.5%)
    postJulyTcs: number;
  };
  gstItcClaimable: number;
  netGstPayable: number;
  // Channel breakdown for dynamic filtering
  channels: Record<MarketplaceId, MonthlyChannelData>;
}

export interface MarketplaceBreakdown {
  id: MarketplaceId;
  name: string;
  brandColor: string;
  tagline: string;
  grossSales: number;
  netRevenue: number;
  orders: number;
  unitsSold: number;
  cogs: number;
  cm1: number;
  cm1MarginPct: number;
  adSpend: number;
  cm2: number;
  cm2MarginPct: number;
  netBusinessProfit: number;
  netMarginPct: number;
  // Fees
  referralFee: number;
  closingFee: number;
  weightHandlingFee: number; // shipping / pick & pack
  platformFee: number; // fixed charges, listing, storage
  totalFees: number;
  effectiveTakeRatePct: number; // totalFees / netRevenue * 100
  // Returns
  rtoCount: number;
  rtoRatePct: number;
  customerReturnCount: number;
  customerReturnRatePct: number;
  totalReturnRatePct: number;
  rtoCourierFreightLoss: number;
  reverseLogisticsFee: number;
  damagedGoodsLoss: number;
  packagingLoss: number;
  totalReturnLossAmount: number;
  // Cash realization
  disbursedToBank: number;
  reserveWithheld: number;
  unsettledInTransit: number;
}

export interface SkuPerformanceItem {
  sku: string;
  title: string;
  category: 'Home & Kitchen' | 'Apparel & Fashion' | 'Mobile & Tech Accessories' | 'Fitness & Wellness';
  marketplace: MarketplaceId | 'all';
  mrp: number;
  sellingPrice: number;
  unitsSold: number;
  grossSales: number;
  netRevenue: number;
  cogsPerUnit: number;
  totalCogs: number;
  marketplaceFees: number;
  rtoCourierFreightLoss: number;
  reverseLogisticsFee: number;
  damagedGoodsLoss: number;
  packagingCost: number; // synthetic estimate (₹12/unit)
  cm1: number;
  cm1MarginPct: number;
  adSpend: number;
  cm2: number;
  cm2MarginPct: number;
  rtoUnits: number;
  rtoRatePct: number;
  customerReturnUnits: number;
  customerReturnRatePct: number;
  totalReturnRatePct: number;
  returnRiskTier: 'Low (<8%)' | 'Moderate (8-15%)' | 'High (>15%)' | 'Critical (>25%)';
  rank: number;
  // GST Assumption: Flat 18% for prototype
  gstRatePct: number; // 18% (Prototype Assumption)
  gstHsnCode: string;
  gstNotes?: string;
}

export interface ReturnsHealthSummary {
  totalDispatchedOrders: number;
  deliveredOrders: number;
  totalRtoOrders: number;
  overallRtoRatePct: number;
  totalCustomerReturns: number;
  overallCustomerReturnRatePct: number;
  blendedReturnRatePct: number;
  totalLossFromReturns: number;
  rtoCourierFreightLoss: number;
  reverseLogisticsFee: number;
  damagedGoodsLoss: number;
  packagingLoss: number;
}

export interface ReportItem {
  id: string;
  marketplace: MarketplaceId | 'all';
  category: 'Marketplace TCS' | 'Input Tax Credit (ITC)' | 'Sales & Orders' | 'Settlement & Banking';
  reportName: string;
  reportCode: string;
  cadence: 'Monthly' | 'Bi-monthly' | 'Per Payout';
  fileFormat: 'CSV' | 'XLSX' | 'TXT (Flat)' | 'JSON';
  status: 'Reconciled' | 'Pending Ingestion' | 'Discrepancy Flagged' | 'Ready for Upload';
  lastPeriod: string;
  reconciliationMatchRate: number;
  unmatchedAmount: number;
  discrepancyNotes?: string;
  targetSchema: string[];
  reconciliationAuthority: string; // e.g. "GSTR-8 (TDS/TCS Credit Received ledger)" or "GSTR-2B (Inward Supplies ITC)"
}
