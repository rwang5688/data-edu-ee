CREATE TABLE course_schedule(
    course_id BIGINT,
    semester_id BIGINT,
    staff_id BIGINT,
    lecture_days VARCHAR(7),
    lecture_start_hour  SMALLINT,
    lecture_duration SMALLINT,
    lab_days VARCHAR(7),
    lab_start_hour SMALLINT,
    lab_duration SMALLINT,
    PRIMARY KEY (course_id, Semester_id, staff_id)
)