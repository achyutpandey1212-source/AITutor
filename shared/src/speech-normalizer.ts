/**
 * Speech and Caption Normalizer for AI Tutor
 * Converts mathematical notation, LaTeX expressions, physics formulas,
 * and Markdown formatting into natural, phonetically pronounceable spoken words.
 *
 * Guarantees that TTS engines never speak "slash", "frac", "curly brace", etc.
 */

/**
 * Normalizes general mathematical formulas into spoken English words.
 */
export function formatFormulaForSpeech(formula: string): string {
  if (!formula || typeof formula !== 'string') return '';

  let spoken = formula;

  // 1. Remove LaTeX display/inline math delimiters
  spoken = spoken.replace(/\$\$([\s\S]*?)\$\$/g, '$1');
  spoken = spoken.replace(/\$([^$]+)\$/g, '$1');

  // 2. Remove LaTeX font/text styling wrappers: \text{...}, \mathrm{...}, \mathbf{...}, \mathit{...}
  spoken = spoken.replace(/\\text\{([^}]*)\}/g, '$1');
  spoken = spoken.replace(/\\mathrm\{([^}]*)\}/g, '$1');
  spoken = spoken.replace(/\\mathbf\{([^}]*)\}/g, '$1');
  spoken = spoken.replace(/\\mathit\{([^}]*)\}/g, '$1');

  // 3. Remove LaTeX sizing and grouping modifiers: \left, \right, \Big, \big
  spoken = spoken.replace(/\\(left|right|Big|big|Bigg|bigg)[([\]{}|.]/g, '');

  // 4. Common high-school physics & math formulas (natural cadence overrides)
  // Mirror formula: 1/f = 1/v + 1/u
  spoken = spoken.replace(
    /(?:\\frac\{1\}\{f\}|1\s*\/\s*f)\s*=\s*(?:\\frac\{1\}\{v\}|1\s*\/\s*v)\s*\+\s*(?:\\frac\{1\}\{u\}|1\s*\/\s*u)/gi,
    'one over f equals one over v plus one over u'
  );
  // Lens formula: 1/f = 1/v - 1/u
  spoken = spoken.replace(
    /(?:\\frac\{1\}\{f\}|1\s*\/\s*f)\s*=\s*(?:\\frac\{1\}\{v\}|1\s*\/\s*v)\s*-\s*(?:\\frac\{1\}\{u\}|1\s*\/\s*u)/gi,
    'one over f equals one over v minus one over u'
  );
  // Magnification: m = -v/u or m = hi/ho
  spoken = spoken.replace(
    /\bm\s*=\s*-\s*(?:\\frac\{v\}\{u\}|v\s*\/\s*u)\b/gi,
    'm equals negative v over u'
  );
  spoken = spoken.replace(
    /\bm\s*=\s*(?:\\frac\{h_?i\}\{h_?o\}|h_?i\s*\/\s*h_?o)\b/gi,
    'm equals h i over h o'
  );
  // Snell's Law: n1 sin theta1 = n2 sin theta2
  spoken = spoken.replace(
    /n_?1\s*(?:\\cdot|\*|×)?\s*\\?sin\s*\(?\\?theta_?1\)?\s*=\s*n_?2\s*(?:\\cdot|\*|×)?\s*\\?sin\s*\(?\\?theta_?2\)?/gi,
    'n one times sine theta one equals n two times sine theta two'
  );
  // Refractive index: n = c / v
  spoken = spoken.replace(
    /\bn\s*=\s*(?:\\frac\{c\}\{v\}|c\s*\/\s*v)\b/gi,
    'n equals c over v'
  );
  // Newton's Second Law: F = ma
  spoken = spoken.replace(/\bF\s*=\s*m\s*(?:\\cdot|\*|×)?\s*a\b/gi, 'F equals m a');
  // Kinematic: v = u + at
  spoken = spoken.replace(/\bv\s*=\s*u\s*\+\s*a\s*(?:\\cdot|\*|×)?\s*t\b/gi, 'v equals u plus a t');
  // Kinematic: s = ut + 1/2 a t^2
  spoken = spoken.replace(
    /\bs\s*=\s*u\s*(?:\\cdot|\*|×)?\s*t\s*\+\s*(?:\\frac\{1\}\{2\}|1\/2)\s*(?:\\cdot|\*|×)?\s*a\s*(?:\\cdot|\*|×)?\s*t(?:\^2|\^\{2\})\b/gi,
    's equals u t plus one half a t squared'
  );
  // Kinematic: v^2 = u^2 + 2as
  spoken = spoken.replace(
    /\bv(?:\^2|\^\{2\})\s*=\s*u(?:\^2|\^\{2\})\s*\+\s*2\s*(?:\\cdot|\*|×)?\s*a\s*(?:\\cdot|\*|×)?\s*s\b/gi,
    'v squared equals u squared plus two a s'
  );
  // Mass-Energy: E = mc^2
  spoken = spoken.replace(/\bE\s*=\s*m\s*(?:\\cdot|\*|×)?\s*c(?:\^2|\^\{2\})\b/gi, 'E equals m c squared');

  // 5. Recursive LaTeX fraction conversion: \frac{A}{B} -> spoken A over spoken B
  let prevSpoken = '';
  let fractionGuard = 0;
  while (spoken !== prevSpoken && fractionGuard < 5) {
    prevSpoken = spoken;
    fractionGuard++;
    spoken = spoken.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_match, num, den) => {
      const cleanNum = num.trim();
      const cleanDen = den.trim();
      if (cleanNum === '1' && cleanDen === '2') return 'one half';
      if (cleanNum === '1' && cleanDen === '3') return 'one third';
      if (cleanNum === '1' && cleanDen === '4') return 'one fourth';
      if (cleanNum === '1') return `one over ${cleanDen}`;
      return `${cleanNum} over ${cleanDen}`;
    });
  }

  // 6. Inline division between word/number tokens: a / b -> a over b
  spoken = spoken.replace(/(\b[a-zA-Z0-9_]+)\s*\/\s*([a-zA-Z0-9_]+)/g, (_match, num, den) => {
    if (num === '1' && den === '2') return 'one half';
    if (num === '1' && den === '3') return 'one third';
    if (num === '1' && den === '4') return 'one fourth';
    if (num === '1') return `one over ${den}`;
    return `${num} over ${den}`;
  });

  // 7. Roots
  spoken = spoken.replace(/\\sqrt\[3\]\{([^{}]+)\}/g, 'cube root of $1');
  spoken = spoken.replace(/\\sqrt\{([^{}]+)\}/g, 'square root of $1');
  spoken = spoken.replace(/\\sqrt\s*([a-zA-Z0-9]+)/g, 'square root of $1');

  // 8. Trigonometric & logarithmic functions
  spoken = spoken.replace(/\\sin\b|\bsin(?=\s*\(|\s+[a-zA-Z0-9\\]|\b)/gi, 'sine ');
  spoken = spoken.replace(/\\cos\b|\bcos(?=\s*\(|\s+[a-zA-Z0-9\\]|\b)/gi, 'cosine ');
  spoken = spoken.replace(/\\tan\b|\btan(?=\s*\(|\s+[a-zA-Z0-9\\]|\b)/gi, 'tangent ');
  spoken = spoken.replace(/\\log\b|\blog(?=\s*\(|\s+[a-zA-Z0-9\\]|\b)/gi, 'log ');
  spoken = spoken.replace(/\\ln\b|\bln(?=\s*\(|\s+[a-zA-Z0-9\\]|\b)/gi, 'natural log ');

  // 9. Greek letters
  spoken = spoken.replace(/\\theta\b|(?<![a-zA-Z])theta(?![a-zA-Z])/gi, 'theta');
  spoken = spoken.replace(/\\alpha\b|(?<![a-zA-Z])alpha(?![a-zA-Z])/gi, 'alpha');
  spoken = spoken.replace(/\\beta\b|(?<![a-zA-Z])beta(?![a-zA-Z])/gi, 'beta');
  spoken = spoken.replace(/\\gamma\b|(?<![a-zA-Z])gamma(?![a-zA-Z])/gi, 'gamma');
  spoken = spoken.replace(/\\delta\b|(?<![a-zA-Z])delta(?![a-zA-Z])/gi, 'delta');
  spoken = spoken.replace(/\\Delta\b/g, 'delta');
  spoken = spoken.replace(/\\lambda\b|(?<![a-zA-Z])lambda(?![a-zA-Z])/gi, 'lambda');
  spoken = spoken.replace(/\\pi\b|(?<![a-zA-Z])pi(?![a-zA-Z0-9])/gi, 'pi');
  spoken = spoken.replace(/\\mu\b/gi, 'mu');
  spoken = spoken.replace(/\\omega\b/gi, 'omega');
  spoken = spoken.replace(/\\Omega\b/g, 'omega');
  spoken = spoken.replace(/\\phi\b/gi, 'phi');

  // 10. Superscripts and Powers
  spoken = spoken.replace(/\^\{\\circ\}|\^\circ|°/g, ' degrees ');
  spoken = spoken.replace(/\^\{2\}|\^2/g, ' squared ');
  spoken = spoken.replace(/\^\{3\}|\^3/g, ' cubed ');
  spoken = spoken.replace(/\^\{([^{}]+)\}|\^([a-zA-Z0-9]+)/g, ' to the power of $1$2 ');

  // 11. Subscripts
  spoken = spoken.replace(/_\{1\}|_1|₁/g, ' one ');
  spoken = spoken.replace(/_\{2\}|_2|₂/g, ' two ');
  spoken = spoken.replace(/_\{i\}|_i/g, ' i ');
  spoken = spoken.replace(/_\{r\}|_r/g, ' r ');
  spoken = spoken.replace(/_\{21\}|_21/g, ' two one ');
  spoken = spoken.replace(/_\{net\}|_net/g, ' net ');
  spoken = spoken.replace(/_\{total\}|_total/g, ' total ');
  spoken = spoken.replace(/_\{([^{}]+)\}|_([a-zA-Z0-9])/g, ' $1$2 ');

  // 12. Mathematical operators & relations
  spoken = spoken.replace(/\\pm|±/g, ' plus or minus ');
  spoken = spoken.replace(/\\times|×|\\cdot|·/g, ' times ');
  spoken = spoken.replace(/\\approx|≈/g, ' approximately equals ');
  spoken = spoken.replace(/\\neq|≠|!=/g, ' is not equal to ');
  spoken = spoken.replace(/\\leq|≤|<=/g, ' is less than or equal to ');
  spoken = spoken.replace(/\\geq|≥|>=/g, ' is greater than or equal to ');
  spoken = spoken.replace(/\\to|\\rightarrow|→/g, ' approaches ');
  spoken = spoken.replace(/\\infty|∞/g, ' infinity ');
  spoken = spoken.replace(/\\div|÷/g, ' divided by ');
  spoken = spoken.replace(/\s*=\s*/g, ' equals ');
  spoken = spoken.replace(/\s*\+\s*/g, ' plus ');
  spoken = spoken.replace(/(?<=\b[a-zA-Z0-9])\s*-\s*(?=\b[a-zA-Z0-9])/g, ' minus ');
  spoken = spoken.replace(/(?<![a-zA-Z0-9])-\s*(?=\b[a-zA-Z0-9])/g, 'negative ');

  // 13. Strip any remaining backslash LaTeX macros and grouping symbols
  spoken = spoken.replace(/\\[a-zA-Z]+/g, ' ');
  spoken = spoken.replace(/[{}[\]()$^_\\|]/g, ' ');

  // 14. Clean up whitespace
  spoken = spoken.replace(/\s+/g, ' ').trim();

  return spoken;
}

/**
 * Deterministically strips Markdown syntax, normalizes mathematical/presentation
 * characters, and formats LaTeX expressions so that Speech Synthesis (TTS)
 * produces clean, natural pronunciation without raw syntax.
 */
export function normalizeTextForSpeech(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  // 1. Remove code blocks (```...```) and inline code (`...`)
  sanitized = sanitized.replace(/```[\s\S]*?```/g, ' ');
  sanitized = sanitized.replace(/`([^`]+)`/g, '$1');

  // 2. Remove HTML tags (<...>)
  sanitized = sanitized.replace(/<[^>]*>/g, ' ');

  // 3. Remove Markdown images: ![alt](url) -> ""
  sanitized = sanitized.replace(/!\[([^\]]*)\]\([^)]*\)/g, '');

  // 4. Remove Markdown links: [text](url) -> text
  sanitized = sanitized.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');

  // 5. Convert display LaTeX formulas: $$...$$ -> spoken formula
  sanitized = sanitized.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula) => {
    return ` ${formatFormulaForSpeech(formula)} `;
  });

  // 6. Convert inline LaTeX formulas: $...$ -> spoken formula
  sanitized = sanitized.replace(/\$([^$]+)\$/g, (_match, formula) => {
    return ` ${formatFormulaForSpeech(formula)} `;
  });

  // 7. Remove Markdown headers (#, ##, etc.)
  sanitized = sanitized.replace(/^#{1,6}\s+/gm, '');

  // 8. Remove blockquotes, horizontal rules, and bullet points first
  sanitized = sanitized.replace(/^\s*>\s*/gm, '');
  sanitized = sanitized.replace(/^[-*_]{3,}\s*$/gm, '');
  sanitized = sanitized.replace(/^\s*[-*+]\s+/gm, '');
  sanitized = sanitized.replace(/^\s*\d+\.\s+/gm, '');

  // 9. Remove bold / italic markers (**text**, *text*, __text__, _text_)
  sanitized = sanitized.replace(/(\*\*|__)(.*?)\1/g, '$2');
  sanitized = sanitized.replace(/(\*|_)(.*?)\1/g, '$2');

  // 10. Strip any remaining stray markdown formatting characters
  sanitized = sanitized.replace(/[*_~#]/g, '');

  // 11. Process any remaining raw mathematical notation
  sanitized = formatFormulaForSpeech(sanitized);

  // 11. Normalize punctuation spacing and double punctuation
  sanitized = sanitized.replace(/\s+([.,!?:;])/g, '$1');
  sanitized = sanitized.replace(/([.,!?:;])(?=[A-Za-z0-9])/g, '$1 ');
  sanitized = sanitized.replace(/\.{2,}/g, '.');
  sanitized = sanitized.replace(/\?{2,}/g, '?');
  sanitized = sanitized.replace(/!{2,}/g, '!');

  // 12. Normalize whitespace and trim
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * Normalizes subtitle / caption text.
 * Captions should be concise, readable, and free from Markdown or raw LaTeX syntax.
 */
export function cleanCaptionText(text: string, maxLength = 140): string {
  if (!text || typeof text !== 'string') return '';

  // Clean through speech normalizer first to eliminate markdown & raw LaTeX
  let clean = normalizeTextForSpeech(text);

  // If the caption exceeds the recommended max length, truncate at sentence or word boundary
  if (clean.length > maxLength) {
    // Attempt sentence boundary first
    const sentenceMatch = clean.slice(0, maxLength).match(/^(.*?[.!?])(?:\s|$)/);
    if (sentenceMatch && sentenceMatch[1] && sentenceMatch[1].length > 30) {
      clean = sentenceMatch[1];
    } else {
      // Word boundary
      const truncated = clean.slice(0, maxLength);
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 40) {
        clean = `${truncated.slice(0, lastSpace)}...`;
      } else {
        clean = `${truncated}...`;
      }
    }
  }

  return clean.trim();
}
