import { useState, useCallback } from 'react';
import {
  getAllCustomers, createCustomer, updateCustomer, deleteCustomer, getCustomersByCity, getCustomersByAge
} from '../../api/customerApi';
import { useFetch } from '../../hooks/useFetch';
import {
  Button, Input, Modal, Card, Badge, EmptyState, Spinner, Alert, Toast
} from '../../components/common';

const emptyForm = { name: '', email: '', city: '', age: '', bankUserName: '', password: '' };

export default function CustomersPage() {
  const { data: customers, loading, error, execute: reload, setData } = useFetch(getAllCustomers);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setFormErrors({}); setModalOpen(true); };
  const openEdit = (c) => {
    setEditTarget(c);
    setForm({ name: c.name, email: c.email, city: c.city, age: c.age, bankUserName: c.bankUserName || '', password: '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.age || isNaN(form.age) || +form.age < 1) errs.age = 'Valid age required';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      const payload = { ...form, age: +form.age, password: +form.password || 0 };
      if (editTarget) {
        await updateCustomer(editTarget.customerId, { ...payload, customerId: editTarget.customerId });
        showToast('Customer updated');
      } else {
        await createCustomer(payload);
        showToast('Customer created');
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
      await deleteCustomer(deleteId);
      setData((prev) => prev.filter((c) => c.customerId !== deleteId));
      showToast('Customer deleted');
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleteId(null);
    }
  };

  const handleFilter = async () => {
    if (!filterValue.trim()) { reload(); return; }
    try {
      let res;
      if (filterType === 'city') res = await getCustomersByCity(filterValue);
      else if (filterType === 'age') res = await getCustomersByAge(+filterValue);
      setData(res.data);
    } catch {
      showToast('Filter failed', 'error');
    }
  };

  const displayed = (customers || []).filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-xl">
          <Input
            placeholder="Search by name, email, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All</option>
            <option value="city">By City</option>
            <option value="age">Age {'>'} </option>
          </select>
          {filterType !== 'all' && (
            <>
              <Input
                placeholder={filterType === 'city' ? 'City name' : 'Min age'}
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-28"
              />
              <Button variant="secondary" onClick={handleFilter}>Filter</Button>
              <Button variant="ghost" onClick={() => { setFilterValue(''); setFilterType('all'); reload(); }}>Clear</Button>
            </>
          )}
        </div>
        <Button onClick={openCreate}>+ Add Customer</Button>
      </div>

      {/* Table */}
      <Card padding={false}>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="p-6"><Alert type="error" message={error} /></div>
        ) : displayed.length === 0 ? (
          <EmptyState icon="👥" title="No customers found" description="Add your first customer to get started." action={<Button onClick={openCreate}>Add Customer</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['ID', 'Name', 'Email', 'City', 'Age', 'Bank Username', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map((c) => (
                  <tr key={c.customerId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{c.customerId}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold text-xs">
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.email}</td>
                    <td className="px-4 py-3"><Badge variant="info">{c.city}</Badge></td>
                    <td className="px-4 py-3 text-gray-700">{c.age}</td>
                    <td className="px-4 py-3 text-gray-500">{c.bankUserName || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(c)}>Edit</Button>
                        <Button size="sm" variant="danger" onClick={() => setDeleteId(c.customerId)}>Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">
              Showing {displayed.length} of {customers?.length || 0} customers
            </div>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Customer' : 'New Customer'}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={set('name')} error={formErrors.name} />
            <Input label="Age" type="number" placeholder="25" value={form.age} onChange={set('age')} error={formErrors.age} />
          </div>
          <Input label="Email" type="email" placeholder="john@example.com" value={form.email} onChange={set('email')} error={formErrors.email} />
          <Input label="City" placeholder="Mumbai" value={form.city} onChange={set('city')} error={formErrors.city} />
          <Input label="Bank Username" placeholder="john_bank" value={form.bankUserName} onChange={set('bankUserName')} />
          <Input label="Password (PIN)" type="number" placeholder="4-digit PIN" value={form.password} onChange={set('password')} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button className="flex-1" loading={saving} onClick={handleSave}>{editTarget ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirm Delete">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Are you sure you want to delete this customer? This action cannot be undone.</p>
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
