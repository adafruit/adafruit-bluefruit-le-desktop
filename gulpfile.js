// Load dependencies.
var del = require('del'),
    gulp = require('gulp'),
    babel = require("gulp-babel"),
    os = require('os'),
    packager = require('electron-packager'),
    replace = require('gulp-replace'),
    shell = require('gulp-run'),
    sourcemaps = require("gulp-sourcemaps"),
    zip = require('gulp-zip');

// Load the app package.json to read its version.
var app = require('./app/package.json')


// Global variables to control build and package.
var electronVersion = '0.30.4',
    packageName = 'able',
    fullName = 'Adafruit Bluefruit LE'
    platform = os.platform(),
    arch = os.arch(),
    appVersion = app.version;


function packageFullName() {
  // Return full package name including platform and architecture.
  // Note that this depends on how electron-packager outputs results
  // so you can't just change this algorithm.
  return packageName + '-' + platform + '-' + arch;
}

// Define tasks.
gulp.task('dist-clean', function() {
  // Delete any transformed javascript & JSX files.
  return del(['./app/dist/']);
});

gulp.task('js-build', ['dist-clean'], function() {
  // Convert all the ES6 & JSX files to plain ES5 using babel.
  return gulp.src(['src/**/*.jsx', 'src/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest('app/dist'));
});

gulp.task('dependency-clean', function() {
  // Delete the app's dependencies so they can be installed fresh again.
  return del(['./app/node_modules/']);
});

gulp.task('install-dependencies', ['dependency-clean'], function() {
  // Install the app's dependencies using npm.
  return shell('cd app && npm install').exec();
});

gulp.task('fix-node-usb', ['install-dependencies'], function() {
  // Mega hack to patch the node-usb module to not use node-pre-gyp by adding
  // the variables that node-pre-gyp normally adds.  This is necessary because
  // node-pre-gyp doesn't work with electron.  See this issue:
  //   https://github.com/mapbox/node-pre-gyp/issues/166
  // Only run this task on windows and linux where the bluetooth-hci-socket
  // module is used by noble.
  if (platform === 'win32' || platform === 'linux') {
    return gulp.src('app/node_modules/noble/node_modules/bluetooth-hci-socket/node_modules/usb/binding.gyp')
      .pipe(replace("'use_system_libusb%': 'false',", "'use_system_libusb%': 'false',\n'module_name': 'usb_bindings',\n'module_path': './src/binding',"))
      .pipe(gulp.dest('./app/node_modules/noble/node_modules/bluetooth-hci-socket/node_modules/usb/'));
  }
});

gulp.task('rebuild-usb', ['fix-node-usb'], function() {
  // Rebuild noble's usb module with the correct electron version.
  // Only run this task on windows and linux.
  if (platform === 'win32' || platform === 'linux') {
    return shell('cd app/node_modules/noble/node_modules/bluetooth-hci-socket/node_modules/usb && node-gyp rebuild --target=' + electronVersion + ' --dist-url=https://atom.io/download/atom-shell').exec();
  }
});

gulp.task('rebuild-bluetooth-hci-socket', ['rebuild-usb'], function() {
  // Rebuild noble's bluetooth-hci-socket module with the correct electron version.
  // Only run this task on windows and linux.
  if (platform === 'win32' || platform === 'linux') {
    return shell('cd app/node_modules/noble/node_modules/bluetooth-hci-socket && node-gyp rebuild --target=' + electronVersion + ' --dist-url=https://atom.io/download/atom-shell').exec();
  }
});

gulp.task('native-build', ['install-dependencies', 'rebuild-bluetooth-hci-socket'], function() {
  // Compile any native dependencies.
  // For windows this depends on a convoluted process to patch node-usb to not use
  // node-pre-gyp (since node-pre-gyp doesn't currently work with electron)
  // and then manually rebuild each native noble dependency for the right
  // electron version.  Gulp is horrible at representing this multi-step
  // syncronous process as it has to be encoded in the dependencies for this
  // task, therefore nothing needs to be done at this point for windows.
  if (platform === 'darwin') {
    // For Mac OSX just run electron-rebuild as it works fine on noble's OSX dependencies.
    return shell('electron-rebuild -v ' + electronVersion + ' -m ./app/node_modules/').exec();
  }
});

gulp.task('build', ['js-build', 'native-build'], function() {
  // Build task just kicks off a build of the JS source and native dependencies.
});

gulp.task('package-clean', function() {
  return del([packageFullName() + '.zip', packageFullName() + '/**/*']);
});

gulp.task('electron-package', ['package-clean', 'build'], function(cb) {
  // Package task uses electron-package to build the final app package.
  // Set general options.
  var opts = {
    dir: 'app',
    name: packageName,
    platform: platform,
    arch: arch,
    version: electronVersion,
    prune: true,
    overwrite: true,
    asar: true,
  };
  // Set platform-specific options.
  if (platform === 'darwin') {
    opts.icon = 'app/assets/adafruit.icns';
    opts['app-bundle-id'] = 'com.adafruit.BluefruitLE';
    opts['app-version'] = appVersion;
    opts['helper-bundle-id'] = 'com.adafruit.BluefruitLE.Helper';
  }
  else if (platform === 'win32') {
    opts.icon = 'app/assets/adafruit.ico';
    opts['version-string'] = {
      CompanyName: 'Adafruit',
      LegalCopyright: '2015',
      FileDescription: 'Adafruit Bluefruit LE application.',
      FileVersion: appVersion,
      OriginalFilename: packageName + '.exe',
      ProductVersion: appVersion,
      ProductName: fullName
    };
  }
  // Call packager.
  packager(opts, function(error, appPath) {
    if (error) {
      cb(error);
    }
    else {
      cb();
    }
  });
});

gulp.task('copy-license-readme', ['electron-package'], function() {
  // Copy the root LICENSE and README.md file into the application directory that will be zipped up.
  return gulp.src(['LICENSE', 'README.md'])
    .pipe(gulp.dest(packageFullName() + '/'));
});

gulp.task('package', ['copy-license-readme'], function() {
  // Zip up the built package.
  if (platform === 'darwin') {
    // For some reason zipping the app on OSX is broken because of gulp.src
    // not following symlinks.  Just invoke the zip command line tool.
    return shell('zip -r ' + packageFullName() + '-' + appVersion + '.zip ' + packageFullName() + '/').exec();
  }
  else {
    // Use gulp-zip to zip up the app.
    return gulp.src(packageFullName() + '/**/*')
      .pipe(zip(packageFullName() + '-' + appVersion + '.zip'))
      .pipe(gulp.dest('.'));
  }
});
