import { africaTimezones } from './timezones-africa';
import { americaTimezones } from './timezones-america';
import { americaTimezones2 } from './timezones-america2';
import { americaTimezones3 } from './timezones-america3';
import { antarcticaTimezones } from './timezones-antarctica';
import { arcticTimezones } from './timezones-arctic';
import { asiaTimezones } from './timezones-asia';
import { asiaTimezones2 } from './timezones-asia2';
import { atlanticTimezones } from './timezones-atlantic';
import { australiaTimezones } from './timezones-australia';
import { europeTimezones } from './timezones-europe';
import { europeTimezones2 } from './timezones-europe2';
import { indianTimezones } from './timezones-indian';
import { pacificTimezones } from './timezones-pacific';

export interface TimeZone {
  name: string;
  offset: string;
  value: string;
}

// UTC timezone
export const utcTimezone: TimeZone = { name: 'UTC', offset: '+00:00', value: 'UTC' };

// Group all timezones by region
export const timeZonesByRegion = {
  UTC: [utcTimezone],
  Africa: africaTimezones,
  America: [...americaTimezones, ...americaTimezones2, ...americaTimezones3],
  Antarctica: antarcticaTimezones,
  Arctic: arcticTimezones,
  Asia: [...asiaTimezones, ...asiaTimezones2],
  Atlantic: atlanticTimezones,
  Australia: australiaTimezones,
  Europe: [...europeTimezones, ...europeTimezones2],
  Indian: indianTimezones,
  Pacific: pacificTimezones
};

// Flatten all timezones into a single array
export const allTimeZones: TimeZone[] = [
  utcTimezone,
  ...africaTimezones,
  ...americaTimezones,
  ...americaTimezones2,
  ...americaTimezones3,
  ...antarcticaTimezones,
  ...arcticTimezones,
  ...asiaTimezones,
  ...asiaTimezones2,
  ...atlanticTimezones,
  ...australiaTimezones,
  ...europeTimezones,
  ...europeTimezones2,
  ...indianTimezones,
  ...pacificTimezones
];
