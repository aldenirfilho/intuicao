# Intuição

**Entender. Experimentar. Agir.**

Uma iniciativa educativa para transformar conceitos difíceis em experiências visuais e compreensíveis, compartilhando ferramentas de estudo que estimulem curiosidade, autonomia e raciocínio crítico.

## As três bases aprovadas

1. **Projeto Intuição:** um espaço educativo para aprender com exemplos claros e interativos.
2. **Ideia central:** tornar o que parece difícil mais compreensível, em pequenos passos.
3. **Proposta:** compartilhar ferramentas de estudo que ajudem cada pessoa a perguntar, compreender e pensar por si.

**O que importa é a atitude:** começar com uma ação pequena, observar se foi útil e melhorar com as pessoas. A boa intenção orienta; a compreensão e os resultados ajudam a avaliar o caminho.

## Primeiro passo já preparado

A **Ficha Entender → Agir**, em `inicio/index.html`, trabalha três perguntas:

- O que quero entender?
- Como explico com minhas palavras?
- Qual pequena ação posso fazer?

A ficha tem um exemplo simples, um resumo copiável e uma versão para impressão. Não envia respostas a um servidor e não as salva automaticamente. Para guardar ou compartilhar, a própria pessoa copia ou imprime seu resumo.

## Situação

**Protótipo inicial para revisão. A publicação desta versão ainda não foi executada.**

As propostas de probabilidade, cifra, CCV/UFC e ENEM/SiSU estão **arquivadas para análise futura**, sem aprovação para integrar a fase atual. Seus arquivos originais foram preservados nos mesmos caminhos. O novo pacote do site inclui somente `inicio/`, sem módulos ou downloads antigos.

- [Proposta ampliada e primeiro ciclo de trabalho](docs/PROJETO-INTUICAO.md)
- [Registro das propostas adiadas](docs/arquivo/PROPOSTAS-ADIADAS.md)
- [Apresentação anterior preservada](docs/arquivo/README-anterior.md)
- [Estado da preparação e publicação](docs/ENTREGA.md)

## Desenvolvimento da fase inicial

Abra `inicio/index.html` no navegador ou execute `node scripts/build-inicio.mjs` para gerar `_site/` usando somente as ferramentas nativas do Node.js. Não é necessário instalar as dependências da aplicação anterior para essa ficha.

O workflow prepara e valida os arquivos em pushes e pull requests. A publicação só pode ocorrer por execução manual em `main`, com a opção **Publicar o início aprovado** explicitamente marcada e com Pages previamente habilitado. O padrão é **não publicar**.
