import React, { useEffect, useState } from "react";

function ActionsEditor() {
  const [actions, setActions] = useState([]);

  // Lấy actions từ backend
  useEffect(() => {
    fetch("http://localhost:5001/actions")
      .then((res) => res.json())
      .then((data) => setActions(data))
      .catch((err) => console.error(err));
  }, []);

  // Thêm 1 action mới
  const addAction = () => {
    setActions([...actions, { type: "click", x: 0, y: 0 }]);
  };

  // Cập nhật 1 action
  const updateAction = (idx, key, value) => {
    const newActions = [...actions];
    newActions[idx][key] = value;
    setActions(newActions);
  };

  // Lưu lại backend
  const saveActions = () => {
    fetch("http://localhost:5001/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actions),
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h2>Actions Editor</h2>
      <button onClick={addAction}>Thêm action</button>
      <ul>
        {actions.map((action, idx) => (
          <li key={idx}>
            <input
              value={action.type}
              onChange={(e) => updateAction(idx, "type", e.target.value)}
            />
            X:{" "}
            <input
              type="number"
              value={action.x || 0}
              onChange={(e) => updateAction(idx, "x", Number(e.target.value))}
            />
            Y:{" "}
            <input
              type="number"
              value={action.y || 0}
              onChange={(e) => updateAction(idx, "y", Number(e.target.value))}
            />
          </li>
        ))}
      </ul>
      <button onClick={saveActions}>Lưu</button>
    </div>
  );
}

export default ActionsEditor;
