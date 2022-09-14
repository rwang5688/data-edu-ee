CREATE TABLE course_registration(
    date_registered DATE,
    date_dropped    DATE,
    student_id      BIGINT,
    course_id       BIGINT,
    status          VARCHAR(10),
    semester_id     BIGINT,
    update_ts       TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY(date_registered, student_id, course_id)
)