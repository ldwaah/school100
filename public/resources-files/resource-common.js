/**
 * Sets year (and subject) from URL so modal/header show correct Year 7–11.
 * Call on DOMContentLoaded. No hardcoded year values needed in HTML.
 */
(function () {
    function getYearFromUrl() {
        var q = window.location.search.match(/[?&]year=(\d+)/);
        if (q) return q[1];
        var m = window.location.pathname.match(/Year-(\d+)/);
        return m ? m[1] : null;
    }
    function getSubjectFromUrl() {
        var names = {
            'English-Reading': 'English - Reading',
            'English-Writing': 'English - Writing',
            'English-Vocabulary-SPaG': 'English - Vocabulary & SPaG',
            'Maths-Practice': 'Maths - Practice',
            'Maths-Error-Spotting': 'Maths - Error Spotting',
            'Sport-Academic': 'Sport - Academic',
            'Sport-Assessment': 'Sport - Assessment & Analysis',
            'Kings-Trust-Employability': "King's Trust - Employability"
        };
        var m = window.location.pathname.match(/Year-\d+\/([^/]+)\//);
        return (m && names[m[1]]) ? names[m[1]] : '';
    }
    function run() {
        var year = getYearFromUrl();
        if (!year) return;
        var yearLabel = 'Year ' + year;
        var subjectLabel = getSubjectFromUrl();
        var headerText = subjectLabel ? yearLabel + ' ' + subjectLabel : yearLabel;

        var studentClass = document.getElementById('studentClass');
        if (studentClass) studentClass.value = yearLabel;

        var displayEl = document.querySelector('[data-year-display]');
        if (displayEl) displayEl.textContent = headerText;

        var metaSpan = document.querySelector('.header .meta span');
        if (metaSpan && !displayEl) metaSpan.textContent = headerText;
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', run);
    } else {
        run();
    }
})();
