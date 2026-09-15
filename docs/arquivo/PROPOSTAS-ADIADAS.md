# Propostas adiadas — preservar para avaliar

**Decisão de escopo: 15 de setembro de 2026.**

Os temas abaixo não foram aprovados para a fase inicial. Adiar não significa confirmar nem rejeitar seu mérito. Significa não avançar antes de uma avaliação compreensível por pessoas capacitadas.

## Preservação

Base anterior: commit `eadb2583bc9dcc15da50a2540f89a3ade0a1e7b1`.

Todos os arquivos anteriores de `src/`, `public/`, `server/`, `migrations/`, as dependências e as configurações da aplicação foram mantidos nos mesmos caminhos e sem alterações de conteúdo. Este é um arquivamento por status e exclusão do pacote ativo, sem mover ou apagar os originais.

O README e o workflow anteriores têm cópias integrais nesta pasta. A nova fase usa `inicio/`, e o construtor do pacote permite apenas os três arquivos dessa ficha. Não basta ocultar links: os arquivos dos módulos adiados também não são copiados para `_site/`.

O repositório de origem já é público. Este registro não transforma seus arquivos em privados. A publicação desta revisão não foi executada.

## Inventário

| Proposta | Caminhos preservados | O que falta avaliar |
| --- | --- | --- |
| Simulações de probabilidade | `src/components/simulator.tsx`, `src/lib/probability.ts` | Objetivo didático, precisão, compreensão e utilidade para o público |
| Cifra pedagógica e material Bíblia 365/TEMI 360 | `src/components/ecc-panel.tsx`, `src/lib/ecc.ts`, `src/lib/cipher-data.json`, `public/downloads/` | Finalidade, correção, apresentação, direitos de uso e compreensão do caráter pedagógico |
| Caderno CCV/UFC | `src/components/ccv-panel.tsx`, `src/components/sigma-lab.tsx`, `src/lib/ccv.ts`, `src/lib/ccv-formula.ts` | Validade das fórmulas, fontes originais, contexto histórico e limites de aplicação |
| ENEM/SiSU e TRI | `src/components/tri-panel.tsx`, `src/lib/tri.ts` | Evidências, cálculos, limites das simulações e distinção dos processos oficiais |
| Publicação do conjunto anterior | `docs/arquivo/pages-anterior.yml`, aplicação original | Avaliação de cada módulo, autorização de escopo e validação do que será exposto |

As rotas anteriores continuam preservadas em `src/routes/`. Executar o ambiente antigo manualmente pode exibir esses módulos; isso não equivale à aprovação de sua retomada. O início aprovado e o workflow revisado não os utilizam.

## Futura revisão humana

Equipe ainda não constituída. Conforme o tema, buscar competência em educação, acessibilidade e no assunto específico. Boa intenção é desejável e deve vir acompanhada de transparência, capacidade técnica e abertura para correções.

Cada proposta precisa de uma avaliação separada:

- Qual problema pretende resolver e para quem?
- Que fontes e verificações sustentam sua correção?
- Uma pessoa sem formação técnica entende seu funcionamento e seus limites?
- Quais benefícios foram observados e quais permanecem apenas esperados?
- Há limitações, conflitos de interesse, direitos ou riscos concretos a resolver?
- Qual é a recomendação: retomar, revisar, manter adiada ou não desenvolver?

Registrar responsável, data, fontes, conclusão e pendências. Apresentar a conclusão em linguagem simples ao idealizador antes de reintegrar qualquer tema. Não retomar automaticamente por prazo, entusiasmo ou disponibilidade de código.
