DROP VIEW IF EXISTS dashboard_with_collections;

CREATE VIEW
    dashboard_with_collections AS
SELECT
    qt.*,
    qcl.collection_id,
    qc.title as "collection_title"
FROM
    question_table_view qt
    LEFT JOIN question_collection_link qcl ON qcl.question_id = qt.question_id
    LEFT JOIN question_collection qc ON qcl.collection_id = qc.id;
    
SELECT *
FROM dashboard_with_collections
WHERE collection_id IS NOT NULL
LIMIT 5;