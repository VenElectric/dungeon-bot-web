// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isError(error: any): boolean {
  return error instanceof Error;
}
