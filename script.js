const api = axios.create({ baseURL: "https://rickandmortyapi.com/api" });
const charactersURL = "https://rickandmortyapi.com/api/character";
const episodesURL = "https://rickandmortyapi.com/api/episode";
const locationsURL = "https://rickandmortyapi.com/api/location";
let currentPage = 1;

async function loadApiData() {
    const [characters, episodes, locations] = await Promise.all([
        api.get(charactersURL),
        api.get(episodesURL),
        api.get(locationsURL)
    ]);
    return { characters: characters.data, episodes: episodes.data, locations: locations.data };
}

async function loadApiEpisode(url) {
    const episodes = await api.get(url);
    return { episodes: episodes.data };
}

async function getEpisodeName(url) {
    const res = await loadApiEpisode(url);
    return res.episodes.name;
}

async function getDataCount(data) {
    const res = await loadApiData();
    return res[data].info.count;
}

async function showCount() {
    const [characters, episodes, locations] = await Promise.all([
        getDataCount("characters"),
        getDataCount("episodes"),
        getDataCount("locations")
    ]);
    document.getElementById("personagens").innerHTML = characters;
    document.getElementById("localizacoes").innerHTML = locations;
    document.getElementById("episodios").innerHTML = episodes;
}

showCount();

async function loadApiCards(name, currentPage) {
    const characters = await api.get(`${charactersURL}/?name=${name}&page=${currentPage}`);
    return characters.data.results;
}

let totalCards = 0;

async function buildCard() {
    const searchTerm = document.getElementById("search").value;
    document.getElementById("pages").innerHTML = currentPage;
    const cards = await loadApiCards(searchTerm, currentPage);
    document.getElementById("characters-container").innerHTML = "";
    let index = 0;
    totalCards = cards.length;

    renderButtons();

    for (const character of cards) {
        index++;
        const episodeName = await getEpisodeName(character.episode[character.episode.length - 1]);

        const article = document.createElement('article');
        article.classList.add('card');
        article.innerHTML = `
            <img class="character-image" src="${character.image}" alt="Character image">
            <div class="character-info">
                <div>
                    <h2>${character.name}</h2>
                    <h3>${getStatus(character)} - ${character.species}</h3>
                </div>
                <div>
                    <p style="color:#C0C0B0">Última localização conhecida:</p>
                    <h3>${character.location.name}</h3>
                </div>
                <div>
                    <p style="color:#C0C0B0">Visto a última vez em:</p>
                    <h3>${episodeName}</h3>
                </div>
            </div>
        `;
        
        article.addEventListener('click', function () {
            function buildModalContent(character) {
                return `
                    <img class="modal-character-image" src="${character.image}" alt="${character.name}">
                    <h2>${character.name}</h2>
                    <h3>${getStatus(character)} - ${character.species}</h3>
                    <p>Última localização conhecida:</p>
                    <h3>${character.location.name}</h3>
                    <p>Visto a última vez em:</p>
                    <h3>${episodeName}</h3>
                `;
            }
                        const modalBody = document.querySelector('.modal-body');
            modalBody.innerHTML = buildModalContent(character);
        
            var myModal = new bootstrap.Modal(document.getElementById('myModal'));
            myModal.show();
        });
        
        document.getElementById("characters-container").appendChild(article);
    }
}



function getStatus(cards) {
    if (cards.status == "Alive") {
        return `<span><b> <span style="color: #00FF00; font-size:1.4rem;">●</span> Vivo</b></span>`;
    }
    if (cards.status == "Dead") {
        return `<span><b> <span style="color: #FF0000; font-size:1.4rem;">●</span> Morto</b></span>`;
    } else {
        return `<span><b> <span style="color: #757575; font-size:1.4rem;">●</span> Desconhecido</b></span>`;
    }
}

function renderButtons() {
    const anteriorButton = document.getElementById("anterior");
    const proximaButton = document.getElementById("proxima");

    anteriorButton.classList.toggle("hidden", currentPage < 2);
    proximaButton.classList.toggle("hidden", totalCards < 20);

    if (totalCards > 19) {
        proximaButton.classList.remove("hidden");
    }
}

function next() {
    if (totalCards > 19) {
        currentPage++;
        buildCard();
    }
}

function previous() {
    if (currentPage > 1) {
        currentPage--;
        buildCard();
    }
}

document.getElementById("search").addEventListener("input", search);
function search() {
    currentPage = 1;
    buildCard();
}

document.getElementById("anterior").addEventListener("click", previous);
document.getElementById("proxima").addEventListener("click", next);

buildCard();
