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
| `return_overlays` | ligado | vista única |

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

> A API não tem autenticação e chama uma API paga do Google a cada requisição.
> Mantenha-a em localhost ou atrás de um proxy.

### HTTPS e conteúdo misto

Uma página servida por HTTPS só pode fazer requisições HTTP simples para
`localhost` ou `127.0.0.1`, que os navegadores tratam como origens confiáveis.
Essa combinação — o site no GitHub Pages, a API na sua máquina — funciona. Uma
API em outro host por HTTP simples é bloqueada pelo navegador; o site detecta
esse caso e avisa, em vez de falhar em silêncio. Sirva uma API assim por HTTPS.

## Experimentando sem uma API

**Ver exemplo** renderiza resultados armazenados de duas execuções reais do
pipeline, uma vista única e uma varredura de quatro direções, pelo mesmo
renderizador usado numa resposta ao vivo. Os números saíram do `tree-ai`; a
imagem é o quadro de exemplo que o repositório `urban_canopy` já publica em
`samples/images/`.

## Desenvolvimento local

Sem etapa de build, sem dependências, sem empacotador — módulos ES puros.

```bash
python -m http.server 4173
```

```text
index.html              marcação e toda a superfície de entrada
assets/css/app.css      tokens de design, layout, componentes
assets/js/i18n.js       textos pt-BR / inglês e a passagem de tradução
assets/js/api.js        cliente da API; normaliza falhas em ApiError
assets/js/charts.js     anel, barras, bússola e barra de dispersão em SVG
assets/js/render.js     payload → DOM dos resultados
assets/js/demo.js       payloads de exemplo armazenados
assets/js/app.js        estado do formulário, validação, requisições, exportação
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
