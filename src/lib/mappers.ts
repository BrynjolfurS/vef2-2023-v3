import { QueryResult } from "pg";
import { Department, Course } from '../types.js';

export function departmentMapper(input: QueryResult<any> | null): Department | null{
    const potentialDepartment = input as Partial<Department> | null;

    if (!potentialDepartment || 
        !potentialDepartment.id || 
        !potentialDepartment.title ||
        !potentialDepartment.slug ||
        !potentialDepartment.description ||
        !potentialDepartment.created ||
        !potentialDepartment.updated) {
        return null;
    }

    const department: Department = {
        id: potentialDepartment.id,
        title: potentialDepartment.title,
        slug: potentialDepartment.slug,
        description: potentialDepartment.description,
        created: new Date(potentialDepartment.created),
        updated: new Date(potentialDepartment.updated),
    };

    return department;
}

export function courseMapper(input: QueryResult<any> | null): Course | null {
    const potentialCourse = input as Partial<Course> | null;
    console.log(potentialCourse);
    if (
        !potentialCourse?.courseNumber ||
        !potentialCourse?.title ||
        !potentialCourse?.slug ||
        !potentialCourse?.credits ||
        !potentialCourse.created ||
        !potentialCourse.updated) {
            return null;
    }

    // TODO: Sumt er valfrjálst eða getur vantað
    const course: Course = {
        courseNumber: potentialCourse.courseNumber,
        title: potentialCourse.title,
        slug: potentialCourse.slug,
        credits: potentialCourse.credits,
        semester: (potentialCourse.semester) ? potentialCourse.semester : "",
        level: (potentialCourse.level) ? potentialCourse.level : "",
        url: (potentialCourse.url) ? potentialCourse.url : "",
        created: new Date(potentialCourse.created),
        updated: new Date(potentialCourse.updated),
    };
    return course;
}

export function mapDbCourseToCourse(input: QueryResult<any> | null): Course | null{
    if (!input) {
        return null;
    }
    return courseMapper(input.rows[0]);
}

export function mapDbDepartmentToDepartment(input: QueryResult<any> | null): Department | null {
    if (!input) {
        return null;
    }
    return departmentMapper(input.rows[0]);
}

export function mapDbCoursesToCourses(input: QueryResult<any> | null): Array<Course> {
    if (!input) {
        return [];
    }
    
    const mappedCourses = input.rows.map(courseMapper);
    return mappedCourses.filter((i): i is Course => Boolean(i));
}

export function mapDbDepartmentsToDepartments(input: QueryResult<any> | null): Array<Department> {
    if (!input) {
        
        return [];
    }
    const mappedDepartments = input.rows.map(departmentMapper);
    return mappedDepartments.filter((i): i is Department => Boolean(i));
}

export function valueToSementer(input: string | undefined): string {
    if (input === undefined || !input) {
        return "";
    }
    return input;
}