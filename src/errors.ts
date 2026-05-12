export class ReadmeSmokeError extends Error {
  constructor(message: string, readonly code = 'READMESMOKE_ERROR') {
    super(message);
    this.name = 'ReadmeSmokeError';
  }
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
