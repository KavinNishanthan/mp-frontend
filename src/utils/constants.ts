export const APP_NAME = 'Kodai Diary Distributor';

export const ROLES = {
  ADMIN: 'admin',
  DRIVER: 'driver',
} as const;

export const TRANSFER_TYPES = [
  { label: 'Warehouse to Vehicle', value: 'WAREHOUSE_TO_VEHICLE' },
  { label: 'Vehicle to Warehouse', value: 'VEHICLE_TO_WAREHOUSE' },
  { label: 'Factory to Warehouse', value: 'FACTORY_TO_WAREHOUSE' },
] as const;

export const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'All Time', value: 'allTime' },
  { label: 'Custom', value: 'custom' },
] as const;
