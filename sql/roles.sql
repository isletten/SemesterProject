CREATE TABLE public.roles
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    userid integer NOT NULL,
    role text NOT NULL,
    PRIMARY KEY (id)
);
