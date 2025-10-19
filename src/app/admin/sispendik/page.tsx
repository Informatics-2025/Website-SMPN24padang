import { getAllKelas, getAllJenisSampah, getAllGurus } from './actions';
import { getSetoranGuru } from './setoran-guru-actions';
import SispendikClient from './client-page';

export default async function SispendikAdminPage() {
    // Fetch initial data
    const [
        kelasResponse,
        jenisSampahResponse,
        gurusResponse,
        setoranGuruResponse,
    ] = await Promise.all([
        getAllKelas(),
        getAllJenisSampah(),
        getAllGurus(), // Hapus duplikasi getGurus()
        getSetoranGuru(),
    ]);

    const kelas = kelasResponse.data || [];
    const jenisSampah = jenisSampahResponse.data || [];
    const gurusData = gurusResponse.data || [];
    const setoranGuru = setoranGuruResponse.data || [];

    const error =
        kelasResponse.error ||
        jenisSampahResponse.error ||
        gurusResponse.error ||
        setoranGuruResponse.error;

    if (error) {
        return (
            <div className="p-4">
                <div className="rounded-md bg-destructive/15 p-3">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-destructive"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-destructive">
                                Error
                            </h3>
                            <div className="mt-2 text-sm text-destructive">
                                {error}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 print:space-y-0">
            <div className="print:hidden">
                <h2 className="text-3xl font-bold tracking-tight">
                    Sipendig SMPN 24 Padang
                </h2>
                <p className="text-muted-foreground">
                    Kelola data sampah per kelas dan per guru, serta lihat
                    statistik pengumpulan sampah.
                </p>
            </div>
            <SispendikClient
                kelas={kelas}
                jenisSampah={jenisSampah}
                gurus={gurusData}
                initialSetoranGuru={setoranGuru}
            />
        </div>
    );
}
