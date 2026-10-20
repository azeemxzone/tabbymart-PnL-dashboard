import React, { useState } from 'react';
import { FinancialLens, MarketplaceId, MonthlyMetric } from '../types/finance';
import { formatCompactINR, formatINR, formatNumberIN, formatPercent } from '../utils/formatters';
import {
  TrendingUp,
  ArrowUpRight,
  TrendingDown,
  Info,
  DollarSign,
  Package,
  Layers,
  ShoppingBag,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';

interface ExecutiveHealthProps {
  monthlyData: MonthlyMetric[];
  selectedMonth: string;
  selectedMarketplace: MarketplaceId | 'all';
  financialLens: FinancialLens;
  onNavigateTab: (tab: string) => void;
}

export const ExecutiveHealth: React.FC<ExecutiveHealthProps> = ({
  monthlyData,
  selectedMonth,
  selectedMarketplace,
  financialLens,
  onNavigateTab,
}) => {
  const [activeChartMetric, setActiveChartMetric] = useState<'revenue_cm1_cm2' | 'margins' | 'cash_vs_accrual'>('revenue_cm1_cm2');
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);

  // Filter months if single month is selected
  const displayMonths =
    selectedMonth === 'all'
      ? monthlyData
      : monthlyData.filter((m) => m.month === selectedMonth || m.monthName.toLowerCase() === selectedMonth.toLowerCase());

  // Aggregate values dynamically based on selected marketplace filter
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
        acc.ordersCount += m.ordersCount;
        acc.deliveredOrders += m.deliveredOrders;
        acc.rtoOrders += m.rtoOrders;
        acc.customerReturnOrders += m.customerReturnOrders;
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
          // Separate commission & platform fees from forward shipping to avoid double-counting
          acc.marketplaceFees += (ch.referralFee + ch.closingFee + ch.platformFee);
          acc.shippingFees += ch.weightHandlingFee;
          acc.rtoCourierFreightLoss += ch.rtoCourierFreightLoss;
          acc.reverseLogisticsFee += ch.reverseLogisticsFee;
          acc.damagedGoodsLoss += ch.damagedGoodsLoss;
          acc.packagingCost += ch.packagingCost;
          acc.cm1 += ch.cm1;
          acc.adSpend += ch.adSpend;
          acc.cm2 += ch.cm2;
          // Channel overhead allocation for Net Profit
          const overheadShare = selectedMarketplace === 'amazon' ? 0.48 : selectedMarketplace === 'flipkart' ? 0.34 : 0.18;
          const overhead = Math.round(m.fixedOverheads * overheadShare);
          acc.fixedOverheads += overhead;
          acc.netBusinessProfit += ch.cm2 - overhead;
          acc.ordersCount += ch.ordersCount;
          acc.deliveredOrders += ch.deliveredOrders;
          acc.rtoOrders += ch.rtoOrders;
          acc.customerReturnOrders += ch.customerReturnOrders;
          acc.settlementDisbursed += ch.disbursedToBank;
          acc.settlementReserveHeld += ch.reserveWithheld;
          acc.settlementPending += ch.unsettledInTransit;
          // Channel GST share
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
      ordersCount: 0,
      deliveredOrders: 0,
      rtoOrders: 0,
      customerReturnOrders: 0,
      settlementDisbursed: 0,
      settlementReserveHeld: 0,
      settlementPending: 0,
      gstOutwardTax: 0,
      gstTcsCollected: 0,
      gstItcClaimable: 0,
      netGstPayable: 0,
    }
  );

  // Recalculate margins and rates from underlying counts/totals
  const cm1MarginPct = totals.netRevenue > 0 ? (totals.cm1 / totals.netRevenue) * 100 : 0;
  const cm2MarginPct = totals.netRevenue > 0 ? (totals.cm2 / totals.netRevenue) * 100 : 0;
  const netMarginPct = totals.netRevenue > 0 ? (totals.netBusinessProfit / totals.netRevenue) * 100 : 0;
  const blendedReturnRatePct = totals.ordersCount > 0 ? ((totals.rtoOrders + totals.customerReturnOrders) / totals.ordersCount) * 100 : 0;
  const averageOrderValue = totals.ordersCount > 0 ? totals.grossSales / totals.ordersCount : 0;

  // Chart coordinate calculations
  const maxRevenue = Math.max(...displayMonths.map((m) => m.grossSales), 1);
  const chartHeight = 220;
  const chartWidth = 720;
  const paddingX = 40;
  const paddingY = 24;
  const availableWidth = chartWidth - paddingX * 2;
  const availableHeight = chartHeight - paddingY * 2;
  const stepX = displayMonths.length > 1 ? availableWidth / (displayMonths.length - 1) : availableWidth / 2;

  const revenuePoints = displayMonths.map((m, idx) => ({
    x: paddingX + idx * stepX,
    y: chartHeight - paddingY - (m.netRevenue / maxRevenue) * availableHeight,
    month: m.month,
    value: m.netRevenue,
  }));

  const cm1Points = displayMonths.map((m, idx) => ({
    x: paddingX + idx * stepX,
    y: chartHeight - paddingY - (m.cm1 / maxRevenue) * availableHeight,
    month: m.month,
    value: m.cm1,
  }));

  const cm2Points = displayMonths.map((m, idx) => ({
    x: paddingX + idx * stepX,
    y: chartHeight - paddingY - (m.cm2 / maxRevenue) * availableHeight,
    month: m.month,
    value: m.cm2,
  }));

  const netProfitPoints = displayMonths.map((m, idx) => ({
    x: paddingX + idx * stepX,
    y: chartHeight - paddingY - (m.netBusinessProfit / maxRevenue) * availableHeight,
    month: m.month,
    value: m.netBusinessProfit,
  }));

  const revenuePolyline = revenuePoints.map((p) => `${p.x},${p.y}`).join(' ');
  const cm1Polyline = cm1Points.map((p) => `${p.x},${p.y}`).join(' ');
  const cm2Polyline = cm2Points.map((p) => `${p.x},${p.y}`).join(' ');
  const netProfitPolyline = netProfitPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const activeHoverData = hoveredMonthIndex !== null ? displayMonths[hoveredMonthIndex] : null;

  return (
    <div className="space-y-6">
      {/* Perspective Info Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-900">
              {financialLens === 'economic_pl' && 'Economic Accrual P&L Perspective (CM1, CM2 & Net Profit)'}
              {financialLens === 'settlement_cash' && 'Settlement & Cash Realization Perspective'}
              {financialLens === 'gst_tax' && 'GST Indirect Tax & Section 52 TCS Perspective'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {financialLens === 'economic_pl' &&
                'Accrual basis: Sales revenue matched directly against landed COGS, marketplace commissions, logistics/return costs, packaging (synthetic estimate), and ad spend.'}
              {financialLens === 'settlement_cash' &&
                'Bank realization: Disbursed bank payouts vs rolling reserve funds withheld by Amazon/Flipkart/Meesho and unsettled remittance transit.'}
              {financialLens === 'gst_tax' &&
                'Statutory tax: GSTR-1 outward supplies tax, TCS collected u/s 52 by platforms (1.0% pre-10 July 2024, 0.5% post-10 July 2024), and eligible Input Tax Credit (ITC) via GSTR-2B.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0 self-end md:self-center font-mono">
          <span>Channel: {selectedMarketplace === 'all' ? 'All (Amazon+FK+Meesho)' : selectedMarketplace.toUpperCase()}</span>
          <span aria-hidden="true">·</span>
          <span>Period: {selectedMonth === 'all' ? 'Full FY' : selectedMonth}</span>
        </div>
      </div>

      {/* Section 1: Executive KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Net Revenue */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Net Revenue</span>
            <span className="text-[11px] font-mono text-slate-400">Post-Returns</span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {formatINR(totals.netRevenue)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-mono">
              <span className="text-slate-700 font-medium">Gross: {formatCompactINR(totals.grossSales)}</span>
              <span aria-hidden="true">·</span>
              <span className="text-rose-600">Ret: -{formatCompactINR(totals.returnsValue)}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Orders Dispatched</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">{formatNumberIN(totals.ordersCount)}</span>
          </div>
        </div>

        {/* KPI 2: CM1 (Contribution Margin 1) */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Contribution Margin 1 (CM1)</span>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">
              {formatPercent(cm1MarginPct)} CM1
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-emerald-800 font-mono tabular-nums">
              {formatINR(totals.cm1)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-mono">
              <span>COGS: {formatCompactINR(totals.cogs)}</span>
              <span aria-hidden="true">·</span>
              <span>Fees & Logistics: {formatCompactINR(totals.marketplaceFees + totals.rtoCourierFreightLoss + totals.reverseLogisticsFee + totals.damagedGoodsLoss + totals.packagingCost)}</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Pre-Advertising Contribution</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {totals.ordersCount > 0 ? formatINR(Math.round(totals.cm1 / totals.ordersCount)) : '₹0'} / order
            </span>
          </div>
        </div>

        {/* KPI 3: CM2 (Marketing Contribution) & Net Profit */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">Contribution Margin 2 (CM2)</span>
            <span className="text-[11px] font-mono text-teal-700 font-semibold">
              {formatPercent(cm2MarginPct)} CM2
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-teal-800 font-mono tabular-nums">
              {formatINR(totals.cm2)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-mono">
              <span>Ads: -{formatCompactINR(totals.adSpend)}</span>
              <span aria-hidden="true">·</span>
              <span>Net Profit: {formatCompactINR(totals.netBusinessProfit)} ({formatPercent(netMarginPct)})</span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Net Business Profit</span>
            <span className="font-mono tabular-nums font-semibold text-blue-900">
              {formatINR(totals.netBusinessProfit)}
            </span>
          </div>
        </div>

        {/* KPI 4: Cash & Returns Health */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium">
              {financialLens === 'settlement_cash' ? 'Disbursed to Bank' : financialLens === 'gst_tax' ? 'Net GST Payable' : 'Blended Return Rate'}
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {financialLens === 'settlement_cash' ? 'Realized' : financialLens === 'gst_tax' ? 'Post ITC/TCS' : 'RTO + Buyer'}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {financialLens === 'settlement_cash'
                ? formatINR(totals.settlementDisbursed)
                : financialLens === 'gst_tax'
                ? formatINR(totals.netGstPayable)
                : formatPercent(blendedReturnRatePct)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-mono">
              {financialLens === 'settlement_cash' ? (
                <>
                  <span>Hold Reserve: {formatCompactINR(totals.settlementReserveHeld)}</span>
                  <span aria-hidden="true">·</span>
                  <span>Transit: {formatCompactINR(totals.settlementPending)}</span>
                </>
              ) : financialLens === 'gst_tax' ? (
                <>
                  <span>Output: {formatCompactINR(totals.gstOutwardTax)}</span>
                  <span aria-hidden="true">·</span>
                  <span>TCS: -{formatCompactINR(totals.gstTcsCollected)}</span>
                </>
              ) : (
                <>
                  <span>RTO: {totals.rtoOrders} ({totals.ordersCount > 0 ? ((totals.rtoOrders / totals.ordersCount) * 100).toFixed(1) : 0}%)</span>
                  <span aria-hidden="true">·</span>
                  <span>Buyer: {totals.customerReturnOrders}</span>
                </>
              )}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Avg Order Value (AOV)</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">{formatINR(Math.round(averageOrderValue))}</span>
          </div>
        </div>
      </div>

      {/* Section 1B: Monthly Financial Trend Chart & P&L Waterfall Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Monthly Business Health Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accrual financial performance tracking across FY quarters (Values in INR)
                </p>
              </div>

              {/* Chart Mode Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs">
                <button
                  onClick={() => setActiveChartMetric('revenue_cm1_cm2')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    activeChartMetric === 'revenue_cm1_cm2' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Revenue & CM1 / CM2
                </button>
                <button
                  onClick={() => setActiveChartMetric('margins')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    activeChartMetric === 'margins' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Margin %
                </button>
                <button
                  onClick={() => setActiveChartMetric('cash_vs_accrual')}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    activeChartMetric === 'cash_vs_accrual' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cash vs Accrual
                </button>
              </div>
            </div>

            {/* Chart Canvas */}
            <div className="mt-4 relative overflow-x-auto">
              {displayMonths.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-400 font-mono bg-slate-50 rounded border border-dashed border-slate-200">
                  No monthly financial records available for the selected period filter.
                </div>
              ) : (
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-56 select-none overflow-visible"
                >
                {/* Horizontal Guide Lines */}
                {[0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = chartHeight - paddingY - ratio * availableHeight;
                  const labelVal = maxRevenue * ratio;
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={chartWidth - paddingX}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 6}
                        y={y + 3}
                        textAnchor="end"
                        className="text-[9px] fill-slate-400 font-mono"
                      >
                        {formatCompactINR(labelVal)}
                      </text>
                    </g>
                  );
                })}

                {/* Base axis */}
                <line
                  x1={paddingX}
                  y1={chartHeight - paddingY}
                  x2={chartWidth - paddingX}
                  y2={chartHeight - paddingY}
                  stroke="#cbd5e1"
                />

                {activeChartMetric === 'revenue_cm1_cm2' && (
                  <>
                    {/* Revenue Line */}
                    <polyline fill="none" stroke="#0284c7" strokeWidth="2.5" points={revenuePolyline} />
                    {/* CM1 Line */}
                    <polyline fill="none" stroke="#059669" strokeWidth="2.5" points={cm1Polyline} />
                    {/* CM2 Line */}
                    <polyline fill="none" stroke="#0d9488" strokeWidth="2" strokeDasharray="3 3" points={cm2Polyline} />
                    {/* Net Business Profit Line */}
                    <polyline fill="none" stroke="#6366f1" strokeWidth="2.5" points={netProfitPolyline} />

                    {/* Data Points */}
                    {displayMonths.map((m, idx) => {
                      const x = paddingX + (displayMonths.length > 1 ? idx * stepX : availableWidth / 2);
                      const yRev = chartHeight - paddingY - (m.netRevenue / maxRevenue) * availableHeight;
                      const yCm1 = chartHeight - paddingY - (m.cm1 / maxRevenue) * availableHeight;
                      const yCm2 = chartHeight - paddingY - (m.cm2 / maxRevenue) * availableHeight;
                      const yNet = chartHeight - paddingY - (m.netBusinessProfit / maxRevenue) * availableHeight;
                      const isHovered = hoveredMonthIndex === idx;

                      return (
                        <g
                          key={m.month}
                          onMouseEnter={() => setHoveredMonthIndex(idx)}
                          onMouseLeave={() => setHoveredMonthIndex(null)}
                          className="cursor-pointer"
                        >
                          {isHovered && (
                            <line
                              x1={x}
                              y1={paddingY}
                              x2={x}
                              y2={chartHeight - paddingY}
                              stroke="#94a3b8"
                              strokeWidth="1.5"
                              strokeDasharray="2 2"
                            />
                          )}

                          <circle cx={x} cy={yRev} r={isHovered ? 5 : 3.5} fill="#0284c7" />
                          <circle cx={x} cy={yCm1} r={isHovered ? 5 : 3.5} fill="#059669" />
                          <circle cx={x} cy={yCm2} r={isHovered ? 4.5 : 3} fill="#0d9488" />
                          <circle cx={x} cy={yNet} r={isHovered ? 5 : 3.5} fill="#6366f1" />

                          <text
                            x={x}
                            y={chartHeight - 6}
                            textAnchor="middle"
                            className={`text-[10px] font-mono ${isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-500'}`}
                          >
                            {m.month}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}

                {activeChartMetric === 'margins' && (
                  <>
                    {displayMonths.map((m, idx) => {
                      const x = paddingX + (displayMonths.length > 1 ? idx * stepX : availableWidth / 2) - 14;
                      const barWidth = 28;
                      const maxMargin = 50;
                      const cm1Height = (m.cm1MarginPct / maxMargin) * availableHeight;
                      const cm2Height = (m.cm2MarginPct / maxMargin) * availableHeight;
                      const netHeight = (m.netMarginPct / maxMargin) * availableHeight;
                      const isHovered = hoveredMonthIndex === idx;

                      return (
                        <g
                          key={m.month}
                          onMouseEnter={() => setHoveredMonthIndex(idx)}
                          onMouseLeave={() => setHoveredMonthIndex(null)}
                          className="cursor-pointer"
                        >
                          {/* CM1 Bar */}
                          <rect
                            x={x}
                            y={chartHeight - paddingY - cm1Height}
                            width={barWidth}
                            height={cm1Height}
                            fill={isHovered ? '#059669' : '#10b981'}
                            rx="2"
                            opacity={0.8}
                          />
                          {/* CM2 Bar */}
                          <rect
                            x={x + 3}
                            y={chartHeight - paddingY - cm2Height}
                            width={barWidth - 6}
                            height={cm2Height}
                            fill="#0d9488"
                            rx="1.5"
                          />
                          {/* Net Margin */}
                          <rect
                            x={x + 6}
                            y={chartHeight - paddingY - netHeight}
                            width={barWidth - 12}
                            height={netHeight}
                            fill={isHovered ? '#4338ca' : '#6366f1'}
                            rx="1"
                          />
                          <text
                            x={x + barWidth / 2}
                            y={chartHeight - 6}
                            textAnchor="middle"
                            className={`text-[10px] font-mono ${isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-500'}`}
                          >
                            {m.month}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}

                {activeChartMetric === 'cash_vs_accrual' && (
                  <>
                    {displayMonths.map((m, idx) => {
                      const x = paddingX + (displayMonths.length > 1 ? idx * stepX : availableWidth / 2) - 16;
                      const barW = 14;
                      const revH = (m.netRevenue / maxRevenue) * availableHeight;
                      const cashH = (m.settlementDisbursed / maxRevenue) * availableHeight;
                      const isHovered = hoveredMonthIndex === idx;

                      return (
                        <g
                          key={m.month}
                          onMouseEnter={() => setHoveredMonthIndex(idx)}
                          onMouseLeave={() => setHoveredMonthIndex(null)}
                          className="cursor-pointer"
                        >
                          <rect x={x} y={chartHeight - paddingY - revH} width={barW} height={revH} fill="#0284c7" rx="2" />
                          <rect x={x + barW + 2} y={chartHeight - paddingY - cashH} width={barW} height={cashH} fill="#059669" rx="2" />
                          <text
                            x={x + barW}
                            y={chartHeight - 6}
                            textAnchor="middle"
                            className={`text-[10px] font-mono ${isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-500'}`}
                          >
                            {m.month}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            )}
          </div>

            {/* Hover Data Inspection strip */}
            <div className="mt-2 min-h-7 flex items-center justify-between text-xs px-2 py-1 bg-slate-50 rounded border border-slate-100">
              {activeHoverData ? (
                <div className="flex flex-wrap items-center gap-3 text-slate-700 font-mono text-[11px]">
                  <span className="font-bold text-slate-900">{activeHoverData.monthName} ({activeHoverData.month}):</span>
                  <span>Net Rev: <strong className="text-sky-700">{formatINR(activeHoverData.netRevenue)}</strong></span>
                  <span>CM1: <strong className="text-emerald-700">{formatINR(activeHoverData.cm1)} ({activeHoverData.cm1MarginPct}%)</strong></span>
                  <span>CM2 (Post-Ads): <strong className="text-teal-700">{formatINR(activeHoverData.cm2)} ({activeHoverData.cm2MarginPct}%)</strong></span>
                  <span>Net Profit: <strong className="text-indigo-700">{formatINR(activeHoverData.netBusinessProfit)} ({activeHoverData.netMarginPct}%)</strong></span>
                  <span>Disbursed: <strong className="text-slate-800">{formatINR(activeHoverData.settlementDisbursed)}</strong></span>
                </div>
              ) : (
                <span className="text-slate-400 text-[11px]">Hover over any month on the chart to inspect detailed figures</span>
              )}
            </div>
          </div>

          {/* Chart Legend */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-600 font-medium">
              {activeChartMetric === 'revenue_cm1_cm2' && (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-600 inline-block" />
                    <span>Net Revenue</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
                    <span>CM1 (Pre-Ads)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-teal-600 inline-block" />
                    <span>CM2 (Post-Ads)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" />
                    <span>Net Business Profit</span>
                  </span>
                </>
              )}

              {activeChartMetric === 'margins' && (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                    <span>CM1 %</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-teal-600 inline-block" />
                    <span>CM2 %</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" />
                    <span>Net Profit %</span>
                  </span>
                </>
              )}

              {activeChartMetric === 'cash_vs_accrual' && (
                <>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-sky-600 inline-block" />
                    <span>Accrual Net Revenue</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
                    <span>Disbursed Cash in Bank</span>
                  </span>
                </>
              )}
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Q3 Festive spike reflects Diwali surge
            </div>
          </div>
        </div>

        {/* Right 1 Col: P&L Structure Breakdown (Documented CM1 / CM2 Definitions) */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Documented P&L Waterfall</h3>
              <span className="text-[11px] font-mono text-slate-400">Strict CM1/CM2 Separation</span>
            </div>

            <div className="mt-3 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between py-1 text-slate-600">
                <span>Gross Marketplace Sales</span>
                <span className="tabular-nums font-semibold text-slate-900">{formatINR(totals.grossSales)}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-rose-700 bg-rose-50/50 px-1.5 rounded">
                <span>(-) Returns & Refunds</span>
                <span className="tabular-nums font-medium">-{formatINR(totals.returnsValue)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 font-bold text-slate-900 border-t border-slate-200">
                <span>= Net Revenue (100%)</span>
                <span className="tabular-nums">{formatINR(totals.netRevenue)}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 text-slate-600">
                <span>(-) Landed COGS</span>
                <span className="tabular-nums">-{formatINR(totals.cogs)}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 text-slate-600">
                <span>(-) Marketplace Commission & Fees</span>
                <span className="tabular-nums">-{formatINR(totals.marketplaceFees)}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 text-slate-600">
                <span>(-) Forward Shipping & Easy Ship</span>
                <span className="tabular-nums">-{formatINR(totals.shippingFees)}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 text-rose-700">
                <span>(-) RTO Courier Freight Loss</span>
                <span className="tabular-nums">-{formatINR(totals.rtoCourierFreightLoss)}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 text-rose-700">
                <span>(-) Customer Reverse Logistics</span>
                <span className="tabular-nums">-{formatINR(totals.reverseLogisticsFee)}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 text-rose-700">
                <span>(-) Damaged Goods Scrap</span>
                <span className="tabular-nums">-{formatINR(totals.damagedGoodsLoss)}</span>
              </div>
              <div className="flex items-center justify-between py-0.5 text-slate-600">
                <span title="Synthetic estimate: ₹12 per dispatched order">(-) Packaging (Synthetic Estimate)</span>
                <span className="tabular-nums">-{formatINR(totals.packagingCost)}</span>
              </div>

              {/* CM1 */}
              <div className="flex items-center justify-between py-1.5 font-bold text-emerald-800 bg-emerald-50 px-1.5 rounded border border-emerald-200">
                <span>= Contribution Margin 1 (CM1)</span>
                <span className="tabular-nums">{formatINR(totals.cm1)} ({formatPercent(cm1MarginPct)})</span>
              </div>

              {/* Advertising */}
              <div className="flex items-center justify-between py-1 text-slate-600">
                <span>(-) Performance Marketing (Ads)</span>
                <span className="tabular-nums">-{formatINR(totals.adSpend)}</span>
              </div>

              {/* CM2 */}
              <div className="flex items-center justify-between py-1.5 font-bold text-teal-800 bg-teal-50 px-1.5 rounded border border-teal-200">
                <span>= Contribution Margin 2 (CM2)</span>
                <span className="tabular-nums">{formatINR(totals.cm2)} ({formatPercent(cm2MarginPct)})</span>
              </div>

              {/* Overheads */}
              <div className="flex items-center justify-between py-1 text-slate-600">
                <span>(-) Fixed Overheads & Admin</span>
                <span className="tabular-nums">-{formatINR(totals.fixedOverheads)}</span>
              </div>

              {/* Net Profit */}
              <div className="flex items-center justify-between py-2 font-bold text-blue-900 bg-blue-50 px-2 rounded border border-blue-200 text-sm">
                <span>= Net Business Profit</span>
                <span className="tabular-nums">{formatINR(totals.netBusinessProfit)} ({formatPercent(netMarginPct)})</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need Channel breakdown?</span>
            <button
              onClick={() => onNavigateTab('marketplaces')}
              className="text-slate-900 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Channel Comparison</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
