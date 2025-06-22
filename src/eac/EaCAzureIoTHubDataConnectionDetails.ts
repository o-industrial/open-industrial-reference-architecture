import { z } from './.deps.ts';
import {
  EaCDataConnectionDetails,
  EaCDataConnectionDetailsSchema,
} from './EaCDataConnectionDetails.ts';

/**
 * Represents the details for an Azure IoT Hub-based Data Connection in EaC.
 */
export type EaCAzureIoTHubDataConnectionDetails = {
  Type: 'AzureIoTHub';

  // /** The full connection string used to access the Azure IoT Hub. */
  // ConnectionString: string;

  /** The name of the device to route messages for. */
  DeviceID: string;

  /** Whether the device is setup as an Azure IoT Edge device or not. */
  IsIoTEdge?: boolean;

  /** Azure subscription ID for resource provisioning. */
  SubscriptionID?: string;

  /** Azure resource group where the IoT Hub is located. */
  ResourceGroupName?: string;

  /** IoT Hub name override. */
  IoTHubName?: string;
} & EaCDataConnectionDetails<'AzureIoTHub'>;

/**
 * Schema for validating EaCAzureIoTHubDataConnectionDetails.
 */
export const EaCAzureIoTHubDataConnectionDetailsSchema: z.ZodObject<
  z.objectUtil.extendShape<
    typeof EaCDataConnectionDetailsSchema.shape,
    {
      Type: z.ZodLiteral<'AzureIoTHub'>;
      // ConnectionString: z.ZodString;
      DeviceID: z.ZodString;
      IsIoTEdge: z.ZodOptional<z.ZodBoolean>;
      IoTHubName: z.ZodOptional<z.ZodString>;
      ResourceGroupName: z.ZodOptional<z.ZodString>;
      SubscriptionID: z.ZodOptional<z.ZodString>;
    }
  >
> = EaCDataConnectionDetailsSchema.extend({
  Type: z.literal('AzureIoTHub'),
  // ConnectionString: z.string().describe('Azure IoT Hub connection string.'),
  DeviceID: z.string().describe('Target device identifier in IoT Hub.'),
  IsIoTEdge: z
    .boolean()
    .optional()
    .describe('Whether the device is an IoT Edge device.'),

  SubscriptionID: z.string().optional().describe('Azure Subscription ID.'),
  ResourceGroupName: z
    .string()
    .optional()
    .describe('Azure Resource Group name.'),
  IoTHubName: z.string().optional().describe('Optional IoT Hub name override.'),
}).describe('Schema for Azure IoT Hub-based Data Connection Details');

/**
 * Type guard to validate whether a given object is an EaCAzureIoTHubDataConnectionDetails.
 */
export function isEaCAzureIoTHubDataConnectionDetails(
  conn: unknown
): conn is EaCAzureIoTHubDataConnectionDetails {
  return EaCAzureIoTHubDataConnectionDetailsSchema.safeParse(conn).success;
}

/**
 * Parses and validates the provided data as EaCAzureIoTHubDataConnectionDetails.
 */
export function parseEaCAzureIoTHubDataConnectionDetails(
  conn: unknown
): EaCAzureIoTHubDataConnectionDetails {
  return EaCAzureIoTHubDataConnectionDetailsSchema.parse(conn);
}
