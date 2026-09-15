# Estado da revisão — Intuição

Preparada em 15 de setembro de 2026.

## Entregas

- Escopo concentrado nas três bases aprovadas.
- Primeiro protótipo: Ficha Entender → Agir, com exemplo, resumo e impressão.
- Propostas técnicas registradas como adiadas, com originais preservados.
- Pacote de publicação limitado aos arquivos de `inicio/`.
- Publicação condicionada a uma execução manual explícita em `main`.

## Publicação

Esta revisão é preparada em uma branch separada para revisão. Criar a branch ou abrir a proposta de alteração não publica o site. O workflow revisado pode validar a proposta, mas sua etapa de publicação fica desativada em pushes e pull requests.

O diagnóstico anterior de Pages permanece uma pendência independente: o repositório retornava `has_pages: false`, e o deploy do run `34974039775` falhou com HTTP 404. A conexão usada nesta tarefa não oferece a operação para ativar Pages. Não foi feita mudança nessa configuração.

Não repetir o deploy do pacote antigo: ele contém as propostas agora adiadas. Uma eventual publicação deve usar o pacote desta fase, após incorporar a revisão aprovada e habilitar Pages com origem GitHub Actions.

## Uso e limites

A ficha roda sem dependências externas. As respostas permanecem apenas na página aberta; não há salvamento automático, conta, envio de dados ou sincronização. A pessoa pode selecionar e copiar o resumo ou imprimir. Recarregar a página descarta as respostas.

Esse protótipo permite uma primeira experiência de uso. Não constitui validação pedagógica; a experimentação com pessoas ainda está pendente.

## Verificação realizada

- Sintaxe do JavaScript e construção local concluídas.
- Pacote conferido: `index.html`, `styles.css`, `app.js`, `404.html` e `.nojekyll`; nenhum conteúdo técnico adiado incluído.
- Arquivos originais conferidos contra a versão-base; cópias do README e do workflow anteriores idênticas aos originais.
- YAML conferido: publicação desabilitada para push e pull request, e desabilitada por padrão na execução manual.
- Comportamentos verificados em DOM simulado: preenchimento vazio, geração e atualização do resumo, texto tratado como texto, cópia, alternativa quando a cópia é bloqueada e chamada de impressão.
- **Revisão visual pendente:** o navegador remoto bloqueou o acesso à prévia local com `ERR_BLOCKED_BY_CLIENT`. Layout em celular e impressão não foram inspecionados visualmente.
