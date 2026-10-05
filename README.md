# Collaborative Code Review Platform

An API-driven collaborative code review platform built with Node.js, TypeScript, Express, PostgreSQL, JWT authentication, and WebSockets.

The platform allows developers to submit code for review, reviewers to provide feedback, approve submissions or request changes, and users to receive notifications about review activity.

## Project Overview

The Collaborative Code Review Platform is a backend API designed to support collaboration between code submitters and reviewers.

The platform provides functionality for:

- User registration and login
- JWT-based authentication
- Role-based authorization
- User profile management
- Project creation and membership
- Code submissions
- Code review comments
- Submission approval
- Change requests
- Review history
- Notifications
- Real-time WebSocket notifications
- User statistics
- Input validation
- Error handling
- Security testing


## Technologies Used

### Backend

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- JSON Web Tokens (JWT)
- bcryptjs
- WebSocket (`ws`)
- CORS
- dotenv

### Development Tools

- Visual Studio Code
- PostgreSQL
- pgAdmin 4
- Postman
- Git
- GitHub
- npm

## Project Features

The platform includes the following major features:

### Authentication

- User registration
- User login
- Password hashing
- JWT authentication
- Token validation
- Role-based authorization

### User Management

- View user profile
- Update user profile
- Delete user account

### Project Management

- Create projects
- View accessible projects
- Add project members
- Remove project members

### Code Submissions

- Create submissions
- View submissions
- View a single submission
- Update submissions
- Delete submissions
- Track submission status

### Code Reviews

- Add review comments
- View review comments
- Update review comments
- Delete review comments
- Approve submissions
- Request changes
- Store review history

### Notifications

- View notifications
- Automatically create notifications after reviews
- Real-time WebSocket notifications

### Statistics

- Total projects
- Total submissions
- Pending submissions
- Submissions in review
- Approved submissions
- Submissions requiring changes
- Total review comments

### Security and Validation

- JWT authentication
- Role-based access control
- Input validation
- ID validation
- Authorization checks
- Global error handling


## Prerequisites

Before installing the project, make sure the following software is installed:

- Node.js
- npm
- PostgreSQL
- pgAdmin 4
- Visual Studio Code
- Postman

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

The project was developed using Node.js 24.


## Installation

### Step 1: Clone the Repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
```

Move into the project directory:

```bash
cd Code-Collaborative-Review
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all dependencies listed in `package.json`.


## Database Setup

The application uses PostgreSQL.

### Step 1: Create the Database

Open PostgreSQL using pgAdmin 4 and create a database called:

```text
code_review_DB
```

### Step 2: Run the Database Schema

The database schema is located at:

```text
database/schema.sql
```

Open the file and execute the SQL commands in pgAdmin 4.

The database contains:

- `users`
- `projects`
- `project_members`
- `submissions`
- `comments`
- `review_history`
- `notifications`


## Database Tables

### Users

Stores user account details, roles, password hashes, profile information and timestamps.

Available roles:
```text
submitter
reviewer
```

### Projects

Stores project names, descriptions, repository URLs and project creators.

### Project Members

Connects users to projects and allows multiple users to collaborate on a project.

### Submissions

Stores submitted code, project references, submitters, programming languages and review statuses.

Available statuses:
```text
pending
in_review
approved
changes_requested
```

### Comments

Stores reviewer feedback. Comments can optionally contain a line number identifying a specific line of code.

### Review History

Stores review decisions such as:
```text
approved
changes_requested
```

### Notifications

Stores persistent user notifications and whether each notification has been read.


## Environment Variables

Create a `.env` file in the project root.

Example:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/code_review
JWT_SECRET=your_secret_key
PORT=3000
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.


## Running the Application

Start the development server:

```bash
npm run dev
```

The Express API runs on:

```text
http://localhost:3000
```

The WebSocket server runs on:

```text
ws://localhost:3001
```

A successful startup should display messages similar to:

```text
Server is running on http://localhost:3000
Database connected successfully!
Database time: ...
WebSocket server is running on ws://localhost:3001
```

## Testing the API with Postman

Start the application:

```bash
npm run dev
```

Use this base URL in Postman:

```text
http://localhost:3000
```

For protected endpoints, add:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

## Authentication

### Register a User

```http
POST /api/auth/register
```

Example:

```json
{
    "name": "First",
    "surname": "User",
    "email": "user@example.com",
    "password": "Password123",
    "cell_number": "0712345678",
    "role": "submitter"
}
```

### Login

```http
POST /api/auth/login
```

Example:

```json
{
    "email": "user@example.com",
    "password": "Password123"
}
```

A successful login returns a JWT token used for protected requests:


## User Management

### Get a User

```http
GET /api/users/:id
```

### Update a User

```http
PUT /api/users/:id
```
Users can update their own profile information.

Sensitive fields such as the role, password hash and user ID cannot be changed through this endpoint.

### Delete User

```http
DELETE /api/users/:id
```
Users can only delete their own accounts.


## Project Management

### Create Project

```http
POST /api/projects
```

Example:

```json
{
    "name": "Code Review API",
    "description": "A collaborative code review project",
    "repository_url": "https://github.com/example/project"
}
```

The authenticated user automatically becomes the project creator.

### Get Projects

```http
GET /api/projects
```
Returns projects created by or accessible to the authenticated user.

### Add Project Member

```http
POST /api/projects/:projectId/members
```

Example:
```json
{
    "userId": 2
}
```
Only the project creator can manage project members.

### Remove Project Member

```http
DELETE /api/projects/:projectId/members/:userId
```
Only the project creator can remove project members.


## Code Submissions

### Create Submission

```http
POST /api/submissions
```

Example:
```json
{
    "project_id": 1,
    "title": "Login API",
    "code": "const login = () => {}",
    "language": "TypeScript"
}
```

The authenticated user automatically becomes the submitter.

### Get Submissions

```http
GET /api/submissions
```

Returns submissions accessible to the authenticated user.

### Get One Submission

```http
GET /api/submissions/:id
```

### Update Submission

```http
PUT /api/submissions/:id
```
A submitter can update their own submission.

The review status is managed through the review workflow.

### Delete Submission

```http
DELETE /api/submissions/:id
```
A submitter can delete their own submission.


## Code Review Comments

Only reviewers can create code review comments.

### Add Comment

```http
POST /api/submissions/:submissionId/comments
```
Example:
```json
{
    "content": "This function could be simplified.",
    "line_number": 15
}
```

### Get Comments

```http
GET /api/submissions/:submissionId/comments
```

### Update Comment

```http
PUT /api/comments/:id
```
Reviewers can update their own comments.

### Delete Comment

```http
DELETE /api/comments/:id
```
Reviewers can delete their own comments.


## Review Workflow

### Approve Submission

```http
PATCH /api/submissions/:id/approve
```

Example:
```json
{
    "comment": "The code looks good and meets the requirements."
}
```

When a submission is approved:

1. Its status changes to `approved`.
2. A review history record is created.
3. A persistent notification is created.
4. A real-time WebSocket notification is sent.

### Request Changes

```http
PATCH /api/submissions/:id/request-changes
```

Example:
```json
{
    "comment": "Please improve error handling."
}
```

When changes are requested:

1. The status changes to `changes_requested`.
2. A review history record is created.
3. A persistent notification is created.
4. A real-time WebSocket notification is sent.

A review comment is required when requesting changes.


## Review History

Review history actions taken by reviewers.
Each record contains:

- Submission
- Reviewer
- Action
- Comment
- Date and time

Supported actions are:
```text
approved
changes_requested
```
This provides an audit history of review decisions.


## Notifications

Notifications are stored in PostgreSQL so users can access them even if they were offline when a review occurred.

### Get Notifications

```http
GET /api/notifications
```

### Mark Notification as Read

```http
PATCH /api/notifications/:id/read
```
Users can only modify their own notifications.


## 21. Statistics

### Get User Statistics

```http
GET /api/stats
```

## WebSocket Real-Time Notifications

The WebSocket server runs on:

```text
ws://localhost:3001
```

Connect a user with:

```text
ws://localhost:3001?userId=USER_ID
```

Approval example:

```json
{
    "type": "notification",
    "message": "Your submission \"Login API\" has been approved."
}
```

Changes-requested example:

```json
{
    "type": "notification",
    "message": "Changes have been requested for your submission \"Login API\". Reviewer comment: Please improve the error handling."
}
```
Database notifications provide persistence while WebSocket notifications provide immediate real-time feedback.


## Authentication, Authorization and Security

The platform uses JWT authentication and role-based authorization.

### Submitters

Submitters can:

- Register and log in
- Manage their own profile
- Create projects
- Access projects they belong to
- Create submissions
- Update and delete their own submissions
- View review comments and history
- View notifications
- Mark their notifications as read
- View statistics

Submitters cannot:

- Approve submissions
- Request changes
- Create reviewer comments
- Modify another user's profile
- Delete another user's account
- Modify another user's notifications

### Reviewers

Reviewers can:

- Register and log in
- Manage their own profile
- Access assigned projects
- View submissions
- Create review comments
- Update and delete their own comments
- Approve submissions
- Request changes
- View review history
- View notifications and statistics

Reviewers must have access to the relevant project before reviewing its submissions.

### JWT Authentication

Protected routes require:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```
The authentication middleware checks the header format, verifies the token and makes the authenticated user's ID and role available to the application.

### Password Security

Passwords are hashed using `bcryptjs` before being stored in PostgreSQL.

### Environment Variable Security

Sensitive configuration such as the database connection string and JWT secret is stored in environment variables.

The `.env` file should never be committed to GitHub.


## Testing

The API was tested throughout development using Postman, PostgreSQL and pgAdmin 4.


### Final Build Test

Run:

```bash
npm run build
```

A successful build confirms that the TypeScript source code compiles without errors.


## 28. Author

- Malesela Phineas Ngoasheng