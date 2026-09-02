import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SMP Negeri 24 Padang - Website Resmi';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default async function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#064e3b',
                    backgroundImage:
                        'radial-gradient(circle at 25% 25%, #047857 0%, #064e3b 60%, #022c22 100%)',
                    padding: '60px 80px',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Left: School Logo Card (Aspect Ratio Locked, No Distortion) */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '260px',
                        height: '260px',
                        borderRadius: '32px',
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        border: '2px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        padding: '24px',
                        flexShrink: 0,
                    }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="https://smpn24padang.sch.id/logo.png"
                        alt="Logo SMPN 24 Padang"
                        width="210"
                        height="210"
                        style={{
                            objectFit: 'contain',
                        }}
                    />
                </div>

                {/* Right: School Info & Metadata */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        flexGrow: 1,
                        marginLeft: '60px',
                    }}
                >
                    {/* Category / Badge */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '16px',
                        }}
                    >
                        <span
                            style={{
                                backgroundColor: 'rgba(52, 211, 153, 0.25)',
                                color: '#a7f3d0',
                                border: '1px solid rgba(52, 211, 153, 0.4)',
                                padding: '6px 18px',
                                borderRadius: '100px',
                                fontSize: '18px',
                                fontWeight: '700',
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase',
                            }}
                        >
                            Website Resmi Sekolah
                        </span>
                    </div>

                    {/* School Name */}
                    <h1
                        style={{
                            fontSize: '52px',
                            fontWeight: '900',
                            color: '#ffffff',
                            lineHeight: '1.15',
                            margin: '0 0 12px 0',
                            letterSpacing: '-0.5px',
                            textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        }}
                    >
                        SMP Negeri 24 Padang
                    </h1>

                    {/* Tagline */}
                    <p
                        style={{
                            fontSize: '24px',
                            color: '#e2e8f0',
                            fontWeight: '500',
                            margin: '0 0 20px 0',
                            lineHeight: '1.3',
                        }}
                    >
                        Membina Pikiran, Membentuk Masa Depan.
                    </p>

                    {/* Footer Info / Location & Accreditation */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                            paddingTop: '18px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                color: '#cbd5e1',
                                fontSize: '20px',
                                fontWeight: '600',
                            }}
                        >
                            📍 Kota Padang, Sumatera Barat
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                color: '#34d399',
                                fontSize: '20px',
                                fontWeight: '700',
                            }}
                        >
                            • Akreditasi A
                        </div>
                    </div>
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
