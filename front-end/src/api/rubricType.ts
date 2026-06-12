type CloType = {
    cloId: string;
    cloCode: string;
};

export interface Level {
    id?: string;
    name: string;
    orderIndex: number;
    score: number;
    description: string;
}

type CriteriaType = {
    criteriaId?: string;
    criteriaName: string;
    weight: number;
    cloId: string | null;
    levels: Level[];
};

type RubricResponse = {
    rubricId: string;
    rubricName: string;
    description: string;
    totalWeight: number;
    criteria: CriteriaType[];
};