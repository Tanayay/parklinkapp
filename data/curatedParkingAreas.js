// ParkLink curated parking areas
// Keep this file OUTSIDE /api so Vercel does not count it as another serverless function.
// Add new campuses, malls, venues, and city lots here.
// Coordinates are used for sorting/walking estimates. Restrictions must still be verified on posted signs.

export const CURATED_PARKING_AREAS = [
  {
    id: 'cpp',
    name: 'Cal Poly Pomona',
    type: 'campus',
    aliases: ['cpp', 'cal poly pomona', 'california state polytechnic university pomona', 'cal poly'],
    center: { lat: 34.0567, lng: -117.8215 },
    source: 'ParkLink curated campus seed data',
    note: 'Campus permit, visitor payment, and event rules may apply. Verify CPP Transportation & Parking Services signs.',
    areas: [
      { id: 'cpp-lot-2', name: 'Cal Poly Pomona Lot 2', kind: 'lot', lat: 34.05945, lng: -117.82192, address: 'University Dr, Pomona, CA', restriction: 'CPP permit/payment rules may apply.' },
      { id: 'cpp-lot-q', name: 'Cal Poly Pomona Lot Q', kind: 'lot', lat: 34.05372, lng: -117.81598, address: 'South Campus Dr, Pomona, CA', restriction: 'CPP permit/payment rules may apply.' },
      { id: 'cpp-lot-m', name: 'Cal Poly Pomona Lot M', kind: 'lot', lat: 34.05215, lng: -117.82060, address: 'Temple Ave, Pomona, CA', restriction: 'CPP permit/payment rules may apply.' },
      { id: 'cpp-lot-b', name: 'Cal Poly Pomona Lot B', kind: 'lot', lat: 34.06105, lng: -117.82355, address: 'University Dr, Pomona, CA', restriction: 'CPP permit/payment rules may apply.' },
      { id: 'cpp-lot-c', name: 'Cal Poly Pomona Lot C', kind: 'lot', lat: 34.06155, lng: -117.82050, address: 'University Dr, Pomona, CA', restriction: 'CPP permit/payment rules may apply.' },
      { id: 'cpp-lot-e', name: 'Cal Poly Pomona Lot E', kind: 'lot', lat: 34.05895, lng: -117.81590, address: 'South Campus Dr, Pomona, CA', restriction: 'CPP permit/payment rules may apply.' },
      { id: 'cpp-lot-f', name: 'Cal Poly Pomona Lot F', kind: 'lot', lat: 34.05715, lng: -117.81495, address: 'South Campus Dr, Pomona, CA', restriction: 'CPP permit/payment rules may apply.' },
      { id: 'cpp-lot-j', name: 'Cal Poly Pomona Lot J', kind: 'lot', lat: 34.05285, lng: -117.82480, address: 'Temple Ave, Pomona, CA', restriction: 'CPP permit/payment rules may apply.' },
      { id: 'cpp-ps1', name: 'Cal Poly Pomona Parking Structure 1', kind: 'structure', lat: 34.05720, lng: -117.82755, address: 'Kellogg Dr, Pomona, CA', restriction: 'CPP permit/payment rules may apply.' },
      { id: 'cpp-ps2', name: 'Cal Poly Pomona Parking Structure 2', kind: 'structure', lat: 34.05495, lng: -117.82470, address: 'Temple Ave, Pomona, CA', restriction: 'CPP permit/payment rules may apply.' }
    ]
  },
  {
    id: 'ucr',
    name: 'UC Riverside',
    type: 'campus',
    aliases: ['ucr', 'uc riverside', 'university of california riverside'],
    center: { lat: 33.9737, lng: -117.3281 },
    source: 'ParkLink curated campus seed data',
    note: 'UCR permit, visitor payment, housing, and event rules may apply. Verify posted signs and UCR Transportation Services.',
    areas: [
      { id: 'ucr-big-springs', name: 'UCR Big Springs Parking Structure', kind: 'structure', lat: 33.9760, lng: -117.3256, address: 'Big Springs Rd, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-1', name: 'UCR Lot 1', kind: 'lot', lat: 33.9751, lng: -117.3310, address: 'University Ave, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-6', name: 'UCR Lot 6', kind: 'lot', lat: 33.9725, lng: -117.3264, address: 'E Campus Dr, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-13', name: 'UCR Lot 13', kind: 'lot', lat: 33.9781, lng: -117.3263, address: 'W Linden St, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-19', name: 'UCR Lot 19', kind: 'lot', lat: 33.9705, lng: -117.3305, address: 'W Campus Dr, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-21', name: 'UCR Lot 21', kind: 'lot', lat: 33.9710, lng: -117.3241, address: 'Canyon Crest Dr, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-23', name: 'UCR Lot 23', kind: 'lot', lat: 33.9754, lng: -117.3236, address: 'E Campus Dr, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-24', name: 'UCR Lot 24', kind: 'lot', lat: 33.9771, lng: -117.3231, address: 'E Campus Dr, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-26', name: 'UCR Lot 26', kind: 'lot', lat: 33.9788, lng: -117.3247, address: 'Linden St, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-30', name: 'UCR Lot 30', kind: 'lot', lat: 33.9820, lng: -117.3275, address: 'Martin Luther King Blvd, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-32', name: 'UCR Lot 32', kind: 'lot', lat: 33.9807, lng: -117.3315, address: 'Blaine St, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-44', name: 'UCR Lot 44', kind: 'lot', lat: 33.9693, lng: -117.3247, address: 'Canyon Crest Dr, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-50', name: 'UCR Lot 50', kind: 'lot', lat: 33.9815, lng: -117.3214, address: 'Linden St, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-51', name: 'UCR Lot 51', kind: 'lot', lat: 33.9800, lng: -117.3207, address: 'Linden St, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' },
      { id: 'ucr-lot-52', name: 'UCR Lot 52', kind: 'lot', lat: 33.9788, lng: -117.3201, address: 'Linden St, Riverside, CA', restriction: 'UCR permit/payment rules may apply.' }
    ]
  },
  {
    id: 'ucsd',
    name: 'UC San Diego',
    type: 'campus',
    aliases: ['ucsd', 'uc san diego', 'university of california san diego'],
    center: { lat: 32.8801, lng: -117.2340 },
    source: 'ParkLink curated campus seed data',
    note: 'UCSD permit, visitor payment, resident, patient, and event rules may apply. Verify UCSD Transportation signs.',
    areas: [
      { id: 'ucsd-gilman', name: 'UCSD Gilman Parking Structure', kind: 'structure', lat: 32.8783, lng: -117.2350, address: 'Gilman Dr, La Jolla, CA', restriction: 'UCSD permit/payment rules may apply.' },
      { id: 'ucsd-hopkins', name: 'UCSD Hopkins Parking Structure', kind: 'structure', lat: 32.8857, lng: -117.2401, address: 'Hopkins Dr, La Jolla, CA', restriction: 'UCSD permit/payment rules may apply.' },
      { id: 'ucsd-osler', name: 'UCSD Osler Parking Structure', kind: 'structure', lat: 32.8736, lng: -117.2368, address: 'Osler Ln, La Jolla, CA', restriction: 'UCSD permit/payment rules may apply.' },
      { id: 'ucsd-pangea', name: 'UCSD Pangea Parking Structure', kind: 'structure', lat: 32.8792, lng: -117.2441, address: 'Pangea Dr, La Jolla, CA', restriction: 'UCSD permit/payment rules may apply.' },
      { id: 'ucsd-scholars', name: 'UCSD Scholars Parking Structure', kind: 'structure', lat: 32.8862, lng: -117.2415, address: 'Scholars Dr N, La Jolla, CA', restriction: 'UCSD permit/payment rules may apply.' },
      { id: 'ucsd-sixth', name: 'UCSD Sixth College Parking Structure', kind: 'structure', lat: 32.8804, lng: -117.2424, address: 'Sixth College, La Jolla, CA', restriction: 'UCSD permit/payment rules may apply.' },
      { id: 'ucsd-athena', name: 'UCSD Athena Parking Structure', kind: 'structure', lat: 32.8797, lng: -117.2329, address: 'Athena Way, La Jolla, CA', restriction: 'UCSD permit/payment rules may apply.' },
      { id: 'ucsd-south', name: 'UCSD South Parking Structure', kind: 'structure', lat: 32.8716, lng: -117.2355, address: 'La Jolla, CA', restriction: 'UCSD permit/payment rules may apply.' },
      { id: 'ucsd-regents', name: 'UCSD Regents Parking', kind: 'lot', lat: 32.8692, lng: -117.2222, address: 'Regents Rd, La Jolla, CA', restriction: 'UCSD permit/payment rules may apply.' }
    ]
  },
  {
    id: 'del-amo-fashion-center',
    name: 'Del Amo Fashion Center',
    type: 'mall',
    aliases: ['del amo', 'del amo mall', 'del amo fashion center'],
    center: { lat: 33.8346, lng: -118.3503 },
    source: 'ParkLink curated mall seed data',
    note: 'Mall parking rules, valet areas, store hours, and event/security restrictions may apply. Verify posted signs.',
    areas: [
      { id: 'delamo-fashion-wing', name: 'Del Amo Fashion Wing Parking', kind: 'lot', lat: 33.8367, lng: -118.3529, address: 'Hawthorne Blvd / Carson St, Torrance, CA', restriction: 'Mall parking. Verify posted signs and store/event restrictions.' },
      { id: 'delamo-nordstrom', name: 'Del Amo Nordstrom Parking', kind: 'lot', lat: 33.8380, lng: -118.3520, address: 'Fashion Way, Torrance, CA', restriction: 'Mall parking. Verify posted signs.' },
      { id: 'delamo-macys-north', name: "Del Amo Macy's North Parking", kind: 'lot', lat: 33.8376, lng: -118.3484, address: 'Carson St, Torrance, CA', restriction: 'Mall parking. Verify posted signs.' },
      { id: 'delamo-macys-south', name: "Del Amo Macy's South Parking", kind: 'lot', lat: 33.8305, lng: -118.3515, address: 'Sepulveda Blvd, Torrance, CA', restriction: 'Mall parking. Verify posted signs.' },
      { id: 'delamo-jcpenney', name: 'Del Amo JCPenney Parking', kind: 'lot', lat: 33.8328, lng: -118.3471, address: 'Sepulveda Blvd / Madrona Ave, Torrance, CA', restriction: 'Mall parking. Verify posted signs.' },
      { id: 'delamo-dicks', name: "Del Amo Dick's Sporting Goods Parking", kind: 'lot', lat: 33.8358, lng: -118.3468, address: 'Carson St / Madrona Ave, Torrance, CA', restriction: 'Mall parking. Verify posted signs.' },
      { id: 'delamo-amc', name: 'Del Amo AMC / Dave & Buster’s Parking', kind: 'lot', lat: 33.8295, lng: -118.3490, address: 'Del Amo Cir E, Torrance, CA', restriction: 'Mall parking. Verify posted signs and event/security restrictions.' },
      { id: 'delamo-outdoor-village', name: 'Del Amo Outdoor Village Parking', kind: 'lot', lat: 33.8316, lng: -118.3528, address: 'Outdoor Village, Torrance, CA', restriction: 'Mall parking. Verify posted signs.' }
    ]
  }
];
