        // Optional: Add keyboard navigation for accessibility
        document.querySelector('.artwork-image').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // You can add click behavior here if needed
                // For example, opening a larger view or gallery
            }
        });
        // Optional: Preload hover state for smoother animations
        document.querySelector('.artwork-image').addEventListener('mouseenter', function() {
            this.style.willChange = 'transform';
        });
        document.querySelector('.artwork-image').addEventListener('mouseleave', function() {
            // Remove will-change after transition completes
            setTimeout(() => {
                this.style.willChange = 'auto';
            }, 3000);
        });
        // Optional: Add error handling for image loading
        document.querySelector('.artwork-image').addEventListener('error', function() {
            this.alt = 'Image failed to load';
            this.style.border = '2px dashed hsl(0 0% 40%)';
            this.style.minHeight = '200px';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
        });
