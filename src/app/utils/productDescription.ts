const KEYWORD_TERMS = [
  "ABS Doubleshot",
  "Doubleshot",
  "GMK Botanical 2",
  "GMK Botanical",
  "LED RGB",
  "Cherry Profile",
  "Fullsize",
  "ton-sur-ton",
  "keycap",
  "layout",
  "GMK",
  "PBT",
  "ABS",
  "RGB",
  "OEM",
  "TKL",
  "SA",
  "DSA",
  "XDA",
  "MT3",
  "60%",
  "65%",
  "75%",
];

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const stripProductDescriptionHtml = (value = "") =>
  value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");

const putDashItemsOnSeparateLines = (value: string) =>
  value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+-\s+(?=[^\d\s])/g, "\n- ")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const boldKeywordsOutsideStrong = (html: string) => {
  const keywordPattern = new RegExp(`(^|[^\\p{L}\\p{N}])(${KEYWORD_TERMS.map(escapeRegExp).join("|")})(?=$|[^\\p{L}\\p{N}])`, "giu");

  return html
    .split(/(<strong>.*?<\/strong>)/gi)
    .map((part) => {
      if (/^<strong>.*<\/strong>$/i.test(part)) return part;
      return part.replace(keywordPattern, "$1<strong>$2</strong>");
    })
    .join("");
};

const boldLeadingKeyword = (line: string) =>
  line.replace(/^([-*]\s*)([^:\n]+):/, (_match, bullet, keyword) => {
    return `${bullet}<strong>${keyword.trim()}</strong>:`;
  });

export const formatProductDescriptionToHtml = (value = "") => {
  const rawText = stripProductDescriptionHtml(value);
  const lines = putDashItemsOnSeparateLines(rawText);

  return lines
    .map((line) => {
      const escapedLine = escapeHtml(line);
      return boldKeywordsOutsideStrong(boldLeadingKeyword(escapedLine));
    })
    .join("<br />\n");
};

export const sanitizeProductDescriptionHtml = (value = "") =>
  value
    .replace(/<(?!\/?strong\b|br\s*\/?>)[^>]*>/gi, "")
    .replace(/<strong\b[^>]*>/gi, "<strong>")
    .replace(/<\/strong\s*>/gi, "</strong>")
    .replace(/<br\b[^>]*>/gi, "<br />");
