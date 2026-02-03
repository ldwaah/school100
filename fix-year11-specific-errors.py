#!/usr/bin/env python3
"""
Fix Year 11 specific errors: studentClas, Year 1, autocomplete="of"
"""
import re
from pathlib import Path

def fix_year11_file(file_path):
    """Fix Year 11 specific errors in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix studentClas to studentClass
        content = re.sub(r'studentClas', 'studentClass', content)
        content = re.sub(r'StudentClas', 'StudentClass', content)
        
        # Fix autocomplete="of" to autocomplete="off"
        content = re.sub(r'autocomplete="of"', 'autocomplete="off"', content)
        content = re.sub(r"autocomplete='of'", "autocomplete='off'", content)
        
        # Fix "Year 1" to "Year 11" in Year 11 resources (but be careful not to change examples)
        # Only change in form fields and readonly inputs
        content = re.sub(r'value="Year 1"', 'value="Year 11"', content)
        content = re.sub(r"value='Year 1'", "value='Year 11'", content)
        
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
    
    print(f"\n✅ Fixed Year 11 specific errors in {fixed_count} files")
    print(f"📝 {len(html_files) - fixed_count} files were already correct")

if __name__ == '__main__':
    main()

