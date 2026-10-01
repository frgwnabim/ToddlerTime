// Filter kata kasar sederhana (Bahasa Indonesia & Inggris) untuk komentar.
// Daftar yang sama juga dipakai trigger `comments_block_profanity` di
// supabase/schema.sql. Ubah keduanya bersamaan.
//
// Sengaja TIDAK memblokir nama hewan (anjing, babi, monyet, ...) karena
// dipakai wajar di video anak.

/** Diblokir bila sebuah kata DIAWALI akar ini (mis. "fucking", "goblokk"). */
const ROOTS = [
  // Indonesia
  "bangsat", "bajingan", "kontol", "memek", "ngentot", "entot", "jancok", "jancuk", "goblok", "goblog",
  "tolol", "kampret", "keparat", "brengsek", "bacot", "pantek", "lonte", "pelacur", "bencong", "sialan",
  // Inggris
  "fuck", "shit", "bitch", "bastard", "asshole", "motherfuck", "cunt", "pussy", "whore", "slut",
  "retard", "nigger", "nigga", "faggot",
]

/** Diblokir hanya bila katanya persis sama (terlalu pendek untuk dicocokkan awalan). */
const EXACT = ["tai", "taik", "asu", "bego", "dungu", "idiot", "dick", "fag", "wtf", "stfu"]

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" }

function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .replace(/[013457@$!]/g, (char) => LEET[char] ?? char)
    .normalize("NFKD")
    .replace(/[^a-z]/g, "")
    .replace(/(.)\1{2,}/g, "$1$1") // "fuuuuck" -> "fuuck"
}

function wordVariants(word: string): string[] {
  const normalized = normalizeWord(word)
  // Juga versi tanpa huruf ganda: "fuuck" -> "fuck", "goblokk" -> "goblok"
  return [normalized, normalized.replace(/(.)\1+/g, "$1")]
}

/** True bila teks mengandung kata kasar. */
export function containsProfanity(text: string): boolean {
  // Pisah per spasi dulu supaya leetspeak ("f*ck", "sh1t") tetap satu kata.
  const words = text.split(/\s+/).flatMap((chunk) => chunk.split(/[^\p{L}\p{N}@$!*]+/u))
  // Gabungan huruf berspasi: "f u c k" -> "fuck"
  const spacedLetters = text
    .split(/\s+/)
    .filter((chunk) => chunk.length === 1)
    .join("")

  return [...words, spacedLetters].some((word) => (word.includes("*") ? matchesMasked(word) : isBadWord(word)))
}

function isBadWord(word: string): boolean {
  return wordVariants(word).some(
    (variant) => variant.length > 0 && (EXACT.includes(variant) || ROOTS.some((root) => variant.startsWith(root)))
  )
}

/** Kata bersensor seperti "f*ck" atau "sh*t": "*" dianggap satu huruf apa saja. */
function matchesMasked(word: string): boolean {
  const pattern = word
    .toLowerCase()
    .replace(/[013457@$!]/g, (char) => LEET[char] ?? char)
    .replace(/[^a-z*]/g, "")
  if (pattern.replace(/\*/g, "").length < 2) return false
  const regex = new RegExp(`^${pattern.replace(/\*/g, "[a-z]")}`)
  return [...ROOTS, ...EXACT].some((bad) => regex.test(bad) && pattern.length >= Math.min(bad.length, 4))
}

export const PROFANITY_MESSAGE = "Ups, komentarnya ada kata yang kurang baik. Yuk, pakai kata-kata yang ramah."
