--
-- PostgreSQL database cluster dump
--

\restrict oVJLgvjWNJiYjocCUDzVoZYgyBi5ohX5H8E8RFeboxVU5P0d8LU0fb82i8i9nDC

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:juaj8ACxqAi3NLcMe9IhkQ==$MN/URuQp4wnQF02T7TF7GRSMqsmDDwVYflMV5bELt3U=:w99qjYqzZVzB+euVCzy7iUZgf3b5lwsaDXntJ/uJYKY=';

--
-- User Configurations
--








\unrestrict oVJLgvjWNJiYjocCUDzVoZYgyBi5ohX5H8E8RFeboxVU5P0d8LU0fb82i8i9nDC

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict ufbw9KAQ03o55j4EgdV9IdXUd3ulsRphevaRpYFgg4ZryzAuT7B2cmyd1UmjVVi

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict ufbw9KAQ03o55j4EgdV9IdXUd3ulsRphevaRpYFgg4ZryzAuT7B2cmyd1UmjVVi

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict OtuqgTA04NQ8gdoaPPjVs610gHrpMAdyvIHnERddpexlYBVfEgDR6Lpo622Ujvo

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict OtuqgTA04NQ8gdoaPPjVs610gHrpMAdyvIHnERddpexlYBVfEgDR6Lpo622Ujvo

--
-- Database "redsea" dump
--

--
-- PostgreSQL database dump
--

\restrict pO6lSsSziwcj04M3CnjU8fUgSMtgeBy9r7Dvis9b8EXePVIUIw02U4JuGWR3UBP

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: redsea; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE redsea WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE redsea OWNER TO postgres;

\unrestrict pO6lSsSziwcj04M3CnjU8fUgSMtgeBy9r7Dvis9b8EXePVIUIw02U4JuGWR3UBP
\connect redsea
\restrict pO6lSsSziwcj04M3CnjU8fUgSMtgeBy9r7Dvis9b8EXePVIUIw02U4JuGWR3UBP

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: accounts_normalbalance_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.accounts_normalbalance_enum AS ENUM (
    'DEBIT',
    'CREDIT'
);


ALTER TYPE public.accounts_normalbalance_enum OWNER TO postgres;

--
-- Name: accounts_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.accounts_type_enum AS ENUM (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE',
    'CASH'
);


ALTER TYPE public.accounts_type_enum OWNER TO postgres;

--
-- Name: car_attachments_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.car_attachments_type_enum AS ENUM (
    'LICENSE',
    'INSURANCE',
    'INSPECTION',
    'PERMIT',
    'OTHER',
    'TAX_ID'
);


ALTER TYPE public.car_attachments_type_enum OWNER TO postgres;

--
-- Name: cars_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.cars_status_enum AS ENUM (
    'AVAILABLE',
    'UNAVAILABLE',
    'ONROAD',
    'UNDER_MAINTENANCE'
);


ALTER TYPE public.cars_status_enum OWNER TO postgres;

--
-- Name: expense_attachments_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expense_attachments_type_enum AS ENUM (
    'invoice',
    'receipt',
    'contract',
    'bill',
    'warranty',
    'other'
);


ALTER TYPE public.expense_attachments_type_enum OWNER TO postgres;

--
-- Name: expense_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expense_status_enum AS ENUM (
    'DRAFT',
    'APPROVED',
    'POSTED',
    'REJECTED',
    'CANCELLED'
);


ALTER TYPE public.expense_status_enum OWNER TO postgres;

--
-- Name: expenses_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.expenses_type_enum AS ENUM (
    'MAINTENANCE',
    'UTILITY',
    'TAX_FEE',
    'INCENTIVE',
    'EXCEPTIONAL',
    'CUSTODY',
    'PENALTY'
);


ALTER TYPE public.expenses_type_enum OWNER TO postgres;

--
-- Name: journals_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.journals_type_enum AS ENUM (
    'GENERAL',
    'SALES',
    'PURCHASES',
    'CASH'
);


ALTER TYPE public.journals_type_enum OWNER TO postgres;

--
-- Name: journey_transactions_category_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.journey_transactions_category_enum AS ENUM (
    'Office Fees',
    'Loading Fees',
    'Weighing Fees',
    'Card Fees',
    'Toll Fees',
    'Crossing Fees',
    'Port Permit Fees',
    'Port Fees',
    'Diesel Fees',
    'Other Expenses',
    'Custody'
);


ALTER TYPE public.journey_transactions_category_enum OWNER TO postgres;

--
-- Name: journey_transactions_transactiontype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.journey_transactions_transactiontype_enum AS ENUM (
    'EXPENSE',
    'REVENUE',
    'ADVANCE'
);


ALTER TYPE public.journey_transactions_transactiontype_enum OWNER TO postgres;

--
-- Name: owners_transactiontype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.owners_transactiontype_enum AS ENUM (
    'INSTAPAY',
    'CASH',
    'BANK',
    'WALLET'
);


ALTER TYPE public.owners_transactiontype_enum OWNER TO postgres;

--
-- Name: salaries_salarytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.salaries_salarytype_enum AS ENUM (
    'FIXED',
    'HOURLY',
    'DAILY',
    'MONTHLY'
);


ALTER TYPE public.salaries_salarytype_enum OWNER TO postgres;

--
-- Name: suppliers_activity_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.suppliers_activity_enum AS ENUM (
    'TRANSPORT',
    'SPARE_PARTS'
);


ALTER TYPE public.suppliers_activity_enum OWNER TO postgres;

--
-- Name: trailer_attachments_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.trailer_attachments_type_enum AS ENUM (
    'LICENSE',
    'INSURANCE',
    'INSPECTION',
    'PERMIT',
    'OTHER',
    'TAX_ID'
);


ALTER TYPE public.trailer_attachments_type_enum OWNER TO postgres;

--
-- Name: trailers_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.trailers_status_enum AS ENUM (
    'AVAILABLE',
    'UNAVAILABLE',
    'ONROAD',
    'UNDER_MAINTENANCE'
);


ALTER TYPE public.trailers_status_enum OWNER TO postgres;

--
-- Name: transaction_lines_entrytype_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transaction_lines_entrytype_enum AS ENUM (
    'DEBIT',
    'CREDIT'
);


ALTER TYPE public.transaction_lines_entrytype_enum OWNER TO postgres;

--
-- Name: transactions_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.transactions_status_enum AS ENUM (
    'DRAFT',
    'POSTED',
    'CANCELLED'
);


ALTER TYPE public.transactions_status_enum OWNER TO postgres;

--
-- Name: user_attachments_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_attachments_type_enum AS ENUM (
    'PERSONALID',
    'DRIVERLICENSE',
    'INSURANCE',
    'MEDICALINSURANCE',
    'CREMINALRECORD',
    'SECURITYCLEARANCE',
    'MILITITARYSTATUS'
);


ALTER TYPE public.user_attachments_type_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'ADMIN',
    'USER',
    'DRIVER',
    'DRIVER_ASSISTANT',
    'DATA_ENTRY',
    'EMPLOYEE'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

--
-- Name: users_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_status_enum AS ENUM (
    'AVAILABLE',
    'UNAVAILABLE',
    'ONROAD'
);


ALTER TYPE public.users_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accounts (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    type public.accounts_type_enum NOT NULL,
    "normalBalance" public.accounts_normalbalance_enum NOT NULL,
    parent_account_id integer,
    "isLeaf" boolean DEFAULT false NOT NULL,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone,
    "isSystem" boolean DEFAULT false NOT NULL,
    opening_balance numeric(14,2) DEFAULT 0 NOT NULL,
    opening_balance_locked boolean DEFAULT false NOT NULL
);


ALTER TABLE public.accounts OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.accounts_id_seq OWNER TO postgres;

--
-- Name: accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accounts_id_seq OWNED BY public.accounts.id;


--
-- Name: areas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.areas (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    government_id integer NOT NULL,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.areas OWNER TO postgres;

--
-- Name: areas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.areas_id_seq OWNER TO postgres;

--
-- Name: areas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.areas_id_seq OWNED BY public.areas.id;


--
-- Name: axles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.axles (
    id integer NOT NULL,
    number integer NOT NULL,
    "carId" integer,
    "trailerId" integer,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.axles OWNER TO postgres;

--
-- Name: axles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.axles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.axles_id_seq OWNER TO postgres;

--
-- Name: axles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.axles_id_seq OWNED BY public.axles.id;


--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.branches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.branches_id_seq OWNER TO postgres;

--
-- Name: branches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.branches_id_seq OWNED BY public.branches.id;


--
-- Name: car_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.car_attachments (
    id integer NOT NULL,
    car_id integer NOT NULL,
    type public.car_attachments_type_enum NOT NULL,
    "documentExpiryDate" date,
    url character varying(255) NOT NULL,
    notes text,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.car_attachments OWNER TO postgres;

--
-- Name: car_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.car_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.car_attachments_id_seq OWNER TO postgres;

--
-- Name: car_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.car_attachments_id_seq OWNED BY public.car_attachments.id;


--
-- Name: car_manufacturer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.car_manufacturer (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.car_manufacturer OWNER TO postgres;

--
-- Name: car_manufacturer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.car_manufacturer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.car_manufacturer_id_seq OWNER TO postgres;

--
-- Name: car_manufacturer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.car_manufacturer_id_seq OWNED BY public.car_manufacturer.id;


--
-- Name: car_model; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.car_model (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    "manufacturerId" integer,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.car_model OWNER TO postgres;

--
-- Name: car_model_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.car_model_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.car_model_id_seq OWNER TO postgres;

--
-- Name: car_model_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.car_model_id_seq OWNED BY public.car_model.id;


--
-- Name: cars; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cars (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    manufacturer character varying(100) NOT NULL,
    status public.cars_status_enum DEFAULT 'AVAILABLE'::public.cars_status_enum NOT NULL,
    model character varying(100) NOT NULL,
    "manufactureYear" integer NOT NULL,
    color character varying(30) NOT NULL,
    cylinders integer NOT NULL,
    horsepower integer NOT NULL,
    "axleCount" integer NOT NULL,
    "maxWeight" integer NOT NULL,
    "plateNumber" character varying(20) NOT NULL,
    "plateLetters" character varying(10) NOT NULL,
    "chassisNumber" character varying(50) NOT NULL,
    "licenseNumber" character varying(50) NOT NULL,
    "licenseExpiryDate" date NOT NULL,
    notes text,
    "ownerShip" character varying(50),
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.cars OWNER TO postgres;

--
-- Name: cars_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cars_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.cars_id_seq OWNER TO postgres;

--
-- Name: cars_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cars_id_seq OWNED BY public.cars.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    "commercialRecord" character varying(100) NOT NULL,
    "taxInvoice" character varying(150),
    "companyCode" character varying(100),
    "destinationsFile" character varying(255),
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.clients OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.clients_id_seq OWNER TO postgres;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id integer NOT NULL,
    phone character varying(100) NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    "userId" integer,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- Name: contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contacts_id_seq OWNER TO postgres;

--
-- Name: contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contacts_id_seq OWNED BY public.contacts.id;


--
-- Name: delivery_prices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_prices (
    id integer NOT NULL,
    client_id integer NOT NULL,
    area_id integer NOT NULL,
    price_type_id integer,
    "basePrice" numeric(10,2) NOT NULL,
    "additionalFees" numeric(10,2) DEFAULT 0 NOT NULL,
    "taxPrice" numeric(10,2) DEFAULT 0 NOT NULL,
    "totalPrice" numeric(10,2),
    "validFrom" date NOT NULL,
    "validTo" date NOT NULL,
    notes text,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.delivery_prices OWNER TO postgres;

--
-- Name: delivery_prices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.delivery_prices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.delivery_prices_id_seq OWNER TO postgres;

--
-- Name: delivery_prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.delivery_prices_id_seq OWNED BY public.delivery_prices.id;


--
-- Name: drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drivers (
    id integer NOT NULL,
    "licenseNumber" character varying NOT NULL,
    "licenseExpiryDate" date NOT NULL,
    "userId" integer,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.drivers OWNER TO postgres;

--
-- Name: drivers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drivers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.drivers_id_seq OWNER TO postgres;

--
-- Name: drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drivers_id_seq OWNED BY public.drivers.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    "userId" integer,
    "branchId" integer,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.employees_id_seq OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: expense_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expense_attachments (
    id integer NOT NULL,
    expense_id integer NOT NULL,
    url character varying(255) NOT NULL,
    type public.expense_attachments_type_enum NOT NULL,
    notes text,
    "documentExpiryDate" date,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.expense_attachments OWNER TO postgres;

--
-- Name: expense_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expense_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.expense_attachments_id_seq OWNER TO postgres;

--
-- Name: expense_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expense_attachments_id_seq OWNED BY public.expense_attachments.id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    amount numeric(12,2) NOT NULL,
    date date NOT NULL,
    "monthlyRecurring" boolean DEFAULT false NOT NULL,
    status public.expense_status_enum DEFAULT 'DRAFT'::public.expense_status_enum NOT NULL,
    notes text,
    employee_id integer,
    car_id integer,
    "maintenanceType" character varying(150),
    center character varying(150),
    "partName" character varying(150),
    "partSource" character varying(150),
    "unitPrice" numeric(12,2),
    quantity numeric(12,2),
    consumable boolean DEFAULT false,
    "serviceType" character varying(100),
    place character varying(150),
    "feeType" character varying(100),
    "expiryDate" date,
    "subType" character varying(100),
    beneficiary character varying(150),
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone,
    type public.expenses_type_enum NOT NULL
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.expenses_id_seq OWNER TO postgres;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: governments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.governments (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.governments OWNER TO postgres;

--
-- Name: governments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.governments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.governments_id_seq OWNER TO postgres;

--
-- Name: governments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.governments_id_seq OWNED BY public.governments.id;


--
-- Name: gps_devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gps_devices (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    imei character varying(50) NOT NULL,
    "lastLatitude" double precision,
    "lastLongitude" double precision,
    speed double precision,
    "totalDistance" double precision,
    "batteryLevel" double precision,
    "signalStrength" double precision,
    "engineStatus" boolean DEFAULT false NOT NULL,
    "lastUpdate" timestamp without time zone,
    "carId" integer,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.gps_devices OWNER TO postgres;

--
-- Name: gps_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gps_devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gps_devices_id_seq OWNER TO postgres;

--
-- Name: gps_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gps_devices_id_seq OWNED BY public.gps_devices.id;


--
-- Name: gps_tails; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gps_tails (
    id integer NOT NULL,
    device_id integer,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "sequenceOrder" integer NOT NULL,
    "timestamp" timestamp without time zone NOT NULL,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.gps_tails OWNER TO postgres;

--
-- Name: gps_tails_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gps_tails_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gps_tails_id_seq OWNER TO postgres;

--
-- Name: gps_tails_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gps_tails_id_seq OWNED BY public.gps_tails.id;


--
-- Name: grids; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grids (
    id integer NOT NULL,
    page_key text NOT NULL,
    columns jsonb DEFAULT '[]'::jsonb NOT NULL,
    user_id integer,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.grids OWNER TO postgres;

--
-- Name: grids_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.grids_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.grids_id_seq OWNER TO postgres;

--
-- Name: grids_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.grids_id_seq OWNED BY public.grids.id;


--
-- Name: journey_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journey_attachments (
    id integer NOT NULL,
    journey_id integer NOT NULL,
    type character varying(100),
    url character varying(100),
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.journey_attachments OWNER TO postgres;

--
-- Name: journey_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journey_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.journey_attachments_id_seq OWNER TO postgres;

--
-- Name: journey_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journey_attachments_id_seq OWNED BY public.journey_attachments.id;


--
-- Name: journey_policies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journey_policies (
    id integer NOT NULL,
    journey_id integer,
    "bookWeight" double precision,
    "actualWeight" double precision,
    "deliveryWeight" double precision,
    "shortageQty" double precision,
    "policyNo" character varying(100),
    "policyDate" date,
    "entryTimeFactory" timestamp without time zone,
    "exitTimeFactory" timestamp without time zone,
    delivery_gov_id integer,
    delivery_area_id integer,
    "loadingDate" date,
    "loadingPermitNo" character varying(100),
    "archiveNo" character varying(100),
    employee_id integer,
    "tripDuration" character varying(10),
    "tripDate" date,
    trip_distance double precision,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.journey_policies OWNER TO postgres;

--
-- Name: journey_policies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journey_policies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.journey_policies_id_seq OWNER TO postgres;

--
-- Name: journey_policies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journey_policies_id_seq OWNED BY public.journey_policies.id;


--
-- Name: journey_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journey_transactions (
    id integer NOT NULL,
    journey_id integer,
    "transactionType" public.journey_transactions_transactiontype_enum NOT NULL,
    category public.journey_transactions_category_enum NOT NULL,
    description text,
    quantity double precision,
    "unitPrice" double precision,
    "placeOrService" character varying(150),
    "invoiceUrl" text,
    amount double precision NOT NULL,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.journey_transactions OWNER TO postgres;

--
-- Name: journey_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journey_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.journey_transactions_id_seq OWNER TO postgres;

--
-- Name: journey_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journey_transactions_id_seq OWNED BY public.journey_transactions.id;


--
-- Name: journeys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journeys (
    id integer NOT NULL,
    "delegateNumber" character varying(50),
    "delegateDate" date,
    "tripStatus" character varying(50) NOT NULL,
    driver_id integer NOT NULL,
    assistant_id integer,
    car_id integer NOT NULL,
    client_id integer NOT NULL,
    trailer_id integer NOT NULL,
    direction character varying(255),
    quantity double precision,
    "cementGrade" character varying(50),
    "packingType" character varying(50),
    "sellingOrderNo" character varying(100),
    "receivedCompany" character varying(100),
    custody_source_id integer,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.journeys OWNER TO postgres;

--
-- Name: journeys_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journeys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.journeys_id_seq OWNER TO postgres;

--
-- Name: journeys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journeys_id_seq OWNED BY public.journeys.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: owners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.owners (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    "transactionType" public.owners_transactiontype_enum DEFAULT 'BANK'::public.owners_transactiontype_enum NOT NULL,
    email character varying(100),
    address character varying(255),
    "paymentNumber" character varying(50),
    notes text,
    "bankAccountNumber" character varying(34),
    "bankName" character varying(100),
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.owners OWNER TO postgres;

--
-- Name: owners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.owners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.owners_id_seq OWNER TO postgres;

--
-- Name: owners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.owners_id_seq OWNED BY public.owners.id;


--
-- Name: price_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.price_types OWNER TO postgres;

--
-- Name: price_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.price_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.price_types_id_seq OWNER TO postgres;

--
-- Name: price_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.price_types_id_seq OWNED BY public.price_types.id;


--
-- Name: rel_car_owners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rel_car_owners (
    id integer NOT NULL,
    "ownerId" integer NOT NULL,
    "carId" integer NOT NULL,
    percentage numeric(5,2) DEFAULT 100 NOT NULL,
    "contractUrl" character varying(255),
    notes text,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.rel_car_owners OWNER TO postgres;

--
-- Name: COLUMN rel_car_owners.percentage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.rel_car_owners.percentage IS 'Ownership percentage (0.00 - 100.00)';


--
-- Name: COLUMN rel_car_owners."contractUrl"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.rel_car_owners."contractUrl" IS 'Ownership contract URL';


--
-- Name: COLUMN rel_car_owners.notes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.rel_car_owners.notes IS 'Additional notes about ownership';


--
-- Name: rel_car_owners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rel_car_owners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rel_car_owners_id_seq OWNER TO postgres;

--
-- Name: rel_car_owners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rel_car_owners_id_seq OWNED BY public.rel_car_owners.id;


--
-- Name: rel_trailer_owners; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rel_trailer_owners (
    id integer NOT NULL,
    "ownerId" integer,
    "trailerId" integer,
    percentage numeric(5,2) DEFAULT 100 NOT NULL,
    "contractUrl" character varying(255),
    notes text,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.rel_trailer_owners OWNER TO postgres;

--
-- Name: COLUMN rel_trailer_owners."contractUrl"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.rel_trailer_owners."contractUrl" IS 'Ownership contract URL';


--
-- Name: COLUMN rel_trailer_owners.notes; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.rel_trailer_owners.notes IS 'Additional notes about ownership';


--
-- Name: rel_trailer_owners_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rel_trailer_owners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rel_trailer_owners_id_seq OWNER TO postgres;

--
-- Name: rel_trailer_owners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rel_trailer_owners_id_seq OWNED BY public.rel_trailer_owners.id;


--
-- Name: salaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salaries (
    id integer NOT NULL,
    "salaryType" public.salaries_salarytype_enum,
    "salaryAmount" numeric,
    user_id integer,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.salaries OWNER TO postgres;

--
-- Name: salaries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salaries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.salaries_id_seq OWNER TO postgres;

--
-- Name: salaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salaries_id_seq OWNED BY public.salaries.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    activity public.suppliers_activity_enum NOT NULL,
    governorate character varying(100) NOT NULL,
    city character varying(100) NOT NULL,
    phone character varying(20) NOT NULL,
    "commercialRegister" character varying(50) NOT NULL,
    "taxCard" character varying(50) NOT NULL,
    "taxRegistrationNumber" character varying(50) NOT NULL,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.suppliers_id_seq OWNER TO postgres;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: tire_model; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tire_model (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tire_model OWNER TO postgres;

--
-- Name: tire_model_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tire_model_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tire_model_id_seq OWNER TO postgres;

--
-- Name: tire_model_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tire_model_id_seq OWNED BY public.tire_model.id;


--
-- Name: tires; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tires (
    id integer NOT NULL,
    "serialNumber" character varying(50) NOT NULL,
    type character varying(20) NOT NULL,
    "healthPercentage" character varying(20) NOT NULL,
    location character varying(50) NOT NULL,
    "createdDate" timestamp without time zone NOT NULL,
    "axleId" integer,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.tires OWNER TO postgres;

--
-- Name: tires_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tires_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tires_id_seq OWNER TO postgres;

--
-- Name: tires_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tires_id_seq OWNED BY public.tires.id;


--
-- Name: trailer_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trailer_attachments (
    id integer NOT NULL,
    trailer_id integer NOT NULL,
    type public.trailer_attachments_type_enum NOT NULL,
    "documentExpiryDate" date,
    url character varying(255) NOT NULL,
    notes text,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.trailer_attachments OWNER TO postgres;

--
-- Name: trailer_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trailer_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.trailer_attachments_id_seq OWNER TO postgres;

--
-- Name: trailer_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trailer_attachments_id_seq OWNED BY public.trailer_attachments.id;


--
-- Name: trailer_manufacturer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trailer_manufacturer (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.trailer_manufacturer OWNER TO postgres;

--
-- Name: trailer_manufacturer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trailer_manufacturer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.trailer_manufacturer_id_seq OWNER TO postgres;

--
-- Name: trailer_manufacturer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trailer_manufacturer_id_seq OWNED BY public.trailer_manufacturer.id;


--
-- Name: trailers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trailers (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    "chaseType" character varying(100),
    manufacturer character varying(100) NOT NULL,
    status public.trailers_status_enum DEFAULT 'UNAVAILABLE'::public.trailers_status_enum NOT NULL,
    "manufactureYear" integer NOT NULL,
    color character varying(30) NOT NULL,
    "maxWeight" integer NOT NULL,
    "plateNumber" character varying(20) NOT NULL,
    "plateLetters" character varying(10) NOT NULL,
    "chassisNumber" character varying(50) NOT NULL,
    "licenseNumber" character varying(50) NOT NULL,
    "licenseExpiryDate" date NOT NULL,
    "axleCount" integer NOT NULL,
    notes text,
    "ownerShip" character varying(50),
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.trailers OWNER TO postgres;

--
-- Name: trailers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.trailers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.trailers_id_seq OWNER TO postgres;

--
-- Name: trailers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.trailers_id_seq OWNED BY public.trailers.id;


--
-- Name: transaction_lines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transaction_lines (
    id integer NOT NULL,
    transaction_id integer NOT NULL,
    account_id integer NOT NULL,
    "entryType" public.transaction_lines_entrytype_enum NOT NULL,
    amount numeric(12,2) NOT NULL,
    description text,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.transaction_lines OWNER TO postgres;

--
-- Name: transaction_lines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transaction_lines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transaction_lines_id_seq OWNER TO postgres;

--
-- Name: transaction_lines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transaction_lines_id_seq OWNED BY public.transaction_lines.id;


--
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    date date NOT NULL,
    description text NOT NULL,
    status public.transactions_status_enum DEFAULT 'DRAFT'::public.transactions_status_enum NOT NULL,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.transactions_id_seq OWNER TO postgres;

--
-- Name: transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transactions_id_seq OWNED BY public.transactions.id;


--
-- Name: user_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_attachments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    url character varying(255) NOT NULL,
    type public.user_attachments_type_enum NOT NULL,
    notes text,
    "documentExpiryDate" date,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.user_attachments OWNER TO postgres;

--
-- Name: user_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_attachments_id_seq OWNER TO postgres;

--
-- Name: user_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_attachments_id_seq OWNED BY public.user_attachments.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255),
    password character varying(255),
    username character varying(100) NOT NULL,
    status public.users_status_enum DEFAULT 'AVAILABLE'::public.users_status_enum NOT NULL,
    activated boolean DEFAULT false,
    image_url character varying(255),
    role public.users_role_enum DEFAULT 'USER'::public.users_role_enum NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    personal_id character varying(50),
    personal_id_expiry_date date,
    notes character varying(255),
    code character varying(50),
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    status character varying(50) NOT NULL,
    condition character varying(50),
    category character varying(100) NOT NULL,
    quantity integer NOT NULL,
    "alertQuantity" integer NOT NULL,
    unit character varying(50) NOT NULL,
    supplier_id integer NOT NULL,
    "unitPrice" double precision NOT NULL,
    "manufacturingYear" integer,
    "purchaseDate" date,
    "expiryDate" date,
    created_by character varying,
    created_at timestamp with time zone,
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.warehouses OWNER TO postgres;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.warehouses_id_seq OWNER TO postgres;

--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: accounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts ALTER COLUMN id SET DEFAULT nextval('public.accounts_id_seq'::regclass);


--
-- Name: areas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas ALTER COLUMN id SET DEFAULT nextval('public.areas_id_seq'::regclass);


--
-- Name: axles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.axles ALTER COLUMN id SET DEFAULT nextval('public.axles_id_seq'::regclass);


--
-- Name: branches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches ALTER COLUMN id SET DEFAULT nextval('public.branches_id_seq'::regclass);


--
-- Name: car_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_attachments ALTER COLUMN id SET DEFAULT nextval('public.car_attachments_id_seq'::regclass);


--
-- Name: car_manufacturer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_manufacturer ALTER COLUMN id SET DEFAULT nextval('public.car_manufacturer_id_seq'::regclass);


--
-- Name: car_model id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_model ALTER COLUMN id SET DEFAULT nextval('public.car_model_id_seq'::regclass);


--
-- Name: cars id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cars ALTER COLUMN id SET DEFAULT nextval('public.cars_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: contacts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts ALTER COLUMN id SET DEFAULT nextval('public.contacts_id_seq'::regclass);


--
-- Name: delivery_prices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_prices ALTER COLUMN id SET DEFAULT nextval('public.delivery_prices_id_seq'::regclass);


--
-- Name: drivers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers ALTER COLUMN id SET DEFAULT nextval('public.drivers_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: expense_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments ALTER COLUMN id SET DEFAULT nextval('public.expense_attachments_id_seq'::regclass);


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: governments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.governments ALTER COLUMN id SET DEFAULT nextval('public.governments_id_seq'::regclass);


--
-- Name: gps_devices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gps_devices ALTER COLUMN id SET DEFAULT nextval('public.gps_devices_id_seq'::regclass);


--
-- Name: gps_tails id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gps_tails ALTER COLUMN id SET DEFAULT nextval('public.gps_tails_id_seq'::regclass);


--
-- Name: grids id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grids ALTER COLUMN id SET DEFAULT nextval('public.grids_id_seq'::regclass);


--
-- Name: journey_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journey_attachments ALTER COLUMN id SET DEFAULT nextval('public.journey_attachments_id_seq'::regclass);


--
-- Name: journey_policies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journey_policies ALTER COLUMN id SET DEFAULT nextval('public.journey_policies_id_seq'::regclass);


--
-- Name: journey_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journey_transactions ALTER COLUMN id SET DEFAULT nextval('public.journey_transactions_id_seq'::regclass);


--
-- Name: journeys id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journeys ALTER COLUMN id SET DEFAULT nextval('public.journeys_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: owners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.owners ALTER COLUMN id SET DEFAULT nextval('public.owners_id_seq'::regclass);


--
-- Name: price_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_types ALTER COLUMN id SET DEFAULT nextval('public.price_types_id_seq'::regclass);


--
-- Name: rel_car_owners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_car_owners ALTER COLUMN id SET DEFAULT nextval('public.rel_car_owners_id_seq'::regclass);


--
-- Name: rel_trailer_owners id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_trailer_owners ALTER COLUMN id SET DEFAULT nextval('public.rel_trailer_owners_id_seq'::regclass);


--
-- Name: salaries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salaries ALTER COLUMN id SET DEFAULT nextval('public.salaries_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: tire_model id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tire_model ALTER COLUMN id SET DEFAULT nextval('public.tire_model_id_seq'::regclass);


--
-- Name: tires id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tires ALTER COLUMN id SET DEFAULT nextval('public.tires_id_seq'::regclass);


--
-- Name: trailer_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailer_attachments ALTER COLUMN id SET DEFAULT nextval('public.trailer_attachments_id_seq'::regclass);


--
-- Name: trailer_manufacturer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailer_manufacturer ALTER COLUMN id SET DEFAULT nextval('public.trailer_manufacturer_id_seq'::regclass);


--
-- Name: trailers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailers ALTER COLUMN id SET DEFAULT nextval('public.trailers_id_seq'::regclass);


--
-- Name: transaction_lines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_lines ALTER COLUMN id SET DEFAULT nextval('public.transaction_lines_id_seq'::regclass);


--
-- Name: transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions ALTER COLUMN id SET DEFAULT nextval('public.transactions_id_seq'::regclass);


--
-- Name: user_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_attachments ALTER COLUMN id SET DEFAULT nextval('public.user_attachments_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accounts (id, code, name, type, "normalBalance", parent_account_id, "isLeaf", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at, "isSystem", opening_balance, opening_balance_locked) FROM stdin;
1	A-202604141	الأصول	ASSET	DEBIT	\N	f	system	\N	system	\N	\N	\N	t	0.00	f
2	A-202604142	الخصوم	LIABILITY	CREDIT	\N	f	system	\N	system	\N	\N	\N	t	0.00	f
3	A-202604143	حقوق الملكية	EQUITY	CREDIT	\N	f	system	\N	system	\N	\N	\N	t	0.00	f
4	A-202604144	الإيرادات	REVENUE	CREDIT	\N	f	system	\N	system	\N	\N	\N	t	0.00	f
5	A-202604145	المصروفات	EXPENSE	DEBIT	\N	f	system	\N	system	\N	\N	\N	t	0.00	f
6	A-202604146	الاصول الغير متداوله ( اصول ثابته )	ASSET	DEBIT	1	f	system	\N	system	\N	\N	\N	t	0.00	f
7	A-202604147	اصول ملموسه	ASSET	DEBIT	6	f	system	\N	system	\N	\N	\N	t	0.00	f
8	A-202604148	تاسيس وتجهيز	ASSET	DEBIT	7	t	system	\N	system	\N	\N	\N	t	0.00	f
9	A-202604149	الات ومعدات	ASSET	DEBIT	7	t	system	\N	system	\N	\N	\N	t	0.00	f
10	A-2026041410	سيارات	ASSET	DEBIT	7	t	system	\N	system	\N	\N	\N	t	0.00	f
11	A-2026041411	اجهزه كهربائيه	ASSET	DEBIT	7	t	system	\N	system	\N	\N	\N	t	0.00	f
12	A-2026041412	اثاث	ASSET	DEBIT	7	t	system	\N	system	\N	\N	\N	t	0.00	f
13	A-2026041413	اجهزه كمبيوتر	ASSET	DEBIT	7	t	system	\N	system	\N	\N	\N	t	0.00	f
14	A-2026041414	استثمارات طويله الاجل	ASSET	DEBIT	6	t	system	\N	system	\N	\N	\N	t	0.00	f
15	A-2026041415	اصول غير ملموسه	ASSET	DEBIT	6	f	system	\N	system	\N	\N	\N	t	0.00	f
16	A-2026041416	الشهره والسمه التجاريه	ASSET	DEBIT	15	t	system	\N	system	\N	\N	\N	t	0.00	f
17	A-2026041417	الاصول المتداوله	ASSET	DEBIT	1	f	system	\N	system	\N	\N	\N	t	0.00	f
18	A-2026041418	الخزينه	CASH	DEBIT	17	t	system	\N	system	\N	\N	\N	t	0.00	f
19	A-2026041419	البنك	CASH	DEBIT	17	t	system	\N	system	\N	\N	\N	t	0.00	f
20	A-2026041420	المخزون	ASSET	DEBIT	17	t	system	\N	system	\N	\N	\N	t	0.00	f
21	A-2026041421	عملاء	ASSET	DEBIT	17	t	system	\N	system	\N	\N	\N	t	0.00	f
22	A-2026041422	ا.قبض	ASSET	DEBIT	17	t	system	\N	system	\N	\N	\N	t	0.00	f
23	A-2026041423	مدينين وارصده مدينه اخرى	ASSET	DEBIT	17	f	system	\N	system	\N	\N	\N	t	0.00	f
24	A-2026041424	عهد	ASSET	DEBIT	23	t	system	\N	system	\N	\N	\N	t	0.00	f
25	A-2026041425	سلف	ASSET	DEBIT	23	t	system	\N	system	\N	\N	\N	t	0.00	f
26	A-2026041426	ضرائب منبع	ASSET	DEBIT	23	t	system	\N	system	\N	\N	\N	t	0.00	f
27	A-2026041427	تامينات لدى الغير	ASSET	DEBIT	23	t	system	\N	system	\N	\N	\N	t	0.00	f
28	A-2026041428	موردين د.مقدمه	ASSET	DEBIT	23	t	system	\N	system	\N	\N	\N	t	0.00	f
29	A-2026041429	الالتزامات الغير متداوله	LIABILITY	CREDIT	2	f	system	\N	system	\N	\N	\N	t	0.00	f
30	A-2026041430	قروض	LIABILITY	CREDIT	29	t	system	\N	system	\N	\N	\N	t	0.00	f
31	A-2026041431	التزامات ضريبيه مؤجله	LIABILITY	CREDIT	29	t	system	\N	system	\N	\N	\N	t	0.00	f
32	A-2026041432	الالتزامات المتداوله	LIABILITY	CREDIT	2	f	system	\N	system	\N	\N	\N	t	0.00	f
33	A-2026041433	موردين	LIABILITY	CREDIT	32	t	system	\N	system	\N	\N	\N	t	0.00	f
34	A-2026041434	ا.دفع	LIABILITY	CREDIT	32	t	system	\N	system	\N	\N	\N	t	0.00	f
35	A-2026041435	دائنين وارصده دائنه اخرى	LIABILITY	CREDIT	32	f	system	\N	system	\N	\N	\N	t	0.00	f
36	A-2026041436	ضريبه مرتبات	LIABILITY	CREDIT	35	t	system	\N	system	\N	\N	\N	t	0.00	f
37	A-2026041437	ضريبه الخصم والاضافه	LIABILITY	CREDIT	35	t	system	\N	system	\N	\N	\N	t	0.00	f
38	A-2026041438	المساهمه التكافليه	LIABILITY	CREDIT	35	t	system	\N	system	\N	\N	\N	t	0.00	f
39	A-2026041439	ضريبه الدخل	LIABILITY	CREDIT	35	t	system	\N	system	\N	\N	\N	t	0.00	f
40	A-2026041440	تامينات للغير	LIABILITY	CREDIT	35	t	system	\N	system	\N	\N	\N	t	0.00	f
41	A-2026041441	راس المال وحقوق الملكيه	EQUITY	CREDIT	3	f	system	\N	system	\N	\N	\N	t	0.00	f
42	A-2026041442	راس المال	EQUITY	CREDIT	41	t	system	\N	system	\N	\N	\N	t	0.00	f
43	A-2026041443	جارى الشركاء	EQUITY	CREDIT	41	t	system	\N	system	\N	\N	\N	t	0.00	f
44	A-2026041444	ارباح / خسائر مرحله	EQUITY	CREDIT	41	t	system	\N	system	\N	\N	\N	t	0.00	f
45	A-2026041445	ارباح / خسائر العام	EQUITY	CREDIT	41	t	system	\N	system	\N	\N	\N	t	0.00	f
46	A-2026041446	مجمع الاهلاك	EQUITY	CREDIT	41	t	system	\N	system	\N	\N	\N	t	0.00	f
47	A-2026041447	احتياطيات	EQUITY	CREDIT	41	t	system	\N	system	\N	\N	\N	t	0.00	f
48	A-2026041448	الايرادات	REVENUE	CREDIT	4	t	system	\N	system	\N	\N	\N	t	0.00	f
49	A-2026041449	مردودات الايرادات	REVENUE	DEBIT	4	t	system	\N	system	\N	\N	\N	t	0.00	f
50	A-2026041450	تكلفة المبيعات	EXPENSE	DEBIT	5	f	system	\N	system	\N	\N	\N	t	0.00	f
51	A-2026041451	المصروفات التشغيلية	EXPENSE	DEBIT	5	f	system	\N	system	\N	\N	\N	t	0.00	f
52	A-2026041452	المصروفات التمويلية والضريبية	EXPENSE	DEBIT	5	f	system	\N	system	\N	\N	\N	t	0.00	f
53	A-2026041453	مشتريات	EXPENSE	DEBIT	50	t	system	\N	system	\N	\N	\N	t	0.00	f
54	A-2026041454	مردودات مشتريات	EXPENSE	CREDIT	50	t	system	\N	system	\N	\N	\N	t	0.00	f
55	A-2026041455	م.التشغيل	EXPENSE	DEBIT	51	t	system	\N	system	\N	\N	\N	t	0.00	f
56	A-2026041456	م.عموميه	EXPENSE	DEBIT	51	t	system	\N	system	\N	\N	\N	t	0.00	f
57	A-2026041457	م.اهلاك	EXPENSE	DEBIT	51	t	system	\N	system	\N	\N	\N	t	0.00	f
58	A-2026041458	م.تمويليه	EXPENSE	DEBIT	52	t	system	\N	system	\N	\N	\N	t	0.00	f
59	A-2026041459	م.ضريبه الدخل	EXPENSE	DEBIT	52	t	system	\N	system	\N	\N	\N	t	0.00	f
\.


--
-- Data for Name: areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.areas (id, name, government_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	الحسنه وسط(الحمه -بغداد-المغاره-الريسان-مدينه الحسنه-عرب بلى-قريه)	1	\N	\N	\N	\N	\N	\N
2	العريش	1	\N	\N	\N	\N	\N	\N
3	رفح/الشيخ زويد/الحسنه شرق و غرب(جفجافه-القسيمه)	1	\N	\N	\N	\N	\N	\N
4	بئر العبد	1	\N	\N	\N	\N	\N	\N
5	نخل(شرق-وسط-غرب)	1	\N	\N	\N	\N	\N	\N
6	الاسماعيليه الجديده/جامعه الاسماعيليه/سور المزارع السمكيه	1	\N	\N	\N	\N	\N	\N
7	القنطره شرق	1	\N	\N	\N	\N	\N	\N
8	بالوظه/جامعه شرق بورسعيد/شرق التفريعه/نفق الشهيد احمد حمدى شرق	1	\N	\N	\N	\N	\N	\N
9	راس سدر	2	\N	\N	\N	\N	\N	\N
10	راس مطاومه	2	\N	\N	\N	\N	\N	\N
11	راس بدران/ابو رديس/ابو زنيمه	2	\N	\N	\N	\N	\N	\N
12	الطور	2	\N	\N	\N	\N	\N	\N
13	سانت كاترين(وادى سعال)شرم الشيخ/وادى فيران/ط الرويسات	2	\N	\N	\N	\N	\N	\N
14	مطار شرم الشيخ	2	\N	\N	\N	\N	\N	\N
15	دهب(وادى الكيد)	2	\N	\N	\N	\N	\N	\N
16	نويبع / طابا	2	\N	\N	\N	\N	\N	\N
17	العاصمة الإدارية	3	\N	\N	\N	\N	\N	\N
18	القاهرة (1) المدن الجديدة	4	\N	\N	\N	\N	\N	\N
19	القاهرة (2) مناطق حظر نقل	4	\N	\N	\N	\N	\N	\N
20	القاهرة (3) مناطق حظر نقل تكدس مروري	4	\N	\N	\N	\N	\N	\N
21	الشرقية (1)	5	\N	\N	\N	\N	\N	\N
22	الشرقية (2)	5	\N	\N	\N	\N	\N	\N
23	الدقهلية (1)	6	\N	\N	\N	\N	\N	\N
24	الدقهلية (2)	6	\N	\N	\N	\N	\N	\N
25	القليوبية	7	\N	\N	\N	\N	\N	\N
26	الجيزة (1) إقليمي أوسطي	8	\N	\N	\N	\N	\N	\N
27	الجيزة (2) مناطق حظر نقل	8	\N	\N	\N	\N	\N	\N
28	المنوفية	9	\N	\N	\N	\N	\N	\N
29	السادات	9	\N	\N	\N	\N	\N	\N
30	الغربية	10	\N	\N	\N	\N	\N	\N
31	صحراء محور دلتا مصر	4	\N	\N	\N	\N	\N	\N
32	الإسماعيلية غرب القناة	11	\N	\N	\N	\N	\N	\N
33	السويس	12	\N	\N	\N	\N	\N	\N
34	العين السخنة	12	\N	\N	\N	\N	\N	\N
35	بورسعيد	13	\N	\N	\N	\N	\N	\N
36	بورفؤاد	13	\N	\N	\N	\N	\N	\N
37	دمياط	14	\N	\N	\N	\N	\N	\N
38	كفر الشيخ	15	\N	\N	\N	\N	\N	\N
39	البحيرة (1)	16	\N	\N	\N	\N	\N	\N
40	البحيرة (2)	16	\N	\N	\N	\N	\N	\N
41	البحيرة (3)	16	\N	\N	\N	\N	\N	\N
42	الإسكندرية مركز 1	17	\N	\N	\N	\N	\N	\N
43	العلمين	18	\N	\N	\N	\N	\N	\N
44	الضبعة	18	\N	\N	\N	\N	\N	\N
45	رأس الحكمة	18	\N	\N	\N	\N	\N	\N
46	مرسى مطروح	18	\N	\N	\N	\N	\N	\N
47	النجيلة	18	\N	\N	\N	\N	\N	\N
48	سيدي براني	18	\N	\N	\N	\N	\N	\N
49	السلوم	18	\N	\N	\N	\N	\N	\N
50	سيوة	18	\N	\N	\N	\N	\N	\N
51	الفيوم	19	\N	\N	\N	\N	\N	\N
52	بني سويف	20	\N	\N	\N	\N	\N	\N
53	المنيا	21	\N	\N	\N	\N	\N	\N
54	أسيوط	22	\N	\N	\N	\N	\N	\N
55	سوهاج	23	\N	\N	\N	\N	\N	\N
56	قنا	24	\N	\N	\N	\N	\N	\N
57	الأقصر	25	\N	\N	\N	\N	\N	\N
58	الوادي الجديد	26	\N	\N	\N	\N	\N	\N
59	أسوان	27	\N	\N	\N	\N	\N	\N
60	حلايب	28	\N	\N	\N	\N	\N	\N
61	مدينة نصر	4	\N	\N	\N	\N	\N	\N
62	القطامية	4	\N	\N	\N	\N	\N	\N
63	حلوان	4	\N	\N	\N	\N	\N	\N
64	مدينة 15 مايو	4	\N	\N	\N	\N	\N	\N
65	ماسبيرو	4	\N	\N	\N	\N	\N	\N
66	مصر الجديدة	4	\N	\N	\N	\N	\N	\N
67	التجمع	4	\N	\N	\N	\N	\N	\N
68	الشروق/بدر	4	\N	\N	\N	\N	\N	\N
69	الهايكستيب	4	\N	\N	\N	\N	\N	\N
70	الوراق	8	\N	\N	\N	\N	\N	\N
71	اكتوبر/الشيخ زايد	8	\N	\N	\N	\N	\N	\N
72	الصف/اطفيح	8	\N	\N	\N	\N	\N	\N
73	الواحات البحرية	8	\N	\N	\N	\N	\N	\N
74	الشرقية	5	\N	\N	\N	\N	\N	\N
75	العاشر من رمضان	5	\N	\N	\N	\N	\N	\N
76	البحيرة	16	\N	\N	\N	\N	\N	\N
77	ادكو	16	\N	\N	\N	\N	\N	\N
78	رشيد	16	\N	\N	\N	\N	\N	\N
79	وادي النطرون	16	\N	\N	\N	\N	\N	\N
80	النوبارية	16	\N	\N	\N	\N	\N	\N
81	الدقهلية	6	\N	\N	\N	\N	\N	\N
82	جمصة/دمياط/المنصورة الجديدة	14	\N	\N	\N	\N	\N	\N
83	ابو قير	17	\N	\N	\N	\N	\N	\N
84	الإسكندرية	17	\N	\N	\N	\N	\N	\N
85	الساحل/العلمين	18	\N	\N	\N	\N	\N	\N
86	سيدي عبد الرحمن	18	\N	\N	\N	\N	\N	\N
87	فوكة/ط مطروح	18	\N	\N	\N	\N	\N	\N
88	محور الضبعة	18	\N	\N	\N	\N	\N	\N
89	جربوب النجيله	18	\N	\N	\N	\N	\N	\N
90	الواحات الخارجة	26	\N	\N	\N	\N	\N	\N
91	الواحات الداخلة	26	\N	\N	\N	\N	\N	\N
92	حباطة	26	\N	\N	\N	\N	\N	\N
93	بير النص	26	\N	\N	\N	\N	\N	\N
94	شرق العوينات	26	\N	\N	\N	\N	\N	\N
95	الزعفرانة	28	\N	\N	\N	\N	\N	\N
96	سفاجا	28	\N	\N	\N	\N	\N	\N
97	القصير	28	\N	\N	\N	\N	\N	\N
98	الغردقة	28	\N	\N	\N	\N	\N	\N
99	مرسى علم	28	\N	\N	\N	\N	\N	\N
100	برنيس	28	\N	\N	\N	\N	\N	\N
101	راس غارب	28	\N	\N	\N	\N	\N	\N
102	شلاتين	28	\N	\N	\N	\N	\N	\N
103	الإسماعيلية	11	\N	\N	\N	\N	\N	\N
104	الإسماعيلية الجديدة	11	\N	\N	\N	\N	\N	\N
105	بحر البقر	11	\N	\N	\N	\N	\N	\N
106	القنطرة شرق	11	\N	\N	\N	\N	\N	\N
107	شرق التفريعة	11	\N	\N	\N	\N	\N	\N
108	حبل سحابة	29	\N	\N	\N	\N	\N	\N
109	توشكى	27	\N	\N	\N	\N	\N	\N
110	رأس سدر	2	\N	\N	\N	\N	\N	\N
111	مطار المليز	2	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: axles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.axles (id, number, "carId", "trailerId", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: car_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car_attachments (id, car_id, type, "documentExpiryDate", url, notes, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: car_manufacturer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car_manufacturer (id, name, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: car_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car_model (id, name, "manufacturerId", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: cars; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cars (id, code, manufacturer, status, model, "manufactureYear", color, cylinders, horsepower, "axleCount", "maxWeight", "plateNumber", "plateLetters", "chassisNumber", "licenseNumber", "licenseExpiryDate", notes, "ownerShip", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clients (id, name, "commercialRecord", "taxInvoice", "companyCode", "destinationsFile", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	مصنع اسمنت العريش	CR-ARISH	\N	C-ARISH	\N	\N	\N	\N	\N	\N	\N
2	مصنع وطنيه	CR-WATANIA	\N	C-WATANIA	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: contacts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contacts (id, phone, "isPrimary", "userId", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: delivery_prices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_prices (id, client_id, area_id, price_type_id, "basePrice", "additionalFees", "taxPrice", "totalPrice", "validFrom", "validTo", notes, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drivers (id, "licenseNumber", "licenseExpiryDate", "userId", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (id, "userId", "branchId", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: expense_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expense_attachments (id, expense_id, url, type, notes, "documentExpiryDate", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, amount, date, "monthlyRecurring", status, notes, employee_id, car_id, "maintenanceType", center, "partName", "partSource", "unitPrice", quantity, consumable, "serviceType", place, "feeType", "expiryDate", "subType", beneficiary, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at, type) FROM stdin;
\.


--
-- Data for Name: governments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.governments (id, name, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	شمال سيناء	\N	\N	\N	\N	\N	\N
2	جنوب سيناء	\N	\N	\N	\N	\N	\N
3	العاصمة الإدارية	\N	\N	\N	\N	\N	\N
4	القاهرة	\N	\N	\N	\N	\N	\N
5	الشرقية	\N	\N	\N	\N	\N	\N
6	الدقهلية	\N	\N	\N	\N	\N	\N
7	القليوبية	\N	\N	\N	\N	\N	\N
8	الجيزة	\N	\N	\N	\N	\N	\N
9	المنوفية	\N	\N	\N	\N	\N	\N
10	الغربية	\N	\N	\N	\N	\N	\N
11	الإسماعيلية	\N	\N	\N	\N	\N	\N
12	السويس	\N	\N	\N	\N	\N	\N
13	بورسعيد	\N	\N	\N	\N	\N	\N
14	دمياط	\N	\N	\N	\N	\N	\N
15	كفر الشيخ	\N	\N	\N	\N	\N	\N
16	البحيرة	\N	\N	\N	\N	\N	\N
17	الإسكندرية	\N	\N	\N	\N	\N	\N
18	مطروح	\N	\N	\N	\N	\N	\N
19	الفيوم	\N	\N	\N	\N	\N	\N
20	بني سويف	\N	\N	\N	\N	\N	\N
21	المنيا	\N	\N	\N	\N	\N	\N
22	أسيوط	\N	\N	\N	\N	\N	\N
23	سوهاج	\N	\N	\N	\N	\N	\N
24	قنا	\N	\N	\N	\N	\N	\N
25	الأقصر	\N	\N	\N	\N	\N	\N
26	الوادي الجديد	\N	\N	\N	\N	\N	\N
27	أسوان	\N	\N	\N	\N	\N	\N
28	البحر الأحمر	\N	\N	\N	\N	\N	\N
29	غير محدد	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: gps_devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gps_devices (id, name, imei, "lastLatitude", "lastLongitude", speed, "totalDistance", "batteryLevel", "signalStrength", "engineStatus", "lastUpdate", "carId", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
2	GT06N-1694	869216026681694	0	0	0	0	\N	\N	f	\N	\N	\N	2026-04-14 23:05:02.803+00	\N	\N	\N	\N
3	احمد جاد قديم 1 9247	869216028108050	30.164831	31.415962	0	5740.31	0	80	f	2026-03-29 22:33:20	\N	\N	2026-04-14 23:05:02.803+00	\N	\N	\N	\N
1	9173 المصراوي جديد	869216020966240	31.144542	33.859973	0	11570.44	100	40	f	2026-04-19 16:12:37	\N	\N	2026-04-14 23:05:02.803+00	\N	\N	\N	\N
4	السيد 9243 قديم	869216026572554	31.146642	33.850147	0	8388.67	0	80	f	2026-04-19 17:18:10	\N	\N	2026-04-14 23:05:02.803+00	\N	\N	\N	\N
8	على نصير قديم 8259	869216024039705	31.143949	33.861127	0	16803.76	100	40	f	2026-04-19 16:06:11	\N	\N	2026-04-14 23:05:02.803+00	\N	\N	\N	\N
6	الفرماوى جديد 9142	869216020090678	30.119198	31.286736	0	12714.14	100	80	f	2026-04-19 21:30:15	\N	\N	2026-04-14 23:05:02.803+00	\N	\N	\N	\N
5	الشيخ على جديد 9126	869216027867987	30.008613	32.477589	0	19029.6	100	80	f	2026-04-19 21:31:13	\N	\N	2026-04-14 23:05:02.803+00	\N	\N	\N	\N
7	جاد 2 جديد9174	869216028411090	31.153662	33.840153	0	17237.14	100	80	f	2026-04-19 21:31:10	\N	\N	2026-04-14 23:05:02.803+00	\N	\N	\N	\N
9	محمد عوض جديد 9176	869216029576537	30.619516	32.236182	0	15258.37	100	80	f	2026-04-19 21:31:10	\N	\N	2026-04-14 23:05:02.803+00	\N	\N	\N	\N
10	محمد هاشم 9245 قديم	869216021425329	31.154298	33.839989	0	4098.75	100	60	f	2026-04-19 21:31:11	\N	\N	2026-04-14 23:05:02.803+00	\N	\N	\N	\N
11	مصطفي ايمن 9143 جديد	869216026861189	30.29482	32.322522	0	13346.48	100	80	f	2026-04-19 21:31:09	\N	\N	2026-04-14 23:05:02.803+00	\N	\N	\N	\N
\.


--
-- Data for Name: gps_tails; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gps_tails (id, device_id, latitude, longitude, "sequenceOrder", "timestamp", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
7	3	30.162371111111	31.417182222222	1	2026-03-29 22:33:20	\N	\N	\N	\N	\N	\N
8	3	30.161035555556	31.415335555556	2	2026-03-29 22:33:20	\N	\N	\N	\N	\N	\N
9	3	30.161402222222	31.41368	3	2026-03-29 22:33:20	\N	\N	\N	\N	\N	\N
10	3	30.162662222222	31.414888888889	4	2026-03-29 22:33:20	\N	\N	\N	\N	\N	\N
11	3	30.163613333333	31.416386666667	5	2026-03-29 22:33:20	\N	\N	\N	\N	\N	\N
12	3	30.164831111111	31.415962222222	6	2026-03-29 22:33:20	\N	\N	\N	\N	\N	\N
1	1	31.143644444444	33.861457777778	1	2026-04-19 16:12:37	\N	\N	\N	\N	\N	\N
2	1	31.143742222222	33.861275555556	2	2026-04-19 16:12:37	\N	\N	\N	\N	\N	\N
3	1	31.143848888889	33.861088888889	3	2026-04-19 16:12:37	\N	\N	\N	\N	\N	\N
4	1	31.143964444444	33.860897777778	4	2026-04-19 16:12:37	\N	\N	\N	\N	\N	\N
5	1	31.144404444444	33.860164444444	5	2026-04-19 16:12:37	\N	\N	\N	\N	\N	\N
6	1	31.144542222222	33.859973333333	6	2026-04-19 16:12:37	\N	\N	\N	\N	\N	\N
13	4	31.146406666667	33.838657777778	1	2026-04-19 17:18:10	\N	\N	\N	\N	\N	\N
14	4	31.146491111111	33.840655555556	2	2026-04-19 17:18:10	\N	\N	\N	\N	\N	\N
15	4	31.146597777778	33.842822222222	3	2026-04-19 17:18:10	\N	\N	\N	\N	\N	\N
16	4	31.146617777778	33.845764444444	4	2026-04-19 17:18:10	\N	\N	\N	\N	\N	\N
17	4	31.146597777778	33.847671111111	5	2026-04-19 17:18:10	\N	\N	\N	\N	\N	\N
18	4	31.146642222222	33.850146666667	6	2026-04-19 17:18:10	\N	\N	\N	\N	\N	\N
37	8	31.144466666667	33.880333333333	1	2026-04-19 16:06:11	\N	\N	\N	\N	\N	\N
38	8	31.142342222222	33.869628888889	2	2026-04-19 16:06:11	\N	\N	\N	\N	\N	\N
39	8	31.1422	33.867588888889	3	2026-04-19 16:06:11	\N	\N	\N	\N	\N	\N
40	8	31.142293333333	33.865477777778	4	2026-04-19 16:06:11	\N	\N	\N	\N	\N	\N
41	8	31.143555555556	33.861851111111	5	2026-04-19 16:06:11	\N	\N	\N	\N	\N	\N
42	8	31.143948888889	33.861126666667	6	2026-04-19 16:06:11	\N	\N	\N	\N	\N	\N
54	10	31.154297777778	33.839988888889	6	2026-04-19 21:31:11	\N	\N	\N	\N	\N	\N
25	6	30.126608888889	31.289208888889	1	2026-04-19 21:30:15	\N	\N	\N	\N	\N	\N
55	11	30.288102222222	32.325184444444	1	2026-04-19 21:31:09	\N	\N	\N	\N	\N	\N
26	6	30.126164444444	31.289033333333	2	2026-04-19 21:30:15	\N	\N	\N	\N	\N	\N
27	6	30.124288888889	31.288395555556	3	2026-04-19 21:30:15	\N	\N	\N	\N	\N	\N
28	6	30.122702222222	31.287886666667	4	2026-04-19 21:30:15	\N	\N	\N	\N	\N	\N
29	6	30.120637777778	31.287171111111	5	2026-04-19 21:30:15	\N	\N	\N	\N	\N	\N
30	6	30.119197777778	31.286735555556	6	2026-04-19 21:30:15	\N	\N	\N	\N	\N	\N
19	5	30.016608888889	32.47972	1	2026-04-19 21:31:13	\N	\N	\N	\N	\N	\N
20	5	30.014591111111	32.479484444444	2	2026-04-19 21:31:13	\N	\N	\N	\N	\N	\N
21	5	30.012293333333	32.479164444444	3	2026-04-19 21:31:13	\N	\N	\N	\N	\N	\N
22	5	30.010562222222	32.47892	4	2026-04-19 21:31:13	\N	\N	\N	\N	\N	\N
23	5	30.008577777778	32.478631111111	5	2026-04-19 21:31:13	\N	\N	\N	\N	\N	\N
24	5	30.008613333333	32.477588888889	6	2026-04-19 21:31:13	\N	\N	\N	\N	\N	\N
31	7	31.149971111111	33.841042222222	1	2026-04-19 21:31:10	\N	\N	\N	\N	\N	\N
32	7	31.151806666667	33.840622222222	2	2026-04-19 21:31:10	\N	\N	\N	\N	\N	\N
33	7	31.153235555556	33.841713333333	3	2026-04-19 21:31:10	\N	\N	\N	\N	\N	\N
34	7	31.151506666667	33.843548888889	4	2026-04-19 21:31:10	\N	\N	\N	\N	\N	\N
35	7	31.153068888889	33.840355555556	5	2026-04-19 21:31:10	\N	\N	\N	\N	\N	\N
36	7	31.153662222222	33.840153333333	6	2026-04-19 21:31:10	\N	\N	\N	\N	\N	\N
43	9	30.623022222222	32.243328888889	1	2026-04-19 21:31:10	\N	\N	\N	\N	\N	\N
44	9	30.62126	32.242062222222	2	2026-04-19 21:31:10	\N	\N	\N	\N	\N	\N
45	9	30.619864444444	32.240733333333	3	2026-04-19 21:31:10	\N	\N	\N	\N	\N	\N
46	9	30.619222222222	32.238208888889	4	2026-04-19 21:31:10	\N	\N	\N	\N	\N	\N
47	9	30.619302222222	32.236835555556	5	2026-04-19 21:31:10	\N	\N	\N	\N	\N	\N
48	9	30.619515555556	32.236182222222	6	2026-04-19 21:31:10	\N	\N	\N	\N	\N	\N
49	10	31.15162	33.843815555556	1	2026-04-19 21:31:11	\N	\N	\N	\N	\N	\N
50	10	31.152022222222	33.84364	2	2026-04-19 21:31:11	\N	\N	\N	\N	\N	\N
51	10	31.152946666667	33.843406666667	3	2026-04-19 21:31:11	\N	\N	\N	\N	\N	\N
52	10	31.153382222222	33.843242222222	4	2026-04-19 21:31:11	\N	\N	\N	\N	\N	\N
53	10	31.1538	33.840042222222	5	2026-04-19 21:31:11	\N	\N	\N	\N	\N	\N
56	11	30.290975555556	32.323864444444	2	2026-04-19 21:31:09	\N	\N	\N	\N	\N	\N
57	11	30.293375555556	32.322891111111	3	2026-04-19 21:31:09	\N	\N	\N	\N	\N	\N
58	11	30.294788888889	32.322513333333	4	2026-04-19 21:31:09	\N	\N	\N	\N	\N	\N
59	11	30.295004444444	32.32222	5	2026-04-19 21:31:09	\N	\N	\N	\N	\N	\N
60	11	30.29482	32.322522222222	6	2026-04-19 21:31:09	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: grids; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grids (id, page_key, columns, user_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: journey_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journey_attachments (id, journey_id, type, url, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: journey_policies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journey_policies (id, journey_id, "bookWeight", "actualWeight", "deliveryWeight", "shortageQty", "policyNo", "policyDate", "entryTimeFactory", "exitTimeFactory", delivery_gov_id, delivery_area_id, "loadingDate", "loadingPermitNo", "archiveNo", employee_id, "tripDuration", "tripDate", trip_distance, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: journey_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journey_transactions (id, journey_id, "transactionType", category, description, quantity, "unitPrice", "placeOrService", "invoiceUrl", amount, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: journeys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journeys (id, "delegateNumber", "delegateDate", "tripStatus", driver_id, assistant_id, car_id, client_id, trailer_id, direction, quantity, "cementGrade", "packingType", "sellingOrderNo", "receivedCompany", custody_source_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1775400001000	CreateCarManufacturerTable1775400001000
2	1775400002000	CreateTrailerManufacturerTable1775400002000
3	1775400003000	CreateTireModelTable1775400003000
4	1775400004000	CreateGovernmentsTable1775400004000
5	1775400005000	CreateBranchesTable1775400005000
6	1775400006000	CreateOwnersTable1775400006000
7	1775400007000	CreatePriceTypesTable1775400007000
8	1775400008000	CreateClientsTable1775400008000
9	1775400009000	CreateSuppliersTable1775400009000
10	1775400010000	CreateAccountsTable1775400010000
11	1775400011000	CreateJournalsTable1775400011000
12	1775400012000	CreateUsersTable1775400012000
13	1775400013000	CreateCarModelsTable1775400013000
14	1775400014000	CreateAreasTable1775400014000
15	1775400015000	CreateContactsTable1775400015000
16	1775400016000	CreateSalariesTable1775400016000
17	1775400017000	CreateUserAttachmentsTable1775400017000
18	1775400018000	CreateEmployeesTable1775400018000
19	1775400019000	CreateDriversTable1775400019000
20	1775400020000	CreateCarsTable1775400020000
21	1775400021000	CreateTrailersTable1775400021000
22	1775400022000	CreateWarehousesTable1775400022000
23	1775400023000	CreateDeliveryPricesTable1775400023000
24	1775400024000	CreateTransactionsTable1775400024000
25	1775400025000	CreateCarAttachmentsTable1775400025000
26	1775400026000	CreateTrailerAttachmentsTable1775400026000
27	1775400027000	CreateAxlesTable1775400027000
28	1775400028000	CreateGpsDevicesTable1775400028000
29	1775400029000	CreateRelCarOwnersTable1775400029000
30	1775400030000	CreateRelTrailerOwnersTable1775400030000
31	1775400031000	CreateTransactionLinesTable1775400031000
32	1775400032000	CreateTiresTable1775400032000
33	1775400033000	CreateGpsTailsTable1775400033000
34	1775400034000	CreateJourneysTable1775400034000
35	1775400035000	CreateGridsTable1775400035000
36	1775400036000	CreateJourneyPoliciesTable1775400036000
37	1775400037000	CreateJourneyTransactionsTable1775400037000
38	1775400038000	CreateJourneyAttachmentsTable1775400038000
39	1775400039000	CreateExpensesTable1775400039000
40	1775400040000	CreateExpenseAttachmentsTable1775400040000
41	1775400041000	FixAccountIsLeafDefault1775400041000
42	1775400042000	RemoveJournalsAndTransactionJournalId1775400042000
43	1775400043000	AddAccountIsSystem1775400043000
44	1775400044000	AddAccountOpeningBalance1775400044000
\.


--
-- Data for Name: owners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.owners (id, name, phone, "transactionType", email, address, "paymentNumber", notes, "bankAccountNumber", "bankName", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: price_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_types (id, name, description, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	BAGGED	تسعير للمنتجات المعبأة في شكاير	\N	\N	\N	\N	\N	\N
2	JUMBO_BAG	تسعير للمنتجات المعبأة في جامبو باج	\N	\N	\N	\N	\N	\N
3	SILO10	تسعير شحن صوامع 10 طن	\N	\N	\N	\N	\N	\N
4	SILO12	تسعير شحن صوامع 12 طن	\N	\N	\N	\N	\N	\N
5	LOOSE	تسعير للمنتجات السائبة	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: rel_car_owners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rel_car_owners (id, "ownerId", "carId", percentage, "contractUrl", notes, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: rel_trailer_owners; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rel_trailer_owners (id, "ownerId", "trailerId", percentage, "contractUrl", notes, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: salaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salaries (id, "salaryType", "salaryAmount", user_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, code, name, activity, governorate, city, phone, "commercialRegister", "taxCard", "taxRegistrationNumber", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: tire_model; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tire_model (id, name, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: tires; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tires (id, "serialNumber", type, "healthPercentage", location, "createdDate", "axleId", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: trailer_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trailer_attachments (id, trailer_id, type, "documentExpiryDate", url, notes, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: trailer_manufacturer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trailer_manufacturer (id, name, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: trailers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trailers (id, code, "chaseType", manufacturer, status, "manufactureYear", color, "maxWeight", "plateNumber", "plateLetters", "chassisNumber", "licenseNumber", "licenseExpiryDate", "axleCount", notes, "ownerShip", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: transaction_lines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transaction_lines (id, transaction_id, account_id, "entryType", amount, description, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	1	19	DEBIT	500000.00	تست 	\N	\N	\N	\N	\N	\N
2	1	42	CREDIT	500000.00	تست 	\N	\N	\N	\N	\N	\N
3	2	18	DEBIT	50000.00	تست 	\N	\N	\N	\N	\N	\N
4	2	19	CREDIT	50000.00	تست 	\N	\N	\N	\N	\N	\N
5	3	9	DEBIT	80000.00	تست 	\N	\N	\N	\N	\N	\N
6	3	33	CREDIT	80000.00	تست 	\N	\N	\N	\N	\N	\N
7	4	33	DEBIT	30000.00	تست 	\N	\N	\N	\N	\N	\N
8	4	18	CREDIT	30000.00	تست 	\N	\N	\N	\N	\N	\N
9	5	18	DEBIT	150000.00	تست 	\N	\N	\N	\N	\N	\N
10	5	48	CREDIT	150000.00	تست 	\N	\N	\N	\N	\N	\N
11	6	21	DEBIT	75000.00	تست 	\N	\N	\N	\N	\N	\N
12	6	48	CREDIT	75000.00	تست 	\N	\N	\N	\N	\N	\N
13	7	53	DEBIT	60000.00	تست 	\N	\N	\N	\N	\N	\N
14	7	19	CREDIT	60000.00	تست 	\N	\N	\N	\N	\N	\N
15	8	55	DEBIT	25000.00	تست 	\N	\N	\N	\N	\N	\N
16	8	18	CREDIT	25000.00	تست 	\N	\N	\N	\N	\N	\N
17	9	56	DEBIT	10000.00	تست 	\N	\N	\N	\N	\N	\N
18	9	18	CREDIT	10000.00	تست 	\N	\N	\N	\N	\N	\N
19	10	19	DEBIT	100000.00	تست 	\N	\N	\N	\N	\N	\N
20	10	30	CREDIT	100000.00	تست 	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, code, date, description, status, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	TRN-202604141	2026-01-01	تست 	POSTED	admin@admin.com	2026-04-14 23:09:26.102+00	admin@admin.com	2026-04-14 23:09:26.102+00	\N	\N
2	TRN-202604142	2026-01-05	تست 	POSTED	admin@admin.com	2026-04-14 23:09:38.075+00	admin@admin.com	2026-04-14 23:09:38.075+00	\N	\N
3	TRN-202604143	2026-01-10	تست 	POSTED	admin@admin.com	2026-04-14 23:09:38.107+00	admin@admin.com	2026-04-14 23:09:38.107+00	\N	\N
4	TRN-202604144	2026-01-20	تست 	POSTED	admin@admin.com	2026-04-14 23:09:38.133+00	admin@admin.com	2026-04-14 23:09:38.133+00	\N	\N
5	TRN-202604145	2026-02-01	تست 	POSTED	admin@admin.com	2026-04-14 23:09:38.166+00	admin@admin.com	2026-04-14 23:09:38.166+00	\N	\N
6	TRN-202604146	2026-02-10	تست 	POSTED	admin@admin.com	2026-04-14 23:09:51.587+00	admin@admin.com	2026-04-14 23:09:51.587+00	\N	\N
7	TRN-202604147	2026-02-15	تست 	POSTED	admin@admin.com	2026-04-14 23:09:51.617+00	admin@admin.com	2026-04-14 23:09:51.617+00	\N	\N
8	TRN-202604148	2026-03-01	تست 	POSTED	admin@admin.com	2026-04-14 23:09:51.639+00	admin@admin.com	2026-04-14 23:09:51.639+00	\N	\N
9	TRN-202604149	2026-03-05	تست 	POSTED	admin@admin.com	2026-04-14 23:09:51.665+00	admin@admin.com	2026-04-14 23:09:51.665+00	\N	\N
10	TRN-2026041410	2026-03-10	تست 	POSTED	admin@admin.com	2026-04-14 23:09:51.69+00	admin@admin.com	2026-04-14 23:09:51.69+00	\N	\N
\.


--
-- Data for Name: user_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_attachments (id, user_id, url, type, notes, "documentExpiryDate", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, username, status, activated, image_url, role, first_name, last_name, personal_id, personal_id_expiry_date, notes, code, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	admin@admin.com	$2b$10$sQIiJyqbEcFimm5khbP0Vu6PLvFSSt8JPIz4jS79dQe4SAHOlg3rS	Administrator	AVAILABLE	t	\N	ADMIN	\N	\N	\N	\N	\N	\N	system	\N	\N	\N	\N	\N
2	user@user.com	$2b$10$95MjZwqlrfY7QK1xzQrdKOWSIlJm4vxhBNfwz/ObkEV78V9wl5Y9u	Standard-User	AVAILABLE	t	\N	USER	\N	\N	\N	\N	\N	\N	system	\N	\N	\N	\N	\N
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.warehouses (id, code, name, status, condition, category, quantity, "alertQuantity", unit, supplier_id, "unitPrice", "manufacturingYear", "purchaseDate", "expiryDate", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Name: accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accounts_id_seq', 59, true);


--
-- Name: areas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.areas_id_seq', 111, true);


--
-- Name: axles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.axles_id_seq', 1, false);


--
-- Name: branches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.branches_id_seq', 1, false);


--
-- Name: car_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.car_attachments_id_seq', 1, false);


--
-- Name: car_manufacturer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.car_manufacturer_id_seq', 1, false);


--
-- Name: car_model_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.car_model_id_seq', 1, false);


--
-- Name: cars_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cars_id_seq', 1, false);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clients_id_seq', 2, true);


--
-- Name: contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contacts_id_seq', 1, false);


--
-- Name: delivery_prices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.delivery_prices_id_seq', 1, false);


--
-- Name: drivers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drivers_id_seq', 1, false);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.employees_id_seq', 1, false);


--
-- Name: expense_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expense_attachments_id_seq', 1, false);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, false);


--
-- Name: governments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.governments_id_seq', 29, true);


--
-- Name: gps_devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gps_devices_id_seq', 12, true);


--
-- Name: gps_tails_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gps_tails_id_seq', 60, true);


--
-- Name: grids_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.grids_id_seq', 1, false);


--
-- Name: journey_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journey_attachments_id_seq', 1, false);


--
-- Name: journey_policies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journey_policies_id_seq', 1, false);


--
-- Name: journey_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journey_transactions_id_seq', 1, false);


--
-- Name: journeys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journeys_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 44, true);


--
-- Name: owners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.owners_id_seq', 1, false);


--
-- Name: price_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.price_types_id_seq', 5, true);


--
-- Name: rel_car_owners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rel_car_owners_id_seq', 1, false);


--
-- Name: rel_trailer_owners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rel_trailer_owners_id_seq', 1, false);


--
-- Name: salaries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salaries_id_seq', 1, false);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 1, false);


--
-- Name: tire_model_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tire_model_id_seq', 1, false);


--
-- Name: tires_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tires_id_seq', 1, false);


--
-- Name: trailer_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trailer_attachments_id_seq', 1, false);


--
-- Name: trailer_manufacturer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trailer_manufacturer_id_seq', 1, false);


--
-- Name: trailers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trailers_id_seq', 1, false);


--
-- Name: transaction_lines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transaction_lines_id_seq', 20, true);


--
-- Name: transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transactions_id_seq', 10, true);


--
-- Name: user_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_attachments_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 1, false);


--
-- Name: gps_devices PK_0adaf7314e19ede4fd808ee2c59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gps_devices
    ADD CONSTRAINT "PK_0adaf7314e19ede4fd808ee2c59" PRIMARY KEY (id);


--
-- Name: expense_attachments PK_0baa50797b094b065d0f53df89d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments
    ADD CONSTRAINT "PK_0baa50797b094b065d0f53df89d" PRIMARY KEY (id);


--
-- Name: tire_model PK_10ec6660b5c4e514f85adbf75ba; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tire_model
    ADD CONSTRAINT "PK_10ec6660b5c4e514f85adbf75ba" PRIMARY KEY (id);


--
-- Name: journey_attachments PK_112e4b698234a234964c78c4b90; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journey_attachments
    ADD CONSTRAINT "PK_112e4b698234a234964c78c4b90" PRIMARY KEY (id);


--
-- Name: salaries PK_20ca60aa8d4201c7bcb430fdb36; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salaries
    ADD CONSTRAINT "PK_20ca60aa8d4201c7bcb430fdb36" PRIMARY KEY (id);


--
-- Name: journey_transactions PK_2525cdd93b79c048119de893749; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journey_transactions
    ADD CONSTRAINT "PK_2525cdd93b79c048119de893749" PRIMARY KEY (id);


--
-- Name: trailer_attachments PK_33d7fa33e4eba82bad362458016; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailer_attachments
    ADD CONSTRAINT "PK_33d7fa33e4eba82bad362458016" PRIMARY KEY (id);


--
-- Name: owners PK_42838282f2e6b216301a70b02d6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.owners
    ADD CONSTRAINT "PK_42838282f2e6b216301a70b02d6" PRIMARY KEY (id);


--
-- Name: areas PK_5110493f6342f34c978c084d0d6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT "PK_5110493f6342f34c978c084d0d6" PRIMARY KEY (id);


--
-- Name: car_model PK_525071eea12c671d67e35a5cbc8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_model
    ADD CONSTRAINT "PK_525071eea12c671d67e35a5cbc8" PRIMARY KEY (id);


--
-- Name: warehouses PK_56ae21ee2432b2270b48867e4be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" PRIMARY KEY (id);


--
-- Name: trailers PK_598af6bec45fafbf70437f32b8b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailers
    ADD CONSTRAINT "PK_598af6bec45fafbf70437f32b8b" PRIMARY KEY (id);


--
-- Name: accounts PK_5a7a02c20412299d198e097a8fe; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY (id);


--
-- Name: delivery_prices PK_5e3e148b50728cd586bdd5d2b88; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_prices
    ADD CONSTRAINT "PK_5e3e148b50728cd586bdd5d2b88" PRIMARY KEY (id);


--
-- Name: transaction_lines PK_5e86f439de47ce9fe33d43b88de; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_lines
    ADD CONSTRAINT "PK_5e86f439de47ce9fe33d43b88de" PRIMARY KEY (id);


--
-- Name: axles PK_60c9cb305d091eb7724d43d8828; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.axles
    ADD CONSTRAINT "PK_60c9cb305d091eb7724d43d8828" PRIMARY KEY (id);


--
-- Name: price_types PK_623e93be1356fb26b7241a991a3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_types
    ADD CONSTRAINT "PK_623e93be1356fb26b7241a991a3" PRIMARY KEY (id);


--
-- Name: rel_car_owners PK_6de30d8bb3c7d984b22ec28a3b3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_car_owners
    ADD CONSTRAINT "PK_6de30d8bb3c7d984b22ec28a3b3" PRIMARY KEY (id);


--
-- Name: branches PK_7f37d3b42defea97f1df0d19535; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY (id);


--
-- Name: grids PK_840d40fdcde1e935afd43082aca; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grids
    ADD CONSTRAINT "PK_840d40fdcde1e935afd43082aca" PRIMARY KEY (id);


--
-- Name: user_attachments PK_859909c9f55bd0cae3f6f6bf730; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_attachments
    ADD CONSTRAINT "PK_859909c9f55bd0cae3f6f6bf730" PRIMARY KEY (id);


--
-- Name: governments PK_881b45fcd49cb941b26eb238768; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.governments
    ADD CONSTRAINT "PK_881b45fcd49cb941b26eb238768" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: drivers PK_92ab3fb69e566d3eb0cae896047; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT "PK_92ab3fb69e566d3eb0cae896047" PRIMARY KEY (id);


--
-- Name: journeys PK_94b31b067846c92b6811046c81e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journeys
    ADD CONSTRAINT "PK_94b31b067846c92b6811046c81e" PRIMARY KEY (id);


--
-- Name: expenses PK_94c3ceb17e3140abc9282c20610; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY (id);


--
-- Name: car_attachments PK_9879b901204f699dab7cc85f891; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_attachments
    ADD CONSTRAINT "PK_9879b901204f699dab7cc85f891" PRIMARY KEY (id);


--
-- Name: transactions PK_a219afd8dd77ed80f5a862f1db9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: journey_policies PK_a7c43209c057e0a42c6e64de80e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journey_policies
    ADD CONSTRAINT "PK_a7c43209c057e0a42c6e64de80e" PRIMARY KEY (id);


--
-- Name: car_manufacturer PK_b04564d061f113e2d060709b026; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_manufacturer
    ADD CONSTRAINT "PK_b04564d061f113e2d060709b026" PRIMARY KEY (id);


--
-- Name: suppliers PK_b70ac51766a9e3144f778cfe81e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY (id);


--
-- Name: employees PK_b9535a98350d5b26e7eb0c26af4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY (id);


--
-- Name: contacts PK_b99cd40cfd66a99f1571f4f72e6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT "PK_b99cd40cfd66a99f1571f4f72e6" PRIMARY KEY (id);


--
-- Name: trailer_manufacturer PK_bc9d6b52fa814767eb8f1c56dce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailer_manufacturer
    ADD CONSTRAINT "PK_bc9d6b52fa814767eb8f1c56dce" PRIMARY KEY (id);


--
-- Name: tires PK_d0486c80db39eb9becdfec74546; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tires
    ADD CONSTRAINT "PK_d0486c80db39eb9becdfec74546" PRIMARY KEY (id);


--
-- Name: gps_tails PK_d3cb731ba5a5f00a5ad1063e000; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gps_tails
    ADD CONSTRAINT "PK_d3cb731ba5a5f00a5ad1063e000" PRIMARY KEY (id);


--
-- Name: clients PK_f1ab7cf3a5714dbc6bb4e1c28a4; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY (id);


--
-- Name: rel_trailer_owners PK_f745e6a8c7ada42114d98a41b8c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_trailer_owners
    ADD CONSTRAINT "PK_f745e6a8c7ada42114d98a41b8c" PRIMARY KEY (id);


--
-- Name: cars PK_fc218aa84e79b477d55322271b6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cars
    ADD CONSTRAINT "PK_fc218aa84e79b477d55322271b6" PRIMARY KEY (id);


--
-- Name: trailer_manufacturer UQ_0b5599e031e31a9f6424deb09a6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailer_manufacturer
    ADD CONSTRAINT "UQ_0b5599e031e31a9f6424deb09a6" UNIQUE (name);


--
-- Name: accounts UQ_490319656e54a7957dc1fed027c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "UQ_490319656e54a7957dc1fed027c" UNIQUE (code);


--
-- Name: drivers UQ_57d866371f392f459cd9ee46f6a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT "UQ_57d866371f392f459cd9ee46f6a" UNIQUE ("userId");


--
-- Name: suppliers UQ_6f01a03dcb1aa33822e19534cd6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "UQ_6f01a03dcb1aa33822e19534cd6" UNIQUE (code);


--
-- Name: employees UQ_737991e10350d9626f592894cef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "UQ_737991e10350d9626f592894cef" UNIQUE ("userId");


--
-- Name: transactions UQ_7f1b559bc56646d367158479b17; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "UQ_7f1b559bc56646d367158479b17" UNIQUE (code);


--
-- Name: gps_devices UQ_94527760f23339a049901ecebb8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gps_devices
    ADD CONSTRAINT "UQ_94527760f23339a049901ecebb8" UNIQUE ("carId");


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: delivery_prices UQ_a9e4be24094b27f033a845e33c0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_prices
    ADD CONSTRAINT "UQ_a9e4be24094b27f033a845e33c0" UNIQUE (client_id, area_id, price_type_id, "validFrom");


--
-- Name: salaries UQ_c12591382bdd41fa79264f339e0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salaries
    ADD CONSTRAINT "UQ_c12591382bdd41fa79264f339e0" UNIQUE (user_id);


--
-- Name: car_manufacturer UQ_c195a07cc1c497b8b1a628f7815; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_manufacturer
    ADD CONSTRAINT "UQ_c195a07cc1c497b8b1a628f7815" UNIQUE (name);


--
-- Name: warehouses UQ_d8b96d60ff9a288f5ed862280d9; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT "UQ_d8b96d60ff9a288f5ed862280d9" UNIQUE (code);


--
-- Name: IDX_03c648be4fb247d94d063e9718; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_03c648be4fb247d94d063e9718" ON public.cars USING btree ("chassisNumber");


--
-- Name: IDX_164a142564f25745a88e140feb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_164a142564f25745a88e140feb" ON public.delivery_prices USING btree (client_id, area_id, "validFrom", "validTo");


--
-- Name: IDX_1ddc9fa1dd4f1f0e7af10dfac2; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_1ddc9fa1dd4f1f0e7af10dfac2" ON public.trailers USING btree ("chassisNumber");


--
-- Name: IDX_3d9547156ad50bae6149482e52; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_3d9547156ad50bae6149482e52" ON public.expenses USING btree (type);


--
-- Name: IDX_8069e1998f006661e74de2e716; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_8069e1998f006661e74de2e716" ON public.rel_trailer_owners USING btree ("trailerId", "ownerId");


--
-- Name: IDX_88242022523c1367a680cfced6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_88242022523c1367a680cfced6" ON public.price_types USING btree (name);


--
-- Name: IDX_99e921caf21faa2aab020476e4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_99e921caf21faa2aab020476e4" ON public.clients USING btree (name);


--
-- Name: IDX_a5cfb10e3dedb4f64a646fa1b4; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_a5cfb10e3dedb4f64a646fa1b4" ON public.gps_devices USING btree (imei);


--
-- Name: IDX_bd53a6f028794296316a21afd1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_bd53a6f028794296316a21afd1" ON public.rel_car_owners USING btree ("carId", "ownerId");


--
-- Name: IDX_be9dd3cc2931f11f7440f2eeb1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_be9dd3cc2931f11f7440f2eeb1" ON public.warehouses USING btree (name);


--
-- Name: IDX_car_attachments_car_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_car_attachments_car_id" ON public.car_attachments USING btree (car_id);


--
-- Name: IDX_expense_attachments_expense_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_expense_attachments_expense_id" ON public.expense_attachments USING btree (expense_id);


--
-- Name: IDX_journey_attachments_journey_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_journey_attachments_journey_id" ON public.journey_attachments USING btree (journey_id);


--
-- Name: IDX_trailer_attachments_trailer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_trailer_attachments_trailer_id" ON public.trailer_attachments USING btree (trailer_id);


--
-- Name: IDX_user_attachments_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_user_attachments_user_id" ON public.user_attachments USING btree (user_id);


--
-- Name: uniq_journey_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX uniq_journey_category ON public.journey_transactions USING btree (journey_id);


--
-- Name: journeys FK_008df0efa15f25a289f8866c945; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journeys
    ADD CONSTRAINT "FK_008df0efa15f25a289f8866c945" FOREIGN KEY (driver_id) REFERENCES public.drivers(id);


--
-- Name: rel_car_owners FK_05388e2f26e58eff1734ec5f42a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_car_owners
    ADD CONSTRAINT "FK_05388e2f26e58eff1734ec5f42a" FOREIGN KEY ("carId") REFERENCES public.cars(id) ON DELETE CASCADE;


--
-- Name: journeys FK_06bbbe0da75018c63690332abd2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journeys
    ADD CONSTRAINT "FK_06bbbe0da75018c63690332abd2" FOREIGN KEY (assistant_id) REFERENCES public.users(id);


--
-- Name: journey_transactions FK_06ca2fdacdb40a96f3acdb433ac; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journey_transactions
    ADD CONSTRAINT "FK_06ca2fdacdb40a96f3acdb433ac" FOREIGN KEY (journey_id) REFERENCES public.journeys(id) ON DELETE CASCADE;


--
-- Name: trailer_attachments FK_0d7559ab498af27dea3b7dd8607; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trailer_attachments
    ADD CONSTRAINT "FK_0d7559ab498af27dea3b7dd8607" FOREIGN KEY (trailer_id) REFERENCES public.trailers(id) ON DELETE CASCADE;


--
-- Name: axles FK_0d94b04239251dd919b8e15e702; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.axles
    ADD CONSTRAINT "FK_0d94b04239251dd919b8e15e702" FOREIGN KEY ("carId") REFERENCES public.cars(id);


--
-- Name: employees FK_0ee1fa8d2cfe91f9dac54f9e2ff; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "FK_0ee1fa8d2cfe91f9dac54f9e2ff" FOREIGN KEY ("branchId") REFERENCES public.branches(id);


--
-- Name: journey_policies FK_2565fdb6efcdc2742e1e4fa60ad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journey_policies
    ADD CONSTRAINT "FK_2565fdb6efcdc2742e1e4fa60ad" FOREIGN KEY (journey_id) REFERENCES public.journeys(id) ON DELETE CASCADE;


--
-- Name: rel_trailer_owners FK_29aed2f7984d191265820776a8e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_trailer_owners
    ADD CONSTRAINT "FK_29aed2f7984d191265820776a8e" FOREIGN KEY ("ownerId") REFERENCES public.owners(id) ON DELETE CASCADE;


--
-- Name: expenses FK_2a9d7d6a2ecda012f84bfbe427f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "FK_2a9d7d6a2ecda012f84bfbe427f" FOREIGN KEY (car_id) REFERENCES public.cars(id);


--
-- Name: expenses FK_2f4f5d1c1e4243899954c63b391; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT "FK_2f4f5d1c1e4243899954c63b391" FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: contacts FK_30ef77942fc8c05fcb829dcc61d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT "FK_30ef77942fc8c05fcb829dcc61d" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tires FK_3a841459bddbac98c7cf35e348c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tires
    ADD CONSTRAINT "FK_3a841459bddbac98c7cf35e348c" FOREIGN KEY ("axleId") REFERENCES public.axles(id);


--
-- Name: rel_trailer_owners FK_3cfab7410f91160971ea5c4cc12; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_trailer_owners
    ADD CONSTRAINT "FK_3cfab7410f91160971ea5c4cc12" FOREIGN KEY ("trailerId") REFERENCES public.trailers(id) ON DELETE CASCADE;


--
-- Name: car_model FK_3f4da506861366041fba2d2955d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_model
    ADD CONSTRAINT "FK_3f4da506861366041fba2d2955d" FOREIGN KEY ("manufacturerId") REFERENCES public.car_manufacturer(id) ON DELETE CASCADE;


--
-- Name: journey_policies FK_561015b6d2944ffb2de06d1c172; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journey_policies
    ADD CONSTRAINT "FK_561015b6d2944ffb2de06d1c172" FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: drivers FK_57d866371f392f459cd9ee46f6a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT "FK_57d866371f392f459cd9ee46f6a" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: journeys FK_61f171024684ff87bbd615a73d1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journeys
    ADD CONSTRAINT "FK_61f171024684ff87bbd615a73d1" FOREIGN KEY (trailer_id) REFERENCES public.trailers(id);


--
-- Name: car_attachments FK_6259cfc4383957669e48b9282a4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car_attachments
    ADD CONSTRAINT "FK_6259cfc4383957669e48b9282a4" FOREIGN KEY (car_id) REFERENCES public.cars(id) ON DELETE CASCADE;


--
-- Name: journey_attachments FK_6cf3be50d8e7fd8f3b53310d1c9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journey_attachments
    ADD CONSTRAINT "FK_6cf3be50d8e7fd8f3b53310d1c9" FOREIGN KEY (journey_id) REFERENCES public.journeys(id) ON DELETE CASCADE;


--
-- Name: employees FK_737991e10350d9626f592894cef; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT "FK_737991e10350d9626f592894cef" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: journeys FK_77845730b5b28446585bbc9db6b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journeys
    ADD CONSTRAINT "FK_77845730b5b28446585bbc9db6b" FOREIGN KEY (car_id) REFERENCES public.cars(id);


--
-- Name: transaction_lines FK_7dea00f319a54c2af12f5a475f2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_lines
    ADD CONSTRAINT "FK_7dea00f319a54c2af12f5a475f2" FOREIGN KEY (account_id) REFERENCES public.accounts(id);


--
-- Name: journeys FK_7ffefc3bac42de05131ba1c8e83; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journeys
    ADD CONSTRAINT "FK_7ffefc3bac42de05131ba1c8e83" FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: accounts FK_82655922433e50df4fd451d5240; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT "FK_82655922433e50df4fd451d5240" FOREIGN KEY (parent_account_id) REFERENCES public.accounts(id) ON DELETE SET NULL;


--
-- Name: areas FK_880b436eddd01cb98e331173581; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.areas
    ADD CONSTRAINT "FK_880b436eddd01cb98e331173581" FOREIGN KEY (government_id) REFERENCES public.governments(id) ON DELETE RESTRICT;


--
-- Name: delivery_prices FK_907d6b87db07815355c96544f44; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_prices
    ADD CONSTRAINT "FK_907d6b87db07815355c96544f44" FOREIGN KEY (price_type_id) REFERENCES public.price_types(id);


--
-- Name: gps_devices FK_94527760f23339a049901ecebb8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gps_devices
    ADD CONSTRAINT "FK_94527760f23339a049901ecebb8" FOREIGN KEY ("carId") REFERENCES public.cars(id);


--
-- Name: delivery_prices FK_97d3d34b7b0694c4d726a9215b3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_prices
    ADD CONSTRAINT "FK_97d3d34b7b0694c4d726a9215b3" FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: user_attachments FK_a1ba6baf34ed9981f6d23837f99; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_attachments
    ADD CONSTRAINT "FK_a1ba6baf34ed9981f6d23837f99" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: grids FK_b01745586efc42aab2dc6303c65; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grids
    ADD CONSTRAINT "FK_b01745586efc42aab2dc6303c65" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: axles FK_b3301ef417c3cf8d6ef5ea5d027; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.axles
    ADD CONSTRAINT "FK_b3301ef417c3cf8d6ef5ea5d027" FOREIGN KEY ("trailerId") REFERENCES public.trailers(id);


--
-- Name: journey_policies FK_b39411b0fd78334ee6ccd9b7524; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journey_policies
    ADD CONSTRAINT "FK_b39411b0fd78334ee6ccd9b7524" FOREIGN KEY (delivery_area_id) REFERENCES public.areas(id);


--
-- Name: gps_tails FK_bd59438dc532d05e0f47292f477; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gps_tails
    ADD CONSTRAINT "FK_bd59438dc532d05e0f47292f477" FOREIGN KEY (device_id) REFERENCES public.gps_devices(id) ON DELETE CASCADE;


--
-- Name: salaries FK_c12591382bdd41fa79264f339e0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salaries
    ADD CONSTRAINT "FK_c12591382bdd41fa79264f339e0" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: warehouses FK_c49cfbf484fa681d1ddf4f6825f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT "FK_c49cfbf484fa681d1ddf4f6825f" FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE RESTRICT;


--
-- Name: rel_car_owners FK_c758d32daccec0103bdd667c8ca; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_car_owners
    ADD CONSTRAINT "FK_c758d32daccec0103bdd667c8ca" FOREIGN KEY ("ownerId") REFERENCES public.owners(id) ON DELETE CASCADE;


--
-- Name: journey_policies FK_d900cb4148315e84dd6a594f56b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journey_policies
    ADD CONSTRAINT "FK_d900cb4148315e84dd6a594f56b" FOREIGN KEY (delivery_gov_id) REFERENCES public.governments(id);


--
-- Name: delivery_prices FK_de9dda52027224d370945b9c11b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_prices
    ADD CONSTRAINT "FK_de9dda52027224d370945b9c11b" FOREIGN KEY (area_id) REFERENCES public.areas(id);


--
-- Name: journeys FK_df0aba0ade3f9a5eaf5e8e83de3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journeys
    ADD CONSTRAINT "FK_df0aba0ade3f9a5eaf5e8e83de3" FOREIGN KEY (custody_source_id) REFERENCES public.employees(id) ON DELETE SET NULL;


--
-- Name: expense_attachments FK_e946f1f2ffdb088d00d21666a72; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expense_attachments
    ADD CONSTRAINT "FK_e946f1f2ffdb088d00d21666a72" FOREIGN KEY (expense_id) REFERENCES public.expenses(id) ON DELETE CASCADE;


--
-- Name: transaction_lines FK_ff2ebd6dbc6bb5eb10aa1d51d84; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transaction_lines
    ADD CONSTRAINT "FK_ff2ebd6dbc6bb5eb10aa1d51d84" FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict pO6lSsSziwcj04M3CnjU8fUgSMtgeBy9r7Dvis9b8EXePVIUIw02U4JuGWR3UBP

--
-- Database "user_management" dump
--

--
-- PostgreSQL database dump
--

\restrict ug05TJ9XkKAPb0VlCSm7Pde8xVzuuuSMvEIhXTttoWpxtSHoWZKcp6EQRYJob3f

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: user_management; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE user_management WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE user_management OWNER TO postgres;

\unrestrict ug05TJ9XkKAPb0VlCSm7Pde8xVzuuuSMvEIhXTttoWpxtSHoWZKcp6EQRYJob3f
\connect user_management
\restrict ug05TJ9XkKAPb0VlCSm7Pde8xVzuuuSMvEIhXTttoWpxtSHoWZKcp6EQRYJob3f

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: favourites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favourites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    consume_app character varying(50) NOT NULL,
    feature_type character varying(100) NOT NULL,
    feature_id integer NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.favourites OWNER TO postgres;

--
-- Name: COLUMN favourites.consume_app; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.favourites.consume_app IS 'Application name (e.g., dms, crm, erp)';


--
-- Name: COLUMN favourites.feature_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.favourites.feature_type IS 'Feature type specific to each application';


--
-- Name: favourites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favourites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.favourites_id_seq OWNER TO postgres;

--
-- Name: favourites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favourites_id_seq OWNED BY public.favourites.id;


--
-- Name: general_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.general_permissions (
    id integer NOT NULL,
    code character varying(150) NOT NULL,
    "name_Ar" character varying(255) NOT NULL,
    "name_En" character varying(255) NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.general_permissions OWNER TO postgres;

--
-- Name: general_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.general_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.general_permissions_id_seq OWNER TO postgres;

--
-- Name: general_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.general_permissions_id_seq OWNED BY public.general_permissions.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: modules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modules (
    id integer NOT NULL,
    "name_Ar" character varying(100) NOT NULL,
    "name_En" character varying(100) NOT NULL,
    code character varying(50),
    "description_Ar" text,
    "description_En" text,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.modules OWNER TO postgres;

--
-- Name: modules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modules_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.modules_id_seq OWNER TO postgres;

--
-- Name: modules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modules_id_seq OWNED BY public.modules.id;


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    module_id bigint NOT NULL,
    code character varying(150) NOT NULL,
    "name_Ar" character varying(255) NOT NULL,
    "name_En" character varying(255) NOT NULL,
    "description_Ar" text,
    "description_En" text,
    is_active boolean DEFAULT true NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone,
    general_permission_id integer
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_id_seq OWNER TO postgres;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: role_general_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_general_permissions (
    role_id bigint NOT NULL,
    general_permission_id bigint NOT NULL
);


ALTER TABLE public.role_general_permissions OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    role_id bigint NOT NULL,
    permission_id bigint NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    "name_Ar" character varying(100) NOT NULL,
    "name_En" character varying(100) NOT NULL,
    "description_Ar" text,
    "description_En" text,
    code character varying(50),
    is_system_role boolean DEFAULT false NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone,
    level_one_id integer,
    level_two_id integer,
    level_three_id integer
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_permissions (
    user_id bigint NOT NULL,
    permission_id bigint NOT NULL,
    granted boolean NOT NULL
);


ALTER TABLE public.user_permissions OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    role_id bigint NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: user_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_roles_id_seq OWNER TO postgres;

--
-- Name: user_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_roles_id_seq OWNED BY public.user_roles.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying,
    name character varying,
    short_name character varying,
    phone character varying,
    email_evara character varying,
    email_private character varying,
    email character varying,
    image_url character varying,
    password character varying,
    activated boolean DEFAULT false NOT NULL,
    reset_password_request boolean DEFAULT false NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone,
    level_one_id integer,
    level_two_id integer,
    level_three_id integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: favourites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourites ALTER COLUMN id SET DEFAULT nextval('public.favourites_id_seq'::regclass);


--
-- Name: general_permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.general_permissions ALTER COLUMN id SET DEFAULT nextval('public.general_permissions_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: modules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules ALTER COLUMN id SET DEFAULT nextval('public.modules_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: user_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles ALTER COLUMN id SET DEFAULT nextval('public.user_roles_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: favourites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favourites (id, user_id, consume_app, feature_type, feature_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: general_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.general_permissions (id, code, "name_Ar", "name_En", created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	VIEW	عرض	VIEW	\N	2026-04-14 18:25:15.939919+00	\N	\N	\N	\N
2	CREATE	إضافة	CREATE	\N	2026-04-14 18:25:15.948295+00	\N	\N	\N	\N
3	EDIT	تعديل	EDIT	\N	2026-04-14 18:25:15.957878+00	\N	\N	\N	\N
4	DELETE	حذف	DELETE	\N	2026-04-14 18:25:15.968693+00	\N	\N	\N	\N
5	ARCHIVE	أرشفة	ARCHIVE	\N	2026-04-14 18:25:15.977795+00	\N	\N	\N	\N
6	UPLOAD	رفع	UPLOAD	\N	2026-04-14 18:25:15.985505+00	\N	\N	\N	\N
7	DOWNLOAD	تحميل	DOWNLOAD	\N	2026-04-14 18:25:15.992695+00	\N	\N	\N	\N
8	COPY	نسخ	COPY	\N	2026-04-14 18:25:16.000056+00	\N	\N	\N	\N
9	MOVE	نقل	MOVE	\N	2026-04-14 18:25:16.007049+00	\N	\N	\N	\N
10	LINK	ربط	LINK	\N	2026-04-14 18:25:16.014532+00	\N	\N	\N	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1765042818137	CreateModuleTable1765042818137
2	1765042839363	CreatepermissionTable1765042839363
3	1765042865354	CreateRoleTable1765042865354
4	1765042888581	CreateUserTable1765042888581
5	1765042926793	CreateUserRoleTable1765042926793
6	1765042959694	CreateRolePermissionTable1765042959694
7	1765042980940	CreateUserPermissionTable1765042980940
8	1766829929821	CreateFavouritesTable1766829929821
9	1768190400000	AlterUserTable1768190400000
10	1768191000000	AlterUserTable1768191000000
11	1770022397569	AlterRoleTable1770022397569
12	1770453978931	CreateGeneralPermisionsTable1770453978931
13	1770454161476	AlterPermisionsTable1770454161476
14	1770465108978	CreateRoleGeneralPermissionTable1770465108978
\.


--
-- Data for Name: modules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modules (id, "name_Ar", "name_En", code, "description_Ar", "description_En", is_active, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	إعدادات المنظمة	Organization Settings	ORGANIZATION_SETTINGS	إدارة الوزارات والأقسام والوكالات	Manage ministries, departments, agencies	t	\N	2026-04-14 18:25:15.8728+00	\N	\N	\N	\N
2	نظام إدارة الوثائق DMS	DOCUMENT MANAGEMENT SYSTEM ( DMS )	DMS	إدارة الوثائق والمستندات	Manage documents and files	t	\N	2026-04-14 18:25:15.899242+00	\N	\N	\N	\N
3	مخاطر المياة	Water Hazards	WATER_HAZARDS	منصة ادارة مخاطر المياة	Manage water hazards and solutions.	t	\N	2026-04-14 18:25:15.910633+00	\N	\N	\N	\N
4	إدارة المشاريع	PROJECT MANAGEMENT	PROJECT_MANAGEMENT	إدارة المشاريع والمهام	Manage projects and tasks.	t	\N	2026-04-14 18:25:15.920173+00	\N	\N	\N	\N
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, module_id, code, "name_Ar", "name_En", "description_Ar", "description_En", is_active, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at, general_permission_id) FROM stdin;
1	1	ORGANIZATION_SETTINGS_VIEW	عرض إعدادات المنظمة	VIEW Organization Settings	\N	VIEW Organization Settings	t	\N	2026-04-14 18:25:16.028289+00	\N	\N	\N	\N	1
2	1	ORGANIZATION_SETTINGS_CREATE	إضافة إعدادات المنظمة	CREATE Organization Settings	\N	CREATE Organization Settings	t	\N	2026-04-14 18:25:16.038935+00	\N	\N	\N	\N	2
3	1	ORGANIZATION_SETTINGS_EDIT	تعديل إعدادات المنظمة	EDIT Organization Settings	\N	EDIT Organization Settings	t	\N	2026-04-14 18:25:16.046148+00	\N	\N	\N	\N	3
4	1	ORGANIZATION_SETTINGS_DELETE	حذف إعدادات المنظمة	DELETE Organization Settings	\N	DELETE Organization Settings	t	\N	2026-04-14 18:25:16.05338+00	\N	\N	\N	\N	4
5	1	ORGANIZATION_SETTINGS_ARCHIVE	أرشفة إعدادات المنظمة	ARCHIVE Organization Settings	\N	ARCHIVE Organization Settings	t	\N	2026-04-14 18:25:16.060139+00	\N	\N	\N	\N	5
6	1	ORGANIZATION_SETTINGS_UPLOAD	رفع إعدادات المنظمة	UPLOAD Organization Settings	\N	UPLOAD Organization Settings	t	\N	2026-04-14 18:25:16.06893+00	\N	\N	\N	\N	6
7	1	ORGANIZATION_SETTINGS_DOWNLOAD	تحميل إعدادات المنظمة	DOWNLOAD Organization Settings	\N	DOWNLOAD Organization Settings	t	\N	2026-04-14 18:25:16.076514+00	\N	\N	\N	\N	7
8	1	ORGANIZATION_SETTINGS_COPY	نسخ إعدادات المنظمة	COPY Organization Settings	\N	COPY Organization Settings	t	\N	2026-04-14 18:25:16.083323+00	\N	\N	\N	\N	8
9	1	ORGANIZATION_SETTINGS_MOVE	نقل إعدادات المنظمة	MOVE Organization Settings	\N	MOVE Organization Settings	t	\N	2026-04-14 18:25:16.090139+00	\N	\N	\N	\N	9
10	1	ORGANIZATION_SETTINGS_LINK	ربط إعدادات المنظمة	LINK Organization Settings	\N	LINK Organization Settings	t	\N	2026-04-14 18:25:16.098996+00	\N	\N	\N	\N	10
11	2	DMS_VIEW	عرض نظام إدارة الوثائق DMS	VIEW DOCUMENT MANAGEMENT SYSTEM ( DMS )	\N	VIEW DOCUMENT MANAGEMENT SYSTEM ( DMS )	t	\N	2026-04-14 18:25:16.105899+00	\N	\N	\N	\N	1
12	2	DMS_CREATE	إضافة نظام إدارة الوثائق DMS	CREATE DOCUMENT MANAGEMENT SYSTEM ( DMS )	\N	CREATE DOCUMENT MANAGEMENT SYSTEM ( DMS )	t	\N	2026-04-14 18:25:16.113144+00	\N	\N	\N	\N	2
13	2	DMS_EDIT	تعديل نظام إدارة الوثائق DMS	EDIT DOCUMENT MANAGEMENT SYSTEM ( DMS )	\N	EDIT DOCUMENT MANAGEMENT SYSTEM ( DMS )	t	\N	2026-04-14 18:25:16.121109+00	\N	\N	\N	\N	3
14	2	DMS_DELETE	حذف نظام إدارة الوثائق DMS	DELETE DOCUMENT MANAGEMENT SYSTEM ( DMS )	\N	DELETE DOCUMENT MANAGEMENT SYSTEM ( DMS )	t	\N	2026-04-14 18:25:16.130498+00	\N	\N	\N	\N	4
15	2	DMS_ARCHIVE	أرشفة نظام إدارة الوثائق DMS	ARCHIVE DOCUMENT MANAGEMENT SYSTEM ( DMS )	\N	ARCHIVE DOCUMENT MANAGEMENT SYSTEM ( DMS )	t	\N	2026-04-14 18:25:16.139305+00	\N	\N	\N	\N	5
16	2	DMS_UPLOAD	رفع نظام إدارة الوثائق DMS	UPLOAD DOCUMENT MANAGEMENT SYSTEM ( DMS )	\N	UPLOAD DOCUMENT MANAGEMENT SYSTEM ( DMS )	t	\N	2026-04-14 18:25:16.149036+00	\N	\N	\N	\N	6
17	2	DMS_DOWNLOAD	تحميل نظام إدارة الوثائق DMS	DOWNLOAD DOCUMENT MANAGEMENT SYSTEM ( DMS )	\N	DOWNLOAD DOCUMENT MANAGEMENT SYSTEM ( DMS )	t	\N	2026-04-14 18:25:16.158253+00	\N	\N	\N	\N	7
18	2	DMS_COPY	نسخ نظام إدارة الوثائق DMS	COPY DOCUMENT MANAGEMENT SYSTEM ( DMS )	\N	COPY DOCUMENT MANAGEMENT SYSTEM ( DMS )	t	\N	2026-04-14 18:25:16.168462+00	\N	\N	\N	\N	8
19	2	DMS_MOVE	نقل نظام إدارة الوثائق DMS	MOVE DOCUMENT MANAGEMENT SYSTEM ( DMS )	\N	MOVE DOCUMENT MANAGEMENT SYSTEM ( DMS )	t	\N	2026-04-14 18:25:16.178206+00	\N	\N	\N	\N	9
20	2	DMS_LINK	ربط نظام إدارة الوثائق DMS	LINK DOCUMENT MANAGEMENT SYSTEM ( DMS )	\N	LINK DOCUMENT MANAGEMENT SYSTEM ( DMS )	t	\N	2026-04-14 18:25:16.185947+00	\N	\N	\N	\N	10
21	3	WATER_HAZARDS_VIEW	عرض مخاطر المياة	VIEW Water Hazards	\N	VIEW Water Hazards	t	\N	2026-04-14 18:25:16.194283+00	\N	\N	\N	\N	1
22	3	WATER_HAZARDS_CREATE	إضافة مخاطر المياة	CREATE Water Hazards	\N	CREATE Water Hazards	t	\N	2026-04-14 18:25:16.201998+00	\N	\N	\N	\N	2
23	3	WATER_HAZARDS_EDIT	تعديل مخاطر المياة	EDIT Water Hazards	\N	EDIT Water Hazards	t	\N	2026-04-14 18:25:16.210284+00	\N	\N	\N	\N	3
24	3	WATER_HAZARDS_DELETE	حذف مخاطر المياة	DELETE Water Hazards	\N	DELETE Water Hazards	t	\N	2026-04-14 18:25:16.220295+00	\N	\N	\N	\N	4
25	3	WATER_HAZARDS_ARCHIVE	أرشفة مخاطر المياة	ARCHIVE Water Hazards	\N	ARCHIVE Water Hazards	t	\N	2026-04-14 18:25:16.228477+00	\N	\N	\N	\N	5
26	3	WATER_HAZARDS_UPLOAD	رفع مخاطر المياة	UPLOAD Water Hazards	\N	UPLOAD Water Hazards	t	\N	2026-04-14 18:25:16.24036+00	\N	\N	\N	\N	6
27	3	WATER_HAZARDS_DOWNLOAD	تحميل مخاطر المياة	DOWNLOAD Water Hazards	\N	DOWNLOAD Water Hazards	t	\N	2026-04-14 18:25:16.252795+00	\N	\N	\N	\N	7
28	3	WATER_HAZARDS_COPY	نسخ مخاطر المياة	COPY Water Hazards	\N	COPY Water Hazards	t	\N	2026-04-14 18:25:16.263622+00	\N	\N	\N	\N	8
29	3	WATER_HAZARDS_MOVE	نقل مخاطر المياة	MOVE Water Hazards	\N	MOVE Water Hazards	t	\N	2026-04-14 18:25:16.274763+00	\N	\N	\N	\N	9
30	3	WATER_HAZARDS_LINK	ربط مخاطر المياة	LINK Water Hazards	\N	LINK Water Hazards	t	\N	2026-04-14 18:25:16.287229+00	\N	\N	\N	\N	10
31	4	PROJECT_MANAGEMENT_VIEW	عرض إدارة المشاريع	VIEW PROJECT MANAGEMENT	\N	VIEW PROJECT MANAGEMENT	t	\N	2026-04-14 18:25:16.297727+00	\N	\N	\N	\N	1
32	4	PROJECT_MANAGEMENT_CREATE	إضافة إدارة المشاريع	CREATE PROJECT MANAGEMENT	\N	CREATE PROJECT MANAGEMENT	t	\N	2026-04-14 18:25:16.307422+00	\N	\N	\N	\N	2
33	4	PROJECT_MANAGEMENT_EDIT	تعديل إدارة المشاريع	EDIT PROJECT MANAGEMENT	\N	EDIT PROJECT MANAGEMENT	t	\N	2026-04-14 18:25:16.320864+00	\N	\N	\N	\N	3
34	4	PROJECT_MANAGEMENT_DELETE	حذف إدارة المشاريع	DELETE PROJECT MANAGEMENT	\N	DELETE PROJECT MANAGEMENT	t	\N	2026-04-14 18:25:16.328239+00	\N	\N	\N	\N	4
35	4	PROJECT_MANAGEMENT_ARCHIVE	أرشفة إدارة المشاريع	ARCHIVE PROJECT MANAGEMENT	\N	ARCHIVE PROJECT MANAGEMENT	t	\N	2026-04-14 18:25:16.335366+00	\N	\N	\N	\N	5
36	4	PROJECT_MANAGEMENT_UPLOAD	رفع إدارة المشاريع	UPLOAD PROJECT MANAGEMENT	\N	UPLOAD PROJECT MANAGEMENT	t	\N	2026-04-14 18:25:16.341621+00	\N	\N	\N	\N	6
37	4	PROJECT_MANAGEMENT_DOWNLOAD	تحميل إدارة المشاريع	DOWNLOAD PROJECT MANAGEMENT	\N	DOWNLOAD PROJECT MANAGEMENT	t	\N	2026-04-14 18:25:16.348226+00	\N	\N	\N	\N	7
38	4	PROJECT_MANAGEMENT_COPY	نسخ إدارة المشاريع	COPY PROJECT MANAGEMENT	\N	COPY PROJECT MANAGEMENT	t	\N	2026-04-14 18:25:16.355269+00	\N	\N	\N	\N	8
39	4	PROJECT_MANAGEMENT_MOVE	نقل إدارة المشاريع	MOVE PROJECT MANAGEMENT	\N	MOVE PROJECT MANAGEMENT	t	\N	2026-04-14 18:25:16.36244+00	\N	\N	\N	\N	9
40	4	PROJECT_MANAGEMENT_LINK	ربط إدارة المشاريع	LINK PROJECT MANAGEMENT	\N	LINK PROJECT MANAGEMENT	t	\N	2026-04-14 18:25:16.369145+00	\N	\N	\N	\N	10
\.


--
-- Data for Name: role_general_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_general_permissions (role_id, general_permission_id) FROM stdin;
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	9
1	10
1	11
1	12
1	13
1	14
1	15
1	16
1	17
1	18
1	19
1	20
1	21
1	22
1	23
1	24
1	25
1	26
1	27
1	28
1	29
1	30
1	31
1	32
1	33
1	34
1	35
1	36
1	37
1	38
1	39
1	40
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, "name_Ar", "name_En", "description_Ar", "description_En", code, is_system_role, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at, level_one_id, level_two_id, level_three_id) FROM stdin;
1	مسؤول النظام	Administrator	لديه وصول كامل لجميع الوظائف	Full access to all features	ADMIN	t	\N	2026-04-14 18:25:15.929166+00	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_permissions (user_id, permission_id, granted) FROM stdin;
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, user_id, role_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	1	1	\N	2026-04-14 18:25:16.540905+00	\N	\N	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, name, short_name, phone, email_evara, email_private, email, image_url, password, activated, reset_password_request, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at, level_one_id, level_two_id, level_three_id) FROM stdin;
1	admin	Administrator	Admin	\N	admin@evara.com	admin@admin.com	admin@admin.com	\N	$2b$10$MRw4hOAa9urNs3yM5hlQPegWzt7bXytrcDnj1/xNMx9PRV7Ih6yU6	t	f	\N	2026-04-14 18:25:16.529478+00	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Name: favourites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favourites_id_seq', 1, false);


--
-- Name: general_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.general_permissions_id_seq', 10, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 14, true);


--
-- Name: modules_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modules_id_seq', 4, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_id_seq', 40, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, true);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_roles_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: favourites PK_173e5d5cc35490bf1de2d2d3739; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourites
    ADD CONSTRAINT "PK_173e5d5cc35490bf1de2d2d3739" PRIMARY KEY (id);


--
-- Name: role_permissions PK_25d24010f53bb80b78e412c9656; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY (role_id, permission_id);


--
-- Name: modules PK_7dbefd488bd96c5bf31f0ce0c95; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modules
    ADD CONSTRAINT "PK_7dbefd488bd96c5bf31f0ce0c95" PRIMARY KEY (id);


--
-- Name: user_roles PK_8acd5cf26ebd158416f477de799; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: permissions PK_920331560282b8bd21bb02290df; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: user_permissions PK_a537c48b1f80e8626a71cb56589; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT "PK_a537c48b1f80e8626a71cb56589" PRIMARY KEY (user_id, permission_id);


--
-- Name: general_permissions PK_b5b695f92014ee1085ef561fda8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.general_permissions
    ADD CONSTRAINT "PK_b5b695f92014ee1085ef561fda8" PRIMARY KEY (id);


--
-- Name: roles PK_c1433d71a4838793a49dcad46ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);


--
-- Name: role_general_permissions PK_deaf37334827576c41db421393b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_general_permissions
    ADD CONSTRAINT "PK_deaf37334827576c41db421393b" PRIMARY KEY (role_id, general_permission_id);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: favourites UQ_user_feature_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourites
    ADD CONSTRAINT "UQ_user_feature_unique" UNIQUE (user_id, consume_app, feature_type, feature_id);


--
-- Name: IDX_23ed6f04fe43066df08379fd03; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_23ed6f04fe43066df08379fd03" ON public.user_roles USING btree (user_id, role_id);


--
-- Name: IDX_738f46bb9ac6ea356f1915835d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_738f46bb9ac6ea356f1915835d" ON public.permissions USING btree (module_id);


--
-- Name: IDX_87b8888186ca9769c960e92687; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON public.user_roles USING btree (user_id);


--
-- Name: IDX_8dad765629e83229da6feda1c1; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_8dad765629e83229da6feda1c1" ON public.permissions USING btree (code);


--
-- Name: IDX_b23c65e50a758245a33ee35fda; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON public.user_roles USING btree (role_id);


--
-- Name: IDX_f6d54f95c31b73fb1bdd8e91d0; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_f6d54f95c31b73fb1bdd8e91d0" ON public.roles USING btree (code);


--
-- Name: role_permissions FK_17022daf3f885f7d35423e9971e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions FK_178199805b901ccd220ab7740ec; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_permissions FK_3495bd31f1862d02931e8e8d2e8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT "FK_3495bd31f1862d02931e8e8d2e8" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_general_permissions FK_49b34bd562699ee1057a2b689b6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_general_permissions
    ADD CONSTRAINT "FK_49b34bd562699ee1057a2b689b6" FOREIGN KEY (general_permission_id) REFERENCES public.general_permissions(id) ON DELETE CASCADE;


--
-- Name: permissions FK_738f46bb9ac6ea356f1915835d0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "FK_738f46bb9ac6ea356f1915835d0" FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;


--
-- Name: user_permissions FK_8145f5fadacd311693c15e41f10; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_permissions
    ADD CONSTRAINT "FK_8145f5fadacd311693c15e41f10" FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- Name: user_roles FK_87b8888186ca9769c960e926870; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_general_permissions FK_afb7da3ef2b635f3f9b2ef3590c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_general_permissions
    ADD CONSTRAINT "FK_afb7da3ef2b635f3f9b2ef3590c" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: user_roles FK_b23c65e50a758245a33ee35fda1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: favourites FK_favourites_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourites
    ADD CONSTRAINT "FK_favourites_user_id" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: permissions FK_general_permission; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "FK_general_permission" FOREIGN KEY (general_permission_id) REFERENCES public.general_permissions(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ug05TJ9XkKAPb0VlCSm7Pde8xVzuuuSMvEIhXTttoWpxtSHoWZKcp6EQRYJob3f

--
-- Database "water-hazards-local" dump
--

--
-- PostgreSQL database dump
--

\restrict C4HKPCR8VsKlOsCgVkxggdAwjO8co24rpqzSW9c6NXSnrPEXCRrhmNmkGrzClic

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: water-hazards-local; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "water-hazards-local" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE "water-hazards-local" OWNER TO postgres;

\unrestrict C4HKPCR8VsKlOsCgVkxggdAwjO8co24rpqzSW9c6NXSnrPEXCRrhmNmkGrzClic
\encoding SQL_ASCII
\connect -reuse-previous=on "dbname='water-hazards-local'"
\restrict C4HKPCR8VsKlOsCgVkxggdAwjO8co24rpqzSW9c6NXSnrPEXCRrhmNmkGrzClic

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: file_system_items_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.file_system_items_type_enum AS ENUM (
    'FOLDER',
    'FILE'
);


ALTER TYPE public.file_system_items_type_enum OWNER TO postgres;

--
-- Name: gis_features_feature_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.gis_features_feature_type_enum AS ENUM (
    'DAMS',
    'WATER_INTAKES',
    'WATER_DRAINS',
    'CANALS',
    'RESERVOIRS',
    'VALLEYS'
);


ALTER TYPE public.gis_features_feature_type_enum OWNER TO postgres;

--
-- Name: level1s_feature_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.level1s_feature_type_enum AS ENUM (
    'DAMS',
    'WATER_INTAKES',
    'WATER_DRAINS',
    'CANALS',
    'RESERVOIRS',
    'VALLEYS'
);


ALTER TYPE public.level1s_feature_type_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attachments (
    id integer NOT NULL,
    name character varying NOT NULL,
    url character varying NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.attachments OWNER TO postgres;

--
-- Name: attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.attachments_id_seq OWNER TO postgres;

--
-- Name: attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attachments_id_seq OWNED BY public.attachments.id;


--
-- Name: favourites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favourites (
    id integer NOT NULL,
    user_id integer NOT NULL,
    gis_feature_id integer NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.favourites OWNER TO postgres;

--
-- Name: favourites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favourites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.favourites_id_seq OWNER TO postgres;

--
-- Name: favourites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favourites_id_seq OWNED BY public.favourites.id;


--
-- Name: file_systems_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file_systems_items (
    id integer NOT NULL,
    name character varying NOT NULL,
    type public.file_system_items_type_enum NOT NULL,
    extension character varying(10),
    parent_id integer,
    size integer,
    url character varying,
    gis_feature_id integer,
    mpath character varying,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.file_systems_items OWNER TO postgres;

--
-- Name: file_systems_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.file_systems_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.file_systems_items_id_seq OWNER TO postgres;

--
-- Name: file_systems_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.file_systems_items_id_seq OWNED BY public.file_systems_items.id;


--
-- Name: gis_features; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gis_features (
    id integer NOT NULL,
    name_ar character varying NOT NULL,
    name_en character varying NOT NULL,
    level1_id integer,
    feature_type public.gis_features_feature_type_enum NOT NULL,
    gis_data jsonb DEFAULT '{}'::jsonb,
    governorate_id integer NOT NULL,
    study_area_id integer,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.gis_features OWNER TO postgres;

--
-- Name: gis_features_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gis_features_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.gis_features_id_seq OWNER TO postgres;

--
-- Name: gis_features_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gis_features_id_seq OWNED BY public.gis_features.id;


--
-- Name: governorate_level1_rel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.governorate_level1_rel (
    id integer NOT NULL,
    level1_id integer NOT NULL,
    governorate_id integer NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.governorate_level1_rel OWNER TO postgres;

--
-- Name: governorate_level1_rel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.governorate_level1_rel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.governorate_level1_rel_id_seq OWNER TO postgres;

--
-- Name: governorate_level1_rel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.governorate_level1_rel_id_seq OWNED BY public.governorate_level1_rel.id;


--
-- Name: governorates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.governorates (
    id integer NOT NULL,
    name_ar character varying NOT NULL,
    name_en character varying NOT NULL,
    region_id integer NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.governorates OWNER TO postgres;

--
-- Name: governorates_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.governorates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.governorates_id_seq OWNER TO postgres;

--
-- Name: governorates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.governorates_id_seq OWNED BY public.governorates.id;


--
-- Name: level1s; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.level1s (
    id integer NOT NULL,
    name_ar character varying NOT NULL,
    name_en character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    description_en text,
    description_ar text,
    feature_type public.level1s_feature_type_enum NOT NULL,
    color character varying(255),
    icon character varying(1000),
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.level1s OWNER TO postgres;

--
-- Name: level1s_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.level1s_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.level1s_id_seq OWNER TO postgres;

--
-- Name: level1s_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.level1s_id_seq OWNED BY public.level1s.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.regions (
    id integer NOT NULL,
    name_ar character varying NOT NULL,
    name_en character varying NOT NULL,
    location_score integer NOT NULL,
    code character varying NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.regions OWNER TO postgres;

--
-- Name: regions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.regions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.regions_id_seq OWNER TO postgres;

--
-- Name: regions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.regions_id_seq OWNED BY public.regions.id;


--
-- Name: rel_file_system_items_sync; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rel_file_system_items_sync (
    id integer NOT NULL,
    source_file_system_item_id integer NOT NULL,
    destination_file_system_item_id integer,
    gis_feature_id integer,
    name character varying NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.rel_file_system_items_sync OWNER TO postgres;

--
-- Name: rel_file_system_items_sync_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rel_file_system_items_sync_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rel_file_system_items_sync_id_seq OWNER TO postgres;

--
-- Name: rel_file_system_items_sync_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rel_file_system_items_sync_id_seq OWNED BY public.rel_file_system_items_sync.id;


--
-- Name: scenario_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scenario_attachments (
    id integer NOT NULL,
    name character varying NOT NULL,
    url character varying NOT NULL,
    scenario_id integer NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.scenario_attachments OWNER TO postgres;

--
-- Name: scenario_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scenario_attachments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.scenario_attachments_id_seq OWNER TO postgres;

--
-- Name: scenario_attachments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scenario_attachments_id_seq OWNED BY public.scenario_attachments.id;


--
-- Name: scenarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scenarios (
    id integer NOT NULL,
    name_en character varying NOT NULL,
    name_ar character varying NOT NULL,
    gis_feature_id integer,
    gis_data jsonb NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.scenarios OWNER TO postgres;

--
-- Name: scenarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scenarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.scenarios_id_seq OWNER TO postgres;

--
-- Name: scenarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scenarios_id_seq OWNED BY public.scenarios.id;


--
-- Name: study_areas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.study_areas (
    id integer NOT NULL,
    name_en character varying NOT NULL,
    name_ar character varying NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.study_areas OWNER TO postgres;

--
-- Name: study_areas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.study_areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.study_areas_id_seq OWNER TO postgres;

--
-- Name: study_areas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.study_areas_id_seq OWNED BY public.study_areas.id;


--
-- Name: attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments ALTER COLUMN id SET DEFAULT nextval('public.attachments_id_seq'::regclass);


--
-- Name: favourites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourites ALTER COLUMN id SET DEFAULT nextval('public.favourites_id_seq'::regclass);


--
-- Name: file_systems_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_systems_items ALTER COLUMN id SET DEFAULT nextval('public.file_systems_items_id_seq'::regclass);


--
-- Name: gis_features id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gis_features ALTER COLUMN id SET DEFAULT nextval('public.gis_features_id_seq'::regclass);


--
-- Name: governorate_level1_rel id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.governorate_level1_rel ALTER COLUMN id SET DEFAULT nextval('public.governorate_level1_rel_id_seq'::regclass);


--
-- Name: governorates id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.governorates ALTER COLUMN id SET DEFAULT nextval('public.governorates_id_seq'::regclass);


--
-- Name: level1s id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level1s ALTER COLUMN id SET DEFAULT nextval('public.level1s_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: regions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions ALTER COLUMN id SET DEFAULT nextval('public.regions_id_seq'::regclass);


--
-- Name: rel_file_system_items_sync id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_file_system_items_sync ALTER COLUMN id SET DEFAULT nextval('public.rel_file_system_items_sync_id_seq'::regclass);


--
-- Name: scenario_attachments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scenario_attachments ALTER COLUMN id SET DEFAULT nextval('public.scenario_attachments_id_seq'::regclass);


--
-- Name: scenarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scenarios ALTER COLUMN id SET DEFAULT nextval('public.scenarios_id_seq'::regclass);


--
-- Name: study_areas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.study_areas ALTER COLUMN id SET DEFAULT nextval('public.study_areas_id_seq'::regclass);


--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.attachments (id, name, url, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: favourites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favourites (id, user_id, gis_feature_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: file_systems_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.file_systems_items (id, name, type, extension, parent_id, size, url, gis_feature_id, mpath, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: gis_features; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gis_features (id, name_ar, name_en, level1_id, feature_type, gis_data, governorate_id, study_area_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: governorate_level1_rel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.governorate_level1_rel (id, level1_id, governorate_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: governorates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.governorates (id, name_ar, name_en, region_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: level1s; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.level1s (id, name_ar, name_en, "isActive", description_en, description_ar, feature_type, color, icon, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	أودية شديدة المخاطر	High Risk Valleys	t	Describes valleys with high potential risks.	يوصف الأودية التي تتميز بمخاطر شديدة.	VALLEYS	#8B0000	#901	\N	2026-04-18 13:00:51.738387+00	\N	\N	\N	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
1	1720796623509	CreateLevel1Table1720796623509
2	1763215977082	CreateRegionsTable1763215977082
3	1763216144384	CreateGovernoratesTable1763216144384
4	1763218000000	CreateGovernorateLevel1RelTable1763218000000
5	1766500000001	CreateStudyAreasTable1766500000001
6	1766500000004	CreateGisFeaturesTable1766500000004
7	1766500000005	CreateScenarioAttachmentsTable1766500000005
8	1766500000007	CreateFileSystemItemsTable1766500000007
9	1766500000008	CreateScenariosTable1766500000008
10	1766500000009	CreateScenarioAttachmentsTable1766500000009
11	1766500000010	CreateRelFileSystemItemsSyncTable1766500000010
12	1766829929821	CreateFavouritesTable1766829929821
\.


--
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.regions (id, name_ar, name_en, location_score, code, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: rel_file_system_items_sync; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rel_file_system_items_sync (id, source_file_system_item_id, destination_file_system_item_id, gis_feature_id, name, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: scenario_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scenario_attachments (id, name, url, scenario_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: scenarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scenarios (id, name_en, name_ar, gis_feature_id, gis_data, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: study_areas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.study_areas (id, name_en, name_ar, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Name: attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.attachments_id_seq', 1, false);


--
-- Name: favourites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favourites_id_seq', 1, false);


--
-- Name: file_systems_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.file_systems_items_id_seq', 1, false);


--
-- Name: gis_features_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.gis_features_id_seq', 1, false);


--
-- Name: governorate_level1_rel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.governorate_level1_rel_id_seq', 1, false);


--
-- Name: governorates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.governorates_id_seq', 1, false);


--
-- Name: level1s_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.level1s_id_seq', 1, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 12, true);


--
-- Name: regions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.regions_id_seq', 1, false);


--
-- Name: rel_file_system_items_sync_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rel_file_system_items_sync_id_seq', 1, false);


--
-- Name: scenario_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.scenario_attachments_id_seq', 1, false);


--
-- Name: scenarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.scenarios_id_seq', 1, false);


--
-- Name: study_areas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.study_areas_id_seq', 1, false);


--
-- Name: gis_features PK_14de122884df821a2a068a35b84; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gis_features
    ADD CONSTRAINT "PK_14de122884df821a2a068a35b84" PRIMARY KEY (id);


--
-- Name: favourites PK_173e5d5cc35490bf1de2d2d3739; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourites
    ADD CONSTRAINT "PK_173e5d5cc35490bf1de2d2d3739" PRIMARY KEY (id);


--
-- Name: governorates PK_3b62bb4e44b53e3119d0a8648fa; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.governorates
    ADD CONSTRAINT "PK_3b62bb4e44b53e3119d0a8648fa" PRIMARY KEY (id);


--
-- Name: level1s PK_441d7fb068e40ed60809ceb4d35; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level1s
    ADD CONSTRAINT "PK_441d7fb068e40ed60809ceb4d35" PRIMARY KEY (id);


--
-- Name: regions PK_4fcd12ed6a046276e2deb08801c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT "PK_4fcd12ed6a046276e2deb08801c" PRIMARY KEY (id);


--
-- Name: file_systems_items PK_559a3fb072540e5db9ab120f02f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_systems_items
    ADD CONSTRAINT "PK_559a3fb072540e5db9ab120f02f" PRIMARY KEY (id);


--
-- Name: attachments PK_5e1f050bcff31e3084a1d662412; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY (id);


--
-- Name: rel_file_system_items_sync PK_7a442f9ee45307a9f4f1e0f49c0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_file_system_items_sync
    ADD CONSTRAINT "PK_7a442f9ee45307a9f4f1e0f49c0" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: scenario_attachments PK_9ad7b2e029811f4aede0a272aa7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scenario_attachments
    ADD CONSTRAINT "PK_9ad7b2e029811f4aede0a272aa7" PRIMARY KEY (id);


--
-- Name: scenarios PK_a2af4912aab626639cca306b987; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scenarios
    ADD CONSTRAINT "PK_a2af4912aab626639cca306b987" PRIMARY KEY (id);


--
-- Name: study_areas PK_c9cc3d88246497a4e5670f9d1e8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.study_areas
    ADD CONSTRAINT "PK_c9cc3d88246497a4e5670f9d1e8" PRIMARY KEY (id);


--
-- Name: governorate_level1_rel PK_e5aef732faf068782b584c7d59c; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.governorate_level1_rel
    ADD CONSTRAINT "PK_e5aef732faf068782b584c7d59c" PRIMARY KEY (id);


--
-- Name: favourites uq_favourites_user_gis_feature; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourites
    ADD CONSTRAINT uq_favourites_user_gis_feature UNIQUE (user_id, gis_feature_id);


--
-- Name: governorate_level1_rel uq_governorate_level1_unique_pair; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.governorate_level1_rel
    ADD CONSTRAINT uq_governorate_level1_unique_pair UNIQUE (governorate_id, level1_id);


--
-- Name: idx_fs_sync_destination_file_system_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fs_sync_destination_file_system_item_id ON public.rel_file_system_items_sync USING btree (destination_file_system_item_id);


--
-- Name: idx_fs_sync_gis_feature_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fs_sync_gis_feature_id ON public.rel_file_system_items_sync USING btree (gis_feature_id);


--
-- Name: idx_fs_sync_source_file_system_item_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fs_sync_source_file_system_item_id ON public.rel_file_system_items_sync USING btree (source_file_system_item_id);


--
-- Name: uq_fs_sync_src_dest_gis_feature_coalesce; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_fs_sync_src_dest_gis_feature_coalesce ON public.rel_file_system_items_sync USING btree (source_file_system_item_id, COALESCE(destination_file_system_item_id, '-1'::integer), COALESCE(gis_feature_id, '-1'::integer));


--
-- Name: favourites fk_favourites_gis_feature_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourites
    ADD CONSTRAINT fk_favourites_gis_feature_id FOREIGN KEY (gis_feature_id) REFERENCES public.gis_features(id) ON DELETE CASCADE;


--
-- Name: file_systems_items fk_file_system_items_gis_feature; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_systems_items
    ADD CONSTRAINT fk_file_system_items_gis_feature FOREIGN KEY (gis_feature_id) REFERENCES public.gis_features(id) ON DELETE CASCADE;


--
-- Name: file_systems_items fk_file_system_items_parent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_systems_items
    ADD CONSTRAINT fk_file_system_items_parent FOREIGN KEY (parent_id) REFERENCES public.file_systems_items(id) ON DELETE CASCADE;


--
-- Name: rel_file_system_items_sync fk_fs_sync_destination_file_system_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_file_system_items_sync
    ADD CONSTRAINT fk_fs_sync_destination_file_system_item FOREIGN KEY (destination_file_system_item_id) REFERENCES public.file_systems_items(id) ON DELETE CASCADE;


--
-- Name: rel_file_system_items_sync fk_fs_sync_gis_feature; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_file_system_items_sync
    ADD CONSTRAINT fk_fs_sync_gis_feature FOREIGN KEY (gis_feature_id) REFERENCES public.gis_features(id) ON DELETE CASCADE;


--
-- Name: rel_file_system_items_sync fk_fs_sync_source_file_system_item; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rel_file_system_items_sync
    ADD CONSTRAINT fk_fs_sync_source_file_system_item FOREIGN KEY (source_file_system_item_id) REFERENCES public.file_systems_items(id) ON DELETE CASCADE;


--
-- Name: governorate_level1_rel fk_gov_level1_rel_governorate; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.governorate_level1_rel
    ADD CONSTRAINT fk_gov_level1_rel_governorate FOREIGN KEY (governorate_id) REFERENCES public.governorates(id) ON DELETE CASCADE;


--
-- Name: governorate_level1_rel fk_gov_level1_rel_level1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.governorate_level1_rel
    ADD CONSTRAINT fk_gov_level1_rel_level1 FOREIGN KEY (level1_id) REFERENCES public.level1s(id) ON DELETE CASCADE;


--
-- Name: gis_features fk_governorate_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gis_features
    ADD CONSTRAINT fk_governorate_id FOREIGN KEY (governorate_id) REFERENCES public.governorates(id) ON DELETE CASCADE;


--
-- Name: governorates fk_governorate_region; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.governorates
    ADD CONSTRAINT fk_governorate_region FOREIGN KEY (region_id) REFERENCES public.regions(id) ON DELETE CASCADE;


--
-- Name: gis_features fk_level1_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gis_features
    ADD CONSTRAINT fk_level1_id FOREIGN KEY (level1_id) REFERENCES public.level1s(id) ON DELETE SET NULL;


--
-- Name: scenario_attachments fk_scenario_attachments_scenario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scenario_attachments
    ADD CONSTRAINT fk_scenario_attachments_scenario FOREIGN KEY (scenario_id) REFERENCES public.scenarios(id) ON DELETE CASCADE;


--
-- Name: scenarios fk_scenarios_gis_feature; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scenarios
    ADD CONSTRAINT fk_scenarios_gis_feature FOREIGN KEY (gis_feature_id) REFERENCES public.gis_features(id) ON DELETE SET NULL;


--
-- Name: gis_features fk_study_area_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gis_features
    ADD CONSTRAINT fk_study_area_id FOREIGN KEY (study_area_id) REFERENCES public.study_areas(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict C4HKPCR8VsKlOsCgVkxggdAwjO8co24rpqzSW9c6NXSnrPEXCRrhmNmkGrzClic

--
-- Database "werth-local" dump
--

--
-- PostgreSQL database dump
--

\restrict QDdNMqGxwmJadH3U8uRNPekbbSbm25YlCGz1kJ4unwsg3I5jcXZnl4FRX2TYuQR

-- Dumped from database version 15.17 (Debian 15.17-1.pgdg13+1)
-- Dumped by pg_dump version 15.17 (Debian 15.17-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: werth-local; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "werth-local" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE "werth-local" OWNER TO postgres;

\unrestrict QDdNMqGxwmJadH3U8uRNPekbbSbm25YlCGz1kJ4unwsg3I5jcXZnl4FRX2TYuQR
\encoding SQL_ASCII
\connect -reuse-previous=on "dbname='werth-local'"
\restrict QDdNMqGxwmJadH3U8uRNPekbbSbm25YlCGz1kJ4unwsg3I5jcXZnl4FRX2TYuQR

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: file_system_items_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.file_system_items_type_enum AS ENUM (
    'FOLDER',
    'FILE'
);


ALTER TYPE public.file_system_items_type_enum OWNER TO postgres;

--
-- Name: object_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.object_type AS ENUM (
    'building',
    'floor',
    'unit',
    'subproject'
);


ALTER TYPE public.object_type OWNER TO postgres;

--
-- Name: phases_indicator_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.phases_indicator_enum AS ENUM (
    'on_track',
    'at_risk',
    'off_track'
);


ALTER TYPE public.phases_indicator_enum OWNER TO postgres;

--
-- Name: phases_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.phases_status_enum AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'on_hold'
);


ALTER TYPE public.phases_status_enum OWNER TO postgres;

--
-- Name: project_objects_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.project_objects_status_enum AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'on_hold'
);


ALTER TYPE public.project_objects_status_enum OWNER TO postgres;

--
-- Name: project_objects_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.project_objects_type_enum AS ENUM (
    'building',
    'floor',
    'unit',
    'subproject'
);


ALTER TYPE public.project_objects_type_enum OWNER TO postgres;

--
-- Name: projects_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.projects_status_enum AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'on_hold'
);


ALTER TYPE public.projects_status_enum OWNER TO postgres;

--
-- Name: status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.status AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'on_hold'
);


ALTER TYPE public.status OWNER TO postgres;

--
-- Name: tasks_indicator_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tasks_indicator_enum AS ENUM (
    'on_track',
    'at_risk',
    'off_track'
);


ALTER TYPE public.tasks_indicator_enum OWNER TO postgres;

--
-- Name: tasks_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tasks_status_enum AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'on_hold'
);


ALTER TYPE public.tasks_status_enum OWNER TO postgres;

--
-- Name: tasks_task_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tasks_task_type_enum AS ENUM (
    'primary',
    'general'
);


ALTER TYPE public.tasks_task_type_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: file_systems_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file_systems_items (
    id integer NOT NULL,
    name character varying NOT NULL,
    type public.file_system_items_type_enum NOT NULL,
    extension character varying(10),
    parent_id integer,
    size integer,
    url character varying,
    project_id integer,
    mpath character varying,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.file_systems_items OWNER TO postgres;

--
-- Name: file_systems_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.file_systems_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.file_systems_items_id_seq OWNER TO postgres;

--
-- Name: file_systems_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.file_systems_items_id_seq OWNED BY public.file_systems_items.id;


--
-- Name: level1; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.level1 (
    id integer NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    image_url character varying(500),
    description_ar text,
    description_en text,
    color character varying(255),
    icon character varying(1000),
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.level1 OWNER TO postgres;

--
-- Name: level1_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.level1_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.level1_id_seq OWNER TO postgres;

--
-- Name: level1_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.level1_id_seq OWNED BY public.level1.id;


--
-- Name: level2; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.level2 (
    id integer NOT NULL,
    name_ar character varying(255) NOT NULL,
    name_en character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    image_url character varying(500),
    description_ar text,
    description_en text,
    level1_id integer,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone
);


ALTER TABLE public.level2 OWNER TO postgres;

--
-- Name: level2_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.level2_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.level2_id_seq OWNER TO postgres;

--
-- Name: level2_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.level2_id_seq OWNED BY public.level2.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: phases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.phases (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    planned_start_date timestamp with time zone NOT NULL,
    actual_start_date timestamp with time zone,
    planned_end_date timestamp with time zone NOT NULL,
    actual_end_date timestamp with time zone,
    planned_progress double precision DEFAULT 0 NOT NULL,
    actual_progress double precision DEFAULT 0 NOT NULL,
    planned_days integer DEFAULT 0 NOT NULL,
    actual_days integer DEFAULT 0 NOT NULL,
    planned_cost double precision DEFAULT 0 NOT NULL,
    actual_cost double precision DEFAULT 0 NOT NULL,
    planned_updated_at timestamp with time zone,
    actual_updated_at timestamp with time zone,
    weight double precision DEFAULT 0 NOT NULL,
    status public.phases_status_enum NOT NULL,
    project_id integer NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone,
    indicator integer,
    short_name character varying(100),
    planned_budget double precision,
    actual_budget double precision,
    planned_finance double precision,
    actual_finance double precision,
    user_ids integer[]
);


ALTER TABLE public.phases OWNER TO postgres;

--
-- Name: phases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.phases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.phases_id_seq OWNER TO postgres;

--
-- Name: phases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.phases_id_seq OWNED BY public.phases.id;


--
-- Name: project_objects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_objects (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    progress double precision DEFAULT 0 NOT NULL,
    project_id integer NOT NULL,
    parent_id integer,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone,
    short_name character varying(100),
    weight double precision DEFAULT 0 NOT NULL,
    planned_budget double precision,
    actual_budget double precision,
    planned_finance double precision,
    actual_finance double precision,
    user_ids integer[]
);


ALTER TABLE public.project_objects OWNER TO postgres;

--
-- Name: project_objects_closure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_objects_closure (
    id_ancestor integer NOT NULL,
    id_descendant integer NOT NULL
);


ALTER TABLE public.project_objects_closure OWNER TO postgres;

--
-- Name: project_objects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.project_objects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_objects_id_seq OWNER TO postgres;

--
-- Name: project_objects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.project_objects_id_seq OWNED BY public.project_objects.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    planned_start_date timestamp with time zone NOT NULL,
    actual_start_date timestamp with time zone,
    planned_end_date timestamp with time zone NOT NULL,
    actual_end_date timestamp with time zone,
    planned_cost numeric(10,2) NOT NULL,
    actual_cost numeric(10,2),
    status public.projects_status_enum NOT NULL,
    progress double precision DEFAULT 0 NOT NULL,
    level2_id integer NOT NULL,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone,
    short_name character varying(100),
    level1_id integer NOT NULL,
    planned_budget double precision,
    actual_budget double precision,
    planned_finance double precision,
    actual_finance double precision,
    manager_ids integer[] DEFAULT '{}'::integer[] NOT NULL
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_id_seq OWNER TO postgres;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    planned_start_date timestamp with time zone NOT NULL,
    actual_start_date timestamp with time zone,
    planned_end_date timestamp with time zone NOT NULL,
    actual_end_date timestamp with time zone,
    planned_progress double precision DEFAULT 0 NOT NULL,
    actual_progress double precision DEFAULT 0 NOT NULL,
    planned_days integer DEFAULT 0 NOT NULL,
    actual_days integer DEFAULT 0 NOT NULL,
    planned_cost double precision DEFAULT 0 NOT NULL,
    actual_cost double precision DEFAULT 0 NOT NULL,
    planned_updated_at timestamp with time zone,
    actual_updated_at timestamp with time zone,
    weight double precision NOT NULL,
    status public.tasks_status_enum NOT NULL,
    phase_id integer,
    project_object_id integer,
    created_by character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_by character varying,
    updated_at timestamp with time zone,
    deleted_by character varying,
    deleted_at timestamp with time zone,
    indicator integer,
    short_name character varying(100),
    task_type public.tasks_task_type_enum DEFAULT 'general'::public.tasks_task_type_enum NOT NULL,
    parent_task_id integer,
    progress_overridden boolean DEFAULT false NOT NULL,
    planned_budget double precision,
    actual_budget double precision,
    planned_finance double precision,
    actual_finance double precision,
    user_ids integer[]
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_closure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks_closure (
    id_ancestor integer NOT NULL,
    id_descendant integer NOT NULL
);


ALTER TABLE public.tasks_closure OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: file_systems_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_systems_items ALTER COLUMN id SET DEFAULT nextval('public.file_systems_items_id_seq'::regclass);


--
-- Name: level1 id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level1 ALTER COLUMN id SET DEFAULT nextval('public.level1_id_seq'::regclass);


--
-- Name: level2 id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level2 ALTER COLUMN id SET DEFAULT nextval('public.level2_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: phases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phases ALTER COLUMN id SET DEFAULT nextval('public.phases_id_seq'::regclass);


--
-- Name: project_objects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_objects ALTER COLUMN id SET DEFAULT nextval('public.project_objects_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Data for Name: file_systems_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.file_systems_items (id, name, type, extension, parent_id, size, url, project_id, mpath, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
\.


--
-- Data for Name: level1; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.level1 (id, name_ar, name_en, is_active, image_url, description_ar, description_en, color, icon, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	????? ??????	Test Category	t	\N	\N	\N	\N	\N	admin@admin.com	2026-04-14 18:30:13.494+00	admin@admin.com	\N	\N	\N
\.


--
-- Data for Name: level2; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.level2 (id, name_ar, name_en, is_active, image_url, description_ar, description_en, level1_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at) FROM stdin;
1	??? ????	Test SubType	t	\N	\N	\N	1	admin@admin.com	2026-04-14 18:30:13.607+00	admin@admin.com	\N	\N	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, "timestamp", name) FROM stdin;
235	1771085511880	CreateLevelTwoTable1771085511880
236	1771085611880	CreateLevelOneTable1771085611880
237	1771085811880	CreateStatusEnum1771085811880
238	1771085911880	CreateObjectTypeEnum1771085911880
239	1771086011880	CreateProjectsTable1771086011880
240	1771086111880	CreatePhasesTable1771086111880
241	1771086161880	CreateProjectObjectsTable1771086161880
242	1771086311880	CreateTasksTable1771086311880
243	1774446567095	CreateFileSystemItemsTable1774446567095
244	1774965000000	CascadeDeleteProjectObjectChildren1774965000000
245	1775000000000	RefactorSchemaShortNameAndIndicator1775000000000
246	1775050000000	DropProjectObjectsStatus1775050000000
247	1775305413586	AlterProjectTable1775305413586
248	1775400000000	TaskTypeParentProjectObjectWeight1775400000000
249	1775400000001	AlterTasksPhaseIdNullable1775400000001
250	1775500000000	AddTaskProgressOverridden1775500000000
251	1775600000000	AddTreeClosureTables1775600000000
252	1775400000000	AlterTasksPhaseIdNullable1775400000000
253	1775500000000	AddBudgetFinanceColumns1775500000000
254	1775600000000	UserAndManagerIdArrays1775600000000
\.


--
-- Data for Name: phases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.phases (id, name, planned_start_date, actual_start_date, planned_end_date, actual_end_date, planned_progress, actual_progress, planned_days, actual_days, planned_cost, actual_cost, planned_updated_at, actual_updated_at, weight, status, project_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at, indicator, short_name, planned_budget, actual_budget, planned_finance, actual_finance, user_ids) FROM stdin;
1	Phase 1	2024-01-01 00:00:00+00	\N	2024-06-30 00:00:00+00	\N	0	0	0	0	500000	0	\N	\N	1	in_progress	1	admin@admin.com	2026-04-14 18:30:13.72+00	admin@admin.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: project_objects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_objects (id, name, progress, project_id, parent_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at, short_name, weight, planned_budget, actual_budget, planned_finance, actual_finance, user_ids) FROM stdin;
7	VAL Room	0	1	3	admin@admin.com	2026-04-14 18:52:56.614+00	admin@admin.com	\N	\N	\N	\N	100	\N	\N	\N	\N	\N
3	Floor 2	0	1	1	admin@admin.com	2026-04-14 18:38:51.436+00	admin@admin.com	\N	\N	\N	\N	40	\N	\N	\N	\N	\N
1	Building A	48	1	\N	admin@admin.com	2026-04-14 18:35:10.622+00	admin@admin.com	\N	\N	\N	\N	100	\N	\N	\N	\N	\N
4	Room 101	80	1	2	admin@admin.com	2026-04-14 18:38:51.549+00	admin@admin.com	\N	\N	\N	\N	100	\N	\N	\N	\N	\N
2	Floor 1	80	1	1	admin@admin.com	2026-04-14 18:38:51.287+00	admin@admin.com	\N	\N	\N	\N	60	\N	\N	\N	\N	\N
\.


--
-- Data for Name: project_objects_closure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_objects_closure (id_ancestor, id_descendant) FROM stdin;
1	1
2	2
1	2
3	3
1	3
4	4
2	4
1	4
7	7
3	7
1	7
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, name, planned_start_date, actual_start_date, planned_end_date, actual_end_date, planned_cost, actual_cost, status, progress, level2_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at, short_name, level1_id, planned_budget, actual_budget, planned_finance, actual_finance, manager_ids) FROM stdin;
1	TC Project	2024-01-01 00:00:00+00	\N	2024-12-31 00:00:00+00	\N	1000000.00	\N	in_progress	0	1	admin@admin.com	2026-04-14 18:30:13.672+00	admin@admin.com	\N	\N	\N	\N	1	\N	\N	\N	\N	{}
2	Downtown Tower Construction	2024-01-01 00:00:00+00	2024-01-15 00:00:00+00	2024-12-31 00:00:00+00	\N	1000000.00	\N	in_progress	0	1	admin@admin.com	2026-04-19 18:07:49.764+00	admin@admin.com	\N	\N	\N	\N	1	\N	\N	\N	\N	{1}
3	Downtown Tower Construction	2024-01-01 00:00:00+00	2024-01-15 00:00:00+00	2024-12-31 00:00:00+00	\N	1000000.00	\N	in_progress	0	1	admin@admin.com	2026-04-19 18:08:57.317+00	admin@admin.com	\N	\N	\N	\N	1	\N	\N	\N	\N	{1,1}
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, name, planned_start_date, actual_start_date, planned_end_date, actual_end_date, planned_progress, actual_progress, planned_days, actual_days, planned_cost, actual_cost, planned_updated_at, actual_updated_at, weight, status, phase_id, project_object_id, created_by, created_at, updated_by, updated_at, deleted_by, deleted_at, indicator, short_name, task_type, parent_task_id, progress_overridden, planned_budget, actual_budget, planned_finance, actual_finance, user_ids) FROM stdin;
3	Task-G2	2024-01-01 00:00:00+00	\N	2024-06-30 00:00:00+00	\N	0	0	0	0	10000	0	\N	\N	20	in_progress	1	4	admin@admin.com	2026-04-14 18:39:47.861974+00	admin@admin.com	\N	\N	\N	\N	\N	general	\N	f	\N	\N	\N	\N	\N
2	Task-G1	2024-01-01 00:00:00+00	\N	2024-06-30 00:00:00+00	\N	0	100	0	0	10000	0	\N	\N	30	in_progress	1	4	admin@admin.com	2026-04-14 18:39:47.663029+00	admin@admin.com	\N	\N	\N	\N	\N	general	\N	f	\N	\N	\N	\N	\N
1	Task-P1	2024-01-01 00:00:00+00	\N	2024-06-30 00:00:00+00	\N	0	100	0	0	10000	0	\N	\N	50	in_progress	1	4	admin@admin.com	2026-04-14 18:39:47.375136+00	admin@admin.com	\N	\N	\N	\N	\N	primary	\N	f	\N	\N	\N	\N	\N
10	Excavation	2026-02-01 00:00:00+00	\N	2026-02-20 00:00:00+00	\N	0	0	0	0	50000	0	\N	\N	0.15	planned	\N	\N	admin@admin.com	2026-04-14 19:00:05.75804+00	admin@admin.com	\N	\N	\N	120	\N	general	\N	f	\N	\N	\N	\N	\N
\.


--
-- Data for Name: tasks_closure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks_closure (id_ancestor, id_descendant) FROM stdin;
1	1
2	2
3	3
10	10
\.


--
-- Name: file_systems_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.file_systems_items_id_seq', 1, false);


--
-- Name: level1_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.level1_id_seq', 4, true);


--
-- Name: level2_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.level2_id_seq', 4, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 254, true);


--
-- Name: phases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.phases_id_seq', 3, true);


--
-- Name: project_objects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.project_objects_id_seq', 9, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.projects_id_seq', 5, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 13, true);


--
-- Name: file_systems_items PK_559a3fb072540e5db9ab120f02f; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_systems_items
    ADD CONSTRAINT "PK_559a3fb072540e5db9ab120f02f" PRIMARY KEY (id);


--
-- Name: projects PK_6271df0a7aed1d6c0691ce6ac50; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY (id);


--
-- Name: level1 PK_898e74eff8726e65db05da80dd6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level1
    ADD CONSTRAINT "PK_898e74eff8726e65db05da80dd6" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: tasks PK_8d12ff38fcc62aaba2cab748772; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY (id);


--
-- Name: level2 PK_aafb95f32fa64ac20fc623486a6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level2
    ADD CONSTRAINT "PK_aafb95f32fa64ac20fc623486a6" PRIMARY KEY (id);


--
-- Name: project_objects PK_e28df5364ed5251a0283c502252; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_objects
    ADD CONSTRAINT "PK_e28df5364ed5251a0283c502252" PRIMARY KEY (id);


--
-- Name: phases PK_e93bb53460b28d4daf72735d5d3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT "PK_e93bb53460b28d4daf72735d5d3" PRIMARY KEY (id);


--
-- Name: project_objects_closure project_objects_closure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_objects_closure
    ADD CONSTRAINT project_objects_closure_pkey PRIMARY KEY (id_ancestor, id_descendant);


--
-- Name: tasks_closure tasks_closure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks_closure
    ADD CONSTRAINT tasks_closure_pkey PRIMARY KEY (id_ancestor, id_descendant);


--
-- Name: level2 FK_0a08a11b4234fcf74343c9410a1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level2
    ADD CONSTRAINT "FK_0a08a11b4234fcf74343c9410a1" FOREIGN KEY (level1_id) REFERENCES public.level1(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tasks FK_30ab0dae6b902235f90798aa73e; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "FK_30ab0dae6b902235f90798aa73e" FOREIGN KEY (project_object_id) REFERENCES public.project_objects(id) ON DELETE SET NULL;


--
-- Name: project_objects FK_408bf3878233498af3c80675f61; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_objects
    ADD CONSTRAINT "FK_408bf3878233498af3c80675f61" FOREIGN KEY (parent_id) REFERENCES public.project_objects(id) ON DELETE CASCADE;


--
-- Name: project_objects FK_6daef3c9c3b889666ca529c9ee7; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_objects
    ADD CONSTRAINT "FK_6daef3c9c3b889666ca529c9ee7" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: phases FK_6ec6b200da7101a6cc19894ffbd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.phases
    ADD CONSTRAINT "FK_6ec6b200da7101a6cc19894ffbd" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: tasks FK_9df310e6687970816f92aa5c60a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "FK_9df310e6687970816f92aa5c60a" FOREIGN KEY (phase_id) REFERENCES public.phases(id) ON DELETE CASCADE;


--
-- Name: projects FK_d1fe6207f67cce3dc64eeb9d490; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "FK_d1fe6207f67cce3dc64eeb9d490" FOREIGN KEY (level2_id) REFERENCES public.level2(id) ON DELETE RESTRICT;


--
-- Name: projects FK_projects_level1_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT "FK_projects_level1_id" FOREIGN KEY (level1_id) REFERENCES public.level1(id) ON DELETE CASCADE;


--
-- Name: tasks FK_tasks_parent_task_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT "FK_tasks_parent_task_id" FOREIGN KEY (parent_task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;


--
-- Name: file_systems_items fk_file_system_items_parent; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_systems_items
    ADD CONSTRAINT fk_file_system_items_parent FOREIGN KEY (parent_id) REFERENCES public.file_systems_items(id) ON DELETE CASCADE;


--
-- Name: file_systems_items fk_file_system_items_project; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file_systems_items
    ADD CONSTRAINT fk_file_system_items_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_objects_closure fk_poc_ancestor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_objects_closure
    ADD CONSTRAINT fk_poc_ancestor FOREIGN KEY (id_ancestor) REFERENCES public.project_objects(id) ON DELETE CASCADE;


--
-- Name: project_objects_closure fk_poc_descendant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_objects_closure
    ADD CONSTRAINT fk_poc_descendant FOREIGN KEY (id_descendant) REFERENCES public.project_objects(id) ON DELETE CASCADE;


--
-- Name: tasks_closure fk_tc_ancestor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks_closure
    ADD CONSTRAINT fk_tc_ancestor FOREIGN KEY (id_ancestor) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks_closure fk_tc_descendant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks_closure
    ADD CONSTRAINT fk_tc_descendant FOREIGN KEY (id_descendant) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict QDdNMqGxwmJadH3U8uRNPekbbSbm25YlCGz1kJ4unwsg3I5jcXZnl4FRX2TYuQR

--
-- PostgreSQL database cluster dump complete
--

