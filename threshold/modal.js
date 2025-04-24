function sanitizeInput(input) {
    var div = document.createElement('div');
    div.innerText = input;
    return div.innerHTML;
}

function openModal(src, alt) {
    var modal = document.getElementById("imageModal");
    var modalImg = document.getElementById("modalImage");
    modal.style.display = "flex";
    modalImg.src = sanitizeInput(src);
    modalImg.alt = sanitizeInput(alt);

    modalImg.onerror = function() {
        alert("Failed to load the image.");
        closeModal();
    };
}

function closeModal() {
    var modal = document.getElementById("imageModal");
    modal.style.display = "none";
}

window.onclick = function(event) {
    var modal = document.getElementById("imageModal");
    if (event.target == modal) {
        closeModal();
    }
};