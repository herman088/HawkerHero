//document.getElementById("search").addEventListener("keydown", (e) => {
//if (e.key === "Enter") search(1);
//});
let currentPage = 1;
const limit = 10;
let currentQuery = " ";
async function search(page = 1) {
  const q = document.getElementById("search").value;
  currentQuery = q;
  currentPage = page;
  const res = await fetch(
    `/search?dish=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
  );

  const data = await res.json(); //response body to js object

  const container = document.getElementById("results");
  container.innerHTML = "";
  const suggestDiv = document.getElementById("suggest");
  checkSuggested(data.query, data.suggested_query, suggestDiv);
  data.results.forEach((h, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.dataset.hawker = h.hawker;
    div.dataset.meta = JSON.stringify(h); //js object to js string to be sent http,this case to be stored as data attr?keynamewillbestring
    div.innerHTML = `
      <img src = ${h.thumbnail}>
      <div class = "card-content">
        <h3 class="card-title"> ${toTitleCase(h.hawker)}</h3>
        <p class = "score">${h.rating} ⭐</p>
      </div>
    `;
    container.appendChild(div);
  });

  updatePagination(data.page, data.total_pages);
}
function checkSuggested(ogQuery, suggestQuery, div) {
  div.innerHTML = "";
  console.log(ogQuery, suggestQuery);
  if (ogQuery === suggestQuery) return;
  div.innerHTML = `<p> Did you mean ${suggestQuery}</p>`;
}
async function openHawker(cardData) {
  document.getElementById("modal-image").src = cardData.thumbnail;
  document.getElementById("modal-title").innerText = toTitleCase(
    cardData.hawker,
  );
  document.getElementById("modal-rating").innerText =
    `⭐ ${cardData.rating || "N/A"}`;
  document.getElementById("mentions").innerText =
    `Total ${currentQuery} mentions: ${cardData.mentions}`;
  document.getElementById("reco-count").innerText =
    `Total ${currentQuery} recommendations: ${cardData.recommended_mentions}`;
  document.getElementById("positive-count").innerText =
    `Total ${currentQuery} positive mentions: ${cardData.positive_mentions}`;
  document.getElementById("desc").innerText = `${cardData.desc}`;
  document.getElementById("modal").classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", (e) => {
  document.getElementById("results").addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;

    const hawker = card.dataset.hawker;
    const meta = JSON.parse(card.dataset.meta); //JS string to js obj
    openHawker(meta);
  });
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

  // update pagination results

  document.getElementById("prev-btn").onclick = () => {
    if (currentPage > 1) {
      search(currentPage - 1);
    }
  };

  document.getElementById("next-btn").onclick = () => {
    if (currentPage <= 7) {
      search(currentPage + 1);
    }
  };
});

function updatePagination(page, totalPages) {
  if (totalPages > 1) {
    document.getElementById("page-info").textContent =
      `${page} of ${totalPages}`;

    document.getElementById("prev-btn").disabled = page <= 1;
    document.getElementById("next-btn").disabled = page >= totalPages;
    document.getElementById("pagination-controls").classList.remove("hidden");
  }
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) =>
      word
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("-"),
    )
    .join(" ");
}
