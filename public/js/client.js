document.addEventListener("DOMContentLoaded", () => {
    const pageUpButton = document.getElementById("pageUpButton");
    const pageDownButton = document.getElementById("pageDownButton");

    if (pageUpButton && pageDownButton) {
        pageUpButton.addEventListener("click", () => {
            window.location.href = "/prev";
        });

        pageDownButton.addEventListener("click", () => {
            window.location.href = "/next";
        });
    }
});
