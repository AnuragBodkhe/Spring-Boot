import { useState, useEffect } from 'react';
import { getAllOrders, placeOrder, countOrdersByCustomer, totalAmountByCustomer, totalRevenue } from '../../api/orderApi';
import { getAllCustomers } from '../../api/customerApi';
import { getAllProducts } from '../../api/productApi';
import { useFetch } from '../../hooks/useFetch';
import { Button, Input, Modal, Card, Badge, EmptyState, Spinner, Alert, Toast, StatCard } from '../../components/common';

export default function OrdersPage() {
  const { data: orders, loading, error, execute: reloadOrders } = useFetch(getAllOrders);
  const { data: customers } = useFetch(getAllCustomers);
  const { data: products } = useFetch(getAllProducts);

  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [form, setForm] = useState({ customerId: '', productId: '', qty: 1 });
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [revenue, setRevenue] = useState(null);

  // Analytics state
  const [analyticsCustomerId, setAnalyticsCustomerId] = useState('');
  const [analyticsResult, setAnalyticsResult] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    totalRevenue().then((r) => setRevenue(r.data)).catch(() => {});
  }, [orders]);

  const handlePlaceOrder = async () => {
    if (!form.customerId || !form.productId || !form.qty) {
      showToast('All fields are required', 'error');
      return;
    }
    setPlacing(true);
    try {
      await placeOrder(form.customerId, form.productId, form.qty);
      showToast('Order placed successfully');
      setPlaceModalOpen(false);
      setForm({ customerId: '', productId: '', qty: 1 });
      reloadOrders();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  const handleAnalytics = async () => {
    if (!analyticsCustomerId) return;
    setAnalyticsLoading(true);
    try {
      const [cnt, amt] = await Promise.all([
        countOrdersByCustomer(analyticsCustomerId),
        totalAmountByCustomer(analyticsCustomerId),
      ]);
      const cust = customers?.find((c) => c.customerId === +analyticsCustomerId);
      setAnalyticsResult({ count: cnt.data, amount: amt.data, customerName: cust?.name || `#${analyticsCustomerId}` });
    } catch {
      showToast('Analytics fetch failed', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const selectedProduct = products?.find((p) => p.productId === +form.productId);
  const estimatedTotal = selectedProduct ? selectedProduct.price * form.qty : 0;

  const displayed = (orders || []).filter((o) =>
    !search ||
    o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.product?.productName?.toLowerCase().includes(search.toLowerCase()) ||
    String(o.orderId).includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Orders"
          value={orders?.length ?? 0}
          color="amber"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <StatCard
          label="Total Revenue"
          value={revenue != null ? `₹${revenue.toFixed(2)}` : '—'}
          color="rose"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
        />
        <StatCard
          label="Avg Order Value"
          value={orders?.length ? `₹${(revenue / orders.length).toFixed(2)}` : '—'}
          color="indigo"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Input
          placeholder="Search by customer, product, order ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setAnalyticsOpen(true)}>📊 Customer Analytics</Button>
          <Button onClick={() => setPlaceModalOpen(true)}>+ Place Order</Button>
        </div>
      </div>

      {/* Table */}
      <Card padding={false}>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="p-6"><Alert type="error" message={error} /></div>
        ) : displayed.length === 0 ? (
          <EmptyState icon="🛒" title="No orders yet" description="Place your first order to get started." action={<Button onClick={() => setPlaceModalOpen(true)}>Place Order</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Order ID', 'Customer', 'Product', 'Qty', 'Unit Price', 'Total', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map((o) => (
                  <tr key={o.orderId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md">#{o.orderId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-xs">
                          {o.customer?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{o.customer?.name}</p>
                          <p className="text-xs text-gray-400">{o.customer?.city}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{o.product?.productName}</p>
                      <Badge variant="purple">{o.product?.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-700">{o.quantityOrdered}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      ₹{o.product?.price?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900">₹{o.totalPrice?.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="success">Completed</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
              Showing {displayed.length} of {orders?.length || 0} orders
            </div>
          </div>
        )}
      </Card>

      {/* Place Order Modal */}
      <Modal open={placeModalOpen} onClose={() => setPlaceModalOpen(false)} title="Place New Order">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Customer</label>
            <select
              value={form.customerId}
              onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))}
              className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select customer…</option>
              {(customers || []).map((c) => (
                <option key={c.customerId} value={c.customerId}>#{c.customerId} — {c.name} ({c.city})</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Product</label>
            <select
              value={form.productId}
              onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
              className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select product…</option>
              {(products || []).map((p) => (
                <option key={p.productId} value={p.productId}>
                  #{p.productId} — {p.productName} @ ₹{p.price} (Qty: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Quantity"
            type="number"
            min="1"
            value={form.qty}
            onChange={(e) => setForm((f) => ({ ...f, qty: +e.target.value }))}
          />

          {selectedProduct && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-indigo-700 font-medium">Estimated Total</span>
                <span className="text-xl font-bold text-indigo-800">₹{estimatedTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-indigo-500 mt-1">{form.qty} × ₹{selectedProduct.price}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setPlaceModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" loading={placing} onClick={handlePlaceOrder}>Place Order</Button>
          </div>
        </div>
      </Modal>

      {/* Analytics Modal */}
      <Modal open={analyticsOpen} onClose={() => { setAnalyticsOpen(false); setAnalyticsResult(null); }} title="Customer Order Analytics">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Select Customer</label>
              <select
                value={analyticsCustomerId}
                onChange={(e) => { setAnalyticsCustomerId(e.target.value); setAnalyticsResult(null); }}
                className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose customer…</option>
                {(customers || []).map((c) => (
                  <option key={c.customerId} value={c.customerId}>{c.name} (#{c.customerId})</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAnalytics} loading={analyticsLoading} disabled={!analyticsCustomerId}>
                Analyze
              </Button>
            </div>
          </div>

          {analyticsResult && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-amber-700">{analyticsResult.count}</p>
                <p className="text-xs text-amber-600 mt-1">Total Orders</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-emerald-700">₹{(analyticsResult.amount || 0).toFixed(2)}</p>
                <p className="text-xs text-emerald-600 mt-1">Total Spent</p>
              </div>
              <div className="col-span-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                <p className="text-sm font-semibold text-indigo-800">{analyticsResult.customerName}</p>
                <p className="text-xs text-indigo-500">
                  Avg. ₹{analyticsResult.count ? (analyticsResult.amount / analyticsResult.count).toFixed(2) : 0} per order
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
