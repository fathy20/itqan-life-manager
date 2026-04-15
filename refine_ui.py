import os
import re

def refine_home():
    path = 'src/pages/HomeScreen.tsx'
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()

    # 1. Update ModuleCard styling with smooth hover and glass
    # Look for the style object in ModuleCard
    old_card_style = r'style=\{\{\s*gridColumn: isLarge \? "span 2" : "span 1",\s*position: "relative", cursor: "pointer", overflow: "hidden",\s*borderRadius: 16, padding: isLarge \? "28px 32px" : "22px 20px",\s*background: hovered \? `\$\{mod\.color\}0A` : "rgba\(15, 23, 42, 0\.7\)", backdropFilter: "blur\(12px\)",\s*border: `1px solid \$\{hovered \? mod\.color \+ "40" : "rgba\(51, 65, 85, 0\.4\)\"\}`,.*?\}\}'
    
    new_card_style = """className={`glass-card glass-card-hover ${isLarge ? 'p-8 col-span-2' : 'p-6 col-span-1'}`}
      style={{
        position: "relative", cursor: "pointer", overflow: "hidden",
        background: hovered ? `${mod.color}15` : "rgba(15, 23, 42, 0.4)",
        border: `1px solid ${hovered ? mod.color + "60" : "rgba(255, 255, 255, 0.05)"}`,
        boxShadow: hovered ? `0 20px 40px -20px ${mod.color}40` : "none",
        opacity: 0,
        animation: `cardIn 0.5s cubic-bezier(.4,0,.2,1) ${index * 0.05}s forwards`,
      }}"""
    
    c = re.sub(old_card_style, new_card_style, c, flags=re.DOTALL)

    # 2. Add a premium glow to the greeting and stats
    c = c.replace(
        "greeting} يا {loading ? '...' : displayName}",
        "greeting} يا <span className='premium-gradient-text' style={{ fontWeight: 800 }}>{loading ? '...' : displayName}</span>"
    )

    # 3. Add background decorative elements
    bg_decor = """
      {/* Premium Background Decor */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(139, 92, 246, 0.05) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>
    """
    if bg_decor not in c:
        c = c.replace('      <div style={{ position: "relative", zIndex: 1,', bg_decor + '\n      <div style={{ position: "relative", zIndex: 1,')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)

def refine_subscreens():
    files = ['WorkScreen.tsx', 'FinanceScreen.tsx', 'HealthScreen.tsx', 'StudyScreen.tsx', 'FocusScreen.tsx', 'IntelligenceScreen.tsx']
    for filename in files:
        path = f'src/pages/{filename}'
        if not os.path.exists(path): continue
        with open(path, 'r', encoding='utf-8') as f:
            c = f.read()
        
        # Consistent Card background in sub-screens
        c = c.replace('background: CARD', 'className="glass-card" style={{ background: "rgba(15, 23, 42, 0.4)" }}')
        
        # Improve Tab styling
        c = re.sub(
            r"(background: tab === t\.id \? ACCENT \+ \"15\" : )CARD",
            r"\1 'transparent'",
            c
        )
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)

refine_home()
refine_subscreens()
print("UI Refinement complete.")
