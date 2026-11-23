
// ==========================================
// BLOXFLIX
// ==========================================

const SUPABASE_URL = "https://qxxdchsqrovyshsbhrle.supabase.co";

// MANTENHA A SUA CHAVE PUBLISHABLE ATUAL AQUI
const SUPABASE_PUBLIC_KEY = "COLE_SUA_PUBLISHABLE_KEY_AQUI";

// ==========================================
// ELEMENTOS
// ==========================================

const navButtons = document.querySelectorAll(".nav-link");
const pageTitle = document.getElementById("pageTitle");
const catalog = document.getElementById("catalog");
const searchInput = document.getElementById("searchInput");
const dialog = document.getElementById("infoDialog");
const toast = document.getElementById("toast");

const pages = {
  inicio: "Em destaque",
  series: "Séries",
  filmes: "Filmes",
  lista: "Minha lista",
  sobre: "Sobre nós"
};

let titles = [];
let currentPage = "inicio";
let supabaseClient = null;

// ==========================================
// AVISOS
// ==========================================

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);

  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2300);
}

// ==========================================
// TELA VAZIA
// ==========================================

function showEmpty(title, description) {
  catalog.className = "catalog";

  const icon = document.createElement("div");
  icon.className = "empty-icon";
  icon.textContent = "▣";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const paragraph = document.createElement("p");
  paragraph.textContent = description;

  catalog.replaceChildren(icon, heading, paragraph);
}

// ==========================================
// PÁGINA SOBRE NÓS
// ==========================================

function renderAbout() {
  catalog.className = "catalog about-page";

  const content = document.createElement("div");
  content.className = "about-content";

  content.innerHTML = `
    <span class="about-label">NOSSA HISTÓRIA</span>

    <h2>Sobre nós.</h2>

    <p>
      Uma ideia que começou em 2023 e continua crescendo.
    </p>

    <h3>Nossa origem</h3>

    <p>
      A Bloxflix foi criada em 2023 por Davi e Gabriel,
      com o objetivo de desenvolver filmes e séries
      incríveis para o público.
    </p>

    <h3>Novas ideias, novos caminhos</h3>

    <p>
      Pouco tempo depois, Bárbara e Vitor se juntaram
      ao projeto, contribuindo com novas ideias,
      criatividade e propostas para expandir a Bloxflix
      — incluindo a ideia de criar este site, tornando
      nosso conteúdo mais acessível ao público.
    </p>

    <p>
      Hoje, seguimos trabalhando para transformar
      nossas ideias em entretenimento, criando histórias,
      desenvolvendo projetos e construindo um universo
      cada vez maior.
    </p>

    <div class="about-signature">BLOXFLIX</div>

    <p>Histórias começam aqui.</p>
  `;

  catalog.replaceChildren(content);
}

// ==========================================
// CRIAR CARD DE FILME OU SÉRIE
// ==========================================

function createCard(item) {
  const card = document.createElement("article");
  card.className = "title-card";

  if (item.cover_url) {
    try {
      const coverUrl = new URL(item.cover_url);

      if (coverUrl.protocol === "https:" || coverUrl.protocol === "http:") {
        const cover = document.createElement("img");

        cover.className = "title-cover";
        cover.alt = item.title || "Capa do título";
        cover.loading = "lazy";
        cover.src = coverUrl.href;

        cover.onerror = () => {
          const placeholder = document.createElement("div");
          placeholder.className = "title-cover-placeholder";
          placeholder.textContent = "▣";
          cover.replaceWith(placeholder);
        };

        card.appendChild(cover);
      } else {
        addPlaceholder(card);
      }
    } catch {
      addPlaceholder(card);
    }
  } else {
    addPlaceholder(card);
  }

  const info = document.createElement("div");
  info.className = "title-info";

  const name = document.createElement("h3");
  name.textContent = item.title || "Sem título";

  const type = document.createElement("span");
  type.textContent = item.kind === "series" ? "Série" : "Filme";

  const description = document.createElement("p");
  description.textContent = item.description || "";

  info.append(name, type, description);
  card.appendChild(info);

  return card;
}

function addPlaceholder(card) {
  const placeholder = document.createElement("div");
  placeholder.className = "title-cover-placeholder";
  placeholder.textContent = "▣";
  card.appendChild(placeholder);
}

// ==========================================
// MOSTRAR CATÁLOGO
// ==========================================

function renderCatalog() {
  if (currentPage === "sobre") {
    renderAbout();
    return;
  }

  if (currentPage === "lista") {
    showEmpty(
      "Sua lista está vazia.",
      "Em breve você poderá salvar seus títulos favoritos."
    );
    return;
  }

  const search = searchInput.value.trim().toLowerCase();

  const filtered = titles.filter(item => {
    const matchesSearch = (item.title || "")
      .toLowerCase()
      .includes(search);

    const matchesPage =
      currentPage === "inicio" ||
      (currentPage === "series" && item.kind === "series") ||
      (currentPage === "filmes" && item.kind === "movie");

    return matchesSearch && matchesPage;
  });

  if (filtered.length === 0) {
    if (search) {
      showEmpty(
        "Nenhum resultado encontrado.",
        "Não encontramos esse título. Tente pesquisar por outro nome."
      );
    } else if (currentPage === "series") {
      showEmpty(
        "Nenhuma série cadastrada ainda.",
        "As séries adicionadas ao Bloxflix aparecerão aqui."
      );
    } else if (currentPage === "filmes") {
      showEmpty(
        "Nenhum filme cadastrado ainda.",
        "Os filmes adicionados ao Bloxflix aparecerão aqui."
      );
    } else {
      showEmpty(
        "Seu catálogo está esperando por você.",
        "Os filmes e séries adicionados ao Bloxflix aparecerão aqui."
      );
    }

    return;
  }

  catalog.className = "catalog catalog-filled";

  const grid = document.createElement("div");
  grid.className = "title-grid";

  filtered.forEach(item => {
    grid.appendChild(createCard(item));
  });

  catalog.replaceChildren(grid);
}

// ==========================================
// CONEXÃO COM SUPABASE
// ==========================================

async function loadTitles() {
  if (!window.supabase) {
    showEmpty(
      "Conexão indisponível.",
      "Não foi possível carregar a biblioteca do Bloxflix."
    );
    return;
  }

  if (
    !SUPABASE_PUBLIC_KEY.startsWith("sb_publishable_") ||
    SUPABASE_PUBLIC_KEY === "COLE_SUA_PUBLISHABLE_KEY_AQUI"
  ) {
    showEmpty(
      "Chave não configurada.",
      "Confira a chave Publishable no arquivo script.js."
    );
    return;
  }

  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLIC_KEY
  );

  showEmpty(
    "Carregando catálogo...",
    "Buscando filmes e séries."
  );

  const { data, error } = await supabaseClient
    .from("titles")
    .select("id,title,description,cover_url,kind,video_url,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar títulos:", error);

    showEmpty(
      "Não foi possível carregar o catálogo.",
      "Verifique as permissões de leitura da tabela titles no Supabase."
    );

    return;
  }

  titles = data || [];

  renderCatalog();
}

// ==========================================
// NAVEGAÇÃO
// ==========================================

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    navButtons.forEach(item => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    currentPage = button.dataset.page;
    pageTitle.textContent = pages[currentPage];

    searchInput.value = "";

    renderCatalog();
  });
});

// ==========================================
// PESQUISA
// ==========================================

searchInput.addEventListener("input", () => {
  renderCatalog();
});

// ==========================================
// BOTÃO EXPLORAR
// ==========================================

document.getElementById("exploreButton")
  .addEventListener("click", () => {
    document.getElementById("catalog").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });

// ==========================================
// BOTÕES SOBRE
// ==========================================

document.getElementById("aboutButton")
  .addEventListener("click", () => {
    dialog.showModal();
  });

document.getElementById("closeDialog")
  .addEventListener("click", () => {
    dialog.close();
  });

document.getElementById("dialogOk")
  .addEventListener("click", () => {
    dialog.close();
  });

// ==========================================
// PERFIL
// ==========================================

document.getElementById("profileButton")
  .addEventListener("click", () => {
    showToast("Perfil principal — Bloxflix");
  });

// ==========================================
// INICIAR
// ==========================================

loadTitles();
