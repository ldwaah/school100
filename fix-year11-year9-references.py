#!/usr/bin/env python3
"""
Fix Year 9 references in Year 11 resources
"""
import re
from pathlib import Path

def fix_year11_file(file_path):
    """Fix Year 9 references in a Year 11 resource file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix meta information
        content = re.sub(r'Year 9 Maths - Practice', 'Year 11 Maths - Practice', content)
        content = re.sub(r'Year 9 English - Reading', 'Year 11 English - Reading', content)
        content = re.sub(r'Year 9 English - Writing', 'Year 11 English - Writing', content)
        content = re.sub(r'Year 9 English - Vocabulary-SPaG', 'Year 11 English - Vocabulary-SPaG', content)
        content = re.sub(r'Year 9 English - Vocabulary & SPaG', 'Year 11 English - Vocabulary & SPaG', content)
        content = re.sub(r'Year 9 Sport', 'Year 11 Sport', content)
        content = re.sub(r'Year 9 Maths', 'Year 11 Maths', content)
        
        # Fix any remaining "Year 9" references in content (but be careful not to change examples)
        # Only change if it's clearly a reference to the year group, not part of example text
        # We'll be conservative and only change obvious cases
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all Year 11 resource files"""
    resources_dir = Path(__file__).parent / 'public' / 'resources-files' / 'Year-11'
    
    if not resources_dir.exists():
        print(f"Year 11 resources directory not found: {resources_dir}")
        return
    
    html_files = list(resources_dir.rglob('*.html'))
    print(f"Found {len(html_files)} Year 11 HTML files to process...")
    
    fixed_count = 0
    for html_file in html_files:
        if fix_year11_file(html_file):
            fixed_count += 1
            print(f"Fixed: {html_file.relative_to(resources_dir)}")
    
    print(f"\n✅ Fixed Year 9 references in {fixed_count} Year 11 files")
    print(f"📝 {len(html_files) - fixed_count} files were already correct")

if __name__ == '__main__':
    main()

