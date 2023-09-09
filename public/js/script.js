// https://developer.mozilla.org/en-US/docs/Web/API/Window/DOMContentLoaded_event
document.addEventListener("DOMContentLoaded", () => {
  console.log("plant-iq JS imported successfully!");
});

//Create screen interactive form 
function showForm() {
  let form = document.getElementById("form-AI");
  form.classList.toggle("hidden");
  let blabla = document.getElementById("method-select");
  blabla.classList.toggle("hidden");
}
function waitingScreen() {
  let form = document.getElementById("form-AI");
  form.classList.toggle("hidden");
  let blabla = document.getElementById("waiting-screen");
  blabla.classList.toggle("hidden");
}
function showSearch() {
  let form = document.getElementById("form-manual-search");
  form.classList.toggle("hidden");
  let blabla = document.getElementById("method-select");
  blabla.classList.toggle("hidden");
}
function showHistoryItemForm() {
  let form = document.getElementById("newHistoryItemForm");
  form.classList.toggle("hidden");
}