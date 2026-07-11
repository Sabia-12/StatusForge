import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'StatusForge';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom, #0F172A, #1E293B)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              height: '60px',
              width: '60px',
              borderRadius: '12px',
              backgroundColor: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '36px',
              fontWeight: 'bold',
            }}
          >
            S
          </div>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#F8FAFC',
              letterSpacing: '-0.025em',
            }}
          >
            StatusForge
          </span>
        </div>
        <p
          style={{
            fontSize: '24px',
            color: '#CBD5E1',
            maxWidth: '600px',
            textAlign: 'center',
            lineHeight: '1.5',
            margin: '0',
          }}
        >
          Beautiful public status pages with incident timelines for engineering teams.
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
