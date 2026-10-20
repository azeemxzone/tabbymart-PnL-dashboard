import React, { useState, useMemo } from 'react';
import { FinancialLens, FinancialYear, MarketplaceId, SkuPerformanceItem } from './types/finance';
import {
  monthlyDataFY2425,
  monthlyDataFY2526,
  sampleReports,
  sampleSkus,
} from './data/sampleData';
import { Header } from './components/Header';
import { ExecutiveHealth } from './components/ExecutiveHealth';
import { MarketplaceComparison } from './components/MarketplaceComparison';
import { SkuPerformance } from './components/SkuPerformance';
import { ReturnsHealth } from './components/ReturnsHealth';
import { ReportsDataQuality } from './components/ReportsDataQuality';
import { FinancialLensView } from './components/FinancialLensView';
import { ReportUploadModal } from './components/ReportUploadModal';
import { SkuDetailModal } from './components/SkuDetailModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('executive');
  const [financialYear, setFinancialYear] = useState<FinancialYear>('FY 2024-25');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedMarketplace, setSelectedMarketplace] = useState<MarketplaceId | 'all'>('all');
  const [financialLens, setFinancialLens] = useState<FinancialLens>('economic_pl');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [inspectingSku, setInspectingSku] = useState<SkuPerformanceItem | null>(null);

  // Active dataset based on FY
  const activeMonthlyData = useMemo(() => {
    return financialYear === 'FY 2024-25' ? monthlyDataFY2425 : monthlyDataFY2526;
  }, [financialYear]);

  // Months available for selected FY
  const monthsList = useMemo(() => {
    return activeMonthlyData.map((m) => m.month);
  }, [activeMonthlyData]);

  // Handle FY switch (reset month if not in new list)
  const handleFinancialYearChange = (fy: FinancialYear) => {
    setFinancialYear(fy);
    setSelectedMonth('all');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Header with Navigation & Global Filters */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        financialYear={financialYear}
        setFinancialYear={handleFinancialYearChange}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedMarketplace={selectedMarketplace}
        setSelectedMarketplace={setSelectedMarketplace}
        financialLens={financialLens}
        setFinancialLens={setFinancialLens}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        monthsList={monthsList}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Financial Lens Perspective Selector and Deep-Dive Card */}
        <FinancialLensView
          financialLens={financialLens}
          monthlyData={activeMonthlyData}
          selectedMonth={selectedMonth}
          selectedMarketplace={selectedMarketplace}
          onSelectLens={setFinancialLens}
        />

        {/* Tab 1: Executive Business Health */}
        {activeTab === 'executive' && (
          <ExecutiveHealth
            monthlyData={activeMonthlyData}
            selectedMonth={selectedMonth}
            selectedMarketplace={selectedMarketplace}
            financialLens={financialLens}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 2: Marketplace Comparison */}
        {activeTab === 'marketplaces' && (
          <MarketplaceComparison
            monthlyData={activeMonthlyData}
            selectedMonth={selectedMonth}
            selectedMarketplace={selectedMarketplace}
            onSelectMarketplace={setSelectedMarketplace}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 3: SKU Performance */}
        {activeTab === 'sku' && (
          <SkuPerformance
            skus={sampleSkus}
            selectedMarketplace={selectedMarketplace}
          />
        )}

        {/* Tab 4: Returns Health */}
        {activeTab === 'returns' && (
          <ReturnsHealth
            monthlyData={activeMonthlyData}
            selectedMonth={selectedMonth}
            selectedMarketplace={selectedMarketplace}
            skus={sampleSkus}
            onInspectSku={(sku) => setInspectingSku(sku)}
          />
        )}

        {/* Tab 5: Reports & Data Quality */}
        {activeTab === 'reports' && (
          <ReportsDataQuality
            reports={sampleReports}
            financialLens={financialLens}
            onSelectLens={setFinancialLens}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">Tabbymart TBOS-FIN</span>
            <span aria-hidden="true">·</span>
            <span>Stage 1B Executive Prototype</span>
            <span aria-hidden="true">·</span>
            <span>Indian E-Commerce Multi-Channel Finance</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>FY: 1 April – 31 March</span>
            <span aria-hidden="true">·</span>
            <span>Amazon · Flipkart · Meesho</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-800 font-sans">Provisional Simulation Environment</span>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <ReportUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <SkuDetailModal
        skuItem={inspectingSku}
        onClose={() => setInspectingSku(null)}
      />
    </div>
  );
}
