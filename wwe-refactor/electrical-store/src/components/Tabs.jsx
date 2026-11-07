/**
 * Category tab row — shared by the Home "New Arrivals" section and the Shop
 * page. Pages pass categories loaded from GET /api/categories
 * ({ key, name }), optionally prefixed with their own "All" entry; without a
 * prop the static catalogue tabs are used.
 */
const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "iot", label: "IoT & Wireless" },
  { key: "robotics", label: "Robotics" },
  { key: "displays", label: "Displays" },
  { key: "tools", label: "Tools" },
]

export default function Tabs({ active, onChange, categories = CATEGORIES }) {
  return (
    <div className="tabs">
      {categories.map((c) => (
        <button
          key={c.key}
          className={`tab${active === c.key ? " active" : ""}`}
          onClick={() => onChange(c.key)}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}
