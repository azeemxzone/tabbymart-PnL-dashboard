import React from 'react';
import { SkuPerformanceItem } from '../types/finance';
import { calculateProductGst, PROTOTYPE_GST_LABEL } from '../data/sampleData';
import { formatCompactINR, formatINR, formatNumberIN, formatPercent } from '../utils/formatters';
import { X, AlertCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SkuDetailModalProps {
  skuItem: SkuPerformanceItem | null;
  onClose: () => void;
}

export const SkuDetailModal: React.FC<SkuDetailModalProps> = ({ skuItem, onClose }) => {
  if (!skuItem) return null;

  const units = skuItem.unitsSold || 1;
  const sellingPrice = skuItem.sellingPrice;
  const cogsPerUnit = skuItem.cogsPerUnit;

  // Prototype GST Assumption: Flat 18% for every product and SKU
  // Taxable value / revenue excluding GST = GST-inclusive selling price ÷ 1.18
  // Embedded GST = GST-inclusive selling price − taxable value
  // Internal calculations use unrounded numbers; display and export round consistently.
  const { taxableValue, embeddedGst } = calculateProductGst(sellingPrice);
  const baseRevenue = taxableValue;

  // Cost allocations per unit
  const feesPerUnit = skuItem.marketplaceFees / units;
  const rtoLossPerUnit = skuItem.rtoCourierFreightLoss / units;
  const reverseLogisticsPerUnit = skuItem.reverseLogisticsFee / units;
  const damagedScrapPerUnit = skuItem.damagedGoodsLoss / units;
  const packagingPerUnit = 12; // Clearly labelled synthetic estimate

  // Unit CM1 (Unrounded internal computation)
  const unitCm1 =
    baseRevenue -
    cogsPerUnit -
    feesPerUnit -
    rtoLossPerUnit -
    reverseLogisticsPerUnit -
    damagedScrapPerUnit -
    packagingPerUnit;

  const unitCm1MarginPct = baseRevenue > 0 ? (unitCm1 / baseRevenue) * 100 : 0;

  const adSpendPerUnit = skuItem.adSpend / units;
  const unitCm2 = unitCm1 - adSpendPerUnit;
  const unitCm2MarginPct = baseRevenue > 0 ? (unitCm2 / baseRevenue) * 100 : 0;

  const isProfitable = unitCm1 > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {skuItem.sku}
              </span>
              <span className="text-xs text-slate-500">
                Rank #{skuItem.rank} · {skuItem.category}
              </span>
              {/* GST Rate Badge */}
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 font-semibold">
                {skuItem.gstHsnCode} · {PROTOTYPE_GST_LABEL}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">
              {skuItem.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Summary Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">Total Units Sold</span>
              <span className="text-lg font-bold font-mono text-slate-900">{formatNumberIN(skuItem.unitsSold)}</span>
              <span className="text-[10px] text-slate-500 font-mono block">Gross: {formatCompactINR(skuItem.grossSales)}</span>
            </div>

            <div className={`p-3 rounded-lg border ${isProfitable ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'}`}>
              <span className="text-[11px] text-slate-500 block font-medium">CM1 (Pre-Ads)</span>
              <span className={`text-lg font-bold font-mono ${isProfitable ? 'text-emerald-800' : 'text-rose-800'}`}>
                {formatINR(Math.round(unitCm1 * units))}
              </span>
              <span className="text-[10px] text-slate-600 font-mono block">
                CM2 (Post-Ads): {formatINR(Math.round(unitCm2 * units))}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-400 block font-medium">Total Return Rate</span>
              <span className="text-lg font-bold font-mono text-slate-900">{formatPercent(skuItem.totalReturnRatePct)}</span>
              <span className="text-[10px] text-slate-500 font-mono block">
                RTO: {skuItem.rtoRatePct}% · Buyer: {skuItem.customerReturnRatePct}%
              </span>
            </div>
          </div>

          {/* Unit Economics Breakdown Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Unit-Level Economic Breakdown (Per Sold Unit)
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                Packaging = Synthetic ₹12 Estimate
              </span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs font-mono">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 border-b border-slate-200 font-sans font-semibold text-slate-800">
                <span>Consumer Selling Price (Listing ASP)</span>
                <span className="font-mono">{formatINR(skuItem.sellingPrice)}</span>
              </div>
              <div className="divide-y divide-slate-100 p-1">
                {/* Embedded GST Outward Tax */}
                <div className="flex items-center justify-between px-2 py-1.5 text-slate-600">
                  <div className="flex items-center gap-1.5 font-sans">
                    <span>(-) Embedded GST Outward Tax</span>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-mono border border-purple-200">
                      {PROTOTYPE_GST_LABEL}
                    </span>
                  </div>
                  <span className="text-rose-700">
                    -{formatINR(Math.round(embeddedGst))}
                  </span>
                </div>

                {/* Net Seller Revenue (Ex-GST) */}
                <div className="flex items-center justify-between px-2 py-1.5 font-medium text-slate-800">
                  <span className="font-sans">= Net Seller Revenue (Ex-GST)</span>
                  <span className="tabular-nums">{formatINR(Math.round(baseRevenue))}</span>
                </div>

                {/* COGS */}
                <div className="flex items-center justify-between px-2 py-1.5 text-slate-600">
                  <span className="font-sans">(-) Landed Product COGS</span>
                  <span className="text-rose-700">-{formatINR(Math.round(cogsPerUnit))}</span>
                </div>

                {/* Marketplace Fees */}
                <div className="flex items-center justify-between px-2 py-1.5 text-slate-600">
                  <span className="font-sans">(-) Marketplace Referral & Closing Fees</span>
                  <span className="text-rose-700">-{formatINR(Math.round(feesPerUnit))}</span>
                </div>

                {/* Logistics breakdown: No double counting */}
                <div className="flex items-center justify-between px-2 py-1.5 text-slate-600">
                  <span className="font-sans">(-) RTO Courier Freight Loss Allocation</span>
                  <span className="text-amber-800">-{formatINR(Math.round(rtoLossPerUnit))}</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 text-slate-600">
                  <span className="font-sans">(-) Customer Return Reverse Logistics</span>
                  <span className="text-rose-700">-{formatINR(Math.round(reverseLogisticsPerUnit))}</span>
                </div>
                <div className="flex items-center justify-between px-2 py-1.5 text-slate-600">
                  <span className="font-sans">(-) Damaged Inventory Scrap Allocation</span>
                  <span className="text-rose-700">-{formatINR(Math.round(damagedScrapPerUnit))}</span>
                </div>

                {/* Packaging */}
                <div className="flex items-center justify-between px-2 py-1.5 text-slate-600">
                  <span className="font-sans">(-) Packaging Materials (Synthetic Estimate)</span>
                  <span className="text-slate-700 font-mono">-{formatINR(packagingPerUnit)}</span>
                </div>

                {/* Realized CM1 */}
                <div className={`flex items-center justify-between px-2 py-2 font-bold text-sm ${isProfitable ? 'text-emerald-800 bg-emerald-50' : 'text-rose-800 bg-rose-50'}`}>
                  <span className="font-sans">= Unit CM1 (Pre-Advertising)</span>
                  <span className="tabular-nums">
                    {formatINR(Math.round(unitCm1))} ({formatPercent(unitCm1MarginPct)})
                  </span>
                </div>

                {/* Ads */}
                <div className="flex items-center justify-between px-2 py-1.5 text-slate-600">
                  <span className="font-sans">(-) Sponsored Ads Allocation</span>
                  <span className="text-slate-700">-{formatINR(Math.round(adSpendPerUnit))}</span>
                </div>

                {/* Realized CM2 */}
                <div className="flex items-center justify-between px-2 py-2 font-bold text-sm text-teal-900 bg-teal-50 border-t border-teal-200">
                  <span className="font-sans">= Unit CM2 (Post-Advertising)</span>
                  <span className="tabular-nums">
                    {formatINR(Math.round(unitCm2))} ({formatPercent(unitCm2MarginPct)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* GST Policy Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-purple-700" />
                <span>GST Policy & Taxable Valuation</span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-semibold border border-purple-200">
                {PROTOTYPE_GST_LABEL}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600">
              For this dashboard prototype, a flat 18% GST rate is applied across all products and SKUs. For a GST-inclusive consumer selling price, taxable revenue excluding GST is computed as <code>selling price ÷ 1.18</code>, and embedded outward GST is <code>selling price − taxable value</code>.
            </p>
            <p className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-200">
              *Prototype Assumption: Internal computations use unrounded values; displayed and exported currency metrics are rounded consistently. GST outward tax is separate from marketplace settlement and Section 52 TCS.
            </p>
          </div>

          {/* Diagnostic warnings */}
          {skuItem.totalReturnRatePct > 20 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">High Return Risk Diagnostic</strong>
                <p className="mt-0.5 text-amber-800">
                  Blended return rate is {skuItem.totalReturnRatePct}% ({skuItem.rtoRatePct}% RTO + {skuItem.customerReturnRatePct}% buyer returns).
                  Combined courier deductions total -{formatINR(skuItem.rtoCourierFreightLoss + skuItem.reverseLogisticsFee + skuItem.damagedGoodsLoss)}.
                </p>
              </div>
            </div>
          )}

          {skuItem.cm1 < 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 text-xs text-rose-900 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Margin Bleeder Warning</strong>
                <p className="mt-0.5 text-rose-800">
                  Unit CM1 is negative (-{formatINR(Math.abs(skuItem.cm1))}). Every unit shipped burns operating cash.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">Channel: {skuItem.marketplace.toUpperCase()}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Close Teardown
          </button>
        </div>
      </div>
    </div>
  );
};
