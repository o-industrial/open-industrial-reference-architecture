import { JSX, classSet } from '../.deps.ts';
import { LineSparkSVG, type LineSeries } from '../.exports.ts';

export const IsIsland = true;

type LineChartProps = {
  lines: LineSeries[];
  width?: number;
  height?: number;
  yMin?: number;
  yMax?: number;
  yPadding?: number;
  animate?: boolean;
  class?: string;
} & JSX.HTMLAttributes<HTMLDivElement>;

export function LineChart({
  lines,
  width = 400,
  height = 200,
  yMin,
  yMax,
  yPadding,
  animate = true,
  class: className,
  ...rest
}: LineChartProps): JSX.Element {
  return (
    <div {...rest} class={classSet(['w-full h-full', className])}>
      <LineSparkSVG
        lines={lines}
        width={width}
        height={height}
        yMin={yMin}
        yMax={yMax}
        yPadding={yPadding}
        animate={animate}
      />
    </div>
  );
}

