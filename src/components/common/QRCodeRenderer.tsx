import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeRendererProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
  onDataUrlGenerated?: (url: string) => void;
}

export const QRCodeRenderer: React.FC<QRCodeRendererProps> = ({
  value,
  size = 200,
  className = '',
  darkColor = '#0B4E24',
  lightColor = '#FFFFFF',
  onDataUrlGenerated,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;

    QRCode.toCanvas(
      canvasRef.current,
      value,
      {
        width: size,
        margin: 2,
        color: {
          dark: darkColor,
          light: lightColor,
        },
        errorCorrectionLevel: 'H',
      },
      error => {
        if (error) {
          console.error('QR code generation error', error);
        } else if (onDataUrlGenerated && canvasRef.current) {
          onDataUrlGenerated(canvasRef.current.toDataURL('image/png'));
        }
      }
    );
  }, [value, size, darkColor, lightColor, onDataUrlGenerated]);

  return (
    <div className={`inline-flex items-center justify-center p-2 rounded-2xl bg-white shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
      <canvas ref={canvasRef} className="rounded-lg max-w-full h-auto" />
    </div>
  );
};
