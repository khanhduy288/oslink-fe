import React, { useEffect, useState } from "react";
import axios from "axios";

function Users() {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  const API_BASE = "https://api.tabtreo.com"; // <-- URL backend mới

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/admin/users`, // dùng biến API_BASE
        {
          headers: { Authorization: `Bearer ${token}` }, // gửi token admin
        }
      );
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách users");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;
    try {
      await axios.delete(
        `${API_BASE}/admin/users/${id}`, // dùng biến API_BASE
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa user");
    }
  };

  return (
    <div>
      <h2>Quản lý Users</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Phone</th>
            <th>Level</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.phone}</td>
              <td>{u.level}</td>
              <td>
                <button onClick={() => handleDelete(u.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Users;
