CREATE SEQUENCE mal_tokens_sequence
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE CACHE 1;

CREATE TABLE mal_tokens
(
    id            BIGINT PRIMARY KEY DEFAULT nextval('mal_tokens_sequence'),

    username      VARCHAR(255) NOT NULL UNIQUE,

    access_token  TEXT         NOT NULL,
    refresh_token TEXT         NOT NULL,

    expires_at    TIMESTAMPTZ  NOT NULL
);

ALTER SEQUENCE mal_tokens_sequence
    OWNED BY mal_tokens.id;
