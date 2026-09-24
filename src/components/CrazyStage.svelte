<script lang="ts">
  import { onMount } from 'svelte';
  import type { CastMember } from '../lib/stage/create-show';
  import { stageProfile } from '../lib/stage/profile';

  let { barbers = [] }: { barbers?: CastMember[] } = $props();
  let canvas: HTMLCanvasElement;

  onMount(() => {
    let disposed = false;
    let stop = () => {};
    let teardown = () => {};

    const boot = async () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection;
      const profile = stageProfile({
        viewportWidth: window.innerWidth,
        devicePixelRatio: window.devicePixelRatio || 1,
        reducedMotion,
        saveData: Boolean(connection?.saveData),
      });

      const [
        { ACESFilmicToneMapping, Raycaster, SRGBColorSpace, Vector2, WebGLRenderer },
        { createShow },
      ] = await Promise.all([import('three'), import('../lib/stage/create-show')]);

      let renderer: WebGLRenderer;
      try {
        renderer = new WebGLRenderer({
          canvas,
          antialias: profile.antialias,
          alpha: false,
          powerPreference: profile.mobile ? 'low-power' : 'high-performance',
        });
      } catch {
        canvas.hidden = true;
        return;
      }
      if (disposed) {
        renderer.dispose();
        return;
      }

      renderer.outputColorSpace = SRGBColorSpace;
      renderer.toneMapping = ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;
      renderer.setPixelRatio(profile.dpr);
      renderer.setClearColor(0x070708, 1);

      const show = createShow(profile, {
        cast: barbers.length ? barbers : undefined,
        loadPhotos: true,
      });
      const host = canvas.parentElement;
      let width = 1;
      let height = 1;
      let running = !profile.reducedMotion;
      let visible = true;
      let frame = 0;
      let pointerX = 0;
      let pointerY = 0;

      const fit = () => {
        const rect = canvas.getBoundingClientRect();
        width = Math.max(1, Math.floor(rect.width || host?.clientWidth || window.innerWidth));
        height = Math.max(1, Math.floor(rect.height || host?.clientHeight || window.innerHeight));
        show.camera.aspect = width / height;
        show.camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      const draw = (time: number) => {
        show.update(time / 1000, pointerX, pointerY);
        renderer.render(show.scene, show.camera);
      };

      const loop = (time: number) => {
        if (!running || !visible || document.hidden) return;
        draw(time);
        frame = requestAnimationFrame(loop);
      };

      const start = () => {
        if (profile.reducedMotion || !visible || document.hidden) return;
        running = true;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(loop);
      };

      stop = () => {
        running = false;
        cancelAnimationFrame(frame);
      };

      const resize = new ResizeObserver(() => {
        fit();
        if (profile.reducedMotion || !running)
          draw(profile.reducedMotion ? 1650 : performance.now());
      });
      resize.observe(canvas);
      if (host && host !== canvas) resize.observe(host);

      requestAnimationFrame(() => {
        if (disposed) return;
        fit();
        draw(profile.reducedMotion ? 1650 : performance.now());
        canvas.classList.add('is-live');
        canvas.dataset.stageMode = profile.reducedMotion ? 'still' : 'live';
        if (!profile.reducedMotion) start();
      });

      const section = canvas.closest('section') ?? host;
      const io = new IntersectionObserver(
        ([entry]) => {
          visible = Boolean(entry?.isIntersecting && entry.intersectionRatio > 0.08);
          if (visible) start();
          else stop();
        },
        { threshold: [0, 0.08, 0.25] }
      );
      if (section) io.observe(section);

      const onVisibility = () => {
        if (document.hidden) stop();
        else start();
      };
      document.addEventListener('visibilitychange', onVisibility);

      const raycaster = new Raycaster();
      const ndc = new Vector2();
      let downX = 0;
      let downY = 0;

      const hrefAt = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(ndc, show.camera);
        const hit = raycaster.intersectObjects(show.targets, true)[0];
        let current = hit?.object ?? null;
        while (current) {
          if (typeof current.userData.href === 'string') return current.userData.href as string;
          current = current.parent;
        }
        return null;
      };

      const onPointer = (event: PointerEvent) => {
        if (!profile.reducedMotion && section) {
          const rect = section.getBoundingClientRect();
          pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * -2;
        }
        if (!profile.mobile) canvas.style.cursor = hrefAt(event) ? 'pointer' : 'default';
      };
      const onDown = (event: PointerEvent) => {
        downX = event.clientX;
        downY = event.clientY;
      };
      const onUp = (event: PointerEvent) => {
        if (Math.hypot(event.clientX - downX, event.clientY - downY) > 10) return;
        const href = hrefAt(event);
        if (!href) return;
        document.querySelector(href)?.scrollIntoView({
          behavior: profile.reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
      };
      canvas.addEventListener('pointermove', onPointer, { passive: true });
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointerup', onUp);

      teardown = () => {
        stop();
        resize.disconnect();
        io.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
        canvas.removeEventListener('pointermove', onPointer);
        canvas.removeEventListener('pointerdown', onDown);
        canvas.removeEventListener('pointerup', onUp);
        show.dispose();
        renderer.dispose();
      };
    };

    void boot();
    return () => {
      disposed = true;
      teardown();
    };
  });
</script>

<canvas bind:this={canvas} class="crazy-stage" aria-hidden="true"></canvas>
