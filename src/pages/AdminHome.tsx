import { useState } from "react";
import "./AdminHome.css";

import Products from "./Products";
import Users from "./Users";
import Categories from "./Categories";
import Taxes from "./Taxes";
import Roles from "./Roles";

type Menu =
  | "dashboard"
  | "products"
  | "users"
  | "categories"
  | "taxes"
  | "roles";

function AdminHome() {
  const [menu, setMenu] = useState<Menu>("dashboard");

  const userData = localStorage.getItem("user");

  let user: {
    username?: string;
    email?: string;
    role?: string;
  } | null = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.reload();
  };

  const getTitle = () => {
    switch (menu) {
      case "products":
        return "Produk";

      case "users":
        return "User";

      case "categories":
        return "Kategori";

      case "taxes":
        return "Tax";

      case "roles":
        return "Role";

      default:
        return "Dashboard";
    }
  };

  const getDescription = () => {
    switch (menu) {
      case "products":
        return "Kelola data produk dan stok.";

      case "users":
        return "Kelola pengguna yang terdaftar di sistem.";

      case "categories":
        return "Kelola kategori produk.";

      case "taxes":
        return "Kelola data pajak.";

      case "roles":
        return "Kelola role pengguna.";

      default:
        return "Kelola data dan konfigurasi POS.";
    }
  };

  const renderContent = () => {
    switch (menu) {
      case "products":
        return <Products />;

      case "users":
        return <Users />;

      case "categories":
        return <Categories />;

      case "taxes":
        return <Taxes />;

      case "roles":
        return <Roles />;

      case "dashboard":
      default:
        return (
          <div className="dashboard-content">
            <section className="dashboard-intro">
              <p className="dashboard-eyebrow">ADMIN</p>

              <h2>
                Selamat datang, {user?.username || "Admin"}
              </h2>

              <p>
                Gunakan menu di sebelah kiri untuk mengelola
                data pada sistem POS.
              </p>
            </section>

            <section className="dashboard-section">
              <div className="section-heading">
                <div>
                  <h3>Master Data</h3>

                  <p>
                    Akses data yang dapat dikelola dari dashboard.
                  </p>
                </div>
              </div>

              <div className="dashboard-menu-list">
                <button
                  className="dashboard-menu-item"
                  onClick={() => setMenu("products")}
                >
                  <div className="menu-item-number">01</div>

                  <div className="menu-item-content">
                    <strong>Produk</strong>

                    <span>
                      Produk, harga, kategori, dan stok.
                    </span>
                  </div>

                  <span className="menu-item-arrow">→</span>
                </button>

                <button
                  className="dashboard-menu-item"
                  onClick={() => setMenu("users")}
                >
                  <div className="menu-item-number">02</div>

                  <div className="menu-item-content">
                    <strong>User</strong>

                    <span>
                      Data pengguna dan akun sistem.
                    </span>
                  </div>

                  <span className="menu-item-arrow">→</span>
                </button>

                <button
                  className="dashboard-menu-item"
                  onClick={() => setMenu("categories")}
                >
                  <div className="menu-item-number">03</div>

                  <div className="menu-item-content">
                    <strong>Kategori</strong>

                    <span>
                      Pengelompokan kategori produk.
                    </span>
                  </div>

                  <span className="menu-item-arrow">→</span>
                </button>

                <button
                  className="dashboard-menu-item"
                  onClick={() => setMenu("taxes")}
                >
                  <div className="menu-item-number">04</div>

                  <div className="menu-item-content">
                    <strong>Tax</strong>

                    <span>
                      Pengaturan pajak yang digunakan POS.
                    </span>
                  </div>

                  <span className="menu-item-arrow">→</span>
                </button>

                <button
                  className="dashboard-menu-item"
                  onClick={() => setMenu("roles")}
                >
                  <div className="menu-item-number">05</div>

                  <div className="menu-item-content">
                    <strong>Role</strong>

                    <span>
                      Pengaturan role pengguna.
                    </span>
                  </div>

                  <span className="menu-item-arrow">→</span>
                </button>
              </div>
            </section>
          </div>
        );
    }
  };

  const menuButtonClass = (item: Menu) => {
    return menu === item
      ? "sidebar-button active"
      : "sidebar-button";
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="brand-mark">P</div>

          <div>
            <h2>POS</h2>
            <span>Administration</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div className="sidebar-group">
            <p className="sidebar-label">MAIN</p>

            <button
              className={menuButtonClass("dashboard")}
              onClick={() => setMenu("dashboard")}
            >
              <span className="sidebar-icon">D</span>
              <span>Dashboard</span>
            </button>
          </div>

          <div className="sidebar-group">
            <p className="sidebar-label">MASTER DATA</p>

            <button
              className={menuButtonClass("products")}
              onClick={() => setMenu("products")}
            >
              <span className="sidebar-icon">P</span>
              <span>Produk</span>
            </button>

            <button
              className={menuButtonClass("users")}
              onClick={() => setMenu("users")}
            >
              <span className="sidebar-icon">U</span>
              <span>User</span>
            </button>

            <button
              className={menuButtonClass("categories")}
              onClick={() => setMenu("categories")}
            >
              <span className="sidebar-icon">K</span>
              <span>Kategori</span>
            </button>

            <button
              className={menuButtonClass("taxes")}
              onClick={() => setMenu("taxes")}
            >
              <span className="sidebar-icon">T</span>
              <span>Tax</span>
            </button>

            <button
              className={menuButtonClass("roles")}
              onClick={() => setMenu("roles")}
            >
              <span className="sidebar-icon">R</span>
              <span>Role</span>
            </button>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-account">
            <div className="account-avatar">
              {(user?.username || "A")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="account-info">
              <strong>
                {user?.username || "Admin"}
              </strong>

              <span>Administrator</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Keluar
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>{getTitle()}</h1>

            <p>{getDescription()}</p>
          </div>
        </header>

        <div className="admin-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default AdminHome;