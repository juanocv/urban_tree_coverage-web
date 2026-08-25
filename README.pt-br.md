> 🇬🇧 **English:** [Read this page in English](README.md)

# Urban Tree Coverage — console web

Front-end estático para a API web do
[Urban Tree Coverage](https://github.com/juanocv/urban_canopy). Recebe um local,
envia para uma instância da API executada por você e apresenta o que volta: o
indicador de cobertura, as imagens da segmentação, a dispersão entre vistas e a
proveniência que torna um número reproduzível.

O site não calcula nada. Todo valor exibido foi produzido pela API, e um valor
que a API reporta como indisponível aparece como indisponível — nunca é
substituído por outro número.

## O que faz

**Entradas obrigatórias**

| Campo | Observações |
|---|---|
| Local | Um endereço (geocodificado pela API) **ou** um par latitude/longitude. Mutuamente exclusivos, como a própria API exige. |
| Estratégia de vistas | `Vista única` → `POST /analyse/single`; `Multivista` → `POST /analyse/multi`. |

**Entradas opcionais**

| Campo | Padrão | Vale para |
|---|---|---|
| `heading` (direção) | 0° | vista única |
| `reference_heading` (direção de referência) | 0° | multivista |
| `mode` (`offsets` / `equiangular`) | `offsets` | multivista |
| `offsets` (deslocamentos) | `0, 90, 180, 270` | multivista, modo `offsets` |
| `n_views` (nº de vistas) | 4 | multivista, modo `equiangular` |
| `min_successful_views` | 1 | multivista |
| `pitch` (inclinação) | 0° | ambos |
| `fov` (campo de visão) | 90° | ambos |
| `size` (tamanho) | `640x640` | ambos |
| `refine` (refinar máscara) | ligado | ambos |
| `allow_vegetation_proxy` | desligado | ambos |
| `return_overlays` | ligado | ambos |

**Saídas**

- Cobertura arbórea como anel e percentual em destaque, com a cobertura de
  vegetação ao lado e uma etiqueta dizendo de onde veio a medida
  (`classe de árvore`, `proxy de vegetação` ou `indisponível`).
- Na vista única: o quadro RGB, a sobreposição de árvores, a máscara refinada e
  um comparador deslizante entre o quadro e a sobreposição.
- Na multivista: um gráfico polar cujo raio é a cobertura por direção, um cartão
  por vista, uma barra de dispersão interquartil e a tabela agregada completa
  (média, mediana, p25, p75, IIQ, desvio-padrão, mínimo, máximo) para árvore e
  vegetação.
- Com `return_overlays` ligado, a multivista também mostra um quadro por direção
  numa galeria. Uma única barra de abas comanda todas as miniaturas ao mesmo
  tempo, então o que o olho compara entre direções é sempre a mesma camada;
  clicar numa miniatura abre aquela direção em tamanho cheio, com seu próprio
  comparador deslizante.
- Contabilidade do refinamento: área bruta, área refinada, componentes
  removidos, buracos preenchidos e se a trava de crescimento foi acionada.
- Proveniência da captura (id do panorama, data, coordenadas) e do backend
  (backend, checkpoint, espaço de classes, dispositivo, SHA-256 do checkpoint,
  taxonomia e sua origem).
- Sinalizadores de qualidade, cada um com a explicação do que significa.
- Exportação em JSON ou CSV — o CSV usa a mesma ordem de colunas do `views.csv`
  da CLI, então os arquivos são intercambiáveis com a saída do `tree-ai` — além
  de copiar como cURL e um link que restaura a consulta.

A interface é bilíngue (pt-BR / inglês), segue o tema claro/escuro do sistema
com ajuste manual e funciona até 375 px de largura.

## Configurando a conexão

Tudo que diz respeito a alcançar a API vive num único popup, aberto pelo pill de
status no cabeçalho — ele serve tanto de porta de entrada quanto de indicador,
mostrando **Sem conexão** até um teste passar e **Conectado** depois disso.

### O endereço da API

O endereço vem preenchido a partir do `assets/js/config.js`. Uma página estática
não consegue ler `.env` em tempo de execução — não há servidor para lê-lo nem
etapa de build para embuti-lo —, então o `config.js` é a contraparte publicada
desse arquivo, escrita pelo `scripts/sync-config.py`. Nada secreto entra ali:
todo visitante recebe esse arquivo. Neste repositório, só as chaves `UC_WEB_*`
significam alguma coisa; `UC_API_TOKENS` e `UC_API_CORS_ORIGINS` são
configurações do servidor e pertencem ao `.env` do `urban_canopy`, onde a API de
fato as lê.

Há duas formas de definir o endereço publicado. As duas usam o mesmo script e
podem ser combinadas.

**Variável de repositório, aplicada na publicação.** O endereço não fica no
repositório de forma alguma. Em *Settings → Secrets and variables → Actions →
Variables*, crie `UC_WEB_API_BASE_URL`; o workflow do Pages regera o `config.js`
a partir dela a cada deploy. Trocar o endereço passa a ser editar uma
configuração e reexecutar o workflow — sem commit. Variável e não secret é a
escolha certa aqui: o endereço é servido a todo visitante de qualquer forma, e
quem realmente protege a API é o token.

**`config.js` commitado, gerado localmente.** Coloque o valor no `.env`, rode o
script e commite o resultado:

```bash
UC_WEB_API_BASE_URL=https://urban-tree-coverage.tail6b2e17.ts.net
```

```bash
python scripts/sync-config.py
```

A variável de ambiente sobrepõe o `.env` quando ambos existem, e é isso que faz as
duas formas se comporem: o arquivo commitado é o padrão, e a CI o sobrescreve
quando a variável de repositório existe. Quando nenhuma das duas está definida —
uma execução de CI sem variável configurada — o script deixa o `config.js`
exatamente como foi commitado, de modo que uma variável ausente nunca substitui
silenciosamente um endereço que funciona pelo `localhost`.

O campo começa bloqueado, porque o padrão publicado normalmente é o certo. O
botão **Alterar** o destrava apenas naquele navegador; o valor fica guardado no
`localStorage` e o campo volta a travar sempre que o popup é fechado. Se o
`config.js` for republicado depois com outro endereço, um override antigo do
navegador é descartado em vez de encobrir silenciosamente o novo padrão — do
contrário, editar o `.env` pareceria não surtir efeito.

Restam duas saídas de emergência: `?api=https://...` sobrescreve tudo para um
link específico, e limpar os dados do site volta ao padrão publicado.

### O token de acesso

Digitado no mesmo popup e guardado no `localStorage`. Ele deliberadamente nunca
é escrito no repositório, na query string nem no link compartilhável — um site
estático não consegue guardar segredo, então o segredo pertence a quem usa, não
à publicação.

## Executando a API

O site é estático e não tem backend próprio. Suba a API a partir do repositório
[urban_canopy](https://github.com/juanocv/urban_canopy):

```bash
python -m pip install -e ".[api,ml]"
uvicorn urban_canopy.webapi:app --host 127.0.0.1 --port 8000
```

Depois libere a origem deste site no CORS da API, pelo `.env`:

```bash
UC_API_CORS_ORIGINS=https://juanocv.github.io
```

Cole o endereço da API no campo **Conexão com a API**. Ele fica guardado no
`localStorage`, e `?api=http://127.0.0.1:8000` sobrescreve por link.

As imagens dominam o tamanho da resposta — cerca de um megabyte de PNG por
quadro, três quadros por vista —, então o `/analyse/multi` recusa planos acima de
`UC_API_MAX_OVERLAY_VIEWS` (padrão 8) quando há pedido de imagens. O console
avisa antes de você enviar um plano assim, mas o servidor continua sendo a
autoridade: aumente essa configuração e uma varredura maior funciona.

> A API não tem autenticação e chama uma API paga do Google a cada requisição.
> Mantenha-a em localhost ou atrás de um proxy.

### HTTPS e conteúdo misto

Uma página servida por HTTPS só pode fazer requisições HTTP simples para
`localhost` ou `127.0.0.1`, que os navegadores tratam como origens confiáveis.
Essa combinação — o site no GitHub Pages, a API na sua máquina — funciona. Uma
API em outro host por HTTP simples é bloqueada pelo navegador; o site detecta
esse caso e avisa, em vez de falhar em silêncio. Sirva uma API assim por HTTPS.

## Acessando de qualquer lugar

O console roda no GitHub Pages por HTTPS, então a API que ele chama também
precisa estar em HTTPS — um navegador não deixa uma página HTTPS chamar HTTP
simples em nada que não seja `localhost`. Um IPv4 público sozinho não resolve
isso: certificados confiáveis são emitidos para nomes, não para endereços nus.

Dois túneis resolvem isso sem IP público nem porta aberta no roteador, ambos
fazendo uma conexão de saída a partir da máquina que já roda o modelo. Escolha
um:

| | Tailscale Funnel | Cloudflare Tunnel |
|---|---|---|
| Endereço fixo | sim, de graça | exige domínio próprio (~US$ 10/ano) |
| Hostname | `maquina.tailnet.ts.net` | qualquer nome no seu domínio |
| Sobe junto com a máquina | sim, o `tailscaled` já é serviço | precisa de `cloudflared service install` |
| Identidade além do token | ACLs do Tailscale | Cloudflare Access |

O túnel rápido da Cloudflare (`--url`) é gratuito, mas o endereço muda a cada
reinício, o que o torna inadequado como padrão publicado. Um hostname permanente
na Cloudflare exige um domínio na sua conta, porque o CNAME para
`<UUID>.cfargotunnel.com` só resolve dentro da rede da Cloudflare — serviços de
subdomínio grátis não substituem isso. O Tailscale Funnel dá um hostname estável
com TLS válido sem custo, e por isso aparece primeiro abaixo.

### 1. Ligue a autenticação

Gere um token e coloque no `.env` da API:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

```bash
UC_API_TOKENS=<o-token-que-você-gerou>
UC_API_CORS_ORIGINS=https://juanocv.github.io
```

`UC_API_TOKENS` aceita uma lista separada por vírgulas, então cada pessoa ou
máquina pode ter um token distinto e você revoga um sem mexer nos outros. Com ele
definido, `/ready` e os dois endpoints `/analyse` exigem
`Authorization: Bearer <token>`; o `GET /ping` continua aberto para que
verificações de uptime e a sonda de saúde do próprio túnel sigam funcionando. A
inicialização registra qual modo está ativo — se o log disser que a autenticação
está desligada, a instância está aberta para quem a encontrar.

### 2. Suba a API restrita ao localhost

```bash
uvicorn urban_canopy.webapi:app --host 127.0.0.1 --port 8000
```

Mantenha o `127.0.0.1`. O túnel conecta a partir da mesma máquina, então a API
nunca precisa escutar numa interface pública.

### 3. Exponha o serviço via _tunneling_

**Tailscale Funnel** — hostname estável, gratuito, sem precisar de domínio:

```bash
winget install --id tailscale.tailscale
```

```bash
tailscale funnel 8000
```

O Funnel precisa ser habilitado uma vez nas ACLs do tailnet; o comando aponta o
link exato caso não esteja. O `https://<maquina>.<tailnet>.ts.net` resultante
não muda entre reinícios, e o `tailscaled` já roda como serviço, então o túnel
volta junto com a máquina.

**Cloudflare Tunnel** — para um hostname num domínio seu. Um endereço
descartável para testar:

```bash
cloudflared tunnel --url http://127.0.0.1:8000
```

Isso imprime um `https://<aleatório>.trycloudflare.com` que dura apenas enquanto
o comando estiver rodando. Para um permanente (pago), contra um domínio da sua conta
Cloudflare:

```bash
cloudflared tunnel login
```

```bash
cloudflared tunnel create urban-canopy
```

```bash
cloudflared tunnel route dns urban-canopy canopy.exemplo.org
```

Depois escreva o `~/.cloudflared/config.yml`, apontando o hostname para a porta
local e terminando com uma regra catch-all, que o `cloudflared` exige:

```yaml
tunnel: urban-canopy
credentials-file: C:/Users/voce/.cloudflared/<UUID>.json

ingress:
  - hostname: canopy.exemplo.org
    service: http://127.0.0.1:8000
  - service: http_status:404
```

```bash
cloudflared tunnel run urban-canopy
```

Para sobreviver a reinícios, instale como serviço (shell como administrador):

```bash
cloudflared service install
```

Em qualquer um dos dois, a API em si continua sendo um processo que você inicia;
o serviço do túnel voltar no boot não traz o `uvicorn` junto.

### 4. Aponte o console ao novo endereço

Coloque o endereço no `.env`, regere o `config.js` e commite:

```bash
python scripts/sync-config.py
```

Depois abra o site, clique no pill de status, cole o token em **Token de
acesso** e clique em **Testar conexão**. O pill passa a mostrar **Conectado**.
Para um endereço pontual, que não deva virar o padrão publicado, use o botão
**Alterar** e digite-o.

O token nunca é escrito no repositório, na query string nem no link
compartilhável — um site estático não consegue guardar segredo, então o segredo
pertence a quem usa, não à publicação. O **Copiar cURL** segue a mesma regra:
emite `$UC_API_TOKEN` em vez do valor literal.

### O que isso protege e o que não protege

Um token bearer atrás de TLS impede que estranhos gastem sua cota do Street View,
que é o principal risco de colocar isso no ar. Não é um sistema completo de
controle de acesso:

- **Não há limite de taxa.** O `UC_API_MAX_CONCURRENCY` limita quantas
  inferências rodam ao mesmo tempo, não quantas um portador de token pode fazer
  por dia. Defina um teto de orçamento no console do Google Cloud e acrescente
  uma regra de rate limiting na Cloudflare se o endpoint for compartilhado.
- **Token é segredo ao portador.** Quem o tem, é você. Para rotacionar, edite o
  `UC_API_TOKENS` e reinicie.
- **Identidade de verdade** está disponível nos dois provedores, se um token
  compartilhado não bastar: Cloudflare Access (login Google ou GitHub, políticas
  por pessoa) ou as ACLs do Tailscale. Ambos autenticam por cookie, então o
  campo de token do console ficaria sem uso e as chamadas do navegador
  precisariam de tratamento de `credentials` que o CORS atual não habilita.
- **As imagens do Street View** chegam a quem conseguir chamar o endpoint. As
  sobreposições embutem imagens do Google, que têm termos de redistribuição que
  vale ler antes de abrir demais.
- **A máquina precisa estar ligada.** O túnel morre com ela.

## Experimentando sem uma API

**Ver exemplo** renderiza resultados armazenados de uma execução real do
pipeline — uma vista única e uma varredura de quatro direções, com imagens —
pelo mesmo renderizador usado numa resposta ao vivo. Os números saíram do código
deste próprio projeto; os quadros são a varredura de quatro direções que o
repositório `urban_canopy` já publica em `samples/images/`. A cobertura nessa
varredura vai de 0,80% a 31,97%, contraste suficiente para mostrar para que
serve a comparação.

## Desenvolvimento local

Sem etapa de build, sem dependências, sem empacotador — módulos ES puros.

```bash
python -m http.server 4173
```

```text
index.html              marcação e toda a superfície de entrada
assets/css/app.css      tokens de design, layout, componentes
assets/js/config.js     padrões publicados, gerados do .env
assets/js/i18n.js       textos pt-BR / inglês e a passagem de tradução
assets/js/api.js        cliente da API; normaliza falhas em ApiError
assets/js/charts.js     anel, barras, bússola e barra de dispersão em SVG
assets/js/render.js     payload → DOM dos resultados
assets/js/demo.js       payloads de exemplo armazenados
assets/js/app.js        estado do formulário, validação, requisições, exportação
scripts/sync-config.py  .env -> assets/js/config.js
```

O `assets/js/app.js` espelha o `urban_canopy.core.viewplan.plan_headings` apenas
para que a bússola mostre quais direções uma execução vai capturar antes que ela
custe alguma coisa. A API continua sendo a autoridade: o que ela planejar é o
que o resultado reporta.

## Publicação

Um push para `main` publica a raiz do repositório pelo
`.github/workflows/pages.yml`. Habilite uma vez em **Settings → Pages → Source →
GitHub Actions**. O arquivo `.nojekyll` mantém o Jekyll fora do caminho.

## Transparência sobre uso de IA generativa

Ferramentas de IA generativa foram utilizadas para apoiar o desenvolvimento
deste site, incluindo discutir alternativas de implementação, revisar e
organizar código e revisar a documentação. As sugestões produzidas com essas
ferramentas foram revisadas, adaptadas e validadas pelo autor, que permanece
responsável pelo conteúdo deste repositório.

## Licença

Apache 2.0, acompanhando o projeto original.
