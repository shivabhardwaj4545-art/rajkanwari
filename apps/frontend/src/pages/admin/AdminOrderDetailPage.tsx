import {
  AlertCircle,
  ArrowLeft,
  FileText,
  Phone,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  Send,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { api, type AdminOrderDetail, type AdminPackingSlipData } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { PackingSlipModal } from './PackingSlipModal';
import { Portal } from '@/components/ui/Portal';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status transition state
  const [advancing, setAdvancing] = useState(false);
  const [selectedNextStatus, setSelectedNextStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [transitionError, setTransitionError] = useState<string | null>(null);

  // Notes state
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);

  // Refund state
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refundMethod, setRefundMethod] = useState<'gateway' | 'manual' | 'store_credit'>('manual');
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  // Return state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Size Mismatch / Fit Issue');
  const [customReturnReason, setCustomReturnReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [restockInventory, setRestockInventory] = useState(true);
  const [issueRefund, setIssueRefund] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);

  // Packing slip modal state
  const [packingSlipData, setPackingSlipData] = useState<AdminPackingSlipData | null>(null);
  const [loadingSlip, setLoadingSlip] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.adminGetOrderById(id);
      setOrder(res.order);
      setInternalNotes(res.order.internal_notes || '');
      setRefundMethod(res.order.payment_method === 'online' && res.order.payment_status === 'paid' ? 'gateway' : 'manual');
      if (res.order.allowed_next_statuses.length > 0) {
        setSelectedNextStatus(res.order.allowed_next_statuses[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleAdvanceStatus = async () => {
    if (!id || !selectedNextStatus) return;
    try {
      setAdvancing(true);
      setTransitionError(null);
      await api.adminAdvanceOrderStatus(id, {
        status: selectedNextStatus,
        note: statusNote.trim() || undefined,
      });
      setStatusNote('');
      await fetchOrder();
    } catch (err: any) {
      setTransitionError(err.message || 'Failed to advance order status');
    } finally {
      setAdvancing(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    try {
      setSavingNotes(true);
      await api.adminUpdateOrderNotes(id, internalNotes);
      setNotesSuccess(true);
      setTimeout(() => setNotesSuccess(false), 2500);
    } catch (err: any) {
      alert('Failed to save notes: ' + err.message);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleRefund = async () => {
    if (!id) return;
    try {
      setRefunding(true);
      setRefundError(null);
      await api.adminRefundOrder(id, {
        reason: refundReason.trim() || undefined,
        refund_method: refundMethod,
        refund_type: refundMethod === 'gateway' ? 'gateway' : 'manual',
      });
      setShowRefundModal(false);
      await fetchOrder();
    } catch (err: any) {
      setRefundError(err.message || 'Failed to process refund');
    } finally {
      setRefunding(false);
    }
  };

  const handleReturn = async () => {
    if (!id) return;
    try {
      setReturning(true);
      setReturnError(null);
      const effectiveReason = returnReason === 'Other' ? (customReturnReason.trim() || 'Other') : returnReason;
      await api.adminReturnOrder(id, {
        reason: effectiveReason,
        notes: returnNotes.trim() || undefined,
        restock: restockInventory,
        refund: issueRefund,
        refund_method: refundMethod,
      });
      setShowReturnModal(false);
      await fetchOrder();
    } catch (err: any) {
      setReturnError(err.message || 'Failed to process return');
    } finally {
      setReturning(false);
    }
  };

  const handleOpenPackingSlip = async () => {
    if (!id) return;
    try {
      setLoadingSlip(true);
      const slip = await api.adminGetPackingSlip(id);
      setPackingSlipData(slip);
    } catch (err: any) {
      alert('Failed to load packing slip: ' + err.message);
    } finally {
      setLoadingSlip(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-[var(--text-muted)]">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[var(--brand-gold)] mb-3" />
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)]">
        <AlertCircle className="w-10 h-10 mx-auto text-[var(--brand-crimson)] mb-3" />
        <h2 className="text-lg font-semibold text-[var(--text)]">Order Not Found</h2>
        <p className="text-xs mt-1">{error || 'Could not locate order records.'}</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--brand-crimson)] text-white"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isTerminal = order.allowed_next_statuses.length === 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Back Button & Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/orders"
            className="p-2 border border-[var(--border)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-alt)] transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-serif font-bold text-[var(--text)]">
                {order.order_number}
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold uppercase rounded border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--brand-crimson)]">
                {order.fulfillment_type === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Placed on{' '}
              {new Date(order.created_at).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Packing Slip */}
          <button
            onClick={handleOpenPackingSlip}
            disabled={loadingSlip}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-alt)] transition flex items-center space-x-1.5 shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-[var(--brand-gold)]" />
            <span>{loadingSlip ? 'Preparing...' : 'Packing Slip'}</span>
          </button>

          {/* Print Invoice */}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-alt)] transition flex items-center space-x-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--brand-crimson)]" />
            <span>Print Invoice</span>
          </button>

          {/* Return Order Button: for any non-cancelled and non-returned order */}
          {order.order_status !== 'returned' && order.order_status !== 'cancelled' && (
            <button
              onClick={() => {
                setReturnReason('Size Mismatch / Fit Issue');
                setCustomReturnReason('');
                setReturnNotes('');
                setRestockInventory(true);
                setIssueRefund(order.payment_status === 'paid');
                setRefundMethod(order.payment_method === 'online' && order.payment_status === 'paid' ? 'gateway' : 'manual');
                setReturnError(null);
                setShowReturnModal(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition flex items-center space-x-1.5 shadow-sm"
              title="Process Return & Restock items"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Return Order</span>
            </button>
          )}

          {/* Refund Button: for Paid orders, or COD/returned orders */}
          {order.payment_status !== 'refunded' && (order.payment_status === 'paid' || order.payment_method === 'cod' || order.order_status === 'returned') && (
            <button
              onClick={() => {
                setRefundReason('');
                setRefundMethod(order.payment_method === 'online' && order.payment_status === 'paid' ? 'gateway' : 'manual');
                setRefundError(null);
                setShowRefundModal(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-purple-500/30 text-purple-700 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition flex items-center space-x-1.5 shadow-sm"
              title="Issue or record refund"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Refund Order</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Returned State Banner ────────────────────────────────────────── */}
      {order.order_status === 'returned' && (
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 text-[var(--text)] flex items-start space-x-3 shadow-sm">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-300">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-purple-800 dark:text-purple-300">
                Order Returned & Processed
              </h3>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                order.payment_status === 'refunded'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
              }`}>
                {order.payment_status === 'refunded' ? '● Refund Recorded' : 'Payment: ' + order.payment_status}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              This order has been returned. View the Status History Timeline below for details on restocked inventory items and refund status.
            </p>
          </div>
        </div>
      )}

      {/* ── Status Advancement Strip ────────────────────────────────────── */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
              Current Order State
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-base font-bold capitalize text-[var(--text)]">
                {order.order_status.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                (Flow: {order.fulfillment_type})
              </span>
            </div>
          </div>

          {!isTerminal ? (
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedNextStatus}
                onChange={(e) => setSelectedNextStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text)] font-semibold capitalize focus:outline-none focus:border-[var(--brand-crimson)]"
              >
                {order.allowed_next_statuses.map((st) => (
                  <option key={st} value={st}>
                    Advance to: {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Optional transition note..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text)] flex-1 md:w-56 focus:outline-none focus:border-[var(--brand-crimson)]"
              />
              <button
                onClick={handleAdvanceStatus}
                disabled={advancing}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--brand-crimson)] text-white hover:opacity-90 transition flex items-center space-x-1.5 shadow disabled:opacity-50"
              >
                {advancing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Advance State</span>
              </button>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] text-xs font-semibold text-[var(--text-muted)]">
              Terminal State — No further transitions allowed
            </div>
          )}
        </div>

        {transitionError && (
          <div className="mt-3 p-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-400">
            {transitionError}
          </div>
        )}
      </div>

      {/* ── Main Layout: 2 Columns ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Till Slip Receipt & Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Till Slip Receipt */}
          <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-6">
            <div className="flex justify-between items-start border-b border-[var(--border)] pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[var(--brand-crimson)]">
                  Shikkis Receipt
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  TAX INVOICE • GSTIN: 29AAAAA0000A1Z5
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-[var(--text)]">
                  {order.order_number}
                </span>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Payment:{' '}
                  <strong className="capitalize text-[var(--text)]">{order.payment_status}</strong> (
                  {order.payment_method})
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--border)] text-[11px] text-[var(--text-muted)] uppercase">
                  <th className="py-2">Item</th>
                  <th className="py-2">Variant</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/60">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-sans">
                      <div className="flex items-center space-x-2.5">
                        <ImageWithFallback
                          src={item.thumbnail || undefined}
                          alt={item.product_name}
                          className="w-9 h-11 object-cover object-top rounded border border-[var(--border)] bg-[var(--surface-alt)]"
                        />
                        <div>
                          <p className="font-semibold text-[var(--text)]">{item.product_name}</p>
                          <p className="text-[10px] text-[var(--text-muted)] font-mono">
                            SKU: {item.variant_sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-[var(--text-muted)]">
                      {item.size} / {item.color}
                    </td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">{formatPrice(item.price_at_purchase)}</td>
                    <td className="py-3 text-right font-bold text-[var(--text)]">
                      {formatPrice(item.price_at_purchase * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Receipt Arithmetic Breakdown */}
            <div className="border-t border-[var(--border)] pt-4 space-y-1.5 text-xs font-sans tabular-nums">
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Subtotal</span>
                <span className="font-semibold text-[var(--text)]">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Promotional Savings</span>
                  <span>- {formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Shipping ({order.fulfillment_type})</span>
                <span className="font-semibold text-[var(--text)]">{order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>GST (Taxes included)</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[var(--border)] font-bold text-sm text-[var(--text)]">
                <span>Grand Total</span>
                <span className="text-[var(--brand-crimson)] text-base font-bold">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Internal Notes Editor */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Internal Store Notes (Owner Only)
              </h3>
              {notesSuccess && (
                <span className="text-xs text-emerald-600 font-semibold animate-pulse">
                  ✓ Saved successfully
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Private notes for staff/concierge..."
              className="w-full p-3 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text)] focus:outline-none focus:border-[var(--brand-crimson)]"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--brand-gold)] text-black hover:opacity-90 transition flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer Contact, Address & Status Timeline */}
        <div className="space-y-6">
          {/* Customer & Fulfillment Block */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] pb-2">
              Customer Contact
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[var(--text)]">
                <User className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="font-semibold">{order.customer_name}</span>
              </div>
              <div className="flex items-center space-x-2 text-[var(--text-muted)] font-mono">
                <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                <span>{order.customer_phone}</span>
              </div>
              <p className="text-[var(--text-muted)] text-[11px] pl-6">{order.customer_email}</p>
            </div>

            {/* Address or Pickup Block */}
            <div className="pt-2 border-t border-[var(--border)] space-y-2 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                {order.fulfillment_type === 'pickup' ? 'Boutique Pickup Slot' : 'Delivery Address'}
              </span>
              {order.fulfillment_type === 'pickup' ? (
                <div className="p-3 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] text-xs">
                  <p className="font-semibold">Flagship Boutique, Indiranagar</p>
                  <p className="text-[var(--text-muted)] mt-1 font-mono">
                    Slot: {order.pickup_slot || 'Standard Hours'}
                  </p>
                </div>
              ) : order.delivery_address_snapshot ? (
                <div className="p-3 rounded-lg bg-[var(--surface-alt)] border border-[var(--border)] text-xs text-[var(--text-muted)]">
                  <p className="font-semibold text-[var(--text)]">
                    {order.delivery_address_snapshot.full_name}
                  </p>
                  <p>{order.delivery_address_snapshot.line1}</p>
                  {order.delivery_address_snapshot.line2 && <p>{order.delivery_address_snapshot.line2}</p>}
                  <p>
                    {order.delivery_address_snapshot.city}, {order.delivery_address_snapshot.state} -{' '}
                    <span className="font-mono">{order.delivery_address_snapshot.pincode}</span>
                  </p>
                  <p className="font-mono mt-1">Phone: {order.delivery_address_snapshot.phone}</p>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)] italic">No address snapshot provided.</p>
              )}
            </div>

            {/* Payment Record Details */}
            <div className="pt-2 border-t border-[var(--border)] space-y-1 text-xs">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                Payment Verification
              </span>
              <p className="text-[var(--text-muted)]">
                Method: <span className="font-mono uppercase text-[var(--text)]">{order.payment_method}</span>
              </p>
              <p className="text-[var(--text-muted)]">
                Status: <span className="font-bold capitalize text-[var(--text)]">{order.payment_status}</span>
              </p>
              {order.razorpay_payment_id && (
                <p className="text-[10px] text-[var(--text-muted)] font-mono break-all">
                  Razorpay ID: {order.razorpay_payment_id}
                </p>
              )}
            </div>
          </div>

          {/* Status Timeline History */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)] pb-2">
              Status History Timeline
            </h3>

            <div className="space-y-4 text-xs">
              {order.history.map((h) => (
                <div key={h.id} className="relative pl-6 border-l-2 border-[var(--brand-gold)]">
                  <div
                    className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ${
                      h.status === 'returned' ? 'bg-purple-600 ring-2 ring-purple-300' : 'bg-[var(--brand-crimson)]'
                    }`}
                  />
                  <div className="flex justify-between items-center">
                    <span className="font-bold capitalize text-[var(--text)] flex items-center space-x-1.5">
                      <span>{h.status.replace(/_/g, ' ')}</span>
                      {h.status === 'returned' && (
                        <span className="px-1.5 py-0.2 text-[9px] rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 uppercase font-mono">
                          Returned
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {new Date(h.created_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {h.note && <p className="text-xs text-[var(--text-muted)] mt-0.5">{h.note}</p>}
                  <p className="text-[10px] text-[var(--text-muted)] mt-1 italic">
                    By: {h.changed_by_name || 'System / Owner'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Return Confirmation Modal ────────────────────────────────────── */}
      {showReturnModal && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg">Process Order Return</h3>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Mark order <strong>{order.order_number}</strong> as returned. You can automatically restock the items back into inventory and initiate or record a customer refund.
              </p>

              {/* Items Preview */}
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)] block">
                  Items to Return ({order.items.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-center text-xs">
                      <div className="truncate pr-2">
                        <span className="font-semibold text-[var(--text)]">{it.product_name}</span>
                        <span className="text-[11px] text-[var(--text-muted)] ml-1">
                          ({it.size} · {it.color})
                        </span>
                      </div>
                      <span className="font-mono text-[var(--text-muted)] shrink-0">
                        Qty: {it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reason Selector */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Return Reason <span className="text-[var(--brand-crimson)]">*</span>
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text)] focus:outline-none focus:border-[var(--brand-crimson)]"
                >
                  <option value="Size Mismatch / Fit Issue">Size Mismatch / Fit Issue</option>
                  <option value="Defective or Damaged Fabric">Defective or Damaged Fabric</option>
                  <option value="Color or Style Dislike">Color or Style Dislike</option>
                  <option value="Wrong Item Shipped">Wrong Item Shipped</option>
                  <option value="Customer Rejected (Doorstep RTO)">Customer Rejected (Doorstep RTO)</option>
                  <option value="Other">Other (Specify below)</option>
                </select>
              </div>

              {returnReason === 'Other' && (
                <div>
                  <label className="text-xs font-semibold block mb-1">Specify Reason</label>
                  <input
                    type="text"
                    value={customReturnReason}
                    onChange={(e) => setCustomReturnReason(e.target.value)}
                    placeholder="Enter reason for return..."
                    className="w-full p-2.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text)] focus:outline-none focus:border-[var(--brand-crimson)]"
                  />
                </div>
              )}

              {/* Internal Return Notes */}
              <div>
                <label className="text-xs font-semibold block mb-1">Return Notes / Comments</label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="e.g. Courier tracking #, package condition, exchange notes..."
                  className="w-full p-2.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text)] focus:outline-none focus:border-[var(--brand-crimson)] resize-none"
                />
              </div>

              {/* Restock Inventory Toggle */}
              <label className="flex items-start space-x-2.5 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={restockInventory}
                  onChange={(e) => setRestockInventory(e.target.checked)}
                  className="mt-0.5 rounded border-[var(--border)] text-[var(--brand-crimson)] focus:ring-0"
                />
                <div className="text-xs">
                  <span className="font-semibold block text-[var(--text)]">
                    Restock items back into store inventory
                  </span>
                  <span className="text-[var(--text-muted)] text-[11px]">
                    Automatically increment the available quantity in product variants.
                  </span>
                </div>
              </label>

              {/* Refund Option */}
              <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] space-y-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={issueRefund}
                    onChange={(e) => setIssueRefund(e.target.checked)}
                    className="mt-0.5 rounded border-[var(--border)] text-purple-600 focus:ring-0"
                  />
                  <div className="text-xs">
                    <span className="font-semibold block text-[var(--text)]">
                      Process / Record Refund ({formatPrice(order.total_amount)})
                    </span>
                    <span className="text-[var(--text-muted)] text-[11px]">
                      {order.payment_method === 'online'
                        ? 'Initiate Razorpay gateway refund or record store credit.'
                        : 'Record cash refund, UPI, or store credit for this COD order.'}
                    </span>
                  </div>
                </label>

                {issueRefund && (
                  <div className="pt-2 border-t border-[var(--border)] space-y-1.5">
                    <label className="text-[11px] font-semibold text-[var(--text-muted)] block">
                      Refund Method
                    </label>
                    <select
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value as any)}
                      className="w-full p-2 text-xs rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--brand-crimson)]"
                    >
                      {order.payment_method === 'online' && order.payment_status === 'paid' && (
                        <option value="gateway">Payment Gateway (Razorpay Online)</option>
                      )}
                      <option value="manual">Manual / Cash / Direct Bank Transfer</option>
                      <option value="store_credit">Store Credit / Gift Voucher</option>
                    </select>
                  </div>
                )}
              </div>

              {returnError && (
                <div className="p-2.5 rounded border border-rose-500/30 bg-rose-500/10 text-xs text-rose-600">
                  {returnError}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturn}
                  disabled={returning}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition flex items-center space-x-1.5 shadow"
                >
                  {returning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Return</span>
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Refund Confirmation Modal ────────────────────────────────────── */}
      {showRefundModal && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg">Process Refund</h3>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Refund order <strong>{order.order_number}</strong> for total amount of{' '}
                <strong className="text-[var(--text)]">{formatPrice(order.total_amount)}</strong>.
              </p>

              {/* Refund Method selector */}
              <div>
                <label className="text-xs font-semibold block mb-1">Refund Method</label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text)] focus:outline-none focus:border-[var(--brand-crimson)]"
                >
                  {order.payment_method === 'online' && order.payment_status === 'paid' && (
                    <option value="gateway">Payment Gateway (Razorpay Online)</option>
                  )}
                  <option value="manual">Manual / Cash / Direct Bank Transfer</option>
                  <option value="store_credit">Store Credit / Gift Voucher</option>
                </select>
                <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                  {refundMethod === 'gateway'
                    ? 'Calls payment gateway to reverse customer charge.'
                    : 'Records offline refund or store credit in order audit records.'}
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold block mb-1">Reason for Refund</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g., Customer return, defective product, cancellation"
                  className="w-full p-2.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--surface-alt)] text-[var(--text)] focus:outline-none focus:border-[var(--brand-crimson)]"
                />
              </div>

              {refundError && (
                <div className="p-2.5 rounded border border-rose-500/30 bg-rose-500/10 text-xs text-rose-600">
                  {refundError}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-alt)]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefund}
                  disabled={refunding}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition flex items-center space-x-1.5 shadow"
                >
                  {refunding && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Process Refund</span>
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* ── Packing Slip Modal ────────────────────────────────────────────── */}
      {packingSlipData && (
        <PackingSlipModal
          data={packingSlipData}
          onClose={() => setPackingSlipData(null)}
        />
      )}
    </div>
  );
};
