
// ==========================================
// BLOXFLIX - SUPABASE
// ==========================================

const SUPABASE_URL = "https://qxxdchsqrovyshsbhrle.supabase.co";

// Cole sua chave Publishable do Supabase aqui.
const SUPABASE_PUBLIC_KEY = "sb_publishable_XgCwVJQsGT3yCY0v8xJ_Kg_G6JDgybc";

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
  lista: "Minha lista"
};

let titles = [];
let currentPage = "inicio";

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
// ESTADO VAZIO
// ==========================================

function showEmpty(title, description) {
  catalog.classList.remove("catalog-filled");

  catalog.innerHTML = "";

  const icon = document.createElement("div");
  icon.className = "empty-icon";
  icon.textContent = "▣";

  const heading = document.createElement("h3");
  heading.textContent = title;

  const paragraph = document.createElement("p");
  paragraph.textContent = description;

  catalog.append(icon, heading, paragraph);
}

// ==========================================
// CRIAR CARD
// ==========================================

function createCard(item) {
  const card = document.createElement("article");
  card.className = "title-card";

  if (item.cover_url) {
    const cover = document.createElement("img");

    cover.className = "title-cover";
    cover.alt = item.title || "Capa do título";
    cover.loading = "lazy";
    cover.src = item.cover_url;

    cover.onerror = () => {
      const placeholder = document.createElement("div");
      placeholder.className = "title-cover-placeholder";
      placeholder.textContent = "▣";
      cover.replaceWith(placeholder);
    };

    card.appendChild(cover);
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "title-cover-placeholder";
    placeholder.textContent = "▣";
    card.appendChild(placeholder);
  }

  const info = document.createElement("div");
  info.className = "title-info";

  const name = document.createElement("h3");
  name.textContent = item.title || "Sem título";

  const type = document.createElement("span");
  type.textContent =
    item.kind === "series" ? "Série" : "Filme";

  const description = document.createElement("p");
  description.textContent = item.description || "";

  info.append(name, type, description);
  card.appendChild(info);

  return card;
}

// ==========================================
// MOSTRAR CATÁLOGO
// ==========================================

function renderCatalog() {
  const search = searchInput.value.trim().toLowerCase();

  if (currentPage === "lista") {
    showEmpty(
      "Sua lista está vazia.",
      "Em breve você poderá salvar seus títulos favoritos."
    );
    return;
  }

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
        "Tente pesquisar por outro nome."
      );
    } else {
      showEmpty(
        "Seu catálogo está esperando por você.",
        "Os títulos adicionados ao Bloxflix aparecerão aqui."
      );
    }

    return;
  }

  catalog.innerHTML = "";
  catalog.classList.add("catalog-filled");

  const grid = document.createElement("div");
  grid.className = "title-grid";

  filtered.forEach(item => {
    grid.appendChild(createCard(item));
  });

  catalog.appendChild(grid);
}

// ==========================================
// CARREGAR DADOS DO SUPABASE
// ==========================================

async function loadTitles() {
  if (!window.supabase) {
    showEmpty(
      "Biblioteca não carregada.",
      "Não foi possível carregar a conexão com o Supabase."
    );
    return;
  }

  if (
    !SUPABASE_PUBLIC_KEY.startsWith("sb_publishable_") ||
    SUPABASE_PUBLIC_KEY === "COLE_SUA_PUBLISHABLE_KEY_AQUI"
  ) {
    showEmpty(
      "Chave não configurada.",
      "Confira a chave Publishable no script.js."
    );
    return;
  }

  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLIC_KEY
  );

  showEmpty("Carregando catálogo...", "Buscando filmes e séries.");

  const { data, error } = await supabaseClient
    .from("titles")
    .select("id,title,description,cover_url,kind,video_url,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro do Supabase:", error);

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

searchInput.addEventListener("input", renderCatalog);

// ==========================================
// BOTÕES
// ==========================================

document.getElementById("exploreButton")
  .addEventListener("click", () => {
    document.getElementById("catalog").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  });

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

document.getElementById("profileButton")
  .addEventListener("click", () => {
    showToast("Perfil principal — Bloxflix");
  });

// ==========================================
// INICIAR BLOXFLIX
// ==========================================

loadTitles();
