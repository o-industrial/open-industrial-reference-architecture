/**
 * Configuration for sending data into the system via Azure IoT Hub.
 *
 * This connection is used by a device or agent to push data,
 * typically via MQTT or HTTPS using a device-scoped connection string.
 */
export type DataHubDataConnectionConfig = {
  /**
   * The device-scoped connection string used to push data into Azure IoT Hub.
   *
   * Example:
   * `HostName=your-iothub.azure-devices.net;DeviceId=...;SharedAccessKey=...`
   */
  DataHubIngestConnectionString: string;
};
