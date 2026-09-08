export interface JenisSampah {
    id: number;
    namaSampah: string;
    hargaPerKg: number;
    createdAt: Date;
    updatedAt: Date;
}


export interface SampahKelas {
    id: number;
    kelasId: number;
    jenisSampahId: number;
    jumlahKg: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface Kelas {
    id: number;
    tingkat: number;
    huruf: string;
    createdAt: Date;
    updatedAt: Date;
}
