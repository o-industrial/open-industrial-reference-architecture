export type SimulatorDefinition = {
  ID: string;
  Label: string;
  Description: string;
  Category: string;
};

export type SimulatorPackDefinition = {
  ID: string;
  Label: string;
  Description: string;
  Category: string;
  Simulators: SimulatorDefinition[];
};

export class SimulatorLibraryManager {
  protected simulators: SimulatorDefinition[] = [];
  protected packs: SimulatorPackDefinition[] = [];
  protected listeners: Set<() => void> = new Set<() => void>();

  constructor() {
    this.simulators = [
      {
        ID: 'sim-roomstate',
        Label: 'RoomState Simulator',
        Description: 'Simulates environmental metrics in a lab.',
        Category: 'Environmental',
      },
      {
        ID: 'sim-hvac',
        Label: 'HVACSim',
        Description: 'Emulates airflow and fan control systems.',
        Category: 'Factory',
      },
      {
        ID: 'sim-opflow',
        Label: 'Occupancy Flow',
        Description: 'Tracks occupancy and motion-based routing.',
        Category: 'Environmental',
      },
      {
        ID: 'sim-biosensor',
        Label: 'BioSensor Pulse',
        Description: 'Streams simulated vitals in medical contexts.',
        Category: 'Medical',
      },
    ];

    this.packs = [
      {
        ID: 'building-pack',
        Label: 'Smart Building Pack',
        Description: 'Includes RoomState, HVACSim, OccupancyFlow',
        Category: 'Environmental',
        Simulators: this.simulators.filter((sim) =>
          ['sim-roomstate', 'sim-hvac', 'sim-opflow'].includes(sim.ID)
        ),
      },
    ];
  }

  // === Public API ===

  public GetAll(): SimulatorDefinition[] {
    return [...this.simulators];
  }

  public GetByCategory(category: string): SimulatorDefinition[] {
    return category.toLowerCase() === 'all' ? this.GetAll() : this.simulators.filter(
      (sim) => sim.Category.toLowerCase() === category.toLowerCase(),
    );
  }

  public GetPacksByCategory(category: string): SimulatorPackDefinition[] {
    return category.toLowerCase() === 'all' ? [...this.packs] : this.packs.filter(
      (pack) => pack.Category.toLowerCase() === category.toLowerCase(),
    );
  }

  public ResolvePack(packId: string): SimulatorDefinition[] {
    const pack = this.packs.find((p) => p.ID === packId);
    if (!pack) return [];

    return pack.Simulators.map((sim) => this.simulators.find((s) => s.ID === sim.ID)).filter(
      Boolean,
    ) as SimulatorDefinition[];
  }

  public OnLibraryChanged(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  protected emit(): void {
    for (const cb of this.listeners) cb();
  }
}
