CREATE TABLE faculty(
    faculty_id	INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30),
    last_name  VARCHAR(30),
    gender VARCHAR(1),
    department_id BIGINT,
    tenure_years SMALLINT,
    is_tenured	SMALLINT,
    title VARCHAR(30),
    dept_chair SMALLINT
)