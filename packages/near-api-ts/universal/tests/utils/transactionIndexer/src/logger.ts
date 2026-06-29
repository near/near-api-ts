import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pino from 'pino';

const logsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'logs');

// One log file per day. Each line is JSONL (easy to grep/filter across millions
// of records), mirrored to stdout so a run stays visible in the terminal too.
export const createDayLogger = (day: string) => {
  mkdirSync(logsDir, { recursive: true });

  const fileStream = pino.destination({
    dest: path.join(logsDir, `${day}.log`),
    append: true,
    sync: false,
  });

  const logger = pino(
    { level: 'info', base: { day } },
    pino.multistream([{ stream: fileStream }, { stream: process.stdout }]),
  );

  // Guarantee the file is fully written before we move on to the next day.
  const close = () => fileStream.flushSync();

  return { logger, close };
};
