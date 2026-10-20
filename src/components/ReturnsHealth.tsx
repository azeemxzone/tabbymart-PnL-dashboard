import React from 'react';
import { MarketplaceId, MonthlyMetric, SkuPerformanceItem } from '../types/finance';
import { aggregateMarketplaces, aggregateReturnsSummary } from '../data/sampleData';
import { formatCompactINR, formatINR, formatNumberIN, formatPercent } from '../utils/formatters';
import { AlertCircle, AlertTriangle, ArrowRight, CheckCircle2, RotateCcw, Truck } from 'lucide-react';

interface ReturnsHealthProps {
  monthlyData: MonthlyMetric[];
  selectedMonth: string;
  selectedMarketplace: MarketplaceId | 'all';
  skus: SkuPerformanceItem[];
  onInspectSku: (sku: SkuPerformanceItem) => void;
}

export const ReturnsHealth: React.FC<ReturnsHealthProps> = ({
  monthlyData,
  selectedMonth,
  selectedMarketplace,
  skus,
  onInspectSku,
}) => {
  // Dynamically filter active months
  const displayMonths =
    selectedMonth === 'all'
      ? monthlyData
      : monthlyData.filter(
          (m) => m.month === selectedMonth || m.monthName.toLowerCase() === selectedMonth.toLowerCase()
        );

  const hasData = displayMonths.length > 0;

  // Dynamic Returns Summary computed from underlying records
  const dynamicReturnsSummary = aggregateReturnsSummary(displayMonths);

  // Dynamic Marketplace breakdown computed from underlying records
  const dynamicMarketplaces = aggregateMarketplaces(displayMonths, selectedMarketplace);

  // Filter SKUs by marketplace
  const filteredSkus =
    selectedMarketplace === 'all'
      ? skus
      : skus.filter((s) => s.marketplace === 'all' || s.marketplace === selectedMarketplace);

  const highReturnSkus = [...filteredSkus].sort((a, b) => b.totalReturnRatePct - a.totalReturnRatePct);

  return (
    <div className="space-y-6">
      {/* Educational Banner: RTO vs Customer Return Definition */}
      <div className="bg-slate-900 text-white rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
              Indian E-Commerce Logistics Mechanics (Dynamic Period: {selectedMonth === 'all' ? 'Full FY' : selectedMonth})
            </span>
            <h2 className="text-base font-bold">RTO (Return to Origin) vs. Customer Return</h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              In Indian marketplace operations, treating all returns together conceals critical courier leakages.
              <strong> RTO</strong> occurs when Cash-on-Delivery (COD) or doorstep delivery fails before acceptance—sellers lose forward courier charges.
              <strong> Customer Returns</strong> occur post-delivery—triggering forward shipping, reverse logistics surcharges, packaging scrap, and product damage risks.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-2 bg-slate-800 rounded border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">Blended Return Rate</span>
              <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                {formatPercent(dynamicReturnsSummary.blendedReturnRatePct)}
              </span>
            </div>
            <div className="px-3 py-2 bg-slate-800 rounded border border-slate-700 text-center">
              <span className="text-[10px] text-slate-400 block font-mono">Total Return Loss</span>
              <span className="text-xl font-bold font-mono text-rose-400 tabular-nums">
                {formatCompactINR(dynamicReturnsSummary.totalLossFromReturns)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Strip - Dynamically Aggregated */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Total Dispatched Orders</span>
            <span className="text-[11px] font-mono text-slate-400">{selectedMonth === 'all' ? 'Full FY' : selectedMonth}</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatNumberIN(dynamicReturnsSummary.totalDispatchedOrders)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Delivered: {formatNumberIN(dynamicReturnsSummary.deliveredOrders)} ({formatPercent(
                dynamicReturnsSummary.totalDispatchedOrders > 0
                  ? (dynamicReturnsSummary.deliveredOrders / dynamicReturnsSummary.totalDispatchedOrders) * 100
                  : 0
              )})
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">RTO (Doorstep Undelivered)</span>
            <span className="text-[11px] font-mono text-amber-700 font-semibold">
              {formatPercent(dynamicReturnsSummary.overallRtoRatePct)}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-amber-800 font-mono tabular-nums">
              {formatNumberIN(dynamicReturnsSummary.totalRtoOrders)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Forward Freight Loss: {formatCompactINR(dynamicReturnsSummary.rtoCourierFreightLoss)}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Customer (Buyer) Returns</span>
            <span className="text-[11px] font-mono text-rose-700 font-semibold">
              {formatPercent(dynamicReturnsSummary.overallCustomerReturnRatePct)}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-rose-800 font-mono tabular-nums">
              {formatNumberIN(dynamicReturnsSummary.totalCustomerReturns)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Reverse Logistics: {formatCompactINR(dynamicReturnsSummary.reverseLogisticsFee)}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Damaged / Unsellable Goods</span>
            <span className="text-[11px] font-mono text-slate-400">Inventory Scrap</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatINR(dynamicReturnsSummary.damagedGoodsLoss)}
            </div>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Packaging Scrapped: {formatCompactINR(dynamicReturnsSummary.packagingLoss)} (Synthetic ₹12/order)
            </div>
          </div>
        </div>
      </div>

      {/* Channel Comparison: RTO vs Customer Return breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Marketplace RTO vs Buyer Return comparison */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Returns Breakdown by Channel (Dynamic Filter)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison of RTO undelivered rate vs post-delivery customer returns per platform
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-amber-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                <span>RTO Rate</span>
              </span>
              <span className="flex items-center gap-1.5 font-medium text-rose-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                <span>Customer Return Rate</span>
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-6">
            {dynamicMarketplaces.map((m) => {
              const totalReturnRate = m.rtoRatePct + m.customerReturnRatePct;
              return (
                <div key={m.id} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        ({formatNumberIN(m.orders)} orders)
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-700">
                      Total Return: <strong className="text-slate-900">{totalReturnRate.toFixed(1)}%</strong> ({formatNumberIN(m.rtoCount + m.customerReturnCount)} units) · Loss: <span className="text-rose-700">-{formatINR(m.totalReturnLossAmount)}</span>
                    </div>
                  </div>

                  {/* Dual Bar Representation */}
                  <div className="w-full h-4 bg-slate-100 rounded overflow-hidden flex">
                    <div
                      style={{ width: `${(m.rtoRatePct / 35) * 100}%` }}
                      className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-mono text-white font-bold"
                      title={`RTO: ${m.rtoRatePct.toFixed(1)}%`}
                    >
                      {m.rtoRatePct.toFixed(1)}%
                    </div>
                    <div
                      style={{ width: `${(m.customerReturnRatePct / 35) * 100}%` }}
                      className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-mono text-white font-bold"
                      title={`Customer: ${m.customerReturnRatePct.toFixed(1)}%`}
                    >
                      {m.customerReturnRatePct.toFixed(1)}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-0.5">
                    <span>
                      RTO: {formatNumberIN(m.rtoCount)} orders ({m.rtoRatePct.toFixed(1)}%) — Forward Freight Loss (-{formatINR(m.rtoCourierFreightLoss)})
                    </span>
                    <span>
                      Buyer: {formatNumberIN(m.customerReturnCount)} orders ({m.customerReturnRatePct.toFixed(1)}%) — Reverse Logistics (-{formatINR(m.reverseLogisticsFee)})
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Channel Logistics Insight:</strong> Meesho displays elevated RTO rates (~22.8%) primarily driven by Cash on Delivery (COD) customer segments where delivery attempts bounce without payment. Amazon has lower RTO (~8.2%) due to higher prepaid penetration, but higher buyer return rates (~10.5%) under hassle-free return window policies.
            </p>
          </div>
        </div>

        {/* Right 1 Col: Financial Loss Breakdown & Mitigation Playbook */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Return Loss Anatomy (No Double Counting)</h3>
              <span className="text-[11px] font-mono text-rose-700 font-bold">
                Total: -{formatINR(dynamicReturnsSummary.totalLossFromReturns)}
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-amber-50/50 border border-amber-200/80">
                <div className="flex items-center justify-between text-amber-950 font-semibold font-sans">
                  <span>1. Forward Courier Freight Loss (RTO)</span>
                  <span className="font-mono">{formatINR(dynamicReturnsSummary.rtoCourierFreightLoss)}</span>
                </div>
                <p className="text-[11px] text-amber-800 font-sans mt-0.5">
                  Courier charges incurred for attempted deliveries where customer refused shipment.
                </p>
              </div>

              <div className="p-2.5 rounded bg-rose-50/50 border border-rose-200/80">
                <div className="flex items-center justify-between text-rose-950 font-semibold font-sans">
                  <span>2. Reverse Logistics Fees (Buyer Returns)</span>
                  <span className="font-mono">{formatINR(dynamicReturnsSummary.reverseLogisticsFee)}</span>
                </div>
                <p className="text-[11px] text-rose-800 font-sans mt-0.5">
                  Marketplace return processing and reverse courier surcharge charged back to seller.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-800 font-semibold font-sans">
                  <span>3. Damaged / Unsellable Goods</span>
                  <span className="font-mono">{formatINR(dynamicReturnsSummary.damagedGoodsLoss)}</span>
                </div>
                <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                  Goods returned in damaged condition or substituted with scrap.
                </p>
              </div>

              <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-800 font-semibold font-sans">
                  <span>4. Packaging Material Scrapped</span>
                  <span className="font-mono">{formatINR(dynamicReturnsSummary.packagingLoss)}</span>
                </div>
                <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                  Boxes, polybags, tamper tape scrapped (Synthetic ₹12/order estimate).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Active Mitigation Levers
            </h4>
            <ul className="text-xs text-slate-600 space-y-1">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>IVR / WhatsApp automated confirmation on high-risk COD</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>SAFE-T claim filing for missing/damaged return units</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Strict deadweight & volumetric packaging calibration</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* High Return Risk SKUs Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Highest Return Rate SKUs (Action Needed)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Products exceeding 15% combined return threshold requiring packaging or listing inspection
            </p>
          </div>
          <span className="text-xs text-amber-700 font-mono font-medium">
            Threshold: &gt;15% Return Rate
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 font-sans text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Product Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3 text-right">RTO Rate %</th>
                <th className="py-2.5 px-3 text-right">Buyer Return %</th>
                <th className="py-2.5 px-3 text-right">Total Return Rate %</th>
                <th className="py-2.5 px-3 text-right">Direct Return Loss (INR)</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {highReturnSkus.slice(0, 5).map((item) => (
                <tr key={item.sku} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{item.sku}</td>
                  <td className="py-2.5 px-3 font-sans truncate max-w-xs">{item.title}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-600">{item.category}</td>
                  <td className="py-2.5 px-3 uppercase text-[11px]">{item.marketplace}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-amber-800 font-semibold">{item.rtoRatePct}%</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-rose-800 font-semibold">{item.customerReturnRatePct}%</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-rose-900">{item.totalReturnRatePct}%</td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-rose-700">
                    -{formatINR(item.rtoCourierFreightLoss + item.reverseLogisticsFee + item.damagedGoodsLoss)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onInspectSku(item)}
                      className="px-2 py-1 text-[11px] font-sans font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors"
                    >
                      Inspect Economics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
