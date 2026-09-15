const fields = ["pergunta", "explicacao", "acao"].map((id) => document.getElementById(id));
const result = document.getElementById("resultado");
const summary = document.getElementById("resumo");
const printSummary = document.getElementById("print-summary");
const status = document.getElementById("status");
const copyButton = document.getElementById("copiar");

function makeSummary() {
  const [question, explanation, action] = fields.map((field) => field.value.trim());
  return [
    "INTUIÇÃO — ENTENDER → AGIR",
    "",
    "1. O que quero entender?",
    question || "Ainda vou escolher minha pergunta.",
    "",
    "2. Como explico com minhas palavras?",
    explanation || "Ainda não sei. Este é meu ponto de partida.",
    "",
    "3. Qual pequena ação posso fazer?",
    action || "Escolher um passo simples para começar.",
  ].join("\n");
}

function updateSummary() {
  summary.value = makeSummary();
  printSummary.textContent = summary.value;
}

document.getElementById("learning-form").addEventListener("submit", (event) => {
  event.preventDefault();
  updateSummary();
  result.hidden = false;
  status.textContent = "Resumo pronto. Você pode voltar às respostas e ajustá-las.";
  document.getElementById("resumo-titulo").focus();
});

for (const field of fields) {
  field.addEventListener("input", () => {
    if (!result.hidden) {
      updateSummary();
      status.textContent = "Resumo atualizado com suas alterações.";
    }
  });
}

copyButton.addEventListener("click", async () => {
  updateSummary();
  copyButton.disabled = true;
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(summary.value);
    status.textContent = "Resumo copiado. Cole onde quiser guardar ou compartilhar.";
  } catch {
    summary.focus();
    summary.select();
    summary.setSelectionRange(0, summary.value.length);
    status.textContent = "Resumo selecionado. Use Copiar no seu dispositivo (ou Ctrl/Cmd + C).";
  } finally {
    copyButton.disabled = false;
  }
});

document.getElementById("imprimir").addEventListener("click", () => {
  updateSummary();
  window.print();
});
