import { StepModuleBuilder } from './StepModuleBuilder.ts';

export function Step<TInput = unknown, TOutput = unknown>(
  name: string,
  description: string,
): StepModuleBuilder<TInput, TOutput> {
  return new StepModuleBuilder<TInput, TOutput>(name, description);
}
