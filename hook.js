const fse = require('fs-extra');
const { optimus } = require('optimus');
const path = require('path');

function getPlatformPath() {
  switch (process.env.IONIC_CLI_HOOK_CTX_BUILD_PLATFORM) {
    case 'android':
      return path.join('platforms', 'android', 'platform_www');
    case 'ios':
      return path.join('platforms', 'ios', 'platform_www');
  }
}

function getPlatformBackupPath() {
  return `${getPlatformPath()}_backup`;
}

function isCordovaHook(environment) {
  return typeof environment.hook === 'string';
}

function isIonicHook(environment) {
  return typeof environment.name === 'string';
}

function shouldRunOptimus() {
  switch (process.env.IONIC_CLI_HOOK_CTX_BUILD_CONFIGURATION) {
    case 'production':
      return true;
  }
  return false;
}

async function backupPlatformDirectory() {
  const source = getPlatformPath();
  const backup = getPlatformBackupPath();

  // Create the backup
  await fse.copy(source, backup);
}

async function restorePlatformDirectory() {
  const source = getPlatformPath();
  const backup = getPlatformBackupPath();

  // Remove the modified source
  await fse.remove(source);

  // Restore the original source
  await fse.copy(backup, source);

  // Remove the backup
  await fse.remove(backup);
}

async function runCordovaHookBeforeBuild() {
  if (shouldRunOptimus()) {
    const sources = [
      path.join(process.env.IONIC_CLI_HOOK_CTX_BUILD_DIR, 'www'),
      path.join(process.env.IONIC_CLI_HOOK_CTX_BUILD_DIR, getPlatformPath()),
    ];

    // We need to backup the platform directory before we start
    await backupPlatformDirectory();

    // Run Optimus on all of our source directories
    await optimus(`{${sources.join(',')}}`);
  }
}

async function runCordovaHookAfterBuild() {
  if (shouldRunOptimus()) {
    // We need to restore the platform directory after we finish
    await restorePlatformDirectory();
  }
}

async function runCordovaHook(environment) {
  switch (environment.hook) {
    case 'before_build':
      return await runCordovaHookBeforeBuild();
    case 'after_build':
      return await runCordovaHookAfterBuild();
  }
}

function runIonicHook(environment) {
  // We need to save some environment variables that aren't available to Cordova hooks
  process.env.IONIC_CLI_HOOK_CTX_BUILD_DIR = environment.project.dir;
  process.env.IONIC_CLI_HOOK_CTX_BUILD_PLATFORM = environment.build.platform;
  process.env.IONIC_CLI_HOOK_CTX_BUILD_CONFIGURATION = environment.build.configuration;
}

async function hook(environment) {
  if (isCordovaHook(environment)) {
    return await runCordovaHook(environment);
  }
  if (isIonicHook(environment)) {
    return runIonicHook(environment);
  }
};

module.exports = {
  hook,
};
