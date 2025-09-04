```jsx
import { useState, useEffect } from "react";
import Papa from "papaparse";

export default function UserAccessDashboard() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://raw.githubusercontent.com/Arlo777/licenses-dashboard/refs/heads/main/licenses.csv")
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => setData(result.data),
        });
      })
      .catch((err) => console.error("Ошибка загрузки CSV:", err));
  }, []);

  const filtered = data.filter((row) => {
    const firstCol = row[Object.keys(row)[0]];
    return firstCol?.toLowerCase().includes(query.toLowerCase());
  });

  const checkIcon = (val) => {
    if (!val || val.trim() === "") return "❌";
    return "✅";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Доступ пользователей к приложениям
      </h1>
      <input
        type="text"
        placeholder="Поиск по email или имени..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ marginBottom: "20px", padding: "8px", width: "100%" }}
      />
      {data.length === 0 ? (
        <p>Загрузка данных...</p>
      ) : (
        <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {Object.keys(data[0]).map((col, i) => (
                <th key={i}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i}>
                {Object.keys(row).map((col, j) => (
                  <td key={j}>
                    {col.toLowerCase().includes("user") ? row[col] : checkIcon(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```
