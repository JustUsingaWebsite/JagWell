// Documentation JavaScript for JagWell Wellness App

document.addEventListener('DOMContentLoaded', function() {
    // Get the header element once to avoid repeated queries
    const header = document.querySelector('header');
    
    // Pass the header to the functions that need it
    setupSmoothScrolling(header);
    setupScrollSpy(header);
});

/**
 * Smooth scrolling for navigation links
 * MODIFIED: Now accepts the header to dynamically calculate its height
 */
function setupSmoothScrolling(header) {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // ADDED: Dynamically get the header's current height
                const headerHeight = header.offsetHeight;
                // ADDED: Create a small 10px buffer below the sticky header
                const scrollOffset = headerHeight + 10;
                
                window.scrollTo({
                    // MODIFIED: Use the dynamic offset instead of a fixed value
                    top: targetSection.offsetTop - scrollOffset,
                    behavior: 'smooth' });
            }
        });
    });
}

/**
 * Add active class to current section in navigation
 * MODIFIED: Now accepts the header to dynamically calculate its height
 */
function setupScrollSpy(header) {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('nav a');
    
    window.addEventListener('scroll', function() {
        // ADDED: Dynamically get header height and add a buffer for accuracy
        const scrollSpyOffset = header.offsetHeight + 20;
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // MODIFIED: Use the dynamic offset to check the position
            if (pageYOffset >= (sectionTop - scrollSpyOffset)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}// Documentation JavaScript for JagWell Wellness App

document.addEventListener('DOMContentLoaded', function() {
    // Get the header element once to avoid repeated queries
    const header = document.querySelector('header');
    
    // Pass the header to the functions that need it
    setupSmoothScrolling(header);
    setupScrollSpy(header);
});

/**
 * Smooth scrolling for navigation links
 * MODIFIED: Now accepts the header to dynamically calculate its height
 */
function setupSmoothScrolling(header) {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // ADDED: Dynamically get the header's current height
                const headerHeight = header.offsetHeight;
                // ADDED: Create a small 10px buffer below the sticky header
                const scrollOffset = headerHeight + 10;
                
                window.scrollTo({
                    // MODIFIED: Use the dynamic offset instead of a fixed value
                    top: targetSection.offsetTop - scrollOffset,
                    behavior: 'smooth'});
            }
        });
    });
}

/**
 * Add active class to current section in navigation
 * MODIFIED: Now accepts the header to dynamically calculate its height
 */
function setupScrollSpy(header) {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('nav a');
    
    window.addEventListener('scroll', function() {
        // ADDED: Dynamically get header height and add a buffer for accuracy
        const scrollSpyOffset = header.offsetHeight + 20;
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // MODIFIED: Use the dynamic offset to check the position
            if (pageYOffset >= (sectionTop - scrollSpyOffset)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}