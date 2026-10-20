import {
  FinancialYear,
  MarketplaceBreakdown,
  MonthlyChannelData,
  MonthlyMetric,
  ReportItem,
  ReturnsHealthSummary,
  SkuPerformanceItem,
} from '../types/finance';

export interface GstTcsDetails {
  displayRateLabel: string;
  statutoryRatePct: number | null; // null for transition month July 24
  isDualRateMonth: boolean;
  datedSplit?: {
    period1Label: string;
    period1Supplies: number;
    period1Rate: number;
    period1Tcs: number;
    period2Label: string;
    period2Supplies: number;
    period2Rate: number;
    period2Tcs: number;
  };
  note: string;
  reconciliationAuthority: string;
  limitationNote?: string;
}

export interface GstTcsCalculationResult {
  taxableSuppliesBase: number;
  tcsAmount: number;
  rateLabel: string;
  calculationType: 'reconciled_gstr8' | 'dated_split_actual' | 'illustrative_estimate';
  isDualRateMonth: boolean;
  datedSplit?: {
    preJulySupplies: number;
    preJulyRatePct: number;
    preJulyTcs: number;
    postJulySupplies: number;
    postJulyRatePct: number;
    postJulyTcs: number;
  };
  reconciliationAuthority: string;
  note: string;
  limitationNote?: string;
}

/**
 * Period-aware GST TCS Rate Calculator under Section 52 of the CGST Act:
 * - Prior to 10 July 2024: 1.0% (0.5% CGST + 0.5% SGST / 1.0% IGST)
 * - Effective 10 July 2024 onward: 0.5% (0.25% CGST + 0.25% SGST / 0.5% IGST) via Notification No. 15/2024-CT
 * - July 2024 transition: Derived strictly from dated supply split:
 *   1–9 July supplies @ 1.0% + 10–31 July supplies @ 0.5%.
 *   Day-weighted averaging (such as 0.645%) is explicitly avoided because it does not represent statutory TCS.
 */
export function calculateSection52Tcs(
  taxableSupplies: number,
  monthCode: string,
  datedSplit?: { preJulySupplies: number; postJulySupplies: number }
): GstTcsCalculationResult {
  // Pre-10 July 2024: statutory 1.0% rate
  if (['Apr 24', 'May 24', 'Jun 24'].includes(monthCode)) {
    const tcs = Math.round(taxableSupplies * 0.01);
    return {
      taxableSuppliesBase: taxableSupplies,
      tcsAmount: tcs,
      rateLabel: '1.0%',
      calculationType: 'reconciled_gstr8',
      isDualRateMonth: false,
      reconciliationAuthority: 'E-Commerce Operator Form GSTR-8 (TDS/TCS Credit Received ledger)',
      note: 'Section 52 statutory 1.0% rate applicable prior to 10 July 2024.',
    };
  }

  // July 2024 transition month
  if (monthCode === 'Jul 24') {
    if (datedSplit && datedSplit.preJulySupplies !== undefined && datedSplit.postJulySupplies !== undefined) {
      const preTcs = Math.round(datedSplit.preJulySupplies * 0.01);
      const postTcs = Math.round(datedSplit.postJulySupplies * 0.005);
      const totalTcs = preTcs + postTcs;
      return {
        taxableSuppliesBase: datedSplit.preJulySupplies + datedSplit.postJulySupplies,
        tcsAmount: totalTcs,
        rateLabel: 'Dual Rate Split (1.0% / 0.5%)',
        calculationType: 'dated_split_actual',
        isDualRateMonth: true,
        datedSplit: {
          preJulySupplies: datedSplit.preJulySupplies,
          preJulyRatePct: 1.0,
          preJulyTcs: preTcs,
          postJulySupplies: datedSplit.postJulySupplies,
          postJulyRatePct: 0.5,
          postJulyTcs: postTcs,
        },
        reconciliationAuthority: 'E-Commerce Operator Form GSTR-8 (TDS/TCS Credit Received ledger)',
        note: `July 2024 statutory split: 1–9 July supplies ₹${datedSplit.preJulySupplies.toLocaleString('en-IN')} @ 1.0% (₹${preTcs.toLocaleString('en-IN')}) + 10–31 July supplies ₹${datedSplit.postJulySupplies.toLocaleString('en-IN')} @ 0.5% (₹${postTcs.toLocaleString('en-IN')}) = ₹${totalTcs.toLocaleString('en-IN')} total. Day-weighted average (such as 0.645%) is not applied.`,
      };
    } else {
      // If dated supply values are unavailable: label as estimate with clear limitation
      const estimatedTcs = Math.round(taxableSupplies * 0.00645);
      return {
        taxableSuppliesBase: taxableSupplies,
        tcsAmount: estimatedTcs,
        rateLabel: 'Illustrative Estimate (Dated Data Pending)',
        calculationType: 'illustrative_estimate',
        isDualRateMonth: true,
        reconciliationAuthority: 'Actual Platform Form GSTR-8 required',
        note: 'July 2024 statutory TCS requires dated transaction records to apply statutory 1.0% (1–9 July) and 0.5% (10–31 July) tranches.',
        limitationNote: 'Dated supply records for 1–9 July vs 10–31 July are unavailable. A day-weighted blended rate does NOT represent actual statutory TCS under Section 52; actual platform records (Form GSTR-8) must be used as the reconciliation authority.',
      };
    }
  }

  // 10 July 2024 onward: 0.5% statutory rate
  const tcs = Math.round(taxableSupplies * 0.005);
  return {
    taxableSuppliesBase: taxableSupplies,
    tcsAmount: tcs,
    rateLabel: '0.5%',
    calculationType: 'reconciled_gstr8',
    isDualRateMonth: false,
    reconciliationAuthority: 'E-Commerce Operator Form GSTR-8 (TDS/TCS Credit Received ledger)',
    note: 'Statutory 0.5% TCS under Section 52 (effective 10 July 2024 onward via Notification No. 15/2024-CT).',
  };
}

export function getGstTcsRateInfo(monthCode: string): GstTcsDetails {
  const result = calculateSection52Tcs(1662000, monthCode, {
    preJulySupplies: 482000,
    postJulySupplies: 1180000,
  });

  if (monthCode === 'Jul 24' && result.datedSplit) {
    return {
      displayRateLabel: result.rateLabel,
      statutoryRatePct: null,
      isDualRateMonth: true,
      datedSplit: {
        period1Label: '1–9 July 2024',
        period1Supplies: result.datedSplit.preJulySupplies,
        period1Rate: result.datedSplit.preJulyRatePct,
        period1Tcs: result.datedSplit.preJulyTcs,
        period2Label: '10–31 July 2024',
        period2Supplies: result.datedSplit.postJulySupplies,
        period2Rate: result.datedSplit.postJulyRatePct,
        period2Tcs: result.datedSplit.postJulyTcs,
      },
      note: result.note,
      reconciliationAuthority: result.reconciliationAuthority,
      limitationNote: result.limitationNote,
    };
  }

  return {
    displayRateLabel: result.rateLabel,
    statutoryRatePct: monthCode.startsWith('Apr 24') || monthCode.startsWith('May 24') || monthCode.startsWith('Jun 24') ? 1.0 : 0.5,
    isDualRateMonth: false,
    note: result.note,
    reconciliationAuthority: result.reconciliationAuthority,
  };
}

/**
 * Prototype GST Assumption: Flat 18% for every product and SKU.
 * For a GST-inclusive selling price:
 * - GST rate: 18%
 * - Taxable value / revenue excluding GST = GST-inclusive selling price ÷ 1.18
 * - Embedded GST = GST-inclusive selling price − taxable value
 * Internal calculations use unrounded numbers; display and export round consistently.
 */
export const PROTOTYPE_GST_RATE_PCT = 18;
export const PROTOTYPE_GST_LABEL = 'GST Rate: 18% (Prototype Assumption)';

export interface ProductGstCalculation {
  gstRatePct: number;
  rateLabel: string;
  taxableValue: number;
  embeddedGst: number;
}

export function calculateProductGst(sellingPrice: number): ProductGstCalculation {
  const taxableValue = sellingPrice / 1.18;
  const embeddedGst = sellingPrice - taxableValue;
  return {
    gstRatePct: PROTOTYPE_GST_RATE_PCT,
    rateLabel: PROTOTYPE_GST_LABEL,
    taxableValue,
    embeddedGst,
  };
}

/**
 * Helper to build channel breakdown for a month
 */
function createMonthChannels(
  netRevenueTotal: number,
  ordersTotal: number,
  monthCode: string
): Record<'amazon' | 'flipkart' | 'meesho', MonthlyChannelData> {
  // Channel revenue shares: Amazon ~48%, Flipkart ~34%, Meesho ~18%
  const amzRev = Math.round(netRevenueTotal * 0.485);
  const fkRev = Math.round(netRevenueTotal * 0.335);
  const meeRev = netRevenueTotal - amzRev - fkRev;

  const amzOrders = Math.round(ordersTotal * 0.38);
  const fkOrders = Math.round(ordersTotal * 0.33);
  const meeOrders = ordersTotal - amzOrders - fkOrders;

  // Amazon
  const amzGross = Math.round(amzRev * 1.17);
  const amzCogs = Math.round(amzRev * 0.36);
  const amzReferral = Math.round(amzRev * 0.12);
  const amzClosing = Math.round(amzOrders * 30);
  const amzShipping = Math.round(amzOrders * 81);
  const amzPlatform = Math.round(amzOrders * 15);
  const amzTotalFees = amzReferral + amzClosing + amzShipping + amzPlatform;
  const amzRto = Math.round(amzOrders * 0.082);
  const amzBuyerReturn = Math.round(amzOrders * 0.105);
  const amzRtoLoss = Math.round(amzRto * 68);
  const amzReverseLoss = Math.round(amzBuyerReturn * 54);
  const amzDamaged = Math.round(amzBuyerReturn * 42);
  const amzPkg = Math.round(amzOrders * 12);
  const amzCm1 = amzRev - amzCogs - amzTotalFees - amzRtoLoss - amzReverseLoss - amzDamaged - amzPkg;
  const amzAds = Math.round(amzRev * 0.09);
  const amzCm2 = amzCm1 - amzAds;

  // Flipkart
  const fkGross = Math.round(fkRev * 1.19);
  const fkCogs = Math.round(fkRev * 0.37);
  const fkReferral = Math.round(fkRev * 0.12);
  const fkClosing = Math.round(fkOrders * 30);
  const fkShipping = Math.round(fkOrders * 70);
  const fkPlatform = Math.round(fkOrders * 11);
  const fkTotalFees = fkReferral + fkClosing + fkShipping + fkPlatform;
  const fkRto = Math.round(fkOrders * 0.146);
  const fkBuyerReturn = Math.round(fkOrders * 0.094);
  const fkRtoLoss = Math.round(fkRto * 62);
  const fkReverseLoss = Math.round(fkBuyerReturn * 58);
  const fkDamaged = Math.round(fkBuyerReturn * 48);
  const fkPkg = Math.round(fkOrders * 12);
  const fkCm1 = fkRev - fkCogs - fkTotalFees - fkRtoLoss - fkReverseLoss - fkDamaged - fkPkg;
  const fkAds = Math.round(fkRev * 0.08);
  const fkCm2 = fkCm1 - fkAds;

  // Meesho
  const meeGross = Math.round(meeRev * 1.29);
  const meeCogs = Math.round(meeRev * 0.40);
  const meeReferral = 0; // 0% commission
  const meeClosing = Math.round(meeOrders * 10);
  const meeShipping = Math.round(meeOrders * 109);
  const meePlatform = Math.round(meeOrders * 7);
  const meeTotalFees = meeReferral + meeClosing + meeShipping + meePlatform;
  const meeRto = Math.round(meeOrders * 0.228);
  const meeBuyerReturn = Math.round(meeOrders * 0.071);
  const meeRtoLoss = Math.round(meeRto * 72);
  const meeReverseLoss = Math.round(meeBuyerReturn * 66);
  const meeDamaged = Math.round(meeBuyerReturn * 52);
  const meePkg = Math.round(meeOrders * 12);
  const meeCm1 = meeRev - meeCogs - meeTotalFees - meeRtoLoss - meeReverseLoss - meeDamaged - meePkg;
  const meeAds = Math.round(meeRev * 0.05);
  const meeCm2 = meeCm1 - meeAds;

  return {
    amazon: {
      marketplace: 'amazon',
      grossSales: amzGross,
      returnsValue: amzGross - amzRev,
      netRevenue: amzRev,
      cogs: amzCogs,
      referralFee: amzReferral,
      closingFee: amzClosing,
      weightHandlingFee: amzShipping,
      platformFee: amzPlatform,
      totalFees: amzTotalFees,
      rtoCourierFreightLoss: amzRtoLoss,
      reverseLogisticsFee: amzReverseLoss,
      damagedGoodsLoss: amzDamaged,
      packagingCost: amzPkg,
      cm1: amzCm1,
      adSpend: amzAds,
      cm2: amzCm2,
      ordersCount: amzOrders,
      deliveredOrders: amzOrders - amzRto - amzBuyerReturn,
      rtoOrders: amzRto,
      customerReturnOrders: amzBuyerReturn,
      disbursedToBank: Math.round(amzRev * 0.72),
      reserveWithheld: Math.round(amzRev * 0.07),
      unsettledInTransit: Math.round(amzRev * 0.02),
    },
    flipkart: {
      marketplace: 'flipkart',
      grossSales: fkGross,
      returnsValue: fkGross - fkRev,
      netRevenue: fkRev,
      cogs: fkCogs,
      referralFee: fkReferral,
      closingFee: fkClosing,
      weightHandlingFee: fkShipping,
      platformFee: fkPlatform,
      totalFees: fkTotalFees,
      rtoCourierFreightLoss: fkRtoLoss,
      reverseLogisticsFee: fkReverseLoss,
      damagedGoodsLoss: fkDamaged,
      packagingCost: fkPkg,
      cm1: fkCm1,
      adSpend: fkAds,
      cm2: fkCm2,
      ordersCount: fkOrders,
      deliveredOrders: fkOrders - fkRto - fkBuyerReturn,
      rtoOrders: fkRto,
      customerReturnOrders: fkBuyerReturn,
      disbursedToBank: Math.round(fkRev * 0.71),
      reserveWithheld: Math.round(fkRev * 0.06),
      unsettledInTransit: Math.round(fkRev * 0.02),
    },
    meesho: {
      marketplace: 'meesho',
      grossSales: meeGross,
      returnsValue: meeGross - meeRev,
      netRevenue: meeRev,
      cogs: meeCogs,
      referralFee: meeReferral,
      closingFee: meeClosing,
      weightHandlingFee: meeShipping,
      platformFee: meePlatform,
      totalFees: meeTotalFees,
      rtoCourierFreightLoss: meeRtoLoss,
      reverseLogisticsFee: meeReverseLoss,
      damagedGoodsLoss: meeDamaged,
      packagingCost: meePkg,
      cm1: meeCm1,
      adSpend: meeAds,
      cm2: meeCm2,
      ordersCount: meeOrders,
      deliveredOrders: meeOrders - meeRto - meeBuyerReturn,
      rtoOrders: meeRto,
      customerReturnOrders: meeBuyerReturn,
      disbursedToBank: Math.round(meeRev * 0.65),
      reserveWithheld: Math.round(meeRev * 0.04),
      unsettledInTransit: Math.round(meeRev * 0.03),
    },
  };
}

/**
 * FY 2024-25 (1 April 2024 to 31 March 2025)
 * Monthly dataset covering 12 months with festive spike in Q3 (Oct/Nov Diwali)
 * Correctly incorporates period-aware GST TCS rates (1.0% pre-10 July 2024; estimated split for July 2024; 0.5% post-10 July 2024)
 * Correctly defines CM1, CM2, and Net Business Profit
 */
export const monthlyDataFY2425: MonthlyMetric[] = [
  {
    month: 'Apr 24',
    monthName: 'April',
    year: 2024,
    quarter: 'Q1',
    grossSales: 1680000,
    returnsValue: 242000,
    netRevenue: 1438000,
    cogs: 546000,
    marketplaceFees: 244000,
    shippingFees: 112000,
    rtoCourierFreightLoss: 28000,
    reverseLogisticsFee: 18000,
    damagedGoodsLoss: 14000,
    packagingCost: 27360, // synthetic estimate (2280 orders * ₹12)
    cm1: 448640,
    cm1MarginPct: 31.20,
    adSpend: 110000,
    cm2: 338640,
    cm2MarginPct: 23.55,
    fixedOverheads: 135000,
    netBusinessProfit: 203640,
    netMarginPct: 14.16,
    ordersCount: 2280,
    deliveredOrders: 1890,
    rtoOrders: 245,
    customerReturnOrders: 145,
    settlementDisbursed: 1042000,
    settlementReserveHeld: 110000,
    settlementPending: 42000,
    gstOutwardTax: 172560,
    taxableSuppliesBase: 1438000,
    gstTcsCalculationType: 'reconciled_gstr8',
    gstTcsCollected: 14380, // 1.0% (pre-10 July 2024 rate)
    gstTcsRatePct: 1.0,
    gstTcsNote: 'Statutory 1.0% TCS under Section 52 (pre-10 July 2024 rate)',
    gstItcClaimable: 72360,
    netGstPayable: 85820,
    channels: createMonthChannels(1438000, 2280, 'Apr 24'),
  },
  {
    month: 'May 24',
    monthName: 'May',
    year: 2024,
    quarter: 'Q1',
    grossSales: 1820000,
    returnsValue: 265000,
    netRevenue: 1555000,
    cogs: 590000,
    marketplaceFees: 264000,
    shippingFees: 122000,
    rtoCourierFreightLoss: 30000,
    reverseLogisticsFee: 19000,
    damagedGoodsLoss: 15000,
    packagingCost: 29640, // synthetic estimate
    cm1: 485360,
    cm1MarginPct: 31.21,
    adSpend: 125000,
    cm2: 360360,
    cm2MarginPct: 23.17,
    fixedOverheads: 135000,
    netBusinessProfit: 225360,
    netMarginPct: 14.49,
    ordersCount: 2470,
    deliveredOrders: 2050,
    rtoOrders: 268,
    customerReturnOrders: 152,
    settlementDisbursed: 1125000,
    settlementReserveHeld: 118000,
    settlementPending: 48000,
    gstOutwardTax: 186600,
    taxableSuppliesBase: 1555000,
    gstTcsCalculationType: 'reconciled_gstr8',
    gstTcsCollected: 15550, // 1.0%
    gstTcsRatePct: 1.0,
    gstTcsNote: 'Statutory 1.0% TCS under Section 52 (pre-10 July 2024 rate)',
    gstItcClaimable: 78300,
    netGstPayable: 92750,
    channels: createMonthChannels(1555000, 2470, 'May 24'),
  },
  {
    month: 'Jun 24',
    monthName: 'June',
    year: 2024,
    quarter: 'Q1',
    grossSales: 1740000,
    returnsValue: 251000,
    netRevenue: 1489000,
    cogs: 565000,
    marketplaceFees: 253000,
    shippingFees: 116000,
    rtoCourierFreightLoss: 29000,
    reverseLogisticsFee: 19000,
    damagedGoodsLoss: 14000,
    packagingCost: 28320,
    cm1: 464680,
    cm1MarginPct: 31.21,
    adSpend: 118000,
    cm2: 346680,
    cm2MarginPct: 23.28,
    fixedOverheads: 135000,
    netBusinessProfit: 211680,
    netMarginPct: 14.22,
    ordersCount: 2360,
    deliveredOrders: 1960,
    rtoOrders: 254,
    customerReturnOrders: 146,
    settlementDisbursed: 1078000,
    settlementReserveHeld: 112000,
    settlementPending: 46000,
    gstOutwardTax: 178680,
    taxableSuppliesBase: 1489000,
    gstTcsCalculationType: 'reconciled_gstr8',
    gstTcsCollected: 14890, // 1.0%
    gstTcsRatePct: 1.0,
    gstTcsNote: 'Statutory 1.0% TCS under Section 52 (pre-10 July 2024 rate)',
    gstItcClaimable: 75060,
    netGstPayable: 88730,
    channels: createMonthChannels(1489000, 2360, 'Jun 24'),
  },
  {
    month: 'Jul 24',
    monthName: 'July',
    year: 2024,
    quarter: 'Q2',
    grossSales: 1950000,
    returnsValue: 288000,
    netRevenue: 1662000,
    cogs: 631000,
    marketplaceFees: 282000,
    shippingFees: 130000,
    rtoCourierFreightLoss: 33000,
    reverseLogisticsFee: 20000,
    damagedGoodsLoss: 16000,
    packagingCost: 31680,
    cm1: 518320,
    cm1MarginPct: 31.19,
    adSpend: 135000,
    cm2: 383320,
    cm2MarginPct: 23.06,
    fixedOverheads: 140000,
    netBusinessProfit: 243320,
    netMarginPct: 14.64,
    ordersCount: 2640,
    deliveredOrders: 2190,
    rtoOrders: 289,
    customerReturnOrders: 161,
    settlementDisbursed: 1205000,
    settlementReserveHeld: 124000,
    settlementPending: 51000,
    gstOutwardTax: 199440,
    taxableSuppliesBase: 1662000,
    gstTcsCalculationType: 'dated_split_actual',
    gstTcsDatedSplit: {
      preJulySupplies: 482000, // 1–9 July 2024 supplies @ 1.0%
      preJulyTcs: 4820,
      postJulySupplies: 1180000, // 10–31 July 2024 supplies @ 0.5%
      postJulyTcs: 5900,
    },
    gstTcsCollected: 10720, // Sum of exact dated tranches: ₹4,820 + ₹5,900
    gstTcsRatePct: null, // Dual statutory rate month
    gstTcsNote: 'July 2024 dated supply split: 1–9 July taxable supplies ₹4,82,000 @ 1.0% (₹4,820) + 10–31 July taxable supplies ₹11,80,000 @ 0.5% (₹5,900) = ₹10,720 total TCS. Calculated from dated supply split; not a day-weighted average. Reconciled against Form GSTR-8.',
    gstItcClaimable: 83520,
    netGstPayable: 105200,
    channels: createMonthChannels(1662000, 2640, 'Jul 24'),
  },
  {
    month: 'Aug 24',
    monthName: 'August',
    year: 2024,
    quarter: 'Q2',
    grossSales: 2180000,
    returnsValue: 326000,
    netRevenue: 1854000,
    cogs: 704000,
    marketplaceFees: 315000,
    shippingFees: 145000,
    rtoCourierFreightLoss: 37000,
    reverseLogisticsFee: 23000,
    damagedGoodsLoss: 18000,
    packagingCost: 35400,
    cm1: 576600,
    cm1MarginPct: 31.10,
    adSpend: 155000,
    cm2: 421600,
    cm2MarginPct: 22.74,
    fixedOverheads: 140000,
    netBusinessProfit: 281600,
    netMarginPct: 15.19,
    ordersCount: 2950,
    deliveredOrders: 2440,
    rtoOrders: 325,
    customerReturnOrders: 185,
    settlementDisbursed: 1342000,
    settlementReserveHeld: 138000,
    settlementPending: 59000,
    gstOutwardTax: 222480,
    gstTcsCollected: 9270, // 0.5% statutory rate (Notification No. 15/2024-CT)
    gstTcsRatePct: 0.5,
    gstTcsNote: 'Statutory 0.5% TCS under Section 52 (effective 10 July 2024 onward)',
    gstItcClaimable: 93420,
    netGstPayable: 119790,
    channels: createMonthChannels(1854000, 2950, 'Aug 24'),
  },
  {
    month: 'Sep 24',
    monthName: 'September',
    year: 2024,
    quarter: 'Q2',
    grossSales: 2450000,
    returnsValue: 372000,
    netRevenue: 2078000,
    cogs: 789000,
    marketplaceFees: 353000,
    shippingFees: 162000,
    rtoCourierFreightLoss: 42000,
    reverseLogisticsFee: 26000,
    damagedGoodsLoss: 20000,
    packagingCost: 39840,
    cm1: 646160,
    cm1MarginPct: 31.10,
    adSpend: 190000,
    cm2: 456160,
    cm2MarginPct: 21.95,
    fixedOverheads: 145000,
    netBusinessProfit: 311160,
    netMarginPct: 14.97,
    ordersCount: 3320,
    deliveredOrders: 2750,
    rtoOrders: 368,
    customerReturnOrders: 202,
    settlementDisbursed: 1506000,
    settlementReserveHeld: 155000,
    settlementPending: 64000,
    gstOutwardTax: 249360,
    gstTcsCollected: 10390, // 0.5%
    gstTcsRatePct: 0.5,
    gstTcsNote: 'Statutory 0.5% TCS under Section 52 (effective 10 July 2024 onward)',
    gstItcClaimable: 104580,
    netGstPayable: 134390,
    channels: createMonthChannels(2078000, 3320, 'Sep 24'),
  },
  {
    month: 'Oct 24',
    monthName: 'October',
    year: 2024,
    quarter: 'Q3', // Diwali / Festive Surge
    grossSales: 4120000,
    returnsValue: 658000,
    netRevenue: 3462000,
    cogs: 1315000,
    marketplaceFees: 588000,
    shippingFees: 271000,
    rtoCourierFreightLoss: 74000,
    reverseLogisticsFee: 46000,
    damagedGoodsLoss: 34000,
    packagingCost: 66960,
    cm1: 1067040,
    cm1MarginPct: 30.82,
    adSpend: 340000,
    cm2: 727040,
    cm2MarginPct: 21.00,
    fixedOverheads: 165000,
    netBusinessProfit: 562040,
    netMarginPct: 16.23,
    ordersCount: 5580,
    deliveredOrders: 4570,
    rtoOrders: 652,
    customerReturnOrders: 358,
    settlementDisbursed: 2508000,
    settlementReserveHeld: 260000,
    settlementPending: 118000,
    gstOutwardTax: 415440,
    gstTcsCollected: 17310, // 0.5% (3462000 * 0.005)
    gstTcsRatePct: 0.5,
    gstTcsNote: 'Statutory 0.5% TCS under Section 52 (effective 10 July 2024 onward)',
    gstItcClaimable: 174420,
    netGstPayable: 223710,
    channels: createMonthChannels(3462000, 5580, 'Oct 24'),
  },
  {
    month: 'Nov 24',
    monthName: 'November',
    year: 2024,
    quarter: 'Q3',
    grossSales: 3480000,
    returnsValue: 536000,
    netRevenue: 2944000,
    cogs: 1118000,
    marketplaceFees: 500000,
    shippingFees: 231000,
    rtoCourierFreightLoss: 61000,
    reverseLogisticsFee: 39000,
    damagedGoodsLoss: 29000,
    packagingCost: 56640,
    cm1: 909360,
    cm1MarginPct: 30.89,
    adSpend: 260000,
    cm2: 649360,
    cm2MarginPct: 22.06,
    fixedOverheads: 155000,
    netBusinessProfit: 494360,
    netMarginPct: 16.79,
    ordersCount: 4720,
    deliveredOrders: 3880,
    rtoOrders: 535,
    customerReturnOrders: 305,
    settlementDisbursed: 2135000,
    settlementReserveHeld: 220000,
    settlementPending: 89000,
    gstOutwardTax: 353280,
    gstTcsCollected: 14720, // 0.5% (2944000 * 0.005)
    gstTcsRatePct: 0.5,
    gstTcsNote: 'Statutory 0.5% TCS under Section 52 (effective 10 July 2024 onward)',
    gstItcClaimable: 148320,
    netGstPayable: 190240,
    channels: createMonthChannels(2944000, 4720, 'Nov 24'),
  },
  {
    month: 'Dec 24',
    monthName: 'December',
    year: 2024,
    quarter: 'Q3',
    grossSales: 2650000,
    returnsValue: 402000,
    netRevenue: 2248000,
    cogs: 854000,
    marketplaceFees: 382000,
    shippingFees: 175000,
    rtoCourierFreightLoss: 45000,
    reverseLogisticsFee: 28000,
    damagedGoodsLoss: 21000,
    packagingCost: 43080,
    cm1: 699920,
    cm1MarginPct: 31.14,
    adSpend: 185000,
    cm2: 514920,
    cm2MarginPct: 22.91,
    fixedOverheads: 145000,
    netBusinessProfit: 369920,
    netMarginPct: 16.46,
    ordersCount: 3590,
    deliveredOrders: 2980,
    rtoOrders: 396,
    customerReturnOrders: 214,
    settlementDisbursed: 1630000,
    settlementReserveHeld: 168000,
    settlementPending: 69000,
    gstOutwardTax: 269760,
    gstTcsCollected: 11240, // 0.5%
    gstTcsRatePct: 0.5,
    gstTcsNote: 'Statutory 0.5% TCS under Section 52 (effective 10 July 2024 onward)',
    gstItcClaimable: 113220,
    netGstPayable: 145300,
    channels: createMonthChannels(2248000, 3590, 'Dec 24'),
  },
  {
    month: 'Jan 25',
    monthName: 'January',
    year: 2025,
    quarter: 'Q4',
    grossSales: 2290000,
    returnsValue: 348000,
    netRevenue: 1942000,
    cogs: 737000,
    marketplaceFees: 330000,
    shippingFees: 152000,
    rtoCourierFreightLoss: 39000,
    reverseLogisticsFee: 24000,
    damagedGoodsLoss: 18000,
    packagingCost: 37200,
    cm1: 604800,
    cm1MarginPct: 31.14,
    adSpend: 160000,
    cm2: 444800,
    cm2MarginPct: 22.90,
    fixedOverheads: 145000,
    netBusinessProfit: 299800,
    netMarginPct: 15.44,
    ordersCount: 3100,
    deliveredOrders: 2570,
    rtoOrders: 348,
    customerReturnOrders: 182,
    settlementDisbursed: 1408000,
    settlementReserveHeld: 145000,
    settlementPending: 59000,
    gstOutwardTax: 233040,
    gstTcsCollected: 9710, // 0.5%
    gstTcsRatePct: 0.5,
    gstTcsNote: 'Statutory 0.5% TCS under Section 52 (effective 10 July 2024 onward)',
    gstItcClaimable: 97920,
    netGstPayable: 125410,
    channels: createMonthChannels(1942000, 3100, 'Jan 25'),
  },
  {
    month: 'Feb 25',
    monthName: 'February',
    year: 2025,
    quarter: 'Q4',
    grossSales: 2120000,
    returnsValue: 320000,
    netRevenue: 1800000,
    cogs: 684000,
    marketplaceFees: 306000,
    shippingFees: 140000,
    rtoCourierFreightLoss: 36000,
    reverseLogisticsFee: 22000,
    damagedGoodsLoss: 17000,
    packagingCost: 34440,
    cm1: 560560,
    cm1MarginPct: 31.14,
    adSpend: 150000,
    cm2: 410560,
    cm2MarginPct: 22.81,
    fixedOverheads: 145000,
    netBusinessProfit: 265560,
    netMarginPct: 14.75,
    ordersCount: 2870,
    deliveredOrders: 2380,
    rtoOrders: 318,
    customerReturnOrders: 172,
    settlementDisbursed: 1305000,
    settlementReserveHeld: 134000,
    settlementPending: 54000,
    gstOutwardTax: 216000,
    gstTcsCollected: 9000, // 0.5%
    gstTcsRatePct: 0.5,
    gstTcsNote: 'Statutory 0.5% TCS under Section 52 (effective 10 July 2024 onward)',
    gstItcClaimable: 90720,
    netGstPayable: 116280,
    channels: createMonthChannels(1800000, 2870, 'Feb 25'),
  },
  {
    month: 'Mar 25',
    monthName: 'March',
    year: 2025,
    quarter: 'Q4',
    grossSales: 2410000,
    returnsValue: 364000,
    netRevenue: 2046000,
    cogs: 777000,
    marketplaceFees: 348000,
    shippingFees: 159000,
    rtoCourierFreightLoss: 41000,
    reverseLogisticsFee: 25000,
    damagedGoodsLoss: 19000,
    packagingCost: 39120,
    cm1: 637880,
    cm1MarginPct: 31.18,
    adSpend: 175000,
    cm2: 462880,
    cm2MarginPct: 22.62,
    fixedOverheads: 150000,
    netBusinessProfit: 312880,
    netMarginPct: 15.29,
    ordersCount: 3260,
    deliveredOrders: 2710,
    rtoOrders: 362,
    customerReturnOrders: 188,
    settlementDisbursed: 1483000,
    settlementReserveHeld: 152000,
    settlementPending: 61000,
    gstOutwardTax: 245520,
    gstTcsCollected: 10230, // 0.5%
    gstTcsRatePct: 0.5,
    gstTcsNote: 'Statutory 0.5% TCS under Section 52 (effective 10 July 2024 onward)',
    gstItcClaimable: 103140,
    netGstPayable: 132150,
    channels: createMonthChannels(2046000, 3260, 'Mar 25'),
  },
];

/**
 * FY 2025-26 (Provisional projected months Apr-Jun)
 * Consistently applies 0.5% statutory TCS rate
 */
export const monthlyDataFY2526: MonthlyMetric[] = [
  {
    month: 'Apr 25',
    monthName: 'April',
    year: 2025,
    quarter: 'Q1',
    grossSales: 2580000,
    returnsValue: 374000,
    netRevenue: 2206000,
    cogs: 816000,
    marketplaceFees: 375000,
    shippingFees: 171000,
    rtoCourierFreightLoss: 43000,
    reverseLogisticsFee: 27000,
    damagedGoodsLoss: 20000,
    packagingCost: 41880,
    cm1: 712120,
    cm1MarginPct: 32.28,
    adSpend: 190000,
    cm2: 522120,
    cm2MarginPct: 23.67,
    fixedOverheads: 160000,
    netBusinessProfit: 362120,
    netMarginPct: 16.42,
    ordersCount: 3490,
    deliveredOrders: 2910,
    rtoOrders: 372,
    customerReturnOrders: 208,
    settlementDisbursed: 1598000,
    settlementReserveHeld: 165000,
    settlementPending: 66000,
    gstOutwardTax: 264720,
    gstTcsCollected: 11030, // 0.5%
    gstTcsRatePct: 0.5,
    gstTcsNote: 'Statutory 0.5% TCS under Section 52',
    gstItcClaimable: 111180,
    netGstPayable: 142510,
    channels: createMonthChannels(2206000, 3490, 'Apr 25'),
  },
  {
    month: 'May 25',
    monthName: 'May',
    year: 2025,
    quarter: 'Q1',
    grossSales: 2790000,
    returnsValue: 405000,
    netRevenue: 2385000,
    cogs: 882000,
    marketplaceFees: 405000,
    shippingFees: 185000,
    rtoCourierFreightLoss: 47000,
    reverseLogisticsFee: 29000,
    damagedGoodsLoss: 22000,
    packagingCost: 45360,
    cm1: 769640,
    cm1MarginPct: 32.27,
    adSpend: 205000,
    cm2: 564640,
    cm2MarginPct: 23.67,
    fixedOverheads: 160000,
    netBusinessProfit: 404640,
    netMarginPct: 16.97,
    ordersCount: 3780,
    deliveredOrders: 3150,
    rtoOrders: 408,
    customerReturnOrders: 222,
    settlementDisbursed: 1728000,
    settlementReserveHeld: 178000,
    settlementPending: 71000,
    gstOutwardTax: 286200,
    gstTcsCollected: 11925, // 0.5%
    gstTcsRatePct: 0.5,
    gstTcsNote: 'Statutory 0.5% TCS under Section 52',
    gstItcClaimable: 120180,
    netGstPayable: 154095,
    channels: createMonthChannels(2385000, 3780, 'May 25'),
  },
  {
    month: 'Jun 25',
    monthName: 'June',
    year: 2025,
    quarter: 'Q1',
    grossSales: 2680000,
    returnsValue: 388000,
    netRevenue: 2292000,
    cogs: 848000,
    marketplaceFees: 389000,
    shippingFees: 178000,
    rtoCourierFreightLoss: 45000,
    reverseLogisticsFee: 28000,
    damagedGoodsLoss: 21000,
    packagingCost: 43560,
    cm1: 740440,
    cm1MarginPct: 32.31,
    adSpend: 198000,
    cm2: 542440,
    cm2MarginPct: 23.67,
    fixedOverheads: 160000,
    netBusinessProfit: 382440,
    netMarginPct: 16.69,
    ordersCount: 3630,
    deliveredOrders: 3030,
    rtoOrders: 390,
    customerReturnOrders: 210,
    settlementDisbursed: 1661000,
    settlementReserveHeld: 171000,
    settlementPending: 68000,
    gstOutwardTax: 275040,
    gstTcsCollected: 11460, // 0.5%
    gstTcsRatePct: 0.5,
    gstTcsNote: 'Statutory 0.5% TCS under Section 52',
    gstItcClaimable: 115480,
    netGstPayable: 148100,
    channels: createMonthChannels(2292000, 3630, 'Jun 25'),
  },
];

/**
 * Dynamic Aggregator:
 * Computes MarketplaceBreakdown dynamically from active MonthlyMetric[] records.
 * Ensures rates are computed from underlying counts, not averaged.
 */
export function aggregateMarketplaces(
  months: MonthlyMetric[],
  selectedChannel: 'all' | 'amazon' | 'flipkart' | 'meesho'
): MarketplaceBreakdown[] {
  const channelIds: Array<'amazon' | 'flipkart' | 'meesho'> =
    selectedChannel === 'all'
      ? ['amazon', 'flipkart', 'meesho']
      : [selectedChannel];

  return channelIds.map((cid) => {
    const name = cid === 'amazon' ? 'Amazon India' : cid === 'flipkart' ? 'Flipkart' : 'Meesho';
    const brandColor = cid === 'amazon' ? '#FF9900' : cid === 'flipkart' ? '#2874F0' : '#9C27B0';
    const tagline =
      cid === 'amazon'
        ? 'Prime & Easy Ship FBA / Merchant Fulfilled'
        : cid === 'flipkart'
        ? 'Flipkart Assured & Regular Logistics'
        : 'Zero Commission & Supplier Fulfillment';

    const totals = months.reduce(
      (acc, m) => {
        const ch = m.channels[cid];
        if (!ch) return acc;
        acc.grossSales += ch.grossSales;
        acc.netRevenue += ch.netRevenue;
        acc.cogs += ch.cogs;
        acc.referralFee += ch.referralFee;
        acc.closingFee += ch.closingFee;
        acc.weightHandlingFee += ch.weightHandlingFee;
        acc.platformFee += ch.platformFee;
        acc.totalFees += ch.totalFees;
        acc.rtoCourierFreightLoss += ch.rtoCourierFreightLoss;
        acc.reverseLogisticsFee += ch.reverseLogisticsFee;
        acc.damagedGoodsLoss += ch.damagedGoodsLoss;
        acc.packagingLoss += ch.packagingCost;
        acc.cm1 += ch.cm1;
        acc.adSpend += ch.adSpend;
        acc.cm2 += ch.cm2;
        acc.orders += ch.ordersCount;
        acc.unitsSold += Math.round(ch.ordersCount * 1.25);
        acc.rtoCount += ch.rtoOrders;
        acc.customerReturnCount += ch.customerReturnOrders;
        acc.disbursedToBank += ch.disbursedToBank;
        acc.reserveWithheld += ch.reserveWithheld;
        acc.unsettledInTransit += ch.unsettledInTransit;
        return acc;
      },
      {
        grossSales: 0,
        netRevenue: 0,
        cogs: 0,
        referralFee: 0,
        closingFee: 0,
        weightHandlingFee: 0,
        platformFee: 0,
        totalFees: 0,
        rtoCourierFreightLoss: 0,
        reverseLogisticsFee: 0,
        damagedGoodsLoss: 0,
        packagingLoss: 0,
        cm1: 0,
        adSpend: 0,
        cm2: 0,
        orders: 0,
        unitsSold: 0,
        rtoCount: 0,
        customerReturnCount: 0,
        disbursedToBank: 0,
        reserveWithheld: 0,
        unsettledInTransit: 0,
      }
    );

    // Fixed overhead share allocation for Net Business Profit
    const overheadShare =
      cid === 'amazon' ? 0.48 : cid === 'flipkart' ? 0.34 : 0.18;
    const totalFixedOverheads = months.reduce((sum, m) => sum + m.fixedOverheads, 0);
    const netBusinessProfit = totals.cm2 - Math.round(totalFixedOverheads * overheadShare);

    const cm1MarginPct = totals.netRevenue > 0 ? (totals.cm1 / totals.netRevenue) * 100 : 0;
    const cm2MarginPct = totals.netRevenue > 0 ? (totals.cm2 / totals.netRevenue) * 100 : 0;
    const netMarginPct = totals.netRevenue > 0 ? (netBusinessProfit / totals.netRevenue) * 100 : 0;
    const effectiveTakeRatePct = totals.netRevenue > 0 ? (totals.totalFees / totals.netRevenue) * 100 : 0;
    const rtoRatePct = totals.orders > 0 ? (totals.rtoCount / totals.orders) * 100 : 0;
    const customerReturnRatePct = totals.orders > 0 ? (totals.customerReturnCount / totals.orders) * 100 : 0;
    const totalReturnRatePct = rtoRatePct + customerReturnRatePct;
    const totalReturnLossAmount =
      totals.rtoCourierFreightLoss + totals.reverseLogisticsFee + totals.damagedGoodsLoss + totals.packagingLoss;

    return {
      id: cid,
      name,
      brandColor,
      tagline,
      grossSales: totals.grossSales,
      netRevenue: totals.netRevenue,
      orders: totals.orders,
      unitsSold: totals.unitsSold,
      cogs: totals.cogs,
      cm1: totals.cm1,
      cm1MarginPct,
      adSpend: totals.adSpend,
      cm2: totals.cm2,
      cm2MarginPct,
      netBusinessProfit,
      netMarginPct,
      referralFee: totals.referralFee,
      closingFee: totals.closingFee,
      weightHandlingFee: totals.weightHandlingFee,
      platformFee: totals.platformFee,
      totalFees: totals.totalFees,
      effectiveTakeRatePct,
      rtoCount: totals.rtoCount,
      rtoRatePct,
      customerReturnCount: totals.customerReturnCount,
      customerReturnRatePct,
      totalReturnRatePct,
      rtoCourierFreightLoss: totals.rtoCourierFreightLoss,
      reverseLogisticsFee: totals.reverseLogisticsFee,
      damagedGoodsLoss: totals.damagedGoodsLoss,
      packagingLoss: totals.packagingLoss,
      totalReturnLossAmount,
      disbursedToBank: totals.disbursedToBank,
      reserveWithheld: totals.reserveWithheld,
      unsettledInTransit: totals.unsettledInTransit,
    };
  });
}

/**
 * Dynamic Returns Summary Aggregator:
 * Computes ReturnsHealthSummary dynamically from selected months.
 */
export function aggregateReturnsSummary(months: MonthlyMetric[]): ReturnsHealthSummary {
  const totals = months.reduce(
    (acc, m) => {
      acc.totalDispatchedOrders += m.ordersCount;
      acc.deliveredOrders += m.deliveredOrders;
      acc.totalRtoOrders += m.rtoOrders;
      acc.totalCustomerReturns += m.customerReturnOrders;
      acc.rtoCourierFreightLoss += m.rtoCourierFreightLoss;
      acc.reverseLogisticsFee += m.reverseLogisticsFee;
      acc.damagedGoodsLoss += m.damagedGoodsLoss;
      acc.packagingLoss += m.packagingCost;
      return acc;
    },
    {
      totalDispatchedOrders: 0,
      deliveredOrders: 0,
      totalRtoOrders: 0,
      totalCustomerReturns: 0,
      rtoCourierFreightLoss: 0,
      reverseLogisticsFee: 0,
      damagedGoodsLoss: 0,
      packagingLoss: 0,
    }
  );

  const overallRtoRatePct =
    totals.totalDispatchedOrders > 0
      ? (totals.totalRtoOrders / totals.totalDispatchedOrders) * 100
      : 0;
  const overallCustomerReturnRatePct =
    totals.totalDispatchedOrders > 0
      ? (totals.totalCustomerReturns / totals.totalDispatchedOrders) * 100
      : 0;
  const blendedReturnRatePct = overallRtoRatePct + overallCustomerReturnRatePct;
  const totalLossFromReturns =
    totals.rtoCourierFreightLoss +
    totals.reverseLogisticsFee +
    totals.damagedGoodsLoss +
    totals.packagingLoss;

  return {
    ...totals,
    overallRtoRatePct,
    overallCustomerReturnRatePct,
    blendedReturnRatePct,
    totalLossFromReturns,
  };
}

/**
 * SKU Performance catalog for Tabbymart
 * Standardized on flat 18% GST prototype assumption for every product and SKU.
 * For a GST-inclusive selling price:
 * - GST rate: 18%
 * - Taxable value / revenue excluding GST = GST-inclusive selling price ÷ 1.18
 * - Embedded GST = GST-inclusive selling price − taxable value
 * - CM1, CM2, packaging estimate clearly documented
 */
export const sampleSkus: SkuPerformanceItem[] = [
  {
    sku: 'TM-HK-0101',
    title: 'AromaMax Stainless Steel Oil Dispenser 1000ml (Pack of 2)',
    category: 'Home & Kitchen',
    marketplace: 'all',
    mrp: 999,
    sellingPrice: 599,
    unitsSold: 8450,
    grossSales: 5061550,
    netRevenue: 4454000,
    cogsPerUnit: 172,
    totalCogs: 1453400,
    marketplaceFees: 1068960,
    rtoCourierFreightLoss: 124000,
    reverseLogisticsFee: 56000,
    damagedGoodsLoss: 34000,
    packagingCost: 101400, // synthetic estimate: 8450 units * ₹12
    cm1: 1616240,
    cm1MarginPct: 36.29,
    adSpend: 310000,
    cm2: 1306240,
    cm2MarginPct: 29.33,
    rtoUnits: 591,
    rtoRatePct: 7.0,
    customerReturnUnits: 422,
    customerReturnRatePct: 5.0,
    totalReturnRatePct: 12.0,
    returnRiskTier: 'Moderate (8-15%)',
    rank: 1,
    gstRatePct: 18,
    gstHsnCode: 'HSN 7323',
    gstNotes: 'Table, kitchen or household articles of iron/steel · GST Rate: 18% (Prototype Assumption)',
  },
  {
    sku: 'TM-TA-0402',
    title: 'PulseFit Magnetic MagSafe Car Phone Mount 360°',
    category: 'Mobile & Tech Accessories',
    marketplace: 'amazon',
    mrp: 1499,
    sellingPrice: 849,
    unitsSold: 5620,
    grossSales: 4771380,
    netRevenue: 4246500,
    cogsPerUnit: 245,
    totalCogs: 1376900,
    marketplaceFees: 1104090,
    rtoCourierFreightLoss: 94000,
    reverseLogisticsFee: 42000,
    damagedGoodsLoss: 26000,
    packagingCost: 67440, // synthetic estimate: 5620 * ₹12
    cm1: 1536070,
    cm1MarginPct: 36.17,
    adSpend: 330000,
    cm2: 1206070,
    cm2MarginPct: 28.40,
    rtoUnits: 337,
    rtoRatePct: 6.0,
    customerReturnUnits: 281,
    customerReturnRatePct: 5.0,
    totalReturnRatePct: 11.0,
    returnRiskTier: 'Moderate (8-15%)',
    rank: 2,
    gstRatePct: 18,
    gstHsnCode: 'HSN 8529',
    gstNotes: 'Mobile apparatus & magnetic mounts · GST Rate: 18% (Prototype Assumption)',
  },
  {
    sku: 'TM-HK-0214',
    title: 'SilicoGrip Heat Resistant Silicone Kitchen Cooking Utensil Set 12pcs',
    category: 'Home & Kitchen',
    marketplace: 'flipkart',
    mrp: 1699,
    sellingPrice: 949,
    unitsSold: 4180,
    grossSales: 3966820,
    netRevenue: 3411465,
    cogsPerUnit: 290,
    totalCogs: 1212200,
    marketplaceFees: 921095,
    rtoCourierFreightLoss: 104000,
    reverseLogisticsFee: 51000,
    damagedGoodsLoss: 33000,
    packagingCost: 50160,
    cm1: 1040010,
    cm1MarginPct: 30.49,
    adSpend: 240000,
    cm2: 800010,
    cm2MarginPct: 23.45,
    rtoUnits: 418,
    rtoRatePct: 10.0,
    customerReturnUnits: 334,
    customerReturnRatePct: 8.0,
    totalReturnRatePct: 18.0,
    returnRiskTier: 'High (>15%)',
    rank: 3,
    gstRatePct: 18,
    gstHsnCode: 'HSN 3924',
    gstNotes: 'Tableware & kitchenware of silicone · GST Rate: 18% (Prototype Assumption)',
  },
  {
    sku: 'TM-FW-0301',
    title: 'AcuSpike Deep Tissue Foam Roller 45cm with Trigger Points',
    category: 'Fitness & Wellness',
    marketplace: 'amazon',
    mrp: 1299,
    sellingPrice: 699,
    unitsSold: 3740,
    grossSales: 2614260,
    netRevenue: 2326690,
    cogsPerUnit: 195,
    totalCogs: 729300,
    marketplaceFees: 628206,
    rtoCourierFreightLoss: 72000,
    reverseLogisticsFee: 34000,
    damagedGoodsLoss: 22000,
    packagingCost: 44880,
    cm1: 796304,
    cm1MarginPct: 34.23,
    adSpend: 170000,
    cm2: 626304,
    cm2MarginPct: 26.92,
    rtoUnits: 261,
    rtoRatePct: 7.0,
    customerReturnUnits: 187,
    customerReturnRatePct: 5.0,
    totalReturnRatePct: 12.0,
    returnRiskTier: 'Moderate (8-15%)',
    rank: 4,
    gstRatePct: 18,
    gstHsnCode: 'HSN 9506',
    gstNotes: 'Gym & fitness equipment · GST Rate: 18% (Prototype Assumption)',
  },
  {
    sku: 'TM-AF-0112',
    title: 'BreezeWeave Organic Cotton Oversized Unisex T-Shirt (Cobalt Blue)',
    category: 'Apparel & Fashion',
    marketplace: 'meesho',
    mrp: 999,
    sellingPrice: 449,
    unitsSold: 6890,
    grossSales: 3093610,
    netRevenue: 2289270,
    cogsPerUnit: 145,
    totalCogs: 999050,
    marketplaceFees: 686780,
    rtoCourierFreightLoss: 112000,
    reverseLogisticsFee: 48000,
    damagedGoodsLoss: 32000,
    packagingCost: 82680,
    cm1: 328760,
    cm1MarginPct: 14.36,
    adSpend: 110000,
    cm2: 218760,
    cm2MarginPct: 9.56,
    rtoUnits: 1515,
    rtoRatePct: 22.0,
    customerReturnUnits: 551,
    customerReturnRatePct: 8.0,
    totalReturnRatePct: 30.0,
    returnRiskTier: 'Critical (>25%)',
    rank: 5,
    gstRatePct: 18,
    gstHsnCode: 'HSN 6109',
    gstNotes: 'Cotton t-shirts & apparel · GST Rate: 18% (Prototype Assumption)',
  },
  {
    sku: 'TM-TA-0518',
    title: 'UltraSpeed 65W GaN Dual USB-C Fast Charger with Foldable Pins',
    category: 'Mobile & Tech Accessories',
    marketplace: 'amazon',
    mrp: 1999,
    sellingPrice: 1199,
    unitsSold: 1820,
    grossSales: 2182180,
    netRevenue: 1985780,
    cogsPerUnit: 520,
    totalCogs: 946400,
    marketplaceFees: 516300,
    rtoCourierFreightLoss: 48000,
    reverseLogisticsFee: 24000,
    damagedGoodsLoss: 17000,
    packagingCost: 21840,
    cm1: 412240,
    cm1MarginPct: 20.76,
    adSpend: 140000,
    cm2: 272240,
    cm2MarginPct: 13.71,
    rtoUnits: 109,
    rtoRatePct: 6.0,
    customerReturnUnits: 91,
    customerReturnRatePct: 5.0,
    totalReturnRatePct: 11.0,
    returnRiskTier: 'Moderate (8-15%)',
    rank: 6,
    gstRatePct: 18,
    gstHsnCode: 'HSN 8504',
    gstNotes: 'GaN power adapters and chargers · GST Rate: 18% (Prototype Assumption)',
  },
  {
    sku: 'TM-HK-0331',
    title: 'HydroFresh Borosilicate Glass Water Bottle 1000ml with Neoprene Sleeve',
    category: 'Home & Kitchen',
    marketplace: 'flipkart',
    mrp: 899,
    sellingPrice: 479,
    unitsSold: 2950,
    grossSales: 1413050,
    netRevenue: 1186960,
    cogsPerUnit: 168,
    totalCogs: 495600,
    marketplaceFees: 356080,
    rtoCourierFreightLoss: 52000,
    reverseLogisticsFee: 24000,
    damagedGoodsLoss: 18000,
    packagingCost: 35400,
    cm1: 205880,
    cm1MarginPct: 17.35,
    adSpend: 85000,
    cm2: 120880,
    cm2MarginPct: 10.18,
    rtoUnits: 354,
    rtoRatePct: 12.0,
    customerReturnUnits: 236,
    customerReturnRatePct: 8.0,
    totalReturnRatePct: 20.0,
    returnRiskTier: 'High (>15%)',
    rank: 7,
    gstRatePct: 18,
    gstHsnCode: 'HSN 7013',
    gstNotes: 'Borosilicate glassware · GST Rate: 18% (Prototype Assumption)',
  },
  {
    sku: 'TM-AF-0205',
    title: 'LoomCraft Rayon Floral Print Flared Anarkali Kurti (Ruby Red)',
    category: 'Apparel & Fashion',
    marketplace: 'meesho',
    mrp: 1199,
    sellingPrice: 499,
    unitsSold: 4210,
    grossSales: 2100790,
    netRevenue: 1428530,
    cogsPerUnit: 180,
    totalCogs: 757800,
    marketplaceFees: 514270,
    rtoCourierFreightLoss: 98000,
    reverseLogisticsFee: 41000,
    damagedGoodsLoss: 25000,
    packagingCost: 50520,
    cm1: -58060,
    cm1MarginPct: -4.06,
    adSpend: 75000,
    cm2: -133060,
    cm2MarginPct: -9.31,
    rtoUnits: 1052,
    rtoRatePct: 25.0,
    customerReturnUnits: 463,
    customerReturnRatePct: 11.0,
    totalReturnRatePct: 36.0,
    returnRiskTier: 'Critical (>25%)',
    rank: 8,
    gstRatePct: 18,
    gstHsnCode: 'HSN 6204',
    gstNotes: 'Women dresses & kurti · GST Rate: 18% (Prototype Assumption)',
  },
  {
    sku: 'TM-TA-0109',
    title: 'TangleFree Braided 3-in-1 Charging Cable 1.5M Nylon',
    category: 'Mobile & Tech Accessories',
    marketplace: 'meesho',
    mrp: 499,
    sellingPrice: 199,
    unitsSold: 5800,
    grossSales: 1154200,
    netRevenue: 784850,
    cogsPerUnit: 68,
    totalCogs: 394400,
    marketplaceFees: 329630,
    rtoCourierFreightLoss: 58000,
    reverseLogisticsFee: 24000,
    damagedGoodsLoss: 16000,
    packagingCost: 69600,
    cm1: -106780,
    cm1MarginPct: -13.60,
    adSpend: 45000,
    cm2: -151780,
    cm2MarginPct: -19.34,
    rtoUnits: 1566,
    rtoRatePct: 27.0,
    customerReturnUnits: 580,
    customerReturnRatePct: 10.0,
    totalReturnRatePct: 37.0,
    returnRiskTier: 'Critical (>25%)',
    rank: 9,
    gstRatePct: 18,
    gstHsnCode: 'HSN 8544',
    gstNotes: 'Electric cables and connectors · GST Rate: 18% (Prototype Assumption)',
  },
  {
    sku: 'TM-FW-0902',
    title: 'BioPure Organic Ashwagandha & Plant Protein Recovery Blend 500g',
    category: 'Fitness & Wellness',
    marketplace: 'amazon',
    mrp: 1499,
    sellingPrice: 899,
    unitsSold: 1250,
    grossSales: 1123750,
    netRevenue: 988900,
    cogsPerUnit: 340,
    totalCogs: 425000,
    marketplaceFees: 247225,
    rtoCourierFreightLoss: 24000,
    reverseLogisticsFee: 12000,
    damagedGoodsLoss: 8000,
    packagingCost: 15000,
    cm1: 257675,
    cm1MarginPct: 26.06,
    adSpend: 95000,
    cm2: 162675,
    cm2MarginPct: 16.45,
    rtoUnits: 62,
    rtoRatePct: 5.0,
    customerReturnUnits: 38,
    customerReturnRatePct: 3.0,
    totalReturnRatePct: 8.0,
    returnRiskTier: 'Low (<8%)',
    rank: 10,
    gstRatePct: 18,
    gstHsnCode: 'HSN 2106',
    gstNotes: 'Organic recovery nutrition blend · GST Rate: 18% (Prototype Assumption)',
  },
  {
    sku: 'TM-AF-0310',
    title: 'Heritage Silk Blend Festive Embroidered Kurta Set (Navy Gold)',
    category: 'Apparel & Fashion',
    marketplace: 'flipkart',
    mrp: 2999,
    sellingPrice: 1699,
    unitsSold: 2150,
    grossSales: 3652850,
    netRevenue: 3014100,
    cogsPerUnit: 520,
    totalCogs: 1118000,
    marketplaceFees: 843948,
    rtoCourierFreightLoss: 95000,
    reverseLogisticsFee: 46000,
    damagedGoodsLoss: 28000,
    packagingCost: 25800, // synthetic estimate (2150 * ₹12)
    cm1: 857352,
    cm1MarginPct: 28.44,
    adSpend: 210000,
    cm2: 647352,
    cm2MarginPct: 21.48,
    rtoUnits: 258,
    rtoRatePct: 12.0,
    customerReturnUnits: 172,
    customerReturnRatePct: 8.0,
    totalReturnRatePct: 20.0,
    returnRiskTier: 'High (>15%)',
    rank: 11,
    gstRatePct: 18,
    gstHsnCode: 'HSN 6204',
    gstNotes: 'Silk blend festive embroidered kurta · GST Rate: 18% (Prototype Assumption)',
  },
  {
    sku: 'TM-AF-0415',
    title: 'Artisan Handloom Raw Silk Nehru Waistcoat (Charcoal)',
    category: 'Apparel & Fashion',
    marketplace: 'amazon',
    mrp: 3499,
    sellingPrice: 1899,
    unitsSold: 980,
    grossSales: 1861020,
    netRevenue: 1618280,
    cogsPerUnit: 610,
    totalCogs: 597800,
    marketplaceFees: 453118,
    rtoCourierFreightLoss: 42000,
    reverseLogisticsFee: 21000,
    damagedGoodsLoss: 14000,
    packagingCost: 11760, // synthetic estimate (980 * ₹12)
    cm1: 478602,
    cm1MarginPct: 29.57,
    adSpend: 130000,
    cm2: 348602,
    cm2MarginPct: 21.54,
    rtoUnits: 78,
    rtoRatePct: 8.0,
    customerReturnUnits: 59,
    customerReturnRatePct: 6.0,
    totalReturnRatePct: 14.0,
    returnRiskTier: 'Moderate (8-15%)',
    rank: 12,
    gstRatePct: 18,
    gstHsnCode: 'HSN 6203',
    gstNotes: 'Artisan handloom raw silk waistcoat · GST Rate: 18% (Prototype Assumption)',
  },
];

/**
 * Scheduled and expected monthly reports from marketplaces for ingestion & reconciliation
 * Accurately isolates Marketplace TCS (GSTR-8) from Input Tax Credit (GSTR-2B)
 */
export const sampleReports: ReportItem[] = [
  {
    id: 'rep-amz-mtr',
    marketplace: 'amazon',
    category: 'Sales & Orders',
    reportName: 'Amazon Merchant Tax Report (MTR - B2C & B2B)',
    reportCode: 'AMZ-MTR-TAX',
    cadence: 'Monthly',
    fileFormat: 'CSV',
    status: 'Reconciled',
    lastPeriod: 'March 2025',
    reconciliationMatchRate: 99.4,
    unmatchedAmount: 14200,
    reconciliationAuthority: 'Order-level sales & tax registers vs Books of Accounts',
    targetSchema: ['Order ID', 'Invoice Number', 'SKU', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'TCS Base'],
  },
  {
    id: 'rep-amz-settlement',
    marketplace: 'amazon',
    category: 'Settlement & Banking',
    reportName: 'Amazon Date Range Settlement V2 Flat File',
    reportCode: 'AMZ-SETTLE-V2',
    cadence: 'Per Payout',
    fileFormat: 'TXT (Flat)',
    status: 'Reconciled',
    lastPeriod: 'March 2025',
    reconciliationMatchRate: 98.8,
    unmatchedAmount: 28400,
    reconciliationAuthority: 'Bank UTR credits vs Marketplace Settlement Disbursal Ledger',
    targetSchema: ['Settlement ID', 'Transaction Type', 'Order ID', 'Item Price', 'Referral Fee', 'Closing Fee', 'Shipping Fee', 'Total Payout'],
  },
  {
    id: 'rep-fk-sales',
    marketplace: 'flipkart',
    category: 'Sales & Orders',
    reportName: 'Flipkart Sales & Returns Detailed Report',
    reportCode: 'FK-SALES-DET',
    cadence: 'Monthly',
    fileFormat: 'XLSX',
    status: 'Reconciled',
    lastPeriod: 'March 2025',
    reconciliationMatchRate: 97.6,
    unmatchedAmount: 41200,
    discrepancyNotes: '18 reverse shipping deductions flagged for disputed weight slabs (>500g surcharge)',
    reconciliationAuthority: 'Order-level dispatch & return states vs Warehouse Inventory Receipts',
    targetSchema: ['FSN', 'Order Item ID', 'Sale Amount', 'Customer Return Flag', 'RTO Flag', 'Net Taxable'],
  },
  {
    id: 'rep-fk-tcs-discrepancy',
    marketplace: 'flipkart',
    category: 'Marketplace TCS',
    reportName: 'Flipkart Monthly E-Commerce Section 52 TCS Statement',
    reportCode: 'FK-TCS-SEC52',
    cadence: 'Monthly',
    fileFormat: 'CSV',
    status: 'Discrepancy Flagged',
    lastPeriod: 'March 2025',
    reconciliationMatchRate: 94.2,
    unmatchedAmount: 68500,
    discrepancyNotes: 'Unreconciled TCS credit differential between Flipkart sales report and GST Portal Form GSTR-8 (TDS/TCS Credit Received ledger); ₹68,500 pending claim',
    reconciliationAuthority: 'Form GSTR-8 (Electronic Cash Ledger via TDS/TCS Credit Received tab)',
    targetSchema: ['Settlement Month', 'Seller GSTIN', 'Net Taxable Supplies', 'TCS Integrated', 'TCS Central', 'TCS State', 'Portal Acceptance Status'],
  },
  {
    id: 'rep-itc-inward-gstr2b',
    marketplace: 'all',
    category: 'Input Tax Credit (ITC)',
    reportName: 'Marketplace Service Tax Invoices (Commission, Shipping & Ads)',
    reportCode: 'MKT-ITC-GSTR2B',
    cadence: 'Monthly',
    fileFormat: 'JSON',
    status: 'Reconciled',
    lastPeriod: 'March 2025',
    reconciliationMatchRate: 98.1,
    unmatchedAmount: 18200,
    discrepancyNotes: 'Eligible inward ITC on marketplace service fees reconciled against Form GSTR-2B auto-drafted statement',
    reconciliationAuthority: 'Form GSTR-2B (Auto-Drafted Inward Supplies ITC Statement)',
    targetSchema: ['Supplier GSTIN', 'Invoice Number', 'Invoice Date', 'Invoice Value', 'Taxable Value', 'Integrated Tax', 'Central Tax', 'State Tax', 'ITC Availability'],
  },
  {
    id: 'rep-mee-payment',
    marketplace: 'meesho',
    category: 'Settlement & Banking',
    reportName: 'Meesho Consolidated Payment & Deduction Sheet',
    reportCode: 'MEE-PAY-DEDUCT',
    cadence: 'Per Payout',
    fileFormat: 'XLSX',
    status: 'Reconciled',
    lastPeriod: 'March 2025',
    reconciliationMatchRate: 96.5,
    unmatchedAmount: 32100,
    discrepancyNotes: 'Supplier return shipping compensation claimed for 14 wrong returned items',
    reconciliationAuthority: 'Meesho Settlement Ledger vs Bank Statement NEFT credits',
    targetSchema: ['Sub Order No', 'Supplier Discounted Price', 'Shipping Charge Deduction', 'Customer Return Shipping Penalty', 'Net Disbursed'],
  },
];
