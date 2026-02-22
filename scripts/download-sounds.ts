/**
 * Downloads champion select SFX audio files from CommunityDragon into /client/public/sounds/
 * Files are named by champion ID: {id}.ogg
 *
 * Run: npx tsx scripts/download-sounds.ts
 */

import { writeFileSync, mkdirSync, createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import { Readable } from 'stream';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SOUNDS_DIR = join(__dirname, '..', 'client', 'public', 'sounds');
const SERVER_DATA = join(__dirname, '..', 'server', 'src', 'data');

const CDN_BASE = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-sfx-audios';

// Champion ID → champion name mapping (from Data Dragon)
// Files on CommunityDragon are named {championId}.ogg
const ABILITY_PUZZLES = [
  { champion: 'Yasuo',      id: 157, hint: 'A swordsman from Ionia' },
  { champion: 'Lux',        id: 99,  hint: 'A Demacian mage' },
  { champion: 'Thresh',     id: 412, hint: 'A chain warden support' },
  { champion: 'Jinx',       id: 222, hint: 'A chaotic ADC from Zaun' },
  { champion: 'Katarina',   id: 55,  hint: 'A Noxian assassin' },
  { champion: 'Morgana',    id: 25,  hint: 'A fallen angel mage' },
  { champion: 'Zed',        id: 238, hint: 'A shadow assassin' },
  { champion: 'Ahri',       id: 103, hint: 'A nine-tailed fox mage' },
  { champion: 'Lee Sin',    id: 64,  hint: 'A blind monk jungler' },
  { champion: 'Ezreal',     id: 81,  hint: 'An explorer marksman' },
  { champion: 'Caitlyn',    id: 51,  hint: 'Sheriff of Piltover' },
  { champion: 'Blitzcrank', id: 53,  hint: 'A steam golem support' },
  { champion: 'Amumu',      id: 32,  hint: 'A lonely mummy jungler' },
  { champion: 'Veigar',     id: 45,  hint: 'A tiny evil mage' },
  { champion: 'Syndra',     id: 134, hint: 'A dark sovereign mage' },
  { champion: 'Fiora',      id: 114, hint: 'A dueling swordswoman' },
  { champion: 'Karthus',    id: 30,  hint: 'An undead lich mage' },
  { champion: 'Nunu',       id: 20,  hint: 'A boy and his yeti' },
  { champion: 'Rammus',     id: 33,  hint: 'OK.' },
  { champion: 'Sona',       id: 37,  hint: 'A musical enchanter support' },
];

async function downloadFile(url: string, dest: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const stream = createWriteStream(dest);
    await pipeline(Readable.fromWeb(res.body as import('stream/web').ReadableStream), stream);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  mkdirSync(SOUNDS_DIR, { recursive: true });
  mkdirSync(SERVER_DATA, { recursive: true });

  const validPuzzles = [];

  for (const puzzle of ABILITY_PUZZLES) {
    const cdnFile = `${puzzle.id}.ogg`;
    const audioFile = `${puzzle.champion.toLowerCase().replace(/[^a-z]/g, '')}-select.ogg`;
    const url = `${CDN_BASE}/${cdnFile}`;
    const dest = join(SOUNDS_DIR, audioFile);
    process.stdout.write(`Downloading ${puzzle.champion} (ID ${puzzle.id})… `);
    const ok = await downloadFile(url, dest);
    if (ok) {
      console.log('✓');
      validPuzzles.push({
        champion: puzzle.champion,
        ability: 'Select',
        audioFile,
        hint: puzzle.hint,
      });
    } else {
      console.log(`✗ not found`);
    }
  }

  writeFileSync(
    join(SERVER_DATA, 'ability-sound-puzzles.json'),
    JSON.stringify(validPuzzles, null, 2)
  );
  console.log(`\n✓ Wrote ${validPuzzles.length} ability sound puzzles`);
}

main().catch(err => { console.error(err); process.exit(1); });
