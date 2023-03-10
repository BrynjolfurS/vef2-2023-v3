import { Request, Response, NextFunction } from "express";
import { isStringLiteral } from "typescript";
import { getDepartments, getDepartmentBySlug, insertDepartment, deleteDepartmentBySlug, getDepartmentIdBySlug, conditionalUpdate } from "../lib/db.js";
import { slugify } from "../lib/slugify.js";
import { Department } from "../types.js";

export async function listDepartments(req: Request, res: Response, next: NextFunction) {

    const departments = await getDepartments();

    if (!departments) {
        return next(new Error('Unable to get departments'));
    }

    return res.json(departments);
}

export async function createDepartment(req: Request, res: Response, next: NextFunction) {
    const { title, description } = req.body;

    const createDepartment: Omit<Department, 'id'> = {
        title,
        slug: slugify(title),
        description,
    };

    const newDepartment = await insertDepartment(createDepartment);

    if (!newDepartment) {
        return next(new Error('Unable to create department'));
    }
    return res.status(201).json(newDepartment);
}

export async function getDepartment(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;

    const department = await getDepartmentBySlug(slug);

    return res.json(department);
}

function isString(s: unknown) {
    return typeof s === 'string';
}

export async function updateDepartment(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    const { body } = req;

    const id = await getDepartmentIdBySlug(slug);

    const fields = [
        isString(body.title) ? 'title' : null,
        isString(body.title) ? 'slug' : null,
        isString(body.description) ? 'description' : null,
        isString(body.csv) ? 'csv' : null,
    ]

    const values = [
        isString(body.title) ? body.title : null,
        isString(body.description) ? body.description : null,
        isString(body.csv) ? body.csv : null,
        isString(body.title) ? body.slug : null,
    ]

    if (id) {
        const result = await conditionalUpdate('departments', id.toString(), fields, values);
        if (!result) {
            return res.status(400).json({
                error: 'Bad Request'
            })
        }
        return res.status(200).json(result);
    }

    return res.status(404).json({
        error : 'Not Found'
    });
}

export async function deleteDepartment(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;

    const result = deleteDepartmentBySlug(slug);

    if (!result) {
        return res.status(500).json({
            error: 'Internal Error'
        });
    }

    return res.status(204).json({
        error: 'Not Found'
    })
}