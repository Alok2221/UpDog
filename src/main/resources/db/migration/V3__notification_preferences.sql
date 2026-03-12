CREATE TABLE notification_preferences (
    user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    notify_new_posts BOOLEAN NOT NULL DEFAULT TRUE,
    notify_mentions BOOLEAN NOT NULL DEFAULT TRUE,
    notify_comments_on_post BOOLEAN NOT NULL DEFAULT TRUE,
    notify_votes BOOLEAN NOT NULL DEFAULT TRUE,
    notify_replies BOOLEAN NOT NULL DEFAULT TRUE
);

-- Backfill for existing users
INSERT INTO notification_preferences (user_id, notify_new_posts, notify_mentions, notify_comments_on_post, notify_votes, notify_replies)
SELECT id, TRUE, TRUE, TRUE, TRUE, TRUE FROM users;
