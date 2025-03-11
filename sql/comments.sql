CREATE TABLE public.comments
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY,
    userid integer NOT NULL,
    itemid integer NOT NULL,
    comment text NOT NULL,
    PRIMARY KEY (id)
);
