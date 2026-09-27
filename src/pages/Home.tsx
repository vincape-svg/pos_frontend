import { useEffect, useState } from "react";
import "./Home.css";

interface Product {
  id: number;
  category_id: number;
  category_name: string;
  product_name: string;
  image: string | null;
  price: string;
  stock: number;
  status: number;
  created_at: string;
  created_by: number;
  updated_at: string | null;
  updated_by: number | null;
}

interface SelectedProduct {
  product: Product;
  quantity: number;
}

interface HomeProps {
  onPay: (products: SelectedProduct[]) => void;
  onHistory: () => void;
}

const API_URL = "https://atrium-expensive-horse.abasthan.app";

function Home({ onPay, onHistory }: HomeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getProducts = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Token login tidak ditemukan");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/products`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengambil data produk"
        );
      }

      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.error("GET PRODUCTS ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data produk"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const increaseQuantity = (product: Product) => {
    setQuantities((prev) => {
      const currentQuantity = prev[product.id] || 0;

      if (currentQuantity >= product.stock) {
        return prev;
      }

      return {
        ...prev,
        [product.id]: currentQuantity + 1,
      };
    });
  };

  const decreaseQuantity = (product: Product) => {
    setQuantities((prev) => {
      const currentQuantity = prev[product.id] || 0;

      if (currentQuantity <= 1) {
        const newQuantities = { ...prev };
        delete newQuantities[product.id];
        return newQuantities;
      }

      return {
        ...prev,
        [product.id]: currentQuantity - 1,
      };
    });
  };

  const selectedProducts: SelectedProduct[] = products
    .filter((product) => (quantities[product.id] || 0) > 0)
    .map((product) => ({
      product,
      quantity: quantities[product.id],
    }));

  const totalItems = selectedProducts.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = selectedProducts.reduce(
    (total, item) =>
      total + Number(item.product.price) * item.quantity,
    0
  );

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (image: string | null) => {
    if (!image) {
      return null;
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${API_URL}/uploads/products/${image}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.reload();
  };

  const handlePay = () => {
    if (selectedProducts.length === 0) {
      return;
    }

    onPay(selectedProducts);
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-brand">
          <div className="home-brand-mark">P</div>

          <div>
            <h1>POS Kasir</h1>
            <p>Penjualan</p>
          </div>
        </div>

        <div className="home-header-actions">
          <button
            type="button"
            className="home-history-button"
            onClick={onHistory}
          >
            Riwayat Transaksi
          </button>

          <button
            type="button"
            className="home-logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="cashier-layout">
        <section className="products-section">
          <div className="products-section-header">
            <div>
              <span className="page-label">PENJUALAN</span>

              <h2>Produk</h2>

              <p>Pilih produk untuk membuat transaksi.</p>
            </div>

            <div className="product-count">
              {products.length} produk
            </div>
          </div>

          {loading && (
            <div className="home-state">
              <div className="loading-spinner"></div>
              <p>Memuat produk...</p>
            </div>
          )}

          {!loading && error && (
            <div className="home-state error-state">
              <div className="state-icon">!</div>

              <h3>Gagal memuat produk</h3>

              <p>{error}</p>

              <button
                type="button"
                className="retry-button"
                onClick={getProducts}
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="home-state">
              <div className="state-icon">P</div>

              <h3>Belum ada produk</h3>

              <p>Produk belum tersedia.</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="home-product-grid">
              {products.map((product) => {
                const quantity = quantities[product.id] || 0;
                const isSelected = quantity > 0;
                const isOutOfStock = product.stock <= 0;
                const imageUrl = getImageUrl(product.image);

                return (
                  <div
                    className={
                      isSelected
                        ? "home-product-card selected"
                        : "home-product-card"
                    }
                    key={product.id}
                  >
                    <div className="home-product-image">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={product.product_name}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";

                            const fallback =
                              event.currentTarget.nextElementSibling;

                            if (fallback) {
                              fallback.classList.add("show");
                            }
                          }}
                        />
                      )}

                      <div
                        className={
                          imageUrl
                            ? "image-fallback"
                            : "image-fallback show"
                        }
                      >
                        <span>
                          {product.product_name
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="product-info">
                      <div className="product-category">
                        {product.category_name || "Tanpa kategori"}
                      </div>

                      <h3>{product.product_name}</h3>

                      <strong className="product-price">
                        {formatRupiah(Number(product.price))}
                      </strong>

                      <p className="product-stock">
                        Stok {product.stock}
                      </p>
                    </div>

                    {isOutOfStock ? (
                      <div className="out-of-stock">
                        Stok Habis
                      </div>
                    ) : (
                      <div className="quantity-control">
                        <button
                          type="button"
                          onClick={() => decreaseQuantity(product)}
                          disabled={quantity === 0}
                        >
                          −
                        </button>

                        <span>{quantity}</span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(product)}
                          disabled={quantity >= product.stock}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <aside className="cart-section">
          <div className="cart-header">
            <div>
              <span className="page-label">TRANSAKSI</span>

              <h2>Pesanan</h2>
            </div>

            {totalItems > 0 && (
              <span className="cart-item-count">
                {totalItems} item
              </span>
            )}
          </div>

          <div className="cart-content">
            {selectedProducts.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">+</div>

                <h3>Belum ada produk</h3>

                <p>
                  Pilih produk dari daftar untuk menambahkannya
                  ke transaksi.
                </p>
              </div>
            ) : (
              <div className="cart-list">
                {selectedProducts.map((item) => {
                  const imageUrl = getImageUrl(item.product.image);

                  return (
                    <div
                      className="cart-item"
                      key={item.product.id}
                    >
                      <div className="cart-item-image">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product.product_name}
                          />
                        ) : (
                          <span>
                            {item.product.product_name
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="cart-item-info">
                        <strong>
                          {item.product.product_name}
                        </strong>

                        <span>
                          {item.quantity} ×{" "}
                          {formatRupiah(
                            Number(item.product.price)
                          )}
                        </span>
                      </div>

                      <strong className="cart-item-total">
                        {formatRupiah(
                          Number(item.product.price) *
                            item.quantity
                        )}
                      </strong>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Total</span>

              <strong>{formatRupiah(totalPrice)}</strong>
            </div>

            <button
              type="button"
              className="pay-button"
              onClick={handlePay}
              disabled={selectedProducts.length === 0}
            >
              Bayar
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default Home;