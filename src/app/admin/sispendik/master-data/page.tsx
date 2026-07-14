import { getAllJenisSampah } from '../actions';
import MasterDataClient from './client-page';

export default async function MasterDataPage() {
    const { data = [], error } = await getAllJenisSampah();

    if (error) {
        return <div>Error: {error}</div>;
    }

    type MasterDataJenisSampah = {
        id: number;
        namaSampah: string;
        kategori: 'organik' | 'anorganik';
        hargaPerKg: number;
        createdAt: Date;
        updatedAt: Date;
    };

    const convertedData: MasterDataJenisSampah[] = data.map(
        (item) => ({
            id: item.id,
            namaSampah: item.namaSampah,
            kategori:
                item.kategori === 'organik' ? 'organik' : 'anorganik',
            hargaPerKg: parseFloat(item.hargaPerKg),
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }),
    );

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    Master Data Sampah
                </h2>
                <p className="text-muted-foreground">
                    Kelola jenis sampah dan harga per kilogram
                </p>
            </div>

            <MasterDataClient initialData={convertedData} />
        </div>
    );
}
