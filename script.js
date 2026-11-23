
// ==========================================
// BLOXFLIX - CONEXÃO COM SUPABASE
// ==========================================

const SUPABASE_URL = "https://qxxdchsqrovyshsbhrle.supabase.co";

// Sua chave pública (Publishable)
const SUPABASE_PUBLIC_KEY = "sb_publishable_XgCwVJQsGT3yCY0v8xJ_Kg_G6JDgybc";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLIC_KEY
);

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
// MOSTRAR CATÁLOGO
// ==========================================

function renderCatalog() {
  const search = searchInput.value.trim().toLowerCase();

  let filtered = titles.filter(item => {
    const matchesSearch = (item.title || "")
      .toLowerCase()
      .includes(search);

    const matchesPage =
      currentPage === "inicio" ||
      (currentPage === "series" && item.kind === "series") ||
      (currentPage === "filmes" && item.kind === "movie");

    return matchesSearch && matchesPage;
  });

  if (currentPage === "lista") {
    catalog.innerHTML = `
      <div class="empty-icon">▣</div>
      <h3>Minha lista está vazia.</h3>
      <p>Em breve você poderá salvar seus títulos favoritos.</p>
    `;
    return;
  }

  if (filtered.length === 0) {
    catalog.innerHTML = `
      <div class="empty-icon">▣</div>
      <h3>${search ? "Nenhum resultado encontrado." : "Seu catálogo está esperando por você."}</h3>
      <p>${search ? "Tente pesquisar por outro nome." : "Os títulos adicionados ao Bloxflix aparecerão aqui."}</p>
    `;
    return;
  }

  catalog.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "title-grid";

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "title-card";

    const cover = document.createElement("img");
    cover.className = "title-cover";
    cover.alt = item.title || "Capa";
    cover.src = item.cover_url || "";

    cover.onerror = () => {
      cover.style.display = "none";
    };

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
    card.append(cover, info);
    grid.appendChild(card);
  });

  catalog.appendChild(grid);
}

// ==========================================
// BUSCAR TÍTULOS NO SUPABASE
// ==========================================

async function loadTitles() {
  catalog.innerHTML = "<p>Carregando catálogo...</p>";

  const { data, error } = await supabaseClient
    .from("titles")
    .select("id,title,description,cover_url,kind,video_url")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar títulos:", error);

    catalog.innerHTML = `
      <div class="empty-icon">!</div>
      <h3>Não foi possível carregar o catálogo.</h3>
      <p>Verifique as permissões do Supabase.</p>
    `;
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
// INICIAR
// ==========================================

loadTitles();
