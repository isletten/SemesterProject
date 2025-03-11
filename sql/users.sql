CREATE TABLE public.users
(
    userid integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    PRIMARY KEY (userid)
);

