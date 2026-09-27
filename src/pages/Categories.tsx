import { useEffect, useMemo, useState } from "react";
import "./Categories.css";

type Category = {
  id: number;
  name: string;
  description: string | null;
  status: number;
  created_at: string | null;
  created_by: number | null;
  updated_at: string | null;
  updated_by: number | null;
};

type CategoryForm = {
  name: string;
  description: string;
};

const API_URL = "https://atrium-expensive-horse.abasthan.app";

function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<CategoryForm>({
    name: "",
    description: "",
  });

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = localStorage.getItem("token");

  // =========================
  // GET CATEGORIES
  // =========================
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data kategori"
        );
      }

      setCategories(result.data || []);
    } catch (err: any) {
      setError(
        err.message || "Terjadi kesalahan saat mengambil kategori"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================
  // FILTER
  // =========================
  const filteredCategories = useMemo(() => {
    const keyword = search.toLowerCase();

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(keyword) ||
        (category.description || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [categories, search]);

  // =========================
  // STATISTICS
  // =========================
  const totalCategories = categories.length;

  const categoriesWithDescription = categories.filter(
    (category) =>
      category.description &&
      category.description.trim() !== ""
  ).length;

  const categoriesWithoutDescription =
    totalCategories - categoriesWithDescription;

  // =========================
  // ADD
  // =========================
  const openAddModal = () => {
    setEditingId(null);

    setForm({
      name: "",
      description: "",
    });

    setFormError("");
    setShowModal(true);
  };

  // =========================
  // EDIT
  // =========================
  const openEditModal = (category: Category) => {
    setEditingId(category.id);

    setForm({
      name: category.name,
      description: category.description || "",
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
  // CHANGE
  // =========================
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // CREATE / UPDATE
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormError("");

    if (!form.name.trim()) {
      setFormError("Nama kategori wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const body = {
        name: form.name.trim(),
        description: form.description.trim() || null,
      };

      const url = editingId
        ? `${API_URL}/api/categories/${editingId}`
        : `${API_URL}/api/categories`;

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
          result.message || "Gagal menyimpan kategori"
        );
      }

      await fetchCategories();
      closeModal();
    } catch (err: any) {
      setFormError(
        err.message || "Terjadi kesalahan saat menyimpan kategori."
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
    categoryName: string
  ) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus kategori "${categoryName}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(
        `${API_URL}/api/categories/${id}`,
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
          result.message || "Gagal menghapus kategori"
        );
      }

      await fetchCategories();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus kategori");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <section className="categories-section">
        <div className="categories-state">
          <div className="loading-spinner"></div>

          <h3>Memuat kategori...</h3>

          <p>Data kategori sedang diambil dari server.</p>
        </div>
      </section>
    );
  }

  // =========================
  // ERROR
  // =========================
  if (error) {
    return (
      <section className="categories-section">
        <div className="categories-state error-state">
          <div className="state-icon">!</div>

          <h3>Gagal memuat kategori</h3>

          <p>{error}</p>

          <button
            className="retry-button"
            onClick={fetchCategories}
          >
            Coba Lagi
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="categories-section">
      {/* HEADER */}
      <div className="categories-header">
        <div>
          <div className="page-label">MASTER DATA</div>

          <h2>Kategori</h2>

          <p>
            Kelola kategori yang digunakan untuk produk POS.
          </p>
        </div>

        <button
          className="add-category-button"
          onClick={openAddModal}
        >
          <span>+</span>
          Tambah Kategori
        </button>
      </div>

      {/* STATISTICS */}
      <div className="category-stats">
        <div className="category-stat-card">
          <div className="stat-icon category-main-icon">
            ◈
          </div>

          <div>
            <span>Total Kategori</span>
            <strong>{totalCategories}</strong>
          </div>
        </div>

        <div className="category-stat-card">
          <div className="stat-icon description-icon">
            ✓
          </div>

          <div>
            <span>Dengan Deskripsi</span>
            <strong>{categoriesWithDescription}</strong>
          </div>
        </div>

        <div className="category-stat-card">
          <div className="stat-icon empty-description-icon">
            -
          </div>

          <div>
            <span>Tanpa Deskripsi</span>
            <strong>{categoriesWithoutDescription}</strong>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="categories-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Cari kategori atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* EMPTY */}
      {categories.length === 0 ? (
        <div className="categories-state empty-state">
          <div className="state-icon">◈</div>

          <h3>Belum ada kategori</h3>

          <p>
            Data kategori masih kosong. Tambahkan kategori
            pertama untuk produk.
          </p>

          <button
            className="add-category-button"
            onClick={openAddModal}
          >
            <span>+</span>
            Tambah Kategori
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="categories-state empty-state">
          <div className="state-icon">⌕</div>

          <h3>Kategori tidak ditemukan</h3>

          <p>
            Tidak ada kategori yang sesuai dengan pencarian.
          </p>
        </div>
      ) : (
        <div className="categories-table-card">
          <div className="table-top">
            <div>
              <h3>Daftar Kategori</h3>

              <span>
                Menampilkan {filteredCategories.length} dari{" "}
                {categories.length} kategori
              </span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Kategori</th>
                  <th>Deskripsi</th>
                  <th>Dibuat</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <span className="category-id">
                        #{category.id}
                      </span>
                    </td>

                    <td>
                      <div className="category-name-cell">
                        <div className="category-avatar">
                          {category.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{category.name}</strong>

                          <small>
                            Kategori #{category.id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="description-text">
                        {category.description || "-"}
                      </span>
                    </td>

                    <td>
                      <span className="created-date">
                        {category.created_at
                          ? new Date(
                              category.created_at
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
                      <div className="category-actions">
                        <button
                          className="edit-category-button"
                          onClick={() =>
                            openEditModal(category)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-category-button"
                          onClick={() =>
                            handleDelete(
                              category.id,
                              category.name
                            )
                          }
                          disabled={
                            deletingId === category.id
                          }
                        >
                          {deletingId === category.id
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
          className="category-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="category-modal"
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
                    ? "Edit Kategori"
                    : "Tambah Kategori"}
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
                <label htmlFor="category-name">
                  Nama Kategori <span>*</span>
                </label>

                <input
                  id="category-name"
                  name="name"
                  type="text"
                  placeholder="Contoh: Makanan"
                  value={form.name}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="category-description">
                  Deskripsi
                </label>

                <textarea
                  id="category-description"
                  name="description"
                  rows={4}
                  placeholder="Masukkan deskripsi kategori..."
                  value={form.description}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-category-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="save-category-button"
                  disabled={saving}
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                    ? "Simpan Perubahan"
                    : "Tambah Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Categories;