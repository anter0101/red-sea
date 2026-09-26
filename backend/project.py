import os
from pathlib import Path

# ===== إعدادات المشروع =====
PROJECT_DIR = "./src"  # غيّر لمجلد مشروعك
OUTPUT_DIR = "project_snapshot"  # المجلد اللي هيتم حفظ الملفات فيه
IGNORE_DIRS = ["node_modules", "dist", "venv", ".env"]
EXTENSIONS = [".ts", ".js"]

# ===== تصنيف الملفات حسب النوع =====
FILE_CATEGORIES = {
    "entities": ["entity"],
    "dtos": ["dto"],
    "mappers": ["mapper"],
    "modules": ["module"],
    "services": ["service"],
    "controllers": ["controller"],  # ✅ جديد
    "enums": ["enum"],
    "others": []  # الملفات اللي مش مطابقة لأي فئة
}

# إنشاء مجلد الإخراج
Path(OUTPUT_DIR).mkdir(exist_ok=True)

# دالة لتحديد الفئة
def categorize_file(filename):
    lname = filename.lower()
    for category, keywords in FILE_CATEGORIES.items():
        for kw in keywords:
            if kw in lname:
                return category
    return "others"

# تجميع الملفات حسب الفئة
files_by_category = {cat: [] for cat in FILE_CATEGORIES.keys()}

for root, dirs, files in os.walk(PROJECT_DIR):
    # تجاهل مجلدات معينة
    dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]

    for file in files:
        if any(file.endswith(ext) for ext in EXTENSIONS):
            category = categorize_file(file)
            files_by_category[category].append(os.path.join(root, file))

# كتابة الملفات في مجلد الإخراج حسب الفئة
for category, files in files_by_category.items():
    category_file = os.path.join(OUTPUT_DIR, f"{category}.txt")
    with open(category_file, "w", encoding="utf-8") as outfile:
        for file_path in files:
            outfile.write(f"\n\n// ===== FILE: {file_path} =====\n\n")
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    outfile.write(f.read())
            except Exception as e:
                outfile.write(f"\n// Failed to read file: {e}\n")

print(f"✅ Done! All files including controllers are organized by category in '{OUTPUT_DIR}' folder.")
