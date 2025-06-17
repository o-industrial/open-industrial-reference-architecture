import { JSX } from '../.deps.ts';
import { Action } from '../atoms/Action.tsx';
import { TimelinePanelTemplate } from '../templates/TimelinePanelTemplate.tsx';

export function TimelinePanel(): JSX.Element {
  return (
    <TimelinePanelTemplate>
      <div class="flex flex-col gap-4 text-xs text-white font-mono">
        {/* TICK ROW */}
        <div class="flex items-center gap-4 h-6 pl-[100px]">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              class="w-[100px] text-[10px] text-neutral-500 text-center"
            >
              {`+${i}s`}
            </div>
          ))}
        </div>

        {/* SYSTEM ROW */}
        <div class="flex items-start gap-2">
          <div class="w-[100px] text-[10px] text-neutral-500 uppercase pt-1">
            system
          </div>
          <div class="flex gap-[100px] items-center h-10">
            <div class="px-2 py-1 rounded bg-lime-500/20 text-lime-300 border border-lime-600 text-[10px]">
              RoomState v2 promoted
            </div>
            <div class="px-2 py-1 rounded bg-pink-500/20 text-pink-300 border border-pink-600 text-[10px]">
              FanControlAgent forked
            </div>
          </div>
        </div>

        {/* LAB-SIM-1 ROW */}
        <div class="flex items-start gap-2">
          <div class="w-[100px] text-[10px] text-neutral-500 uppercase pt-1">
            lab-sim-1
          </div>
          <div class="flex gap-[100px] items-center h-10 relative">
            <div class="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-600 text-[10px]">
              impulse: {`{ humidity: 64 }`}
            </div>
            <div class="px-2 py-1 rounded bg-violet-500/20 text-violet-300 border border-violet-600 text-[10px]">
              FanControlAgent v2 ran
            </div>
            <div class="px-2 py-1 rounded bg-orange-500/20 text-orange-300 border border-orange-600 text-[10px]">
              signal: fan.speed = 72%
            </div>
            <div class="absolute top-full mt-1 left-[100px] text-[9px] text-neutral-400 italic">
              ↳ matched RoomState v2
            </div>
          </div>
        </div>

        {/* LAB-SIM-2 ROW */}
        <div class="flex items-start gap-2">
          <div class="w-[100px] text-[10px] text-neutral-500 uppercase pt-1">
            lab-sim-2
          </div>
          <div class="flex gap-[100px] items-center h-10">
            <div class="px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-600 text-[10px]">
              impulse: {`{ co2: 582 }`}
            </div>
            <div class="px-2 py-1 rounded bg-yellow-500/20 text-yellow-200 border border-yellow-400 text-[10px]">
              signal: air.alert = true
            </div>
          </div>
        </div>

        {/* ZOOM TO EVENT BAR */}
        <div class="mt-6 flex gap-2 items-center text-[10px] text-neutral-400">
          <label class="text-neutral-500">Zoom to Event:</label>
          <select class="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs text-white">
            <option>fan.speed = 72%</option>
            <option>RoomState v2 promoted</option>
            <option>Humidity impulse</option>
          </select>
          <Action class="ml-2 px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs">
            Go →
          </Action>
        </div>
      </div>
    </TimelinePanelTemplate>
  );
}
