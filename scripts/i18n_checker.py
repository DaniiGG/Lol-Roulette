#!/usr/bin/env python3
"""
i18n Checker Script
Detects hardcoded user-facing strings in React components and checks for missing translation keys.
Usage: python scripts/i18n_checker.py <project_path>
"""

import os
import re
import sys
import json

HARDCODED_PATTERNS = [
    # JSX text nodes (text between tags)
    r'>\s*([A-Z][a-zA-Z\s]{2,30}?)\s*<',
    # Strings in JSX attributes
    r'placeholder=["\']([A-Za-z\s]{3,50})["\']',
    r'aria-label=["\']([A-Za-z\s]{3,50})["\']',
    r'title=["\']([A-Za-z\s]{3,50})["\']',
    r'alt=["\']([A-Za-z\s]{3,50})["\']',
    # Strings in template literals
    r'`([A-Z][a-zA-Z\s]{3,50})`',
]

EXCLUDE_DIRS = {'node_modules', '.next', '.git', 'out', 'build', 'dist', '__pycache__', 'locales'}
EXCLUDE_PATTERNS = [
    r'console\.log',
    r'className=',
    r'style=',
    r'fontFamily',
    r'border-',
    r'text-',
    r'bg-',
    r'hover:',
    r'focus:',
    r'group-hover:',
    r'lg:',
    r'sm:',
    r'md:',
    r'grid-',
    r'flex-',
    r'items-',
    r'justify-',
    r'gap-',
    r'p[xy]?-',
    r'm[xy]?-',
    r'w-',
    r'h-',
    r'rounded-',
    r'opacity-',
    r'tracking-',
    r'leading-',
    r'max-w-',
    r'min-h-',
    r'from-',
    r'via-',
    r'to-',
    r'animation-',
    r'#',
]

def is_excluded_string(s: str) -> bool:
    s = s.strip()
    if len(s) < 3:
        return True
    if s.startswith('http') or s.startswith('/') or s.startswith('#'):
        return True
    if s.startswith('${') or s.startswith('{'):
        return True
    if any(c in s for c in ['\\n', '\\t']):
        return False  # multi-line strings might be hardcoded
    if re.match(r'^[a-z0-9_-]+$', s):
        return True  # CSS classes, IDs
    return False

def check_file(filepath: str) -> list:
    issues = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return issues

    # Skip files that already use translation
    if 'useTranslations' in content or 'getTranslations' in content:
        return issues

    # Check for hardcoded strings
    for pattern in HARDCODED_PATTERNS:
        for match in re.finditer(pattern, content):
            text = match.group(1).strip()
            if not is_excluded_string(text):
                is_excluded = False
                for excl in EXCLUDE_PATTERNS:
                    if re.match(excl, text):
                        is_excluded = True
                        break
                if not is_excluded:
                    issues.append((match.start(), text))
    
    return issues

def check_missing_keys(locale_dir: str, reference_locale: str = 'en') -> list:
    """Check if all locale files have the same keys as the reference."""
    ref_path = os.path.join(locale_dir, reference_locale, 'common.json')
    if not os.path.exists(ref_path):
        return [f"Reference locale file not found: {ref_path}"]
    
    with open(ref_path, 'r', encoding='utf-8') as f:
        ref_keys = set(json.load(f).keys())
    
    issues = []
    for lang in os.listdir(locale_dir):
        lang_path = os.path.join(locale_dir, lang, 'common.json')
        if not os.path.exists(lang_path):
            issues.append(f"Missing locale file: {lang_path}")
            continue
        with open(lang_path, 'r', encoding='utf-8') as f:
            lang_keys = set(json.load(f).keys())
        missing = ref_keys - lang_keys
        extra = lang_keys - ref_keys
        for key in missing:
            issues.append(f"Missing key '{key}' in {lang}/common.json")
        for key in extra:
            issues.append(f"Extra key '{key}' in {lang}/common.json")
    
    return issues

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/i18n_checker.py <project_path>")
        sys.exit(1)
    
    project_path = sys.argv[1]
    if not os.path.exists(project_path):
        print(f"Error: Path '{project_path}' does not exist")
        sys.exit(1)
    
    print(f"\n🔍 i18n Checker - Scanning {project_path}\n")
    
    # Check hardcoded strings in components and pages
    total_issues = 0
    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            if not (file.endswith('.tsx') or file.endswith('.jsx') or file.endswith('.ts')):
                continue
            if file.endswith('.d.ts'):
                continue
                
            filepath = os.path.join(root, file)
            issues = check_file(filepath)
            if issues:
                rel_path = os.path.relpath(filepath, project_path)
                print(f"\n📄 {rel_path}:")
                for pos, text in issues:
                    print(f"   ⚠️  Line ~{content_line(filepath, pos)}: '{text}'")
                    total_issues += 1
    
    # Check missing translation keys
    locale_dir = os.path.join(project_path, 'locales')
    if os.path.exists(locale_dir):
        print(f"\n📋 Checking translation keys...")
        key_issues = check_missing_keys(locale_dir)
        for issue in key_issues:
            print(f"   ❌ {issue}")
            total_issues += 1
    else:
        print(f"\n⚠️  No 'locales' directory found")
    
    print(f"\n{'='*50}")
    if total_issues == 0:
        print("✅ All clear! No issues found.")
    else:
        print(f"⚠️  Found {total_issues} potential issue(s)")
    
    return total_issues

def content_line(filepath: str, pos: int) -> int:
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        return content[:pos].count('\n') + 1
    except:
        return 0

if __name__ == '__main__':
    exit(main())