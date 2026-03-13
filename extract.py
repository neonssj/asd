import re

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

style_pattern = re.compile(r'<style>(.*?)</style>', re.DOTALL)
styles = style_pattern.findall(content)

script_pattern = re.compile(r'<script>(.*?)</script>', re.DOTALL)
scripts = script_pattern.findall(content)

combined_style = "\n".join(styles).strip()
combined_script = "\n".join(scripts).strip()

with open("src/style.css", "w", encoding="utf-8") as f:
    f.write(combined_style)

with open("src/main.js", "w", encoding="utf-8") as f:
    f.write(combined_script)

content = re.sub(r'<style>.*?</style>\n?', '', content, flags=re.DOTALL)
content = re.sub(r'<script>.*?</script>\n?', '', content, flags=re.DOTALL)

if '<link rel="stylesheet" href="/src/style.css">' not in content:
    content = content.replace('</head>', '  <link rel="stylesheet" href="/src/style.css">\n</head>')

if '<script type="module" src="/src/main.js"></script>' not in content:
    content = content.replace('</body>', '<script type="module" src="/src/main.js"></script>\n</body>')

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Extraction script complete.")
