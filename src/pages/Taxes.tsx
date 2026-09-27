import { useEffect, useMemo, useState } from "react";
import "./Taxes.css";

type Tax = {
  id: number;
  name: string;
  rate: number;
  status: number;
  created_at: string;
  created_by: number | null;
  updated_at: string | null;
  updated_by: number | null;
};

type TaxForm = {
  name: string;
  rate: string;
};

const API_URL = "http://localhost:3000";

function Taxes() {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<TaxForm>({
    name: "",
    rate: "",
  });

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = localStorage.getItem("token");

  // =========================
  // GET TAXES
  // =========================
  const fetchTaxes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/taxes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data tax"
        );
      }

      setTaxes(result.data || []);
    } catch (err: any) {
      setError(
        err.message || "Terjadi kesalahan saat mengambil tax"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  // =========================
  // FILTER
  // =========================
  const filteredTaxes = useMemo(() => {
    const keyword = search.toLowerCase();

    return taxes.filter((tax) =>
      tax.name.toLowerCase().includes(keyword)
    );
  }, [taxes, search]);

  // =========================
  // STATISTICS
  // =========================
  const totalTaxes = taxes.length;

  const averageRate =
    totalTaxes > 0
      ? taxes.reduce(
          (total, tax) => total + Number(tax.rate),
          0
        ) / totalTaxes
      : 0;

  const highestRate =
    totalTaxes > 0
      ? Math.max(...taxes.map((tax) => Number(tax.rate)))
      : 0;

  const lowestRate =
    totalTaxes > 0
      ? Math.min(...taxes.map((tax) => Number(tax.rate)))
      : 0;

  // =========================
  // OPEN ADD
  // =========================
  const openAddModal = () => {
    setEditingId(null);

    setForm({
      name: "",
      rate: "",
    });

    setFormError("");
    setShowModal(true);
  };

  // =========================
  // OPEN EDIT
  // =========================
  const openEditModal = (tax: Tax) => {
    setEditingId(tax.id);

    setForm({
      name: tax.name,
      rate: tax.rate.toString(),
    });

    setFormError("");
    setShowModal(true);
  };

  // =========================
  // CLOSE
  // =========================
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setFormError("");
  };

  // =========================
  // FORM CHANGE
  // =========================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SAVE TAX
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormError("");

    if (!form.name.trim()) {
      setFormError("Nama tax wajib diisi.");
      return;
    }

    if (form.rate === "") {
      setFormError("Rate tax wajib diisi.");
      return;
    }

    const rate = Number(form.rate);

    if (Number.isNaN(rate)) {
      setFormError("Rate tax harus berupa angka.");
      return;
    }

    if (rate < 0 || rate > 100) {
      setFormError("Rate tax harus berada antara 0 sampai 100.");
      return;
    }

    try {
      setSaving(true);

      const body = {
        name: form.name.trim(),
        rate,
      };

      const url = editingId
        ? `${API_URL}/api/taxes/${editingId}`
        : `${API_URL}/api/taxes`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menyimpan tax"
        );
      }

      await fetchTaxes();

      closeModal();
    } catch (err: any) {
      setFormError(
        err.message || "Terjadi kesalahan saat menyimpan tax."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (
    id: number,
    taxName: string
  ) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus tax "${taxName}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(
        `${API_URL}/api/taxes/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menghapus tax"
        );
      }

      await fetchTaxes();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus tax");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <section className="taxes-section">
        <div className="taxes-state">
          <div className="loading-spinner"></div>

          <h3>Memuat tax...</h3>

          <p>
            Data tax sedang diambil dari server.
          </p>
        </div>
      </section>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <section className="taxes-section">
        <div className="taxes-state error-state">
          <div className="state-icon">!</div>

          <h3>Gagal memuat tax</h3>

          <p>{error}</p>

          <button
            className="retry-button"
            onClick={fetchTaxes}
          >
            Coba Lagi
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="taxes-section">
      {/* HEADER */}
      <div className="taxes-header">
        <div>
          <div className="page-label">MASTER DATA</div>

          <h2>Tax</h2>

          <p>
            Kelola pajak yang digunakan dalam transaksi POS.
          </p>
        </div>

        <button
          className="add-tax-button"
          onClick={openAddModal}
        >
          <span>+</span>
          Tambah Tax
        </button>
      </div>

      {/* STATISTICS */}
      <div className="tax-stats">
        <div className="tax-stat-card">
          <div className="stat-icon tax-main-icon">
            %
          </div>

          <div>
            <span>Total Tax</span>
            <strong>{totalTaxes}</strong>
          </div>
        </div>

        <div className="tax-stat-card">
          <div className="stat-icon average-icon">
            ≈
          </div>

          <div>
            <span>Rata-rata Rate</span>
            <strong>{averageRate.toFixed(1)}%</strong>
          </div>
        </div>

        <div className="tax-stat-card">
          <div className="stat-icon highest-icon">
            ↑
          </div>

          <div>
            <span>Rate Tertinggi</span>
            <strong>{highestRate}%</strong>
          </div>
        </div>

        <div className="tax-stat-card">
          <div className="stat-icon lowest-icon">
            ↓
          </div>

          <div>
            <span>Rate Terendah</span>
            <strong>{lowestRate}%</strong>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="taxes-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Cari nama tax..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* EMPTY */}
      {taxes.length === 0 ? (
        <div className="taxes-state empty-state">
          <div className="state-icon">%</div>

          <h3>Belum ada tax</h3>

          <p>
            Data tax masih kosong. Tambahkan tax pertama
            untuk digunakan pada transaksi.
          </p>

          <button
            className="add-tax-button"
            onClick={openAddModal}
          >
            <span>+</span>
            Tambah Tax
          </button>
        </div>
      ) : filteredTaxes.length === 0 ? (
        <div className="taxes-state empty-state">
          <div className="state-icon">⌕</div>

          <h3>Tax tidak ditemukan</h3>

          <p>
            Tidak ada tax yang sesuai dengan pencarian.
          </p>
        </div>
      ) : (
        /* TABLE */
        <div className="taxes-table-card">
          <div className="table-top">
            <div>
              <h3>Daftar Tax</h3>

              <span>
                Menampilkan {filteredTaxes.length} dari{" "}
                {taxes.length} tax
              </span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="taxes-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tax</th>
                  <th>Rate</th>
                  <th>Dibuat</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredTaxes.map((tax) => (
                  <tr key={tax.id}>
                    <td>
                      <span className="tax-id">
                        #{tax.id}
                      </span>
                    </td>

                    <td>
                      <div className="tax-name-cell">
                        <div className="tax-avatar">
                          %
                        </div>

                        <div>
                          <strong>{tax.name}</strong>

                          <small>
                            ID tax #{tax.id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="rate-badge">
                        {tax.rate}%
                      </span>
                    </td>

                    <td>
                      <span className="created-date">
                        {tax.created_at
                          ? new Date(
                              tax.created_at
                            ).toLocaleDateString("id-ID")
                          : "-"}
                      </span>
                    </td>

                    <td>
                      <span className="status-badge">
                        <span className="status-dot"></span>
                        Aktif
                      </span>
                    </td>

                    <td>
                      <div className="tax-actions">
                        <button
                          className="edit-tax-button"
                          onClick={() =>
                            openEditModal(tax)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-tax-button"
                          onClick={() =>
                            handleDelete(
                              tax.id,
                              tax.name
                            )
                          }
                          disabled={
                            deletingId === tax.id
                          }
                        >
                          {deletingId === tax.id
                            ? "..."
                            : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div
          className="tax-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="tax-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="modal-label">
                  {editingId
                    ? "EDIT DATA"
                    : "MASTER DATA"}
                </span>

                <h3>
                  {editingId
                    ? "Edit Tax"
                    : "Tambah Tax"}
                </h3>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="form-error">
                  <span>!</span>
                  {formError}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="tax-name">
                  Nama Tax <span>*</span>
                </label>

                <input
                  id="tax-name"
                  name="name"
                  type="text"
                  placeholder="Contoh: PPN"
                  value={form.name}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="tax-rate">
                  Rate <span>*</span>
                </label>

                <div className="rate-input">
                  <input
                    id="tax-rate"
                    name="rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="11"
                    value={form.rate}
                    onChange={handleChange}
                    disabled={saving}
                  />

                  <span>%</span>
                </div>

                <small className="field-hint">
                  Masukkan rate antara 0 sampai 100.
                </small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-tax-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="save-tax-button"
                  disabled={saving}
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                    ? "Simpan Perubahan"
                    : "Tambah Tax"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Taxes;