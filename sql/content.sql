CREATE TABLE public.content
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    title text NOT NULL,
    text text NOT NULL,
    PRIMARY KEY (id)
);
