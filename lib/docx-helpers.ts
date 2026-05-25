import {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  VerticalAlign,
  type IBorderOptions,
  type TableVerticalAlign,
} from "docx";

type ITableCellBorders = {
  readonly top?: IBorderOptions;
  readonly left?: IBorderOptions;
  readonly bottom?: IBorderOptions;
  readonly right?: IBorderOptions;
};

export const BORDER_BLACK = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
export const BORDERS_ALL = {
  top: BORDER_BLACK,
  bottom: BORDER_BLACK,
  left: BORDER_BLACK,
  right: BORDER_BLACK,
};
export const BORDER_LIGHT = { style: BorderStyle.SINGLE, size: 4, color: "999999" };
export const BORDERS_LIGHT = {
  top: BORDER_LIGHT,
  bottom: BORDER_LIGHT,
  left: BORDER_LIGHT,
  right: BORDER_LIGHT,
};
export const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
export const BORDERS_NONE = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
};

export const SHADE_HEADER = { fill: "FCE4EC", type: ShadingType.CLEAR, color: "auto" };
export const SHADE_REMINDER = { fill: "FFF8E1", type: ShadingType.CLEAR, color: "auto" };
export const SHADE_LIGHT_PINK = { fill: "FFF5F7", type: ShadingType.CLEAR, color: "auto" };

export const COLOR_BLUE = "2E75B6";
export const COLOR_RED = "C00000";
export const COLOR_GREEN = "2E7D32";
export const COLOR_GRAY = "666666";

export const PAGE_WIDTH_DXA = 9360;

export function makeCell(
  children: Paragraph[],
  opts: {
    width?: number;
    shading?: typeof SHADE_HEADER;
    borders?: ITableCellBorders;
    verticalAlign?: TableVerticalAlign;
    margins?: { top: number; bottom: number; left: number; right: number };
  } = {}
): TableCell {
  return new TableCell({
    children,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.shading,
    borders: opts.borders || BORDERS_ALL,
    verticalAlign: (opts.verticalAlign || VerticalAlign.CENTER) as TableVerticalAlign,
    margins: opts.margins || { top: 100, bottom: 100, left: 120, right: 120 },
  });
}

export function textCell(
  text: string,
  opts: {
    width?: number;
    shading?: typeof SHADE_HEADER;
    bold?: boolean;
    italics?: boolean;
    size?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    color?: string;
  } = {}
): TableCell {
  return makeCell(
    [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: opts.bold,
            italics: opts.italics,
            size: opts.size || 22,
            color: opts.color,
          }),
        ],
        alignment: opts.alignment || AlignmentType.CENTER,
      }),
    ],
    { width: opts.width, shading: opts.shading }
  );
}

export function exerciseHeader(num: number, title: string, points: number): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `Exercice ${num} – ${title}   (${points} pts)`,
        bold: true,
        size: 26,
        color: COLOR_BLUE,
      }),
    ],
    spacing: { before: 200, after: 100 },
  });
}

export function instructionParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    spacing: { after: 80 },
  });
}

export function subInstructionParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, size: 20, color: COLOR_GRAY })],
    spacing: { after: 120 },
  });
}

export function warningParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `⚠️ ${text}`, italics: true, size: 20, color: COLOR_RED }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
  });
}

export function blankLine(): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: "                                                                                ",
        size: 22,
      }),
    ],
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "999999", space: 8 },
    },
    spacing: { after: 160 },
  });
}

export function spacer(after: number = 100): Paragraph {
  return new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after } });
}

export function parseMarkdownBold(text: string): { text: string; bold: boolean }[] {
  const parts: { text: string; bold: boolean }[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    parts.push({ text: match[1], bold: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), bold: false });
  }
  return parts.length > 0 ? parts : [{ text, bold: false }];
}
