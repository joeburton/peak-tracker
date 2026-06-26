import { fileURLToPath } from 'node:url'
import { getDb, disconnect } from '../src/lib/db/mongodb'
import { COLLECTIONS } from '../src/lib/db/collections'

export const EXPECTED_WAINWRIGHTS = 214
export const EXPECTED_MUNROS = 282
export const EXPECTED_TOTAL = EXPECTED_WAINWRIGHTS + EXPECTED_MUNROS

export const UK_LAT = { min: 49, max: 61 }
export const UK_LNG = { min: -9, max: 2 }

export const REQUIRED_FIELDS = [
  'peakListSlug',
  'slug',
  'name',
  'region',
  'heightMetres',
  'heightFeet',
  'latitude',
  'longitude',
  'createdAt',
  'updatedAt',
]

export interface VerificationFailure {
  check: string
  message: string
}

export async function verify(): Promise<VerificationFailure[]> {
  const failures: VerificationFailure[] = []
  const db = await getDb()
  const col = db.collection(COLLECTIONS.peaks)

  // Wainwright count
  const wainwrightCount = await col.countDocuments({ peakListSlug: 'wainwrights' })
  if (wainwrightCount !== EXPECTED_WAINWRIGHTS) {
    failures.push({
      check: 'wainwright-count',
      message: `Expected ${EXPECTED_WAINWRIGHTS} Wainwrights, found ${wainwrightCount}`,
    })
  }

  // Munro count
  const munroCount = await col.countDocuments({ peakListSlug: 'munros' })
  if (munroCount !== EXPECTED_MUNROS) {
    failures.push({
      check: 'munro-count',
      message: `Expected ${EXPECTED_MUNROS} Munros, found ${munroCount}`,
    })
  }

  // Slug uniqueness — distinct returns one entry per unique value
  const totalCount = await col.countDocuments()
  const distinctSlugs = (await col.distinct('slug')) as string[]
  if (distinctSlugs.length !== totalCount) {
    failures.push({
      check: 'slug-uniqueness',
      message: `Found ${totalCount - distinctSlugs.length} duplicate slug(s) across ${totalCount} records`,
    })
  }

  // Valid heightMetres
  const invalidHeightMetres = await col.countDocuments({
    $or: [{ heightMetres: { $exists: false } }, { heightMetres: { $lte: 0 } }],
  })
  if (invalidHeightMetres > 0) {
    failures.push({
      check: 'height-metres',
      message: `${invalidHeightMetres} record(s) have missing or non-positive heightMetres`,
    })
  }

  // Valid heightFeet
  const invalidHeightFeet = await col.countDocuments({
    $or: [{ heightFeet: { $exists: false } }, { heightFeet: { $lte: 0 } }],
  })
  if (invalidHeightFeet > 0) {
    failures.push({
      check: 'height-feet',
      message: `${invalidHeightFeet} record(s) have missing or non-positive heightFeet`,
    })
  }

  // Valid latitude (UK range 49–61°N)
  const invalidLat = await col.countDocuments({
    $or: [
      { latitude: { $exists: false } },
      { latitude: { $lt: UK_LAT.min } },
      { latitude: { $gt: UK_LAT.max } },
    ],
  })
  if (invalidLat > 0) {
    failures.push({
      check: 'latitude',
      message: `${invalidLat} record(s) have missing or out-of-range latitude (valid: ${UK_LAT.min}–${UK_LAT.max})`,
    })
  }

  // Valid longitude (UK range -9–2°E)
  const invalidLng = await col.countDocuments({
    $or: [
      { longitude: { $exists: false } },
      { longitude: { $lt: UK_LNG.min } },
      { longitude: { $gt: UK_LNG.max } },
    ],
  })
  if (invalidLng > 0) {
    failures.push({
      check: 'longitude',
      message: `${invalidLng} record(s) have missing or out-of-range longitude (valid: ${UK_LNG.min}–${UK_LNG.max})`,
    })
  }

  // Required fields present
  const missingFields = await col.countDocuments({
    $or: REQUIRED_FIELDS.map((field) => ({ [field]: { $exists: false } })),
  })
  if (missingFields > 0) {
    failures.push({
      check: 'required-fields',
      message: `${missingFields} record(s) have one or more missing required fields`,
    })
  }

  return failures
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let exitCode = 0
  verify()
    .then((failures) => {
      if (failures.length === 0) {
        console.log('All seed verification checks passed.')
        return
      }
      console.error(`Seed verification failed with ${failures.length} error(s):`)
      for (const f of failures) {
        console.error(`  [${f.check}] ${f.message}`)
      }
      exitCode = 1
    })
    .catch((err: unknown) => {
      console.error('Failed to run seed verification:', err)
      exitCode = 1
    })
    .finally(async () => {
      await disconnect().catch((e: unknown) => console.error('disconnect error:', e))
      process.exit(exitCode)
    })
}
