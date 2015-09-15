// Functions for building bluefruit app commands over BLE UART.

export function checksum8(data) {
  // Compute 8-bit checksum of the provided string and return it.
  let checksum = 0;
  for (let i=0; i<data.length; ++i) {
    checksum += data[i];
    checksum &= 0xff;
  }
  return ~checksum & 0xff;
}

export function buildCommand(type, data) {
  // Build a command from the specified command type (a character like 'C') and
  // array of command data (raw 8-bit uint values).  Returns the constructed
  // command as an array of 8-bit values that can be sent to the uartTx ipc event.
  let command = ['!'.charCodeAt(), type.charCodeAt()];
  if (data !== null) {
    command = command.concat(data);
  }
  command.push(checksum8(command));
  return command;
}
