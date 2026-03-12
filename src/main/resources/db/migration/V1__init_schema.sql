-- Users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    activation_code VARCHAR(64),
    activation_code_expires_at TIMESTAMP,
    password_reset_code VARCHAR(64),
    password_reset_expires_at TIMESTAMP,
    avatar_url VARCHAR(512),
    bio VARCHAR(500),
    karma INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);

-- Subreddits
CREATE TABLE subreddits (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    sidebar VARCHAR(4000),
    banner_url VARCHAR(512),
    icon_url VARCHAR(512),
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_private BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE subreddit_rules (
    id BIGSERIAL PRIMARY KEY,
    subreddit_id BIGINT NOT NULL REFERENCES subreddits(id) ON DELETE CASCADE,
    sort_order INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000)
);

CREATE TABLE post_flairs (
    id BIGSERIAL PRIMARY KEY,
    subreddit_id BIGINT NOT NULL REFERENCES subreddits(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    background_color VARCHAR(7),
    text_color VARCHAR(7)
);

CREATE TABLE subreddit_moderators (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subreddit_id BIGINT NOT NULL REFERENCES subreddits(id) ON DELETE CASCADE,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, subreddit_id)
);

CREATE TABLE subreddit_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subreddit_id BIGINT NOT NULL REFERENCES subreddits(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, subreddit_id)
);

CREATE TABLE banned_users (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subreddit_id BIGINT NOT NULL REFERENCES subreddits(id) ON DELETE CASCADE,
    banned_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(500),
    banned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, subreddit_id)
);

-- Posts
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    content TEXT,
    post_type VARCHAR(20) NOT NULL,
    link_url VARCHAR(2048),
    image_url VARCHAR(512),
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subreddit_id BIGINT NOT NULL REFERENCES subreddits(id) ON DELETE CASCADE,
    flair_id BIGINT REFERENCES post_flairs(id) ON DELETE SET NULL,
    vote_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    is_removed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_posts_subreddit_created ON posts(subreddit_id, created_at DESC);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_vote_count ON posts(subreddit_id, vote_count DESC);

-- Comments
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    vote_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    is_removed BOOLEAN NOT NULL DEFAULT FALSE,
    depth INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_created ON comments(post_id, created_at ASC);

-- Votes
CREATE TABLE votes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    value INT NOT NULL CHECK (value IN (1, -1)),
    UNIQUE (user_id, post_id),
    UNIQUE (user_id, comment_id),
    CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

CREATE INDEX idx_votes_post ON votes(post_id);
CREATE INDEX idx_votes_comment ON votes(comment_id);

-- Saved posts
CREATE TABLE saved_posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    saved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, post_id)
);

-- Reports
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
    comment_id BIGINT REFERENCES comments(id) ON DELETE CASCADE,
    reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL))
);

CREATE INDEX idx_reports_unresolved ON reports(resolved) WHERE NOT resolved;
