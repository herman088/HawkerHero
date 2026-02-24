//document.getElementById("search").addEventListener("keydown", (e) => {
//if (e.key === "Enter") search(1);
//});
let currentPage = 1;
let useSuggestQ = true;
const limit = 10;
let currentQuery = " ";
let currentSugQuery = " ";
async function search(page = 1, useSuggest = useSuggestQ) {
  const q = document.getElementById("search").value;
  currentQuery = q;

  currentPage = page;
  const res = await fetch(
    `/search?dish=${encodeURIComponent(q)}&page=${page}&limit=${limit}&useSuggest=${useSuggest}`,
  );

  const data = await res.json(); //response body to js object
  currentSugQuery = data.suggested_query;
  const container = document.getElementById("results");
  container.innerHTML = "";
  const suggestDiv = document.getElementById("suggest");

  const ogSuggest = document.getElementById("og-suggest");

  if (useSuggest) {
    checkSuggested(data.query, data.suggested_query, suggestDiv);
    altQueryDisplay(ogSuggest, data.query, data.suggested_query);
  }

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
  div.innerHTML = `<p> <strong>Showing results for </strong> ${suggestQuery}</p>`;
}
function altQueryDisplay(div, ogQuery, suggestQuery) {
  div.innerHTML = "";
  if (ogQuery === suggestQuery) return;

  const link = document.createElement("a");
  link.href = "#";
  link.textContent = ogQuery;
  link.addEventListener("click", (e) => {
    e.preventDefault();
    useSuggestQ = false;
    search(1, useSuggestQ);
    // de-populate suggestion fields
    suggest = document.getElementById("suggest");
    ogSuggest = document.getElementById("og-suggest");

    suggest.innerHTML = " ";
    ogSuggest.innerHTML = "";
  });

  div.appendChild(document.createTextNode("Search for "));
  div.appendChild(link);
  div.appendChild(document.createTextNode(" instead"));
}
async function openHawker(cardData) {
  const displayQuery =
    currentSugQuery && currentSugQuery !== currentQuery
      ? currentSugQuery
      : currentQuery;

  document.getElementById("modal-image").src = cardData.thumbnail;
  document.getElementById("modal-title").innerText = toTitleCase(
    cardData.hawker,
  );
  document.getElementById("modal-rating").innerText =
    `⭐ ${cardData.rating || "N/A"}`;
  document.getElementById("mentions").innerText =
    `Total ${displayQuery} mentions: ${cardData.mentions}`;
  document.getElementById("reco-count").innerText =
    `Total ${displayQuery} recommendations: ${cardData.recommended_mentions}`;
  document.getElementById("positive-count").innerText =
    `Total ${displayQuery} positive mentions: ${cardData.positive_mentions}`;
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
