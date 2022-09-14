CREATE TABLE course(
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(150),
    course_level SMALLINT,
    course_code VARCHAR(10),
    school_id BIGINT,
    department_id BIGINT
)