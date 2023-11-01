// Forge Configuration
const path = require('path');
const rootDir = process.cwd();
const fs = require('fs');

module.exports = {
  hooks: {
    generateAssets: async () => {
      fs.writeFileSync(
        './env-prod.json',
        JSON.stringify({
          'REACT_APP_ADMIN_API': process.env.REACT_APP_ADMIN_API,
          'REACT_APP_ADMIN_API_WEB_SOCKET': process.env.REACT_APP_ADMIN_API_WEB_SOCKET,
        })
      );
    }
  },
  // Packager Config
  packagerConfig: {
    icon: path.join(rootDir, 'assets/images/logo.ico'),
    // Create asar archive for main, renderer process files
    asar: true,
    // Set executable name
    executableName: 'dainty',
    // Set application copyright
    appCopyright: 'Copyright (C) 2022 Wesage',
  },
  // Forge Makers
  makers: [
    {
      // Squirrel.Windows is a no-prompt, no-hassle, no-admin method of installing
      // Windows applications and is therefore the most user friendly you can get.
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'dainty',
        icon: path.join(rootDir, 'assets/images/logo.ico'),
      },
    },
    {
      // The Zip target builds basic .zip files containing your packaged application.
      // There are no platform specific dependencies for using this maker and it will run on any platform.
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      // The deb target builds .deb packages, which are the standard package format for Debian-based
      // Linux distributions such as Ubuntu.
      name: '@electron-forge/maker-deb',
      config: {
        name: 'dainty',
        icon: path.join(rootDir, 'assets/images/logo.ico'),
      },
    }
  ],
  // Forge Plugins
  plugins: [
    [
      // The Webpack plugin allows you to use standard Webpack tooling to compile both your main process code
      // and your renderer process code, with built in support for Hot Module Reloading in the renderer
      // process and support for multiple renderers.
      '@electron-forge/plugin-webpack',
      {
        // fix content-security-policy error when image or video src isn't same origin
        devContentSecurityPolicy: '',
        // Ports
        port: 3000, // Webpack Dev Server port
        loggerPort: 9001, // Logger port
        // Main process webpack configuration
        mainConfig: path.join(rootDir, 'tools/webpack/webpack.main.js'),
        // Renderer process webpack configuration
        renderer: {
          // Configuration file path
          config: path.join(rootDir, 'tools/webpack/webpack.renderer.js'),
          // Entrypoints of the application
          entryPoints: [
            {
              // Window process name
              name: 'app_window',
              // React Hot Module Replacement (HMR)
              rhmr: 'react-hot-loader/patch',
              // HTML index file template
              html: path.join(rootDir, 'src/renderer/app.html'),
              // Renderer
              js: path.join(rootDir, 'src/renderer/appRenderer.tsx'),
              // Main Window
              // Preload
              preload: {
                js: path.join(rootDir, 'src/renderer/appPreload.tsx'),
              },
            }
          ],
        },
        devServer: {
          liveReload: false,
        },
      },
    ],
  ],
};
