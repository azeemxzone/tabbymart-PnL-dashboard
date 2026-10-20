import React from 'react';
import { FinancialLens, ReportItem } from '../types/finance';
import { formatCompactINR, formatINR, formatPercent } from '../utils/formatters';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';

interface ReportsDataQualityProps {
  reports: ReportItem[];
  financialLens: FinancialLens;
  onSelectLens: (lens: FinancialLens) => void;
  onOpenUploadModal: () => void;
}

export const ReportsDataQuality: React.FC<ReportsDataQualityProps> = ({
  reports,
  financialLens,
  onSelectLens,
  onOpenUploadModal,
}) => {
  const totalUnmatched = reports.reduce((sum, r) => sum + r.unmatchedAmount, 0);
  const avgMatchRate = reports.reduce((sum, r) => sum + r.reconciliationMatchRate, 0) / reports.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900">Reports Ingestion & Reconciliation Hub</span>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                Auto-Match {avgMatchRate.toFixed(1)}% (Synthetic Model)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Planned ingestion pipeline with strict statutory separation between Marketplace Section 52 TCS and GSTR-2B Inward Input Tax Credit
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenUploadModal}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Simulate Report Ingestion</span>
            </button>
          </div>
        </div>

        {/* 3 Core Financial Pillars (Economic vs Cash vs GST) */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-sans font-medium uppercase tracking-wider block mb-2">
            The Three Independent Financial Perspectives in Indian E-Commerce
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Perspective 1: Economic P&L */}
            <div
              onClick={() => onSelectLens('economic_pl')}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                financialLens === 'economic_pl'
                  ? 'bg-blue-50/60 border-blue-400 ring-1 ring-blue-400 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">1. Economic P&L (Accrual)</span>
                <span className="text-[10px] font-mono text-blue-700 font-semibold">CM1 / CM2</span>
              </div>
              <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                Tracks true operational profitability: Net Revenue minus COGS, platform fees, logistics/return costs, packaging (synthetic estimate), and ad spend.
              </p>
              <div className="mt-2 text-[10px] font-mono text-blue-900 font-medium">
                Governing report: Amazon MTR + Flipkart Sales Detailed
              </div>
            </div>

            {/* Perspective 2: Settlement / Cash Realization */}
            <div
              onClick={() => onSelectLens('settlement_cash')}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                financialLens === 'settlement_cash'
                  ? 'bg-emerald-50/60 border-emerald-400 ring-1 ring-emerald-400 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">2. Settlement & Cash Flow</span>
                <span className="text-[10px] font-mono text-emerald-700 font-semibold">Bank Realized</span>
              </div>
              <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                Tracks actual cash wired to bank accounts after rolling reserve withholdings, courier deductions, and TDS deductions u/s 194-O.
              </p>
              <div className="mt-2 text-[10px] font-mono text-emerald-900 font-medium">
                Governing report: Settlement Flat Files + Bank UTR
              </div>
            </div>

            {/* Perspective 3: GST & Tax */}
            <div
              onClick={() => onSelectLens('gst_tax')}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                financialLens === 'gst_tax'
                  ? 'bg-purple-50/60 border-purple-400 ring-1 ring-purple-400 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">3. GST Indirect Tax</span>
                <span className="text-[10px] font-mono text-purple-700 font-semibold">TCS & ITC</span>
              </div>
              <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">
                Reconciles Section 52 TCS via Form GSTR-8 (TDS/TCS Credit Received) and Inward Supplies Input Tax Credit (ITC) via Form GSTR-2B.
              </p>
              <div className="mt-2 text-[10px] font-mono text-purple-900 font-medium">
                Governing report: Form GSTR-8 + Form GSTR-2B
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Ingestion Status Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Marketplace Report Ingestion Pipeline</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Scheduled monthly input reports, reconciliation categories, and target schemas
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <span>Flagged Discrepancy Amount: <strong className="text-rose-700">{formatINR(totalUnmatched)}</strong> (Synthetic)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 text-slate-600 border-y border-slate-200 font-sans text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Report Name & Code</th>
                <th className="py-2.5 px-3">Reconciliation Category</th>
                <th className="py-2.5 px-3">Statutory / Authority Target</th>
                <th className="py-2.5 px-3">Format</th>
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3 text-right">Match Rate %</th>
                <th className="py-2.5 px-3 text-right">Unreconciled</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reports.map((r) => {
                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-sans font-semibold text-slate-900">{r.reportName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{r.reportCode} · {r.cadence}</div>
                    </td>
                    <td className="py-3 px-3 font-sans text-xs">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        r.category === 'Marketplace TCS'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : r.category === 'Input Tax Credit (ITC)'
                          ? 'bg-purple-50 text-purple-900 border border-purple-200'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {r.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-600 text-[11px] max-w-xs">
                      {r.reconciliationAuthority}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-700">
                        {r.fileFormat}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-600">{r.lastPeriod}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-bold">
                      <span className={r.reconciliationMatchRate >= 98 ? 'text-emerald-700' : 'text-amber-700'}>
                        {r.reconciliationMatchRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      <span className={r.unmatchedAmount > 0 ? 'text-rose-700 font-medium' : 'text-slate-400'}>
                        {r.unmatchedAmount > 0 ? formatINR(r.unmatchedAmount) : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block font-sans text-[11px] px-2 py-0.5 rounded font-medium ${
                          r.status === 'Reconciled'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : r.status === 'Discrepancy Flagged'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discrepancy & Dispute Log: Explicit separation of TCS vs ITC */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Active Marketplace Discrepancy & Dispute Log (Sample Demonstrations)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Simulated Audit Items Awaiting Portal Claim
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Item 1: Logistics discrepancy */}
          <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/40 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Flipkart Weight Slab Surcharge Mismatch</span>
                <span className="text-[10px] font-mono text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                  LOGISTICS · DISP-FK-094
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                18 shipments billed in the 1.0kg–1.5kg weight slab instead of the audited volumetric slab (&lt;500g). Forward/reverse courier surcharge over-deducted on packaging invoice.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-rose-700 font-bold font-mono text-sm block">₹41,200</span>
              <span className="text-[10px] text-slate-500 font-sans">Simulated Claim Ticket</span>
            </div>
          </div>

          {/* Item 2: Marketplace TCS Discrepancy (Accurately attributed to GSTR-8 / TDS & TCS Credit Received) */}
          <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Marketplace Section 52 TCS Differential vs GSTR-8</span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                  TAX · GSTR-8 RECON
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Net taxable supplies reported by Flipkart in Form GSTR-8 differ by ₹68,500 compared to seller internal sales report due to month-end return cut-off timing. Credit pending acceptance on the GST portal under the <em>TDS and TCS Credit Received</em> table.
              </p>
              <div className="mt-1 text-[11px] text-amber-900 font-mono">
                *Note: This is a Section 52 TCS reconciliation item affecting the Electronic Cash Ledger, distinct from GSTR-2B Inward Supplies ITC.
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-amber-800 font-bold font-mono text-sm block">₹68,500</span>
              <span className="text-[10px] text-slate-500 font-sans">Portal Acceptance Pending</span>
            </div>
          </div>

          {/* Item 3: GSTR-2B Input Tax Credit Reconciliation */}
          <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/40 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">GSTR-2B Input Tax Credit (ITC) Reconciliation on Marketplace Fees</span>
                <span className="text-[10px] font-mono text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                  TAX · GSTR-2B ITC
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Reconciling 18% GST charged on Amazon & Flipkart referral fees, closing fees, and logistics invoices against Form GSTR-2B auto-drafted statement. ₹18,200 pending vendor invoice GSTR-1 filing by platform entity.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-purple-800 font-bold font-mono text-sm block">₹18,200</span>
              <span className="text-[10px] text-slate-500 font-sans">ITC Query Open</span>
            </div>
          </div>

          {/* Item 4: Meesho Wrong Return dispute */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">Meesho Wrong Return Product Penalty Dispute</span>
                <span className="text-[10px] font-mono text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                  LOGISTICS · DISP-MEE-112
                </span>
              </div>
              <p className="text-slate-600 mt-1">
                Customer returned a substituted generic item instead of Tabbymart Kurti. Unboxing video and barcode audit submitted for supplier return compensation claim.
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-slate-800 font-bold font-mono text-sm block">₹32,100</span>
              <span className="text-[10px] text-slate-500 font-sans">Under Portal Review</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
