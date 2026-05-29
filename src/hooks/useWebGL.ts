"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Result returned by the {@link useWebGL} hook.
 */
interface UseWebGLResult {
  /** True when a WebGL rendering context could be created. */
  isSupported: boolean;
  /** True once the shader program has compiled and the first frame is rendered. */
  isLoaded: boolean;
}

/** GLSL source for the pass-through vertex shader (fullscreen quad). */
const VERTEX_SHADER_SOURCE = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/** Six vertices describing two triangles that cover clip space [-1, 1]. */
const FULLSCREEN_QUAD = new Float32Array([
  -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
]);

/**
 * Compiles a single shader of the given type.
 *
 * @param gl - The active WebGL rendering context.
 * @param type - Either gl.VERTEX_SHADER or gl.FRAGMENT_SHADER.
 * @param source - GLSL source code for the shader.
 * @returns The compiled WebGLShader, or null if compilation failed.
 */
function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    // Surface compile errors so broken GLSL is debuggable instead of silently failing.
    console.error("WebGL shader compile error:", info);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * Links a vertex and fragment shader into a program.
 *
 * @param gl - The active WebGL rendering context.
 * @param vertexShader - A compiled vertex shader.
 * @param fragmentShader - A compiled fragment shader.
 * @returns The linked WebGLProgram, or null if linking failed.
 */
function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) {
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    console.error("WebGL program link error:", info);
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

/**
 * Sets up an animated fullscreen WebGL quad rendered with the supplied
 * fragment shader. Provides u_time, u_resolution and u_mouse uniforms and
 * drives a requestAnimationFrame loop. All resources, listeners and the
 * animation frame are cleaned up on unmount.
 *
 * @param canvasRef - Ref to the target canvas element.
 * @param fragmentShader - GLSL fragment shader source. Must declare the
 *   uniforms u_time (float), u_resolution (vec2) and u_mouse (vec2).
 * @returns Support and loaded state flags.
 */
export function useWebGL(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  fragmentShader: string
): UseWebGLResult {
  const [isSupported, setIsSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Latest mouse position in pixels, mutable so the rAF loop reads current value.
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

    if (!gl) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);

    if (!vertexShader || !fragShader) {
      // GLSL failed to compile — treat as unsupported so a fallback can render.
      setIsSupported(false);
      return;
    }

    const program = createProgram(gl, vertexShader, fragShader);
    if (!program) {
      setIsSupported(false);
      return;
    }

    gl.useProgram(program);

    // Upload the fullscreen quad geometry once.
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_QUAD, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const timeLocation = gl.getUniformLocation(program, "u_time");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const mouseLocation = gl.getUniformLocation(program, "u_mouse");

    /**
     * Resizes the drawing buffer to match the displayed size, accounting for
     * device pixel ratio (clamped to 2 to limit GPU load on high-DPI screens).
     */
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const displayWidth = Math.floor(canvas.clientWidth * dpr);
      const displayHeight = Math.floor(canvas.clientHeight * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // Convert to drawing-buffer pixels; flip Y so origin is bottom-left like GL.
      mouseRef.current = {
        x: (event.clientX - rect.left) * dpr,
        y: (rect.height - (event.clientY - rect.top)) * dpr,
      };
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    resize();

    const startTime = performance.now();
    let animationFrameId = 0;
    let firstFrameRendered = false;

    const render = () => {
      resize();

      const elapsedSeconds = (performance.now() - startTime) / 1000;

      if (timeLocation) {
        gl.uniform1f(timeLocation, elapsedSeconds);
      }
      if (resolutionLocation) {
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      }
      if (mouseLocation) {
        gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!firstFrameRendered) {
        firstFrameRendered = true;
        setIsLoaded(true);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);

      // Release GPU resources to avoid leaks on remount.
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragShader);
    };
  }, [canvasRef, fragmentShader]);

  return { isSupported, isLoaded };
}
