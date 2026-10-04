// Generate all required images for the motorcycle repair website (sequential with delay)
// Run: bun run scripts/gen-images.ts
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "public/images");

const IMAGES = [
  {
    name: "hero.jpg",
    prompt:
      "Cinematic wide shot of a professional motorcycle repair garage, a sleek modern sport motorcycle on a lift stand, dramatic warm orange rim lighting, dark industrial workshop background with tools on pegboard walls, sparks flying from grinder, atmospheric smoke, professional automotive photography, moody lighting, high detail, 8k",
    size: "1440x768",
  },
  {
    name: "about.jpg",
    prompt:
      "A professional motorcycle mechanic in dark blue work uniform working on a motorcycle engine, focused expression, hands holding a wrench, warm garage lighting, tools and parts visible in background, documentary photography style, sharp detail, authentic workshop atmosphere, warm tones",
    size: "1344x768",
  },
  {
    name: "cat-galaxy.jpg",
    prompt:
      "A sleek modern sport motorcycle 'Galaxy' style on a clean studio background, side profile view, dramatic orange rim lighting, professional product photography, dark gradient background, high detail, glossy red and black bodywork, industrial mood",
    size: "1024x1024",
  },
  {
    name: "cat-benelli.jpg",
    prompt:
      "Italian-style Benelli motorcycle in a workshop, dramatic side profile, orange accent lighting, dark background, professional product photography, glossy finish, premium motorcycle, detailed engine visible",
    size: "1024x1024",
  },
  {
    name: "cat-cross.jpg",
    prompt:
      "Off-road motocross dirt bike motorcycle on a stand in a garage, knobby tires, orange and black color scheme, dramatic lighting, dust particles in air, professional photography, action-ready look",
    size: "1024x1024",
  },
  {
    name: "cat-aprilia.jpg",
    prompt:
      "Aprilia racing sport motorcycle, italian racing design, red and black, side profile, professional studio lighting with orange rim light, dark background, premium sport bike, detailed photography",
    size: "1024x1024",
  },
  {
    name: "cat-honda.jpg",
    prompt:
      "Honda sport motorcycle, red and black classic design, side profile in a workshop, warm orange lighting, professional product photography, dark background, sharp detail, premium motorcycle",
    size: "1024x1024",
  },
  {
    name: "art-1.jpg",
    prompt:
      "Motorcycle parked in a winter garage setting, snow visible outside, motorcycle covered partially with protective cloth, warm interior lighting contrasting cold exterior, professional photography, atmospheric, orange accent tones",
    size: "1344x768",
  },
  {
    name: "art-2.jpg",
    prompt:
      "Close-up of motorcycle battery and electrical system, technician hands with multimeter testing battery, detailed mechanical photography, orange and black tones, professional workshop, sharp focus",
    size: "1344x768",
  },
  {
    name: "art-3.jpg",
    prompt:
      "Close-up of motorcycle carburetor being tuned, mechanic hands with small screwdriver adjusting brass screws, detailed mechanical photography, warm orange lighting, dark background, professional shot",
    size: "1344x768",
  },
  {
    name: "cta-bg.jpg",
    prompt:
      "Dark industrial motorcycle workshop interior with orange hazard lighting, motorcycle silhouette, atmospheric haze, wide cinematic shot, moody professional photography, dark background with orange accents, abstract garage atmosphere",
    size: "1440x768",
  },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateOne(zai: any, item: (typeof IMAGES)[0]) {
  const outPath = path.join(OUT_DIR, item.name);
  if (fs.existsSync(outPath)) {
    console.log(`↻ Skipping ${item.name} (already exists)`);
    return true;
  }
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      console.log(`⏳ [attempt ${attempt}] ${item.name} (${item.size})...`);
      const response = await zai.images.generations.create({
        prompt: item.prompt,
        size: item.size as any,
      });
      const base64 = response.data[0].base64;
      const buffer = Buffer.from(base64, "base64");
      fs.writeFileSync(outPath, buffer);
      console.log(`✓ Saved ${item.name} (${(buffer.length / 1024).toFixed(0)} KB)`);
      return true;
    } catch (err: any) {
      console.error(`✗ [${item.name}] attempt ${attempt} failed: ${err.message}`);
      if (err.message.includes("429")) {
        await sleep(8000 * attempt);
      } else {
        await sleep(3000 * attempt);
      }
    }
  }
  console.error(`✗ Gave up on ${item.name}`);
  return false;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  const zai = await ZAI.create();
  console.log(`🎨 Generating ${IMAGES.length} images sequentially with delays...`);
  let ok = 0;
  for (const item of IMAGES) {
    const success = await generateOne(zai, item);
    if (success) ok++;
    await sleep(2000);
  }
  console.log(`\n✅ Done: ${ok}/${IMAGES.length} succeeded`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
