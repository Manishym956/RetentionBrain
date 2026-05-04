import os
import glob

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        return
        
    new_content = content
    
    # Revert specific classes that should always be text-white
    if 'Button.tsx' in filepath:
        new_content = new_content.replace('bg-blue-600 text-gray-900 dark:text-white', 'bg-blue-600 text-white')
    
    new_content = new_content.replace('<span className="text-gray-900 dark:text-white text-sm font-bold">RB</span>', '<span className="text-white text-sm font-bold">RB</span>')
    new_content = new_content.replace('<span className="text-gray-900 dark:text-white text-xs font-bold">RB</span>', '<span className="text-white text-xs font-bold">RB</span>')
    new_content = new_content.replace('className="text-sm font-medium text-gray-900 dark:text-white bg-blue-600', 'className="text-sm font-medium text-white bg-blue-600')
    
    if 'profile' in filepath:
        new_content = new_content.replace('text-gray-900 dark:text-white dark:text-gray-900', 'text-white dark:text-gray-900')
        new_content = new_content.replace('<Shield className="w-5 h-5 text-gray-900 dark:text-white" />', '<Shield className="w-5 h-5 text-white" />')
        new_content = new_content.replace('<h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">RetentionBrain Pro</h4>', '<h4 className="text-lg font-bold text-white mb-1">RetentionBrain Pro</h4>')
        
    if 'dashboard' in filepath or 'predictions' in filepath:
        new_content = new_content.replace("bg-blue-600 text-gray-900 dark:text-white", "bg-blue-600 text-white")
        new_content = new_content.replace("'bg-blue-600 text-gray-900 dark:text-white'", "'bg-blue-600 text-white'")
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Fixed {filepath}')

for f in glob.glob('frontend/**/*.tsx', recursive=True):
    fix_file(f)
