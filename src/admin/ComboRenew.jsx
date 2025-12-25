import React, { useEffect, useState } from "react"; 
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import './ComboRenewCard.css'; // CSS cho bảng, nút và modal

dayjs.extend(utc);
dayjs.extend(timezone);

function ComboRenew() {
  const [rentals, setRentals] = useState([]);
  const [editingRental, setEditingRental] = useState(null);
  const [editData, setEditData] = useState({ rentalTime: '', roomCode: '', requestedExtendMonths: '' });
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUsername, setFilterUsername] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRentalData, setNewRentalData] = useState({ username: "", tabs: 1, months: 1 });
  const [selectedRentals, setSelectedRentals] = useState([]);
  const [extendModal, setExtendModal] = useState({ show: false, months: 1 });
  const [detailModal, setDetailModal] = useState(null);
  const [compensateDays, setCompensateDays] = useState(1);

  const token = localStorage.getItem("token");
  const API_BASE = "https://api.tabtreo.com"; 

  useEffect(() => {
    fetchRentals();
    const interval = setInterval(fetchRentals, 5000);
    return () => clearInterval(interval);
  }, []);


  
const compensateTime = async (rentalIds, days) => {
  try {
    const minutes = days * 24 * 60;

    // Chỉ lấy đơn còn hạn
    const validIds = rentals
      .filter(r =>
        rentalIds.includes(r.id) &&
        r.status === "active" &&
        dayjs(r.expiresAt).isAfter(dayjs())
      )
      .map(r => r.id);

    if (validIds.length === 0) {
      return toast.info("Không có đơn còn hạn để bù giờ");
    }

    await Promise.all(
      validIds.map(id =>
        axios.patch(
          `${API_BASE}/rentals/${id}/compensate`,
          { compensateMinutes: minutes },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      )
    );

    toast.success(`✅ Đã bù ${days} ngày cho ${validIds.length} đơn còn hạn`);
    fetchRentals();
  } catch (err) {
    console.error(err);
    toast.error("❌ Bù thời gian thất bại");
  }
};

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    const validIds = rentals
      .filter(r =>
        r.status === "active" &&
        dayjs(r.expiresAt).isAfter(dayjs())
      )
      .map(r => r.id);

    setSelectedRentals(validIds);
  } else {
    setSelectedRentals([]);
  }
};

const handleCompensateSelected = () => {
  const validIds = rentals
    .filter(r =>
      selectedRentals.includes(r.id) &&
      r.status === "active" &&
      dayjs(r.expiresAt).isAfter(dayjs())
    )
    .map(r => r.id);

  if (validIds.length === 0)
    return toast.info("Không có đơn active còn hạn");

  if (
    !window.confirm(
      `Bù ${compensateDays} ngày cho ${validIds.length} đơn đã chọn?`
    )
  )
    return;

  compensateTime(validIds, compensateDays);
};

// --- Thêm hàm tính thời gian còn lại ---
const getRemainingTime = (rental) => {
  if (!rental.expiresAt) return "0 phút";
  const rentalEnd = dayjs(rental.expiresAt).tz("Asia/Bangkok");
  const now = dayjs().tz("Asia/Bangkok");
  const diffMinutes = rentalEnd.diff(now, "minute");
  if (diffMinutes <= 0) return "Hết hạn";
  const days = Math.floor(diffMinutes / (24 * 60));
  const hours = Math.floor((diffMinutes % (24 * 60)) / 60);
  const minutes = diffMinutes % 60;
  let result = "";
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;
  return result.trim();
};


  const fetchRentals = async () => {
    try {
      const endpoint = localStorage.getItem("userLevel") >= 10 ? "/admin/rentals" : "/rentals";
      const res = await axios.get(`${API_BASE}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
      setRentals(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải danh sách rentals");
    }
  };

  const formatMinutesToHours = (minutes) => {
    if (!minutes || minutes <= 0) return "0 giờ";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`;
  };

  const handleUpdateStatus = async (id, status, action = null) => {
    try {
      await axios.patch(`${API_BASE}/rentals/${id}`, { status, action }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRentals();
      toast.success("Đã cập nhật rental!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật status");
    }
  };

  const handleConfirmExtend = async (id) => {
    try {
      await axios.patch(`${API_BASE}/rentals/${id}/confirm-extend`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchRentals();
      toast.success("Đã xác nhận gia hạn!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xác nhận gia hạn");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa đơn này?")) return;
    try {
      await axios.delete(`${API_BASE}/rentals/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchRentals();
      toast.success("Đã xóa rental!");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi xóa rental");
    }
  };

  const handleChangeTab = (rental) => {
    if (!rental.roomCode) {
      toast.warn("Phòng chưa có room code, vui lòng liên hệ admin support!");
      return;
    }
    toast.info("Chức năng đang phát triển, vui lòng liên hệ admin support");
  };

  const handleEditClick = (rental) => {
    setEditingRental(rental);
    setEditData({
      username: rental.username,
      rentalTime: rental.rentalTime,
      roomCode: rental.roomCode || '',
      requestedExtendMonths: rental.requestedExtendMonths || '',
      expiresAt: rental.expiresAt ? rental.expiresAt.slice(0,16) : "",
      status: rental.status,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      const months = Number(editData.requestedExtendMonths) || 0;
      const oldExpiresAt = new Date(editData.expiresAt).getTime();
      const extendMinutes = months * 30 * 24 * 60;
      const newExpiresAt = new Date(oldExpiresAt + extendMinutes * 60000).toISOString();
      await axios.patch(`${API_BASE}/rentals/${editingRental.id}`, {
        username: editData.username,
        roomCode: editData.roomCode,
        rentalTime: Number(editData.rentalTime),
        expiresAt: newExpiresAt,
        requestedExtendMonths: null,
        status: editData.status,
      }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRentals();
      setEditingRental(null);
      toast.success("✅ Đã cập nhật rental!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Lỗi khi cập nhật rental");
    }
  };
  const handleEditCancel = () => setEditingRental(null);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewRentalData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async () => {
    const { username, tabs, months } = newRentalData;
    if (!username || tabs < 1 || months < 1) return toast.warn("Vui lòng nhập đầy đủ thông tin hợp lệ!");
    try {
      await axios.post(`${API_BASE}/rentals`, { username, tabs, months }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Tạo ${tabs} đơn thành công!`);
      setShowCreateModal(false);
      setNewRentalData({ username: "", tabs: 1, months: 1 });
      fetchRentals();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi tạo đơn thuê");
    }
  };

  const handleSelectRental = (id) => {
    setSelectedRentals(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const calculateTotalPrice = (selectedRentalObjects, months = 1) => {
    const comboPrices = [{ tabs: 5, price: 600000 }, { tabs: 3, price: 400000 }];
    const basePrice = 150000;
    let total = 0;
    const normalizedObjects = selectedRentalObjects.map(r => ({ ...r, pricePerTab: r.pricePerTab < basePrice ? basePrice : r.pricePerTab }));
    let normalTabs = normalizedObjects.filter(r => r.pricePerTab === basePrice).length;
    const sortedCombos = [...comboPrices].sort((a,b) => b.tabs - a.tabs);
    for(const combo of sortedCombos){
      const count = Math.floor(normalTabs / combo.tabs);
      total += count * combo.price;
      normalTabs %= combo.tabs;
    }
    total += normalTabs * basePrice;
    total += normalizedObjects.filter(r => r.pricePerTab !== basePrice).reduce((sum,r)=>sum+r.pricePerTab,0);
    return total * months;
  };

  const openExtendModal = () => {
    if(selectedRentals.length === 0) return toast.info("Chọn ít nhất 1 đơn để gia hạn!");
    const invalid = rentals.filter(r=>selectedRentals.includes(r.id) && !["active","expired"].includes(r.status));
    if(invalid.length > 0) return toast.warning(`Có ${invalid.length} đơn chưa xác nhận hoặc đang chờ duyệt!`);
    setExtendModal({ show:true, months:1 });
  };
  const closeExtendModal = () => setExtendModal({ show:false, months:1 });

const handleConfirmExtendCombo = async () => {
  if(selectedRentals.length === 0) return;
  const months = extendModal.months;
  try {
    // 1️⃣ Gửi request-extend
    await Promise.all(
      selectedRentals.map(id =>
        axios.post(`${API_BASE}/rentals/${id}/request-extend`, {
          requestedExtendMonths: months,
          extendTimeInMinutes: months * 30 * 24 * 60
        }, { headers: { Authorization: `Bearer ${token}` } })
      )
    );
    toast.info("Đang gửi yêu cầu gia hạn...");

    // 2️⃣ Sleep 2 giây (có thể thêm animation loading)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3️⃣ Gọi confirm-extend (hàm admin confirm)
    await Promise.all(
      selectedRentals.map(id =>
        axios.patch(`${API_BASE}/rentals/${id}/confirm-extend`, {}, { headers: { Authorization: `Bearer ${token}` } })
      )
    );

    // 4️⃣ Cập nhật UI
    toast.success("✅ Đã gửi yêu cầu và xác nhận gia hạn thành công!");
    setSelectedRentals([]);
    setExtendModal({ show:false, months:1 });
    fetchRentals();
  } catch(err) {
    console.error(err);
    toast.error("❌ Gia hạn thất bại!");
  }
};


  const filteredRentals = rentals.filter(r => 
    (filterStatus==="all"||r.status===filterStatus) &&
    r.username.toLowerCase().includes(filterUsername.toLowerCase())
  );

  const selectedRentalObjects = selectedRentals.map(id=>rentals.find(r=>r.id===id)).filter(Boolean);
  const totalPrice = calculateTotalPrice(selectedRentalObjects, extendModal.months);

  return (
    <div className="rentals-container">
      <h2>Gia Hạn Combo</h2>

      {/* Filter + tạo */}
      <div className="filter-bar">
        <div className="filter-left" style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
          <input type="text" placeholder="Tìm username..." value={filterUsername} onChange={e=>setFilterUsername(e.target.value)} style={{flex:'1 1 150px', minWidth:'120px'}}/>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{flex:'1 1 150px', minWidth:'120px'}}>
            <option value="all">Tất cả</option>
            <option value="pending">Đang chờ xác nhận</option>
            <option value="active">Đơn đang chạy</option>
            <option value="expired">Đơn hết hạn</option>
            <option value="retrieved">Đã thu hồi</option>
            <option value="pending_extend">Yêu cầu gia hạn</option>
            <option value="pending_change_tab">Yêu cầu đổi tab</option>
          </select>
        </div>
        <button className="btn-extend-combo" onClick={openExtendModal} disabled={selectedRentals.length===0}>
          Gia hạn combo ({selectedRentals.length} đơn)
        </button>
        <div className="admin-toolbar">
          {/* checkbox chọn tất cả */}
          <label>
            <input type="checkbox" onChange={toggleSelectAll} />
            Chọn tất cả
          </label>

          {/* bù giờ */}
          <div className="compensate-box">
            <select
              value={compensateDays}
              onChange={e => setCompensateDays(Number(e.target.value))}
            >
              <option value={1}>Bù 1 ngày</option>
              <option value={2}>Bù 2 ngày</option>
              <option value={3}>Bù 3 ngày</option>
            </select>

            <button
              className="btn-compensate"
              onClick={handleCompensateSelected}
              disabled={selectedRentals.length === 0}
            >
              Bù giờ (bảo trì)
            </button>
          </div>
        </div>

      </div>

      <div className="card-list">
        {filteredRentals.map(r => (
          <div key={r.id} className={`rental-card ${r.status==="expired"?"expired":""}`}>
            <div className="card-summary">
              <input type="checkbox" checked={selectedRentals.includes(r.id)} onChange={()=>handleSelectRental(r.id)}/>
              <div><strong>ID:</strong> {r.id}</div>
              <div><strong>User:</strong> {r.username}</div>
              <div><strong>Còn lại:</strong> {getRemainingTime(r)}</div>
              <div style={{display:'flex', gap:'16px', alignItems:'center'}}>
                <div><strong>Giá/Tab:</strong> {r.pricePerTab?.toLocaleString() || 0} VND</div>
                <div><strong>Status:</strong> {r.status}</div>
              </div>
              <button className="toggle-detail-btn" onClick={()=>setDetailModal(r)}>
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL MODAL */}
      {detailModal && (
        <div className="modal-overlay" onClick={()=>setDetailModal(null)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h3>Chi tiết Rental ID {detailModal.id}</h3>
            <p><strong>ID:</strong> {detailModal.id}</p>
            <p><strong>User ID:</strong> {detailModal.userId}</p>
            <p><strong>Username:</strong> {detailModal.username}</p>
            <p><strong>Room Code:</strong> {detailModal.roomCode || "-"}</p>
            <p><strong>Thời gian thuê:</strong> {formatMinutesToHours(detailModal.rentalTime)}</p>
            <p><strong>Còn lại:</strong> {getRemainingTime(detailModal)}</p>
            <p><strong>Hết Hạn Lúc:</strong> {detailModal.expiresAt || "-"}</p>
            <p><strong>Giá/Tab:</strong> {detailModal.pricePerTab?.toLocaleString() || 0} VND</p>
            <p><strong>Status:</strong> {detailModal.status}</p>
            <div style={{marginTop:"10px"}}>
              <strong>Bù thời gian:</strong>
              <div style={{display:"flex", gap:"8px", marginTop:"6px"}}>
                <button onClick={()=>compensateTime([detailModal.id], 1)}>+1 ngày</button>
                <button onClick={()=>compensateTime([detailModal.id], 2)}>+2 ngày</button>
                <button onClick={()=>compensateTime([detailModal.id], 3)}>+3 ngày</button>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={()=>setDetailModal(null)}>Đóng</button>
              <button className="btn-save" onClick={()=>{ setEditingRental(detailModal); setDetailModal(null); }}>Sửa</button>
            </div>
          </div>
        </div>
      )}


      {/* CREATE, EDIT, EXTEND MODAL giữ nguyên như trước */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={()=>setShowCreateModal(false)}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h3>Tạo Rental mới</h3>
            <label>Username:<input type="text" name="username" value={newRentalData.username} onChange={handleCreateChange}/></label>
            <label>Số tabs:<input type="number" name="tabs" value={newRentalData.tabs} min="1" onChange={handleCreateChange}/></label>
            <label>Số tháng:<input type="number" name="months" value={newRentalData.months} min="1" onChange={handleCreateChange}/></label>
            <div className="modal-actions">
              <button className="btn-save" onClick={handleCreateSubmit}>Tạo</button>
              <button className="btn-cancel" onClick={()=>setShowCreateModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {editingRental && (
        <div className="modal-overlay" onClick={handleEditCancel}>
          <div className="modal-content" onClick={e=>e.stopPropagation()}>
            <h3>Sửa Rental ID {editingRental.id}</h3>
            <label>Username:<input type="text" name="username" value={editData.username||""} onChange={handleEditChange}/></label>
            <label>Thời gian thuê (phút):<input type="number" name="rentalTime" value={editData.rentalTime} onChange={handleEditChange}/></label>
            <label>Room Code:<input type="text" name="roomCode" value={editData.roomCode} onChange={handleEditChange}/></label>
            <label>Hết hạn lúc:<input type="datetime-local" name="expiresAt" value={editData.expiresAt} onChange={handleEditChange}/></label>
            <label>Gia hạn (tháng):<input type="number" name="requestedExtendMonths" value={editData.requestedExtendMonths} onChange={handleEditChange}/></label>
            <label>Status:
              <select name="status" value={editData.status||editingRental.status} onChange={handleEditChange}>
                <option value="pending">Đang chờ xác nhận</option>
                <option value="active">Đơn đang chạy</option>
                <option value="expired">Đơn hết hạn</option>
                <option value="retrieved">Đã thu hồi</option>
                <option value="pending_extend">Yêu cầu gia hạn</option>
                <option value="pending_change_tab">Yêu cầu đổi tab</option>
              </select>
            </label>
            <div className="modal-actions">
              <button className="btn-save" onClick={handleEditSubmit}>Lưu</button>
              <button className="btn-cancel" onClick={handleEditCancel}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      {extendModal.show && (
        <div className="qr-modal" onClick={closeExtendModal}>
          <div className="qr-content" onClick={e=>e.stopPropagation()}>
            <h3>Gia hạn combo ({selectedRentals.length} đơn)</h3>
            <label>Số tháng:</label>
            <select value={extendModal.months} onChange={e=>setExtendModal({...extendModal, months:Number(e.target.value)})}>
              {[...Array(12)].map((_,i)=><option key={i+1} value={i+1}>{i+1} tháng</option>)}
            </select>
            <p>Tổng tiền: <strong>{totalPrice.toLocaleString()} VND</strong></p>
            <img src="/images/qrthanhtoan.png" alt="QR thanh toán" style={{width:"300px"}}/>
            <div style={{marginTop:"10px", display:'flex', gap:'10px', justifyContent:'flex-end'}}>
              <button onClick={handleConfirmExtendCombo}>Xác nhận</button>
              <button onClick={closeExtendModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000}/>
    </div>
  );
}

export default ComboRenew;
