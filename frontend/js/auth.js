document.querySelectorAll("[data-toggle]").forEach(b => {
  b.addEventListener("click", () => {
    const input = document.getElementById(b.dataset.toggle);
    const mostrar = input.type === "password";
    input.type = mostrar ? "text" : "password";
    b.textContent = mostrar ? "Ocultar" : "Mostrar";
  });
});

const form = document.querySelector("form[data-form]");

// no cadastro, mostra os campos de estudante ou de mentor conforme o tipo escolhido
const tipoConta = form?.elements["tipo"];
function mostrarGrupos() {
  document.querySelectorAll("[data-grupo]").forEach(g => {
    const ativo = g.dataset.grupo === tipoConta.value;
    g.hidden = !ativo;
    g.querySelectorAll("input").forEach(i => { i.disabled = !ativo; }); // desativado = nao entra na validacao
  });
}
tipoConta?.addEventListener("change", mostrarGrupos);
if (tipoConta) mostrarGrupos();

// cada tipo de utilizador abre na sua pagina
const paginaInicial = { estudante: "feed.html", mentor: "mentor.html", admin: "admin.html" };

form?.addEventListener("submit", async e => {
  e.preventDefault();
  const msg = form.querySelector(".msg");
  const erro = t => mostrarMsg(msg, t, false);
  const v = n => form.elements[n]?.value.trim();

  if (!form.checkValidity()) return erro("Preenche todos os campos obrigatórios com dados válidos.");

  const password = form.elements["password"].value;

  if (form.dataset.form === "cadastro") {
    if (password.length < 8) return erro("A palavra-passe deve ter pelo menos 8 caracteres.");
    if (password !== form.elements["confirmar"].value) return erro("As palavras-passe não coincidem.");
  }

  const botao = form.querySelector('button[type="submit"]');
  botao.disabled = true;
  try {
    if (form.dataset.form === "login") {
      const r = await pedir("/loginUser", { method: "POST", corpo: { email: v("email"), password } });
      sessao.guardar({ token: r.token, nome: r.nome, tipo: r.tipo }, form.elements["lembrar"].checked);
      mostrarMsg(msg, r.mensagem, true);
      location.href = paginaInicial[r.tipo] || "feed.html";
    } else {
      // os nomes dos campos sao os mesmos que o backend espera
      const corpo = { nome: v("nome"), email: v("email"), contacto: v("contacto"), password };
      if (v("tipo") === "estudante") {
        corpo.curso = v("curso");
        corpo.media_ensinomedio = Number(v("media_ensinomedio"));
      } else {
        corpo.formacao = v("formacao");
      }
      await pedir("/cadastro/" + v("tipo"), { method: "POST", corpo });
      mostrarMsg(msg, "Conta criada com sucesso. A abrir o login…", true);
      setTimeout(() => { location.href = "login.html"; }, 1200);
    }
  } catch (err) {
    erro(err.message);
    botao.disabled = false;
  }
});
