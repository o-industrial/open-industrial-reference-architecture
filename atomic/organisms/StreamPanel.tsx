import { JSX } from '../.deps.ts';
import { StreamPanelTemplate } from '../templates/StreamPanelTemplate.tsx';

export function StreamPanel(): JSX.Element {
  return (
    <StreamPanelTemplate>
      <div class="flex flex-col gap-3 text-xs text-neutral-300 font-mono">
        <div class="text-center text-sm text-neutral-600 my-3 italic">
          Waiting for next impulse...
        </div>

        {/* Impulse 4 (warning-level signal) — latest */}
        <details class="border border-yellow-500 rounded bg-yellow-900/20 open:bg-yellow-800/20 transition-colors">
          <summary class="px-3 py-2 flex items-center justify-between cursor-pointer list-none">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-yellow-300 animate-ping"></span>
              <span class="text-[10px] tracking-widest uppercase text-yellow-300">
                lab-sim-1
              </span>
            </div>
            <span class="text-[10px] text-yellow-200">14:32:21.378</span>
          </summary>
          <div class="px-3 pb-1 text-[11px] text-yellow-100 truncate">
            aqi: 82
          </div>
          <div class="px-3 pb-2 text-yellow-300 text-[10px] italic">
            Signal: air.alert = true
          </div>
          <div class="px-3 pb-3 mt-1 border-t border-yellow-700 pt-2 text-[10px] text-yellow-100">
            <div>
              <strong>Full Payload:</strong> {`{ aqi: 82 }`}
            </div>
            <div>
              <strong>Signal Details:</strong> AirQualityAgent v1 triggered
              alert
            </div>
            <div>
              <strong>Matched Schema:</strong> RoomState v2
            </div>
            <div>
              <strong>Surface:</strong> lab-sim-1
            </div>
          </div>
        </details>

        {/* Impulse 3 */}
        <details class="border border-neutral-700 rounded bg-neutral-800 open:bg-neutral-700/40 transition-colors">
          <summary class="px-3 py-2 flex items-center justify-between cursor-pointer list-none">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span class="text-[10px] tracking-widest uppercase text-neutral-400">
                lab-sim-2
              </span>
            </div>
            <span class="text-[10px] text-neutral-500">14:32:20.009</span>
          </summary>
          <div class="px-3 pb-2 text-[11px] text-neutral-100 truncate">
            co2: 584, temperature: 23.1
          </div>
          <div class="px-3 pb-3 mt-1 border-t border-neutral-700 pt-2 text-[10px] text-neutral-400">
            <div>
              <strong>Full Payload:</strong> {`{ co2: 584, temperature: 23.1 }`}
            </div>
            <div>
              <strong>Matched Schema:</strong> AirChemSensor v1
            </div>
            <div>
              <strong>Surface:</strong> lab-sim-2
            </div>
          </div>
        </details>

        {/* Impulse 2 (signal fired) */}
        <details class="border border-rose-600 rounded bg-rose-950/30 open:bg-rose-900/30 transition-colors">
          <summary class="px-3 py-2 flex items-center justify-between cursor-pointer list-none">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              <span class="text-[10px] tracking-widest uppercase text-rose-400">
                lab-sim-1
              </span>
            </div>
            <span class="text-[10px] text-rose-300">14:32:19.081</span>
          </summary>
          <div class="px-3 pb-1 text-[11px] text-white truncate">
            humidity: 65
          </div>
          <div class="px-3 pb-2 text-rose-400 text-[10px] italic">
            Signal: fan.speed ↑ 72%
          </div>
          <div class="px-3 pb-3 mt-1 border-t border-rose-800 pt-2 text-[10px] text-rose-200">
            <div>
              <strong>Full Payload:</strong> {`{ humidity: 65 }`}
            </div>
            <div>
              <strong>Signal Details:</strong> FanControlAgent v2 triggered
              fan.speed = 72%
            </div>
            <div>
              <strong>Matched Schema:</strong> RoomState v2
            </div>
            <div>
              <strong>Surface:</strong> lab-sim-1
            </div>
          </div>
        </details>

        {/* Impulse 1 — oldest */}
        <details class="border border-neutral-700 rounded bg-neutral-800 open:bg-neutral-700/40 transition-colors">
          <summary class="px-3 py-2 flex items-center justify-between cursor-pointer list-none">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span class="text-[10px] tracking-widest uppercase text-neutral-400">
                lab-sim-1
              </span>
            </div>
            <span class="text-[10px] text-neutral-500">14:32:18.552</span>
          </summary>
          <div class="px-3 pb-2 text-[11px] text-neutral-100 truncate">
            temperature: 22.3, humidity: 44, aqi: 14
          </div>
          <div class="px-3 pb-3 mt-1 border-t border-neutral-700 pt-2 text-[10px] text-neutral-400">
            <div>
              <strong>Full Payload:</strong>{' '}
              {`{ temperature: 22.3, humidity: 44, aqi: 14 }`}
            </div>
            <div>
              <strong>Matched Schema:</strong> RoomState v2
            </div>
            <div>
              <strong>Surface:</strong> lab-sim-1
            </div>
          </div>
        </details>

        {/* Impulse 3 */}
        <details class="border border-neutral-700 rounded bg-neutral-800 open:bg-neutral-700/40 transition-colors">
          <summary class="px-3 py-2 flex items-center justify-between cursor-pointer list-none">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span class="text-[10px] tracking-widest uppercase text-neutral-400">
                lab-sim-2
              </span>
            </div>
            <span class="text-[10px] text-neutral-500">14:32:20.009</span>
          </summary>
          <div class="px-3 pb-2 text-[11px] text-neutral-100 truncate">
            co2: 584, temperature: 23.1
          </div>
          <div class="px-3 pb-3 mt-1 border-t border-neutral-700 pt-2 text-[10px] text-neutral-400">
            <div>
              <strong>Full Payload:</strong> {`{ co2: 584, temperature: 23.1 }`}
            </div>
            <div>
              <strong>Matched Schema:</strong> AirChemSensor v1
            </div>
            <div>
              <strong>Surface:</strong> lab-sim-2
            </div>
          </div>
        </details>

        {/* Impulse 2 (signal fired) */}
        <details class="border border-rose-600 rounded bg-rose-950/30 open:bg-rose-900/30 transition-colors">
          <summary class="px-3 py-2 flex items-center justify-between cursor-pointer list-none">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
              <span class="text-[10px] tracking-widest uppercase text-rose-400">
                lab-sim-1
              </span>
            </div>
            <span class="text-[10px] text-rose-300">14:32:19.081</span>
          </summary>
          <div class="px-3 pb-1 text-[11px] text-white truncate">
            humidity: 65
          </div>
          <div class="px-3 pb-2 text-rose-400 text-[10px] italic">
            Signal: fan.speed ↑ 72%
          </div>
          <div class="px-3 pb-3 mt-1 border-t border-rose-800 pt-2 text-[10px] text-rose-200">
            <div>
              <strong>Full Payload:</strong> {`{ humidity: 65 }`}
            </div>
            <div>
              <strong>Signal Details:</strong> FanControlAgent v2 triggered
              fan.speed = 72%
            </div>
            <div>
              <strong>Matched Schema:</strong> RoomState v2
            </div>
            <div>
              <strong>Surface:</strong> lab-sim-1
            </div>
          </div>
        </details>

        {/* Impulse 1 — oldest */}
        <details class="border border-neutral-700 rounded bg-neutral-800 open:bg-neutral-700/40 transition-colors">
          <summary class="px-3 py-2 flex items-center justify-between cursor-pointer list-none">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span class="text-[10px] tracking-widest uppercase text-neutral-400">
                lab-sim-1
              </span>
            </div>
            <span class="text-[10px] text-neutral-500">14:32:18.552</span>
          </summary>
          <div class="px-3 pb-2 text-[11px] text-neutral-100 truncate">
            temperature: 22.3, humidity: 44, aqi: 14
          </div>
          <div class="px-3 pb-3 mt-1 border-t border-neutral-700 pt-2 text-[10px] text-neutral-400">
            <div>
              <strong>Full Payload:</strong>{' '}
              {`{ temperature: 22.3, humidity: 44, aqi: 14 }`}
            </div>
            <div>
              <strong>Matched Schema:</strong> RoomState v2
            </div>
            <div>
              <strong>Surface:</strong> lab-sim-1
            </div>
          </div>
        </details>
      </div>
    </StreamPanelTemplate>
  );
}
