export enum IntentTypes {
  None = 0,
  Primary = 1 << 0,
  Secondary = 1 << 1,
  Tertiary = 1 << 2,
  Warning = 1 << 3,
  Info = 1 << 4,
  Error = 1 << 5,
}
