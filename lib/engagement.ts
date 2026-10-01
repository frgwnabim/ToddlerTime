// Angka dasar interaksi (dummy) + aturan bersama untuk riwayat tonton.

/** Jumlah like dasar (dummy) sebuah video: ±1% dari jumlah tayangan. */
export function baseLikes(views: number): number {
  return Math.round(views / 100)
}

export const MAX_COMMENT_LENGTH = 300

/** Lanjutkan video hanya bila posisi terakhir di tengah-tengah video. */
export function shouldResume(positionSeconds: number, durationSeconds: number): boolean {
  return positionSeconds >= 5 && positionSeconds < durationSeconds - 10
}

/** Rasio progress (0-1) untuk bar tipis di thumbnail. */
export function watchProgressRatio(positionSeconds: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0
  return Math.min(1, Math.max(0, positionSeconds / durationSeconds))
}
