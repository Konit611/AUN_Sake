# AUN — 酒と肴の、阿吽の呼吸。

술(阿)과 안주(吽)의 페어링을 브랜드별로 소개하는 사이트.
디자인: Claude Design 캔버스 「AUN — 酒と肴のペアリング」

- Next.js 16 (App Router, `cacheComponents`, Turbopack) / React 19 / Tailwind CSS v4
- 콘텐츠는 레포 안의 TS 파일과 MDX (DB·CMS 없음), 모든 페이지는 빌드 때 정적 생성

## 실행

```bash
npm install
npm run dev          # http://localhost:3000
npm run build
npm start            # standalone 서버 (빌드 후)
```

CSS나 콘텐츠를 바꿨는데 화면에 반영되지 않으면 `rm -rf .next` 후 다시 빌드한다 (Turbopack 캐시).

## 페이지

| 경로 | 내용 |
|---|---|
| `/` | 홈. 종류 → 브랜드 → 어울리는 안주 |
| `/brands` | 브랜드 목록. 검색·종류·맛·안주 장르로 거르기 (`?q=&kind=&taste=&food=`) |
| `/categories` | 분류 해설. 소분류별 특징과 어울리는 요리, 日本酒 4타입·早見表 |
| `/brands/[slug]` | 브랜드: 맛 차트, 음용법별 안주, 페어링 노트 |
| `/categories/[id]` | 대분류(`shochu`)·소분류(`imo-shochu`)별 브랜드 |
| `/foods`, `/foods/[slug]` | 안주 → 어울리는 술 |
| `/notes`, `/notes/[slug]` | 페어링 노트 (기사) |
| `/search` | 검색 (브라우저에서 동작, `?q=`) |
| `/sitemap.xml`, `/robots.txt` | SEO |

## 콘텐츠 추가

콘텐츠는 `content/`에만 있다. 페이지 코드는 `lib/data.ts`의 함수로만 읽는다.
참조가 틀리면 (없는 안주 slug 등) `npm run dev` / `npm run build`가 어디가 틀렸는지 알려 주며 실패한다.

```
content/
  categories.ts        대분류·소분류와 분류 해설 (배열 순서 = 표시 순서)
  sake-guide.ts        日本酒 香味の4タイプ・特定名称の早見表
  serve-styles.ts      음용법 (お湯割り, ロック, 燗 …)
  foods.ts             안주
  brands/<대분류>.ts   브랜드와 그 브랜드의 페어링
  notes.ts             기사 메타데이터
  notes/<slug>.mdx     기사 본문
```

### 브랜드 추가

1. 안주가 `content/foods.ts`에 없으면 먼저 추가한다. 한자가 들어간 이름은 검색용 `kana`(히라가나)를 넣고,
   `genres`(魚介・肉料理・揚げ物・煮物・辛い料理 중 해당하는 것, 없으면 `[]`)를 넣는다.
   브랜드의 「合わせたい肴」 필터는 페어링한 안주의 `genres`에서 자동으로 정해진다.
2. 소분류가 없으면 `content/categories.ts`에 추가한다. 대분류 id와 겹치면 안 된다.
   소분류의 `examples`(아직 페이지가 없는 대표 브랜드 이름)에 이 브랜드가 있으면 지운다 (남아 있으면 빌드 실패).
3. `content/brands/<대분류>.ts`에 추가한다.

```ts
{
  slug: "maou",                       // URL: /brands/maou
  name: "魔王",
  kana: "まおう",                     // 한자 이름이면 넣는다 (검색용)
  subCategoryId: "imo-shochu",
  alsoIn: [],                         // 선택. 다른 소분류에도 표시 (예: 白ワイン + 日本ワイン)
  maker: "白玉醸造",
  region: "鹿児島",
  abv: 25,                            // 선택
  taste: "…",                         // 한두 문장
  tags: ["…", "…"],
  tastes: ["華やか", "軽快"],         // すっきり・キレ・コク・甘み・華やか・軽快 중에서. 「銘柄から探す」 필터용
  tasteChart: { sweetness: 3, aroma: 4, kire: 3, koku: 4 },  // 선택, 1–5
  serves: [
    { serveId: "rock", how: "大きめの氷で", note: "…" },     // how·note 선택
  ],
  recommendedServe: "rock",           // serves 중 하나
  pairings: [
    // level: "aun"(阿吽) | "good"(好相性) | "surprise"(意外)
    // serve 를 넣으면 브랜드 페이지 「飲み方別、息の合う肴」에 나온다
    { food: "buta-kakuni", level: "aun", serve: "rock", why: "…" },
  ],
  avoid: "…",                         // 선택. 「息が合いにくい」
}
```

브랜드는 추가하는 순간 홈, 분류, 안주, 검색, sitemap에 모두 반영된다.
소분류·안주 페이지는 연결된 브랜드가 있을 때만 생성된다.

### 기사 추가

1. `content/notes.ts`에 메타데이터를 추가한다 (`brandSlug`, `foodSlug`는 실제로 있는 것).
2. 같은 slug로 `content/notes/<slug>.mdx`에 본문을 쓴다.

브랜드 페이지에는 그 브랜드의 최신 기사가 전문으로 나온다.

## 배포 (Docker)

sitemap·canonical·OGP의 절대 URL은 **빌드 때** 정해진다. 배포 전에 실제 도메인을 넘긴다.

```bash
SITE_URL=https://example.com docker compose up -d --build
```

- `SITE_URL`을 생략하면 `http://localhost:3000`
- 이미지는 `output: "standalone"` (약 315MB). 실행 단계에 `node_modules` 설치 없음

## 문서

- [docs/plan/data-structure.md](docs/plan/data-structure.md) — 데이터 구조와 검증 규칙
