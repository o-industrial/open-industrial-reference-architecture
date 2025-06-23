import { EverythingAsCodeOIWorkspace } from '../../../eac/EverythingAsCodeOIWorkspace.ts';

/**
 * Context object passed to all capability operations.
 */
export type EaCNodeCapabilityContext = {
  /**
   * Read-only accessor for the current EaC model (with overlays applied).
   */
  GetEaC: () => EverythingAsCodeOIWorkspace;

  /**
   * Optional SurfaceLookup when scoped to a specific surface.
   */
  SurfaceLookup?: string;
};
