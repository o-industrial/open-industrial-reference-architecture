export async function shaHash(
  WorkspaceLookup: string,
  id: string,
): Promise<string> {
  return await crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(`${WorkspaceLookup}:${id}`))
    .then((buf) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
    );
}
