import React from 'react';
import { MarketplaceBreakdown, MarketplaceId, MonthlyMetric } from '../types/finance';
import { aggregateMarketplaces } from '../data/sampleData';
import { formatCompactINR, formatINR, formatNumberIN, formatPercent } from '../utils/formatters';
import { CheckCircle2, ChevronRight, Layers, ShieldAlert, Sparkles, TrendingUp, AlertCircle } from 'lucide-react';

interface MarketplaceComparisonProps {
  monthlyData: MonthlyMetric[];
  selectedMonth: string;
  selectedMarketplace: MarketplaceId | 'all';
  onSelectMarketplace: (mkt: MarketplaceId | 'all') => void;
  onNavigateTab: (tab: string) => void;
}

export const MarketplaceComparison: React.FC<MarketplaceComparisonProps> = ({
  monthlyData,
  selectedMonth,
  selectedMarketplace,
  onSelectMarketplace,
  onNavigateTab,
}) => {
  // Dynamically filter active months based on global period filter
  const displayMonths =
    selectedMonth === 'all'
      ? monthlyData
      : monthlyData.filter(
          (m) => m.month === selectedMonth || m.monthName.toLowerCase() === selectedMonth.toLowerCase()
        );

  // If no months match
  const hasData = displayMonths.length > 0;

  // Dynamically aggregate channel performance from underlying monthly dataset
  const dynamicMarketplaces = hasData
    ? aggregateMarketplaces(displayMonths, selectedMarketplace)
    : [];

  const totalGross = dynamicMarketplaces.reduce((sum, m) => sum + m.grossSales, 0);
  const totalNet = dynamicMarketplaces.reduce((sum, m) => sum + m.netRevenue, 0);
  const totalFees = dynamicMarketplaces.reduce((sum, m) => sum + m.totalFees, 0);
  const totalOrders = dynamicMarketplaces.reduce((sum, m) => sum + m.orders, 0);
  const totalCm1 = dynamicMarketplaces.reduce((sum, m) => sum + m.cm1, 0);
  const totalCm2 = dynamicMarketplaces.reduce((sum, m) => sum + m.cm2, 0);
  const totalRto = dynamicMarketplaces.reduce((sum, m) => sum + m.rtoCount, 0);
  const totalBuyer = dynamicMarketplaces.reduce((sum, m) => sum + m.customerReturnCount, 0);

  // Underlying rate calculations (not averaged)
  const combinedTakeRate = totalNet > 0 ? (totalFees / totalNet) * 100 : 0;
  const combinedCm1Margin = totalNet > 0 ? (totalCm1 / totalNet) * 100 : 0;
  const combinedCm2Margin = totalNet > 0 ? (totalCm2 / totalNet) * 100 : 0;
  const combinedRtoRate = totalOrders > 0 ? (totalRto / totalOrders) * 100 : 0;
  const combinedBuyerRate = totalOrders > 0 ? (totalBuyer / totalOrders) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Marketplace Channel Performance & Take Rates</h2>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Period: {selectedMonth === 'all' ? 'Full FY' : selectedMonth}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative analysis across Amazon India, Flipkart and Meesho with dynamically aggregated sales, fees, and CM1 / CM2 realization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter View:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs">
              <button
                onClick={() => onSelectMarketplace('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedMarketplace === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All 3 Channels
              </button>
              {(['amazon', 'flipkart', 'meesho'] as const).map((mId) => (
                <button
                  key={mId}
                  onClick={() => onSelectMarketplace(mId)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    selectedMarketplace === mId ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mId === 'amazon' ? 'Amazon' : mId === 'flipkart' ? 'Flipkart' : 'Meesho'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Channel Volume Distribution Bars */}
        {hasData && totalNet > 0 ? (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-mono">
              <span>Net Revenue Channel Share (Dynamically Filtered)</span>
              <span>Total: {formatINR(totalNet)}</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
              {dynamicMarketplaces.map((m) => {
                const sharePct = (m.netRevenue / totalNet) * 100;
                const bgClass =
                  m.id === 'amazon'
                    ? 'bg-amber-500'
                    : m.id === 'flipkart'
                    ? 'bg-blue-600'
                    : 'bg-purple-600';
                return (
                  <div
                    key={m.id}
                    style={{ width: `${sharePct}%` }}
                    title={`${m.name}: ${sharePct.toFixed(1)}% (${formatINR(m.netRevenue)})`}
                    className={`${bgClass} h-full transition-all`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-5 mt-2 text-xs">
              {dynamicMarketplaces.map((m) => {
                const sharePct = totalNet > 0 ? (m.netRevenue / totalNet) * 100 : 0;
                const dotClass =
                  m.id === 'amazon'
                    ? 'bg-amber-500'
                    : m.id === 'flipkart'
                    ? 'bg-blue-600'
                    : 'bg-purple-600';
                return (
                  <div key={m.id} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
                    <span className="font-medium text-slate-900">{m.name}:</span>
                    <span className="text-slate-500 font-mono tabular-nums">
                      {formatPercent(sharePct)} ({formatCompactINR(m.netRevenue)})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 text-center text-xs text-slate-400 font-mono bg-slate-50 rounded">
            No data available for the selected filter combination.
          </div>
        )}
      </div>

      {/* Side-by-Side Marketplace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {dynamicMarketplaces.map((mkt) => {
          const isAmazon = mkt.id === 'amazon';
          const isFlipkart = mkt.id === 'flipkart';
          const badgeBg = isAmazon
            ? 'bg-amber-50 text-amber-900 border-amber-200'
            : isFlipkart
            ? 'bg-blue-50 text-blue-900 border-blue-200'
            : 'bg-purple-50 text-purple-900 border-purple-200';

          return (
            <div
              key={mkt.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-slate-900">{mkt.name}</span>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${badgeBg}`}>
                    {isAmazon ? 'FBA / Easy Ship' : isFlipkart ? 'Flipkart Assured' : 'Supplier Zero%'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{mkt.tagline}</p>

                {/* Primary Metrics Grid */}
                <div className="mt-4 grid grid-cols-2 gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Net Revenue</span>
                    <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                      {formatCompactINR(mkt.netRevenue)}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      Gross: {formatCompactINR(mkt.grossSales)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">CM1 (Pre-Ads)</span>
                    <span className="text-lg font-bold font-mono tabular-nums text-emerald-700">
                      {formatPercent(mkt.cm1MarginPct)}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {formatCompactINR(mkt.cm1)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">CM2 (Post-Ads)</span>
                    <span className="text-base font-bold font-mono tabular-nums text-teal-700">
                      {formatPercent(mkt.cm2MarginPct)}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      Ads: -{formatCompactINR(mkt.adSpend)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Effective Take Rate</span>
                    <span className="text-base font-bold font-mono tabular-nums text-rose-700">
                      {formatPercent(mkt.effectiveTakeRatePct)}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-mono">
                      Fees: {formatCompactINR(mkt.totalFees)}
                    </span>
                  </div>
                </div>

                {/* Fee Anatomy Breakdown */}
                <div className="mt-3 space-y-1.5 text-xs font-mono">
                  <div className="text-[11px] text-slate-400 font-sans font-medium uppercase tracking-wider mb-2">
                    Fee Breakdown & Deductions
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Referral Commission</span>
                    <span className="tabular-nums">
                      {mkt.referralFee > 0 ? formatINR(mkt.referralFee) : '₹0 (0% Headline)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Closing / Fixed Fee</span>
                    <span className="tabular-nums">{formatINR(mkt.closingFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Logistics / Weight Handling</span>
                    <span className="tabular-nums">{formatINR(mkt.weightHandlingFee)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Platform / Listing & Storage</span>
                    <span className="tabular-nums">{formatINR(mkt.platformFee)}</span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-100">
                    <span>Total Channel Deductions</span>
                    <span className="tabular-nums text-rose-800">{formatINR(mkt.totalFees)}</span>
                  </div>
                </div>

                {/* Return Profile & Loss Isolation */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-[11px] text-slate-400 font-sans font-medium uppercase tracking-wider mb-2">
                    Returns Profile & Isolated Losses
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-slate-400 block">RTO Rate:</span>
                      <strong className="text-slate-900 font-bold">{formatPercent(mkt.rtoRatePct)}</strong> ({formatNumberIN(mkt.rtoCount)} orders)
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="text-slate-400 block">Buyer Return:</span>
                      <strong className="text-slate-900 font-bold">{formatPercent(mkt.customerReturnRatePct)}</strong> ({formatNumberIN(mkt.customerReturnCount)} orders)
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-[11px] font-mono text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>RTO Freight Loss:</span>
                      <span className="text-amber-800">-{formatINR(mkt.rtoCourierFreightLoss)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Reverse Logistics Fee:</span>
                      <span className="text-rose-700">-{formatINR(mkt.reverseLogisticsFee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Damage Scrap & Packaging:</span>
                      <span className="text-slate-700">-{formatINR(mkt.damagedGoodsLoss + mkt.packagingLoss)}</span>
                    </div>
                  </div>
                </div>

                {/* Settlement Realization */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-[11px] text-slate-400 font-sans font-medium uppercase tracking-wider mb-1.5">
                    Settlement & Cash Realization
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-700">
                    <span>Disbursed to Bank:</span>
                    <strong className="text-emerald-700 tabular-nums">{formatINR(mkt.disbursedToBank)}</strong>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 mt-1">
                    <span>Held Reserve Balance:</span>
                    <span className="tabular-nums">{formatINR(mkt.reserveWithheld)}</span>
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => onNavigateTab('returns')}
                  className="w-full py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors flex items-center justify-center gap-1"
                >
                  <span>Inspect {mkt.name} Returns</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Take-Rate Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Detailed Channel Take-Rate & Unit Realization Matrix (Dynamic Filter)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          All numbers calculated from underlying records for the active period ({selectedMonth === 'all' ? 'Full FY' : selectedMonth})
        </p>

        {hasData ? (
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 font-sans text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Marketplace Channel</th>
                <th className="py-2.5 px-3 text-right">Orders</th>
                <th className="py-2.5 px-3 text-right">Gross Sales</th>
                <th className="py-2.5 px-3 text-right">Net Revenue</th>
                <th className="py-2.5 px-3 text-right">Platform Fees</th>
                <th className="py-2.5 px-3 text-right">Take Rate %</th>
                <th className="py-2.5 px-3 text-right">CM1 (Pre-Ads)</th>
                <th className="py-2.5 px-3 text-right">CM1 %</th>
                <th className="py-2.5 px-3 text-right">CM2 (Post-Ads)</th>
                <th className="py-2.5 px-3 text-right">RTO Rate %</th>
                <th className="py-2.5 px-3 text-right">Buyer Return %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {dynamicMarketplaces.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-sans font-semibold text-slate-900 flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        m.id === 'amazon'
                          ? 'bg-amber-500'
                          : m.id === 'flipkart'
                          ? 'bg-blue-600'
                          : 'bg-purple-600'
                      }`}
                    />
                    <span>{m.name}</span>
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">{formatNumberIN(m.orders)}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{formatINR(m.grossSales)}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-slate-900">{formatINR(m.netRevenue)}</td>
                  <td className="py-3 px-3 text-right tabular-nums text-rose-700">-{formatINR(m.totalFees)}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-bold text-rose-800">{formatPercent(m.effectiveTakeRatePct)}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-emerald-800">{formatINR(m.cm1)}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-bold text-emerald-800">{formatPercent(m.cm1MarginPct)}</td>
                  <td className="py-3 px-3 text-right tabular-nums font-semibold text-teal-800">{formatINR(m.cm2)}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{formatPercent(m.rtoRatePct)}</td>
                  <td className="py-3 px-3 text-right tabular-nums">{formatPercent(m.customerReturnRatePct)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-bold text-slate-900">
              <tr>
                <td className="py-2.5 px-3 font-sans">Combined Total</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{formatNumberIN(totalOrders)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{formatINR(totalGross)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{formatINR(totalNet)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums text-rose-800">-{formatINR(totalFees)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{formatPercent(combinedTakeRate)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums text-emerald-900">{formatINR(totalCm1)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums text-emerald-900">{formatPercent(combinedCm1Margin)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums text-teal-900">{formatINR(totalCm2)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{formatPercent(combinedRtoRate)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{formatPercent(combinedBuyerRate)}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 font-mono">
            No data available for the selected filter combination.
          </div>
        )}
      </div>
    </div>
  );
};
