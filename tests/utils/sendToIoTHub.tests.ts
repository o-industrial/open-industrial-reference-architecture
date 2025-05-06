// import { sendToIoTHub } from '../../src/utils/sendToIoTHub.ts';
// import { assert, assertExists } from '../tests.deps.ts';

// Deno.test('sendToIoTHub - integration with Azure IoT Hub', async () => {
//   const connStr = Deno.env.get('AZURE_IOTHUB_DEVICE_CONNECTION_STRING');

//   if (!connStr) {
//     console.warn('[SKIPPED] AZURE_IOTHUB_DEVICE_CONNECTION_STRING not set');
//     return;
//   }

//   const payload = {
//     temperature: 22.5,
//     humidity: 60,
//     sentAt: new Date().toISOString(),
//   };

//   const result = await sendToIoTHub(connStr, payload);

//   console.log('[Azure IoT SDK result]', result);

//   assertExists(result); // Might be undefined or a status object
//   assert(typeof result === 'object' || typeof result === 'string');
// });
