/* eslint-disable camelcase */
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import favicons from 'favicons';
import { loadEnv } from 'vite';

const cwd = path.dirname(fileURLToPath(import.meta.url)),
  destination = path.resolve(cwd, './public/icons/favicons'),
  htmlFile = path.resolve(cwd, './index.html'),
  packageJson = JSON.parse(await readFile(path.resolve(cwd, 'package.json'), 'utf8')),
  environment = loadEnv('production', cwd, ''),
  source = 'public/icons/logo.svg',
  configuration = {
    path: '/icons/favicons',
    appName: packageJson.title,
    appDescription: packageJson.description,
    developerName: packageJson.author,
    background: '#fff',
    theme_color: '#fff',
    appleStatusBarStyle: 'black-translucent',
    display: 'standalone',
    scope: environment.BASE_URL ?? '/',
    start_url: '/',
    version: packageJson.version, // Your application's version string. `string`
    manifestMaskable: true,
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: false,
      favicons: true,
      windows: false,
      yandex: false
    }
  };

try {
  const response = await favicons(source, configuration);
  await rm(destination, { recursive: true, force: true });
  await mkdir(destination, { recursive: true });
  await Promise.all(
    response.images.map(
      (image) => writeFile(path.join(destination, image.name), image.contents)
    )
  );
  const oldHtml = await readFile(htmlFile, 'utf8'),
    newHtml = oldHtml
      .replace(/(<!-- icons start -->).*(<!-- icons end -->)/s, `$1\n    ${
        response.html
          .filter((line) => !line.startsWith('<link rel="manifest"'))
          .join('\n    ')
      }\n    $2`);
  if (newHtml !== oldHtml) {
    await writeFile(htmlFile, newHtml);
    console.info('favicon: written html file', htmlFile);
  } else {
    console.info('favicon: no change');
  }
} catch (error) {
  console.error(error.message);
}
/* eslint-enable camelcase */
