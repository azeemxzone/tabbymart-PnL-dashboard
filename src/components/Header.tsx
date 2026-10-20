import React from 'react';
import { FinancialLens, FinancialYear, MarketplaceId } from '../types/finance';
import { AlertTriangle, Calendar, Layers, Store, UploadCloud } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  financialYear: FinancialYear;
  setFinancialYear: (fy: FinancialYear) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedMarketplace: MarketplaceId | 'all';
  setSelectedMarketplace: (mkt: MarketplaceId | 'all') => void;
  financialLens: FinancialLens;
  setFinancialLens: (lens: FinancialLens) => void;
  onOpenUploadModal: () => void;
  monthsList: string[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  financialYear,
  setFinancialYear,
  selectedMonth,
  setSelectedMonth,
  selectedMarketplace,
  setSelectedMarketplace,
  financialLens,
  setFinancialLens,
  onOpenUploadModal,
  monthsList,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Universal Mandatory Provisional / Sample Data Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            PROVISIONAL SAMPLE DATA ONLY · Figures represent synthetic simulation models for Tabbymart executive review. Never represented as actual tax or business results.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-amber-800 text-[11px] font-mono">
          <span>Stage 1: Interface Prototype</span>
          <span aria-hidden="true">·</span>
          <span>Zero External Connectors</span>
        </div>
      </div>

      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (4-5 Nav Links) — Zone 3 (1 Action CTA) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark (Single text element, 1 line, no pills) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
              TM
            </div>
            <a
              href="#dashboard"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab('executive');
              }}
              className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-90"
            >
              Tabbymart TBOS-FIN
            </a>
          </div>

          {/* Zone 2: 4-5 single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('executive')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'executive'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Executive Health
            </button>
            <button
              onClick={() => setActiveTab('marketplaces')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'marketplaces'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Marketplace Comparison
            </button>
            <button
              onClick={() => setActiveTab('sku')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'sku'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              SKU Performance
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'returns'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Returns Health
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`whitespace-nowrap shrink-0 pb-1 border-b-2 transition-colors ${
                activeTab === 'reports'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Reports & Quality
            </button>
          </nav>

          {/* Zone 3: Exactly 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenUploadModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Report Intake (Stage 2)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Filter Bar: Financial Year (1 Apr - 31 Mar), Month, Marketplace, Financial Lens */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left Controls: FY, Month, Marketplace */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Financial Year Selector (1 Apr to 31 Mar Indian Standard) */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <label htmlFor="fy-select" className="text-slate-500 font-medium">FY:</label>
              <select
                id="fy-select"
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value as FinancialYear)}
                aria-label="Select Financial Year"
                className="bg-transparent text-slate-900 font-semibold text-xs focus:outline-none cursor-pointer"
              >
                <option value="FY 2024-25">FY 2024-25 (1 Apr 2024 – 31 Mar 2025)</option>
                <option value="FY 2025-26">FY 2025-26 (1 Apr 2025 – 31 Mar 2026)</option>
              </select>
            </div>

            {/* Month Filter */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2.5 py-1.5 shadow-2xs">
              <label htmlFor="month-select" className="text-slate-500 font-medium">Period:</label>
              <select
                id="month-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                aria-label="Select Period or Month"
                className="bg-transparent text-slate-900 font-semibold text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">Full Financial Year (12 Months)</option>
                {monthsList.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Marketplace Segmented Buttons */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5 shadow-2xs">
              <span className="text-slate-400 pl-2 pr-1 flex items-center gap-1 font-medium">
                <Store className="w-3 h-3" />
              </span>
              {(['all', 'amazon', 'flipkart', 'meesho'] as const).map((mkt) => {
                const label =
                  mkt === 'all'
                    ? 'All Channels'
                    : mkt === 'amazon'
                    ? 'Amazon'
                    : mkt === 'flipkart'
                    ? 'Flipkart'
                    : 'Meesho';
                const isActive = selectedMarketplace === mkt;
                return (
                  <button
                    key={mkt}
                    onClick={() => setSelectedMarketplace(mkt)}
                    className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Control: Financial Lens (Economic P&L vs Settlement Cash vs GST Tax) */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5 shadow-2xs">
            <span className="text-slate-400 pl-2 pr-1 flex items-center gap-1 font-medium">
              <Layers className="w-3 h-3" />
              <span className="hidden sm:inline">Lens:</span>
            </span>
            <button
              onClick={() => setFinancialLens('economic_pl')}
              title="Accrual-based Operational P&L (Sales - COGS - Direct Fees - Overheads)"
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                financialLens === 'economic_pl'
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Economic P&L
            </button>
            <button
              onClick={() => setFinancialLens('settlement_cash')}
              title="Bank Payout Realization vs Reserve & Receivables"
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                financialLens === 'settlement_cash'
                  ? 'bg-emerald-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Settlement & Cash
            </button>
            <button
              onClick={() => setFinancialLens('gst_tax')}
              title="GSTR-1 Outward Supplies, TCS u/s 52 and ITC on Platform Invoices"
              className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                financialLens === 'gst_tax'
                  ? 'bg-purple-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              GST & Tax
            </button>
          </div>
        </div>

        {/* Mobile Navigation row */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pt-2 mt-2 border-t border-slate-200/60 pb-1 text-xs">
          {[
            { id: 'executive', label: 'Executive Health' },
            { id: 'marketplaces', label: 'Marketplaces' },
            { id: 'sku', label: 'SKU Economics' },
            { id: 'returns', label: 'Returns' },
            { id: 'reports', label: 'Reports & Quality' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap font-medium ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
