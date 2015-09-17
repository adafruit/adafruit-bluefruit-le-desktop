# Adafruit Bluefruit LE Desktop Application

Desktop application to interact with Bluefruit LE and other Bluetooth low energy
devices on Mac OSX, Windows, and Linux.  Allows you to connect to a BLE device,
view the services and characteristics, interact with a BLE UART, use a control
pad, color picker, and view orientation from a [BNO-055 sensor](https://www.adafruit.com/products/2472).
Created using [Electron](http://electron.atom.io/) and [noble](https://github.com/sandeepmistry/noble).

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
