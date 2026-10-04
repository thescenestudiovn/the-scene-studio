const ALLOWED_TAGS = new Set(["a","b","blockquote","br","div","em","font","h1","h2","h3","h4","h5","h6","i","li","ol","p","span","strong","u","ul"]);
const SAFE_CLASSES = new Set(["text-6xl","text-5xl","text-4xl","text-3xl","text-2xl","text-xl","text-lg","text-base","text-sm","font-serif","leading-[1.05]","leading-[1.08]","leading-[1.12]","leading-[1.16]","leading-[1.2]","leading-[1.25]","leading-[1.3]","leading-8","leading-7","leading-6"]);
const SAFE_STYLE = /^(color:\s*#[0-9a-f]{3,8}|text-align:\s*(left|center|right|justify)|font-weight:\s*(normal|bold|[1-9]00)|font-style:\s*(normal|italic)|text-decoration:\s*(none|underline|line-through))$/i;

function sanitizeHtml(value: string): string {
  let html = value.replace(/<!--[\\s\\S]*?-->/g, "");
  html = html.replace(/<(script|style|iframe|object|embed|form|input|textarea|button|select|option|meta|link)[^>]*>[\\s\\S]*?<\/\\1>/gi, "");
  html = html.replace(/<(script|style|iframe|object|embed|form|input|textarea|button|select|option|meta|link)(?:\\s[^>]*)?\\/?\\s*>/gi, "");
  return html.replace(/<\/?([a-z0-9]+)(?:\s[^>]*)?\s*\/?>/gi, (full, rawTag) => {
    const tag = String(rawTag).toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (/^<\//.test(full)) return `</${tag}>`;
    if (tag === "br") return "<br />";
    const attrs = [...full.matchAll(/([a-zA-Z:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)];
    const kept: string[] = [];
    for (const match of attrs) {
      const name = match[1].toLowerCase();
      const attrValue = match[2] ?? match[3] ?? "";
      if (name === "class") {
        const classes = attrValue.split(/\s+/).filter(cls => SAFE_CLASSES.has(cls));
        if (classes.length) kept.push(`class="${classes.join(" ")}"`);
      } else if (name === "style") {
        const styles = attrValue.split(";").map(s => s.trim()).filter(Boolean).filter(s => SAFE_STYLE.test(s));
        if (styles.length) kept.push(`style="${styles.join("; ")}"`);
      } else if (name === "align" && /^(left|center|right|justify)$/i.test(attrValue)) {
        kept.push(`align="${attrValue.toLowerCase()}"`);
      } else if (tag === "a" && (name === "href" || name === "target" || name === "rel")) {
        if (name === "href" && !/^(https?:|mailto:|tel:|\/)/i.test(attrValue)) continue;
        kept.push(`${name}="${attrValue.replace(/"/g, "&quot;")}"`);
      } else if (tag === "font" && name === "color" && /^#[0-9a-f]{3,8}$/i.test(attrValue)) {
        kept.push(`color="${attrValue}"`);
      }
    }
    return `<${tag}${kept.length ? " " + kept.join(" ") : ""}>`;
  });
}

export default sanitizeHtml;
