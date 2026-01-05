#!/bin/bash

# 1. Add import
sed -i '' '/import { IntegrationsHub }/a\
import { CompactTimer } from "./components/CompactTimer";
' src/App.tsx

# 2. Add state  
sed -i '' '/const \[showAIChat, setShowAIChat\] = useState(false);/a\
  const [isCompactMode, setIsCompactMode] = useState(false);
' src/App.tsx

# 3. Change gap
sed -i '' 's/gap-12 mb-28/gap-6 mb-28/g' src/App.tsx

# 4. Add button
awk '/\{isRunning \? <Pause.*fill="#000" \/> : <Play.*className="ml-1" \/>\}/ { print; print "                    </button>"; print ""; print "                    <button"; print "                      onClick={() => setIsCompactMode(true)}"; print "                      className=\"p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-white/5\""; print "                      title=\"Compact Mode\""; print "                      style={{ border: `1px solid ${accent}30` }}"; print "                    >"; print "                      <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke={accent} strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\">"; print "                        <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/>"; print "                        <path d=\"M9 3v18\"/>"; print "                        <path d=\"m14 9 3 3-3 3\"/>"; print "                      </svg>"; getline; next } 1' src/App.tsx > src/App.tsx.tmp && mv src/App.tsx.tmp src/App.tsx

# 5. Add conditional wrapper
sed -i '' '/{\/\* ========== PREMIUM SIDEBAR ========== \*\//i\
        {!isCompactMode \&\& (\
          <>
' src/App.tsx

# 6. Find where to close and add CompactTimer
python3 << 'EOFPYTHON'
with open("src/App.tsx", "r") as f:
    lines = f.readlines()

output = []
in_coach = False
coach_end_found = False

for i, line in enumerate(lines):
    output.append(line)
    
    # Look for the closing of Zenner Coach section
    if "showCoach &&" in line:
        in_coach = True
    
    if in_coach and line.strip() == "}" and i + 1 < len(lines) and "</div >" in lines[i+1]:
        # This is the closing brace before </div>
        output.append("          </>\n")
        output.append("        )}\n")
        output.append("\n")
        output.append("      {/* Compact Timer */}\n")
        output.append("      {isCompactMode && (\n")
        output.append("        <CompactTimer\n")
        output.append("          timeLeft={timeLeft}\n")
        output.append("          isRunning={isRunning}\n")
        output.append("          mode={mode}\n")
        output.append("          accent={colors.accent}\n")
        output.append("          onToggleTimer={() => setIsRunning(!isRunning)}\n")
        output.append("          onExpand={() => {\n")
        output.append("            setIsCompactMode(false);\n")
        output.append("            setView('home');\n")
        output.append("          }}\n")
        output.append("          onClose={() => setIsCompactMode(false)}\n")
        output.append("        />\n")
        output.append("      )}\n")
        coach_end_found = True
        break

# Write the rest
if coach_end_found:
    output.extend(lines[i+1:])

with open("src/App.tsx", "w") as f:
    f.writelines(output)
EOFPYTHON

echo "✅ Done!"
