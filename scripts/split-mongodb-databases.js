// Run with: mongosh mongodb://localhost:27017/db_rubric scripts/split-mongodb-databases.js
// Existing target collections are left untouched when they already contain data.

const source = db.getSiblingDB("db_rubric");
const targets = {
    db_course: [
        "assessment_papers",
        "chapters",
        "comments",
        "messages",
        "posts",
        "question_banks",
        "questions",
        "student_exam_assignments",
        "system_logs"
    ],
    db_notification: ["notifications"]
};

const sourceCollections = new Set(source.getCollectionNames());

for (const [targetDatabaseName, collections] of Object.entries(targets)) {
    const target = db.getSiblingDB(targetDatabaseName);

    for (const collectionName of collections) {
        if (!sourceCollections.has(collectionName)) {
            if (!target.getCollectionNames().includes(collectionName)) {
                target.createCollection(collectionName);
            }
            print(`Initialized empty collection ${targetDatabaseName}.${collectionName}`);
            continue;
        }

        if (target.getCollection(collectionName).countDocuments({}) > 0) {
            print(`Skip non-empty collection ${targetDatabaseName}.${collectionName}`);
            continue;
        }

        source.getCollection(collectionName).aggregate([
            { $match: {} },
            { $out: { db: targetDatabaseName, coll: collectionName } }
        ]).toArray();

        const indexes = source.getCollection(collectionName).getIndexes()
            .filter(index => index.name !== "_id_");

        for (const index of indexes) {
            const { key, name, unique, sparse, expireAfterSeconds, partialFilterExpression } = index;
            const options = {
                name,
                ...(unique === undefined ? {} : { unique }),
                ...(sparse === undefined ? {} : { sparse }),
                ...(expireAfterSeconds === undefined ? {} : { expireAfterSeconds }),
                ...(partialFilterExpression === undefined ? {} : { partialFilterExpression })
            };
            target.getCollection(collectionName).createIndex(key, options);
        }

        print(`Copied db_rubric.${collectionName} -> ${targetDatabaseName}.${collectionName}`);
    }
}
