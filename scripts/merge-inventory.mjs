import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function parseArgs(argv) {
	const args = {};
	for (let i = 2; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--base' || arg === '-b') args.base = argv[++i];
		else if (arg === '--addition' || arg === '-a') args.addition = argv[++i];
		else if (arg === '--out' || arg === '-o') args.out = argv[++i];
	}
	return args;
}

async function readJsonArray(filePath) {
	const content = await readFile(filePath, 'utf8');
	const data = JSON.parse(content);
	if (!Array.isArray(data)) {
		throw new Error(`Expected array JSON at ${filePath}`);
	}
	return data;
}

function normalizeItem(item) {
	// Ensure all required fields exist to match inventory schema
	return {
		name: item.name ?? '',
		id: item.id ?? '',
		pic: item.pic ?? '',
		link: item.link ?? '',
		material: item.material ?? '材质：',
		period: item.period ?? '年代：',
		intro: item.intro ?? '',
	};
}

function mergeById(baseList, additionList) {
	const map = new Map();
	for (const it of baseList) {
		if (!it || typeof it !== 'object') continue;
		const id = String(it.id ?? '');
		if (!id) continue;
		map.set(id, normalizeItem(it));
	}
	for (const it of additionList) {
		if (!it || typeof it !== 'object') continue;
		const id = String(it.id ?? '');
		if (!id) continue;
		// Prefer addition (new) on conflict
		map.set(id, normalizeItem(it));
	}
	return Array.from(map.values());
}

async function main() {
	const { base, addition, out } = parseArgs(process.argv);
	const basePath = base ? path.resolve(base) : path.resolve(repoRoot, 'public', 'inventoryDataBase.json');
	const additionPath = addition ? path.resolve(addition) : path.resolve(repoRoot, 'data', 'newInventoryData.json');
	const outPath = out ? path.resolve(out) : basePath;

	const [baseArr, addArr] = await Promise.all([
		readJsonArray(basePath),
		readJsonArray(additionPath),
	]);

	const merged = mergeById(baseArr, addArr);
	await writeFile(outPath, JSON.stringify(merged, null, 2), 'utf8');
	console.log(`Merged ${baseArr.length} base + ${addArr.length} additions -> ${merged.length} unique by id.`);
	console.log(`Output written to: ${outPath}`);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});


