import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [newCat, setNewCat] = useState({
    name: '',
    icon: '🏷️',
    color: '#4f46e5',
    type: 'expense',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  const emojiList = ['🍔', '🏠', '✈️', '🎬', '🏥', '🛍️', '🚗', '💡', '📚', '📦', '💰', '💻', '🏢', '📈', '🎁', '☕', '🎮', '🏋️', '⚡', '🐾'];

  useEffect(() => {
    fetchCategories();
  }, [filterType]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/categories?type=${filterType}`);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return setError('Category name is required');
    setError('');

    try {
      await api.post('/categories', newCat);
      setNewCat({ name: '', icon: '🏷️', color: '#4f46e5', type: 'expense' });
      setShowAddForm(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDelete = async (id, isDefault) => {
    if (isDefault) {
      return alert('Default system categories cannot be deleted.');
    }
    if (!window.confirm('Delete this custom category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">Categories & Tags</h2>
          <p className="text-muted mb-0">Organize your expenses and income into visual categories</p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select bg-light border-0 fw-semibold"
            style={{ width: '150px' }}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          <button
            className="btn btn-primary fw-semibold d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <i className={`bi ${showAddForm ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
            <span>{showAddForm ? 'Cancel' : 'New Category'}</span>
          </button>
        </div>
      </div>

      {/* Inline Create Form */}
      {showAddForm && (
        <div className="fin-card mb-4 border-primary">
          <h5 className="fw-bold mb-3">Add Custom Category</h5>
          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Category Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Pet Care, Gaming"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  required
                />
              </div>

              <div className="col-6 col-md-2">
                <label className="form-label small fw-semibold">Type</label>
                <select
                  className="form-select"
                  value={newCat.type}
                  onChange={(e) => setNewCat({ ...newCat, type: e.target.value })}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="col-6 col-md-2">
                <label className="form-label small fw-semibold">Icon</label>
                <select
                  className="form-select"
                  value={newCat.icon}
                  onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
                >
                  {emojiList.map((em) => (
                    <option key={em} value={em}>
                      {em}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-6 col-md-2">
                <label className="form-label small fw-semibold">Color</label>
                <input
                  type="color"
                  className="form-control form-control-color w-100"
                  value={newCat.color}
                  onChange={(e) => setNewCat({ ...newCat, color: e.target.value })}
                />
              </div>

              <div className="col-6 col-md-2">
                <button type="submit" className="btn btn-primary w-100 fw-semibold">
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : (
        <div className="row g-3">
          {categories.map((cat) => (
            <div key={cat._id} className="col-6 col-md-4 col-xl-3">
              <div
                className="fin-card h-100 p-3 d-flex align-items-center justify-content-between"
                style={{ borderLeft: `5px solid ${cat.color || '#4f46e5'}` }}
              >
                <div className="d-flex align-items-center gap-3">
                  <span className="fs-2">{cat.icon}</span>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark">{cat.name}</h6>
                    <span className="badge bg-light text-muted border text-capitalize" style={{ fontSize: '0.65rem' }}>
                      {cat.type}
                    </span>
                    {cat.isDefault && (
                      <span className="badge bg-info bg-opacity-10 text-info ms-1" style={{ fontSize: '0.65rem' }}>
                        Default
                      </span>
                    )}
                  </div>
                </div>

                {!cat.isDefault && (
                  <button
                    className="btn btn-sm btn-link text-danger p-0"
                    onClick={() => handleDelete(cat._id, cat.isDefault)}
                    title="Delete category"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;
