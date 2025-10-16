// deno-lint-ignore-file no-explicit-any no-explicit-any
import type { JSONSchema7 } from './.deps.ts';
import type { EaCInterfacePageDataType } from '../eac/EaCInterfaceDetails.ts';

type ConversionOptions = {
  indent?: string;
};

const DEFAULT_INDENT = '  ';

type ConversionContext = {
  indentUnit: string;
  seen: WeakSet<object>;
  level: number;
};

export function jsonSchemaToTypeExpression(
  schema: JSONSchema7 | boolean | undefined,
  options: ConversionOptions = {},
): string {
  const indentUnit = options.indent ?? DEFAULT_INDENT;
  return convertSchema(schema, {
    indentUnit,
    seen: new WeakSet<object>(),
    level: 0,
  });
}

function convertSchema(
  schema: JSONSchema7 | boolean | undefined,
  ctx: ConversionContext,
): string {
  if (schema === undefined) return 'Record<string, unknown>';
  if (schema === true) return 'Record<string, unknown>';
  if (schema === false) return 'never';

  const schemaObj = schema as any;

  if (typeof schemaObj.$ref === 'string') {
    return 'unknown';
  }

  if (schemaObj.const !== undefined) {
    return literalToType(schemaObj.const);
  }

  if (Array.isArray(schemaObj.enum) && schemaObj.enum.length > 0) {
    const literals = schemaObj.enum.map((entry: unknown) => literalToType(entry));
    return uniqueUnion(literals);
  }

  if (Array.isArray(schemaObj.anyOf) && schemaObj.anyOf.length > 0) {
    return uniqueUnion(
      schemaObj.anyOf.map((entry: JSONSchema7 | boolean) => convertSchema(entry, ctx)),
    );
  }

  if (Array.isArray(schemaObj.oneOf) && schemaObj.oneOf.length > 0) {
    return uniqueUnion(
      schemaObj.oneOf.map((entry: JSONSchema7 | boolean) => convertSchema(entry, ctx)),
    );
  }

  if (Array.isArray(schemaObj.allOf) && schemaObj.allOf.length > 0) {
    const segments = schemaObj.allOf.map((entry: JSONSchema7 | boolean) =>
      convertSchema(entry, ctx)
    );
    return segments.join(' & ');
  }

  const type = schemaObj.type;

  if (Array.isArray(type) && type.length > 0) {
    return uniqueUnion(
      type.map((entry: string) => convertSchema({ ...schemaObj, type: entry }, ctx)),
    );
  }

  switch (type) {
    case 'string':
      return 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    case 'array':
      return convertArraySchema(schemaObj, ctx);
    case 'object':
      return convertObjectSchema(schemaObj, ctx);
    default:
      break;
  }

  if (schemaObj.properties || schemaObj.required) {
    return convertObjectSchema(schemaObj, ctx);
  }

  if (schemaObj.items || schemaObj.prefixItems) {
    return convertArraySchema(schemaObj, ctx);
  }

  return 'Record<string, unknown>';
}

function convertArraySchema(schema: any, ctx: ConversionContext): string {
  const items = schema.items ?? schema.prefixItems;

  if (Array.isArray(items) && items.length > 0) {
    const tupleItems = items.map((entry: JSONSchema7 | boolean) =>
      convertSchema(entry, nextLevel(ctx))
    );
    const additional = schema.additionalItems;

    if (additional === false || additional === undefined) {
      return `[${tupleItems.join(', ')}]`;
    }

    const additionalType = convertSchema(additional as JSONSchema7 | boolean, nextLevel(ctx));
    return `[${tupleItems.join(', ')}, ...${wrapArrayType(additionalType)}]`;
  }

  if (items) {
    const itemType = convertSchema(items as JSONSchema7 | boolean, nextLevel(ctx));
    return wrapArrayType(itemType);
  }

  return 'Array<unknown>';
}

function convertObjectSchema(schema: any, ctx: ConversionContext): string {
  if (ctx.seen.has(schema)) {
    return 'Record<string, unknown>';
  }

  ctx.seen.add(schema);
  const indent = ctx.indentUnit;
  const nextCtx = nextLevel(ctx);
  const required = new Set<string>(schema.required ?? []);
  const properties: Record<string, JSONSchema7 | boolean | undefined> = schema.properties ?? {};
  const orderedKeys = Object.keys(properties).sort();

  const lines: string[] = [];

  for (const key of orderedKeys) {
    const definition = properties[key];
    const propertyType = convertSchema(definition, nextCtx);
    const isRequired = required.has(key);
    const propLine = `${indent.repeat(nextCtx.level)}${formatPropertyKey(key)}` +
      `${isRequired ? '' : '?'}: ${propertyType};`;
    lines.push(propLine);
  }

  if (schema.additionalProperties !== undefined) {
    const additionalType = schema.additionalProperties === true
      ? 'unknown'
      : schema.additionalProperties === false
      ? undefined
      : convertSchema(schema.additionalProperties as JSONSchema7 | boolean, nextCtx);

    if (additionalType) {
      lines.push(`${indent.repeat(nextCtx.level)}[key: string]: ${additionalType};`);
    }
  }

  if (schema.patternProperties) {
    for (
      const [pattern, definition] of Object.entries(
        schema.patternProperties as Record<string, JSONSchema7 | boolean>,
      )
    ) {
      const patternType = convertSchema(definition, nextCtx);
      lines.push(
        `${indent.repeat(nextCtx.level)}[key: string /* /${pattern}/ */]: ${patternType};`,
      );
    }
  }

  if (lines.length === 0) {
    return 'Record<string, unknown>';
  }

  return `{
${lines.join('\n')}
${indent.repeat(ctx.level)}}`;
}

function literalToType(value: unknown): string {
  switch (typeof value) {
    case 'string':
      return JSON.stringify(value);
    case 'number':
      return Number.isFinite(value) ? value.toString() : 'number';
    case 'boolean':
      return value ? 'true' : 'false';
    case 'object':
      if (value === null) return 'null';
      return 'Record<string, unknown>';
    default:
      return 'unknown';
  }
}

function uniqueUnion(values: string[]): string {
  const unique = Array.from(new Set(values.filter(Boolean)));
  if (unique.length === 0) return 'unknown';
  if (unique.length === 1) return unique[0];
  return unique.join(' | ');
}

function wrapArrayType(itemType: string): string {
  if (needsParen(itemType)) {
    return `Array<${itemType}>`;
  }
  return `${itemType}[]`;
}

function needsParen(typeExpression: string): boolean {
  return typeExpression.includes('|') || typeExpression.includes('&') ||
    typeExpression.startsWith('{');
}

function formatPropertyKey(key: string): string {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : JSON.stringify(key);
}

function nextLevel(ctx: ConversionContext): ConversionContext {
  return {
    ...ctx,
    level: ctx.level + 1,
  };
}

export function interfacePageDataToSchema(
  pageData: EaCInterfacePageDataType | undefined,
): JSONSchema7 {
  const segments: JSONSchema7[] = [];

  if (pageData) {
    const generatedSlices = Object.values(pageData.Generated ?? {});
    for (const slice of generatedSlices) {
      if (!slice || slice.Enabled === false) continue;
      segments.push(cloneJsonSchema(slice.Schema));
    }
  }

  if (segments.length === 0) {
    return {
      type: 'object',
      additionalProperties: true,
    };
  }

  if (segments.length === 1) {
    return segments[0];
  }

  return {
    allOf: segments,
  } as JSONSchema7;
}

function cloneJsonSchema(schema: JSONSchema7): JSONSchema7 {
  return JSON.parse(JSON.stringify(schema)) as JSONSchema7;
}
