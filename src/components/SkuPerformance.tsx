import React, { useState, useMemo } from 'react';
import { MarketplaceId, SkuPerformanceItem } from '../types/finance';
import { PROTOTYPE_GST_LABEL } from '../data/sampleData';
import { formatCompactINR, formatINR, formatNumberIN, formatPercent } from '../utils/formatters';
import { SkuDetailModal } from './SkuDetailModal';
import {
  ArrowDown,
  ArrowUp,
  Download,
  Filter,
  Search,
  Sparkles,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
} from 'lucide-react';

interface SkuPerformanceProps {
  skus: SkuPerformanceItem[];
  selectedMarketplace: MarketplaceId | 'all';
}

type SortField =
  | 'rank'
  | 'unitsSold'
  | 'grossSales'
  | 'netRevenue'
  | 'cm1'
  | 'cm1MarginPct'
  | 'cm2'
  | 'totalReturnRatePct';

export const SkuPerformance: React.FC<SkuPerformanceProps> = ({ skus, selectedMarketplace }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterPreset, setFilterPreset] = useState<'all' | 'top_profit' | 'bleeders' | 'high_returns'>('all');
  const [sortField, setSortField] = useState<SortField>('cm1');
  const [sortAscending, setSortAscending] = useState(false);
  const [inspectingSku, setInspectingSku] = useState<SkuPerformanceItem | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(skus.map((s) => s.category));
    return ['all', ...Array.from(set)];
  }, [skus]);

  // Filter & Sort Logic
  const filteredSkus = useMemo(() => {
    return skus
      .filter((item) => {
        // Marketplace filter
        if (selectedMarketplace !== 'all' && item.marketplace !== 'all' && item.marketplace !== selectedMarketplace) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSku = item.sku.toLowerCase().includes(q);
          const matchTitle = item.title.toLowerCase().includes(q);
          if (!matchSku && !matchTitle) return false;
        }

        // Preset filters
        if (filterPreset === 'top_profit') {
          return item.cm1 >= 1000000;
        }
        if (filterPreset === 'bleeders') {
          return item.cm1 <= 50000 || item.cm1MarginPct < 15;
        }
        if (filterPreset === 'high_returns') {
          return item.totalReturnRatePct >= 20;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortAscending) {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [skus, selectedMarketplace, selectedCategory, searchQuery, filterPreset, sortField, sortAscending]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAscending(!sortAscending);
    } else {
      setSortField(field);
      setSortAscending(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'SKU',
      'Product Title',
      'Category',
      'Channel',
      'GST Rate',
      'Units Sold',
      'Gross Sales (INR)',
      'Net Revenue (INR)',
      'COGS (INR)',
      'Fees (INR)',
      'CM1 Pre-Ads (INR)',
      'CM1 Margin (%)',
      'Ads Spend (INR)',
      'CM2 Post-Ads (INR)',
      'RTO (%)',
      'Customer Return (%)',
      'Total Return (%)',
    ];

    const rows = filteredSkus.map((item) => [
      item.rank,
      item.sku,
      `"${item.title.replace(/"/g, '""')}"`,
      item.category,
      item.marketplace,
      '18% (Prototype Assumption)',
      item.unitsSold,
      item.grossSales,
      item.netRevenue,
      item.totalCogs,
      item.marketplaceFees,
      item.cm1,
      item.cm1MarginPct.toFixed(2),
      item.adSpend,
      item.cm2,
      item.rtoRatePct,
      item.customerReturnRatePct,
      item.totalReturnRatePct,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tabbymart_SKU_Performance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base font-bold text-slate-900">SKU Profitability & Ranking</h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200 font-semibold">
                {PROTOTYPE_GST_LABEL}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked best-to-worst by Contribution Margin 1 (CM1), factoring landed COGS, platform fees, logistics losses, and packaging
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU code or product title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
            <button
              onClick={() => setFilterPreset('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterPreset === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All SKUs ({skus.length})
            </button>
            <button
              onClick={() => setFilterPreset('top_profit')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterPreset === 'top_profit' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Top CM1 Drivers
            </button>
            <button
              onClick={() => setFilterPreset('bleeders')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterPreset === 'bleeders' ? 'bg-white text-rose-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Margin Bleeders
            </button>
            <button
              onClick={() => setFilterPreset('high_returns')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterPreset === 'high_returns' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Returns (&gt;20%)
            </button>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2.5 py-1 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="cat-select" className="text-slate-500 font-medium">Category:</label>
            <select
              id="cat-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories
                .filter((c) => c !== 'all')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* SKU Table View */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-sans text-[11px] uppercase tracking-wider select-none">
            <tr>
              <th
                onClick={() => handleSort('rank')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center gap-1">
                  <span>#</span>
                  {sortField === 'rank' && (sortAscending ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-3 px-3">SKU & Title</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">GST Rate</th>
              <th className="py-3 px-3">Channel</th>
              <th
                onClick={() => handleSort('unitsSold')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Units</span>
                  {sortField === 'unitsSold' && (sortAscending ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('netRevenue')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Net Revenue</span>
                  {sortField === 'netRevenue' && (sortAscending ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('cm1')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>CM1 (Pre-Ads)</span>
                  {sortField === 'cm1' && (sortAscending ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('cm1MarginPct')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>CM1 %</span>
                  {sortField === 'cm1MarginPct' && (sortAscending ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('cm2')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>CM2 (Post-Ads)</span>
                  {sortField === 'cm2' && (sortAscending ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('totalReturnRatePct')}
                className="py-3 px-3 text-right cursor-pointer hover:bg-slate-100"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Return Rate</span>
                  {sortField === 'totalReturnRatePct' && (sortAscending ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="py-3 px-3 text-center">Unit Econ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredSkus.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-8 text-center text-slate-400 font-sans">
                  No SKUs match your filter criteria. Try clearing search or presets.
                </td>
              </tr>
            ) : (
              filteredSkus.map((item) => {
                const isLossMaker = item.cm1 < 0;
                const isHighReturn = item.totalReturnRatePct >= 20;

                return (
                  <tr
                    key={item.sku}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setInspectingSku(item)}
                  >
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      #{item.rank}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {item.sku}
                        </span>
                        <span className="truncate max-w-xs">{item.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        ASP: {formatINR(item.sellingPrice)} · MRP: {formatINR(item.mrp)}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-sans text-xs">
                      {item.category}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200" title="GST Rate: 18% (Prototype Assumption)">
                        18%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] text-slate-700 uppercase">
                        {item.marketplace}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      {formatNumberIN(item.unitsSold)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-medium text-slate-900">
                      {formatINR(item.netRevenue)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold">
                      <span className={isLossMaker ? 'text-rose-700' : 'text-emerald-700'}>
                        {formatINR(item.cm1)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold">
                      <span className={item.cm1MarginPct < 15 ? 'text-rose-700' : 'text-emerald-800'}>
                        {formatPercent(item.cm1MarginPct)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums font-semibold text-teal-800">
                      {formatINR(item.cm2)}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      <div className="flex items-center justify-end gap-1">
                        {isHighReturn && <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />}
                        <span className={isHighReturn ? 'text-amber-800 font-bold' : 'text-slate-700'}>
                          {formatPercent(item.totalReturnRatePct)}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        RTO {item.rtoRatePct}% / Cust {item.customerReturnRatePct}%
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingSku(item);
                        }}
                        className="px-2 py-1 text-[11px] font-sans font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <span>Teardown</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sku Details Unit Economics Modal */}
      <SkuDetailModal
        skuItem={inspectingSku}
        onClose={() => setInspectingSku(null)}
      />
    </div>
  );
};
