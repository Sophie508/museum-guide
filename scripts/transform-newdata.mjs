import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

function parseArgs(argv) {
	const args = {};
	for (let i = 2; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--input' || arg === '-i') {
			args.input = argv[++i];
		} else if (arg === '--output' || arg === '-o') {
			args.output = argv[++i];
		}
	}
	return args;
}

function ensureString(value) {
	return typeof value === 'string' ? value : (value == null ? '' : String(value));
}

function mapRecordToInventoryShape(item) {
	const id = ensureString(item._id);
	const name = ensureString(item.name);
	const cover = ensureString(item.cover) || ensureString(item.cover_png) || (Array.isArray(item.ppt) && item.ppt.length > 0 ? ensureString(item.ppt[0]) : '');
	const materials = Array.isArray(item.materials) ? item.materials.filter(Boolean).map(String) : [];
	const materialStr = materials.length > 0 ? `材质：${materials.join('、')}` : '材质：';
	const period = ensureString(item.period);
	const periodStr = period ? `年代：${period}` : '年代：';
	const intro = ensureString(item.content).trim();

	return {
		name,
		id,
		pic: cover,
		link: id ? `https://wuzhongmuseum.com/portal/collection/content?id=${id}` : '',
		material: materialStr,
		period: periodStr,
		intro,
	};
}

async function readNewlineDelimitedJson(filePath) {
	const content = await readFile(filePath, 'utf8');
	const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
	const records = [];
	let errors = 0;
	for (let idx = 0; idx < lines.length; idx++) {
		const line = lines[idx];
		try {
			const obj = JSON.parse(line);
			records.push(obj);
		} catch (err) {
			errors++;
			console.warn(`Warning: failed to parse line ${idx + 1}: ${err.message}`);
		}
	}
	if (records.length === 0) {
		throw new Error('No valid JSON objects parsed from input.');
	}
	return { records, errors, total: lines.length };
}

async function main() {
	const { input, output } = parseArgs(process.argv);
	const inputPath = input ? path.resolve(input) : path.resolve(repoRoot, 'newdata.json');
	const outputPath = output ? path.resolve(output) : path.resolve(repoRoot, 'data', 'newInventoryData.json');

	const { records, errors, total } = await readNewlineDelimitedJson(inputPath);
	const transformed = records.map(mapRecordToInventoryShape);

	await mkdir(path.dirname(outputPath), { recursive: true });
	await writeFile(outputPath, JSON.stringify(transformed, null, 2), 'utf8');

	console.log(`Transformed ${transformed.length} records${errors ? ` (skipped ${errors} malformed of ${total})` : ''}.`);
	console.log(`Output written to: ${outputPath}`);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});


