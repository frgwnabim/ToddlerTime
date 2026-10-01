export const THEME_STORAGE_KEY = "toddlertime-theme"

export type Theme = "light" | "dark"

/**
 * Skrip kecil yang dijalankan sebelum halaman tampil, supaya mode malam
 * langsung terpasang tanpa kedipan terang.
 */
export const themeInitScript = `(function(){try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})()`

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // localStorage bisa diblokir (mode privat); tema tetap berlaku untuk sesi ini.
  }
}
