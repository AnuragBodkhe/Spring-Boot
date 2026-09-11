import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCustomers } from '../../api/customerApi';
import { getAllProducts } from '../../api/productApi';
import { getAllOrders, totalRevenue } from '../../api/orderApi';
import { StatCard, Card, Spinner, Badge } from '../../components/common';

export default function DashboardPage() {
  const [stats, setStats] = useState({ customers: 0, products: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [custs, prods, ords, rev] = await Promise.allSettled([
          getAllCustomers(),
          getAllProducts(),
          getAllOrders(),
          totalRevenue(),
        ]);
        setStats({
          customers: custs.status === 'fulfilled' ? custs.value.data.length : 0,
          products: prods.status === 'fulfilled' ? prods.value.data.length : 0,
          orders: ords.status === 'fulfilled' ? ords.value.data.length : 0,
          revenue: rev.status === 'fulfilled' ? (rev.value.data || 0) : 0,
        });
        if (ords.status === 'fulfilled') {
          setRecentOrders(ords.value.data.slice(-5).reverse());
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Customers"
          value={stats.customers}
          color="indigo"
          trend="All registered customers"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
        />
        <StatCard
          label="Total Products"
          value={stats.products}
          color="emerald"
          trend="Available in catalog"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>}
        />
        <StatCard
          label="Total Orders"
          value={stats.orders}
          color="amber"
          trend="Orders placed"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
        />
        <StatCard
          label="Total Revenue"
          value={`₹${(stats.revenue || 0).toFixed(2)}`}
          color="rose"
          trend="Across all orders"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>}
        />
      </div>

      {/* Quick Links + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/customers', label: 'Manage Customers', icon: '👥', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
              { to: '/products', label: 'Manage Products', icon: '📦', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
              { to: '/orders', label: 'View All Orders', icon: '🛒', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
            ].map(({ to, label, icon, color }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${color}`}
              >
                <span className="text-lg">{icon}</span>
                {label}
                <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No orders yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <div key={order.orderId} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center text-sm font-semibold">
                      #{order.orderId}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.customer?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.product?.productName || '—'} × {order.quantityOrdered}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">₹{order.totalPrice?.toFixed(2)}</p>
                    <Badge variant="success">Placed</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
