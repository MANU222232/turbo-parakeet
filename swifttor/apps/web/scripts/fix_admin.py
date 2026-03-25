
import os

filepath = r"c:\Users\PC\OneDrive\Desktop\towing\SWIFTTOW\swifttor\apps\web\app\admin\page.tsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the updateDoc call with fetch
old_pattern = """try {
                                await updateDoc(doc(db, '
requests', req.id), {
                                  photos: arrayUnion(url)
                                });"""

# Actually, the raw output showed weird breaks. Let's use a more flexible replacement.
import re

# This regex targets the updateDoc call regardless of the weird line breaks I saw in the terminal
pattern = r'await\s+updateDoc\(doc\(db,\s+[\'"]requests[\'"],\s+req\.id\),\s+\{\s+photos:\s+arrayUnion\(url\)\s+\}\);'

new_content = re.sub(pattern, 
    'const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"; await fetch(`${apiUrl}/api/v1/orders/${req.id}/photos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });', 
    content, flags=re.MULTILINE)

# Also replace setCustomPhotoUrls if it matches the weird breaks
pattern2 = r'setCustomPhotoUrls\(prev\s+=\s+>\s+\(\{\s+\.\.\.prev,\s+\[req\.id\]:\s+\'\'\s+\}\)\);'
new_content = re.sub(pattern2, "setCustomPhotoUrls(prev => ({ ...prev, [req.id]: '' }));", new_content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replacement complete.")
