# DB 이전 계획

지금은 `content/`의 TS·MDX 파일이 데이터이고, 페이지는 `lib/data.ts`의 함수로만 읽는다.
기사가 주 1회씩 쌓이고, 개발자가 아닌 사람이 편집하게 되면 DB로 옮긴다.

## 언제 옮기나 (판단 기준)

- 편집할 때마다 PR·빌드·배포를 거치는 것이 부담이 될 때 (편집자가 따로 생김, 하루에 여러 번 수정)
- 브랜드가 수백 개를 넘어 `content/brands/*.ts`를 손으로 관리하기 어려울 때
- 공개 예약, 사용자 입력(댓글·평가) 같은 실행 중 쓰기가 필요해질 때

그 전까지는 파일 기반이 더 싸다 (검증은 테스트·CI가 하고, 모든 페이지가 정적).

## 테이블

| 테이블 | 키 | 열 | 지금 파일 |
|---|---|---|---|
| `categories` | `id` | name, name_en, kana, glyph, lead, guide, look(jsonb), sort | `content/categories.ts` |
| `chart_axes` | (category_id, id) | label, sort | `chart.axes` |
| `sub_categories` | `id` | category_id → categories, name, kana, meta, taste, pair, examples(text[]), sort | 〃 |
| `serve_styles` | `id` | name | `content/serve-styles.ts` |
| `regions` | `id` | name, kana, kind(prefecture/country), country_id → regions | `content/regions.ts` |
| `makers` | `id` | name, kana, region_id → regions | `content/makers.ts` |
| `foods` | `slug` | name, kana, genres(text[]), image | `content/foods.ts` |
| `brands` | `slug` | name, kana, sub_category_id → sub_categories, maker_id → makers, region_id → regions(null이면 maker의 소재지), abv, taste, tags(text[]), tastes(text[]), taste_chart(jsonb), recommended_serve, avoid, image, sort | `content/brands/*.ts` |
| `brand_also_in` | (brand_slug, sub_category_id) | | `alsoIn` |
| `brand_serves` | (brand_slug, serve_id) | how, note, sort | `serves` |
| `pairings` | `id` (`銘柄/肴@飲み方`) | brand_slug, food_slug, serve_id(null 가능), level, why, sort | `pairings` |
| `notes` | `slug` | title, brand_slug, food_slug, serve_id, published_at, author, lead, quote, hero_image, status(draft/published), body | `content/notes.ts` + `content/notes/*.mdx` |

- `pairings`의 유일성: `UNIQUE (brand_slug, food_slug, serve_id) NULLS NOT DISTINCT` (PostgreSQL 15+). id는 `pairingId()`와 같은 규칙.
- `sort`는 지금 파일 안의 순서. 홈 「FIND YOUR PAIR」에 나오는 8개는 이 순서로 정해진다.

## 검증 규칙 → DB 제약

`lib/validate.ts`의 규칙 대부분은 DB 제약으로 옮길 수 있다.

| 규칙 | DB |
|---|---|
| slug·id 중복 | PRIMARY KEY |
| 없는 분류·안주·음용법 참조 | FOREIGN KEY |
| tastes·genres·level 값 | CHECK 또는 enum |
| tasteChart 1–5 | CHECK |
| tasteChart의 축이 대분류의 축과 같음 | `brand_chart_values (brand_slug, category_id, axis_id) → chart_axes` + 빠진 축은 앱에서 검사 |
| 대분류와 소분류 id가 겹치지 않음 | 트리거 또는 앱에서 검사 (URL을 공유하므로) |
| `recommendedServe`·pairing의 serve가 그 브랜드의 serves에 있음 | FK `(brand_slug, serve_id) → brand_serves` |
| `alsoIn`이 같은 대분류 | 트리거 또는 앱에서 검사 |
| 기사가 등록된 궁합에 대한 것 | 앱에서 검사 (serve_id가 null이면 「어떤 음용법이든」이라서 FK로 표현하기 어려움) |
| `examples`에 등록된 브랜드 이름이 남음 | 앱에서 검사 (또는 examples를 없애고 「페이지 없는 브랜드」를 status로 관리) |

앱에서 검사하는 규칙은 관리 화면의 저장 처리에서 `validateContent()`와 같은 로직을 돌린다.

## 순서

1. ✅ **`lib/data.ts`의 함수를 async로 바꾼다** (파일 기반 그대로, 동작 변화 없음) — 완료
   - 모든 조회 함수가 `async`이고 `locale`을 받는다. 호출하는 쪽(페이지, sitemap, OG 이미지, 피드)은 모두 `await`한다.
   - 지금 구현은 `lib/data/store.ts`의 `buildStore(locale)`: 언어별로 한 번 content/를 풀고 색인을 만든다.
   - 페이지는 목록을 그리기 전에 `Promise.all`로 필요한 값을 모은다. DB로 바꾸면 이것이 N+1 쿼리가 되므로,
     요청 단위 중복 제거(React `cache()`)나 묶음 조회 함수(`getBrandsBySlugs` 등)를 그때 추가한다.
2. **시드 스크립트**: `content/`를 읽어 `validateContent()`를 통과시킨 뒤 INSERT. 이 시점의 파일이 마지막 원본.
3. **`lib/data.ts`의 구현만 DB로 바꾼다.** 함수 이름·반환 형태는 그대로. `lib/data/store.ts`는 DB 쿼리로 대체된다.
   - 읽기는 `'use cache'` + `cacheTag`로 캐시하고, 편집하면 `revalidateTag`.
   - 지금 모듈을 불러올 때 만드는 색인(Map)은 DB 인덱스와 쿼리로 대체.
4. **기사 본문**: 처음에는 MDX 파일을 그대로 둬도 된다 (notes 행에 slug만 있으면 됨). DB에 넣는다면 실행 중에 MDX를 컴파일해야 하므로, 신뢰할 수 있는 편집자만 쓰게 하거나 Markdown으로 제한한다.
5. **정적 생성**: `generateStaticParams`는 DB에서 읽는다. 빌드 후에 추가된 브랜드·기사는 요청 시 생성되고 캐시된다 (지금의 ◐ 경로와 같은 동작).
6. 테스트: `test/content.test.ts`는 시드 데이터나 테스트 DB를 대상으로 돌린다.

## 지금부터 지켜 두면 좋은 것

- 페이지·컴포넌트는 `content/`를 직접 import하지 않는다 (`lib/data.ts`만). 예외는 `content/sake-guide.ts` (편집 빈도가 낮은 고정 콘텐츠).
- 새 필드는 `lib/types.ts` → `lib/validate.ts` → 테스트 순서로 추가한다. 그대로 DB 열과 제약이 된다.
- 기사는 `draft: true`로 미리 써 두고, 공개일에 지우는 PR을 머지한다. DB로 옮긴 뒤에는 `status`와 `published_at`으로 예약 공개할 수 있다.
