const AddRepoForm = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({ name: '', path: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.path.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    setError('');

    const result = await onAdd(formData);
    if (result.success) {
      setFormData({ name: '', path: '' });
      onCancel();
    } else {
      setError(result.error || 'Failed to add repository');
    }

    setSubmitting(false);
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Add Repository</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onCancel}
                disabled={submitting}
              ></button>
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Repository Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={submitting}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Repository Path</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.path}
                  onChange={(e) =>
                    setFormData({ ...formData, path: e.target.value })
                  }
                  disabled={submitting}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Repository'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddRepoForm;