async function search() {
  const q = document.getElementById("search").value;
  const res = await fetch(`/search?dish=${encodeURIComponent(q)}`);

  const data = await res.json(); //response body to js object

  const container = document.getElementById("results");
  container.innerHTML = "";

  data.forEach((h, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.dataset.hawker = h.hawker;
    div.dataset.meta = JSON.stringify(h); //js object to js string to be sent http,this case to be stored as data attr?keynamewillbestring
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
  const meta = JSON.parse(card.dataset.meta); //JS string to js obj
  openHawker(meta);
});

async function openHawker(cardData) {
  document.getElementById("modal-image").src = cardData.thumbnail;
  document.getElementById("modal-title").innerText = cardData.hawker;
  document.getElementById("modal-rating").innerText =
    `⭐ ${cardData.rating || "N/A"}`;
  document.getElementById("mentions").innerText =
    `Total mentions: ${cardData.mentions}`;
  document.getElementById("reco-count").innerText =
    `Total recommendations: ${cardData.recommended_mentions}`;
  document.getElementById("positive-count").innerText =
    `Total mentions: ${cardData.positive_mentions}`;

  document.getElementById("modal").classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", (e) => {
  /* so event listener attach after dom runs, else error */
  document.getElementById("modal-close").addEventListener("click", () => {
    e.stopPropagation();
    document.getElementById("modal").classList.add("hidden");
  });

  document.getElementById("modal").addEventListener("click", (e) => {
    if (e.target.id === "modal") {
      document.getElementById("modal").classList.add("hidden");
    }
  });
});
