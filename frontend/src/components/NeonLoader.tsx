import { useEffect, useRef } from 'react';

interface Props {
  text?: string;
  subText?: string;
  size?: number;
  onCancel?: () => void;
}

const COLORS = ['#00FAFF', '#FFB700', '#F72585', '#00FAFF', '#FFB700', '#F72585'];

function NeonLoader({ text = 'AI 正在生成报告', subText = '请稍候，这可能需要几分钟...', size = 280, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const w = size;
    const h = size;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h / 2;
    const radius = w / 2 - 4;
    const lineCount = 24;

    interface Line {
      y: number;
      speed: number;
      length: number;
      color: string;
      glow: number;
      x: number;
    }

    const lines: Line[] = Array.from({ length: lineCount }, () => ({
      y: Math.random() * h,
      speed: 1.5 + Math.random() * 3,
      length: 30 + Math.random() * 80,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      glow: 6 + Math.random() * 10,
      x: Math.random() * w,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = 'rgba(15, 18, 25, 0.92)';
      ctx.fillRect(0, 0, w, h);

      for (const line of lines) {
        line.x += line.speed;
        if (line.x - line.length > w) {
          line.x = -line.length;
          line.y = Math.random() * h;
          line.speed = 1.5 + Math.random() * 3;
          line.length = 30 + Math.random() * 80;
          line.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        }

        ctx.save();
        ctx.shadowBlur = line.glow;
        ctx.shadowColor = line.color;
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;

        const grad = ctx.createLinearGradient(line.x - line.length, 0, line.x, 0);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.3, line.color);
        grad.addColorStop(1, line.color);
        ctx.strokeStyle = grad;

        ctx.beginPath();
        ctx.moveTo(line.x - line.length, line.y);
        ctx.lineTo(line.x, line.y);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(60, 80, 120, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [size]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '50vh', gap: 28, background: '#0B0E13', borderRadius: 20, padding: '60px 40px',
    }}>
      <canvas ref={canvasRef} style={{ borderRadius: '50%' }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: 20, fontWeight: 600, color: '#FFFFFF',
          letterSpacing: 2, marginBottom: 8,
        }}>
          {text}
        </div>
        <div style={{ fontSize: 14, color: '#6B7A8D' }}>{subText}</div>
      </div>
      <div style={{
        width: 200, height: 3, borderRadius: 2,
        background: '#1A1F27', overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0,
          width: '40%', height: '100%',
          background: 'linear-gradient(90deg, transparent, #00FAFF, transparent)',
          borderRadius: 2,
          animation: 'neonSlide 1.8s ease-in-out infinite',
        }} />
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          style={{
            marginTop: 8, padding: '8px 28px', borderRadius: 8,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
            color: '#8B9DB5', fontSize: 14, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'; e.currentTarget.style.color = '#F87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#8B9DB5'; }}
        >
          终止生成
        </button>
      )}
      <style>{`
        @keyframes neonSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(350%); }
        }
      `}</style>
    </div>
  );
}

export default NeonLoader;
