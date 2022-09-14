CREATE TABLE semester(
    semester_id INT AUTO_INCREMENT PRIMARY KEY,
    start_date DATE,
    end_date DATE,
    term_name VARCHAR(20),
    semester_year SMALLINT,
    school_year_name VARCHAR(20)
)