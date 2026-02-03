const fs = require('fs');
const path = require('path');

// Generate a static manifest of all resources
function generateManifest() {
    const resourcesPath = path.join(__dirname, 'public', 'resources-files');
    const manifest = {
        counts: {},
        resources: {}
    };
    
    const yearGroups = ['Year-7', 'Year-8', 'Year-9', 'Year-10', 'Year-11'];
    const allSubjects = [
        { folder: 'English-Reading', name: 'English - Reading' },
        { folder: 'English-Writing', name: 'English - Writing' },
        { folder: 'English-Vocabulary-SPaG', name: 'English - Vocabulary & SPaG' },
        { folder: 'Maths-Practice', name: 'Maths - Practice' },
        { folder: 'Maths-Error-Spotting', name: 'Maths - Error Spotting' },
        { folder: 'Sport-Academic', name: 'Sport - Academic' },
        { folder: 'Sport-Assessment', name: 'Sport - Assessment & Analysis' },
        { folder: 'Kings-Trust-Employability', name: "King's Trust - Employability" }
    ];
    
    yearGroups.forEach(yearGroup => {
        const yearPath = path.join(resourcesPath, yearGroup);
        let count = 0;
        const subjects = [];
        
        if (fs.existsSync(yearPath)) {
            allSubjects.forEach(subject => {
                const subjectPath = path.join(yearPath, subject.folder);
                let files = [];
                
                if (fs.existsSync(subjectPath)) {
                    files = fs.readdirSync(subjectPath).filter(f => 
                        !f.startsWith('.') && f.endsWith('.html')
                    );
                    count += files.length;
                }
                
                subjects.push({
                    name: subject.name,
                    folder: subject.folder,
                    resources: files
                });
            });
        }
        
        manifest.counts[yearGroup] = count;
        manifest.resources[yearGroup] = subjects;
    });
    
    // Write manifest to public directory so it can be served as static file
    const manifestPath = path.join(__dirname, 'public', 'resources-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Resources manifest generated:', manifestPath);
    console.log('📊 Total resources:', Object.values(manifest.counts).reduce((a, b) => a + b, 0));
}

generateManifest();

