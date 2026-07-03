# -*- coding: utf-8 -*-
"""
Reorder references so citations appear in sequential order [1],[2],[3]...
based on first appearance in the text.
"""
import re
import os

CONTENT_DIR = os.path.join(os.path.dirname(__file__), 'content')

# Files in chapter order of appearance in the thesis
CHAPTER_FILES = [
    'ch1_1_background.txt',     # 1.1
    'ch1_2_domestic.txt',        # 1.2.1
    'ch1_2_foreign.txt',         # 1.2.2
    'ch1_3_design_content.txt',  # 1.3
    'ch2_1_requirements.txt',    # 2.1
    'ch2_2_business_process.txt',# 2.2
    'ch2_3_module_analysis.txt', # 2.3
    'ch2_4_tech_analysis.txt',   # 2.4
    'ch3_1_overall_design.txt',  # 3.1
    'ch3_2_detailed_design.txt', # 3.2
    'ch3_3_database.txt',        # 3.3
    'ch4_1_frontend.txt',        # 4.1
    'ch4_2_backend.txt',         # 4.2
    'ch5_1_testing_overview.txt',# 5.1
    'ch5_2_test_cases.txt',      # 5.2
    'ch5_3_test_results.txt',    # 5.3
    'conclusion.txt',            # Conclusion
]

def read_content(filename):
    filepath = os.path.join(CONTENT_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    return ''

def write_content(filename, content):
    filepath = os.path.join(CONTENT_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Step 1: Find first appearance order of each old reference number
old_to_new = {}
new_to_old = {}
next_new = 1

for filename in CHAPTER_FILES:
    text = read_content(filename)
    found = re.findall(r'\[(\d+)\]', text)
    for num in found:
        num = int(num)
        if num not in old_to_new:
            old_to_new[num] = next_new
            new_to_old[next_new] = num
            next_new += 1

print(f"Total unique references found: {len(old_to_new)}")
print(f"Old->New mapping:")
for old in sorted(old_to_new.keys()):
    print(f"  [{old}] -> [{old_to_new[old]}]")

# Step 2: Update all chapter files with new reference numbers
for filename in CHAPTER_FILES:
    text = read_content(filename)
    if not text:
        continue

    def replace_ref(match):
        old_num = int(match.group(1))
        if old_num in old_to_new:
            return f'[{old_to_new[old_num]}]'
        return match.group(0)

    new_text = re.sub(r'\[(\d+)\]', replace_ref, text)
    if new_text != text:
        write_content(filename, new_text)
        print(f"  Updated: {filename}")

# Step 3: Reorder references list based on new order
ref_text = read_content('references.txt')
if ref_text:
    # Parse references into a dict: old_num -> reference string
    ref_map = {}
    current_ref = None
    current_text = []
    for line in ref_text.split('\n'):
        line = line.strip()
        if not line:
            if current_ref is not None and current_text:
                ref_map[current_ref] = '\n'.join(current_text)
            current_ref = None
            current_text = []
            continue
        m = re.match(r'^\[(\d+)\]\s+(.+)', line)
        if m:
            if current_ref is not None and current_text:
                ref_map[current_ref] = '\n'.join(current_text)
            current_ref = int(m.group(1))
            current_text = [line]
        else:
            if current_text:
                current_text.append(line)
    if current_ref is not None and current_text:
        ref_map[current_ref] = '\n'.join(current_text)

    print(f"\nParsed {len(ref_map)} references from references.txt")

    # Build new references list in sequential order
    new_ref_lines = []
    for new_num in range(1, len(new_to_old) + 1):
        old_num = new_to_old.get(new_num)
        if old_num and old_num in ref_map:
            ref_line = ref_map[old_num]
            # Update the number
            ref_line = re.sub(r'^\[\d+\]', f'[{new_num}]', ref_line)
            new_ref_lines.append(ref_line)
        else:
            print(f"  WARNING: New ref [{new_num}] has no old mapping!")

    new_ref_text = '\n'.join(new_ref_lines)
    write_content('references.txt', new_ref_text)
    print(f"Written {len(new_ref_lines)} references in new order")

print("\nDone! References reordered successfully.")
