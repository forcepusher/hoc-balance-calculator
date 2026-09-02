const SPREADSHEET_ID_PATTERN = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/i;

export function extractSpreadsheetId(raw: string): string | null {
    const match = raw.trim().match(SPREADSHEET_ID_PATTERN);
    return match ? match[1] : null;
}

/** Canonical document URL with `/edit?...` (and other suffixes) stripped. */
export function normalizeGoogleSheetUrl(raw: string): string {
    const trimmed = raw.trim();
    const id = extractSpreadsheetId(trimmed);
    if (!id) {
        return trimmed;
    }
    return canonicalGoogleSheetUrl(id);
}

export function canonicalGoogleSheetUrl(spreadsheetId: string): string {
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
}

/** CSV download URL used when fetching a table. */
export function toGoogleSheetCsvExportUrl(raw: string): string {
    const id = extractSpreadsheetId(raw);
    if (!id) {
        throw new Error('Not a Google Sheets URL');
    }
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
}

export function shouldRewritePastedSheetUrl(raw: string): boolean {
    const trimmed = raw.trim();
    if (!extractSpreadsheetId(trimmed)) {
        return false;
    }
    return /\/edit\b/i.test(trimmed)
        || /\/export\b/i.test(trimmed)
        || /\/pubhtml\b/i.test(trimmed)
        || /[?#]/.test(trimmed)
        || /\/$/.test(trimmed);
}

export async function fetchGoogleSheetCsv(sheetUrl: string): Promise<string> {
    const exportUrl = toGoogleSheetCsvExportUrl(sheetUrl);
    const response = await fetch(exportUrl, {
        method: 'GET',
        redirect: 'follow',
        credentials: 'omit',
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    if (looksLikeHtml(text)) {
        throw new Error('Sheet is not publicly accessible (got an HTML page instead of CSV)');
    }
    return text;
}

export interface ParsedCsvTable {
    headers: string[];
    rows: string[][];
}

export function parseCsvTable(text: string): ParsedCsvTable {
    const matrix = parseCsv(text);
    const nonempty = matrix.filter((row) => row.some((cell) => cell !== ''));
    if (nonempty.length === 0) {
        throw new Error('CSV is empty');
    }

    const headers = nonempty[0];
    const rows = nonempty.slice(1).map((row) => {
        const padded = row.slice();
        while (padded.length < headers.length) {
            padded.push('');
        }
        return padded.slice(0, headers.length);
    });

    return { headers, rows };
}

function looksLikeHtml(text: string): boolean {
    const sample = text.slice(0, 256).trim().toLowerCase();
    return sample.startsWith('<!doctype') || sample.startsWith('<html');
}

function parseCsv(text: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;
    const src = text.replace(/^\uFEFF/, '');

    const pushCell = (): void => {
        row.push(cell.trim());
        cell = '';
    };

    const pushRow = (): void => {
        pushCell();
        if (row.some((value) => value !== '')) {
            rows.push(row);
        }
        row = [];
    };

    for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        if (inQuotes) {
            if (ch === '"') {
                if (src[i + 1] === '"') {
                    cell += '"';
                    i += 1;
                } else {
                    inQuotes = false;
                }
            } else {
                cell += ch;
            }
            continue;
        }

        if (ch === '"') {
            inQuotes = true;
            continue;
        }
        if (ch === ',') {
            pushCell();
            continue;
        }
        if (ch === '\n') {
            pushRow();
            continue;
        }
        if (ch === '\r') {
            continue;
        }
        cell += ch;
    }

    if (inQuotes || cell !== '' || row.length > 0) {
        pushRow();
    }

    return rows;
}
