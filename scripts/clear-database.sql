-- Clear all data in UpDog database (schema is kept).
-- CASCADE also truncates: user_roles, subreddits, subreddit_rules, post_flairs,
-- subreddit_moderators, subreddit_subscriptions, banned_users, posts,
-- comments, votes, saved_posts, reports.
-- Usage: psql or via docker exec (see scripts/README.md).

TRUNCATE TABLE users RESTART IDENTITY CASCADE;
