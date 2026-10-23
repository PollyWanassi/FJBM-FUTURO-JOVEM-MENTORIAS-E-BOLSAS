document.querySelectorAll("[data-toggle]").forEach(b => {
  b.addEventListener("click", () => {
    const input = document.getElementById(b.dataset.toggle);
    const mostrar = input.type === "password";
    input.type = mostrar ? "text" : "password";
    b.textContent = mostrar ? "Ocultar" : "Mostrar";
  });
});

const form = document.querySelector("form[data-form]");
form?.addEventListener("submit", e => {
  e.preventDefault();
  const msg = form.querySelector(".msg");
  const erro = t => { msg.textContent = t; msg.className = "msg erro"; };
  const v = n => form.elements[n]?.value.trim();

  if (!form.checkValidity()) return erro("Preenche todos os campos obrigatórios com dados válidos.");

  if (form.dataset.form === "cadastro") {
    if (v("senha").length < 8) return erro("A palavra-passe deve ter pelo menos 8 caracteres.");
    if (v("senha") !== v("confirmar")) return erro("As palavras-passe não coincidem.");
  }
  msg.textContent = form.dataset.form === "login" ? "Dados válidos. Falta ligar ao servidor." : "Conta validada. Falta ligar ao servidor.";
  msg.className = "msg ok";
  // TODO: enviar os dados ao servidor (fetch) quando o backend existir
});
