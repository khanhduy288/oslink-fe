import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VoucherPage.css";

const API_BASE = "https://api.tabtreo.com";

const emptyForm = {
  code: "",
  discountPercent: 10,
  maxUses: "",
  expiresAt: "",
};

function VoucherPage() {
  const [vouchers, setVouchers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [ctvs, setCtvs] = useState([]);
  const [ctvPhone, setCtvPhone] = useState("");
  const [loadingCTV, setLoadingCTV] = useState(false);
  const token = localStorage.getItem("token");

  const api = axios.create({
    baseURL: API_BASE,
    headers: { Authorization: `Bearer ${token}` },
  });

useEffect(() => {
  fetchVouchers();
  fetchCTVs();
}, []);

  /* ================= READ ================= */
  const fetchVouchers = async () => {
    const res = await api.get("/admin/vouchers");
    setVouchers(res.data);
  };

/* ================= CTV ================= */
const fetchCTVs = async () => {
  const res = await api.get("/admin/ctvs");
  setCtvs(res.data);
};

const addCTV = async () => {
  if (!ctvPhone) return alert("Nhập số điện thoại");
  setLoadingCTV(true);
  try {
    await api.post("/admin/ctvs", { phone: ctvPhone });
    setCtvPhone("");
    fetchCTVs();
  } catch (err) {
    alert(err.response?.data?.message || "Không thêm được CTV");
  } finally {
    setLoadingCTV(false);
  }
};

const revokeCTV = async (id) => {
  if (!window.confirm("Gỡ quyền CTV?")) return;
  await api.patch(`/admin/ctvs/${id}/revoke`);
  fetchCTVs();
};

  /* ================= CREATE ================= */
  const createVoucher = async () => {
    await api.post("/admin/vouchers", {
      code: form.code,
      discountPercent: Number(form.discountPercent),
      expiresAt: form.expiresAt || null,
      maxUses: form.maxUses || null,
    });
  };

  /* ================= UPDATE ================= */
  const updateVoucher = async () => {
    await api.patch(`/admin/vouchers/${editing.id}`, {
      isActive: editing.is_active,
      discountPercent: Number(form.discountPercent),
      expiresAt: form.expiresAt || null,
      maxUses: form.maxUses || null,
    });
  };

  /* ================= DELETE ================= */
  const deleteVoucher = async (id) => {
    if (!window.confirm("Xóa voucher này?")) return;
    await api.delete(`/admin/vouchers/${id}`);
    fetchVouchers();
  };

  /* ================= TOGGLE ================= */
  const toggleVoucher = async (v) => {
    await api.patch(`/admin/vouchers/${v.id}`, {
      isActive: v.is_active ? 0 : 1,
      discountPercent: v.discount_percent,
      expiresAt: v.expires_at,
      maxUses: v.max_uses,
    });
    fetchVouchers();
  };

  /* ================= SUBMIT ================= */
  const submit = async () => {
    try {
      if (editing) await updateVoucher();
      else await createVoucher();

      closeModal();
      fetchVouchers();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi xử lý voucher");
    }
  };

  /* ================= MODAL ================= */
  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditing(v);
    setForm({
      code: v.code,
      discountPercent: v.discount_percent,
      maxUses: v.max_uses || "",
      expiresAt: v.expires_at ? v.expires_at.slice(0, 16) : "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  return (
    <div className="voucher-page">
      <div className="voucher-header">
        <h2>🎟️ Quản lý Voucher</h2>
        <button className="btn-primary" onClick={openCreate}>
          + Tạo voucher
        </button>
      </div>

      <div className="voucher-card">
        <table className="voucher-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Giảm</th>
              <th>Lượt dùng</th>
              <th>Hết hạn</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {vouchers.map(v => (
              <tr key={v.id}>
                <td className="code">{v.code}</td>
                <td>{v.discount_percent}%</td>
                <td>{v.used_count}/{v.max_uses ?? "∞"}</td>
                <td>
                  {v.expires_at
                    ? new Date(v.expires_at).toLocaleString("vi-VN")
                    : "—"}
                </td>
                <td>
                  <span className={`status ${v.is_active ? "active" : "inactive"}`}>
                    {v.is_active ? "Hoạt động" : "Khoá"}
                  </span>
                </td>
                <td className="actions">
                  <button className="edit" onClick={() => openEdit(v)}>Sửa</button>
                  <button className="toggle" onClick={() => toggleVoucher(v)}>
                    {v.is_active ? "Khoá" : "Mở"}
                  </button>
                  <button className="danger" onClick={() => deleteVoucher(v.id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="voucher-header" style={{ marginTop: 40 }}>
  <h2>👥 Quản lý CTV</h2>
</div>

<div className="voucher-card">
  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
    <input
      placeholder="Nhập SĐT user"
      value={ctvPhone}
      onChange={(e) => setCtvPhone(e.target.value)}
    />
    <button className="btn-primary" onClick={addCTV} disabled={loadingCTV}>
      + Thêm CTV
    </button>
  </div>

  <table className="voucher-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>SĐT</th>
        <th>Username</th>
        <th>Level</th>
        <th>Hành động</th>
      </tr>
    </thead>
    <tbody>
      {ctvs.map(u => (
        <tr key={u.id}>
          <td>{u.id}</td>
          <td>{u.phone}</td>
          <td>{u.username}</td>
          <td>
            <span className="status active">CTV</span>
          </td>
          <td>
            <button
              className="danger"
              onClick={() => revokeCTV(u.id)}
            >
              Gỡ CTV
            </button>
          </td>
        </tr>
      ))}
      {ctvs.length === 0 && (
        <tr>
          <td colSpan="5" style={{ textAlign: "center", opacity: 0.6 }}>
            Chưa có CTV
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>{editing ? "Sửa voucher" : "Tạo voucher"}</h3>

            <input
              placeholder="Mã voucher"
              disabled={!!editing}
              value={form.code}
              onChange={e => setForm({ ...form, code: e.target.value })}
            />

            <input
              type="number"
              placeholder="Giảm (%)"
              value={form.discountPercent}
              onChange={e => setForm({ ...form, discountPercent: e.target.value })}
            />

            <input
              type="number"
              placeholder="Số lượt dùng (trống = vô hạn)"
              value={form.maxUses}
              onChange={e => setForm({ ...form, maxUses: e.target.value })}
            />

            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={e => setForm({ ...form, expiresAt: e.target.value })}
            />

            <div className="modal-actions">
              <button onClick={closeModal}>Hủy</button>
              <button className="btn-primary" onClick={submit}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoucherPage;
