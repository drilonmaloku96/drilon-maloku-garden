import { useEffect, useRef, useCallback } from 'react';
import { tagsHueOffset } from '../lib/colors';

const TYPE_ICONS = { project: '◆', article: '◇', creative: '○', note: '▽' };


function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function wrapText(ctx, text, maxWidth, lineHeight, maxLines) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    lines.splice(maxLines);
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s+\S*$/, '') + '…';
  }
  return { lines, totalHeight: lines.length * lineHeight };
}

export default function BubbleCanvas({ posts, onNavigate, visible }) {
  const MAX_BUBBLES = 14;
  const SPAWN_INTERVAL = 900; // ms

  const canvasRef = useRef(null);
  const bubblesRef = useRef([]);
  const rafRef = useRef(null);
  const hoverRef = useRef(null);
  const spawnTimerRef = useRef(SPAWN_INTERVAL); // pre-filled so first bubble fires on frame 1
  const postQueueRef = useRef([]);
  const queueIndexRef = useRef(0);

  useEffect(() => {
    if (!posts.length) return;
    const shuffled = [...posts].sort(() => Math.random() - 0.5);
    postQueueRef.current = shuffled;
    queueIndexRef.current = 0;
  }, [posts]);

  const nextPost = () => {
    const q = postQueueRef.current;
    if (!q.length) return null;
    const post = q[queueIndexRef.current % q.length];
    queueIndexRef.current++;
    return post;
  };

  const spawnBubble = useCallback((canvas) => {
    if (bubblesRef.current.length >= MAX_BUBBLES) return;
    const post = nextPost();
    if (!post) return;

    const radius = Math.round(randomBetween(90, 130));
    const x = randomBetween(radius + 10, canvas.width - radius - 10);

    // Hue driven by tag count: 0 = cool muted → 5+ = rich warm gold
    const tagCount = post.tags?.length ?? 0;
    const HUE_STOPS = [210, 185, 55, 44, 36, 28]; // cool→warm
    const SAT_STOPS = [ 12,  16, 28, 32, 36, 40]; // muted→saturated
    const idx = Math.min(tagCount, HUE_STOPS.length - 1);
    // Deterministic offset from which specific tags are present (±12°)
    const hue = HUE_STOPS[idx] + tagsHueOffset(post.tags ?? []);
    const sat = SAT_STOPS[idx];
    // Spawn just below the visible bottom edge
    const spawnY = canvas.height + radius + randomBetween(10, 60);

    bubblesRef.current.push({
      post,
      x,
      y: spawnY,
      radius,
      hue,
      sat,
      vx: randomBetween(-1.2, 1.2),
      vy: -randomBetween(6.0, 9.0),           // initial burst — position-based speed takes over
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: randomBetween(0.018, 0.035), // fast erratic wobble
      wobbleAmplitude: randomBetween(0.012, 0.028), // per-bubble amplitude
      opacity: 0,
      hovered: false,
    });
  }, []);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Track logical size separately so physics coordinates stay in CSS pixels
    let logicalW = 0;
    let logicalH = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      logicalW = canvas.offsetWidth;
      logicalH = canvas.offsetHeight;
      canvas.width = Math.round(logicalW * dpr);
      canvas.height = Math.round(logicalH * dpr);
      // Scale all drawing by dpr so 1 unit = 1 CSS pixel
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Patch spawnBubble to use logical dimensions
    const canvasProxy = new Proxy(canvas, {
      get(target, prop) {
        if (prop === 'width')  return logicalW;
        if (prop === 'height') return logicalH;
        return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
      },
    });

    let lastTime = 0;

    const draw = (timestamp) => {
      if (!visible) return;
      rafRef.current = requestAnimationFrame(draw);

      const dt = timestamp - lastTime;
      lastTime = timestamp;

      ctx.clearRect(0, 0, logicalW, logicalH);

      // Spawn
      spawnTimerRef.current += dt;
      if (spawnTimerRef.current > SPAWN_INTERVAL) {
        spawnTimerRef.current = 0;
        spawnBubble(canvasProxy);
      }

      const alive = [];

      for (const b of bubblesRef.current) {
        // Erratic wobble — each bubble has its own amplitude
        b.wobbleOffset += b.wobbleSpeed;
        b.vx += Math.sin(b.wobbleOffset) * b.wobbleAmplitude;
        // Occasional random kick for extra erraticness
        if (Math.random() < 0.008) b.vx += randomBetween(-0.6, 0.6);
        b.vx *= 0.992;
        // Velocity scales with distance from top: fast near bottom, slow near top
        const targetVy = -(0.5 + Math.max(0, b.y / logicalH) * 7.5);
        b.vy += (targetVy - b.vy) * 0.05;
        b.x += b.vx;
        b.y += b.vy;

        // Wall bounce — fully elastic
        if (b.x - b.radius < 0) {
          b.x = b.radius;
          b.vx = Math.abs(b.vx) * 0.9;
        }
        if (b.x + b.radius > logicalW) {
          b.x = logicalW - b.radius;
          b.vx = -Math.abs(b.vx) * 0.9;
        }

        // Fade in — only once bubble enters visible area
        if (b.y < logicalH + b.radius && b.opacity < 1) {
          b.opacity = Math.min(1, b.opacity + 0.055);
        }

        // Fade out near top
        const fadeZone = 80;
        if (b.y - b.radius < fadeZone) {
          b.opacity = Math.max(0, b.opacity - 0.03);
        }

        if (b.opacity <= 0 && b.y < logicalH * 0.3) continue;
        if (b.y < -b.radius * 2) continue;

        alive.push(b);
      }

      // Elastic collision between bubbles
      for (let i = 0; i < alive.length; i++) {
        for (let j = i + 1; j < alive.length; j++) {
          const a = alive[i], bb = alive[j];
          const dx = bb.x - a.x;
          const dy = bb.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = a.radius + bb.radius + 2;

          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate overlapping bubbles
            const overlap = (minDist - dist) / 2;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            bb.x += nx * overlap;
            bb.y += ny * overlap;

            // Exchange velocity components along collision normal (elastic)
            const dvx = bb.vx - a.vx;
            const dvy = bb.vy - a.vy;
            const dot = dvx * nx + dvy * ny;

            // Only resolve if approaching
            if (dot < 0) {
              const restitution = 0.75; // bounciness 0–1
              const impulse = dot * restitution;
              a.vx += impulse * nx;
              a.vy += impulse * ny;
              bb.vx -= impulse * nx;
              bb.vy -= impulse * ny;

              // Preserve upward momentum after collision
              if (a.vy > -0.5) a.vy = -0.5;
              if (bb.vy > -0.5) bb.vy = -0.5;
            }
          }
        }
      }

      bubblesRef.current = alive;

      // Draw bubbles
      for (const b of alive) {
        const scale = b.hovered ? 1.06 : 1;
        const r = b.radius * scale;
        // Snap to half-pixel to keep circle edge crisp
        const bx = Math.round(b.x * 2) / 2;
        const by = Math.round(b.y * 2) / 2;

        // ── Background fill + border (no clip, drawn first) ──
        ctx.save();
        ctx.globalAlpha = b.opacity;
        ctx.translate(bx, by);

        // Glassy fill — colour driven by tag-count saturation
        const s = b.sat;
        const grad = ctx.createRadialGradient(-r * 0.18, -r * 0.22, r * 0.04, 0, 0, r);
        grad.addColorStop(0,   `hsla(${b.hue}, ${s}%, 97%, 0.90)`);
        grad.addColorStop(0.45,`hsla(${b.hue}, ${s + 4}%, 91%, 0.72)`);
        grad.addColorStop(1,   `hsla(${b.hue}, ${s + 6}%, 72%, 0.14)`);

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Border — warmer/more vivid for high-tag bubbles
        ctx.strokeStyle = b.hovered
          ? `hsla(${b.hue}, ${s + 30}%, 45%, 0.80)`
          : `hsla(${b.hue}, ${s + 20}%, 52%, 0.45)`;
        ctx.lineWidth = b.hovered ? 1.5 : 1;
        ctx.stroke();

        ctx.restore();

        // ── Text (clipped to circle, drawn on top of fill) ──
        ctx.save();
        ctx.globalAlpha = b.opacity;
        ctx.translate(bx, by);

        ctx.beginPath();
        ctx.arc(0, 0, r - 1, 0, Math.PI * 2); // 1px inset keeps text from clipping at edge
        ctx.clip();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const textWidth = r * 1.52;
        const padding   = r * 0.14;

        // Type icon
        const iconSize = Math.round(r * 0.14);
        ctx.font = `${iconSize}px "Courier New", monospace`;
        ctx.fillStyle = `hsla(${b.hue}, ${b.sat + 25}%, 25%, 0.72)`;
        const icon = TYPE_ICONS[b.post.type] ?? '◇';
        ctx.fillText(icon, 0, -r * 0.60);

        // Title — bold, measure with correct font first
        const titleSize = Math.round(r * 0.145);
        ctx.font = `700 ${titleSize}px Georgia, serif`;
        const titleLineH = Math.round(titleSize * 1.28);
        const { lines: titleLines, totalHeight: titleH } = wrapText(ctx, b.post.title, textWidth, titleLineH, 2);

        // Excerpt
        const excerptSize = Math.round(r * 0.108);
        ctx.font = `${excerptSize}px Georgia, serif`;
        const excerptLineH = Math.round(excerptSize * 1.32);
        const excerpt = b.post.excerpt || '';
        const { lines: excerptLines, totalHeight: excerptH } = wrapText(ctx, excerpt, textWidth - padding, excerptLineH, 3);

        const gap    = Math.round(r * 0.09);
        const blockH = titleH + gap + excerptH;
        let   ty     = Math.round(-blockH / 2 + titleLineH * 0.28);

        // Draw title — bold
        ctx.font = `700 ${titleSize}px Georgia, serif`;
        ctx.fillStyle = `hsla(${b.hue}, ${b.sat + 10}%, 10%, 0.96)`;
        for (const line of titleLines) {
          ctx.fillText(line, 0, Math.round(ty));
          ty += titleLineH;
        }

        // Draw excerpt
        ty += gap;
        ctx.font = `${excerptSize}px Georgia, serif`;
        ctx.fillStyle = `hsla(${b.hue}, ${b.sat + 8}%, 26%, 0.76)`;
        for (const line of excerptLines) {
          ctx.fillText(line, 0, Math.round(ty));
          ty += excerptLineH;
        }

        ctx.restore();

        // ── Specular highlight (above text, upper-left quadrant only) ──
        ctx.save();
        ctx.globalAlpha = b.opacity * 0.55;
        ctx.translate(bx, by);
        const specGrad = ctx.createRadialGradient(-r * 0.28, -r * 0.34, 0, -r * 0.15, -r * 0.24, r * 0.42);
        specGrad.addColorStop(0, 'rgba(255,255,255,0.60)');
        specGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fillStyle = specGrad;
        ctx.fill();
        ctx.restore();
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [visible, spawnBubble]);

  const hitTest = (canvas, clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
      const b = bubblesRef.current[i];
      const r = b.hovered ? b.radius * 1.06 : b.radius;
      const dx = mx - b.x, dy = my - b.y;
      if (dx * dx + dy * dy <= r * r) return b;
    }
    return null;
  };

  const onMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hit = hitTest(canvas, e.clientX, e.clientY);
    for (const b of bubblesRef.current) b.hovered = false;
    if (hit) {
      hit.hovered = true;
      canvas.style.cursor = 'pointer';
    } else {
      canvas.style.cursor = 'default';
    }
    hoverRef.current = hit;
  };

  const onClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const hit = hitTest(canvas, e.clientX, e.clientY);
    if (hit) onNavigate(`/post/${hit.post.slug}`);
  };

  const onTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const canvas = canvasRef.current;
    if (!canvas || !touch) return;
    const hit = hitTest(canvas, touch.clientX, touch.clientY);
    if (hit) onNavigate(`/post/${hit.post.slug}`);
  };

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => {
        for (const b of bubblesRef.current) b.hovered = false;
        hoverRef.current = null;
      }}
      onClick={onClick}
      onTouchEnd={onTouchEnd}
    />
  );
}
