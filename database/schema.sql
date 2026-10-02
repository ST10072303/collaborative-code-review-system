/* USER TABLE 
  - submitter
  - reviewer
*/
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'submitter',
    display_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    /* only the roles supported by the application can be stored in the database. */
    CONSTRAINT users_role_check
        CHECK (role IN ('submitter', 'reviewer'))
);

/* PROJECTS TABLE
  store projects/repositories for code reviewa
 */
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    repository_url TEXT,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    /* a user who creates a project must exist in the users table. */
    CONSTRAINT projects_created_by_fk
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE CASCADE
);

/* PROJECT_MEMBERS TABLE
  Connects users to projects.
  a project can have many members.
  a user can belong to many projects.
 */

CREATE TABLE project_members (
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    /* a user should only be assigned to the same  project once. */
    PRIMARY KEY (project_id, user_id),
    CONSTRAINT project_members_project_fk
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT project_members_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

/* SUBMISSIONS TABLE
  Stores code snippets or text files submitted for review.
 */
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    submitted_by INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    /*  A submission belongs to a project.*/
    CONSTRAINT submissions_project_fk
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    /* Keep track of which user submitted the code. */
    CONSTRAINT submissions_user_fk
        FOREIGN KEY (submitted_by)
        REFERENCES users(id)
        ON DELETE CASCADE,

    /* Only these four statuses are allowed. */
    CONSTRAINT submissions_status_check
        CHECK (
            status IN ('pending', 'in_review', 'approved', 'changes_requested')
        )
);

/* COMMENTS TABLE
  Stores reviewer feedback on code submissions.
 */

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    line_number INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    /* The comment belongs to a submission. */
    CONSTRAINT comments_submission_fk
        FOREIGN KEY (submission_id)
        REFERENCES submissions(id)
        ON DELETE CASCADE,

    /* Keep track of which user wrote the comment. */
    CONSTRAINT comments_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    /* if a line number is provided, it must be greater than zero. */
    CONSTRAINT comments_line_number_check
        CHECK (
            line_number IS NULL OR line_number > 0
        )
);

/* Stores the history of review actions performed on submissions. */
CREATE TABLE review_history (
    id SERIAL PRIMARY KEY,

    /* The submission being reviewed. */
    submission_id INTEGER NOT NULL
        REFERENCES submissions(id) ON DELETE CASCADE,

    /* The reviewer who performed the action.*/
    reviewer_id INTEGER NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    /* The review action that was performed. */
    action VARCHAR(50) NOT NULL
        CHECK (action IN ('approved', 'changes_requested')),

    /* Optional explanation from the reviewer. */
    comment TEXT,

    /* When the review action was performed. */
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*notifications table*/
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    message TEXT NOT NULL,
    /* tracks whether the notification has been read */
    is_read BOOLEAN DEFAULT FALSE,
    /* When the notification was created*/
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);