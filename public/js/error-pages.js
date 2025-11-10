// Public JavaScript file for 404 and WIP pages


document.addEventListener('DOMContentLoaded', function() {
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            window.location.href = "/";
        });
    }
    

    const errorEmoji = document.querySelector('.error-emoji');
    if (errorEmoji) {
        errorEmoji.style.transition = 'transform 0.3s ease';
        errorEmoji.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.2)';
        });
        errorEmoji.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
        });
    }
});