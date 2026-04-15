import os
import re

def fix_syntax_errors():
    files = ['WorkScreen.tsx', 'FinanceScreen.tsx', 'HealthScreen.tsx', 'StudyScreen.tsx', 'FocusScreen.tsx', 'IntelligenceScreen.tsx']
    for filename in files:
        path = f'src/pages/{filename}'
        if not os.path.exists(path): continue
        with open(path, 'r', encoding='utf-8') as f:
            c = f.read()
        
        # Correct the botched replacement:
        # Before: style={{ className="glass-card" style={{ background: "rgba(15, 23, 42, 0.4)" }}, backdropFilter: ... }}
        # After: className="glass-card" style={{ background: "rgba(15, 23, 42, 0.4)", backdropFilter: ... }}
        
        c = c.replace('style={{ className="glass-card" style={{ background: "rgba(15, 23, 42, 0.4)" }}', 'className="glass-card" style={{ background: "rgba(15, 23, 42, 0.4)"')
        
        # If there are double closures like }}, }}
        c = c.replace('}}, backdropFilter', ', backdropFilter')
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)

fix_syntax_errors()
print("Syntax fixed.")
