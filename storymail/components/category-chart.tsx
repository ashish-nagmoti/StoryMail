"use client"

export function CategoryChart() {
  const data = [
    { name: "Productivity", count: 67, color: "#3b82f6" },
    { name: "Newsletters", count: 45, color: "#10b981" },
    { name: "Office", count: 32, color: "#8b5cf6" },
    { name: "Scam", count: 12, color: "#ef4444" },
  ]

  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const percentage = (item.count / total) * 100
        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                {item.count} ({percentage.toFixed(1)}%)
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                }}
              ></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
