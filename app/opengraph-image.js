import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ecfdf5',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            width: 980,
            padding: 72,
            borderRadius: 40,
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 30px 80px rgba(16, 185, 129, 0.18)',
          }}
        >
          <div style={{ color: '#059669', fontSize: 28, fontWeight: 700, letterSpacing: 10 }}>SALAHTRACK</div>
          <div style={{ marginTop: 24, color: '#0f172a', fontSize: 72, fontWeight: 800 }}>Track Your Salah Daily</div>
          <div style={{ marginTop: 24, color: '#475569', fontSize: 32, textAlign: 'center', lineHeight: 1.4 }}>
            Record daily prayers, mark qaza, and review monthly progress in a simple personal dashboard.
          </div>
        </div>
      </div>
    ),
    size
  );
}
