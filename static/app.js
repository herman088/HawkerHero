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
      <h3>#${i + 1} ${h.hawker}</h3>
      <img src = ${h.thumbnail}>
      <p>${h.rating} ⭐</p>
    `;
    container.appendChild(div);
  });
}

document.getElementById("results").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;

  const hawker = card.dataset.hawker;
});
