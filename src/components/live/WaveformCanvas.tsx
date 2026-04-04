import { useRef, useEffect } from 'react';

interface WaveformCanvasProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
}

export function WaveformCanvas({ analyserNode, isActive }: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function draw() {
      if (!canvas || !ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#111827'; // gray-900
      ctx.fillRect(0, 0, w, h);

      if (analyserNode && isActive) {
        const bufLen = analyserNode.frequencyBinCount;
        const data = new Uint8Array(bufLen);
        analyserNode.getByteTimeDomainData(data);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#3b82f6'; // blue-500
        ctx.beginPath();

        const sliceWidth = w / bufLen;
        let x = 0;
        for (let i = 0; i < bufLen; i++) {
          const v = data[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      } else {
        // Flat line
        ctx.strokeStyle = '#374151'; // gray-700
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    // Set canvas resolution to match display
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    // Reset logical size for drawing
    canvas.width = rect.width;
    canvas.height = rect.height;

    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, [analyserNode, isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-48 rounded-xl bg-gray-900"
    />
  );
}
