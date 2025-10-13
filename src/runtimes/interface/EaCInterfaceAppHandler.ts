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

      files[`interfaces/${lookup}/index.tsx`] = buildPageModule(
        lookup,
        safeId,
        displayName ?? lookup,
        details,
      );

      files[`interfaces/${lookup}/handler.ts`] = buildHandlerModule(
        lookup,
        safeId,
        details,
      );

      files[`interfaces/${lookup}/types.ts`] = buildTypesModule(
        lookup,
        safeId,
        details,
      );

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

function buildPageModule(
  lookup: string,
  safeId: string,
  displayName: string,
  details: Partial<EaCInterfaceDetails>,
): string {
  const imports = details.Imports?.map((line) => line.trim()).filter(Boolean) ?? [];
  const importCandidates = [
    'import { h } from "preact";',
    `import type { Interface${safeId}PageData } from "./types.ts";`,
    ...imports,
  ];
  const uniqueImports = importCandidates.filter((line, index, arr) =>
    line && arr.indexOf(line) === index
  );
  const importSection = uniqueImports.join('\n');

  const pageComment = buildGuidanceComment('Page component', details.Page);
  const pageCode = details.Page?.Code?.trim()?.length
    ? details.Page.Code.trimEnd()
    : buildDefaultPageCode(lookup, safeId, displayName);

  const segments = [
    '// deno-lint-ignore-file no-explicit-any no-unused-vars',
    importSection,
    pageComment,
    pageCode,
    `export type { Interface${safeId}PageData } from "./types.ts";`,
  ].filter((segment) => segment && segment.trim().length > 0);

  return `${segments.join('\n\n')}\n`;
}

function buildDefaultPageCode(
  lookup: string,
  safeId: string,
  displayName: string,
): string {
  return `export default function Interface${safeId}({ data }: { data?: Interface${safeId}PageData }) {
  return (
    <section class="oi-interface-placeholder">
      <header class="oi-interface-placeholder__header">
        <h1 class="oi-interface-placeholder__title">${escapeTemplate(displayName)}</h1>
        <p class="oi-interface-placeholder__lookup">Lookup: ${escapeTemplate(lookup)}</p>
      </header>
      <pre class="oi-interface-placeholder__spec">{JSON.stringify(data ?? {}, null, 2)}</pre>
    </section>
  );
}`;
}

function buildHandlerModule(
  lookup: string,
  safeId: string,
  details: Partial<EaCInterfaceDetails>,
): string {
  const handlerComment = buildGuidanceComment('Page handler', details.PageHandler);
  const handlerCode = details.PageHandler?.Code?.trim()?.length
    ? details.PageHandler.Code.trimEnd()
    : buildDefaultHandlerCode(lookup, safeId);

  const segments = [
    '// deno-lint-ignore-file no-explicit-any',
    `import type { Interface${safeId}PageData } from "./types.ts";`,
    handlerComment,
    handlerCode,
  ].filter((segment) => segment && segment.trim().length > 0);

  return `${segments.join('\n\n')}\n`;
}

function buildDefaultHandlerCode(
  lookup: string,
  safeId: string,
): string {
  return `export async function loadPageData(
  _req: Request,
  _ctx: Record<string, unknown>,
): Promise<Interface${safeId}PageData> {
  return {
    message: "Implement loadPageData for the ${escapeTemplate(lookup)} interface.",
  };
}`;
}

function buildTypesModule(
  lookup: string,
  safeId: string,
  details: Partial<EaCInterfaceDetails>,
): string {
  const header = `// Page data contract for the "${escapeTemplate(lookup)}" interface.`;
  const schema = interfacePageDataToSchema(details.PageDataType);
  const expression = jsonSchemaToTypeExpression(schema);
  const typeDefinition = `export type Interface${safeId}PageData = ${expression};`;

  return `${header}\n${typeDefinition}\n`;
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
  ) => Promise<unknown> | unknown;
};

export type InterfacePageComponent = (props: { data?: unknown }) => JSX.Element;

export type InterfaceRegistryEntry = {
  lookup: string;
  Component: InterfacePageComponent;
  handlers: InterfaceHandlers;
  render: (req: Request, ctx: InterfaceRequestContext) => Promise<Response>;
};

function createEntry(
  component: InterfacePageComponent,
  handlers: InterfaceHandlers,
  lookup: string,
): InterfaceRegistryEntry {
  return {
    lookup,
    Component: component,
    handlers,
    render: async (req: Request, ctx: InterfaceRequestContext) => {
      const data = handlers.loadPageData
        ? await handlers.loadPageData(req, ctx)
        : undefined;

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
      `  "${
        escapeTemplate(lookup)
      }": createEntry(Interface${safeId}, Interface${safeId}Handlers, "${escapeTemplate(lookup)}"),`
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
