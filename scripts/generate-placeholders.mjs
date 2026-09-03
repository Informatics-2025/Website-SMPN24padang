
import fs from 'fs/promises';
import path from 'path';
import { getPlaiceholder } from 'plaiceholder';

async function generatePlaceholdersForDir(dir, prefix) {
  try {
    const absoluteDir = path.join(process.cwd(), 'public', dir);
    if (!(await fs.stat(absoluteDir).catch(() => false))) {
      console.log(`${dir} directory does not exist. Creating it now.`);
      await fs.mkdir(absoluteDir, { recursive: true });
    }
    const files = await fs.readdir(absoluteDir);

    if (files.length === 0) {
      console.log(`No files found in the ${dir} directory. Creating a placeholder file.`);
      // Create a dummy file to avoid errors
      const dummyFilePath = path.join(absoluteDir, 'placeholder.txt');
      await fs.writeFile(dummyFilePath, 'This is a placeholder file.');
      // You should replace this with actual images
    }

    return Promise.all(
      files
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
        .map(async (file) => {
          const src = path.join(prefix, file);
          const buffer = await fs.readFile(path.join(absoluteDir, file));
          const { base64 } = await getPlaiceholder(buffer);
          return { src, base64 };
        })
    );
  } catch (error) {
    console.error(`Error generating placeholders for ${dir}:`, error);
    return [];
  }
}

async function generateAllPlaceholders() {
  try {
    const facilitiesPlaceholders = await generatePlaceholdersForDir('facilities', '/facilities');
    const bannersPlaceholders = await generatePlaceholdersForDir('banners', '/banners');

    const allPlaceholders = [...facilitiesPlaceholders, ...bannersPlaceholders];

    await fs.writeFile(
      path.join(process.cwd(), 'src', 'lib', 'placeholders.json'),
      JSON.stringify(allPlaceholders)
    );

    console.log('All placeholders generated successfully!');
  } catch (error) {
    console.error("Error generating placeholders:", error);
    // Create an empty placeholders.json file to avoid breaking the build
    await fs.writeFile(
      path.join(process.cwd(), 'src', 'lib', 'placeholders.json'),
      JSON.stringify([])
    );
    console.log("Created an empty placeholders.json file.");
  }
}

generateAllPlaceholders();
