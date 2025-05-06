import { Client, Message, Mqtt } from './.deps.ts';

/**
 * Sends telemetry to Azure IoT Hub using the provided connection string.
 *
 * @param connectionString - Device-scoped connection string
 * @param payload - JSON-serializable telemetry to send
 * @returns Promise resolving with the result of the send operation
 */
export function sendToIoTHub(
  connectionString: string,
  payload: unknown,
): Promise<unknown> {
  const client = Client.fromConnectionString(connectionString, Mqtt);

  return new Promise((resolve, reject) => {
    client.open((err) => {
      if (err) return reject(err);

      const message = new Message(JSON.stringify(payload));

      client.sendEvent(message, (err, res) => {
        client.close(); // always close after sending

        if (err) reject(err);
        else resolve(res);
      });
    });
  });
}
