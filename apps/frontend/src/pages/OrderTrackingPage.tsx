import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  CreditCard,
  Download,
  Printer,
  RefreshCw,
  RotateCcw,
  Store,
  Truck,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Portal } from '@/components/ui/Portal';
import { api, type OrderDetail } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';

// ── Timeline Step Definitions ────────────────────────────────────────────────

interface TimelineStepDef {
  key: string;
  label: string;
  description: string;
}

const DELIVERY_STEPS: TimelineStepDef[] = [
  {
    key: 'placed',
    label: 'Order Placed',
    description: 'Order received and assigned to bespoke tailoring team.',
  },
  {
    key: 'confirmed',
    label: 'Confirmed & Prepared',
    description: 'Quality inspected and securely packed in tamper-proof box.',
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    description: 'Dispatched with premium insured courier partner.',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Handed over at your doorstep.',
  },
];

const PICKUP_STEPS: TimelineStepDef[] = [
  {
    key: 'placed',
    label: 'Order Placed',
    description: 'Order received and placed with boutique concierge.',
  },
  {
    key: 'confirmed',
    label: 'Confirmed & Prepared',
    description: 'Handcrafted items steam-pressed and bagged.',
  },
  {
    key: 'ready_for_pickup',
    label: 'Ready for Boutique Pickup',
    description: 'Waiting at 100 Feet Rd Indiranagar flagship boutique.',
  },
  {
    key: 'picked_up',
    label: 'Picked Up',
    description: 'Collected by customer at boutique.',
  },
];

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, initialized, initAuth } = useAuthStore();
  const { addItem, openDrawer } = useCartStore();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const [reordering, setReordering] = useState(false);
  const [reorderFeedback, setReorderFeedback] = useState<{
    addedCount: number;
    outOfStockNames: string[];
  } | null>(null);

  // Customer Return state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Size too small / tight');
  const [customReturnReason, setCustomReturnReason] = useState('');
  const [returnComments, setReturnComments] = useState('');
  const [refundPreference, setRefundPreference] = useState('original_payment');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [returnSuccessMessage, setReturnSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!id || !initialized) return;
    setLoading(true);
    setError(null);

    api
      .getOrderById(id)
      .then((res) => {
        setOrder(res.order);
      })
      .catch((err) => {
        console.error('Order fetch error:', err);
        if (err.status === 404) {
          setError('Order not found or you do not have permission to view this order.');
        } else {
          setError(err.message || 'Unable to retrieve order details.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, user, initialized]);

  // Determine timeline steps and states
  const isCancelled = order?.order_status === 'cancelled';
  const isReturned = order?.order_status === 'returned';
  const isReturnEligible = Boolean(
    order &&
      (order.order_status === 'delivered' || order.order_status === 'picked_up') &&
      !isReturned &&
      !isCancelled
  );

  const steps = useMemo(() => {
    if (!order) return [];
    if (order.fulfillment_type === 'pickup') {
      return PICKUP_STEPS;
    }
    return DELIVERY_STEPS;
  }, [order]);

  // Index of active step
  const currentStepIndex = useMemo(() => {
    if (!order || isCancelled) return -1;
    if (isReturned) return steps.length - 1;
    const idx = steps.findIndex((s) => s.key === order.order_status);
    return idx >= 0 ? idx : 0;
  }, [order, steps, isCancelled, isReturned]);

  // Handle Customer Return Submission
  const handleCustomerReturn = async () => {
    if (!order) return;
    try {
      setSubmittingReturn(true);
      setReturnError(null);
      const effectiveReason =
        returnReason === 'Other'
          ? customReturnReason.trim() || 'Other reason'
          : returnReason;

      await api.customerRequestReturn(order.id, {
        reason: effectiveReason,
        comments: returnComments.trim() || undefined,
        refund_preference: refundPreference,
      });

      setShowReturnModal(false);
      setReturnSuccessMessage(
        'Return request submitted successfully. Our boutique concierge will reach out to schedule reverse pickup.'
      );
      const refreshed = await api.getOrderById(order.id);
      setOrder(refreshed.order);
    } catch (err: any) {
      setReturnError(err.message || 'Failed to submit return request.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Handle Online settlement for pending COD order
  const handlePayNow = async () => {
    if (!order) return;
    setPaying(true);
    setPayError(null);

    try {
      const res = await api.payOrderOnline(order.id);

      const isMockKey =
        !res.razorpay.key_id ||
        res.razorpay.key_id.includes('demo') ||
        res.razorpay.key_id.includes('mock') ||
        res.razorpay.key_id === 'rzp_test_shikkis_demo_key';

      if (isMockKey) {
        const mockPaymentId = `pay_mock_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        await api.verifyRazorpayPayment({
          razorpay_order_id: res.razorpay.order_id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: 'mock_valid_signature',
        });
        const refreshed = await api.getOrderById(order.id);
        setOrder(refreshed.order);
        return;
      }

      const options = {
        key: res.razorpay.key_id,
        amount: res.razorpay.amount,
        currency: res.razorpay.currency,
        name: 'Shikkis — Curated Style',
        description: `Order #${res.order_number}`,
        order_id: res.razorpay.order_id,
        prefill: {
          name: order.customer.fullName,
          email: order.customer.email,
          contact: order.customer.phone,
        },
        theme: {
          color: '#800020',
        },
        handler: async function () {
          // Refresh order status
          const refreshed = await api.getOrderById(order.id);
          setOrder(refreshed.order);
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setPayError(response.error?.description || 'Payment was unsuccessful. Please try again.');
        setPaying(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('Pay now error:', err);
      setPayError(err.message || 'Unable to initiate online payment settlement.');
    } finally {
      setPaying(false);
    }
  };

  // Handle Reorder: Add available items back to cart and report out of stock
  const handleReorder = async () => {
    if (!order) return;
    setReordering(true);
    setReorderFeedback(null);

    let added = 0;
    const outOfStock: string[] = [];

    for (const item of order.items) {
      if (item.is_available && item.current_stock > 0) {
        try {
          await addItem(item.variant_id, Math.min(item.quantity, item.current_stock));
          added++;
        } catch {
          outOfStock.push(item.product_name);
        }
      } else {
        outOfStock.push(item.product_name);
      }
    }

    setReorderFeedback({
      addedCount: added,
      outOfStockNames: outOfStock,
    });
    setReordering(false);

    if (added > 0) {
      openDrawer();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 mx-auto rounded-full border-2 border-brand-gold border-t-transparent animate-spin" />
          <p className="text-xs text-text-muted">Loading your order and receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    const isAuthRequired =
      error?.toLowerCase().includes('authentication required') ||
      error?.toLowerCase().includes('unauthenticated') ||
      error?.includes('401');

    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
          <AlertCircle size={32} />
        </div>
        <h1 className="font-serif text-3xl font-semibold text-text mb-2">
          {isAuthRequired ? 'Authentication Required' : 'Order Not Found'}
        </h1>
        <p className="text-xs text-text-muted mb-6 leading-relaxed max-w-md mx-auto">
          {isAuthRequired
            ? 'Please sign in to your customer account to view your order details, live tracking pipeline, and till-slip receipt.'
            : error || 'This order does not exist or does not belong to your customer profile.'}
        </p>
        <Link
          to={isAuthRequired ? `/auth?redirect=/orders/${id}` : '/orders'}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-crimson px-5 py-2.5 text-xs font-semibold text-white shadow hover:bg-brand-crimson/90 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>{isAuthRequired ? 'Sign In to View Order' : 'Back to My Orders'}</span>
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const address = order.delivery_address_snapshot;

  return (
    <>
      {/* ── Print Stylesheet for Pristine A4 Output ────────────────────────── */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, footer, nav, #mobile-menu-toggle, #theme-toggle, .no-print {
            display: none !important;
          }
          #print-till-slip {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            padding: 20px !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-bg py-8 md:py-12">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          {/* ── Action Header (No Print) ────────────────────────────────────── */}
          <div className="no-print mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-xs font-medium text-text-muted hover:text-text transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to All Orders</span>
            </Link>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Pay Now (if pending & not cancelled) */}
              {order.payment_status === 'pending' && !isCancelled && (
                <button
                  type="button"
                  disabled={paying}
                  onClick={handlePayNow}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-crimson px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-brand-crimson/90 transition-colors cursor-pointer"
                >
                  <CreditCard size={14} />
                  <span>{paying ? 'Processing...' : 'Pay Online Now'}</span>
                </button>
              )}

              {/* Request Return Button (Delivered or Picked Up orders) */}
              {isReturnEligible && (
                <button
                  type="button"
                  onClick={() => {
                    setReturnReason('Size too small / tight');
                    setCustomReturnReason('');
                    setReturnComments('');
                    setRefundPreference(order.payment_method === 'online' ? 'original_payment' : 'store_credit');
                    setReturnError(null);
                    setShowReturnModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 transition-colors cursor-pointer shadow-sm"
                >
                  <RotateCcw size={14} />
                  <span>Request Return</span>
                </button>
              )}

              {/* Reorder Button */}
              <button
                type="button"
                disabled={reordering}
                onClick={handleReorder}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text hover:border-brand-gold hover:text-brand-crimson transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>{reordering ? 'Adding...' : 'Reorder Items'}</span>
              </button>

              {/* Download Invoice PDF */}
              <a
                href={`/api/orders/${order.id}/invoice`}
                target="_blank"
                rel="noreferrer"
                download={`Shikkis-Invoice-${order.order_number}.pdf`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text hover:border-brand-gold hover:text-brand-crimson transition-colors cursor-pointer"
              >
                <Download size={14} />
                <span>Download Invoice</span>
              </a>

              {/* Print Receipt */}
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-text hover:border-brand-gold hover:text-brand-crimson transition-colors cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {returnSuccessMessage && (
            <div className="no-print mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <Check size={16} />
                <span>{returnSuccessMessage}</span>
              </div>
              <button
                onClick={() => setReturnSuccessMessage(null)}
                className="text-emerald-800 dark:text-emerald-300 font-bold ml-4 cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {payError && (
            <div className="no-print mb-6 rounded-lg border border-danger/30 bg-danger/10 p-4 text-xs text-danger flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{payError}</span>
            </div>
          )}

          {reorderFeedback && (
            <div className="no-print mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-800 dark:text-emerald-300">
              <p className="font-semibold">
                ✓ Added {reorderFeedback.addedCount} {reorderFeedback.addedCount === 1 ? 'item' : 'items'} to your shopping bag!
              </p>
              {reorderFeedback.outOfStockNames.length > 0 && (
                <p className="mt-1 text-text-muted">
                  Note: The following {reorderFeedback.outOfStockNames.length} item(s) are currently out of stock:{' '}
                  <span className="font-medium">{reorderFeedback.outOfStockNames.join(', ')}</span>.
                </p>
              )}
            </div>
          )}

          {/* ── Main Layout: Timeline (Left) & Till-Slip Receipt (Right) ──────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── LEFT: Vertical Status Timeline ─────────────────────────────── */}
            <div className="no-print lg:col-span-5 bg-surface rounded-xl border border-border p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-text">Live Tracking</h2>
                  <p className="text-[11px] text-text-muted mt-0.5">Order #{order.order_number}</p>
                </div>
                {isCancelled ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-danger/15 px-2.5 py-1 text-xs font-bold text-danger border border-danger/30">
                    <XCircle size={13} />
                    <span>CANCELLED</span>
                  </span>
                ) : isReturned ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 px-2.5 py-1 text-xs font-bold text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    <RotateCcw size={13} />
                    <span>RETURNED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 capitalize">
                    <Clock size={13} />
                    <span>{order.order_status.replace(/_/g, ' ')}</span>
                  </span>
                )}
              </div>

              {/* Cancelled Terminal State vs Standard Timeline */}
              {isCancelled ? (
                <div className="rounded-xl border border-danger/30 bg-danger/5 p-5 space-y-3">
                  <div className="flex items-center gap-2.5 text-danger font-semibold text-sm">
                    <XCircle size={20} />
                    <span>This Order Has Been Cancelled</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    This order was cancelled. Any pre-paid balance has been initiated for refund back to the original payment source and will reflect in 3-5 business days.
                  </p>
                  <div className="pt-2 border-t border-danger/20 text-[11px] text-text-muted">
                    <span>Reason: Customer cancellation or inventory reconciliation.</span>
                  </div>
                </div>
              ) : (
                /* Staggered Vertical Timeline on Mount */
                <div className="relative pl-6 space-y-8 my-2">
                  {/* Vertical Track Line */}
                  <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-border -z-0" />

                  {/* Active Progress Connector Line */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                    }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute left-[11px] top-3 w-0.5 bg-brand-crimson -z-0"
                  />

                  {steps.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const isFuture = idx > currentStepIndex;

                    return (
                      <motion.div
                        key={step.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.2, duration: 0.3 }}
                        className="relative flex items-start gap-4 group"
                      >
                        {/* Node Icon */}
                        <div
                          className={[
                            'absolute -left-[24px] flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all z-10',
                            isCompleted
                              ? 'bg-brand-crimson text-white shadow-xs'
                              : isCurrent
                              ? 'bg-brand-crimson text-white ring-4 ring-brand-crimson/20 shadow animate-pulse'
                              : 'bg-surface border-2 border-border text-text-muted/60',
                          ].join(' ')}
                        >
                          {isCompleted ? <Check size={13} strokeWidth={3} /> : idx + 1}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1">
                          <h4
                            className={[
                              'text-xs font-semibold transition-colors',
                              isCurrent
                                ? 'text-brand-crimson font-bold text-sm'
                                : isCompleted
                                ? 'text-text'
                                : 'text-text-muted/70',
                            ].join(' ')}
                          >
                            {step.label}
                          </h4>
                          <p
                            className={[
                              'text-[11px] mt-0.5 leading-relaxed',
                              isFuture ? 'text-text-muted/50' : 'text-text-muted',
                            ].join(' ')}
                          >
                            {step.description}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Return Status Card (if returned) */}
              {isReturned && (
                <div className="mt-6 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-semibold text-xs">
                    <RotateCcw size={15} />
                    <span>Return Registered & In Progress</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Your return request has been recorded. Our concierge team is coordinating reverse pickup from your address with our courier partner.
                  </p>
                  <div className="pt-2 border-t border-purple-500/20 flex justify-between items-center text-[11px]">
                    <span className="text-text-muted">Refund Status:</span>
                    <span className="font-semibold text-purple-700 dark:text-purple-300 capitalize">
                      {order.payment_status === 'refunded' ? '✓ Refund Processed' : 'Pending Pickup Verification'}
                    </span>
                  </div>
                </div>
              )}

              {/* Fulfillment Snapshot Details */}
              <div className="mt-8 pt-4 border-t border-border/80 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-text font-semibold">
                  {order.fulfillment_type === 'delivery' ? (
                    <>
                      <Truck size={15} className="text-brand-crimson" />
                      <span>Delivery Information</span>
                    </>
                  ) : (
                    <>
                      <Store size={15} className="text-brand-gold" />
                      <span>In-Store Concierge Pickup</span>
                    </>
                  )}
                </div>

                {order.fulfillment_type === 'delivery' && address ? (
                  <div className="bg-surface-alt/40 p-3 rounded-lg text-text-muted text-[11px] space-y-0.5">
                    <p className="font-semibold text-text">{order.customer.fullName}</p>
                    <p>{address.line1}, {address.line2 ? `${address.line2}, ` : ''}</p>
                    <p>{address.city}, {address.state} — {address.pincode}</p>
                    <p className="pt-1 text-text-muted">Contact: +91 {order.customer.phone}</p>
                  </div>
                ) : (
                  <div className="bg-surface-alt/40 p-3 rounded-lg text-text-muted text-[11px] space-y-1">
                    <p className="font-semibold text-text">Shikkis Flagship Boutique</p>
                    <p>100 Feet Road, Indiranagar, Bengaluru - 560038</p>
                    <p className="text-brand-crimson font-medium">Slot: {order.pickup_slot || 'Ready during store hours (11 AM - 8 PM)'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: Till-Slip Luxury Receipt (Printable A4) ──────────────── */}
            <div
              id="print-till-slip"
              className="lg:col-span-7 bg-surface rounded-xl border border-border p-6 md:p-8 shadow-sm font-mono text-xs text-text relative overflow-hidden"
            >
              {/* Receipt Header */}
              <div className="text-center pb-5 border-b border-dashed border-border space-y-1">
                <h3 className="font-serif text-2xl font-bold tracking-widest text-brand-crimson uppercase">
                  S H I K K I S
                </h3>
                <p className="text-[10px] tracking-widest uppercase text-brand-gold">
                  Curated Style • Bengaluru Flagship
                </p>
                <p className="text-[10px] text-text-muted pt-1">
                  100 Feet Rd, Indiranagar, Bengaluru 560038
                </p>
                <p className="text-[10px] text-text-muted">GSTIN: 29AAAAA0000A1Z5</p>
              </div>

              {/* Till Meta Info */}
              <div className="py-4 border-b border-dashed border-border text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-muted">RECEIPT NO:</span>
                  <span className="font-bold">INV-{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">DATE & TIME:</span>
                  <span>{orderDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">CUSTOMER:</span>
                  <span className="font-semibold">{order.customer.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">PAYMENT:</span>
                  <span className="uppercase">{order.payment_method} ({order.payment_status})</span>
                </div>
              </div>

              {/* Table Column Headers */}
              <div className="py-2.5 border-b border-border/80 flex justify-between font-bold text-[11px]">
                <span className="w-1/2">ITEM / DESC</span>
                <span className="w-1/6 text-center">QTY</span>
                <span className="w-1/3 text-right">AMOUNT</span>
              </div>

              {/* Itemised Lines */}
              <div className="py-3 divide-y divide-border/40 text-[11px] space-y-2">
                {order.items.map((it) => (
                  <div key={it.id} className="pt-2 first:pt-0 flex justify-between items-start">
                    <div className="w-1/2 pr-2">
                      <p className="font-semibold text-text leading-tight">{it.product_name}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {it.color} • Size {it.size}
                      </p>
                    </div>
                    <span className="w-1/6 text-center text-text-muted">x{it.quantity}</span>
                    <div className="w-1/3 text-right font-semibold text-text">
                      {formatPrice((it.price_at_purchase - it.discount_at_purchase) * it.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Monospace Financial Figures Breakdown */}
              <div className="py-3 border-t border-dashed border-border space-y-1.5 text-[11px]">
                <div className="flex justify-between text-text-muted">
                  <span>SUBTOTAL</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>

                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>SAVINGS & PROMOTIONS</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-text-muted">
                  <span>SHIPPING / DELIVERY</span>
                  <span>{order.shipping_cost === 0 ? 'FREE' : formatPrice(order.shipping_cost)}</span>
                </div>

                <div className="flex justify-between text-text-muted">
                  <span>TAXES (5% GST INCL.)</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>

                <div className="pt-2.5 border-t border-double border-border flex justify-between text-sm font-bold text-brand-crimson dark:text-brand-gold">
                  <span>TOTAL AMOUNT</span>
                  <span>{formatPrice(order.total_amount)}</span>
                </div>
              </div>

              {/* Fulfillment & Notes Block */}
              <div className="py-3 border-t border-dashed border-border text-[10px] text-text-muted space-y-1">
                <p className="font-bold text-text uppercase">
                  FULFILLMENT: {order.fulfillment_type === 'delivery' ? 'INSURED DOORSTEP DELIVERY' : 'BOUTIQUE PICKUP'}
                </p>
                {order.fulfillment_type === 'delivery' && address ? (
                  <p>{address.line1}, {address.line2 ? `${address.line2}, ` : ''}{address.city} - {address.pincode}</p>
                ) : (
                  <p>Shikkis Boutique • Slot: {order.pickup_slot || 'Regular hours'}</p>
                )}
                {order.customer_notes && (
                  <p className="italic pt-1 text-text">Note: "{order.customer_notes}"</p>
                )}
              </div>

              {/* Receipt Footer & Return Notice */}
              <div className="pt-4 border-t border-dashed border-border text-center text-[10px] text-text-muted space-y-1">
                <p className="tracking-wider uppercase font-semibold text-text">
                  Thank you for shopping at Shikkis.
                </p>
                <p>7-Day Hassle-Free Returns & Exchanges Accepted.</p>
                <p>care@shikkis.com • +91 80 4000 8899</p>

                {/* Decorative Till Slip Barcode Graphic */}
                <div className="pt-3 pb-1 flex justify-center opacity-70">
                  <div className="tracking-[4px] text-xs font-mono font-bold select-none">
                    |||| | ||||| || |||||| | ||| ||||||| ||
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Customer Return Request Modal ──────────────────────────────────── */}
      {showReturnModal && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-surface text-text border border-border rounded-xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center space-x-2 text-brand-crimson dark:text-brand-gold">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-serif font-bold text-lg">Request Return or Exchange</h3>
              </div>
              <p className="text-xs text-text-muted">
                Order <strong>#{order.order_number}</strong>. Select your return reason below. Our boutique courier partner will pick up the package from your doorstep.
              </p>

              {/* Items Summary */}
              <div className="p-3 rounded-lg border border-border bg-surface-alt space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted block">
                  Items In This Order ({order.items.length})
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between gap-3 text-xs py-1 border-b border-border/40 last:border-0">
                      <div className="truncate flex-1">
                        <span className="font-semibold block truncate text-text">{it.product_name}</span>
                        <span className="text-[11px] text-text-muted">
                          Size: {it.size} • Color: {it.color} • Qty: {it.quantity}
                        </span>
                      </div>
                      <span className="font-semibold text-text shrink-0">
                        {formatPrice((it.price_at_purchase - it.discount_at_purchase) * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Reason Selector */}
              <div>
                <label className="text-xs font-semibold block mb-1">
                  Why are you returning this? <span className="text-brand-crimson">*</span>
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-alt text-text focus:outline-none focus:border-brand-crimson"
                >
                  <option value="Size too small / tight">Size too small / tight</option>
                  <option value="Size too large / loose">Size too large / loose</option>
                  <option value="Fabric or embroidery quality mismatch">Fabric or embroidery quality not as expected</option>
                  <option value="Defective or damaged piece received">Defective or damaged piece received</option>
                  <option value="Received wrong style or color">Received wrong style or color</option>
                  <option value="Changed mind / no longer needed">Changed mind / no longer needed</option>
                  <option value="Other">Other reason (Specify below)</option>
                </select>
              </div>

              {returnReason === 'Other' && (
                <div>
                  <label className="text-xs font-semibold block mb-1">Specify Reason</label>
                  <input
                    type="text"
                    value={customReturnReason}
                    onChange={(e) => setCustomReturnReason(e.target.value)}
                    placeholder="Enter details..."
                    className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-alt text-text focus:outline-none focus:border-brand-crimson"
                  />
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="text-xs font-semibold block mb-1">Additional Comments (Optional)</label>
                <textarea
                  rows={2}
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                  placeholder="Share details on fit, condition, or exchange preferences..."
                  className="w-full p-2.5 text-xs rounded-lg border border-border bg-surface-alt text-text focus:outline-none focus:border-brand-crimson resize-none"
                />
              </div>

              {/* Preferred Refund Destination */}
              <div>
                <label className="text-xs font-semibold block mb-1.5">Preferred Refund Mode</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-surface-alt cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="refundPreference"
                      value="original_payment"
                      checked={refundPreference === 'original_payment'}
                      onChange={(e) => setRefundPreference(e.target.value)}
                      className="text-brand-crimson focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold block">Original Payment Method</span>
                      <span className="text-[11px] text-text-muted">
                        {order.payment_method === 'online'
                          ? 'Credited back to your bank card/UPI in 3-5 working days.'
                          : 'Our courier will disburse cash/UPI at doorstep upon pickup.'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-surface-alt cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="refundPreference"
                      value="store_credit"
                      checked={refundPreference === 'store_credit'}
                      onChange={(e) => setRefundPreference(e.target.value)}
                      className="text-brand-crimson focus:ring-0"
                    />
                    <div>
                      <span className="font-semibold block text-brand-gold">Instant Boutique Store Credit (Instant)</span>
                      <span className="text-[11px] text-text-muted">
                        Receive instant digital coupon to shop immediately with zero wait time.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Boutique Policy Notice */}
              <div className="p-2.5 rounded-lg bg-surface-alt/70 border border-border/80 text-[11px] text-text-muted">
                <p className="font-semibold text-text mb-0.5">Boutique Return Guidelines:</p>
                <p>Ensure the garment is unworn, unwashed with original handcrafted tags intact. Pickups are attempted within 24-48 hours.</p>
              </div>

              {returnError && (
                <div className="p-2.5 rounded border border-danger/30 bg-danger/10 text-xs text-danger">
                  {returnError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 pb-1 border-t border-border/40 sticky bottom-0 bg-surface/95 backdrop-blur-sm -mx-6 px-6">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border text-text-muted hover:bg-surface-alt cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCustomerReturn}
                  disabled={submittingReturn}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-brand-crimson hover:bg-brand-crimson/90 text-white transition flex items-center gap-1.5 shadow cursor-pointer"
                >
                  {submittingReturn && <RefreshCw size={13} className="animate-spin" />}
                  <span>Submit Return Request</span>
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};
