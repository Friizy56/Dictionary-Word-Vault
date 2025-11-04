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
<button class="sound-btn" onclick="document.getElementById('audioPlayer').play()">
  🔊
</button>
`;
  }

  // Definitions of the words
  wordInfo.meanings.forEach((meaning) => {
    container.innerHTML += `<h4>${meaning.partOfSpeech}</h4>`;

    // loop through definitions
    meaning.definitions.forEach((def) => {
      container.innerHTML += `<p>• ${def.definition}</p>`;
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
  const resp = await fetch("/api/word-of-the-day");
  const data = await resp.json();
  return data.candidates[0].content.parts[0].text;
}

// On page load, fetch and show Word of the Day

window.onload = async () => {
  // Render history on load
  renderHistory();
  
  // Render favorites on load
  renderFavorites();

  //LOAD WORD OF THE DAY
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

  // Setup clear history button
  setupClearHistory();
  
  // Setup clear favorites button
  setupClearFavorites();
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
  const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
  const list = document.getElementById("historylist");
  list.innerHTML = "";

  if (history.length === 0) {
    list.innerHTML = "<li class='history-empty'>No search history yet</li>";
    return;
  }

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

function setupClearHistory() {
  const clearBtn = document.getElementById("clearHistory");
  clearBtn.onclick = () => {
    if (confirm("Are you sure you want to clear your search history?")) {
      localStorage.removeItem("searchHistory");
      renderHistory();
    }
  };
}

// Favorites functions
function renderFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const list = document.getElementById("favoritesList");
  list.innerHTML = "";

  if (favorites.length === 0) {
    list.innerHTML = "<li class='favorite-empty'>No favorites yet</li>";
    return;
  }

  favorites.forEach((word) => {
    const li = document.createElement("li");
    li.textContent = word;
    li.className = "favorite-item";

    // allow clicking to search
    li.onclick = () => {
      document.getElementById("searchInput").value = word;
      searchWord();
    };

    list.appendChild(li);
  });
}

function setupClearFavorites() {
  const clearBtn = document.getElementById("clearFavoritesBtn");
  clearBtn.onclick = () => {
    if (confirm("Are you sure you want to clear your favorites?")) {
      localStorage.removeItem("favorites");
      renderFavorites();
    }
  };
}