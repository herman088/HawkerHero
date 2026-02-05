async function search() {
  const q = document.getElementById("search").value;
  const res = await fetch(`/search?dish=${encodeURIComponent(q)}`);

  const data = await res.json();

  const container = document.getElementById("results");
  container.innerHTML = "";

  data.forEach((h, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.dataset.hawker = h.hawker;
    div.innerHTML = `
      <img src = ${h.thumbnail}>
      <div class = "card-content">
        <h3 class="card-title">#${i + 1} ${h.hawker}</h3>
        <p class = "score">${h.rating} ⭐</p>
      </div>
    `;
    container.appendChild(div);
  });
}

document.getElementById("results").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const hawker = card.dataset.hawker;
});
