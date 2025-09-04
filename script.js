// DICTIONARY section

async function getWordData(word) {
  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error found:", err);
  }
}

function display(data) {
  const container = document.getElementById("result");
  container.innerHTML = "";
  if (!data || data.title) {
    container.innerHTML = "Word not found";
    return;
  }

  const wordInfo = data[0];

  //Word searched
  container.innerHTML += `<h2>${wordInfo.word}</h2>`;

  // Phonetics (audio a)
  if (wordInfo.phonetics && wordInfo.phonetics.length > 0) {
    const phonetic = wordInfo.phonetics[0];
    if (phonetic.text)
      container.innerHTML += `<p><b>Phonetic:</b> ${phonetic.text}</p>`;
    if (phonetic.audio)
      container.innerHTML += `<audio id="audioPlayer" src="${phonetic.audio}"></audio>
<button class="sound-btn" onclick="document.getElementById('audioPlayer').play()">🔊</button>`;
  }

  // Definitions of the words
  wordInfo.meanings.forEach((meaning) => {
    container.innerHTML += `<h4>${meaning.partOfSpeech}</h4>`;

    // loop through definitions
    meaning.definitions.forEach((def) => {
      container.innerHTML += `<p>• ${def.definition} </p>`;
      if (def.example) {
        container.innerHTML += `<em>Example: ${def.example}</em><br>`;
      }
    });

    if (meaning.synonyms && meaning.synonyms.length > 0) {
      container.innerHTML += `<p class="syno"><b>Synonyms:</b> ${meaning.synonyms.join(
        ", "
      )}</p>`;
    }
    if (meaning.antonyms && meaning.antonyms.length > 0) {
      container.innerHTML += `<p class = "anto"><b>Antonyms:</b> ${meaning.antonyms.join(
        ", "
      )}</p>`;
    }
  });

  // Word searched
  container.innerHTML += `<h2>${wordInfo.word} 
  <button onclick="addToFavorites('${wordInfo.word}')">⭐</button>
</h2>`;
}

// Search button action
async function searchWord() {
  const word = document.getElementById("searchInput").value.trim();
  if (!word) return;
  const data = await getWordData(word);
  display(data);

  addToHistory(word); //saving to History
}

// WORD OF THE DAY section

async function fetchWordOfTheDay() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyAqvC4G0_XMJtFvPSLCy_tGmbOs0ONNIH8`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: "Provide a random English word of the day with its definition and an example sentence.",
            },
          ],
        },
      ],
    }),
  });

  const data = await resp.json();
  return data.candidates[0].content.parts[0].text;
}

// On page load, fetch and show Word of the Day

window.onload = async () => {
  // Render history on load
  renderHistory();

  // LOAD WORD OF THE DAY
  const wotdEl = document.getElementById("wotd");
  wotdEl.innerHTML = "<p>⏳ Loading Word of the Day...</p>";

  try {
    let text = await fetchWordOfTheDay();

    // Remove Markdown asterisks (like **word**)
    text = text.replace(/\*\*/g, "");

    // split into parts (Word, Definition, Example)
    const parts = text.split("\n").filter((line) => line.trim() !== "");
    const word = parts[0] || "Word of the Day";
    const definition = parts[1] || "";
    const example = parts[2] || "";

    wotdEl.innerHTML = `
      <h2>🌟 Word of the Day 🌟</h2>
      <p class="wotd-word"><b>${word}</b></p>
      <p class="wotd-definition">${definition}</p>
      <p class="wotd-example"><em>${example}</em></p>
    `;
  } catch (err) {
    wotdEl.innerHTML =
      "<p style='color:red;'>⚠️ Could not fetch Word of the Day.</p>";
    console.error(err);
  }
};

// Adding search history
function addToHistory(word) {
  let history = JSON.parse(localStorage.getItem("searchHistory")) || [];

  // avoid duplicates
  if (!history.includes(word)) {
    history.push(word);

    // keep only last 10 words
    if (history.length > 10) {
      history.shift();
    }

    localStorage.setItem("searchHistory", JSON.stringify(history));
  }

  renderHistory();
}

function renderHistory() {
  const history = JSON.parse(localStorage.getItem("searchHistory")) || []; //Take JSON text and convert it into a real JavaScript object I can use
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  history.forEach((word) => {
    const li = document.createElement("li");
    li.textContent = word;
    li.className = "history-item";

    // allow clicking to search again
    li.onclick = () => {
      document.getElementById("searchInput").value = word;
      searchWord();
    };

    list.appendChild(li);
  });
}

// Clear history function
function clearHistory() {
  localStorage.removeItem("searchHistory"); // remove from storage
  renderHistory(); // re-render empty history
}

// Attach event listener
document.addEventListener("DOMContentLoaded", () => {
  const clearBtn = document.getElementById("clearHistoryBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearHistory);
  }
});

// Add to Favorites
function addToFavorites(word) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (!favorites.includes(word)) {
    favorites.push(word);

    // keep only last 10 favorites
    if (favorites.length > 10) {
      favorites.shift();
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
  }

  renderFavorites();
}

// Render Favorites
function renderFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const list = document.getElementById("favoritesList");
  list.innerHTML = "";

  favorites.forEach((word) => {
    const li = document.createElement("li");
    li.textContent = word;
    li.className = "favorite-item";

    // click to search again
    li.onclick = () => {
      document.getElementById("searchInput").value = word;
      searchWord();
    };

    list.appendChild(li);
  });
}

// Clear favorites
function clearFavorites() {
  localStorage.removeItem("favorites");
  renderFavorites();
}

// Attach favorite clear button
document.addEventListener("DOMContentLoaded", () => {
  const clearFavBtn = document.getElementById("clearFavoritesBtn");
  if (clearFavBtn) {
    clearFavBtn.addEventListener("click", clearFavorites);
  }
});
