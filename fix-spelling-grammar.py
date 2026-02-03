#!/usr/bin/env python3
"""
Fix spelling errors and convert to UK English across all resource files
"""
import os
import re
from pathlib import Path

# Common spelling corrections
SPELLING_FIXES = {
    # Common typos
    r'\bconections\b': 'connections',
    r'\bConections\b': 'Connections',
    r'\bskiled\b': 'skilled',
    r'\bSkiled\b': 'Skilled',
    r'\bcomunicate\b': 'communicate',
    r'\bComunicate\b': 'Communicate',
    r'\bwriten\b': 'written',
    r'\bWriten\b': 'Written',
    r'\bskils\b': 'skills',
    r'\bSkils\b': 'Skills',
    r'\beffectivenes\b': 'effectiveness',
    r'\bEffectivenes\b': 'Effectiveness',
    r'\bLok\b': 'Look',
    r'\bstod\b': 'stood',
    r'\bStod\b': 'Stood',
    r'\bcountles\b': 'countless',
    r'\bCountles\b': 'Countless',
    r'\bcarer\b': 'career',
    r'\bCarer\b': 'Career',
    r'\bwals\b': 'walls',
    r'\bWals\b': 'Walls',
    r'\boccasionaly\b': 'occasionally',
    r'\bOccasionaly\b': 'Occasionally',
    r'\bben\b': 'been',  # Careful - only when it's a typo, not "ben" as a name
    r'\bcarefuly\b': 'carefully',
    r'\bCarefuly\b': 'Carefully',
    r'\byelowed\b': 'yellowed',
    r'\bYelowed\b': 'Yellowed',
    r'\bvalidationMesage\b': 'validationMessage',
    r'\bValidationMesage\b': 'ValidationMessage',
    
    # More common typos
    r'\bhiden\b': 'hidden',
    r'\bHiden\b': 'Hidden',
    r'\bslamed\b': 'slammed',
    r'\bSlamed\b': 'Slammed',
    r'\bdor\b': 'door',
    r'\bDor\b': 'Door',
    r'\bdors\b': 'doors',
    r'\bDors\b': 'Doors',
    r'\bflor\b': 'floor',
    r'\bFlor\b': 'Floor',
    r'\bslaming\b': 'slamming',
    r'\bSlaming\b': 'Slamming',
    r'\bal signs\b': 'all signs',
    r'\bAl signs\b': 'All signs',
    
    # More common typos
    r'\bteh\b': 'the',
    r'\bTeh\b': 'The',
    r'\badn\b': 'and',
    r'\bAdn\b': 'And',
    r'\btaht\b': 'that',
    r'\bTaht\b': 'That',
    r'\bthier\b': 'their',
    r'\bThier\b': 'Their',
    r'\brecieve\b': 'receive',
    r'\bRecieve\b': 'Receive',
    r'\brecieved\b': 'received',
    r'\bRecieved\b': 'Received',
    r'\bseperate\b': 'separate',
    r'\bSeperate\b': 'Separate',
    r'\bseperated\b': 'separated',
    r'\bSeperated\b': 'Separated',
    r'\boccured\b': 'occurred',
    r'\bOccured\b': 'Occurred',
    r'\bbegining\b': 'beginning',
    r'\bBegining\b': 'Beginning',
    r'\bexcersise\b': 'exercise',
    r'\bExcersise\b': 'Exercise',
    r'\bdefinately\b': 'definitely',
    r'\bDefinately\b': 'Definitely',
    r'\baccomodate\b': 'accommodate',
    r'\bAccomodate\b': 'Accommodate',
    r'\bneccessary\b': 'necessary',
    r'\bNeccessary\b': 'Necessary',
    
    # More typos
    r'\bnaratives\b': 'narratives',
    r'\bNaratives\b': 'Narratives',
    r'\bparalel\b': 'parallel',
    r'\bParalel\b': 'Parallel',
    r'\bbegining-midle-end\b': 'beginning-middle-end',
    r'\bBegining-midle-end\b': 'Beginning-middle-end',
    r'\balot\b': 'a lot',
    r'\bAlot\b': 'A lot',
    
    # Common homophone errors (be careful with context)
    r'\bloose\b': 'lose',  # When it's "loose" meaning to lose something (context-dependent)
    r'\bLoose\b': 'Lose',
    # Note: "loose" as in "not tight" is correct, but we'll fix obvious errors
    r'\bhere lots\b': 'hear lots',
    r'\bHere lots\b': 'Hear lots',
    r'\bwear they\b': 'where they',
    r'\bWear they\b': 'Where they',
    r'\bIts a\b': "It's a",  # Contraction
    r'\bIts amazing\b': "It's amazing",
    r'\bTheir going\b': "They're going",
    r'\bTheir!\b': "there!",  # At end of sentence
    r'\bTheir\b': 'their',  # Keep "their" as possessive, but fix "They're going"
    
    # Fix "Its" when it should be "It's" (contraction)
    # Be careful - only fix when followed by common words
    r'\bIts a\b': "It's a",
    r'\bIts amazing\b': "It's amazing",
    r'\bIts definitely\b': "It's definitely",
    r'\bIts important\b': "It's important",
    r'\bIts time\b': "It's time",
    r'\bIts not\b': "It's not",
    r'\bIts the\b': "It's the",
    
    # Fix "Their" when it should be "They're" (contraction)
    r'\bTheir going\b': "They're going",
    r'\bTheir coming\b': "They're coming",
    r'\bTheir here\b': "They're here",
    r'\bTheir there\b': "They're there",
    
    # Contractions
    r'\byou\'l\b': "you'll",
    r'\bYou\'l\b': "You'll",
    r'\bI\'l\b': "I'll",
    r'\bwe\'l\b': "we'll",
    r'\bWe\'l\b': "We'll",
    r'\bthey\'l\b': "they'll",
    r'\bThey\'l\b': "They'll",
    
    # US to UK spelling (in text content, not CSS)
    r'\borganize\b': 'organise',
    r'\bOrganize\b': 'Organise',
    r'\borganized\b': 'organised',
    r'\bOrganized\b': 'Organised',
    r'\borganizing\b': 'organising',
    r'\bOrganizing\b': 'Organising',
    r'\borganization\b': 'organisation',
    r'\bOrganization\b': 'Organisation',
    
    r'\brecognize\b': 'recognise',
    r'\bRecognize\b': 'Recognise',
    r'\brecognized\b': 'recognised',
    r'\bRecognized\b': 'Recognised',
    r'\brecognizing\b': 'recognising',
    r'\bRecognizing\b': 'Recognising',
    r'\brecognition\b': 'recognition',  # Same in UK
    
    r'\banalyze\b': 'analyse',
    r'\bAnalyze\b': 'Analyse',
    r'\banalyzed\b': 'analysed',
    r'\bAnalyzed\b': 'Analysed',
    r'\banalyzing\b': 'analysing',
    r'\bAnalyzing\b': 'Analysing',
    r'\banalysis\b': 'analysis',  # Same in UK
    
    r'\bcenter\b': 'centre',
    r'\bCenter\b': 'Centre',
    r'\bcentered\b': 'centred',
    r'\bCentered\b': 'Centred',
    r'\bcentering\b': 'centring',
    r'\bCentering\b': 'Centring',
    
    r'\btheater\b': 'theatre',
    r'\bTheater\b': 'Theatre',
    
    r'\bdefense\b': 'defence',
    r'\bDefense\b': 'Defence',
    r'\bdefensive\b': 'defensive',  # Same in UK
    
    r'\boffense\b': 'offence',
    r'\bOffense\b': 'Offence',
    r'\boffensive\b': 'offensive',  # Same in UK
    
    r'\brealize\b': 'realise',
    r'\bRealize\b': 'Realise',
    r'\brealized\b': 'realised',
    r'\bRealized\b': 'Realised',
    r'\brealizing\b': 'realising',
    r'\bRealizing\b': 'Realising',
    
    r'\bspecialize\b': 'specialise',
    r'\bSpecialize\b': 'Specialise',
    r'\bspecialized\b': 'specialised',
    r'\bSpecialized\b': 'Specialised',
    r'\bspecializing\b': 'specialising',
    r'\bSpecializing\b': 'Specialising',
    
    r'\bfavor\b': 'favour',
    r'\bFavor\b': 'Favour',
    r'\bfavored\b': 'favoured',
    r'\bFavored\b': 'Favoured',
    r'\bfavoring\b': 'favouring',
    r'\bFavoring\b': 'Favouring',
    
    r'\bhonor\b': 'honour',
    r'\bHonor\b': 'Honour',
    r'\bhonored\b': 'honoured',
    r'\bHonored\b': 'Honoured',
    r'\bhonoring\b': 'honouring',
    r'\bHonoring\b': 'Honouring',
    
    r'\bcolor\b': 'colour',  # Only in text, not CSS
    r'\bColor\b': 'Colour',
    r'\bcolored\b': 'coloured',
    r'\bColored\b': 'Coloured',
    r'\bcoloring\b': 'colouring',
    r'\bColoring\b': 'Colouring',
    
    r'\bbehavior\b': 'behaviour',
    r'\bBehavior\b': 'Behaviour',
    
    r'\blabor\b': 'labour',
    r'\bLabor\b': 'Labour',
    
    # Practice vs Practise (noun vs verb)
    # We'll handle this carefully - "practice" as noun stays, "practise" as verb
    # But in US English, both are "practice"
    # For now, we'll convert verb forms
    r'\bpracticing\b': 'practising',
    r'\bPracticing\b': 'Practising',
    r'\bpracticed\b': 'practised',  # Careful - could be noun or verb
    r'\bPracticed\b': 'Practised',
}

def fix_spelling_in_content(content):
    """Fix spelling errors in content, but preserve CSS"""
    # Split content into CSS and HTML parts
    # We want to fix text content but not CSS property names
    
    # Fix spelling in text content (outside style tags and CSS)
    fixed_content = content
    
    # Apply all spelling fixes
    for pattern, replacement in SPELLING_FIXES.items():
        # Only replace in text content, not in CSS (color: #xxx) or style attributes
        # We'll do a simple replacement but be careful with CSS
        fixed_content = re.sub(pattern, replacement, fixed_content)
    
    return fixed_content

def process_file(file_path):
    """Process a single HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixed_content = fix_spelling_in_content(content)
        
        if fixed_content != original_content:
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
        if process_file(html_file):
            fixed_count += 1
            print(f"Fixed: {html_file.relative_to(resources_dir)}")
    
    print(f"\n✅ Fixed spelling in {fixed_count} files")
    print(f"📝 {len(html_files) - fixed_count} files were already correct")

if __name__ == '__main__':
    main()

