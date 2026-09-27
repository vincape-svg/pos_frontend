import "./Bill.css";
import image1 from "../assets/image1.png";

interface Transaction {
  id: number;
  user_id: number;
  username: string;

  total_before_discount: number | string | null;
  discount: number | string | null;
  total_after_discount: number | string | null;

  total_before_tax: number | string | null;
  tax_id: number | null;
  tax_name: string | null;
  tax_rate: number | string | null;
  tax_amount: number | string | null;

  total_after_tax: number | string | null;

  payment: number | string | null;
  payment_method: string | null;
  change: number | string | null;

  status: number;
  created_at: string;
}

interface TransactionProduct {
  id: number;
  transaction_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number | string;
  subtotal: number | string;
}

interface BillProps {
  transaction: Transaction;
  products: TransactionProduct[];
  onBack: () => void;
}

function Bill({
  transaction,
  products,
  onBack,
}: BillProps) {
  const formatRupiah = (
    value: number | string | null
  ) => {
    const numberValue = Number(value) || 0;

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numberValue);
  };

  const formatDate = (
    date: string
  ) => {
    return new Date(date).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bill-page">

      <div className="bill">

        {/* LOGO */}
        <div className="bill-logo">
          <img
            src={image1}
            alt="Logo"
          />
        </div>

        {/* HEADER */}
        <div className="bill-header">
          <h1>STRUK PEMBAYARAN</h1>

          <p>
            Terima kasih sudah berbelanja
          </p>
        </div>

        <div className="bill-divider">
          --------------------------------
        </div>

        {/* INFORMASI TRANSAKSI */}
        <div className="bill-info">

          <div className="bill-info-row">
            <span>No. Transaksi</span>
            <strong>
              #{transaction.id}
            </strong>
          </div>

          <div className="bill-info-row">
            <span>Tanggal</span>
            <span>
              {formatDate(
                transaction.created_at
              )}
            </span>
          </div>

          <div className="bill-info-row">
            <span>Kasir</span>
            <span>
              {transaction.username}
            </span>
          </div>

        </div>

        <div className="bill-divider">
          --------------------------------
        </div>

        {/* PRODUK */}
        <div className="bill-products">

          {products.length === 0 ? (
            <p className="bill-empty">
              Tidak ada produk
            </p>
          ) : (
            products.map((product) => (
              <div
                className="bill-product"
                key={product.id}
              >

                <div className="bill-product-name">
                  {product.product_name}
                </div>

                <div className="bill-product-detail">
                  <span>
                    {product.quantity} x{" "}
                    {formatRupiah(
                      product.price
                    )}
                  </span>

                  <strong>
                    {formatRupiah(
                      product.subtotal
                    )}
                  </strong>
                </div>

              </div>
            ))
          )}

        </div>

        <div className="bill-divider">
          --------------------------------
        </div>

        {/* TOTAL */}
        <div className="bill-summary">

          <div className="bill-summary-row">
            <span>Subtotal</span>

            <span>
              {formatRupiah(
                transaction.total_before_discount
              )}
            </span>
          </div>

          <div className="bill-summary-row">
            <span>Diskon</span>

            <span>
              -{" "}
              {formatRupiah(
                transaction.discount
              )}
            </span>
          </div>

          <div className="bill-summary-row">
            <span>
              Pajak
              {transaction.tax_rate
                ? ` (${transaction.tax_rate}%)`
                : ""}
            </span>

            <span>
              {formatRupiah(
                transaction.tax_amount
              )}
            </span>
          </div>

          <div className="bill-total-row">
            <strong>TOTAL</strong>

            <strong>
              {formatRupiah(
                transaction.total_after_tax
              )}
            </strong>
          </div>

        </div>

        <div className="bill-divider">
          --------------------------------
        </div>

        {/* PEMBAYARAN */}
        <div className="bill-payment">

          <div className="bill-summary-row">
            <span>Metode</span>

            <span>
              {transaction.payment_method ||
                "-"}
            </span>
          </div>

          <div className="bill-summary-row">
            <span>Dibayar</span>

            <span>
              {formatRupiah(
                transaction.payment
              )}
            </span>
          </div>

          <div className="bill-summary-row">
            <span>Kembalian</span>

            <span>
              {formatRupiah(
                transaction.change
              )}
            </span>
          </div>

        </div>

        <div className="bill-footer">
          <p>Terima kasih</p>
          <p>Silakan datang kembali</p>
        </div>

      </div>

      {/* BUTTON */}
      <div className="bill-actions no-print">

        <button
          type="button"
          className="bill-back-button"
          onClick={onBack}
        >
          Kembali
        </button>

        <button
          type="button"
          className="bill-print-button"
          onClick={handlePrint}
        >
          Cetak Struk
        </button>

      </div>

    </div>
  );
}

export default Bill;