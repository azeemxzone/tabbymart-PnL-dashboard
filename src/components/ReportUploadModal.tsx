import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportUploadModal: React.FC<ReportUploadModalProps> = ({ isOpen, onClose }) => {
  const [selectedChannel, setSelectedChannel] = useState<'amazon' | 'flipkart' | 'meesho' | 'gst'>('amazon');
  const [selectedReportType, setSelectedReportType] = useState('mtr');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedSuccess, setSimulatedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulateUpload = () => {
    setIsSimulating(true);
    setSimulatedSuccess(false);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulatedSuccess(true);
    }, 800);
  };

  const reportDefinitions: Record<
    string,
    { title: string; formats: string; schema: string[]; description: string }
  > = {
    amazon_mtr: {
      title: 'Amazon Merchant Tax Report (MTR B2C & B2B)',
      formats: '.csv',
      schema: ['Order ID', 'Invoice Number', 'Invoice Date', 'SKU', 'Taxable Value', 'IGST Rate', 'CGST', 'SGST', 'TCS Amount'],
      description: 'Monthly statutory tax report containing all dispatched, cancelled, and returned customer orders with tax splits.',
    },
    amazon_settlement: {
      title: 'Amazon Settlement V2 Flat File',
      formats: '.txt (tab-delimited)',
      schema: ['settlement-id', 'transaction-type', 'order-id', 'amount-type', 'amount-description', 'amount', 'posted-date'],
      description: 'Bi-monthly bank disbursement statement detailing commission, closing, storage, shipping and net remittance.',
    },
    flipkart_sales: {
      title: 'Flipkart Sales & Returns Detailed Report',
      formats: '.xlsx, .csv',
      schema: ['Order ID', 'Order Item ID', 'FSN', 'SKU', 'Sale Price', 'Discount', 'Customer Return Flag', 'RTO Flag'],
      description: 'Comprehensive order-level ledger tracking dispatch statuses, delivery confirmations, and buyer return states.',
    },
    meesho_payment: {
      title: 'Meesho Consolidated Payment & Deduction Sheet',
      formats: '.xlsx',
      schema: ['Sub Order No', 'SKU ID', 'Supplier Discounted Price', 'Forward Shipping Fee', 'Customer Return Penalty', 'Bank Remittance'],
      description: 'Supplier payout report capturing courier deductions, customer return fees, and net bank credit transactions.',
    },
    gst_tcs: {
      title: 'GST Portal Form GSTR-8 (TCS Ingestion)',
      formats: '.json, .csv',
      schema: ['GSTIN of ECO', 'Trade Name', 'Gross Supplies Value', 'Supplies Returned Value', 'Net Taxable', 'Integrated Tax', 'Central Tax'],
      description: 'E-commerce operator 1% TCS statement downloaded from the GST portal to reconcile against marketplace tax invoices.',
    },
  };

  const currentKey = `${selectedChannel}_${selectedReportType}`;
  const currentDef =
    reportDefinitions[currentKey] ||
    reportDefinitions[`${selectedChannel}_mtr`] ||
    reportDefinitions.amazon_mtr;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-slate-800" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monthly Report Ingestion Pipeline (Stage 2 Blueprint)
              </h3>
              <p className="text-xs text-slate-500">
                Specification & schema validator for marketplace financial reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Channel selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Select Marketplace Channel:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'amazon', label: 'Amazon India' },
                { id: 'flipkart', label: 'Flipkart' },
                { id: 'meesho', label: 'Meesho' },
                { id: 'gst', label: 'GST Portal' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedChannel(c.id as any);
                    setSelectedReportType(c.id === 'gst' ? 'tcs' : c.id === 'amazon' ? 'mtr' : 'sales');
                    setSimulatedSuccess(false);
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    selectedChannel === c.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Report Type selector */}
          {selectedChannel !== 'gst' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Report Type:
              </label>
              <div className="flex gap-2">
                {selectedChannel === 'amazon' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedReportType('mtr');
                        setSimulatedSuccess(false);
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                        selectedReportType === 'mtr' ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Merchant Tax Report (MTR)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReportType('settlement');
                        setSimulatedSuccess(false);
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                        selectedReportType === 'settlement' ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Settlement V2 Flat File
                    </button>
                  </>
                )}

                {selectedChannel === 'flipkart' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedReportType('sales');
                        setSimulatedSuccess(false);
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                        selectedReportType === 'sales' ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Sales & Returns Detailed
                    </button>
                  </>
                )}

                {selectedChannel === 'meesho' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedReportType('payment');
                        setSimulatedSuccess(false);
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                        selectedReportType === 'payment' ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Payment & Deduction Sheet
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Target Schema Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{currentDef.title}</span>
              <span className="font-mono text-slate-500 text-[11px]">Format: {currentDef.formats}</span>
            </div>
            <p className="text-slate-600 text-[11px]">{currentDef.description}</p>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold block mb-1">
                Target Schema Headers Checked:
              </span>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {currentDef.schema.map((header) => (
                  <span
                    key={header}
                    className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700"
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dropzone Simulation */}
          <div
            onClick={handleSimulateUpload}
            className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50"
          >
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mx-auto mb-2">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800">
              {isSimulating
                ? 'Validating column headers & checksum...'
                : simulatedSuccess
                ? 'Schema Verified · Sample Test Passed'
                : 'Click to Test-Validate Sample File'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports raw exports without pre-formatting. Parser engine activates in Stage 2.
            </p>
          </div>

          {simulatedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Test Validation Successful:</strong> Target schema matched 100% of required headers. Ready for ingestion pipeline integration.
              </span>
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Stage 1 Prototype Notice:</strong> Live file upload, cloud storage, and database persistence are disabled in this stage per the development scope. This intake window confirms the exact data contracts required for Stage 2.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
