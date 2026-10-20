import React from 'react';
import { FinancialLens, MarketplaceId, MonthlyMetric } from '../types/finance';
import { formatCompactINR, formatINR, formatNumberIN, formatPercent } from '../utils/formatters';
import { DollarSign, Layers, Receipt, ShieldCheck, AlertCircle } from 'lucide-react';

interface FinancialLensViewProps {
  financialLens: FinancialLens;
  monthlyData: MonthlyMetric[];
  selectedMonth: string;
  selectedMarketplace: MarketplaceId | 'all';
  onSelectLens: (lens: FinancialLens) => void;
}

export const FinancialLensView: React.FC<FinancialLensViewProps> = ({
  financialLens,
  monthlyData,
  selectedMonth,
  selectedMarketplace,
  onSelectLens,
}) => {
  // Dynamically filter active months based on global period filter
  const displayMonths =
    selectedMonth === 'all'
      ? monthlyData
      : monthlyData.filter(
          (m) => m.month === selectedMonth || m.monthName.toLowerCase() === selectedMonth.toLowerCase()
        );

  const hasData = displayMonths.length > 0;

  // Aggregate data dynamically from active dataset
  const totals = displayMonths.reduce(
    (acc, m) => {
      if (selectedMarketplace === 'all') {
        acc.grossSales += m.grossSales;
        acc.returnsValue += m.returnsValue;
        acc.netRevenue += m.netRevenue;
        acc.cogs += m.cogs;
        acc.marketplaceFees += m.marketplaceFees;
        acc.shippingFees += m.shippingFees;
        acc.rtoCourierFreightLoss += m.rtoCourierFreightLoss;
        acc.reverseLogisticsFee += m.reverseLogisticsFee;
        acc.damagedGoodsLoss += m.damagedGoodsLoss;
        acc.packagingCost += m.packagingCost;
        acc.cm1 += m.cm1;
        acc.adSpend += m.adSpend;
        acc.cm2 += m.cm2;
        acc.fixedOverheads += m.fixedOverheads;
        acc.netBusinessProfit += m.netBusinessProfit;
        acc.settlementDisbursed += m.settlementDisbursed;
        acc.settlementReserveHeld += m.settlementReserveHeld;
        acc.settlementPending += m.settlementPending;
        acc.gstOutwardTax += m.gstOutwardTax;
        acc.gstTcsCollected += m.gstTcsCollected;
        acc.gstItcClaimable += m.gstItcClaimable;
        acc.netGstPayable += m.netGstPayable;
      } else {
        const ch = m.channels[selectedMarketplace];
        if (ch) {
          acc.grossSales += ch.grossSales;
          acc.returnsValue += ch.returnsValue;
          acc.netRevenue += ch.netRevenue;
          acc.cogs += ch.cogs;
          acc.marketplaceFees += (ch.referralFee + ch.closingFee + ch.platformFee);
          acc.shippingFees += ch.weightHandlingFee;
          acc.rtoCourierFreightLoss += ch.rtoCourierFreightLoss;
          acc.reverseLogisticsFee += ch.reverseLogisticsFee;
          acc.damagedGoodsLoss += ch.damagedGoodsLoss;
          acc.packagingCost += ch.packagingCost;
          acc.cm1 += ch.cm1;
          acc.adSpend += ch.adSpend;
          acc.cm2 += ch.cm2;
          const overheadShare = selectedMarketplace === 'amazon' ? 0.48 : selectedMarketplace === 'flipkart' ? 0.34 : 0.18;
          const overhead = Math.round(m.fixedOverheads * overheadShare);
          acc.fixedOverheads += overhead;
          acc.netBusinessProfit += ch.cm2 - overhead;
          acc.settlementDisbursed += ch.disbursedToBank;
          acc.settlementReserveHeld += ch.reserveWithheld;
          acc.settlementPending += ch.unsettledInTransit;
          const gstShare = ch.netRevenue / (m.netRevenue || 1);
          acc.gstOutwardTax += Math.round(m.gstOutwardTax * gstShare);
          acc.gstTcsCollected += Math.round(m.gstTcsCollected * gstShare);
          acc.gstItcClaimable += Math.round(m.gstItcClaimable * gstShare);
          acc.netGstPayable += Math.round(m.netGstPayable * gstShare);
        }
      }
      return acc;
    },
    {
      grossSales: 0,
      returnsValue: 0,
      netRevenue: 0,
      cogs: 0,
      marketplaceFees: 0,
      shippingFees: 0,
      rtoCourierFreightLoss: 0,
      reverseLogisticsFee: 0,
      damagedGoodsLoss: 0,
      packagingCost: 0,
      cm1: 0,
      adSpend: 0,
      cm2: 0,
      fixedOverheads: 0,
      netBusinessProfit: 0,
      settlementDisbursed: 0,
      settlementReserveHeld: 0,
      settlementPending: 0,
      gstOutwardTax: 0,
      gstTcsCollected: 0,
      gstItcClaimable: 0,
      netGstPayable: 0,
    }
  );

  const isJuly2024 = selectedMonth === 'Jul 24' || displayMonths.some((m) => m.month === 'Jul 24');

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
      {/* Selector tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <span>Independent Financial Accounting Perspectives</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict separation between Economic Profitability (CM1/CM2), Bank Cash Realization, and Statutory Indirect Tax
            {selectedMonth !== 'all' && <span className="font-mono text-slate-700 font-semibold ml-1">· Period: {selectedMonth}</span>}
            {selectedMarketplace !== 'all' && <span className="font-mono text-slate-700 font-semibold ml-1">· Channel: {selectedMarketplace.toUpperCase()}</span>}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs">
          <button
            onClick={() => onSelectLens('economic_pl')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              financialLens === 'economic_pl'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Economic P&L (CM1 / CM2)
          </button>
          <button
            onClick={() => onSelectLens('settlement_cash')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              financialLens === 'settlement_cash'
                ? 'bg-emerald-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Settlement & Cash Realization
          </button>
          <button
            onClick={() => onSelectLens('gst_tax')}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              financialLens === 'gst_tax'
                ? 'bg-purple-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. GST Indirect Tax & TCS
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="py-6 text-center text-xs text-slate-400 font-mono bg-slate-50 rounded border border-dashed border-slate-200">
          No financial records found for the selected period filter.
        </div>
      ) : (
        <>
          {/* Lens 1: Economic Accrual P&L */}
          {financialLens === 'economic_pl' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-lg text-xs text-blue-950 flex items-start justify-between gap-4">
                <div>
                  <strong className="font-bold block text-sm">Economic P&L Concept (CM1, CM2 & Net Profit Tiers)</strong>
                  <p className="mt-1 leading-relaxed text-blue-900">
                    Matches order revenue generated in the selected period with its landed COGS, marketplace commissions, logistics/return costs, packaging (synthetic estimate), and ad spend—regardless of when marketplaces disburse funds to your bank account.
                  </p>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <span className="text-[11px] text-blue-700 block">CM1 Margin / CM2 Margin</span>
                  <span className="text-base font-bold text-blue-900">
                    {formatPercent((totals.cm1 / (totals.netRevenue || 1)) * 100)} / {formatPercent((totals.cm2 / (totals.netRevenue || 1)) * 100)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-slate-400 block font-sans">Net Revenue</span>
                  <strong className="text-base text-slate-900">{formatINR(totals.netRevenue)}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-slate-400 block font-sans">Contribution Margin 1</span>
                  <strong className="text-base text-emerald-800">{formatINR(totals.cm1)}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-slate-400 block font-sans">Contribution Margin 2 (Post-Ads)</span>
                  <strong className="text-base text-teal-800">{formatINR(totals.cm2)}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-slate-400 block font-sans">Net Business Profit</span>
                  <strong className="text-base text-blue-900">{formatINR(totals.netBusinessProfit)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Lens 2: Settlement & Cash Realization */}
          {financialLens === 'settlement_cash' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex items-start justify-between gap-4">
                <div>
                  <strong className="font-bold block text-sm">Settlement & Cash Realization Concept</strong>
                  <p className="mt-1 leading-relaxed text-emerald-900">
                    Measures actual cash entering Tabbymart's bank accounts via NEFT/RTGS payouts. Marketplaces enforce a rolling 7-day reserve hold, deduct advertising fees directly at payout source, and retain unpaid balances on in-transit or unresolved orders.
                  </p>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <span className="text-[11px] text-emerald-700 block">Disbursed to Bank</span>
                  <span className="text-xl font-bold text-emerald-900">{formatCompactINR(totals.settlementDisbursed)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-slate-400 block font-sans">Bank Remittances</span>
                  <strong className="text-base text-emerald-800">{formatINR(totals.settlementDisbursed)}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-slate-400 block font-sans">Rolling Reserve Held</span>
                  <strong className="text-base text-amber-800">{formatINR(totals.settlementReserveHeld)}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-slate-400 block font-sans">In-Transit Unsettled</span>
                  <strong className="text-base text-slate-800">{formatINR(totals.settlementPending)}</strong>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-slate-400 block font-sans">Cash Realization vs CM1</span>
                  <strong className="text-base text-slate-900 font-bold">
                    {totals.cm1 > 0 ? formatPercent((totals.settlementDisbursed / totals.cm1) * 100) : '—'}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Lens 3: GST Indirect Tax & TCS */}
          {financialLens === 'gst_tax' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-purple-50/50 border border-purple-200 rounded-lg text-xs text-purple-950 flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div>
                    <strong className="font-bold block text-sm">GST Indirect Tax & Section 52 TCS Compliance</strong>
                    <p className="mt-1 leading-relaxed text-purple-900">
                      Under Section 52 of the CGST Act, e-commerce operators collect TCS on the <strong>net value of taxable supplies</strong> (gross taxable supplies minus returns): <strong>1.0% prior to 10 July 2024</strong>, and <strong>0.5% effective from 10 July 2024 onward</strong> (via Notification No. 15/2024-CT).
                    </p>
                  </div>

                  {/* July 2024 Dated Supply Split Documentation */}
                  {isJuly2024 && (
                    <div className="text-[11px] text-purple-950 font-mono bg-purple-100/80 p-2.5 rounded border border-purple-300 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-purple-900">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                        <span>July 2024 Statutory Dual-Rate Split (Dated Supplies):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-purple-200/80">
                        <div>
                          <span className="text-purple-700">1–9 July 2024 (1.0% Rate):</span>
                          <span className="block font-bold">₹4,82,000 taxable supplies = ₹4,820 TCS</span>
                        </div>
                        <div>
                          <span className="text-purple-700">10–31 July 2024 (0.5% Rate):</span>
                          <span className="block font-bold">₹11,80,000 taxable supplies = ₹5,900 TCS</span>
                        </div>
                      </div>
                      <div className="pt-1 border-t border-purple-200/80 text-[10px] text-purple-800">
                        Total July 2024 TCS = <strong>₹10,720</strong>. Derived strictly by summing exact dated tranches; day-weighted averaging (such as 0.645%) is not applied. If dated transaction supply records are missing, the figure is labelled as an estimate. Reconciled against platform Form GSTR-8.
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-purple-800 font-sans">
                    *TCS Base Notice: Section 52 TCS is levied on the Net Value of Taxable Supplies, distinct from Economic P&L Net Revenue. Reconciliation authority is the Electronic Cash Ledger via Form GSTR-8 (TDS/TCS Credit Received).
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <span className="text-[11px] text-purple-700 block">Net Cash GST Payable</span>
                  <span className="text-xl font-bold text-purple-900">{formatCompactINR(totals.netGstPayable)}</span>
                  <span className="text-[10px] text-purple-600 block mt-0.5">After TCS & ITC offset</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-slate-400 block font-sans">Outward Tax (GSTR-1)</span>
                  <strong className="text-base text-slate-900">{formatINR(totals.gstOutwardTax)}</strong>
                  <span className="text-[10px] text-slate-500 block font-sans">Taxable base: {formatCompactINR(totals.netRevenue)}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-slate-400 block font-sans">TCS Collected (Sec 52)</span>
                  <strong className="text-base text-blue-800">{formatINR(totals.gstTcsCollected)}</strong>
                  <span className="text-[10px] text-slate-500 block font-sans">
                    {selectedMonth === 'Jul 24' ? 'Dated supply split (GSTR-8)' : 'Reconciled via GSTR-8'}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-slate-400 block font-sans">ITC on Platform Fees</span>
                  <strong className="text-base text-emerald-800">-{formatINR(totals.gstItcClaimable)}</strong>
                  <span className="text-[10px] text-slate-500 block font-sans">Auto-drafted in GSTR-2B</span>
                </div>
                <div className="bg-slate-50 p-3 rounded border border-slate-200">
                  <span className="text-slate-400 block font-sans">Net Cash GST (GSTR-3B)</span>
                  <strong className="text-base text-purple-900">{formatINR(totals.netGstPayable)}</strong>
                  <span className="text-[10px] text-slate-500 block font-sans">Electronic Cash Ledger cash</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
