import { courseApi, rubricServiceApi } from "@/services/axiosConfig.ts";

export interface CloPayload {
    cloCode: string;
    cloName: string;
    description: string;
    bloomLevel: string;
    courseId: string;
}

export interface CloResponse {
    cloId: string;
    cloCode: string;
    cloName: string;
    description: string;
    bloomLevel: string;
    courseId: string;
}

export interface CourseOption {
    courseId: string;
    courseCode?: string;
    courseName: string;
    credits?: number;
    department?: string;
}

export interface RubricCriterion {
    id: string;
    name: string;
    weight: number;
    cloId?: string | null;
}

export interface RubricLevel {
    id: string;
    rubricId?: string;
    name: string;
    orderIndex: number;
}

export interface CriterionLevelDescriptor {
    id: string;
    criterionId: string;
    levelId: string;
    score: number;
    description: string;
}

export interface RubricResponse {
    id: string;
    name: string;
    description: string;
    totalWeight: number;
    criteria: RubricCriterion[];
    levels?: RubricLevel[];
    criterionLevelDescriptors?: CriterionLevelDescriptor[];
    facultyId?: string | null;
    lecturerId?: string | null;
    rubricType?: "FACULTY" | "LECTURER_VARIANT";
    visibility?: "FACULTY" | "PRIVATE";
    rootRubricId?: string | null;
    parentRubricId?: string | null;
    versionNumber?: number;
    currentHead?: boolean;
    status?: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";
}

type RawRecord = Record<string, unknown>;

const toNumber = (value: unknown, fallback = 0) => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);

        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return fallback;
};

const toCriteria = (value: unknown): RubricCriterion[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((item, index) => {
        const criterion = item as RawRecord;

        return {
            id: String(criterion.id ?? criterion.criterionId ?? `criterion-${index}`),
            name: String(criterion.name ?? criterion.criterionName ?? `Criterion ${index + 1}`),
            weight: toNumber(criterion.weight),
            cloId: criterion.cloId ? String(criterion.cloId) : null,
        };
    });
};

const toLevels = (value: unknown): RubricLevel[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item, index) => {
            const level = item as RawRecord;

            return {
                id: String(level.id ?? level.levelId ?? `level-${index}`),
                rubricId: level.rubricId ? String(level.rubricId) : undefined,
                name: String(level.name ?? level.levelName ?? `Level ${index + 1}`),
                orderIndex: toNumber(level.orderIndex ?? level.order_index, index + 1),
            };
        })
        .sort((a, b) => a.orderIndex - b.orderIndex);
};

const toDescriptors = (value: unknown): CriterionLevelDescriptor[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((item, index) => {
        const descriptor = item as RawRecord;

        return {
            id: String(descriptor.id ?? `descriptor-${index}`),
            criterionId: String(descriptor.criterionId ?? descriptor.criterion_id ?? ""),
            levelId: String(descriptor.levelId ?? descriptor.level_id ?? ""),
            score: toNumber(descriptor.score),
            description: String(descriptor.description ?? ""),
        };
    });
};

const normalizeRubric = (raw: RawRecord): RubricResponse => {
    const criteria = toCriteria(raw.criteria);
    const levels = toLevels(raw.levels ?? raw.rubricLevels);
    const criterionLevelDescriptors = toDescriptors(
        raw.criterionLevelDescriptors ?? raw.descriptors ?? raw.criterion_level_descriptors,
    );

    return {
        id: String(raw.id ?? raw.rubricId ?? ""),
        name: String(raw.name ?? raw.rubricName ?? "Untitled Rubric"),
        description: String(raw.description ?? ""),
        totalWeight: toNumber(
            raw.totalWeight ?? criteria.reduce((sum, criterion) => sum + Number(criterion.weight || 0), 0),
        ),
        criteria,
        levels,
        criterionLevelDescriptors,
        facultyId: raw.facultyId ? String(raw.facultyId) : null,
        lecturerId: raw.lecturerId ? String(raw.lecturerId) : null,
        rubricType: raw.rubricType as RubricResponse["rubricType"],
        visibility: raw.visibility as RubricResponse["visibility"],
        rootRubricId: raw.rootRubricId ? String(raw.rootRubricId) : null,
        parentRubricId: raw.parentRubricId ? String(raw.parentRubricId) : null,
        versionNumber: toNumber(raw.versionNumber, 1),
        currentHead: Boolean(raw.currentHead),
        status: raw.status as RubricResponse["status"],
    };
};

export const getAllRubric = () => {
    return rubricServiceApi.get("/rubrics");
};

export const getMyRubrics = () => {
    return rubricServiceApi.get("/rubrics/me");
};

export const getRubricDetail = async (rubricId: string): Promise<RubricResponse> => {
    try {
        const response = await rubricServiceApi.get(`/rubrics/${rubricId}`);

        return normalizeRubric(response.data as RawRecord);
    } catch (error) {
        const response = await getAllRubric();
        const list = Array.isArray(response.data) ? response.data : [];
        const matched = list.find((item: RawRecord) => String(item.id ?? item.rubricId) === rubricId);

        if (!matched) {
            throw error;
        }

        return normalizeRubric(matched as RawRecord);
    }
};

export const getAllClo = () => {
    return rubricServiceApi.get<CloResponse[]>("/course-clo");
};

export const getClosByCourse = (courseId: string) => {
    return rubricServiceApi.get<CloResponse[]>("/course-clo", { params: { courseId } });
};

export const getCloById = (cloId: string) => {
    return rubricServiceApi.get<CloResponse>(`/course-clo/${cloId}`);
};

export const createClo = (data: CloPayload) => {
    return rubricServiceApi.post("/course-clo", data);
};

export const updateClo = (cloId: string, data: CloPayload) => {
    return rubricServiceApi.put(`/course-clo/${cloId}`, data);
};

export const getCourseOptions = async () => {
    const response = await courseApi.get("/courses", {
        params: {
            page: 0,
            size: 1000,
        },
    });

    return (response.data?.content ?? []) as CourseOption[];
};

export const getRubricMatrix = () => {
    return rubricServiceApi.get('/rubrics/matrix');
}
export const updateRubricMatrix = (payload : any) => {
    return rubricServiceApi.post('/rubric-matrices',payload);
}

export const cloneRubricVersion = (
    sourceRubricId: string,
    payload: { rubricName?: string; description?: string } = {},
) => {
    return rubricServiceApi.post(`/rubrics/${sourceRubricId}/clone`, payload);
};

export const submitRubricVersion = (rubricId: string) => {
    return rubricServiceApi.put(`/rubrics/${rubricId}/submit`);
};

export const revertRubricHead = (rubricId: string) => {
    return rubricServiceApi.put(`/rubrics/${rubricId}/head`);
};

export const getRubricForEdit = async (rubricId: string) => {
    const response = await rubricServiceApi.get(`/rubrics/${rubricId}`);
    const raw = response.data as RawRecord;
    return {
        rubricId: String(raw.rubricId ?? rubricId),
        rubricName: String(raw.rubricName ?? raw.name ?? ""),
        description: String(raw.description ?? ""),
        courseId: raw.courseId ? String(raw.courseId) : undefined,
        criteria: Array.isArray(raw.criteria) ? raw.criteria.map((item) => {
            const criterion = item as RawRecord;
            return {
                id: String(criterion.criteriaId ?? criterion.id ?? ""),
                name: String(criterion.criteriaName ?? criterion.name ?? ""),
                description: String(criterion.description ?? ""),
                cloId: criterion.cloId ? String(criterion.cloId) : null,
                weight: toNumber(criterion.weight),
                levels: Array.isArray(criterion.levels) ? criterion.levels.map((levelItem, index) => {
                    const level = levelItem as RawRecord;
                    return {
                        id: String(level.levelId ?? level.id ?? ""),
                        name: String(level.levelName ?? level.name ?? ""),
                        description: String(level.description ?? ""),
                        score: toNumber(level.score),
                        orderIndex: index + 1,
                    };
                }) : [],
            };
        }) : [],
    };
};
