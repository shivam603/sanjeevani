import React, { useEffect, useRef, useState } from 'react';

/**
 * CustomCursor — Premium, minimal, smooth mouse cursor tailored for SANJEEVANI.
 *
 * Design Language:
 * - Central emerald dot (#10B981) tracking mouse position instantly without lag.
 * - Outer translucent emerald ring with subtle glow following smoothly via lerp animation.
 * - Scale & glow expansion on interactive elements (buttons, links, cards, clickable elements).
 * - Restores native I-beam cursor on text inputs.
 * - Restores native grab/grabbing cursor on draggable/map elements.
 * - Completely disabled on mobile / touch / coarse-pointer devices.
 * - Respects prefers-reduced-motion (no follow lag or transitions).
 * - pointer-events: none ensures zero interaction blockage.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const containerRef = useRef(null);

  const [cursorState, setCursorState] = useState('default'); // 'default' | 'pointer' | 'text' | 'grab'
  const [isVisible, setIsVisible] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // 1. Detect touch/coarse devices
    const checkTouch = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };

    if (checkTouch()) {
      setIsTouchDevice(true);
      return;
    }

    // Add has-custom-cursor class to body on desktop pointer devices
    document.body.classList.add('has-custom-cursor');

    // 2. Motion preference check
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;
    const handleMotionChange = (e) => {
      prefersReducedMotion = e.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // 3. Mouse coordinates and smooth follow physics
    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let hasMoved = false;
    let rafId = null;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!hasMoved) {
        hasMoved = true;
        ringX = mouseX;
        ringY = mouseY;
        setIsVisible(true);
      }

      // Directly update inner dot for 0ms perceptible latency
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
    };

    // Smooth RAF loop for outer ring
    const renderLoop = () => {
      if (hasMoved && ringRef.current) {
        if (prefersReducedMotion) {
          ringX = mouseX;
          ringY = mouseY;
        } else {
          // Responsive lerp interpolation (0.22 factor provides smooth glide with fast recovery)
          ringX += (mouseX - ringX) * 0.22;
          ringY += (mouseY - ringY) * 0.22;
        }

        ringRef.current.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    // 4. Element Hover Inspection
    const onMouseOver = (e) => {
      const target = e.target;
      if (!target || !(target instanceof Element)) return;

      // Text inputs / editable areas
      const isText = !!target.closest(
        'input[type="text"], input[type="password"], input[type="email"], input[type="number"], ' +
        'input[type="search"], input[type="tel"], input[type="url"], input:not([type]), ' +
        'textarea, [contenteditable="true"], .user-select-text'
      );
      if (isText) {
        setCursorState('text');
        return;
      }

      // Draggable / Map elements
      const isDrag = !!target.closest(
        '[draggable="true"], .draggable, .cursor-grab, .leaflet-container, ' +
        '.satellite-map-container, .map-view-canvas, [data-draggable="true"]'
      );
      if (isDrag) {
        setCursorState('grab');
        return;
      }

      // Clickable / interactive elements
      const isClickable = !!target.closest(
        'button, a, [role="button"], [role="link"], select, summary, label[for], ' +
        'input[type="button"], input[type="submit"], input[type="reset"], input[type="checkbox"], input[type="radio"], ' +
        '.card, .glass-card, [data-clickable], .clickable, .nav-item, .tab-button, .kpi-card, ' +
        '.badge-interactive, .modal-close-btn, .lang-option, .action-btn, .sidebar-nav-item, ' +
        '.filter-chip, .toggle-switch, .switch-portal-btn, .quick-action-tile'
      );

      if (isClickable) {
        setCursorState('pointer');
        return;
      }

      // Check computed cursor style fallback
      try {
        const style = window.getComputedStyle(target);
        if (style.cursor === 'pointer') {
          setCursorState('pointer');
          return;
        }
        if (style.cursor === 'grab' || style.cursor === 'grabbing') {
          setCursorState('grab');
          return;
        }
        if (style.cursor === 'text') {
          setCursorState('text');
          return;
        }
      } catch (err) {}

      setCursorState('default');
    };

    // 5. Mouse Down / Up Tactile Feedback
    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    // 6. Window Boundary Visibility
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);
    const onWindowBlur = () => setIsVisible(false);
    const onWindowFocus = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('focus', onWindowFocus);

    return () => {
      document.body.classList.remove('has-custom-cursor');
      motionQuery.removeEventListener('change', handleMotionChange);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('focus', onWindowFocus);
    };
  }, []);

  if (isTouchDevice) {
    return null;
  }

  const containerClasses = [
    'sanjeevani-cursor-container',
    !isVisible ? 'is-hidden' : '',
    isClicking ? 'is-clicking' : '',
    `state-${cursorState}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={containerRef} className={containerClasses} aria-hidden="true">
      {/* Outer follow ring */}
      <div ref={ringRef} className="sanjeevani-cursor-ring" />
      {/* Immediate center green dot */}
      <div ref={dotRef} className="sanjeevani-cursor-dot" />
    </div>
  );
}
