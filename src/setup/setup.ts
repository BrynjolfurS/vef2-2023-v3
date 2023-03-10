import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { parseCsv, parseJson } from './parse.js';
import { Department } from '../types.js';
import { insertCourse, insertDepartment, poolEnd, query } from '../lib/db.js';

dotenv.config();

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
const DATA_DIR = './data';

export async function createSchema(schemaFile = SCHEMA_FILE) {
    const data = await readFile(schemaFile);

    return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
    const data = await readFile(dropFile);
    
    return query(data.toString('utf-8'));
}

async function setup() {
    const drop = await dropSchema();

    if (drop) {
        console.info('Schema dropped');
    } else {
        console.info('Schema not dropped, exiting');
        poolEnd();
        return process.exit(-1);
    }

    const result = await createSchema();

    if (result) {
        console.info('Schema created');
    } else {
        console.info('Schema not created, exiting');
        poolEnd();
        return process.exit(-1);
    }

    const indexFile = await readFile(join(DATA_DIR, 'index.json'));
    const indexData = parseJson(indexFile.toString('utf-8'));

    for (const item of indexData) {
        const csvFile = await readFile(join(DATA_DIR, item.csv), {
            encoding: 'latin1',
        });

        const courses = parseCsv(csvFile);

        const department: Omit<Department, 'id'> = {
            title: item.title,
            slug: item.slug,
            description: item.description,
        };

        const insertedDept = await insertDepartment(department);

        if (!insertedDept) {
            console.error('Unable to insert department', item);
            continue;
        }

        let validInserts = 0;
        let invalidInserts = 0;

        for (const course of courses) {
            const id = await insertCourse(course, insertedDept.id);
            if (id) {
                validInserts++;
            } else {
                invalidInserts++;
            }
        }
        console.info(
            `Created department ${item.title} with ${validInserts}
             valid insertions and ${invalidInserts} invalid insertions`)
    }
}

setup().catch((err) => {
    console.error('Error running setup: ', err);
})