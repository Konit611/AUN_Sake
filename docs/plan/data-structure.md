# 데이터 구조

디자인: Claude Design 캔버스 「AUN — 酒と肴のペアリング」 (홈 / 銘柄ページ / 모바일 2종)

## 저장 방식

레포 안 TS 파일 + 기사 본문 MDX (DB·CMS 없음). 페이지는 `lib/data.ts` 함수만 사용하므로,
나중에 DB/CMS로 옮겨도 페이지 코드는 바뀌지 않는다.

```
content/
  categories.ts        Category(焼酎/ビール/日本酒) + SubCategory(芋焼酎…)
  serve-styles.ts      음용법 마스터
  foods.ts             안주 마스터
  brands/<category>.ts 술 + 그 술의 pairings
  notes.ts             기사 메타데이터
  notes/<slug>.mdx     기사 본문
lib/
  types.ts             타입
  validate.ts          참조 무결성 검사
  data.ts              조회 함수 (server-only)
```

## 엔티티

| 엔티티 | 키 | 비고 |
|---|---|---|
| Category | `id` | 배열 순서 = 표시 순서 |
| SubCategory | `id` | `categoryId` |
| ServeStyle | `id` | お湯割り, ロック, 冷酒, 燗 … |
| Food | `slug` | 안주 → 술 역방향 조회 가능 |
| Brand | `slug` | `subCategoryId`, `serves`(음용법별 비율/메모), `recommendedServe`, `tasteChart`(1–5), `avoid` |
| Pairing | brand × food | `level`: `aun`(阿吽) / `good`(好相性) / `surprise`(意外), `serve`가 있으면 브랜드 페이지 「飲み方別」에 표시 |
| PairingNote | `slug` | `brandSlug`, `foodSlug`, `publishedAt`, `author`, `quote`(阿吽のひとこと) |

Pairing은 편집 편의를 위해 브랜드 파일 안에 적고, `lib/data.ts`가 평탄화한다.

## 검증

`lib/data.ts`가 로드될 때 `validateContent()`를 실행하고, 문제가 있으면 throw → `next build` 실패.
slug 중복, 존재하지 않는 subCategory/food/serve 참조, `recommendedServe`·pairing의 `serve`가 브랜드 `serves`에 없는 경우,
tasteChart 범위, 기사의 brand/food 참조와 날짜를 확인한다.
`.mdx` 본문 누락은 기사 페이지 정적 생성 시 import 실패로 드러난다.

## 메모

- `cacheComponents: true` 환경에서는 `export const dynamicParams = false`를 쓸 수 없다 (빌드 에러).
  `generateStaticParams`만 사용하고, 없는 slug는 페이지에서 `notFound()` 처리한다.
- 아직 데이터가 없는 브랜드(魔王, 森伊蔵 등)는 등록하지 않는다. 데이터가 갖춰진 브랜드만 노출.
- `abv`(도수), 기사 작성자·본문은 placeholder 상태.
