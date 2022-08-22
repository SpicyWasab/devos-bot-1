# Devos Bot

## Description

A bot managing the [Devos Code](https://discord.gg/SgfzZPckVT) Discord server.

## Build Setup

```bash
# install dependencies
$ npm install

# start the code
$ node index
```

## Discord.js

This project uses the Discord.js library. Click [here](https://discord.js.org) for the documentation and [here](https://discordjs.guide) to read the guide.

## PostgreSQL

This project also uses the postgreSQL database. Click [here](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads) to access the installation page and [here](https://www.postgresql.org/docs/) to read the documentation.

## Tables

Users

```sql
-- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
  id bigint NOT NULL,
  credits double precision,
  experience integer,
  level integer,
  CONSTRAINT users_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
  OWNER to squarfiuz;
```
