import { useEffect, useMemo, useState } from "react";
import "./Roles.css";

type Role = {
  id: number;
  name: string;
  description: string | null;
  status: number;
  created_at: string | null;
  created_by: number | null;
  updated_at: string | null;
  updated_by: number | null;
};

type RoleForm = {
  name: string;
  description: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const allowedRoles = ["admin", "staff"];

function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<RoleForm>({
    name: "",
    description: "",
  });

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("token");

  // =========================
  // GET ROLES
  // =========================

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/roles`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil data role"
        );
      }

      const data = Array.isArray(result.data)
        ? result.data.filter((role: Role) =>
            allowedRoles.includes(role.name.toLowerCase())
          )
        : [];

      setRoles(data);
    } catch (err: any) {
      setError(
        err.message || "Terjadi kesalahan saat mengambil role"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // =========================
  // SEARCH
  // =========================

  const filteredRoles = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return roles.filter((role) => {
      return (
        role.name.toLowerCase().includes(keyword) ||
        (role.description || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [roles, search]);

  // =========================
  // STATISTICS
  // =========================

  const totalRoles = roles.length;

  const adminRoles = roles.filter(
    (role) => role.name.toLowerCase() === "admin"
  ).length;

  const staffRoles = roles.filter(
    (role) => role.name.toLowerCase() === "staff"
  ).length;

  // =========================
  // ADD MODAL
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
  // EDIT MODAL
  // =========================

  const openEditModal = (role: Role) => {
    setEditingId(role.id);

    setForm({
      name: allowedRoles.includes(role.name.toLowerCase())
        ? role.name.toLowerCase()
        : "staff",
      description: role.description || "",
    });

    setFormError("");
    setShowModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setFormError("");

    setForm({
      name: "",
      description: "",
    });
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
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

    const roleName = form.name.trim().toLowerCase();

    if (!roleName) {
      setFormError("Nama role wajib dipilih.");
      return;
    }

    if (!allowedRoles.includes(roleName)) {
      setFormError(
        "Role yang tersedia hanya Admin dan Staff."
      );
      return;
    }

    try {
      setSaving(true);

      const body = {
        name: roleName === "admin" ? "admin" : "staff",
        description: form.description.trim() || null,
      };

      const url = editingId
        ? `${API_URL}/api/roles/${editingId}`
        : `${API_URL}/api/roles`;

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
          result.message || "Gagal menyimpan role"
        );
      }

      await fetchRoles();
      closeModal();
    } catch (err: any) {
      setFormError(
        err.message || "Terjadi kesalahan saat menyimpan role."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <section className="roles-section">
        <div className="roles-state">
          <div className="loading-spinner"></div>

          <h3>Memuat role...</h3>

          <p>
            Data role sedang diambil dari server.
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
      <section className="roles-section">
        <div className="roles-state error-state">
          <div className="state-icon">!</div>

          <h3>Gagal memuat role</h3>

          <p>{error}</p>

          <button
            className="retry-button"
            onClick={fetchRoles}
          >
            Coba Lagi
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="roles-section">
      {/* HEADER */}

      <div className="roles-header">
        <div>
          <div className="page-label">MASTER DATA</div>

          <h2>Role</h2>

          <p>
            Kelola role pengguna yang digunakan dalam sistem POS.
          </p>
        </div>

        <button
          className="add-role-button"
          onClick={openAddModal}
        >
          <span>+</span>
          Tambah Role
        </button>
      </div>

      {/* STATISTICS */}

      <div className="role-stats">
        <div className="role-stat-card">
          <div className="stat-icon role-main-icon">
            R
          </div>

          <div>
            <span>Total Role</span>
            <strong>{totalRoles}</strong>
          </div>
        </div>

        <div className="role-stat-card">
          <div className="stat-icon admin-icon">
            A
          </div>

          <div>
            <span>Admin</span>
            <strong>{adminRoles}</strong>
          </div>
        </div>

        <div className="role-stat-card">
          <div className="stat-icon staff-icon">
            S
          </div>

          <div>
            <span>Staff</span>
            <strong>{staffRoles}</strong>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div className="roles-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Cari role atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* EMPTY */}

      {roles.length === 0 ? (
        <div className="roles-state empty-state">
          <div className="state-icon">R</div>

          <h3>Belum ada role</h3>

          <p>
            Belum ada role Admin atau Staff di database.
          </p>

          <button
            className="add-role-button"
            onClick={openAddModal}
          >
            <span>+</span>
            Tambah Role
          </button>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className="roles-state empty-state">
          <div className="state-icon">⌕</div>

          <h3>Role tidak ditemukan</h3>

          <p>
            Tidak ada role yang sesuai dengan pencarian.
          </p>
        </div>
      ) : (
        <div className="roles-table-card">
          <div className="table-top">
            <div>
              <h3>Daftar Role</h3>

              <span>
                Menampilkan {filteredRoles.length} dari{" "}
                {roles.length} role
              </span>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="roles-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Role</th>
                  <th>Deskripsi</th>
                  <th>Dibuat</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {filteredRoles.map((role) => (
                  <tr key={role.id}>
                    <td>
                      <span className="role-id">
                        #{role.id}
                      </span>
                    </td>

                    <td>
                      <div className="role-name-cell">
                        <div className="role-avatar">
                          {role.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>{role.name}</strong>

                          <small>
                            Role #{role.id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="description-text">
                        {role.description || "-"}
                      </span>
                    </td>

                    <td>
                      <span className="created-date">
                        {role.created_at
                          ? new Date(
                              role.created_at
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
                      <div className="role-actions">
                        <button
                          className="edit-role-button"
                          onClick={() =>
                            openEditModal(role)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-role-button"
                          disabled
                          title="Role utama tidak dapat dihapus"
                        >
                          Hapus
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
          className="role-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="role-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="modal-label">
                  {editingId ? "EDIT DATA" : "MASTER DATA"}
                </span>

                <h3>
                  {editingId ? "Edit Role" : "Tambah Role"}
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

              {/* ROLE */}

              <div className="form-group">
                <label htmlFor="role-name">
                  Nama Role <span>*</span>
                </label>

                <select
                  id="role-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">
                    Pilih role
                  </option>

                  <option value="admin">
                    Admin
                  </option>

                  <option value="staff">
                    Staff
                  </option>
                </select>
              </div>

              {/* DESCRIPTION */}

              <div className="form-group">
                <label htmlFor="role-description">
                  Deskripsi
                </label>

                <textarea
                  id="role-description"
                  name="description"
                  rows={4}
                  placeholder="Masukkan deskripsi role..."
                  value={form.description}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>

              {/* ACTION */}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-role-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="save-role-button"
                  disabled={saving}
                >
                  {saving
                    ? "Menyimpan..."
                    : editingId
                    ? "Simpan Perubahan"
                    : "Tambah Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default Roles;