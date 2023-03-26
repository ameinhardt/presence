/* eslint-disable eslint-comments/disable-enable-pair, no-console */
import { readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import minimist from 'minimist';

const { name, version } = JSON.parse(await readFile(new URL('package.json', import.meta.url), 'utf8')),
  argv = minimist(process.argv.slice(2), {
    alias: {
      h: 'help',
      v: 'version',
      c: 'check'
    },
    boolean: ['h', 'v', 'c']
  });

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const mode = process.env.NODE_ENV,
  environmentFiles = await Promise.all(
    [`.env.${mode}.local`, `.env.${mode}`, '.env.local', '.env']
      .map((file) => {
        const filePath = join(dirname(fileURLToPath(import.meta.url)), file);
        return stat(filePath)
          .then((stats) => stats.isFile() && filePath)
          .catch(() => false);
      })
  )
    .then((files) => files.filter(Boolean));

function printHelp() {
  console.info(`Usage: ${name} [options]

Options:
  -h, --help        print this help
  -c, --check       exits immediately with code indicating the health of the application on this host
  -v, --version     print version
  `);
}

if (argv.v) {
  console.info(`v${version}`);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(0);
} else if (argv.h || (argv.e && argv.i)) {
  printHelp();
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}

for (const file of environmentFiles) {
  config({
    path: file
  });
}

async function init() {
  const backend = await import(name);

  if (argv.c) {
    // healthserver client
    const healthport = Number.parseInt(process.env.HEALTHPORT, 10);
    if (Number.isNaN(healthport)) {
      throw new TypeError('no healthport defined in environment variables');
    }
    const http = await import('node:http');
    http.get(`http://localhost:${healthport}`, (response) => {
      response.resume();
      if (response.statusCode !== 200) {
        backend.logger.error('healthcheck failed');
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);
      }
    })
      .on('error', (error) => {
        backend.logger.error('healthcheck error', error); 4;
        throw error;
      });
  } else {
    backend.default(process.argv[2])

      .catch((error) => {
        backend.logger.error('backend start failed', error);
        throw error;
      });
  }
}

try {
  await init();
} catch (error) {
  console.error(error.message);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}
