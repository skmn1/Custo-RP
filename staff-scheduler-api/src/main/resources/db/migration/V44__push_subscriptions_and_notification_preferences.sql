-- Task 60: Web Push Notifications
-- push_subscriptions table for VAPID web push subscription storage
-- notification_preferences table for per-employee per-category opt-in/out

CREATE TABLE push_subscriptions (
    id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID    NOT NULL,
    employee_id  VARCHAR(50) NOT NULL,
    endpoint     TEXT    NOT NULL UNIQUE,
    p256dh_key   TEXT    NOT NULL,
    auth_key     TEXT    NOT NULL,
    user_agent   VARCHAR(500),
    is_active    BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_push_subs_employee ON push_subscriptions(employee_id) WHERE is_active = true;
CREATE INDEX idx_push_subs_user     ON push_subscriptions(user_id)     WHERE is_active = true;

-- Per-employee, per-category notification preferences
-- push_enabled controls whether web push fires for that category
CREATE TABLE notification_preferences (
    id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id  VARCHAR(50) NOT NULL,
    category     VARCHAR(50) NOT NULL,
    in_app_enabled  BOOLEAN NOT NULL DEFAULT true,
    push_enabled    BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (employee_id, category)
);

CREATE INDEX idx_notif_prefs_employee ON notification_preferences(employee_id);
