"use client"

interface CategoryData {
  [key: string]: number;
}

interface CategoryChartProps {
  categoryData?: CategoryData;
}

export function CategoryChart({ categoryData }: CategoryChartProps) {
  // Default data (used if no data is provided)
  const defaultData = [
    { name: "Productivity", count: 67, color: "#3b82f6" },
    { name: "Newsletters", count: 45, color: "#10b981" },
    { name: "Office", count: 32, color: "#8b5cf6" },
    { name: "Scam", count: 12, color: "#ef4444" },
  ]

  // Color mapping for categories
  const categoryColors: Record<string, string> = {
    productivity: "#3b82f6", // blue
    newsletters: "#10b981", // green
    work: "#8b5cf6",        // purple
    scam: "#ef4444",        // red
    other: "#f59e0b"        // amber/orange
  };

  // Transform the API data into the format we need, or use default if not available
  const data = categoryData 
    ? Object.entries(categoryData).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize category name
        count,
        color: categoryColors[name.toLowerCase()] || "#6b7280" // Use predefined color or gray if not found
      }))
    : defaultData;

  // Sort data by count in descending order
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  // Calculate the total across all categories
  const total = sortedData.reduce((sum, item) => sum + item.count, 0);

  // Don't display if no data or total is zero
  if (!sortedData.length || total === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No category data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedData.map((item, index) => {
        const percentage = (item.count / total) * 100;
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
