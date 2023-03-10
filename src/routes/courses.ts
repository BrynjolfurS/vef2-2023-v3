import { Request, Response, NextFunction } from "express";
import { getCourses, getDepartmentIdBySlug } from "../lib/db.js";

export async function listCourses(req: Request, res: Response, next: NextFunction) {
    const { slug } = req.params;
    const dptId = await getDepartmentIdBySlug(slug);
    if (typeof dptId === 'number') {
        const courses = await getCourses(dptId);
        if (!courses) {
            return next(new Error('Unable to get courses'));
        }
        return res.json(courses);
    } else {
        return res.status(404).json({
            error: 'Deild ekki til'
        });
    }

}

// export async function createCourse(params:type) {
    
// }

// export async function getCourse(params:type) {
    
// }

// export async function updateCourse(params:type) {
    
// }

// export async function deleteCourse(params:type) {
    
// }