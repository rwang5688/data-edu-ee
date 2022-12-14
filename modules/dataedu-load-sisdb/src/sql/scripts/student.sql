CREATE TABLE student(
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    gender VARCHAR(1),
    birth_date DATE,
    email_address VARCHAR(100),
    admitted SMALLINT,
    enrolled SMALLINT,
    parent_alum SMALLINT,
    parent_highest_ed SMALLINT,
    first_gen_hed_student SMALLINT,
    high_school_gpa DOUBLE PRECISION,
    was_hs_athlete_ind SMALLINT,
    home_state_name VARCHAR(50),
    admit_type VARCHAR(15),
    private_hs_indicator SMALLINT,
    multiple_majors_indicator SMALLINT,
    secondary_class_percentile SMALLINT,
    department_id BIGINT,
    admit_semester_id BIGINT,
    first_year_gpa DOUBLE PRECISION,
    cumulative_gpa DOUBLE PRECISION,
    enroll_status VARCHAR(20),
    planned_grad_semester_id BIGINT
)