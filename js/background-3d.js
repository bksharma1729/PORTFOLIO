(function () {
  const canvas = document.getElementById('background3dCanvas');
  if (!canvas) {
    return;
  }

  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const lowPowerDevice =
    prefersReducedMotion.matches ||
    ((navigator.hardwareConcurrency || 8) <= 4) ||
    ((navigator.deviceMemory || 8) <= 4);
  const pointer = { x: 0, y: 0 };
  const accentColor = '#aaff00';

  let width = 0;
  let height = 0;
  let depth = 900;
  let particles = [];
  let animationFrame = 0;
  let isRunning = false;
  let resizeFrame = 0;
  let pointerFrame = 0;
  let nextPointer = null;

  function createParticles() {
    const count = lowPowerDevice
      ? (width < 768 ? 16 : 28)
      : (width < 768 ? 24 : 42);
    particles = Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * width * 0.95,
      y: (Math.random() - 0.5) * height * 0.95,
      z: Math.random() * depth,
      size: Math.random() * 2.3 + 0.8,
      speed: Math.random() * 0.9 + 0.4
    }));
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    depth = Math.max(700, width * 0.9);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    createParticles();
  }

  function startRenderLoop() {
    if (isRunning || document.hidden) {
      return;
    }

    isRunning = true;
    render();
  }

  function stopRenderLoop() {
    isRunning = false;
    window.cancelAnimationFrame(animationFrame);
  }

  function project(point) {
    const focalLength = depth;
    const scale = focalLength / (focalLength + point.z);
    return {
      x: point.x * scale + width / 2 + pointer.x * scale * 18,
      y: point.y * scale + height / 2 + pointer.y * scale * 14,
      scale
    };
  }

  function drawConnections(projected) {
    for (let i = 0; i < projected.length; i += 1) {
      const a = projected[i];
      for (let j = i + 1; j < projected.length; j += 1) {
        const b = projected[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = lowPowerDevice ? 100 : 125;
        if (distance > maxDistance) {
          continue;
        }

        context.strokeStyle = `rgba(170, 255, 0, ${0.08 * (1 - distance / maxDistance)})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      }
    }
  }

  function drawParticle(projectedPoint, point) {
    const radius = point.size * projectedPoint.scale * 1.9;
    const glow = context.createRadialGradient(
      projectedPoint.x,
      projectedPoint.y,
      0,
      projectedPoint.x,
      projectedPoint.y,
      radius * 7
    );

    glow.addColorStop(0, 'rgba(184, 255, 51, 0.95)');
    glow.addColorStop(0.28, 'rgba(170, 255, 0, 0.55)');
    glow.addColorStop(1, 'rgba(170, 255, 0, 0)');

    context.fillStyle = glow;
    context.beginPath();
    context.arc(projectedPoint.x, projectedPoint.y, radius * 7, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = accentColor;
    context.beginPath();
    context.arc(projectedPoint.x, projectedPoint.y, Math.max(1, radius), 0, Math.PI * 2);
    context.fill();
  }

  function render() {
    if (!isRunning) {
      return;
    }

    context.clearRect(0, 0, width, height);

    const projected = [];
    for (const point of particles) {
      point.z -= point.speed * (prefersReducedMotion.matches ? 0.25 : 1);
      if (point.z < -120) {
        point.z = depth;
        point.x = (Math.random() - 0.5) * width * 0.95;
        point.y = (Math.random() - 0.5) * height * 0.95;
      }

      const projectedPoint = project(point);
      if (
        projectedPoint.x < -100 || projectedPoint.x > width + 100 ||
        projectedPoint.y < -100 || projectedPoint.y > height + 100
      ) {
        continue;
      }

      projected.push(projectedPoint);
      drawParticle(projectedPoint, point);
    }

    drawConnections(projected);
    animationFrame = window.requestAnimationFrame(render);
  }

  function updatePointer(event) {
    nextPointer = event;
    if (pointerFrame) {
      return;
    }

    pointerFrame = window.requestAnimationFrame(function () {
      if (nextPointer) {
        pointer.x = (nextPointer.clientX / width - 0.5) * 2;
        pointer.y = (nextPointer.clientY / height - 0.5) * 2;
      }
      pointerFrame = 0;
    });
  }

  function resetPointer() {
    pointer.x = 0;
    pointer.y = 0;
  }

  function queueResize() {
    if (resizeFrame) {
      return;
    }

    resizeFrame = window.requestAnimationFrame(function () {
      resize();
      resizeFrame = 0;
    });
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      stopRenderLoop();
    } else {
      startRenderLoop();
    }
  }

  resize();
  startRenderLoop();

  window.addEventListener('resize', queueResize, { passive: true });
  window.addEventListener('mousemove', updatePointer, { passive: true });
  window.addEventListener('mouseleave', resetPointer);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', function () {
      stopRenderLoop();
      queueResize();
      startRenderLoop();
    });
  }
})();
