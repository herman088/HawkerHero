async function search() {
  const q = document.getElementById("search").value;
  const res = await fetch(`/search?dish=${encodeURIComponent(q)}`);

  const data = await res.json();

  const container = document.getElementById("results");
  container.innerHTML = "";

  data.forEach((h, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>#${i + 1} ${h.hawker}</h3>
      <p>Score: ${h.score.toFixed(2)}</p>
      <p>Positive mentions: ${h.positive_mentions}</p>
      <p>Recommended: ${h.recommended_mentions}</p>
    `;
    container.appendChild(div);
  });
}
