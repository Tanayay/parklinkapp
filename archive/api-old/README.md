# Archived ParkLink API versions

These API files were removed from the live `/api` folder because Vercel Hobby counts every file in `/api` as a serverless function and blocks deployments after 12 functions.

The code is still recoverable from Git history using the blob SHAs below. The current live API files should stay limited to the active production endpoints.

## Keep live

- `api/send-otp.js`
- `api/parking-search-v10.js`

## Removed from live `/api`

| Removed file | Last known blob SHA |
|---|---|
| `api/parking-search.js` | `1df9c14640452b0932bb01ea2cfac822213d761e` |
| `api/parking-search-v2.js` | `cf7183987b2361eafbbd6b8a6c833332f2b797dc` |
| `api/parking-search-v3.js` | `f60ed4b6dd867b94df00a1e99015940959179dfe` |
| `api/parking-search-v5.js` | `77eca02809e8af5d507dc44a0e1427cf4325be9a` |
| `api/parking-search-v7.js` | `6004ea82fa1b935f32163fbd8ea01d689b94ba02` |
| `api/parking-search-v8.js` | `65257391d1cd66f21fc8a506072456915cd6cd06` |
| `api/parking-search-v9.js` | `4933148ed2ba785335138bbf82754550b1045082` |
| `api/place-search-v6.js` | `169914a81d0c2ed382728387e1ea284ee444bb40` |
| `api/place-search-fast.js` | `cbaeb3cf4bbde3741ea0a920f34112869ab7f14a` |
| `api/place-search-addressed.js` | `c14a1bee8e6874f3b0eb63d1adaea0fe479b518e` |
| `api/place-search-stable.js` | `72388c0cbcf41dce40573da490a386e7f6ff67b6` |

## Restore note

To restore any old version later, copy it from Git history into a non-`/api` working file first, then only move it into `/api` when it is the single active endpoint you want Vercel to deploy.
