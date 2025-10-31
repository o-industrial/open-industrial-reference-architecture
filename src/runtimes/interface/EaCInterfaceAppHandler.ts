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
  preactOptions,
  PreactRenderHandler,
} from './.deps.ts';
import { EaCInterfaceCodeBlock, EaCInterfaceDetails } from '../../eac/EaCInterfaceDetails.ts';
import { EaCInterfaceAppProcessor } from '../processors/EaCInterfaceAppProcessor.ts';
import {
  interfacePageDataToSchema,
  jsonSchemaToTypeExpression,
} from '../../utils/jsonSchemaToType.ts';

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
      Description: 'Synthetic DFS generated from interface code definitions.',
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
      const safeId = toSafeIdentifier(lookup);
      const displayName = details.Name?.trim()?.length ? details.Name : lookup;

      files[`interfaces/${lookup}/types.ts`] = buildTypesFile(lookup, safeId, details);
      files[`interfaces/${lookup}/services.ts`] = buildServicesFile(lookup, safeId, details);
      files[`interfaces/${lookup}/module.tsx`] = buildUserModuleFile(
        lookup,
        safeId,
        displayName ?? lookup,
        details,
      );
      files[`interfaces/${lookup}/index.tsx`] = buildWrapperFile(lookup);
      files[`interfaces/${lookup}/handler.ts`] = buildHandlerFile(lookup, safeId, details);

      registry.push({ lookup, safeId });
    }

    files['interfaces/registry.ts'] = buildRegistryFile(registry);
    files[buildRoutePath(processor)] = buildRouteFile(processor);

    return files;
  }
}

type InterfaceDefinition = {
  Details?: Partial<EaCInterfaceDetails>;
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

  public override RemoveFile(): Promise<void> {
    throw new Deno.errors.NotSupported(
      'RemoveFile not supported for the virtual interface DFS handler.',
    );
  }

  public override WriteFile(): Promise<void> {
    throw new Deno.errors.NotSupported(
      'WriteFile not supported for the virtual interface DFS handler.',
    );
  }

  private ensureFilePersisted(requestPath: string): Promise<string> {
    const relative = this.normalizeRelative(requestPath);
    const cached = this.persisted.get(relative);
    if (cached) return Promise.resolve(cached);

    return Promise.resolve(this.persistFile(relative));
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

function sanitizeCommentLine(line: string): string {
  return line.replace(/\*\//g, '*\\/').trim();
}

function appendBulletLines(
  target: string[],
  indent: string,
  message: string,
): void {
  const lines = message.split(/\r?\n/);
  const bulletPrefix = `${indent}* - `;
  const continuationPrefix = `${indent}*   `;

  for (const [index, raw] of lines.entries()) {
    const content = sanitizeCommentLine(raw);
    if (!content.length) continue;
    target.push(`${index === 0 ? bulletPrefix : continuationPrefix}${content}`);
  }
}

function buildGuidanceComment(
  label: string,
  block?: EaCInterfaceCodeBlock,
): string {
  if (!block) return '';

  const lines: string[] = ['/**', ` * ${label} guidance derived from EaC metadata.`];

  if (block.Description?.trim()) {
    const descriptionLines = block.Description.split(/\r?\n/);
    for (const desc of descriptionLines) {
      const content = sanitizeCommentLine(desc);
      if (content.length) {
        lines.push(` * ${content}`);
      }
    }
  }

  if (block.Messages?.length) {
    lines.push(' *');
    lines.push(' * Messages:');
    for (const message of block.Messages) {
      appendBulletLines(lines, ' ', message);
    }
  }

  if (block.MessageGroups?.length) {
    for (const [index, group] of block.MessageGroups.entries()) {
      lines.push(' *');
      const title = sanitizeCommentLine(group.Title ?? `Guidance Group ${index + 1}`);
      lines.push(` * ${title}:`);
      for (const message of group.Messages) {
        appendBulletLines(lines, '  ', message);
      }
    }
  }

  lines.push(' */');
  return lines.join('\n');
}

function buildUserModuleFile(
  lookup: string,
  safeId: string,
  displayName: string,
  details: Partial<EaCInterfaceDetails>,
): string {
  const imports = details.Imports?.map((line) => line.trim()).filter(Boolean) ?? [];
  const importLines = [
    'import type { InterfaceClientContext, InterfaceServerContext, InterfaceServices } from "./services.ts";',
    'import { defaultInterfacePageData, type InterfacePageData } from "./types.ts";',
    ...new Set(imports),
  ];

  const guidance = buildGuidanceComment('Interface module guidance', details.Page);
  const serverLoader = buildServerLoaderStub(safeId);
  const clientLoader = buildClientLoaderStub();
  const component = resolveInterfaceComponent(lookup, safeId, displayName, details);

  const sections = [
    '// deno-lint-ignore-file no-explicit-any',
    importLines.join('\n'),
    guidance,
    serverLoader,
    clientLoader,
    component,
    'export type InterfacePageProps = {',
    '  data: InterfacePageData;',
    '  services: InterfaceServices;',
    '  status: {',
    '    isLoading: boolean;',
    '    error?: string;',
    '  };',
    '  refresh: () => Promise<void>;',
    '};',
  ].filter((segment) => segment && segment.trim().length > 0);

  return `${sections.join('\n\n')}\n`;
}

function buildServerLoaderStub(safeId: string): string {
  return `export async function loadServerData(
  ctx: InterfaceServerContext,
): Promise<InterfacePageData> {
  return {
    ...defaultInterfacePageData,
    status: ctx.previous?.status ?? "ready",
    message: ctx.previous?.message ?? "Author loadServerData for ${escapeTemplate(safeId)}.",
  };
}`;
}

function buildClientLoaderStub(): string {
  return `export async function loadClientData(
  _ctx: InterfaceClientContext,
): Promise<Partial<InterfacePageData>> {
  return {};
}`;
}

function resolveInterfaceComponent(
  lookup: string,
  safeId: string,
  displayName: string,
  details: Partial<EaCInterfaceDetails>,
): string {
  const customPage = details.Page?.Code ?? '';
  if (customPage.trim().length > 0) {
    return isFullPageImplementation(customPage)
      ? customPage.trimEnd()
      : composeCustomPage(customPage);
  }

  return `export default function InterfacePage({
  data,
  services,
  status,
  refresh,
}: InterfacePageProps) {
  return (
    <section class="oi-interface-splash">
      <header>
        <h1>${escapeTemplate(displayName)}</h1>
        <p>Lookup: ${escapeTemplate(lookup)}</p>
      </header>
      <p>{data.message ?? "Replace this placeholder once the page view is authored."}</p>
      <button type="button" onClick={() => refresh()} disabled={status.isLoading}>
        Refresh data
      </button>
      {status.error && <p class="oi-interface-splash__error">{status.error}</p>}
      <pre>{JSON.stringify(data ?? {}, null, 2)}</pre>
    </section>
  );
}`;
}

function buildWrapperFile(lookup: string): string {
  return `import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "preact/hooks";
import InterfaceModule, { loadClientData } from "./module.tsx";
import {
  createInterfaceServices,
  type InterfaceClientContext,
  type InterfaceServiceDescriptor,
} from "./services.ts";
import {
  defaultInterfacePageData,
  type InterfacePageData,
} from "./types.ts";

type InterfaceWrapperProps = {
  data?: InterfacePageData;
  lookup: string;
};

export default function InterfaceWrapper({
  data,
  lookup,
}: InterfaceWrapperProps) {
  const [pageData, setPageData] = useState<InterfacePageData>(
    data ?? defaultInterfacePageData,
  );
  const [status, setStatus] = useState<{ isLoading: boolean; error?: string }>({
    isLoading: false,
    error: undefined,
  });

  const services = useMemo(
    () =>
      createInterfaceServices(
        createClientInvoker(lookup),
      ),
    [lookup],
  );

  const refresh = useCallback(async () => {
    if (typeof loadClientData !== "function") return;

    const controller = new AbortController();
    setStatus({ isLoading: true, error: undefined });

    try {
      const next = await loadClientData({
        previous: pageData,
        services,
        signal: controller.signal,
      } satisfies InterfaceClientContext);

      if (next && typeof next === "object") {
        setPageData((prev) => ({ ...prev, ...next }));
      }

      setStatus((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setStatus({
        isLoading: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [pageData, services]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <InterfaceModule
      data={pageData}
      services={services}
      status={status}
      refresh={refresh}
    />
  );
}

function createClientInvoker(
  lookup: string,
): InterfaceServiceInvokeShim {
  return async function invoke<TResult, TInput>(
    descriptor: InterfaceServiceDescriptor<TResult, TInput>,
    _input: TInput,
  ): Promise<TResult> {
    console.warn(
      "Client service invocation not yet wired for",
      lookup,
      descriptor,
    );
    throw new Error(
      \`Client invocation not implemented for \${descriptor.sliceKey}/\${descriptor.actionKey}.\`,
    );
  };
}

type InterfaceServiceInvokeShim = <TResult, TInput>(
  descriptor: InterfaceServiceDescriptor<TResult, TInput>,
  input: TInput,
) => Promise<TResult>;
`;
}

const CUSTOM_HANDLER_PREFIX = `export async function loadPageData(
  req: Request,
  ctx: InterfaceRequestContext,
  services: InterfaceServices,
  seed: InterfacePageData,
): Promise<InterfacePageData> {
`;

const CUSTOM_HANDLER_SUFFIX = `}
`;

function isFullHandlerImplementation(code: string): boolean {
  return /export\s+async\s+function\s+loadPageData\b/.test(code);
}

function composeCustomHandler(body: string): string {
  if (!body.trim().length) return '';
  const normalized = body.endsWith('\n') ? body : `${body}\n`;
  return `${CUSTOM_HANDLER_PREFIX}${normalized}${CUSTOM_HANDLER_SUFFIX}`.trimEnd();
}

const CUSTOM_PAGE_PREFIX = `export default function InterfacePage({
  data,
  services,
  status,
  refresh,
}: InterfacePageProps) {
`;

const CUSTOM_PAGE_SUFFIX = `}
`;

function isFullPageImplementation(code: string): boolean {
  return /export\s+default\s+function\s+InterfacePage\s*\(/.test(code);
}

function composeCustomPage(body: string): string {
  if (!body.trim().length) return '';
  const normalized = body.endsWith('\n') ? body : `${body}\n`;
  return `${CUSTOM_PAGE_PREFIX}${normalized}${CUSTOM_PAGE_SUFFIX}`.trimEnd();
}

function buildHandlerFile(
  lookup: string,
  safeId: string,
  details: Partial<EaCInterfaceDetails>,
): string {
  const handlerComment = buildGuidanceComment('Server handler guidance', details.PageHandler);
  const customSource = details.PageHandler?.Code ?? '';
  if (customSource.trim().length > 0) {
    if (isFullHandlerImplementation(customSource)) {
      return customSource.trimEnd();
    }
    return composeCustomHandler(customSource);
  }

  return `import type { InterfaceRequestContext } from "../registry.ts";
import type { InterfacePageData } from "./types.ts";
import {
  defaultInterfacePageData,
} from "./types.ts";
import {
  type InterfaceServerContext,
  type InterfaceServices,
} from "./services.ts";
import * as Module from "./module.tsx";

${handlerComment.length ? `${handlerComment}\n\n` : ''}export async function loadPageData(
  req: Request,
  ctx: InterfaceRequestContext,
  services: InterfaceServices,
  seed: InterfacePageData,
): Promise<InterfacePageData> {
  const data = { ...seed };
  void services;

  if (typeof Module.loadServerData === "function") {
    const result = await Module.loadServerData({
      request: req,
      params: ctx?.Params ?? {},
      headers: req.headers,
      previous: data,
      services,
    } satisfies InterfaceServerContext);

    return { ...data, ...result };
  }

  return data;
}
`;
}
function buildTypesFile(
  lookup: string,
  safeId: string,
  details: Partial<EaCInterfaceDetails>,
): string {
  const schema = interfacePageDataToSchema(details.PageDataType);
  const expression = jsonSchemaToTypeExpression(schema);

  const defaults = buildDefaultInterfaceData(schema);

  return `/** Generated interface data type for the "${escapeTemplate(lookup)}" interface. */
export type InterfacePageData = ${expression};

export const defaultInterfacePageData: InterfacePageData = ${defaults};
`;
}

function buildServicesFile(
  lookup: string,
  safeId: string,
  _details: Partial<EaCInterfaceDetails>,
): string {
  return `import type { InterfacePageData } from "./types.ts";

export type InterfaceServiceDescriptor<TResult, TInput = void> = {
  sliceKey: string;
  actionKey: string;
  resultName: string;
  autoExecute: boolean;
  includeInResponse: boolean;
};

export type InterfaceServiceInvoke = <TResult, TInput = void>(
  descriptor: InterfaceServiceDescriptor<TResult, TInput>,
  input: TInput,
) => Promise<TResult>;

export type InterfaceServices = {
  ping(): Promise<string>;
};

export function createInterfaceServices(invoke: InterfaceServiceInvoke): InterfaceServices {
  return {
    async ping(): Promise<string> {
      return await invoke<string, void>(
        {
          sliceKey: "sample",
          actionKey: "ping",
          resultName: "status",
          autoExecute: false,
          includeInResponse: false,
        },
        undefined as void,
      );
    },
  };
}

export type InterfaceServerContext = {
  request: Request;
  params: Record<string, string>;
  headers: Headers;
  previous?: Partial<InterfacePageData>;
  services: InterfaceServices;
};

export type InterfaceClientContext = {
  previous?: InterfacePageData;
  services: InterfaceServices;
  signal?: AbortSignal;
};

// TODO: Replace placeholder service generation for interface "${escapeTemplate(lookup)}".
`;
}

function buildDefaultInterfaceData(schema: unknown): string {
  if (schema && typeof schema === 'object' && 'default' in (schema as Record<string, unknown>)) {
    const defaultValue = (schema as Record<string, unknown>).default;
    if (defaultValue !== undefined) {
      return JSON.stringify(defaultValue, null, 2);
    }
  }
  return '{} as InterfacePageData';
}

function buildRegistryFile(entries: RegistryEntry[]): string {
  const importLines = [
    'import { h } from "preact";',
    'import type { JSX } from "preact";',
    'import render from "preact-render-to-string";',
  ];

  const moduleImports = entries
    .map(({ lookup, safeId }) => [
      `import Interface${safeId} from "./${lookup}/index.tsx";`,
      `import * as Interface${safeId}Handlers from "./${lookup}/handler.ts";`,
      `import { createInterfaceServices as createInterface${safeId}Services } from "./${lookup}/services.ts";`,
      `import { defaultInterfacePageData as defaultInterface${safeId}PageData } from "./${lookup}/types.ts";`,
    ])
    .flat();

  const createEntryFunction =
    `type InterfaceHandlerFn = (req: Request, ctx: InterfaceRequestContext) => Promise<Response> | Response;

export type InterfaceRequestContext = {
  Params?: Record<string, string>;
  [key: string]: unknown;
};

export type InterfaceHandlers = {
  default?: InterfaceHandlerFn;
  DELETE?: InterfaceHandlerFn;
  GET?: InterfaceHandlerFn;
  HEAD?: InterfaceHandlerFn;
  OPTIONS?: InterfaceHandlerFn;
  PATCH?: InterfaceHandlerFn;
  POST?: InterfaceHandlerFn;
  PUT?: InterfaceHandlerFn;
  loadPageData?: (
    req: Request,
    ctx: InterfaceRequestContext,
    services: unknown,
    seed: unknown,
  ) => Promise<unknown> | unknown;
};

export type InterfacePageComponent = (props: { data?: unknown }) => JSX.Element;

export type InterfaceRegistryEntry = {
  lookup: string;
  Component: InterfacePageComponent;
  handlers: InterfaceHandlers;
  render: (req: Request, ctx: InterfaceRequestContext) => Promise<Response>;
};

type RegistryServiceDescriptor = {
  sliceKey: string;
  actionKey: string;
  resultName: string;
  autoExecute: boolean;
  includeInResponse: boolean;
};

type RegistryServiceInvoke = <TResult, TInput>(
  descriptor: RegistryServiceDescriptor,
  input: TInput,
) => Promise<TResult>;

function createServerInvoker(
  lookup: string,
  req: Request,
  ctx: InterfaceRequestContext,
): RegistryServiceInvoke {
  return async <TResult, TInput>(
    descriptor: RegistryServiceDescriptor,
    input: TInput,
  ): Promise<TResult> => {
    const containers = (ctx as Record<string, unknown>)?.actions ??
      (ctx as Record<string, unknown>)?.Actions ?? {};
    const handler = (containers as Record<string, Record<string, unknown>>)[descriptor.sliceKey]?.[descriptor.actionKey];
    if (typeof handler === "function") {
      return await (handler as (
        options: { req: Request; ctx: InterfaceRequestContext; input?: unknown },
      ) => Promise<unknown> | unknown)({
        req,
        ctx,
        input,
      }) as TResult;
    }

    console.warn(
      "No server handler registered for",
      lookup,
      descriptor.sliceKey,
      descriptor.actionKey,
    );
    return undefined as TResult;
  };
}

function createEntry(
  component: InterfacePageComponent,
  handlers: InterfaceHandlers,
  lookup: string,
  buildServices: (req: Request, ctx: InterfaceRequestContext) => unknown,
  buildSeed: () => unknown,
): InterfaceRegistryEntry {
  return {
    lookup,
    Component: component,
    handlers,
    render: async (req: Request, ctx: InterfaceRequestContext) => {
      const seed = buildSeed();
      const services = buildServices(req, ctx);
      const resolved = handlers.loadPageData
        ? await handlers.loadPageData(req, ctx, services, seed)
        : seed;
      const data = resolved ?? seed;

      const html = render(h(component, { data }));

      return new Response(html, {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Interface-Lookup": lookup,
        },
      });
    },
  };
}`;

  const registryEntries = entries
    .map(({ lookup, safeId }) =>
      `  "${escapeTemplate(lookup)}": createEntry(
    Interface${safeId},
    Interface${safeId}Handlers,
    "${escapeTemplate(lookup)}",
    (req, ctx) =>
      createInterface${safeId}Services(
        createServerInvoker("${escapeTemplate(lookup)}", req, ctx),
      ),
    () => ({ ...defaultInterface${safeId}PageData }),
  ),`
    )
    .join('\n');

  const registryObject = `export const interfaceRegistry: Record<string, InterfaceRegistryEntry> = {
${registryEntries}
};`;

  const segments = [
    '// deno-lint-ignore-file no-explicit-any',
    importLines.join('\n'),
    moduleImports.join('\n'),
    createEntryFunction,
    registryObject,
  ].filter((segment) => segment && segment.trim().length > 0);

  if (!entries.length) {
    segments.splice(
      segments.length - 1,
      1,
      'export const interfaceRegistry: Record<string, InterfaceRegistryEntry> = {};',
    );
  }

  return `${segments.join('\n\n')}\n`;
}
const HTTP_METHODS = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT'] as const;

function buildRoutePath(processor: EaCInterfaceAppProcessor): string {
  const baseSegments = (processor.RoutesBase ?? 'w/:workspace/ui')
    .split('/')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length)
    .map((segment) => segment.startsWith(':') ? `[${segment.slice(1)}]` : segment);

  return ['routes', ...baseSegments, '[interfaceLookup]', 'index.tsx'].join('/');
}

function buildRouteFile(processor: EaCInterfaceAppProcessor): string {
  const depth = (processor.RoutesBase?.split('/')
    .filter((segment) => segment.trim().length).length ?? 0) + 2;
  const prefix = '../'.repeat(depth);
  const registryImportPath = `${prefix}interfaces/registry.ts`;

  const methodExports = HTTP_METHODS.map((method) =>
    `export async function ${method}(
  req: Request,
  ctx: InterfaceRequestContext,
): Promise<Response> {
  return await resolveInterface("${method}", req, ctx);
}`
  ).join('\n\n');

  return `import { interfaceRegistry } from "${registryImportPath}";
import type { InterfaceRequestContext } from "${registryImportPath}";

type HandlerFn = (req: Request, ctx: InterfaceRequestContext) => Promise<Response> | Response;

const SUPPORTED_METHODS = ${JSON.stringify(HTTP_METHODS)} as const;

type SupportedMethod = (typeof SUPPORTED_METHODS)[number];

function normalizeMethod(method: string | undefined): SupportedMethod {
  const candidate = (method ?? "GET").toUpperCase();
  return (SUPPORTED_METHODS as readonly string[]).includes(candidate)
    ? candidate as SupportedMethod
    : "GET";
}

async function resolveInterface(
  method: SupportedMethod | string,
  req: Request,
  ctx: InterfaceRequestContext,
): Promise<Response> {
  const lookup = ctx?.Params?.interfaceLookup ?? "";
  const entry = interfaceRegistry[lookup as keyof typeof interfaceRegistry];

  if (!entry) {
    return new Response("Interface not found.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const normalized = normalizeMethod(
    typeof method === "string" ? method : method,
  );

  const handlers = entry.handlers as Record<string, unknown> & {
    default?: HandlerFn;
    GET?: HandlerFn;
  };

  const direct = handlers[normalized] as HandlerFn | undefined;

  if (typeof direct === "function") {
    return await direct(req, ctx);
  }

  if (normalized === "HEAD" && typeof handlers.GET === "function") {
    const response = await handlers.GET(req, ctx);
    return new Response(null, {
      status: response.status,
      headers: response.headers,
    });
  }

  if (typeof handlers.default === "function") {
    return await handlers.default(req, ctx);
  }

  return await entry.render(req, ctx);
}

export default async function handler(
  req: Request,
  ctx: InterfaceRequestContext,
): Promise<Response> {
  const method = normalizeMethod(req?.method);
  return await resolveInterface(method, req, ctx);
}

${methodExports}
`;
}
