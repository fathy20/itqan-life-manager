import os
import re

files = [
    'src/pages/WorkScreen.tsx', 
    'src/pages/FinanceScreen.tsx', 
    'src/pages/HealthScreen.tsx', 
    'src/pages/StudyScreen.tsx', 
    'src/pages/FocusScreen.tsx'
]

for f in files:
    if not os.path.exists(f): 
        print(f"Skipping {f}, doesn't exist")
        continue

    print(f"Processing {f}...")
    with open(f, 'r', encoding='utf-8') as file:
        c = file.read()
    
    # 1. Base colors
    c = c.replace('const BG = "#000E30";', 'const BG = "#020617";')
    c = c.replace('const CARD = "#0A1628";', 'const CARD = "rgba(15, 23, 42, 0.7)";')
    c = c.replace('const BORDER = "#0F2847";', 'const BORDER = "rgba(51, 65, 85, 0.4)";')
    
    # 2. Add glassmorphism blur where CARD is used as background in a style object
    c = re.sub(r'(background:\s*CARD\s*,)', r'\1 backdropFilter: "blur(12px)",', c)
    
    # 3. Add glassmorphism to Header
    c = re.sub(
        r'(borderBottom:\s*`1px solid \$\{BORDER\}`\s*,\s*position:\s*"sticky"\s*,\s*top:\s*0\s*,\s*background:\s*)BG(\s*,\s*zIndex:\s*10)', 
        r'\1"rgba(2, 6, 23, 0.8)", backdropFilter: "blur(20px)"\2', 
        c
    )

    with open(f, 'w', encoding='utf-8') as file:
        file.write(c)

print("Done updating CSS styles for Glassmorphism!")
