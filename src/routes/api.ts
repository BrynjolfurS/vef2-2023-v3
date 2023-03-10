import express, { Request, Response, NextFunction } from 'express';
import { listCourses } from './courses.js';
// import { createCourse, getCourse, updateCourse, listCourses, deleteCourse } from './courses.js';
import { listDepartments, createDepartment, getDepartment,
updateDepartment, deleteDepartment } from './departments.js';

// createDepartment, getDepartment, updateDepartment, deleteDepartment,

export const router = express.Router();


async function index(req: Request, res: Response) {
  return res.json([
    {
      href: '/departments',
      methods: ['GET', 'POST'],
    },
    {
      href: '/departments/:slug',
      methods: ['GET', 'PATCH', 'DELETE'],
    },
    {
      href: '/departments/:slug/courses',
      methods: ['GET', 'POST'],
    },
    {
      href: '/departments/:slug/courses/:courseId',
      methods: ['GET', 'PATCH', 'DELETE'],
    },
  ]);
}

// Departments
router.get('/', index);
router.get('/departments', listDepartments);
router.post('/departments', createDepartment);
router.get('/departments/:slug', getDepartment);
router.patch('/departments/:slug', updateDepartment);
router.delete('/departments/:slug', deleteDepartment);

// Courses
router.get('/departments/:slug/courses', listCourses);
// router.post('/departments/:slug/courses', createCourse);
// router.get('/departments/:slug/courses/:courseId', getCourse);
// router.patch('/departments/:slug/courses/:courseId', updateCourse);
// router.delete('/departments/:slug/courses/:courseId', deleteCourse);