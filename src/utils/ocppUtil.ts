import { OCPPErrorType } from 'types/ocpp/ocppCommon';

export class OCPPError implements Error {
  name: string;
  message: string;
  stack?: string | undefined;

  constructor(name: OCPPErrorType, message: string, stack?: string) {
    this.name = name;
    this.message = message;
    this.stack = stack;
  }
}

export function getClientId(url?: string): string | undefined {
  if (!url) return;

  const paths = url?.split('/');
  return paths[paths.length - 1];
}
