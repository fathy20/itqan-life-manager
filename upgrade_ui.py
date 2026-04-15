import os
import re

files = {
    'src/pages/WorkScreen.tsx': ('نظام العمل', 'WORK ENGINE', 'Briefcase', '#F97316'),
    'src/pages/FinanceScreen.tsx': ('نظام الماليات', 'FINANCE ENGINE', 'Wallet', '#10B981'),
    'src/pages/HealthScreen.tsx': ('الصحة والعادات', 'HEALTH ENGINE', 'Heart', '#EC4899'),
    'src/pages/StudyScreen.tsx': ('أكاديمية الإتقان', 'STUDY ENGINE', 'GraduationCap', '#8B5CF6'),
    'src/pages/FocusScreen.tsx': ('نظام التركيز', 'FOCUS ENGINE', 'Timer', '#FB923C')
}

for path, (title_ar, title_en, icon, brand_color) in files.items():
    if not os.path.exists(path): continue
    
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()

    # 1. Update ACCENT color for true premium feel if requested, but wait, keeping original ACCENT variable is safer for the logic
    # Just redefining it won't break things. Let's keep existing ACCENT but redefine its color.
    c = re.sub(r'const ACCENT = ".*?";', f'const ACCENT = "{brand_color}";', c)

    # 2. Inject SystemLogo inside the main function export
    # e.g., export default function WorkScreen({ onBack }: ...) {
    logo_component = f"""
  const SystemLogo = () => (
    <div style={{{{
      width: 40, height: 40, borderRadius: "12px",
      background: `linear-gradient(135deg, ${{ACCENT}}, ${{ACCENT}}80)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 8px 16px ${{ACCENT}}30`
    }}}}>
      <{icon} color="white" size={{20}} />
    </div>
  );
"""
    if "SystemLogo = ()" not in c:
        c = re.sub(r'(export default function \w+\(.*?\)\s*\{)', r'\1\n' + logo_component, c)

    # 3. Replace the old Header with the Premium Header
    premium_header = f"""
      {{/* Header */}}
      <header style={{{{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "24px 40px", borderBottom: `1px solid ${{BORDER}}`, background: "rgba(2, 6, 23, 0.8)",
        backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 100
      }}}}>
        <button onClick={{onBack}} style={{{{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600 }}}}>
          <ArrowLeft size={{18}} /> الرئيسية
        </button>
        <div style={{{{ display: "flex", alignItems: "center", gap: 12 }}}}>
          <div style={{{{ textAlign: "right" }}}}>
            <h1 style={{{{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Noto Kufi Arabic', sans-serif", color: "#F1F5F9" }}}}>{title_ar}</h1>
            <p style={{{{ fontSize: "10px", color: ACCENT, letterSpacing: "2px", fontWeight: 700, margin: 0 }}}}>{title_en}</p>
          </div>
          <SystemLogo />
        </div>
      </header>
"""
    # Find the old header block which usually starts with ` {/* Header */}` or `<div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px"` ... and ends with `</div>` right before `<div style={{ maxWidth: 900`
    
    # Let's use regex to match from `{/* Header */}` up to the matching closing `</div>` block before `<div style={{ maxWidth`
    # Or just replace the specific string chunk
    # The old structure is typically:
    # {/* Header */}
    # <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", ... }}>
    #   ...
    # </div>
    #
    # <div style={{ maxWidth: 900
    subbed = re.sub(
        r'\{\/\*\s*Header\s*\*\/\}.*?</div>(?=\s*<div style=\{\{\s*maxWidth:\s*900)',
        premium_header,
        c,
        flags=re.DOTALL
    )
    
    if subbed == c:
        # Some don't have {/* Header */}, just search for the div
        subbed = re.sub(
            r'<div style=\{\{\s*display:\s*"flex",\s*alignItems:\s*"center",\s*gap:\s*12,\s*padding:\s*"16px 24px",.*?</button>.*?</div>(?=\s*<div style=\{\{\s*maxWidth:\s*900)',
            premium_header,
            c,
            flags=re.DOTALL
        )

    # 4. In `HealthScreen.tsx` and others, if there are custom missing icons in import, we should make sure GraduationCap/Heart/Wallet/Briefcase are imported if they are not already.
    # Just do a rough inject if not found
    if icon not in subbed:
        subbed = subbed.replace('import {', f'import {{\n  {icon},', 1)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(subbed)

print("Upgrade complete!")
