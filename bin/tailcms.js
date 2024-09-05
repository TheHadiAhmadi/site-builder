#!/usr/bin/env node

import { readdir, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { createApp } from '../src/app.js';
import { createFileDb } from 'svelite-html/db';
import { existsSync, mkdirSync } from 'fs';
import { chdir } from 'process';

// Utility function to create directories recursively
async function mkdirRecursive(dir) {
    try {
        await mkdir(dir, { recursive: true });
    } catch (err) {
        if (err.code !== 'EEXIST') throw err;
    }
}

// Utility function to check if a directory is empty
async function isDirectoryEmpty(dirPath) {
    try {
        if(!existsSync(dirPath)) return true;
        const files = await readdir(dirPath);
        return files.length === 0;
    } catch (err) {
        console.error('Error reading directory:', err);
        throw err;
    }
}

async function initProject(cwd) {
    if (!await isDirectoryEmpty(cwd)) {
        throw new Error('This directory is not empty!');
    }

    mkdirSync(cwd)
    // Define paths for .env, package.json, and directories
    const envFilePath = path.join(cwd, '.env');
    const packageJsonPath = path.join(cwd, 'package.json');
    const gitignorePath = path.join(cwd, '.gitignore');
    const uploadsDir = path.join(cwd, 'uploads');
    const functionsDir = path.join(cwd, 'functions');
    const helloFilePath = path.join(functionsDir, 'hello.js');

    // Default content for .env file
    const envContent = `OPENAI_API_KEY=...\nOPENAI_BASE_URL=...\nOPENAI_MODEL=gpt-4o-mini\nTAILCMS_DB=file\nTAILCMS_DB_PATH=./data.json\nTAILCMS_PORT=3000\n`;

    // Default content for package.json file
    const packageJsonContent = JSON.stringify({
        type: 'module'
    }, null, 2);

    const gitignoreContent = `.env\nuploads\ndata.json`;

    // Default content for hello.js file
    const helloJsContent = `export default {
        name: 'hello',
        action(body, content) {
            return {};
        }
    };`;

    try {
        // Create .env file with default content
        await writeFile(envFilePath, envContent, 'utf8');
        console.log('.env file created successfully.');

        // Create package.json file with default content
        await writeFile(packageJsonPath, packageJsonContent, 'utf8');
        console.log('package.json file created successfully.');

        // Create package.json file with default content
        await writeFile(gitignorePath, gitignoreContent, 'utf8');
        console.log('.gitignore file created successfully.');
       
        // Create directories
        await mkdirRecursive(uploadsDir);
        console.log('uploads directory created successfully.');

        await mkdirRecursive(functionsDir);
        console.log('functions directory created successfully.');

        // Create hello.js file with default content
        await writeFile(helloFilePath, helloJsContent, 'utf8');
        console.log('hello.js file created successfully.');
        
    } catch (err) {
        console.error('Error during initialization:', err);
    }
}

async function runDev(cwd) {
    chdir(cwd)

    const functionsFolder = path.join(cwd, 'functions');

    let functionsFiles = await readdir(functionsFolder);
    let functions = {};
    for (let func of functionsFiles) {
        const module = await import(path.join(functionsFolder, func));
        functions[module.default.name] = module.default;
    }
    const config = {
        db: {
            type: process.env.TAILCMS_DB ?? 'memory',
            path: process.env.TAILCMS_DB_PATH ?? './data.json',
            // ...
        }
    };

    let db;
    if (config.db.type === 'file') {
        const { type, ...rest } = config.db;
        db = createFileDb(rest);
    }

    const port = process.env.TAILCMS_PORT ?? 3000;

    createApp({ functions, db }).start(port);
}

(async () => {
    const args = process.argv.slice(2);
    const command = args[0];
    const dirPath = args[1] ? path.resolve(args[1]) : process.cwd(); // Use the provided directory or current working directory

    switch (command) {
        case 'init':
            await initProject(dirPath);
            break;
        case 'dev':
            await runDev(dirPath);
            break;
        default:
            console.error('Unknown command:', command);
            process.exit(1);
    }
})();
