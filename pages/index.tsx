import { useState } from "react";
import { categories, defaultConfig, products } from "../lib/data";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(price);
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "Semua" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
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
    font_size
  } = defaultConfig;

  return (
    <div
      style={{
        backgroundColor: background_color,
        color: text_color,
        fontFamily: font_family,
        minHeight: "100vh"
      }}
    >
      {/* Header */}
      <div style={{
        background: primary_color,
        padding: "24px 20px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <h1 style={{ color: "white", fontSize: font_size * 1.75, fontWeight: 700, margin: 0 }}>{store_name}</h1>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: font_size * 0.875, margin: 0 }}>{store_tagline}</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ maxWidth: 480, margin: "16px auto", padding: "0 20px" }}>
        <div style={{
          background: card_color,
          borderRadius: 12,
          padding: "12px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={text_color} strokeWidth={2}>
            <circle cx={11} cy={11} r={8}></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
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
              flex: 1
            }}
          />
        </div>
      </div>

      {/* Category */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 16px", display: "flex", gap: 8, overflowX: "auto" }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              background: selectedCategory === cat ? primary_color : card_color,
              color: selectedCategory === cat ? "white" : text_color,
              padding: "8px 16px",
              borderRadius: 20,
              border: selectedCategory === cat ? "none" : `2px solid ${primary_color}`,
              fontSize: font_size * 0.875,
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap"
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
            <p style={{ fontSize: font_size * 1.125, color: text_color, opacity: 0.6 }}>Produk tidak ditemukan</p>
          </div>
        ) : filteredProducts.map(product => (
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
              <button style={{
                background: primary_color,
                color: "white",
                border: "none",
                padding: "8px 20px",
                borderRadius: 8,
                fontSize: font_size * 0.875,
                fontWeight: 600,
                cursor: "pointer"
              }}>Tambah</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
