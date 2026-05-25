export interface Evaluation {
  title: string;
  subtitle: string;
  totalPoints: number;
  lessonReminder?: LessonReminder;
  exercises: Exercise[];
  answerKey: AnswerKeyEntry[];
}

export interface LessonReminder {
  title: string;
  textLines?: string[];
  bulletPoints?: string[];
  abbreviations?: { abbr: string; meaning: string }[];
}

export type Exercise = {
  number: number;
  title: string;
  instruction: string;
  subInstruction?: string;
  points: number;
  warning?: string;
} & ExerciseContent;

export type ExerciseContent =
  | { type: "fill_in_blank"; wordBank?: string[]; items: FillBlankItem[] }
  | { type: "true_false"; items: TrueFalseItem[] }
  | { type: "multiple_choice"; items: MultipleChoiceItem[] }
  | { type: "open_question"; items: OpenQuestionItem[] }
  | { type: "table_fill"; table: TableFillContent }
  | { type: "matching"; pairs: MatchingPair[] }
  | { type: "circle_correct"; items: CircleItem[] }
  | { type: "color_if_wrong"; items: ColorIfWrongItem[] }
  | { type: "color_labels"; legend: ColorLegend[]; items: ColorLabelItem[] }
  | { type: "checkbox_list"; groups: CheckboxGroup[] }
  | { type: "calculation"; items: CalculationItem[] }
  | { type: "word_analysis"; sentences: WordAnalysisSentence[] }
  | { type: "classification"; categories: string[]; items: ClassificationItem[] };

export interface FillBlankItem {
  prefix: string;
  suffix: string;
  answer: string;
}

export interface TrueFalseItem {
  statement: string;
  answer: boolean;
  explanation: string;
}

export interface MultipleChoiceItem {
  question: string;
  options: string[];
  answerIndex: number;
}

export interface OpenQuestionItem {
  question: string;
  answer: string;
  lines: number;
}

export interface TableFillContent {
  headers: string[];
  rows: TableFillRow[];
}

export interface TableFillRow {
  rowLabel: string;
  cells: number;
  answers: string[];
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface CircleItem {
  text: string;
  isCorrect: boolean;
  hint?: string;
}

export interface ColorIfWrongItem {
  text: string;
  isCorrect: boolean;
  hint?: string;
}

export interface ColorLegend {
  color: "rouge" | "bleu" | "vert" | "orange" | "jaune";
  meaning: string;
}

export interface ColorLabelItem {
  text: string;
  expectedColor: string;
  hint?: string;
}

export interface CheckboxGroup {
  title: string;
  options: CheckboxOption[];
}

export interface CheckboxOption {
  text: string;
  isCorrect: boolean;
  hint?: string;
}

export interface CalculationItem {
  problem: string;
  answer: string;
}

export interface WordAnalysisSentence {
  sentence: string;
  warning?: string;
  words: WordAnalysis[];
}

export interface WordAnalysis {
  word: string;
  nature: string;
  attrs: string;
}

export interface ClassificationItem {
  value: string;
  category: string;
}

export interface AnswerKeyEntry {
  exerciseNumber: number;
  title: string;
  points: number;
  hasWarning?: boolean;
  warningNote?: string;
}

export function isValidEvaluation(obj: unknown): obj is Evaluation {
  if (!obj || typeof obj !== "object") return false;
  const e = obj as Record<string, unknown>;

  if (typeof e.title !== "string") return false;
  if (typeof e.subtitle !== "string") return false;
  if (typeof e.totalPoints !== "number") return false;
  if (!Array.isArray(e.exercises)) return false;
  if (!Array.isArray(e.answerKey)) return false;

  const validTypes = new Set([
    "fill_in_blank", "true_false", "multiple_choice", "open_question",
    "table_fill", "matching", "circle_correct", "color_if_wrong",
    "color_labels", "checkbox_list", "calculation", "word_analysis",
    "classification"
  ]);

  for (const ex of e.exercises as Record<string, unknown>[]) {
    if (typeof ex.number !== "number") return false;
    if (typeof ex.title !== "string") return false;
    if (typeof ex.instruction !== "string") return false;
    if (typeof ex.points !== "number") return false;
    if (!validTypes.has(ex.type as string)) return false;
  }

  return true;
}
