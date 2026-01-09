import { useEffect, useState } from "react";
import { categories, defaultConfig } from "../lib/data";

/* =========================
   Utils
========================= */
function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

/* =========================
   IndexedDB Helpers
========================= */
async function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("SembakoDB", 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveProductsToDB(products: any[]) {
  const db = await openDB();
  const tx = db.transaction("products", "readwrite");
  const store = tx.objectStore("products");
  products.forEach((p) => store.put(p));
  await new Promise((res) => (tx.oncomplete = res));
}

async function getProductsFromDB(): Promise<any[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("products", "readonly");
    const store = tx.objectStore("products");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function clearProductsDB() {
  const db = await openDB();
  const tx = db.transaction("products", "readwrite");
  tx.objectStore("products").clear();
  await new Promise((res) => (tx.oncomplete = res));
}

/* =========================
   Component
========================= */
export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchAndSyncProducts(forceRefresh = false) {
    setLoading(true);

    if (forceRefresh) {
      await clearProductsDB();
    }

    let dbProducts = await getProductsFromDB();

    if (dbProducts.length === 0) {
      const res = await fetch(
        "https://kalnaf-coresys.vercel.app/api/products/import/sheet",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer kalnaf-secret-token",
          },
          body: JSON.stringify({
            sheetsName: "product",
            dataX: "A1",
            dataY: "J",
          }),
        }
      );

      const result = await res.json();

      dbProducts = result.data.map((p: any, index: number) => ({
        id: `${p.sku}-${index}`,
        name: p.name,
        category: p.category ?? "Lainnya",
        unit: p.unit,
        price: p.price,
        stock: p.stock > 0 ? "Tersedia" : "Habis",
      }));

      await saveProductsToDB(dbProducts);
    }

    setProducts(dbProducts);
    setLoading(false);
  }

  useEffect(() => {
    fetchAndSyncProducts();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "Semua" || p.category === selectedCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const {
    store_name,
    store_tagline,
    search_placeholder,
    background_color,
    card_color,
    primary_color,
    text_color,
    accent_color,
    font_family,
    font_size,
  } = defaultConfig;

  return (
    <div
      style={{
        backgroundColor: background_color,
        color: text_color,
        fontFamily: font_family,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: primary_color,
          padding: "24px 20px",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h1
            style={{
              color: "white",
              fontSize: font_size * 1.75,
              fontWeight: 700,
              margin: 0,
            }}
          >
            {store_name}
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: font_size * 0.875,
              margin: 0,
            }}
          >
            {store_tagline}
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ maxWidth: 480, margin: "16px auto", padding: "0 20px" }}>
        <div
          style={{
            background: card_color,
            borderRadius: 12,
            padding: "12px 16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <input
            type="text"
            placeholder={search_placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: font_size,
              color: text_color,
              flex: 1,
            }}
          />
        </div>
      </div>

      {/* Refresh Button */}
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto 16px",
          padding: "0 20px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={() => fetchAndSyncProducts(true)}
          disabled={loading}
          style={{
            background: "rgb(16 154 185);",
            color: "white",
            border: "none",
            borderRadius: "50%",
            fontSize: "12px",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 1000,
            width: 64,
            height: 64,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {/* Icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: loading ? "spin 1s linear infinite" : "none",
            }}
          >
            <path d="M21 12a9 9 0 1 1-3-6.7" />
            <polyline points="21 3 21 9 15 9" />
          </svg>

          {/* Text */}
          <span>{loading ? "Memuat" : "Refresh"}</span>

          {/* Inline keyframes */}
          <style>
            {`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}
          </style>
        </button>
      </div>

      {/* Category */}
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "0 20px 16px",
          display: "flex",
          gap: 8,
          overflowX: "auto",
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              background:
                selectedCategory === cat ? primary_color : card_color,
              color: selectedCategory === cat ? "white" : text_color,
              padding: "8px 16px",
              borderRadius: 20,
              border:
                selectedCategory === cat
                  ? "none"
                  : `2px solid ${primary_color}`,
              fontSize: font_size * 0.875,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 24px" }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: font_size * 3, marginBottom: 16 }}>🔍</div>
            <p style={{ opacity: 0.6 }}>Produk tidak ditemukan</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} style={{
              background: card_color,
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: font_size * 1.125, fontWeight: 600, margin: "0 0 4px 0" }}>{product.name}</h3>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: font_size * 0.75, color: "white", background: primary_color, padding: "2px 8px", borderRadius: 4 }}>{product.category}</span>
                    <span style={{ fontSize: font_size * 0.75, color: text_color, opacity: 0.6 }}>{product.unit}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: font_size * 1.375, fontWeight: 700, color: accent_color }}>{formatPrice(product.price)}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 12 }}>
                <span style={{ fontSize: font_size * 0.875, color: product.stock === "Tersedia" ? accent_color : "#f59e0b", fontWeight: 500 }}>● {product.stock}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
