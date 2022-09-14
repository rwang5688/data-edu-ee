CREATE TABLE course_outcome(
    student_id      BIGINT,
    course_id       BIGINT,
    semester_id     BIGINT,
    score           DOUBLE PRECISION,
    letter_grade    VARCHAR(2),
    PRIMARY KEY(student_id, course_id, semester_id)
)