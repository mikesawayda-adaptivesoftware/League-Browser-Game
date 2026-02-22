/**
 * Fetches champion data from Riot Data Dragon and writes:
 *   - server/src/data/champions.json   (shared reference)
 *   - client/public/data/champions.json (served to browser)
 *   - server/src/data/timeline-puzzles.json (auto-generated timeline sets)
 *
 * Run: npx tsx scripts/fetch-champions.ts
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface DDragonChampion {
  id: string;
  name: string;
  title: string;
  tags: string[];
}

interface DDragonChampionFull {
  id: string;
  name: string;
  title: string;
  tags: string[];
  info: { attack: number; defense: number; magic: number; difficulty: number };
  lore?: string;
}

// Release dates sourced from League Wiki (Data Dragon doesn't include them)
// Covers all champions as of patch 14.x
const RELEASE_DATES: Record<string, string> = {
  Aatrox: '2013-06-13', Ahri: '2011-12-14', Akali: '2010-05-11', Akshan: '2021-07-22',
  Alistar: '2009-09-04', Amumu: '2009-09-04', Anivia: '2009-09-04', Annie: '2009-09-04',
  Aphelios: '2019-11-25', Ashe: '2009-09-04', AurelionSol: '2016-03-24', Aurora: '2024-07-17',
  Azir: '2014-09-16', Bard: '2015-03-05', Belveth: '2022-06-09', Blitzcrank: '2009-10-01',
  Brand: '2011-04-12', Braum: '2014-05-12', Briar: '2023-09-13', Caitlyn: '2011-01-04',
  Camille: '2016-12-07', Cassiopeia: '2010-12-14', Chogath: '2009-09-04', Corki: '2009-09-04',
  Darius: '2012-05-23', Diana: '2012-08-07', Draven: '2012-06-06', DrMundo: '2009-10-01',
  Ekko: '2015-05-28', Elise: '2012-10-26', Evelynn: '2009-10-01', Ezreal: '2010-03-16',
  Fiddlesticks: '2009-09-04', Fiora: '2012-02-29', Fizz: '2011-11-15', Galio: '2010-04-27',
  Gangplank: '2010-01-13', Garen: '2010-03-24', Gnar: '2014-08-11', Gragas: '2010-02-02',
  Graves: '2011-10-19', Gwen: '2021-04-15', Hecarim: '2012-04-18', Heimerdinger: '2009-09-04',
  Hwei: '2023-12-06', Illaoi: '2015-11-24', Irelia: '2010-12-14', Ivern: '2016-10-05',
  Janna: '2009-09-04', JarvanIV: '2011-03-01', Jax: '2009-09-04', Jayce: '2012-07-07',
  Jhin: '2016-02-01', Jinx: '2013-10-10', Kaisa: '2018-03-07', Kalista: '2014-11-20',
  Karma: '2011-03-23', Karthus: '2009-09-04', Kassadin: '2009-09-04', Katarina: '2009-09-04',
  Kayle: '2009-09-04', Kayn: '2017-07-12', Kennen: '2010-10-19', Khazix: '2012-09-27',
  Kindred: '2015-10-14', Kled: '2016-08-10', KogMaw: '2010-06-24', KSante: '2022-11-03',
  Leblanc: '2010-11-02', LeeSin: '2011-04-01', Leona: '2011-07-13', Lillia: '2020-07-22',
  Lissandra: '2013-04-30', Lucian: '2013-08-22', Lulu: '2012-03-20', Lux: '2010-10-19',
  Malphite: '2009-09-04', Malzahar: '2010-08-10', Maokai: '2011-01-18', MasterYi: '2009-09-04',
  Milio: '2023-03-22', MissFortune: '2010-11-16', MonkeyKing: '2011-09-26', Mordekaiser: '2010-02-24',
  Morgana: '2009-09-04', Naafiri: '2023-07-19', Nami: '2012-12-06', Nasus: '2009-09-04',
  Nautilus: '2012-02-14', Neeko: '2018-12-05', Nidalee: '2010-03-24', Nilah: '2022-07-13',
  Nocturne: '2011-03-15', Nunu: '2009-09-04', Olaf: '2010-08-24', Orianna: '2011-06-01',
  Ornn: '2017-08-23', Pantheon: '2010-04-20', Poppy: '2010-01-13', Pyke: '2018-05-31',
  Qiyana: '2019-06-28', Quinn: '2013-03-01', Rakan: '2017-04-19', Rammus: '2009-09-04',
  RekSai: '2014-12-11', Rell: '2020-12-10', Renata: '2022-02-17', Renekton: '2011-01-18',
  Rengar: '2012-08-22', Riven: '2012-09-19', Rumble: '2011-04-26', Ryze: '2009-09-04',
  Samira: '2020-09-21', Sejuani: '2012-01-17', Senna: '2019-11-10', Seraphine: '2020-10-29',
  Sett: '2020-01-14', Shaco: '2009-09-04', Shen: '2010-10-05', Shyvana: '2011-11-01',
  Singed: '2009-09-04', Sion: '2009-09-04', Sivir: '2009-09-04', Skarner: '2011-07-27',
  Smolder: '2024-02-07', Sona: '2010-09-21', Soraka: '2009-09-04', Swain: '2010-12-01',
  Sylas: '2019-01-25', Syndra: '2012-09-13', TahmKench: '2015-07-09', Taliyah: '2016-05-18',
  Talon: '2011-08-23', Taric: '2009-09-04', Teemo: '2009-09-04', Thresh: '2013-01-23',
  Tristana: '2009-09-04', Trundle: '2010-09-08', Tryndamere: '2009-09-04', TwistedFate: '2009-09-04',
  Twitch: '2009-09-04', Udyr: '2010-03-16', Urgot: '2010-07-26', Varus: '2012-05-08',
  Vayne: '2011-05-10', Veigar: '2009-09-04', Velkoz: '2014-02-26', Vex: '2021-09-22',
  Vi: '2012-12-19', Viego: '2021-01-21', Viktor: '2011-12-29', Vladimir: '2010-08-10',
  Volibear: '2012-12-14', Warwick: '2009-09-04', Xayah: '2017-04-19', Xerath: '2012-10-05',
  XinZhao: '2010-07-13', Yasuo: '2013-12-27', Yone: '2020-08-05', Yorick: '2011-07-26',
  Yuumi: '2019-05-14', Zac: '2013-03-29', Zed: '2012-11-13', Zeri: '2022-01-20',
  Ziggs: '2012-02-01', Zilean: '2009-09-04', Zoe: '2017-11-21', Zyra: '2012-07-24',
  Briar: '2023-09-13', Mel: '2025-01-22',
};

const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';

async function fetchLatestVersion(): Promise<string> {
  const res = await fetch(`${DDRAGON_BASE}/api/versions.json`);
  const versions: string[] = await res.json();
  return versions[0];
}

async function fetchChampions(version: string): Promise<Map<string, DDragonChampion>> {
  const res = await fetch(`${DDRAGON_BASE}/cdn/${version}/data/en_US/champion.json`);
  const data: { data: Record<string, DDragonChampion> } = await res.json();
  return new Map(Object.values(data.data).map(c => [c.id, c]));
}

function champImageUrl(version: string, id: string): string {
  return `${DDRAGON_BASE}/cdn/${version}/img/champion/${id}.png`;
}

async function main() {
  console.log('Fetching latest Data Dragon version…');
  const version = await fetchLatestVersion();
  console.log(`Version: ${version}`);

  console.log('Fetching champion list…');
  const champMap = await fetchChampions(version);

  const champions = Array.from(champMap.values()).map(c => ({
    id: c.id,
    name: c.name,
    title: c.title,
    roles: c.tags,
    releaseDate: RELEASE_DATES[c.id] ?? '2009-09-04',
    region: 'Unknown',
    imageUrl: champImageUrl(version, c.id),
  }));

  champions.sort((a, b) => a.name.localeCompare(b.name));

  const serverDataDir = join(__dirname, '..', 'server', 'src', 'data');
  const clientDataDir = join(__dirname, '..', 'client', 'public', 'data');
  mkdirSync(serverDataDir, { recursive: true });
  mkdirSync(clientDataDir, { recursive: true });

  const champJson = JSON.stringify(champions, null, 2);
  writeFileSync(join(serverDataDir, 'champions.json'), champJson);
  writeFileSync(join(clientDataDir, 'champions.json'), champJson);
  console.log(`✓ Wrote ${champions.length} champions`);

  // Auto-generate timeline puzzles (sets of 6 champions)
  const datedChamps = champions.filter(c => c.releaseDate !== '2009-09-04');
  const puzzles = [];
  for (let i = 0; i + 6 <= datedChamps.length; i += 4) {
    const slice = datedChamps.slice(i, i + 6);
    const shuffled = [...slice].sort(() => Math.random() - 0.5);
    puzzles.push(shuffled.map(c => ({
      id: c.id,
      name: c.name,
      releaseDate: c.releaseDate,
      imageUrl: c.imageUrl,
    })));
  }
  writeFileSync(join(serverDataDir, 'timeline-puzzles.json'), JSON.stringify(puzzles, null, 2));
  console.log(`✓ Generated ${puzzles.length} timeline puzzles`);
}

main().catch(err => { console.error(err); process.exit(1); });
