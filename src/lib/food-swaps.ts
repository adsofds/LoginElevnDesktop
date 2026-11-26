/*
 * Trocas inteligentes: food database and the math behind the swap calculator and the
 * barcode lookup in the student app (Dieta → Trocas inteligentes).
 *
 * Values per 100 g from the Brazilian public food composition tables:
 * TBCA 7.2 (USP/FoRC), TACO 4ª ed. (NEPA/Unicamp) and manufacturer averages for
 * supplements (REF).
 */

export type FoodCategory =
  | 'proteina'
  | 'proteina-vegetal'
  | 'laticinio'
  | 'suplemento'
  | 'carboidrato'
  | 'gordura'
  | 'vegetal'
  | 'fruta'

export type FoodTrait = 'sem-lactose' | 'sem-gluten' | 'vegano'

export type Macros = { kcal: number; p: number; c: number; g: number }

export type SwapFood = {
  id: string
  name: string
  category: FoodCategory
  source: 'TACO' | 'TBCA' | 'REF'
  /** Per 100 g (or 100 ml). */
  per100: Macros
  traits: FoodTrait[]
}

export const categoryLabels: Record<FoodCategory, string> = {
  proteina: 'Proteína',
  'proteina-vegetal': 'Proteína vegetal',
  laticinio: 'Laticínio',
  suplemento: 'Suplemento',
  carboidrato: 'Carboidrato',
  gordura: 'Gordura',
  vegetal: 'Vegetal',
  fruta: 'Fruta',
}

const slug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function food(
  name: string,
  category: FoodCategory,
  source: SwapFood['source'],
  [kcal, p, c, g]: [number, number, number, number],
  traits: FoodTrait[] = [],
): SwapFood {
  return { id: slug(name), name, category, source, per100: { kcal, p, c, g }, traits }
}

export const swapFoods: SwapFood[] = [
  food(
    'Frango, peito, grelhado',
    'proteina',
    'TBCA',
    [159, 32, 0, 2.7],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Frango, peito, cozido',
    'proteina',
    'TACO',
    [172, 32.1, 0, 3.8],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Frango, coxa, sem pele, grelhada',
    'proteina',
    'TACO',
    [175, 26, 0, 7.5],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Frango, sobrecoxa, sem pele, cozida',
    'proteina',
    'TBCA',
    [182, 25.4, 0, 9],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Peru, peito, cozido',
    'proteina',
    'TBCA',
    [135, 29.9, 0, 1.7],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Carne bovina, patinho, grelhado',
    'proteina',
    'TACO',
    [219, 25.9, 0, 12],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Carne bovina, alcatra, grelhada',
    'proteina',
    'TACO',
    [224, 28, 0, 12.4],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Carne bovina, filé mignon, grelhado',
    'proteina',
    'TBCA',
    [207, 28.5, 0, 10.2],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Carne bovina, músculo, cozido',
    'proteina',
    'TACO',
    [194, 33, 0, 6.7],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Carne bovina, acém, cozido',
    'proteina',
    'TACO',
    [212, 26.7, 0, 11.2],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Carne suína, lombo, grelhado',
    'proteina',
    'TBCA',
    [210, 27, 0, 11],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Carne suína, bisteca, grelhada',
    'proteina',
    'TACO',
    [230, 25, 0, 14],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Tilápia, filé, grelhado',
    'proteina',
    'TBCA',
    [128, 26, 0, 2.5],
    ['sem-lactose', 'sem-gluten'],
  ),
  food('Salmão, grelhado', 'proteina', 'TBCA', [208, 25.4, 0, 12], ['sem-lactose', 'sem-gluten']),
  food(
    'Atum, enlatado em água',
    'proteina',
    'TACO',
    [116, 26, 0, 0.8],
    ['sem-lactose', 'sem-gluten'],
  ),
  food(
    'Sardinha, enlatada em óleo',
    'proteina',
    'TACO',
    [285, 22, 0, 22],
    ['sem-lactose', 'sem-gluten'],
  ),
  food('Camarão, cozido', 'proteina', 'TBCA', [90, 19, 0.3, 1], ['sem-lactose', 'sem-gluten']),
  food(
    'Ovo inteiro, cozido',
    'proteina',
    'TACO',
    [146, 13.3, 0.6, 9.5],
    ['sem-lactose', 'sem-gluten'],
  ),
  food('Clara de ovo, cozida', 'proteina', 'TBCA', [48, 11, 0.7, 0], ['sem-lactose', 'sem-gluten']),
  food(
    'Tofu firme',
    'proteina-vegetal',
    'TBCA',
    [144, 15.6, 2.8, 8.7],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Edamame, cozido',
    'proteina-vegetal',
    'TBCA',
    [121, 12, 8.9, 5.2],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Lentilha, cozida',
    'proteina-vegetal',
    'TACO',
    [93, 6.3, 16.3, 0.5],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Grão-de-bico, cozido',
    'proteina-vegetal',
    'TACO',
    [130, 6.7, 18.6, 2.6],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Feijão preto, cozido',
    'proteina-vegetal',
    'TACO',
    [77, 4.5, 14, 0.5],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Feijão carioca, cozido',
    'proteina-vegetal',
    'TACO',
    [76, 4.8, 13.6, 0.5],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Proteína de soja (PTS), cru',
    'proteina-vegetal',
    'TBCA',
    [330, 46, 30, 1.2],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Ervilha seca, cozida',
    'proteina-vegetal',
    'TACO',
    [88, 6, 15, 0.4],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food('Queijo cottage', 'laticinio', 'TBCA', [98, 12.6, 2.7, 4.3], ['sem-gluten']),
  food('Queijo minas frescal', 'laticinio', 'TACO', [264, 17.4, 3.2, 20.2], ['sem-gluten']),
  food('Queijo muçarela', 'laticinio', 'TACO', [330, 22.6, 3, 25.2], ['sem-gluten']),
  food('Ricota fresca', 'laticinio', 'TBCA', [140, 12.6, 3.5, 8], ['sem-gluten']),
  food('Iogurte natural desnatado', 'laticinio', 'TBCA', [44, 4.4, 6.1, 0.1], ['sem-gluten']),
  food('Iogurte grego natural', 'laticinio', 'TBCA', [90, 8, 5, 4], ['sem-gluten']),
  food('Leite desnatado', 'laticinio', 'TACO', [35, 3.4, 5, 0.2], ['sem-gluten']),
  food('Leite integral', 'laticinio', 'TACO', [61, 3, 4.5, 3.5], ['sem-gluten']),
  food('Requeijão cremoso', 'laticinio', 'TBCA', [257, 8, 2, 24], ['sem-gluten']),
  food('Queijo coalho', 'laticinio', 'TBCA', [324, 21.1, 1.5, 26], ['sem-gluten']),
  food('Queijo prato', 'laticinio', 'TBCA', [360, 23, 1, 29.1], ['sem-gluten']),
  food('Queijo parmesão', 'laticinio', 'TBCA', [453, 35.6, 1.7, 33.5], ['sem-gluten']),
  food('Queijo provolone', 'laticinio', 'TBCA', [351, 26, 2.1, 26.6], ['sem-gluten']),
  food('Cream cheese', 'laticinio', 'TBCA', [342, 6, 4, 34], ['sem-gluten']),
  food('Queijo canastra (meia-cura)', 'laticinio', 'TBCA', [370, 24, 1.5, 30], ['sem-gluten']),
  food('Whey Protein concentrado (média)', 'suplemento', 'REF', [400, 80, 8, 5], ['sem-gluten']),
  food(
    'Whey Protein isolado (média)',
    'suplemento',
    'REF',
    [380, 90, 2, 1],
    ['sem-lactose', 'sem-gluten'],
  ),
  food('Caseína micelar (média)', 'suplemento', 'REF', [370, 80, 5, 2], ['sem-gluten']),
  food('Albumina em pó', 'suplemento', 'TBCA', [378, 83.5, 5, 0.5], ['sem-lactose', 'sem-gluten']),
  food(
    'Creatina monohidratada',
    'suplemento',
    'REF',
    [0, 0, 0, 0],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Arroz branco, cozido',
    'carboidrato',
    'TACO',
    [128, 2.5, 28.1, 0.2],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Arroz integral, cozido',
    'carboidrato',
    'TACO',
    [124, 2.6, 25.8, 1],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Batata-doce, cozida',
    'carboidrato',
    'TACO',
    [77, 0.6, 18.4, 0.1],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Batata inglesa, cozida',
    'carboidrato',
    'TACO',
    [52, 1.2, 11.9, 0],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Mandioca (aipim), cozida',
    'carboidrato',
    'TACO',
    [125, 0.6, 30.1, 0.3],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Inhame, cozido',
    'carboidrato',
    'TACO',
    [97, 2, 23.3, 0],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Cará, cozido',
    'carboidrato',
    'TBCA',
    [77, 1.5, 18.5, 0],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Macarrão integral, cozido',
    'carboidrato',
    'TBCA',
    [138, 5.3, 26.5, 1.1],
    ['sem-lactose', 'vegano'],
  ),
  food(
    'Macarrão branco, cozido',
    'carboidrato',
    'TACO',
    [102, 3, 19.9, 1.1],
    ['sem-lactose', 'vegano'],
  ),
  food('Pão integral', 'carboidrato', 'TACO', [253, 9.4, 49.9, 3.4], ['sem-lactose', 'vegano']),
  food('Pão francês', 'carboidrato', 'TACO', [300, 8, 58.6, 3.1], ['sem-lactose', 'vegano']),
  food('Aveia em flocos', 'carboidrato', 'TACO', [394, 14, 66.6, 8.5], ['sem-lactose', 'vegano']),
  food(
    'Tapioca (goma hidratada)',
    'carboidrato',
    'TBCA',
    [68, 0, 17, 0],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Cuscuz de milho, cozido',
    'carboidrato',
    'TBCA',
    [113, 2.6, 25, 0.3],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Milho verde, cozido',
    'carboidrato',
    'TACO',
    [138, 4.6, 28.6, 1.6],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Quinoa, cozida',
    'carboidrato',
    'TBCA',
    [120, 4.4, 21.3, 1.9],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Granola sem açúcar',
    'carboidrato',
    'TBCA',
    [421, 10.5, 63, 14.5],
    ['sem-lactose', 'vegano'],
  ),
  food(
    'Azeite de oliva extra virgem',
    'gordura',
    'TACO',
    [884, 0, 0, 100],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Óleo de coco',
    'gordura',
    'TBCA',
    [862, 0, 0, 100],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food('Manteiga sem sal', 'gordura', 'TACO', [726, 0.4, 0, 82], ['sem-gluten']),
  food(
    'Pasta de amendoim integral',
    'gordura',
    'TBCA',
    [593, 25.5, 17, 46],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Castanha de caju',
    'gordura',
    'TACO',
    [570, 18.5, 29.1, 46.3],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Castanha-do-pará',
    'gordura',
    'TACO',
    [643, 14.5, 15.1, 63.5],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food('Nozes', 'gordura', 'TACO', [620, 14, 18, 59], ['sem-lactose', 'sem-gluten', 'vegano']),
  food(
    'Amêndoas',
    'gordura',
    'TACO',
    [581, 18.6, 29.5, 47.3],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food('Abacate', 'gordura', 'TACO', [96, 1.2, 6, 8.4], ['sem-lactose', 'sem-gluten', 'vegano']),
  food(
    'Semente de chia',
    'gordura',
    'TBCA',
    [486, 16.5, 42.1, 30.7],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Semente de linhaça',
    'gordura',
    'TACO',
    [495, 14.1, 43.3, 32.3],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Brócolis, cozido',
    'vegetal',
    'TACO',
    [25, 2.1, 4.4, 0.3],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Espinafre, cozido',
    'vegetal',
    'TACO',
    [16, 1.3, 2.6, 0.2],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Couve, refogada',
    'vegetal',
    'TACO',
    [90, 2.9, 7.3, 5.4],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Abobrinha, cozida',
    'vegetal',
    'TACO',
    [15, 0.7, 3, 0.1],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Cenoura, cozida',
    'vegetal',
    'TACO',
    [30, 0.8, 6.7, 0.2],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Beterraba, cozida',
    'vegetal',
    'TACO',
    [32, 1, 7.2, 0],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Tomate cru',
    'vegetal',
    'TACO',
    [15, 1.1, 3.1, 0.1],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food('Pepino cru', 'vegetal', 'TACO', [10, 0.9, 2, 0], ['sem-lactose', 'sem-gluten', 'vegano']),
  food(
    'Alface crespa',
    'vegetal',
    'TACO',
    [11, 1.3, 1.7, 0.2],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Berinjela, cozida',
    'vegetal',
    'TACO',
    [19, 0.7, 4.5, 0.1],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Chuchu, cozido',
    'vegetal',
    'TACO',
    [17, 0.4, 3.8, 0.1],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Vagem, cozida',
    'vegetal',
    'TACO',
    [25, 1.6, 4.6, 0.2],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Abóbora, cozida',
    'vegetal',
    'TACO',
    [28, 0.8, 6.5, 0.1],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Cogumelo champignon',
    'vegetal',
    'TBCA',
    [22, 3.1, 3.3, 0.3],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Banana prata',
    'fruta',
    'TACO',
    [98, 1.3, 26, 0.1],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Maçã com casca',
    'fruta',
    'TACO',
    [63, 0.3, 15.2, 0],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food(
    'Mamão papaia',
    'fruta',
    'TACO',
    [40, 0.5, 10.4, 0.1],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
  food('Manga', 'fruta', 'TACO', [51, 0.4, 12.8, 0.2], ['sem-lactose', 'sem-gluten', 'vegano']),
  food('Morango', 'fruta', 'TACO', [30, 0.9, 6.8, 0.3], ['sem-lactose', 'sem-gluten', 'vegano']),
  food('Melancia', 'fruta', 'TACO', [33, 0.9, 8.1, 0], ['sem-lactose', 'sem-gluten', 'vegano']),
  food('Laranja', 'fruta', 'TACO', [37, 1, 8.9, 0.1], ['sem-lactose', 'sem-gluten', 'vegano']),
  food('Uva', 'fruta', 'TACO', [53, 0.7, 13.6, 0.2], ['sem-lactose', 'sem-gluten', 'vegano']),
  food('Abacaxi', 'fruta', 'TACO', [48, 0.9, 12.3, 0.1], ['sem-lactose', 'sem-gluten', 'vegano']),
  food('Kiwi', 'fruta', 'TBCA', [51, 0.9, 11.5, 0.6], ['sem-lactose', 'sem-gluten', 'vegano']),
  food('Pera', 'fruta', 'TACO', [53, 0.4, 14, 0.1], ['sem-lactose', 'sem-gluten', 'vegano']),
  food('Goiaba', 'fruta', 'TACO', [54, 1.1, 13, 0.4], ['sem-lactose', 'sem-gluten', 'vegano']),
  food(
    'Açaí polpa pura',
    'fruta',
    'TBCA',
    [58, 0.8, 6.2, 3.9],
    ['sem-lactose', 'sem-gluten', 'vegano'],
  ),
]

export const findFood = (id: string) => swapFoods.find((item) => item.id === id)

/** Accent- and case-insensitive search by any word of the name. */
export function searchFoods(query: string, exclude?: string, limit = 12) {
  const words = slug(query).split('-').filter(Boolean)
  if (!words.length || query.trim().length < 2) return []
  return swapFoods
    .filter((item) => item.id !== exclude && words.every((word) => item.id.includes(word)))
    .slice(0, limit)
}

export type SwapUnit = 'g' | 'ml' | 'un' | 'cs' | 'xic'

export const unitOptions: { id: SwapUnit; label: string; short: string; grams: number }[] = [
  { id: 'g', label: 'Gramas', short: 'g', grams: 1 },
  { id: 'ml', label: 'Mililitros', short: 'ml', grams: 1 },
  { id: 'un', label: 'Unidade', short: 'un', grams: 50 },
  { id: 'cs', label: 'Colher de sopa', short: 'col. sopa', grams: 15 },
  { id: 'xic', label: 'Xícara', short: 'xíc.', grams: 165 },
]

export type SwapGoal =
  | 'equivalente'
  | 'menos-calorias'
  | 'mais-proteina'
  | 'menos-carbo'
  | 'sem-lactose'
  | 'sem-gluten'
  | 'vegano'

export const goalOptions: { id: SwapGoal; label: string }[] = [
  { id: 'equivalente', label: 'Macros parecidos' },
  { id: 'menos-calorias', label: 'Menos calorias' },
  { id: 'mais-proteina', label: 'Mais proteína' },
  { id: 'menos-carbo', label: 'Menos carboidrato' },
  { id: 'sem-lactose', label: 'Sem lactose' },
  { id: 'sem-gluten', label: 'Sem glúten' },
  { id: 'vegano', label: 'Vegano' },
]

const round1 = (value: number) => Math.round(value * 10) / 10

export const macrosFor = (item: SwapFood, grams: number): Macros => ({
  kcal: round1((item.per100.kcal * grams) / 100),
  p: round1((item.per100.p * grams) / 100),
  c: round1((item.per100.c * grams) / 100),
  g: round1((item.per100.g * grams) / 100),
})

export type SwapResult = {
  food: SwapFood
  /** Grams of this food with the same calories as the original portion. */
  grams: number
  macros: Macros
  /** Lower is a better match. */
  score: number
}

/**
 * Swap by calories: how much of `candidate` gives the same kcal as the original portion,
 * scored by how far its protein, carbs and fat land from the original (protein weighs
 * most). Goals that ask for "less X / more Y" rank by that instead.
 */
export function swapFor(
  original: SwapFood,
  grams: number,
  candidate: SwapFood,
  goal: SwapGoal,
): SwapResult {
  const base = macrosFor(original, grams)
  const eqGrams =
    original.per100.kcal > 0 && candidate.per100.kcal > 0
      ? (base.kcal / candidate.per100.kcal) * 100
      : grams
  const macros = macrosFor(candidate, eqGrams)
  let score =
    Math.abs(macros.kcal - base.kcal) * 0.5 +
    Math.abs(macros.p - base.p) * 3 +
    Math.abs(macros.c - base.c) * 1.5 +
    Math.abs(macros.g - base.g) * 2
  if (goal === 'menos-calorias') score = candidate.per100.kcal
  if (goal === 'mais-proteina') score = -candidate.per100.p
  if (goal === 'menos-carbo') score = candidate.per100.c
  return { food: candidate, grams: Math.round(eqGrams), macros, score }
}

const goalTrait: Partial<Record<SwapGoal, FoodTrait>> = {
  'sem-lactose': 'sem-lactose',
  'sem-gluten': 'sem-gluten',
  vegano: 'vegano',
}

/**
 * Suggested swaps across every category. Same-category foods get a 30% better score, so
 * rice is offered potato before it is offered chicken; zero-calorie items and portions
 * too big to eat are left out.
 */
export function suggestSwaps(
  original: SwapFood,
  grams: number,
  goal: SwapGoal,
  { exclude = [] as string[], limit = 10 } = {},
) {
  const trait = goalTrait[goal]
  return (
    swapFoods
      .filter(
        (item) =>
          item.id !== original.id &&
          !exclude.includes(item.id) &&
          item.per100.kcal > 0 &&
          (!trait || item.traits.includes(trait)),
      )
      .map((item) => {
        const result = swapFor(original, grams, item, goal)
        if (goal === 'equivalente' && item.category === original.category) result.score *= 0.7
        return result
      })
      // Same calories can mean a plate nobody eats (1 kg of chuchu for a portion of rice).
      .filter((result) => result.grams <= Math.max(400, grams * 3))
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)
  )
}

/* ---------------- Barcode (Open Food Facts) ---------------- */

export type ScannedProduct = {
  name: string
  brand: string
  serving: string
  image?: string
  per100: Macros & { fiber: number; sodiumMg: number }
}

/** Looks the barcode up in Open Food Facts (public, no key). `null` when not found. */
export async function lookupBarcode(code: string): Promise<ScannedProduct | null> {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_pt,brands,serving_size,image_front_small_url,nutriments`,
  )
  if (!response.ok && response.status !== 404) throw new Error(`HTTP ${response.status}`)
  const data = (await response.json()) as {
    status?: number
    product?: {
      product_name?: string
      product_name_pt?: string
      brands?: string
      serving_size?: string
      image_front_small_url?: string
      nutriments?: Record<string, number | string | undefined>
    }
  }
  if (!data.product || data.status === 0) return null
  const n = data.product.nutriments ?? {}
  const num = (key: string) => Number(n[key] ?? 0) || 0
  const kcal = num('energy-kcal_100g') || num('energy_100g') / 4.184
  return {
    name: data.product.product_name_pt || data.product.product_name || 'Produto sem nome',
    brand: data.product.brands?.split(',')[0]?.trim() ?? '',
    serving: data.product.serving_size || '100 g',
    image: data.product.image_front_small_url,
    per100: {
      kcal: Math.round(kcal),
      p: round1(num('proteins_100g')),
      c: round1(num('carbohydrates_100g')),
      g: round1(num('fat_100g')),
      fiber: round1(num('fiber_100g')),
      sodiumMg: Math.round(num('sodium_100g') * 1000),
    },
  }
}
