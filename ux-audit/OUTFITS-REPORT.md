# UX Audit — /outfits — 2026-09-22

**Scope:** /outfits (tab Outfits + tab Collection (Wardrobe))
**Primary task:** Melihat daftar outfit/koleksi, membuka detail, menambah outfit baru, mencatat pemakaian
**Viewports:** 375×812 / 1440×900

---

## Ringkasan

Halaman `/outfits` sudah memiliki pola interaksi yang koheren: grid card 2-kolom, bottom-sheet modal untuk create/edit/detail, drag-and-drop untuk reorder, dan konfirmasi pemakaian. Isi outfit sudah kaya (50+ outfit, koleksi wardrobe). Namun terdapat beberapa masalah signifikan: (1) tombol "+" dan tab berada di bawah touch target minimum iOS 44×44px, (2) tidak ada satu pun `aria-label` di seluruh komponen sehingga screen reader hanya membaca nama-nama produk panjang sebagai label button — sangat membingungkan, (3) halaman tidak responsif di 1440px (layout tetap seperti mobile, di tengah layar lebar), (4) label outfit di kartu menggunakan `text-[10px]` yang sangat kecil dan sulit dibaca, serta (5) warna hardcoded `red-500` dan `black/white` digunakan di luar Cubicle DS token. Secara keseluruhan fungsional untuk personal use di mobile, tapi perlu perbaikan aksesibilitas dan konsistensi DS.

---

## Temuan

| # | Isu | Halaman · file:line | Bukti | Severity | Heuristik | Rekomendasi |
|---|-----|----------------------|-------|----------|-----------|-------------|
| 1 | **Tombol "+" terlalu kecil** — ukuran 32×32px (di bawah minimum iOS 44×44px). Di mobile iPhone sangat mudah salah ketuk. | `/outfits` · `OutfitsClient.tsx:428` | Bounding box terukur: `[box=327,12,32,32]` — 32×32px | P1 | Ergonomi mobile / touch target | Ubah ke `w-11 h-11` (44×44px) atau tambah padding agar hit area ≥ 44px |
| 2 | **Tab "Outfits" dan "Collection (Wardrobe)" di bawah 44px tinggi** — tab hanya 32px tinggi (`py-1.5` + 1 baris teks ≈ 32px). | `/outfits` · `OutfitsClient.tsx:414,419` | Bounding box: `[box=16,12,69,32]` dan `[box=93,12,170,32]` | P1 | Ergonomi mobile | Naikkan ke `py-2.5` atau beri wrapper min-height 44px |
| 3 | **Tidak ada satupun `aria-label` di seluruh komponen** — semua button (outfit card, tombol "+", X, pencil, trash, share) tidak memiliki accessible name yang bermakna. Outfit card saat ini menggunakan nama-nama produk Tokopedia yang panjang sebagai accessible name otomatis (contoh: "Kaos Running COOLSOFT DRY FIT Baju Olahraga Lari Pria Gym … sunny black casual") — sangat noisy untuk screen reader. | `/outfits` · `OutfitsClient.tsx` seluruh file | Accessibility snapshot: semua button tidak punya `aria-label`, nama button = concat alt semua image | P1 | WCAG 2.2 AA (4.1.2 Name, Role, Value) | Tambah `aria-label="Buka outfit: {outfit.name}"` pada outfit card; `aria-label="Tambah outfit"` pada tombol "+"; `aria-label="Tutup"` pada tombol X; `aria-label="Edit"` pada tombol Pencil; `aria-label="Hapus"` pada tombol Trash |
| 4 | **Tab "Collection (Wardrobe)" aktif tapi konten tidak berubah** — setelah mengklik tab "Collection (Wardrobe)", tab ditandai `[active]` di accessibility tree, tapi konten grid tetap menampilkan daftar outfit. Ini adalah bug: `setView('wardrobes')` terpanggil tapi mungkin race condition atau caching menyebabkan view tidak re-render. | `/outfits` · `OutfitsClient.tsx:419,470` | Screenshot `outfits-collection-375.png` identik dengan `outfits-375.png`; snapshot menampilkan `button "Collection (Wardrobe)" [active]` tapi grid masih berisi outfit buttons | P0 | Konsistensi & visibilitas status | Investigasi mengapa `view === 'wardrobes'` tidak merender blok collections. Kemungkinan data `wardrobeCollections` kosong — tambah log atau cek query Supabase, pastikan empty state muncul |
| 5 | **Tombol "+" tidak merespons di tab aktif** — klik tombol "+" di tab "Collection (Wardrobe)" tidak memunculkan sheet "New Wardrobe". Kemungkinan berkaitan dengan isu #4 (view tidak benar-benar switch). | `/outfits` · `OutfitsClient.tsx:427` | Screenshot `outfits-add-375.png` identik dengan halaman utama — tidak ada modal muncul | P0 | Visibilitas status sistem | Setelah fix #4, verifikasi `view === 'wardrobes'` sehingga `setWcCreating(true)` terpanggil |
| 6 | **Outfit card tidak membuka detail modal** — klik pada outfit card tidak memunculkan bottom sheet detail outfit. Kode menunjukkan `onClick={() => setDetail(outfit) …}` seharusnya berfungsi, namun tidak ada perubahan visual terdeteksi. | `/outfits` · `OutfitsClient.tsx:448–453` | Screenshot `outfits-detail-375.png` identik dengan halaman utama setelah klik card pertama | P0 | Visibilitas status sistem | Periksa apakah ada event propagation issue atau CSS `pointer-events` yang memblokir klik. Cek console error. Kemungkinan drag sensor mengkonsumsi event tap — pertimbangkan `activationConstraint` yang lebih ketat |
| 7 | **Layout tidak responsif di 1440px** — di desktop 1440px, konten tampil seperti mobile (narrow, terpusat, ~460px lebar) dengan banyak whitespace kosong di kiri/kanan. Grid tidak expand. | `/outfits` · `OutfitsClient.tsx:444` | Screenshot `outfits-1440.png` — konten tersempit di tengah layar lebar | P2 | Fleksibilitas & efisiensi penggunaan | Tambah `max-w-2xl mx-auto` atau `md:grid-cols-3 lg:grid-cols-4` pada grid agar memanfaatkan layar lebar |
| 8 | **Teks label outfit sangat kecil** — nama outfit menggunakan `text-xs` (12px) dan occasion menggunakan `text-[10px]` (10px) di atas gradient gelap. Di foto yang padat dan gelap, ini sangat sulit dibaca. | `/outfits` · `OutfitsClient.tsx:457,459` | Screenshot `outfits-375.png` — label "30-gb / casual" hampir tidak terbaca di beberapa card gelap | P2 | Legibilitas / kontras | Naikkan ke minimal `text-xs` (12px) untuk occasion; tambah `text-shadow` atau background semi-transparan yang lebih solid |
| 9 | **Warna hardcoded di luar Cubicle DS token** — `bg-red-500/10`, `text-red-500`, `border-red-500/20` digunakan langsung (bukan token DS seperti `destructive`). Juga `from-black/80`, `text-white`, `bg-white/30` digunakan sebagai nilai literal. | `OutfitsClient.tsx:625,732,168–170,198–203,456–459` | Kode: `className="… bg-red-500/10 text-red-500 border border-red-500/20 …"` | P2 | Konsistensi DS | Ganti delete button dengan `bg-destructive/10 text-destructive border-destructive/20`. Untuk overlay gradient, `text-white` di atas foto bisa dipertahankan (fungsional) namun idealnya gunakan token `foreground-inverse` jika tersedia di Cubicle |
| 10 | **Nama outfit tidak-deskriptif sulit dipindai** — banyak outfit diberi nama kode seperti "30-gb", "28-gb-(22-afternoon)", "27/30", "01/30". Di grid kecil tanpa context, user harus ingat sistem kode ini. | `/outfits` (data) | Screenshot `outfits-375.png` — grid penuh kode numerik | P3 | Pengenalan vs. ingatan | Pertimbangkan tooltip atau badge yang menampilkan tanggal terakhir dipakai saat hover/long-press; atau sort berdasarkan "recently used" secara default |
| 11 | **Empty state outfit menggunakan emoji 👗** — emoji tidak selalu render konsisten antar OS dan melanggar aturan DS "no warm palette/decorative elements". | `OutfitsClient.tsx:33,439,472` | Kode baris 33: `<div className="… text-4xl bg-muted">👗</div>` dan baris 439: `<div className="text-5xl mb-4">👗</div>` | P3 | Konsistensi DS | Ganti emoji dengan ikon Lucide (`Shirt`, `Layers`) atau ilustrasi sesuai Cubicle DS |
| 12 | **Collage item pertama menggunakan `<img>` bukan `<Image>`** — di `OutfitCollage`, item ke-2 dst menggunakan `<img>` (baris 44) tanpa optimasi Next.js Image. Item pertama (baris 36) sudah pakai `<Image>`. | `OutfitsClient.tsx:43–44` | Kode: `{/* eslint-disable-next-line @next/next/no-img-element */}` | P2 | Performa | Ganti semua `<img>` dalam `OutfitCollage` dengan `<Image>` dari `next/image` dengan `sizes` yang tepat |
| 13 | **Konfirmasi delete tidak ada** — tombol "Delete Outfit" / "Delete Collection" langsung memanggil `handleDelete` tanpa konfirmasi dialog. Satu tap yang tidak sengaja bisa menghapus outfit. | `OutfitsClient.tsx:624,731` | Kode: `onClick={() => handleDelete(detail.id)}` langsung tanpa confirm state | P1 | Pencegahan error | Tambah confirm state (seperti pola `confirmUse`) atau dialog "Yakin hapus outfit ini?" sebelum eksekusi delete |
| 14 | **Tidak ada indikasi visual drag-and-drop** — user tidak tahu bahwa kartu bisa di-drag untuk reorder. Tidak ada ikon grip, cursor hint di mobile, atau tooltip. Di mobile, drag aktif setelah 180ms delay (TouchSensor) tanpa feedback visual sebelum drag dimulai. | `OutfitsClient.tsx:254–257, 195` | Kode: `touch-none cursor-grab` hanya bekerja di desktop; di mobile tidak ada visual affordance | P2 | Visibilitas status / discoverability | Tambah ikon `GripVertical` dari Lucide di sudut kartu; tambah animasi subtle (pulse/scale) saat long-press terdeteksi |
| 15 | **Label `<input type="date">` di "Use This Outfit" hanya dalam Bahasa Indonesia** — label "Tanggal pakai" konsisten dengan konteks personal use, namun input `date` tidak memiliki `htmlFor` / `id` pair, melanggar aksesibilitas form. | `OutfitsClient.tsx:607–609,695–697` | Kode: `<label className="…">Tanggal pakai</label>` diikuti `<input type="date" …>` tanpa `htmlFor` | P1 | WCAG 2.2 AA (1.3.1 Info and Relationships) | Tambah `id="use-date"` pada input dan `htmlFor="use-date"` pada label |
| 16 | **Header sticky tidak memiliki `role` semantik yang jelas** — `<header>` digunakan (correct), tapi tidak memiliki `aria-label` untuk membedakan jika ada multiple landmarks. | `OutfitsClient.tsx:410` | Accessibility snapshot: `banner` tanpa label | P3 | WCAG 2.2 (landmark regions) | Tambah `aria-label="Outfit navigation"` pada header |

---

## 5 Quick Wins

1. **Fix tombol "+" touch target** (`OutfitsClient.tsx:428`): Ganti `w-8 h-8` → `w-11 h-11` dan `Plus size={16}` → `Plus size={18}`. 1 baris perubahan, dampak langsung pada usability mobile.

2. **Tambah `aria-label` pada tombol-tombol utama** (`OutfitsClient.tsx:428,509,572,575,624`): Tambah `aria-label` pada `+`, `X`, `Pencil`, `Trash2` — ini fix aksesibilitas terbesar dengan effort minimal.

3. **Konfirmasi sebelum delete** (`OutfitsClient.tsx:624,731`): Tambah satu state `confirmDelete` dan duplikasi pola `confirmUse` yang sudah ada. Mencegah data loss.

4. **Fix label form `use-date`** (`OutfitsClient.tsx:607,695`): Tambah `id` pada input dan `htmlFor` pada label — 2 karakter per elemen, fix WCAG AA compliance.

5. **Ganti `<img>` dengan `<Image>` di `OutfitCollage`** (`OutfitsClient.tsx:44`): Import sudah ada di atas file, tinggal ganti tag dan tambah `fill` + `sizes` prop. Optimasi LCP signifikan untuk halaman dengan 50+ outfit.

---

## Yang Sudah Bagus

- **Pola bottom-sheet modal konsisten** — semua action (create, edit, detail, confirm use, post) menggunakan sheet dari bawah, sesuai pola mobile-first dan Cubicle DS.
- **Drag-and-drop untuk reorder** — implementasi `@dnd-kit` dengan `PointerSensor` + `TouchSensor` sudah ada dan fungsional secara kode.
- **Konfirmasi pemakaian (Use This Outfit)** — pattern confirm dengan date picker sudah ada dan cukup aman dari accidental trigger.
- **Worth It progress bar** — integrasi `calcWorthIt` di collection detail memberikan insight finansial yang relevan.
- **Grid collage 2×2** — visual preview outfit dari 4 item memberikan gambaran cepat tanpa harus buka detail.
- **Search di item picker** — filter `filterItems` dengan debounce-free search pada create/edit modal cukup responsif untuk wardrobe personal.
- **Accessible image alt text** — setiap `<Image>` item memiliki `alt={item.name}` yang deskriptif (nama produk asli).
- **Empty state tersedia** — sudah ada empty state untuk kedua tab (Outfits dan Collections) dengan call to action yang jelas.
- **Microcopy "Tanggal pakai"** — label berbahasa Indonesia konsisten dengan konteks personal use Saladin.

---

## Pertanyaan Terbuka

1. **Bug P0 — tab Collection (Wardrobe) tidak berfungsi**: Apakah `wardrobeCollections` dari Supabase benar-benar mengembalikan data? Perlu dicek apakah query Supabase di `app/outfits/page.tsx:22–25` berhasil, atau apakah koleksi belum dibuat sama sekali (sehingga empty state seharusnya tampil, bukan konten outfit). Jika empty state tidak muncul karena bug kondisi rendering, ini P0.

2. **Bug P0 — outfit card tidak membuka detail**: Apakah ada konflik antara `DndContext` event dan `onClick` pada outfit card? Di versi lain halaman (misalnya `/fashion`), apakah detail modal berfungsi? Perlu debug `e.stopPropagation` atau `activationConstraint`.

3. **Naming convention outfit**: Apakah kode seperti "30-gb", "28-gb-(22-afternoon)", "01/30" punya makna yang sudah dipahami Saladin sepenuhnya? Jika ya, tidak perlu diubah. Tapi jika ini membingungkan saat revisit setelah beberapa minggu, pertimbangkan field deskripsi tambahan.

4. **Layout desktop**: Apakah Saladin pernah menggunakan `/outfits` dari browser desktop? Jika tidak pernah, layout non-responsif (temuan #7) bisa diabaikan untuk saat ini.

5. **"Post to Activity"**: Fitur share/post ini menuju ke mana? Apakah ada halaman Activity/Feed yang sudah ada atau masih planned? Jika belum ada target, tombol ini bisa membingungkan.
