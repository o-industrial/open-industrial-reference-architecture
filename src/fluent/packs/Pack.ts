import { PackModuleBuilder } from './PackModuleBuilder.ts';

/**
 * Entry point for defining a PackModule using a fluent builder.
 */
export function Pack(): PackModuleBuilder {
  return new PackModuleBuilder();
}
