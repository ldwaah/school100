#!/usr/bin/env python3
"""
Fix CSS color properties - they must use 'color' not 'colour'
"""
import re
from pathlib import Path

def fix_css_color(file_path):
    """Fix CSS color properties in a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace 'colour:' with 'color:' in CSS (inside <style> tags and style attributes)
        # This regex matches 'colour:' followed by optional whitespace and a value
        fixed_content = re.sub(r'\bcolour:\s*', 'color: ', content)
        
        if fixed_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to process all resource files"""
    resources_dir = Path(__file__).parent / 'public' / 'resources-files'
    
    if not resources_dir.exists():
        print(f"Resources directory not found: {resources_dir}")
        return
    
    html_files = list(resources_dir.rglob('*.html'))
    print(f"Found {len(html_files)} HTML files to process...")
    
    fixed_count = 0
    for html_file in html_files:
        if fix_css_color(html_file):
            fixed_count += 1
            print(f"Fixed: {html_file.relative_to(resources_dir)}")
    
    print(f"\n✅ Fixed CSS color properties in {fixed_count} files")
    print(f"📝 {len(html_files) - fixed_count} files were already correct")

if __name__ == '__main__':
    main()

