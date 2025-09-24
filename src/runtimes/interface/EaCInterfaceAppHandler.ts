import {
  DFSFileHandler,
  type DistributedFileSystemOptions,
  type EaCApplicationProcessorConfig,
  type EaCDistributedFileSystemAsCode,
  type EaCDistributedFileSystemDetails,
  EaCPreactAppHandler,
  type EaCPreactAppProcessor,
  IoCContainer,
  type Logger,
  path,
  PreactRenderHandler,
  preactOptions,
} from './.deps.ts';
import { EaCInterfaceDetails } from '../../eac/EaCInterfaceDetails.ts';
import { InterfaceSpec } from '../../eac/InterfaceSpec.ts';
import { EaCInterfaceAppProcessor } from '../processors/EaCInterfaceAppProcessor.ts';

const renderHandler = new PreactRenderHandler(preactOptions);

export class EaCInterfaceAppHandler extends EaCPreactAppHandler {
  private readonly virtualDFSHandlers = new Map<
    string,
    { DFS: EaCDistributedFileSystemDetails; Handler: VirtualInterfaceDFSHandler }
  >();

  constructor(
    ioc: IoCContainer,
    logger: Logger,
  ) {
    super(
      ioc,
      logger,
      renderHandler,
      './islands/client/eacIslandsClient.ts',
      './islands/client/client.deps.ts',
      undefined,
      { outdir: Deno.cwd() },
    );
  }

  public override async Configure(
    appProcCfg: EaCApplicationProcessorConfig,
    dfss: Record<string, EaCDistributedFileSystemAsCode>,
    dfsOptions: DistributedFileSystemOptions,
    revision: string,
  ): Promise<void> {
    this.ensureVirtualDFS(appProcCfg, revision);
    await super.Configure(appProcCfg, dfss, dfsOptions, revision);
  }

  protected override async loadAppDFSHandler(
    processor: EaCPreactAppProcessor,
    dfss: Record<string, EaCDistributedFileSystemAsCode>,
    dfsOptions: DistributedFileSystemOptions,
  ): Promise<{ DFS: EaCDistributedFileSystemDetails; Handler: DFSFileHandler }> {
    const interfaceProcessor = processor as unknown as EaCInterfaceAppProcessor;
    const virtual = this.virtualDFSHandlers.get(interfaceProcessor.AppDFSLookup);

    if (virtual) {
      this.dfsHandlers.set(interfaceProcessor.AppDFSLookup, virtual.Handler);
      return virtual;
    }

    return await super.loadAppDFSHandler(processor, dfss, dfsOptions);
  }

  private ensureVirtualDFS(
    appProcCfg: EaCApplicationProcessorConfig,
    revision: string,
  ): void {
    const processor = appProcCfg.Application.Processor as EaCInterfaceAppProcessor;
    const interfaces = this.extractInterfaces(appProcCfg);

    if (!interfaces || Object.keys(interfaces).length === 0) {
      this.virtualDFSHandlers.delete(processor.AppDFSLookup);
      return;
    }

    const files = this.composeVirtualFiles(processor, interfaces);

    if (Object.keys(files).length === 0) {
      this.virtualDFSHandlers.delete(processor.AppDFSLookup);
      return;
    }

    const details: EaCDistributedFileSystemDetails = {
      Name: `Virtual Interface DFS (${processor.AppDFSLookup})`,
      Description: 'Synthetic DFS generated from InterfaceSpecs for runtime delivery.',
      Type: 'Virtual',
      Metadata: { Revision: revision },
    } as EaCDistributedFileSystemDetails;

    const handler = new VirtualInterfaceDFSHandler(
      processor.AppDFSLookup,
      details,
      files,
    );

    this.virtualDFSHandlers.set(processor.AppDFSLookup, { DFS: details, Handler: handler });
  }

  private extractInterfaces(
    appProcCfg: EaCApplicationProcessorConfig,
  ): Record<string, InterfaceDefinition> | undefined {
    const sources: Array<Record<string, unknown> | undefined> = [];

    const metadata = appProcCfg.Application.Metadata as Record<string, unknown> | undefined;
    if (metadata) sources.push(metadata);

    const details = appProcCfg.Application.Details as
      | (typeof appProcCfg.Application.Details & { Metadata?: Record<string, unknown> })
      | undefined;
    if (details?.Metadata) sources.push(details.Metadata);

    for (const source of sources) {
      const candidate = source?.Interfaces ?? source?.interfaces;
      if (candidate && typeof candidate === 'object') {
        return candidate as Record<string, InterfaceDefinition>;
      }
    }

    return undefined;
  }

  private composeVirtualFiles(
    processor: EaCInterfaceAppProcessor,
    interfaces: Record<string, InterfaceDefinition>,
  ): Record<string, string> {
    const files: Record<string, string> = {};
    const registry: RegistryEntry[] = [];

    for (const [lookup, definition] of Object.entries(interfaces)) {
      const details = definition.Details ?? {};
      const spec = definition.Spec ?? details.Spec;
      const safeId = toSafeIdentifier(lookup);
      const name = details.Name ?? lookup;

      files[`interfaces/${lookup}/index.tsx`] = buildComponentFile(
        lookup,
        safeId,
        name,
        spec,
      );

      files[`interfaces/${lookup}/data.ts`] = buildDataFile(safeId);
      files[`interfaces/${lookup}/actions.ts`] = buildActionsFile(safeId);

      registry.push({ lookup, safeId });
    }

    files['interfaces/registry.ts'] = buildRegistryFile(registry);
    files[buildRoutePath(processor)] = buildRouteFile(processor, registry);

    return files;
  }
}

type InterfaceDefinition = {
  Details?: Partial<EaCInterfaceDetails>;
  Spec?: InterfaceSpec;
};

type RegistryEntry = {
  lookup: string;
  safeId: string;
};

class VirtualInterfaceDFSHandler extends DFSFileHandler {
  private readonly persisted = new Map<string, string>();

  constructor(
    dfsLookup: string,
    details: EaCDistributedFileSystemDetails,
    private readonly files: Record<string, string>,
  ) {
    super(dfsLookup, details);
  }

  public override get Root(): string {
    return path.join(Deno.cwd(), '_virtual', 'interface-app', this.dfsLookup);
  }

  public override async GetFileInfo(
    filePath: string,
    _revision: string,
  ) {
    const absolutePath = await this.ensureFilePersisted(filePath);
    const contents = await Deno.readFile(absolutePath);

    return {
      Path: `file://${absolutePath}`,
      ImportPath: `file://${absolutePath}`,
      Contents: ReadableStream.from([contents]),
      Headers: {
        'content-type': 'text/typescript',
      },
    };
  }

  public override async LoadAllPaths(_revision: string): Promise<string[]> {
    const persisted = await Promise.all(
      Object.keys(this.files).map((relativePath) => this.persistFile(relativePath)),
    );

    return persisted;
  }

  public override async RemoveFile(): Promise<void> {
    throw new Deno.errors.NotSupported(
      'RemoveFile not supported for the virtual interface DFS handler.',
    );
  }

  public override async WriteFile(): Promise<void> {
    throw new Deno.errors.NotSupported(
      'WriteFile not supported for the virtual interface DFS handler.',
    );
  }

  private async ensureFilePersisted(requestPath: string): Promise<string> {
    const relative = this.normalizeRelative(requestPath);
    const cached = this.persisted.get(relative);
    if (cached) return cached;

    return this.persistFile(relative);
  }

  private async persistFile(relativePath: string): Promise<string> {
    const code = this.files[relativePath];
    if (code === undefined) {
      throw new Deno.errors.NotFound(
        `Virtual interface file "${relativePath}" was not generated.`,
      );
    }

    const absolutePath = path.join(this.Root, relativePath);
    await Deno.mkdir(path.dirname(absolutePath), { recursive: true });
    await Deno.writeTextFile(absolutePath, code);

    this.persisted.set(relativePath, absolutePath);

    return absolutePath;
  }

  private normalizeRelative(filePath: string): string {
    return filePath
      .replace(this.Root, '')
      .replace(/^[/\\]+/, '');
  }
}

function toSafeIdentifier(value: string): string {
  const segments = value
    .split(/[^a-zA-Z0-9]+/)
    .filter((segment) => segment.length)
    .map((segment) => segment[0].toUpperCase() + segment.slice(1));

  const joined = segments.join('') || 'Interface';
  return joined.replace(/^([0-9])/, '_$1');
}

function escapeTemplate(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function buildComponentFile(
  lookup: string,
  safeId: string,
  name: string,
  spec: InterfaceSpec | undefined,
): string {
  const specLiteral = JSON.stringify(spec ?? {}, null, 2) ?? '{}';

  return `import { h } from "preact";
export const interfaceSpec = ${specLiteral} as const;

type Interface${safeId}Props = {
  spec?: typeof interfaceSpec;
};

export default function Interface${safeId}({ spec = interfaceSpec }: Interface${safeId}Props) {
  const meta = spec?.Meta as Record<string, unknown> | undefined;

  return (
    <section class="oi-interface-placeholder">
      <header class="oi-interface-placeholder__header">
        <h1 class="oi-interface-placeholder__title">
          {(meta?.Name as string) ?? "${escapeTemplate(name)}"}
        </h1>
        <p class="oi-interface-placeholder__lookup">Lookup: ${escapeTemplate(lookup)}</p>
      </header>
      <pre class="oi-interface-placeholder__spec">{JSON.stringify(spec, null, 2)}</pre>
    </section>
  );
}
`;
}

function buildDataFile(safeId: string): string {
  return `import { interfaceSpec } from "./index.tsx";

export async function loadInterface${safeId}Data() {
  return {
    spec: interfaceSpec,
  };
}
`;
}

function buildActionsFile(safeId: string): string {
  return `export async function execute${safeId}Action(actionId: string, payload: unknown) {
  console.warn(
    \`[interface-actions] Action "${safeId}:\${actionId}" invoked with payload:\`,
    payload,
  );

  return { status: "noop" };
}
`;
}

function buildRegistryFile(entries: RegistryEntry[]): string {
  if (!entries.length) {
    return `import type { JSX } from "preact";

export const interfaceRegistry: Record<string, { Component: (props: { spec?: unknown }) => JSX.Element; Spec: unknown }> = {};
`;
  }

  const importLines = [
    'import type { JSX } from "preact";',
    ...entries.map(({ lookup, safeId }) =>
      `import Interface${safeId}, { interfaceSpec as spec${safeId} } from "./${lookup}/index.tsx";`
    ),
  ];

  const registryLines = entries
    .map(({ lookup, safeId }) =>
      `  "${escapeTemplate(lookup)}": { Component: Interface${safeId}, Spec: spec${safeId} },`
    )
    .join('\n');

  return `${importLines.join('\n')}

export type InterfaceRegistryEntry = {
  Component: (props: { spec?: unknown }) => JSX.Element;
  Spec: unknown;
};

export const interfaceRegistry: Record<string, InterfaceRegistryEntry> = {
${registryLines}
};
`;
}

function buildRoutePath(processor: EaCInterfaceAppProcessor): string {
  const baseSegments = (processor.RoutesBase ?? 'w/:workspace/ui')
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length)
    .map((segment) => segment.startsWith(':') ? `[${segment.slice(1)}]` : segment);

  return ['routes', ...baseSegments, '[interfaceLookup]', 'index.tsx'].join('/');
}

function buildRouteFile(
  processor: EaCInterfaceAppProcessor,
  entries: RegistryEntry[],
): string {
  const depth = (processor.RoutesBase?.split('/')
    .filter((segment) => segment.trim().length).length ?? 0) + 2;
  const prefix = '../'.repeat(depth);
  const registryImportPath = `${prefix}interfaces/registry.ts`;

  if (!entries.length) {
    return `export default async function handler() {
  return new Response("No interfaces have been published for this workspace.", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
`;
  }

  return `import { h } from "preact";
import render from "preact-render-to-string";
import { interfaceRegistry } from "${registryImportPath}";

export default async function handler(_req: Request, ctx: { Params?: Record<string, string> }) {
  const lookup = ctx?.Params?.interfaceLookup ?? "";
  const entry = interfaceRegistry[lookup as keyof typeof interfaceRegistry];

  if (!entry) {
    return new Response("Interface not found.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const html = render(h(entry.Component, { spec: entry.Spec }));

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Interface-Lookup": lookup,
    },
  });
}
`;
}


