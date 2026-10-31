# SP Suporte

Site estático em HTML, CSS e JavaScript, sem dependências nem compilação. Publicado em https://www.spsuporte.pt.

## Estrutura
- `index.html`: página principal
- `privacidade.html`: política de privacidade
- `404.html`: página de erro
- `styles.css` e `main.js`: estilos e comportamento partilhados
- `assets/`: capturas dos projetos, imagem de partilha, ícones e a fonte Manrope (licença SIL OFL em `assets/fonts/LICENSE.txt`)
- `vercel.json`: cabeçalhos de segurança
- `robots.txt` e `sitemap.xml`: indexação

## Testar localmente
Os caminhos começam em `/`, por isso o site tem de ser servido a partir de um servidor local:

```
npx serve .
```

## Contacto
O formulário abre o WhatsApp +351 964 848 813 com a mensagem preenchida. O visitante precisa de confirmar o envio no WhatsApp; o site não guarda os pedidos.

## Alterações frequentes
- Ao alterar o conteúdo de uma página, atualize `lastmod` em `sitemap.xml`.
- Ao adicionar um script, estilo, imagem ou ligação de outro domínio carregada pela página, atualize a política `Content-Security-Policy` em `vercel.json`.
- Se começar a usar cookies ou ferramentas de análise, atualize `privacidade.html`.
