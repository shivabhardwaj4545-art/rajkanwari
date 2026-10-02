import React from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, PackageCheck, Printer, ShieldAlert, X } from 'lucide-react';

import type { AdminPackingSlipData } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useFocusTrap } from '@/lib/useFocusTrap';

interface PackingSlipModalProps {
  data: AdminPackingSlipData;
  onClose: () => void;
}

export const PackingSlipModal: React.FC<PackingSlipModalProps> = ({ data, onClose }) => {
  const modalRef = useFocusTrap<HTMLDivElement>({
    isOpen: !!data,
    onClose,
    autoFocusFirst: false,
  });

  const handlePrint = () => {
    window.print();
  };

  const isPaid = data.payment_status === 'paid';
  const isCod = data.payment_method === 'cod' || data.payment_status === 'pending';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden select-none">
      {/* Backdrop Click */}
      <div className="absolute inset-0" onClick={onClose} />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Order Box Shipping Label & Packing Slip"
        tabIndex={-1}
        className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden focus:outline-none select-text"
      >
        {/* Fixed Header Controls Bar - Hidden during print */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 bg-[var(--surface)] border-b border-[var(--border)] flex items-center justify-between print:hidden shadow-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--brand-gold)]/15 text-[var(--brand-gold)] flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-serif text-[var(--text)] leading-snug">
                Order Box Shipping Label & Packing Slip
              </h2>
              <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">
                Printable label formatted to attach directly onto shipping parcel box
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="min-h-[42px] px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl bg-[var(--brand-crimson)] text-white hover:opacity-95 transition flex items-center space-x-2 shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip / Box Label</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close packing slip"
              className="min-h-[42px] min-w-[42px] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] rounded-xl border border-[var(--border)] hover:bg-[var(--surface-alt)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Printable Scrollable Content ──────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm printable-area">
          {/* Top Brand & Barcode Header */}
          <div className="flex justify-between items-start border-b-2 border-black pb-4">
            <div>
              <h1 className="text-2xl font-serif font-black tracking-wider text-black">
                RAJKANWARI
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                House of Ethnic Wear • Premium Storefront & Express Dispatch
              </p>
              <p className="text-[11px] text-gray-700 mt-1 leading-snug">
                100 Feet Rd, Indiranagar, Bengaluru, KA 560038 | Tel: +91 98200 11223
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-black text-white text-xs font-mono font-bold uppercase rounded tracking-widest mb-1">
                SHIPPING & PACKING SLIP
              </div>
              <div className="font-mono text-xl font-black text-black tracking-wider">
                {data.order_number}
              </div>
              <div className="text-[11px] text-gray-600 font-mono">
                Date: {new Date(data.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
              {/* Pseudo-Barcode Visual */}
              <div className="mt-1.5 flex justify-end items-center space-x-[2px] h-6 px-2 bg-gray-100 rounded border border-gray-300">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div
                    key={i}
                    className={`bg-black h-4 ${i % 3 === 0 ? 'w-[3px]' : i % 5 === 0 ? 'w-[1px]' : 'w-[2px]'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Payment Status Box Badge (Critical for Courier Delivery) */}
          <div
            className={`p-3.5 rounded-xl border-2 flex items-center justify-between ${
              isPaid
                ? 'bg-emerald-50 border-emerald-600 text-emerald-900'
                : isCod
                ? 'bg-amber-50 border-amber-600 text-amber-950'
                : 'bg-gray-50 border-gray-400 text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              {isPaid ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  Payment Status: {data.payment_status ? data.payment_status.toUpperCase() : 'PENDING'}
                </div>
                <div className="text-sm font-black mt-0.5">
                  {isPaid
                    ? 'PREPAID ORDER — DO NOT COLLECT CASH FROM CUSTOMER'
                    : isCod
                    ? `CASH ON DELIVERY (COD) — COLLECT ${formatPrice(data.total_amount || 0)} FROM RECIPIENT`
                    : 'VERIFY PAYMENT UPON DELIVERY'}
                </div>
              </div>
            </div>
            {data.total_amount && (
              <div className="text-right font-mono font-black text-lg">
                {formatPrice(data.total_amount)}
              </div>
            )}
          </div>

          {/* SHIP TO & SHIPPER Boxes (Outer Box Label Format) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SHIP TO Label Box */}
            <div className="p-4 rounded-xl border-2 border-black bg-white space-y-1.5 shadow-xs">
              <div className="flex justify-between items-center border-b border-gray-300 pb-1.5 mb-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-black bg-yellow-200 px-2 py-0.5 rounded">
                  SHIP TO (DELIVERY ADDRESS)
                </span>
                <span className="text-[10px] font-bold uppercase text-gray-600 font-mono">
                  {data.fulfillment_type === 'pickup' ? 'BOUTIQUE PICKUP' : 'DOORSTEP'}
                </span>
              </div>
              <p className="font-extrabold text-base text-black leading-tight">{data.customer.name}</p>
              <p className="font-mono font-bold text-xs text-black">Mobile: {data.customer.phone}</p>
              <p className="text-xs text-gray-700 font-mono">{data.customer.email}</p>

              {data.fulfillment_type === 'pickup' ? (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs font-semibold text-gray-800">
                  📍 Pickup Store: Bengaluru Flagship Store
                  <br />
                  Slot: <span className="font-mono text-black">{data.pickup_slot || 'Standard Working Hours'}</span>
                </div>
              ) : data.delivery_address ? (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-black leading-snug font-medium">
                  {data.delivery_address.line1}
                  {data.delivery_address.line2 ? `, ${data.delivery_address.line2}` : ''}
                  <br />
                  <span className="font-bold">
                    {data.delivery_address.city}, {data.delivery_address.state} — {data.delivery_address.pincode}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic mt-2">Standard Customer Delivery Address</p>
              )}
            </div>

            {/* FROM (RETURN ADDRESS) Box */}
            <div className="p-4 rounded-xl border-2 border-gray-400 bg-gray-50 space-y-1.5">
              <div className="border-b border-gray-300 pb-1.5 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-700">
                  SHIPPER / RETURN ADDRESS
                </span>
              </div>
              <p className="font-bold text-sm text-gray-900">RAJKANWARI LUXURY WAREHOUSE</p>
              <p className="text-xs text-gray-700 leading-relaxed">
                House of Ethnic Wear
                <br />
                100 Feet Rd, Indiranagar, Stage 2
                <br />
                Bengaluru, Karnataka — 560038
                <br />
                Support Helpline: +91 98200 11223
              </p>
            </div>
          </div>

          {/* Instructions / Notes */}
          {(data.customer_notes || data.internal_notes) && (
            <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 text-xs space-y-1 text-amber-900">
              {data.customer_notes && (
                <p>
                  <strong>Delivery Instructions:</strong> {data.customer_notes}
                </p>
              )}
              {data.internal_notes && (
                <p>
                  <strong>Internal Dispatch Note:</strong> {data.internal_notes}
                </p>
              )}
            </div>
          )}

          {/* Items Checklist Table */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Package Contents & Inspection Checklist ({data.total_items} {data.total_items === 1 ? 'item' : 'items'})
              </span>
              <span className="text-[10px] text-gray-500 font-mono">
                Verify items before sealing shipping box
              </span>
            </div>

            <table className="w-full text-left border-collapse border-2 border-black text-xs">
              <thead>
                <tr className="bg-gray-200 border-b-2 border-black text-[11px] font-bold uppercase text-black">
                  <th className="p-2 w-10 text-center border-r border-black">Check</th>
                  <th className="p-2 border-r border-black">SKU</th>
                  <th className="p-2 border-r border-black">Item Description</th>
                  <th className="p-2 border-r border-black">Size</th>
                  <th className="p-2 border-r border-black">Color</th>
                  <th className="p-2 text-right w-14">Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 text-center border-r border-gray-300">
                      <div className="w-4 h-4 border-2 border-black rounded-sm mx-auto" />
                    </td>
                    <td className="p-2 font-mono font-bold text-black border-r border-gray-300">
                      {item.sku}
                    </td>
                    <td className="p-2 font-semibold text-black border-r border-gray-300">
                      {item.product_name}
                    </td>
                    <td className="p-2 font-mono text-gray-800 border-r border-gray-300">{item.size}</td>
                    <td className="p-2 text-gray-800 border-r border-gray-300">{item.color}</td>
                    <td className="p-2 text-right font-mono font-bold text-black">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quality Control Sign-off */}
          <div className="pt-4 border-t-2 border-gray-300 grid grid-cols-2 gap-8 text-xs text-gray-700">
            <div>
              <p className="font-semibold mb-6">Packed By (Staff Sign & ID):</p>
              <div className="border-b-2 border-dashed border-gray-400 w-44" />
            </div>
            <div className="text-right">
              <p className="font-semibold mb-6">Quality Control Stamp & Date:</p>
              <div className="border-b-2 border-dashed border-gray-400 w-44 ml-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* Print CSS Styles */}
      <style>{`
        @media print {
          /* Hide main app UI, sidebars, headers, and modal controls */
          #root,
          header,
          footer,
          aside,
          nav,
          .print\\:hidden {
            display: none !important;
          }

          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Unwrap fixed overlay and portal dialog container for printing */
          div[class*="fixed"] {
            position: static !important;
            background: #ffffff !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
          }

          div[role="dialog"] {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            max-height: none !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
          }

          .printable-area {
            position: static !important;
            width: 100% !important;
            padding: 12px !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            display: block !important;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};
