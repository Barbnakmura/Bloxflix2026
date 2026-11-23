const navButtons = document.querySelectorAll(".nav-link");
const pageTitle = document.getElementById("pageTitle");
const emptyTitle = document.getElementById("emptyTitle");
const emptyText = document.getElementById("emptyText");
const searchInput = document.getElementById("searchInput");
const dialog = document.getElementById("infoDialog");
const toast = document.getElementById("toast");

const pages = {
  inicio: ["Em destaque", "Seu catálogo está esperando por você.", "Ainda não há filmes ou séries por aqui. Quando os títulos forem adicionados, eles aparecerão nesta área."],
  series: ["Séries", "Nenhuma série cadastrada ainda.", "As séries adicionadas ao Bloxflix aparecerão aqui."],
  filmes: ["Filmes", "Nenhum filme cadastrado ainda.", "Os filmes adicionados ao Bloxflix aparecerão aqui."],
  lista: ["Minha lista", "Sua lista está vazia.", "Quando você salvar algum título, ele aparecerá aqui."]
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
}

navButtons.forEach(button => {
  button.addEventListener("click", () => {
    navButtons.forEach(item => item.classList.remove("active"));
    button.classList.add("active");

    const [title, heading, description] = pages[button.dataset.page];

    pageTitle.textContent = title;
    emptyTitle.textContent = heading;
    emptyText.textContent = description;
    searchInput.value = "";
  });
});

document.getElementById("exploreButton").addEventListener("click", () => {
  document.getElementById("catalog").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});

document.getElementById("aboutButton").addEventListener("click", () => dialog.showModal());

document.getElementById("closeDialog").addEventListener("click", () => dialog.close());

document.getElementById("dialogOk").addEventListener("click", () => dialog.close());

document.getElementById("profileButton").addEventListener("click", () => {
  showToast("Perfil principal — Bloxflix");
});

searchInput.addEventListener("input", () => {
  const value = searchInput.value.trim();

  if (value) {
    emptyTitle.textContent = "Nenhum resultado encontrado.";
    emptyText.textContent = `Não encontramos "${value}". O catálogo está vazio por enquanto.`;
  } else {
    const active = document.querySelector(".nav-link.active");
    const [title, heading, description] = pages[active.dataset.page];

    emptyTitle.textContent = heading;
    emptyText.textContent = description;
  }
});
