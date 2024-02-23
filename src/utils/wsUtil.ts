import { OutgoingHttpHeaders } from 'http';
import internal from 'stream';
import { StatusCodes, StatusCodesKey } from '../types/server';

/**
 * Helper function to cancel handshake process and send error response
 * @param socket connection socket
 * @param code HTTP status code
 * @param message Error message
 * @param headers HTTP headers
 */

export function abortHandshake(
  socket: internal.Duplex,
  code: StatusCodesKey,
  message?: string,
  headers?: OutgoingHttpHeaders,
) {
  const contentLength = message || StatusCodes[code];

  if (socket.writable && contentLength) {
    const headersOut: OutgoingHttpHeaders = {
      Connection: 'close',
      'Content-Type': 'text/html',
      'Content-Length': Buffer.byteLength(contentLength),
      ...headers,
    };

    socket.write(
      `HTTP/1.1 ${code} ${StatusCodes[code]}\r\n` +
        Object.keys(headersOut)
          .map((h) => `${h}: ${headersOut[h]}`)
          .join('\r\n') +
        '\r\n\r\n' +
        message,
    );
  }

  socket.removeAllListeners('error');
  socket.destroy();
}
