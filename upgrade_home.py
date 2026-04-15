import os
import re

f = 'src/pages/HomeScreen.tsx'
if os.path.exists(f):
    with open(f, 'r', encoding='utf-8') as file:
        c = file.read()
    
    # Base colors
    c = c.replace('const BG = "#000E30";', 'const BG = "#020617";')
    c = c.replace('"#000E30"', '"#020617"')
    
    c = c.replace('"#0A1628"', '"rgba(15, 23, 42, 0.7)"')
    c = c.replace('"#0A162880"', '"rgba(15, 23, 42, 0.9)"')
    
    c = c.replace('"#0F2847"', '"rgba(51, 65, 85, 0.4)"')
    
    # Add glassmorphism blur to module cards
    c = re.sub(
        r'(background:\s*hovered \? `\$\{mod\.color\}0A` :\s*"rgba\(15, 23, 42, 0\.7\)"\s*,)', 
        r'\1 backdropFilter: "blur(12px)",', 
        c
    )
    
    # Apply glassmorphism to search and top cards
    c = re.sub(
        r'(background:\s*(?:searchFocused \? "rgba\(15, 23, 42, 0\.9\)" : )?"rgba\(15, 23, 42, 0\.7\)"\s*,)',
        r'\1 backdropFilter: "blur(12px)",',
        c
    )

    with open(f, 'w', encoding='utf-8') as file:
        file.write(c)
        
    print("HomeScreen styles upgraded.")
