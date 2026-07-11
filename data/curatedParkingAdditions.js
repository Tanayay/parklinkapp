// Additional ParkLink curated parking data.
// Kept outside /api so Vercel does not count this as a serverless function.

export const CURATED_BRAND_PARKING_RULES = [
  {
    id: 'mcdonalds',
    brand: "McDonald's",
    aliases: ['mcdonalds', "mcdonald's", 'mcdonald', 'mickey d', 'mickey ds'],
    defaultArea: 'Customer parking lot / drive-thru lot',
    defaultRestriction: "McDonald's customer parking; verify posted time limits, drive-thru lanes, and shared plaza rules.",
    estimatedCapacity: 35,
    source: 'ParkLink curated brand parking rule'
  },
  {
    id: 'chick-fil-a',
    brand: 'Chick-fil-A',
    aliases: ['chick-fil-a', 'chick fil a', 'chickfila', 'chick fil'],
    defaultArea: 'Customer parking lot / drive-thru lot',
    defaultRestriction: 'Chick-fil-A customer parking; verify posted time limits, drive-thru lanes, curbside pickup, and shared plaza rules.',
    estimatedCapacity: 45,
    source: 'ParkLink curated brand parking rule'
  }
];

export const CURATED_PARKING_ADDITIONS = [
  {
    id: 'cams-csudh',
    name: 'California Academy of Math and Science',
    type: 'school',
    aliases: ['cams', 'california academy of math and science', 'california academy of mathematics and science', 'cams high school'],
    center: { lat: 33.8646, lng: -118.2555 },
    source: 'ParkLink curated CAMS/CSUDH seed data',
    note: 'CAMS is at 1000 E Victoria St on the CSUDH campus area. Verify school and CSUDH posted rules.',
    areas: [
      { id: 'cams-main', name: 'CAMS Main Visitor Area', kind: 'school', lat: 33.8646, lng: -118.2555, address: '1000 E Victoria St, Carson, CA', restriction: 'Verify CAMS visitor/drop-off instructions.' },
      { id: 'cams-csudh-lot-1', name: 'CSUDH Lot 1', kind: 'lot', lat: 33.8660, lng: -118.2579, address: 'E Victoria St, Carson, CA', restriction: 'CSUDH permit/payment/event rules may apply.' },
      { id: 'cams-csudh-lot-2', name: 'CSUDH Lot 2', kind: 'lot', lat: 33.8648, lng: -118.2584, address: 'Toro Center Dr, Carson, CA', restriction: 'CSUDH permit/payment/event rules may apply.' },
      { id: 'cams-csudh-lot-3', name: 'CSUDH Lot 3', kind: 'lot', lat: 33.8630, lng: -118.2576, address: 'Toro Center Dr, Carson, CA', restriction: 'CSUDH permit/payment/event rules may apply.' },
      { id: 'cams-csudh-lot-6', name: 'CSUDH Lot 6', kind: 'lot', lat: 33.8654, lng: -118.2523, address: 'E Victoria St / Tamcliff Ave, Carson, CA', restriction: 'CSUDH permit/payment/event rules may apply.' }
    ]
  },
  {
    id: 'csudh',
    name: 'Cal State Dominguez Hills',
    type: 'campus',
    aliases: ['csudh', 'cal state dominguez hills', 'california state university dominguez hills', 'csu dominguez hills', 'dominguez hills'],
    center: { lat: 33.8648, lng: -118.2555 },
    source: 'ParkLink curated CSUDH seed data',
    note: 'CSUDH permit, visitor payment, and event rules may apply. Verify posted signs.',
    areas: [
      { id: 'csudh-lot-1', name: 'CSUDH Lot 1', kind: 'lot', lat: 33.8660, lng: -118.2579, address: 'E Victoria St, Carson, CA', restriction: 'CSUDH permit/payment/event rules may apply.' },
      { id: 'csudh-lot-2', name: 'CSUDH Lot 2', kind: 'lot', lat: 33.8648, lng: -118.2584, address: 'Toro Center Dr, Carson, CA', restriction: 'CSUDH permit/payment/event rules may apply.' },
      { id: 'csudh-lot-3', name: 'CSUDH Lot 3', kind: 'lot', lat: 33.8630, lng: -118.2576, address: 'Toro Center Dr, Carson, CA', restriction: 'CSUDH permit/payment/event rules may apply.' },
      { id: 'csudh-lot-4a', name: 'CSUDH Lot 4A', kind: 'lot', lat: 33.8662, lng: -118.2537, address: 'E Victoria St / Tamcliff Ave, Carson, CA', restriction: 'CSUDH permit/payment/event rules may apply.' },
      { id: 'csudh-lot-4b', name: 'CSUDH Lot 4B', kind: 'lot', lat: 33.8648, lng: -118.2532, address: 'Tamcliff Ave, Carson, CA', restriction: 'CSUDH permit/payment/event rules may apply.' },
      { id: 'csudh-lot-5', name: 'CSUDH Lot 5', kind: 'lot', lat: 33.8620, lng: -118.2531, address: 'Toro Center Dr, Carson, CA', restriction: 'CSUDH permit/payment/event rules may apply.' },
      { id: 'csudh-lot-6', name: 'CSUDH Lot 6', kind: 'lot', lat: 33.8654, lng: -118.2523, address: 'E Victoria St / Tamcliff Ave, Carson, CA', restriction: 'CSUDH permit/payment/event rules may apply.' }
    ]
  },
  {
    id: 'topgolf-el-segundo',
    name: 'Topgolf El Segundo',
    type: 'venue',
    aliases: ['topgolf', 'top golf', 'topgolf el segundo', 'top golf el segundo'],
    center: { lat: 33.9156, lng: -118.3951 },
    source: 'ParkLink curated Topgolf seed data',
    note: 'Topgolf customer, event, rideshare, and overflow rules may apply. Verify posted signs.',
    areas: [
      { id: 'topgolf-el-segundo-main', name: 'Main Lot — Topgolf El Segundo', kind: 'lot', lat: 33.9156, lng: -118.3951, address: '400 S Pacific Coast Hwy, El Segundo, CA', restriction: 'Topgolf customer parking. Verify signs and hours.' },
      { id: 'topgolf-el-segundo-overflow', name: 'Overflow / Shared Parking — Topgolf El Segundo', kind: 'lot', lat: 33.9166, lng: -118.3940, address: 'S Pacific Coast Hwy, El Segundo, CA', restriction: 'Use only if posted/open for Topgolf.' }
    ]
  },
  {
    id: 'topgolf-montebello',
    name: 'Topgolf Montebello',
    type: 'venue',
    aliases: ['topgolf', 'top golf', 'topgolf montebello', 'top golf montebello'],
    center: { lat: 34.0207, lng: -118.1110 },
    source: 'ParkLink curated Topgolf seed data',
    note: 'Topgolf customer, event, rideshare, and overflow rules may apply. Verify posted signs.',
    areas: [
      { id: 'topgolf-montebello-main', name: 'Main Lot — Topgolf Montebello', kind: 'lot', lat: 34.0207, lng: -118.1110, address: 'Montebello, CA', restriction: 'Topgolf customer parking. Verify signs and hours.' },
      { id: 'topgolf-montebello-overflow', name: 'Overflow / Event Parking — Topgolf Montebello', kind: 'lot', lat: 34.0217, lng: -118.1118, address: 'Montebello, CA', restriction: 'Verify overflow/event parking signs.' }
    ]
  },
  {
    id: 'topgolf-ontario',
    name: 'Topgolf Ontario',
    type: 'venue',
    aliases: ['topgolf', 'top golf', 'topgolf ontario', 'top golf ontario'],
    center: { lat: 34.0633, lng: -117.6509 },
    source: 'ParkLink curated Topgolf seed data',
    note: 'Topgolf customer, event, rideshare, and overflow rules may apply. Verify posted signs.',
    areas: [
      { id: 'topgolf-ontario-main', name: 'Main Lot — Topgolf Ontario', kind: 'lot', lat: 34.0633, lng: -117.6509, address: 'Ontario, CA', restriction: 'Topgolf customer parking. Verify signs and hours.' },
      { id: 'topgolf-ontario-overflow', name: 'Overflow / Event Parking — Topgolf Ontario', kind: 'lot', lat: 34.0643, lng: -117.6502, address: 'Ontario, CA', restriction: 'Verify overflow/event parking signs.' }
    ]
  }
];