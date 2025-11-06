/** 
 * @type {import('next').NextConfig} 
 * 
 * Konfigurasi Next.js yang dioptimalkan untuk produksi di Vercel,
 * dengan fokus pada manajemen optimasi gambar dan caching.
 */
const nextConfig = {
    // --- Pengaturan Build & Lint ---
    // reactStrictMode diaktifkan untuk mendeteksi potensi masalah pada komponen React.
    // Opsi 'ignore...' diubah menjadi false untuk menampilkan error saat build,
    // ini adalah langkah penting untuk menjaga kualitas kode dan stabilitas produksi.
    reactStrictMode: true,
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: false,
    },

    // --- Konfigurasi Optimasi Gambar Cerdas ---
    images: {
        // Aktifkan optimasi gambar secara default.
        // Next.js akan secara otomatis mengoptimalkan gambar ke format modern seperti WebP/AVIF.
        unoptimized: false,
        formats: ['image/avif', 'image/webp'],

        // Daftar hostname yang diizinkan untuk optimasi gambar.
        // Pastikan semua domain eksternal yang digunakan untuk gambar terdaftar di sini.
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'placehold.co',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**.blob.vercel-storage.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'efxdijhagogovfontmmh.supabase.co',
                pathname: '/**',
            },
        ],
    },

    // --- Header Cache untuk Aset Statis ---
    // Menambahkan header Cache-Control yang agresif untuk aset gambar statis.
    // Ini menginstruksikan browser dan CDN untuk menyimpan file-file ini selama satu tahun.
    // Mengurangi jumlah permintaan ke server dan meningkatkan kecepatan muat halaman.
    async headers() {
        return [
            {
                source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp)',
                locale: false,
                headers: [
                    {
                        key: 'Cache-Control',
                        // Durasi cache 1 bulan (dalam detik) dengan validasi ulang.
                        // Keseimbangan yang baik untuk CMS di mana aset bisa berubah.
                        // Browser akan memeriksa versi baru setelah 1 bulan.
                        value: 'public, max-age=2592000, must-revalidate',
                    },
                ],
            },
        ];
    },

    // --- Pengalihan (Redirects) ---
    // Konfigurasi redirect yang ada dipertahankan.
    async redirects() {
        return [
            {
                source: '/:path*',
                has: [
                    {
                        type: 'host',
                        value: 'www.smpn24padang.sch.id',
                    },
                ],
                destination: 'https://smpn24padang.sch.id/:path*',
                permanent: true,
            },
        ];
    },
};

// Ekspor konfigurasi untuk digunakan oleh Next.js.
export default nextConfig;
