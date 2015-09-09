// Functions for building bluefruit app commands over BLE UART.

export function checksum8(data) {
  // Compute 8-bit checksum of the provided string and return it.
  let checksum = 0;
  for (let i=0; i<data.length; ++i) {
    checksum += data.charCodeAt(i);
    checksum &= 0xff;
  }
  return ~checksum & 0xff;
}

export function buildCommand(type, data) {
  // Build a string for the specified command type and provided command data.
  // Will return the command string.
  let command = '!' + type;
  if (data !== null) {
    command += data;
  }
  return command + String.fromCharCode(checksum8(command));
}
