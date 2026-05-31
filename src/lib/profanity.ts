// Shared profanity guard for all user-generated text (names, bios, reviews,
// messages, contact forms, …). Used on the server so it can't be bypassed by
// calling the API directly; the same helper backs client-side feedback.
//
// Whole-word, case-insensitive matching (with common leet substitutions) keeps
// false positives down — "assistant" / "Scunthorpe" won't trip the filter.

const BAD_WORDS = [
  // English
  'fuck', 'fucker', 'fucking', 'motherfucker', 'shit', 'bullshit', 'bitch',
  'bastard', 'asshole', 'arsehole', 'dick', 'dickhead', 'piss', 'prick',
  'cunt', 'slut', 'whore', 'douche', 'wanker', 'twat', 'cock', 'pussy',
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'spastic', 'jerkoff',
  // Turkish
  'amk', 'aq', 'orospu', 'pic', 'piç', 'gavat', 'kahpe', 'yarak', 'yarrak',
  'sik', 'siktir', 'sikeyim', 'göt', 'gotveren', 'götveren', 'amcik', 'amcık',
  'amına', 'amina', 'oç', 'oc', 'pezevenk', 'ibne', 'salak', 'gerizekalı',
];

// Map common leet/symbol substitutions back to letters before testing.
const LEET: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a', '$': 's',
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[013457@$]/g, (c) => LEET[c] ?? c)
    // collapse repeated letters (fuuuck -> fuck) and strip separators between letters
    .replace(/(.)\1{2,}/g, '$1$1');
}

const escape = (w: string) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PROFANITY_RE = new RegExp(`(^|[^\\p{L}])(${BAD_WORDS.map(escape).join('|')})([^\\p{L}]|$)`, 'iu');

export function containsProfanity(text: string | null | undefined): boolean {
  if (!text) return false;
  return PROFANITY_RE.test(normalize(String(text)));
}

// Returns an error message if any of the supplied values contains profanity,
// otherwise null. Convenient for guarding multiple fields at once in a route.
export function checkProfanity(...values: (string | null | undefined)[]): string | null {
  return values.some((v) => containsProfanity(v))
    ? 'Please remove inappropriate language before continuing.'
    : null;
}
