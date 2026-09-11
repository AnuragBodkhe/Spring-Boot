import { useState } from 'react';
import {
  getAllProducts, createProduct, updateProduct, deleteProduct, getProductsByCategory
} from '../../api/productApi';
import { useFetch } from '../../hooks/useFetch';
import { Button, Input, Modal, Card, Badge, EmptyState, Spinner, Alert, Toast } from '../../components/common';

const emptyForm = { productName: '', price: '', category: '', quantity: '' };

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Books', 'Sports', 'Home', 'Beauty', 'Toys', 'Other'];

export default function ProductsPage() {
  const { data: products, loading, error, execute: reload, setData } = useFetch(getAllProducts);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setFormErrors({}); setModalOpen(true); };
  const openEdit = (p) => {
    setEditTarget(p);
    setForm({ productName: p.productName, price: p.price, category: p.category, quantity: p.quantity });
    setFormErrors({});
    setModalOpen(true);
  };
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.productName.trim()) errs.productName = 'Product name required';
    if (!form.price || isNaN(form.price) || +form.price < 0) errs.price = 'Valid price required';
    if (!form.category.trim()) errs.category = 'Category required';
    if (!form.quantity || isNaN(form.quantity) || +form.quantity < 0) errs.quantity = 'Valid quantity required';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: +form.price, quantity: +form.quantity };
      if (editTarget) {
        await updateProduct(editTarget.productId, { ...payload, productId: editTarget.productId });
        showToast('Product updated');
      } else {
        await createProduct(payload);
        showToast('Product created');
      }
      setModalOpen(false);
      reload();
    } catch (e) {
      showToast(e.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteId);
      setData((prev) => prev.filter((p) => p.productId !== deleteId));
      showToast('Product deleted');
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleCatFilter = async (cat) => {
    setCatFilter(cat);
    if (!cat) { reload(); return; }
    try {
      const res = await getProductsByCategory(cat);
      setData(res.data);
    } catch {
      showToast('Filter failed', 'error');
    }
  };

  const displayed = (products || []).filter((p) =>
    !search ||
    p.productName?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const stockBadge = (qty) => {
    if (qty === 0) return <Badge variant="danger">Out of Stock</Badge>;
    if (qty < 10) return <Badge variant="warning">Low Stock</Badge>;
    return <Badge variant="success">In Stock</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-xl flex-wrap">
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-32"
          />
          <select
            value={catFilter}
            onChange={(e) => handleCatFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Button onClick={openCreate}>+ Add Product</Button>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap">
        {['', ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => handleCatFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
              ${catFilter === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat || 'All'}
          </button>
        ))}
      </div>

      {/* Grid / Table */}
      <Card padding={false}>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="p-6"><Alert type="error" message={error} /></div>
        ) : displayed.length === 0 ? (
          <EmptyState icon="📦" title="No products found" description="Add products to your catalog." action={<Button onClick={openCreate}>Add Product</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['ID', 'Product Name', 'Category', 'Price', 'Quantity', 'Stock Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map((p) => (
                  <tr key={p.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{p.productId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">📦</div>
                        <span className="font-medium text-gray-900">{p.productName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="purple">{p.category}</Badge></td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₹{p.price?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700">{p.quantity}</td>
                    <td className="px-4 py-3">{stockBadge(p.quantity)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteId(p.productId)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
              Showing {displayed.length} of {products?.length || 0} products
            </div>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Product' : 'New Product'}>
        <div className="space-y-4">
          <Input label="Product Name" placeholder="iPhone 15 Pro" value={form.productName} onChange={set('productName')} error={formErrors.productName} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (₹)" type="number" placeholder="999.99" value={form.price} onChange={set('price')} error={formErrors.price} />
            <Input label="Quantity" type="number" placeholder="50" value={form.quantity} onChange={set('quantity')} error={formErrors.quantity} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className={`border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${formErrors.category ? 'border-red-400' : 'border-gray-300'}`}
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {formErrors.category && <span className="text-xs text-red-500">{formErrors.category}</span>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>{editTarget ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Are you sure you want to delete this product?</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
