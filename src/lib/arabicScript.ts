const ARABIC_SCRIPT_PATTERN = /[؀-ۿ]/;

export function containsArabicScript(fields: (string | undefined)[]): boolean {
  return fields.some((field) => field !== undefined && ARABIC_SCRIPT_PATTERN.test(field));
}
