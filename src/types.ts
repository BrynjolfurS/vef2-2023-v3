// export interface Department {
//     title: string;
//     slug: string;
//     description: string;
// }

// export interface Course {
//     courseNumber: string,
//     credits: number;
//     semester: string;
//     level: string;
//     url: string;
//     departmentId: number;
//     courseId: number;
// }

export type Department = {
    id: number;
    title: string;
    slug: string;
    description: string;
    created?: Date;
    updated?: Date;
}

export type DepartmentImport = {
    title: string;
    slug: string;
    description: string;
    csv: string;
}

export type Course = {
    // courseId: number;
    // department_id: number;
    courseNumber: string;
    title: string;
    slug?: string;
    credits?: number;
    semester?: string;
    level?: string;
    url?: string;
    created?: Date;
    updated?: Date;
}