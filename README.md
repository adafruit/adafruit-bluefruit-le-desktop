# Adafruit Bluefruit LE Desktop Application

Desktop application to interact with Bluefruit LE and other Bluetooth low energy
devices on Mac OSX, Windows, and Linux.  Allows you to connect to a BLE device,
view the services and characteristics, interact with a BLE UART, use a control
pad, color picker, and view orientation from a [BNO-055 sensor](https://www.adafruit.com/products/2472).
Created using [Electron](http://electron.atom.io/) and [noble](https://github.com/sandeepmistry/noble).

![Adafruit Bluefruit LE Application](/docs/app.png?raw=true)

Note that this program is currently in beta and might have bugs or issues.  Feel
free to raise problems you find as new issues on this repository!

# Installation

For ease of installation pre-built binary releases are available in the [releases](https://github.com/adafruit/adafruit-bluefruit-le-desktop/releases)
tab of this repository.  Pick the right binary for your platform, Windows x64 (win32-x64),
Mac OSX (darwin-x64), or Linux (linux-x64).  See below for more detailed install
instructions for each platform.

## Windows

Bluetooth low energy support has typically been problematic on Windows because of
a lack of APIs to access BLE devices.  However the [noble](https://github.com/sandeepmistry/noble)
library added support for Windows by talking directly to a USB BLE device and
working around the lack of BLE support in the OS.  This means the Adafruit
Bluefruit LE desktop app will *only* work with the following USB BLE adapters:

*   **[CSR8510](https://www.adafruit.com/products/1327)** (USB VID 0x0a12, PID 0x0001)
    - This is the recommended adapter and the only one that has been tested.
*   **BCM920702 Bluetooth 4.0**	(USB VID 0x0a5c, PID of 0x21e8)

Unfortunately any other BLE adapter, including one that might be built in to your
laptop or computer, will not work.  You must be using one of the USB BLE adapters
above.

You'll need to be running Windows 7 or greater to use the application.  Note that
only Windows 7 has been tested at the moment.

Once you have the USB BLE adapter you will need to use [Zadig tool](http://zadig.akeo.ie/)
to configure the device to use a WinUSB driver (note that Windows won't be able to
use the BLE adapter after making this change).  To use Zadig tool download it,
make sure your BLE adapter is plugged in, and run the program.  Then select the
**Options** -> **List All Devices** menu item:

![Zadig step 1](/docs/zadig1.png?raw=true)

Find the BLE adapter in the device drop down list, in this case a CSR8510, and
then select a WinUSB driver in the combobox on the right side of the green arrow.
Click the Replace Driver button like below:

![Zadig step 2](/docs/zadig2.png?raw=true)

Zadig tool will replace the driver for the device with a WinUSB driver.  When it
finishes you should see a successful install dialog like below:

![Zadig step 3](/docs/zadig3.png?raw=true)

You should now be ready to use the Bluefruit LE application.  Download the
latest win32-x64 release (sorry there is currently no 32-bit Windows binary
available yet) of the application from the
[releases](https://github.com/adafruit/adafruit-bluefruit-le-desktop/releases)
page. Unzip the archive and double click the able.exe inside to start the
application.

### Driver Uninstall

If you'd ever like to revert back to the normal driver for the BLE adapter you can
use device manager to find the device, right click it and select 'Uninstall' like
below:

![Zadig uninstall](/docs/zadig4.png?raw=true)

Be sure to check the **'Delete the driver software for this device.'** option so
the WinUSB driver is not installed again when the device is connected to the computer
(don't worry this won't delete the WinUSB driver from Zadig tool, you can always
use Zadig tool to setup the BLE adapter with WinUSB again).

## Mac OSX

On Mac OSX you only need to ensure your device supports Bluetooth 4.0/low
energy. Most MacBooks since ~2012 should have BLE support.  Then download the
latest darwin-x64 release of the application from the
[releases](https://github.com/adafruit/adafruit-bluefruit-le-desktop/releases)
page.  Unzip the archive and run the able application.

## Linux

On Linux you need to meet the requirements for [noble on Linux](https://github.com/sandeepmistry/noble#linux-ubuntu)
which include at least a Linux kernel version 3.6 or higher.  In addition you'll
want to ensure [bluez](http://www.bluez.org/) is installed.  On a Debian/Ubuntu
system make sure the following packages are installed:

    sudo apt-get install bluetooth bluez-utils libbluetooth-dev libudev-dev

Or on a Fedora or other RPM-based system install these packages:

    sudo yum install bluez bluez-libs

Then download the latest linux-x64 release of the application from the
[releases](https://github.com/adafruit/adafruit-bluefruit-le-desktop/releases)
page.  Unzip the archive, open a terminal, navigate to the location of the files
and run the able application.  Note that you should run the application as a root
user using sudo:

    sudo ./able

Also if you have multiple Bluetooth adapters the first one will be chosen (hci0).
You can set an explicit BLE adapter by following the [steps from the noble library](https://github.com/sandeepmistry/noble#multiple-adapters)
to set the NOBLE_HCI_DEVICE_ID environment variable, like to use hci1:

    sudo NOBLE_HCI_DEVICE_ID=1 ./able

# Compiling From Source

To build the application from its source you will need to setup your machine
to compile native node.js application code.  Be warned that this is a somewhat
involved process on platforms like Windows!  If you just want to run the application
grab one of the pre-built binaries from the [releases](https://github.com/adafruit/adafruit-bluefruit-le-desktop/releases).

First you will need [node.js](https://nodejs.org/en/) version 0.12.7 installed.
Later versions might work but have not been tested.  Node.js 4.0.0 is unfortunately
not yet supported by many of the native dependencies.

First follow **all** of the steps for [installing node-gyp to compile native modules for your platform](https://github.com/nodejs/node-gyp#installation).
On Linux you'll need to install a compiler toolchain from your package manager.
On Mac OSX you'll need to install the XCode command line tools.  On Windows you'll
need to install Visual Studio 2013 community edition, Python 2.7, and follow all
of the steps to setup environment variables, etc.  Do not move on until node-gyp
has been installed!

Next clone the repository for this application to get the latest source code.

**!! WINDOWS WARNING !!**

On Windows there is an unfortunate problem with node.js and npm where dependency
file paths can exceed the 255 character platform limits of Windows and fail to
install.  [The issue](https://github.com/nodejs/node-v0.x-archive/issues/6960)
has a long history but is unfortunately still a problem as of 2015.  The best way
to work around this issue is to install the source code into a subdirectory of
the C:\ drive, like under C:\able.  If you don't do this you will see cryptic
errors with missing modules during packaging of the application.

**!! WINDOWS WARNING !!**

Now install gulp to run the build scripts for the source:

    npm install -g gulp

Note on Ubuntu you probably need to use sudo when running npm install -g, see
[this issue](http://askubuntu.com/questions/376950/npm-installed-packages-are-not-accessible).
For other platforms like Mac OSX or Windows **do not** use sudo to run npm as root.

Install the dependencies for building the application by navigating to the folder
with the source and running the npm install command:

    npm install

Now you're ready to build the source using gulp commands.  To build a complete
package for your platform use the `package` command:

    gulp package

This will install the application dependencies, compile any native node modules
(being careful to ensure they are built to work with Electron), convert the
application's React JSX code to javascript, and then package everything up with
Electron.  After the package command finishes there will be a zip file created
for your platform, like able-darwin-x64-0.1.0-beta.zip for Mac OSX with version
0.1.0-beta of the code.  There will also be a folder created like able-darwin-x64,
and inside this folder is the contents of the zip file.

You can either run the packaged application code from the zip or folder above, or
you can run the unpackaged application code with Electron manually.  The unpackaged
application code will reside in the `app` subfolder, and it contains the following
folders:
*   assets - Binary assets for the application like icons, 3D models, etc.
*   css - Cascading style sheets used by Bootstrap & Bootswatch.
*   dist - ES6 and JSX source that has been 'compiled' to ES5 for Electron to run.
*   fonts - Fonts used by Bootstrap.
*   lib - Third party JavaScript libraries used by the application.

To run Electron against this app code you can use an Electron prebuilt binary
that is installed with the application dependencies.  From the application folder
run:

    ./node_modules/.bin/electron app

Note that you *must* use the Electron version installed by the application.  The
native dependencies of the app are compiled against a specific Electron version
and won't work with other versions!

Running Electron against the app code directly is useful if you're modifying the
code.  You can change the code and then run Electron with the app to test the changes
without having to package all the code up again.  However you will need to be careful
that if you change any JavaScript source code in the `src` directory you use the
gulp `js-build` command to 'compile' JSX and ES6 JavaScript code:

    gulp js-build

After the `js-build` command runs it will drop the compiled JavaScript in the
`app/dist` directory so you can run Electron against the app folder to see the
changes.

If you are modifying the code you will want to be aware that the code in the src
directory uses [ES6](https://github.com/lukehoban/es6features) and the
[React](https://facebook.github.io/react/) framework.  You will want to familiarize
yourself with [using React](https://facebook.github.io/react/docs/getting-started.html).
