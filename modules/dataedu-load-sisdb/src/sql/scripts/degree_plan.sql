CREATE TABLE degree_plan(
    student_id                  BIGINT,
    course_id                   BIGINT,
    course_seq_no               SMALLINT,
    status                      VARCHAR(10),
    is_major_ind                SMALLINT,
    semester_seq_no             SMALLINT,
    PRIMARY KEY(student_id, course_id, course_seq_no)
)