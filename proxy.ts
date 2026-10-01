import type { NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/proxy"

// Next 16: "middleware" sekarang bernama "proxy".
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Semua halaman, kecuali aset statis, optimasi gambar, dan file publik.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|products/|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
