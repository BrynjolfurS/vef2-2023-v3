import { readFile } from 'fs/promises';
import { Department, Course } from '../types.js';
import pg from 'pg';
import { courseMapper, departmentMapper, mapDbCoursesToCourses, mapDbDepartmentsToDepartments } from './mappers.js';

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';

import dotenv from 'dotenv';
dotenv.config();

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development'} = process.env;
if (!connectionString) {
    console.error('Vantar DATABASE_URL í .env');
    process.exit(-1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development
// mode, á heroku, ekki á local vél
const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({connectionString, ssl});

pool.on('error', (err: Error) => {
    console.error('Ekki tókst að tengjast við gagnagrunn', err);
    process.exit(-1);
});

export async function query(q: string, values: Array<unknown> = [],) {
    let client;
    try {
        client = await pool.connect();
    } catch (e) {
        console.error('Unable to get client from pool', e);
        return null;
    }

    try {
        const result = await client.query(q, values);
        return result;
    } catch (e) {
        console.error('unable to query', e);
        console.info(q, values);
        return null;
    } finally {
        client.release();
    }
}

export async function poolEnd() {
    await pool.end();
}

export async function insertCourse(
    course:Omit<Course, 'id'>, departmentId: number): Promise<Course | null> {
        const { title, credits, semester, level, url, courseNumber} = course;
        const result = await query(
            `INSERT INTO courses (title, credits, semester, level, url,
            department_id, courseNumber) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [title, credits, semester, level, url, departmentId, courseNumber],
        );

        const mapped = courseMapper(result?.rows[0]);
        return mapped;
}

export async function insertDepartment(department: Omit<Department, 'id'>): Promise<Department | null> {
    const { title, slug, description } = department;
    const result = await query(
        `INSERT INTO departments (title, slug, description)
         VALUES($1, $2, $3) RETURNING id, title, slug, description, created, updated`,
        [title, slug, description],
    );

    const mapped = departmentMapper(result?.rows[0]);
    return mapped;
}

export async function getCourses(dptId: number): Promise<Course[] | null> {
    const result = await query('SELECT * FROM courses WHERE department_id = $1', [dptId]);
    if (!result) {
        return null;
    }

    const courses = await mapDbCoursesToCourses(result);
    return courses;
}

export async function getDepartments(): Promise<Department[] | null> {
    const result = await query(`SELECT * FROM departments`);

    if (!result) {
        return null;
    }

    const departments = mapDbDepartmentsToDepartments(result);
    return departments;
}

export async function getDepartmentBySlug(slug: string): Promise<Department | null> {
    const result = await query(`SELECT * FROM departments WHERE slug = $1`, [slug]);

    if (!result) {
        return null;
    }

    const department = departmentMapper(result.rows[0]);

    return department;
}


export async function getDepartmentIdBySlug(slug: string): Promise<number | null> {
    const result = await query('SELECT id FROM departments WHERE slug = $1', [slug])

    if (!result) {
        return null;
    }
    const id: number = result.rows[0].id;
    return id;
}

export async function deleteDepartmentBySlug(slug: string): Promise<boolean> {
    const result = await query('DELETE FROM departments WHERE slug = $1', [slug]);

    if (!result) {
        return false;
    }

    return result.rowCount === 1;
}

export async function conditionalUpdate(
    table : string,
    id : string,
    fields : Array<string | null>,
    values : Array<string>) {
  
    if (!fields) {
      return null;
    }
  
    const filteredFields = fields.filter((i: any) => typeof i === 'string');
  
    const filteredValues : Array<string> = values.filter(
      (i: any) => typeof i === 'string' || typeof i === 'number' || i instanceof Date
    );
  
    if (filteredFields.length === 0) {
      return null;
    }
  
    if (filteredFields.length !== filteredValues.length) {
      return null;
    }
    // id is field = 1
    const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);
  
    const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      id = $1
    RETURNING *
    `;

  const queryValues = [id].concat(filteredValues);
  const result = await query(q, queryValues);

  return result;
    // const queryValues = [id].concat(filteredValues);
    // const result = await query(q, queryValues);
    // if (result) {
    //   return result.rows[0];
    // }
    // return null;
}