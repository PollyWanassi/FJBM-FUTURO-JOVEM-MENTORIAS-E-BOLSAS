const header = document.querySelector("header");
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 0));

const botao = document.querySelector(".menu-btn");
botao?.addEventListener("click", () => {
  const aberto = header.classList.toggle("aberto");
  botao.setAttribute("aria-expanded", aberto);
});
header.querySelectorAll("nav a").forEach(a => a.addEventListener("click", () => {
  header.classList.remove("aberto");
  botao?.setAttribute("aria-expanded", "false");
}));

const formAjuda = document.querySelector(".form-ajuda");
formAjuda?.addEventListener("submit", e => {
  e.preventDefault();
  const msg = formAjuda.querySelector(".msg");
  msg.textContent = "Pedido enviado. Responderemos para o teu email.";
  msg.className = "msg ok";
  formAjuda.reset();
});
