document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const closeButton = modal.querySelector(".close");

    function openModal(src, alt) {
        if (typeof src === "string" && typeof alt === "string") {
            modal.style.display = "flex";
            modalImg.src = src;
            modalImg.alt = alt;
            modal.setAttribute("aria-hidden", "false");
            closeButton.focus(); // Shift focus to the close button
        }
    }

    function closeModal() {
        modal.style.display = "none";
        modalImg.src = "";
        modalImg.alt = "";
        modal.setAttribute("aria-hidden", "true");
    }

    // Close modal on clicking outside the image
    window.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Close modal on pressing the Escape key
    window.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });

    // Attach openModal and closeModal to the global scope if needed
    window.openModal = openModal;
    window.closeModal = closeModal;
});