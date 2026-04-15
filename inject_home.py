import os
import re
f = 'src/pages/HomeScreen.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()

# Add import
if 'useCrossModuleInsights' not in c:
    c = c.replace('import { useHomeNew } from "../hooks/useHomeNew";', 'import { useHomeNew } from "../hooks/useHomeNew";\nimport { useCrossModuleInsights } from "../core/hooks/useCrossModuleInsights";\nimport { Sparkles as SparklesIcon, AlertCircle } from "lucide-react";')

# Call hook inside component
if 'const { insights } = useCrossModuleInsights();' not in c:
    c = c.replace('const [searchFocused, setSearchFocused] = useState(false);', 'const [searchFocused, setSearchFocused] = useState(false);\n  const { insights } = useCrossModuleInsights();')

# Inject Daily Brief Hero Card before Module Grid
brief_card = """
        {/* Daily Brief */}
        {insights.length > 0 && (
          <div style={{ background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(12px)", border: "1px solid rgba(51, 65, 85, 0.4)", borderLeft: "4px solid #08A7E7", borderRadius: 16, padding: 24, marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-start", animation: "slideDown 0.6s ease" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#08A7E715", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <SparklesIcon color="#08A7E7" size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#E8EBF0", margin: "0 0 4px", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>الاستنتاج الذكي (Cross-Module)</h3>
              <div style={{ fontSize: 14, color: "#94A3B8", fontFamily: "'Noto Kufi Arabic', sans-serif" }}>
                {insights[0].description} 
                {insights[0].actionable && <span onClick={() => handleModuleClick(insights[0].actionPath || "intelligence")} style={{ color: "#08A7E7", fontWeight: 700, cursor: "pointer", marginRight: 8, textDecoration: "underline" }}>اتخذ إجراء</span>}
              </div>
            </div>
          </div>
        )}

        {/* Module Grid */}
"""

c = c.replace('{/* Module Grid */}', brief_card)

with open(f, 'w', encoding='utf-8') as file:
    file.write(c)
