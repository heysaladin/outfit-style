/**
 * screenshot.mjs
 * Auto-screenshot semua halaman dari SITEMAP.md
 *
 * Usage:
 *   node scripts/screenshot.mjs
 *   BASE_URL=https://yoursite.com node scripts/screenshot.mjs
 *
 * Requires: npx playwright install chromium
 */

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.join(__dirname, '..')
const OUT_DIR   = path.join(ROOT, 'screenshots')
const BASE_URL  = process.env.BASE_URL || 'http://localhost:3000'

// ─── Routes to screenshot ────────────────────────────────────────────────────
// Dynamic routes (contain [param]) are listed with example values.
// Auth-required pages will redirect to /login — that's fine for a sitemap shot.
const ROUTES = [
  // Auth
  { path: '/login',        name: '01-login'        },

  // Home
  { path: '/',             name: '02-home'          },

  // Wardrobe
  { path: '/ofit',         name: '03-closet'        },
  { path: '/outfits',      name: '04-outfits'       },
  { path: '/wardrobes',    name: '05-storage'       },
  { path: '/declutter',    name: '06-declutter'     },
  { path: '/stats',        name: '07-stats'         },
  { path: '/plan',         name: '08-plan'          },
  { path: '/calendar',     name: '09-calendar'      },
  { path: '/fashion',      name: '10-fashion'       },

  // Gear & Hobbies
  { path: '/gear',         name: '11-gear'          },
  { path: '/motorcycle',   name: '12-motorcycle'    },
  { path: '/automotive',   name: '13-automotive'    },
  { path: '/workout',      name: '14-workout'       },
  { path: '/plant_care',   name: '15-plant-care'    },
  { path: '/electronics',  name: '16-electronics'   },
  { path: '/watches',      name: '17-watches'       },
  { path: '/photography',  name: '18-photography'   },
  { path: '/videography',  name: '19-videography'   },
  { path: '/workspace',    name: '20-workspace'     },
  { path: '/outdoor',      name: '21-outdoor'       },
  { path: '/cooking',      name: '22-cooking'       },
  { path: '/fish_keeping', name: '23-fish-keeping'  },
  { path: '/drawing',      name: '24-drawing'       },
  { path: '/3d_modelling', name: '25-3d-modelling'  },
  { path: '/grooming',     name: '26-grooming'      },
  { path: '/coding',       name: '27-coding'        },
  { path: '/designing',    name: '28-designing'     },
  { path: '/architecture', name: '29-architecture'  },
  { path: '/music',        name: '30-music'         },
  { path: '/social',       name: '31-social'        },

  // Literacy
  { path: '/literacy',     name: '32-literacy'      },

  // Profile
  { path: '/profile',      name: '33-profile'       },
]

// ─── Viewport: iPhone 14 Pro (430×932) ──────────────────────────────────────
const VIEWPORT = { width: 430, height: 932 }

// ─── Grab cookies from active Chrome tab via AppleScript ─────────────────────
function getCookiesFromChrome(baseUrl) {
  const script = `
    tell application "Google Chrome"
      execute active tab of front window javascript "document.cookie"
    end tell
  `
  try {
    const raw = execSync(`osascript -e '${script.replace(/'/g, "'\\''")}'`, { encoding: 'utf8' }).trim()
    const url = new URL(baseUrl)
    return raw.split(';').map(s => s.trim()).filter(Boolean).map(pair => {
      const idx = pair.indexOf('=')
      return {
        name:   pair.slice(0, idx),
        value:  pair.slice(idx + 1),
        domain: url.hostname,
        path:   '/',
      }
    })
  } catch (e) {
    throw new Error('Could not read cookies from Chrome: ' + e.message)
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function run() {
  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

  // ── Step 1: Grab cookies from active Chrome tab ───────────────────────────
  console.log(`\n🔑 Reading session cookies from Chrome (make sure ${BASE_URL} is open in Chrome)...`)
  const cookies = getCookiesFromChrome(BASE_URL)
  const authCookies = cookies.filter(c => c.name.startsWith('sb-'))
  if (authCookies.length === 0) throw new Error(`No Supabase auth cookies found. Please log in at ${BASE_URL} in Chrome first.`)
  console.log(`✅ Found ${authCookies.length} auth cookie(s)\n`)

  // ── Step 2: Launch Playwright, inject cookies ─────────────────────────────
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  })

  await context.addCookies(cookies)

  const page = await context.newPage()
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 20000 })

  if (page.url().includes('/login')) throw new Error('Cookie injection failed — still on /login.')
  console.log('✅ Session injected! Starting screenshots...\n')
  await page.waitForTimeout(500)

  const results = []
  let passed = 0
  let failed = 0

  // ONLY=declutter,stats node scripts/screenshot.mjs  → re-shoot specific pages
  const onlyFilter = process.env.ONLY?.split(',').map(s => s.trim())
  const queue = onlyFilter ? ROUTES.filter(r => onlyFilter.some(f => r.name.includes(f) || r.path.includes(f))) : ROUTES

  console.log(`🎯 Base URL : ${BASE_URL}`)
  console.log(`📁 Output  : ${OUT_DIR}`)
  console.log(`📄 Pages   : ${queue.length}\n`)
  console.log('─'.repeat(52))

  for (const route of queue) {
    const url  = `${BASE_URL}${route.path}`
    const file = path.join(OUT_DIR, `${route.name}.png`)

    process.stdout.write(`📸  ${route.name.padEnd(30)}`)

    try {
      const res = await page.goto(url, { waitUntil: 'load', timeout: 60000 })
      await page.waitForTimeout(1200)   // let CSS animations settle

      await page.screenshot({ path: file, fullPage: false })

      const status = res?.status() ?? '?'
      const final  = page.url().replace(BASE_URL, '') || '/'
      const note   = final !== route.path ? ` → ${final}` : ''

      console.log(`✓  [${status}]${note}`)
      results.push({ route: route.path, file: `screenshots/${route.name}.png`, status, redirect: final !== route.path ? final : null })
      passed++
    } catch (err) {
      console.log(`✗  ${err.message.split('\n')[0]}`)
      results.push({ route: route.path, file: null, error: err.message.split('\n')[0] })
      failed++
    }
  }

  await browser.close()

  // ─── Write index markdown ──────────────────────────────────────────────────
  const lines = [
    '# Screenshots Index',
    '',
    `> Generated: ${new Date().toLocaleString()}  `,
    `> Base URL: ${BASE_URL}  `,
    `> Viewport: ${VIEWPORT.width}×${VIEWPORT.height} @2x`,
    '',
    '---',
    '',
  ]

  for (const r of results) {
    if (r.file) {
      const redirect = r.redirect ? ` *(redirected → \`${r.redirect}\`)*` : ''
      lines.push(`### \`${r.route}\`${redirect}`)
      lines.push(`![${r.route}](${r.file})`)
      lines.push('')
    } else {
      lines.push(`### \`${r.route}\` — ❌ Failed`)
      lines.push(`> ${r.error}`)
      lines.push('')
    }
  }

  await writeFile(path.join(OUT_DIR, 'index.md'), lines.join('\n'))

  console.log('─'.repeat(52))
  console.log(`\n✅ Done!  ${passed} captured, ${failed} failed`)
  console.log(`📂 Screenshots: ./screenshots/`)
  console.log(`📋 Index file : ./screenshots/index.md\n`)
}

run().catch(err => {
  console.error('\n❌ Fatal:', err.message)
  process.exit(1)
})
