


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


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE SCHEMA IF NOT EXISTS "development";


ALTER SCHEMA "development" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "league";


ALTER SCHEMA "league" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "tournaments";


ALTER SCHEMA "tournaments" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "development"."attendance_session_status" AS ENUM (
    'scheduled',
    'open',
    'completed',
    'cancelled'
);


ALTER TYPE "development"."attendance_session_status" OWNER TO "postgres";


CREATE TYPE "development"."attendance_session_type" AS ENUM (
    'class',
    'training',
    'meeting',
    'special',
    'other'
);


ALTER TYPE "development"."attendance_session_type" OWNER TO "postgres";


CREATE TYPE "development"."attendance_status" AS ENUM (
    'present',
    'late',
    'excused',
    'absent'
);


ALTER TYPE "development"."attendance_status" OWNER TO "postgres";


CREATE TYPE "development"."cycle_member_status" AS ENUM (
    'active',
    'withdrawn',
    'ineligible'
);


ALTER TYPE "development"."cycle_member_status" OWNER TO "postgres";


CREATE TYPE "development"."cycle_status" AS ENUM (
    'draft',
    'active',
    'closed',
    'archived'
);


ALTER TYPE "development"."cycle_status" OWNER TO "postgres";


CREATE TYPE "development"."enrollment_type" AS ENUM (
    'existing_member',
    'new_member',
    'manual_adjustment'
);


ALTER TYPE "development"."enrollment_type" OWNER TO "postgres";


CREATE TYPE "development"."quiz_assessment_status" AS ENUM (
    'draft',
    'published',
    'closed',
    'archived'
);


ALTER TYPE "development"."quiz_assessment_status" OWNER TO "postgres";


CREATE TYPE "development"."quiz_attempt_status" AS ENUM (
    'in_progress',
    'submitted',
    'expired',
    'voided'
);


ALTER TYPE "development"."quiz_attempt_status" OWNER TO "postgres";


CREATE TYPE "development"."quiz_category" AS ENUM (
    'laws_of_the_game',
    'competition_rules',
    'class_review',
    'other'
);


ALTER TYPE "development"."quiz_category" OWNER TO "postgres";


CREATE TYPE "development"."quiz_language" AS ENUM (
    'es',
    'en'
);


ALTER TYPE "development"."quiz_language" OWNER TO "postgres";


CREATE TYPE "development"."quiz_question_type" AS ENUM (
    'true_false',
    'multiple_choice'
);


ALTER TYPE "development"."quiz_question_type" OWNER TO "postgres";


CREATE TYPE "public"."attendance_status" AS ENUM (
    'present',
    'absent',
    'excused',
    'late'
);


ALTER TYPE "public"."attendance_status" OWNER TO "postgres";


CREATE TYPE "public"."card_type" AS ENUM (
    'yellow',
    'red'
);


ALTER TYPE "public"."card_type" OWNER TO "postgres";


CREATE TYPE "public"."goal_type" AS ENUM (
    'normal',
    'penalty',
    'own_goal'
);


ALTER TYPE "public"."goal_type" OWNER TO "postgres";


CREATE TYPE "public"."member_role" AS ENUM (
    'board',
    'member'
);


ALTER TYPE "public"."member_role" OWNER TO "postgres";


CREATE TYPE "public"."member_status" AS ENUM (
    'invited',
    'active',
    'inactive',
    'suspended'
);


ALTER TYPE "public"."member_status" OWNER TO "postgres";


CREATE TYPE "public"."report_status" AS ENUM (
    'pending',
    'submitted',
    'revision_required',
    'approved'
);


ALTER TYPE "public"."report_status" OWNER TO "postgres";


CREATE TYPE "public"."session_type" AS ENUM (
    'Class',
    'Training',
    'Meeting',
    'Special',
    'Other'
);


ALTER TYPE "public"."session_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "development"."capture_monthly_ranking_snapshot"("p_cycle_id" "uuid", "p_month_start" "date") RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO 'development', 'public'
    AS $$
declare
    v_month_start date;
    v_month_end date;
    v_rows integer;
begin

    -- Normalize to the first day of the requested month.
    v_month_start := date_trunc('month', p_month_start)::date;

    -- Last calendar day of that month.
    v_month_end := (
        date_trunc('month', v_month_start)
        + interval '1 month'
        - interval '1 day'
    )::date;

    /*
     * Capture the already-calculated official monthly result.
     *
     * IMPORTANT:
     * This expensive calculation happens when the snapshot is captured,
     * NOT every time the frontend reads Development Progress.
     */
    insert into development.monthly_ranking_snapshots (
        cycle_id,
        cycle_member_id,
        member_id,

        month_start,
        snapshot_date,

        development_score,

        evidence_percentage,
        evidence_factor_percentage,

        ranking_score,

        ranking_position,
        ranking_percentile,
        eligible_referees,

        ranking_eligible,
        evidence_status,

        captured_at
    )

    select
        h.cycle_id,
        h.cycle_member_id,
        h.member_id,

        h.month_start,
        h.snapshot_date,

        h.monthly_development_score,

        h.monthly_evidence_percentage,
        h.monthly_evidence_factor_percentage,

        h.monthly_ranking_score,

        h.ranking_position,
        h.ranking_percentile,
        h.eligible_referees,

        h.monthly_ranking_eligible,
        h.monthly_evidence_status,

        now()

    from development.referee_monthly_ranking_history_v2 h

    where h.cycle_id = p_cycle_id
      and h.month_start = v_month_start
      and h.snapshot_date = v_month_end

    on conflict (
        cycle_id,
        member_id,
        month_start
    )
    do update set

        cycle_member_id = excluded.cycle_member_id,
        snapshot_date = excluded.snapshot_date,

        development_score = excluded.development_score,

        evidence_percentage = excluded.evidence_percentage,
        evidence_factor_percentage =
            excluded.evidence_factor_percentage,

        ranking_score = excluded.ranking_score,

        ranking_position = excluded.ranking_position,
        ranking_percentile = excluded.ranking_percentile,
        eligible_referees = excluded.eligible_referees,

        ranking_eligible = excluded.ranking_eligible,
        evidence_status = excluded.evidence_status,

        captured_at = now();

    get diagnostics v_rows = row_count;

    return v_rows;

end;
$$;


ALTER FUNCTION "development"."capture_monthly_ranking_snapshot"("p_cycle_id" "uuid", "p_month_start" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "development"."capture_previous_month_ranking_snapshot"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'development', 'public'
    AS $$
declare
    v_cycle_id uuid;
    v_previous_month_start date;
    v_rows integer;
begin

    v_previous_month_start :=
        (
            date_trunc(
                'month',
                current_date
            )
            - interval '1 month'
        )::date;

    select id
    into v_cycle_id
    from development.cycles
    where status = 'active'
      and v_previous_month_start <= end_date
      and (
          v_previous_month_start
          + interval '1 month'
          - interval '1 day'
      )::date >= start_date
    order by start_date desc
    limit 1;

    if v_cycle_id is null then
        return 0;
    end if;

    select development.capture_monthly_ranking_snapshot(
        v_cycle_id,
        v_previous_month_start
    )
    into v_rows;

    return coalesce(v_rows, 0);
end;
$$;


ALTER FUNCTION "development"."capture_previous_month_ranking_snapshot"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "development"."quiz_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assessment_id" "uuid" NOT NULL,
    "version_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "attempt_number" integer NOT NULL,
    "status" "development"."quiz_attempt_status" DEFAULT 'in_progress'::"development"."quiz_attempt_status" NOT NULL,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "submitted_at" timestamp with time zone,
    "score" numeric(5,2),
    "correct_count" integer,
    "total_questions" integer,
    "time_used_seconds" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "quiz_attempts_number_check" CHECK (("attempt_number" >= 1)),
    CONSTRAINT "quiz_attempts_score_check" CHECK ((("score" IS NULL) OR (("score" >= (0)::numeric) AND ("score" <= (100)::numeric))))
);


ALTER TABLE "development"."quiz_attempts" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "development"."finalize_quiz_attempt"("p_attempt_id" "uuid", "p_member_id" "uuid", "p_finalize_as" "development"."quiz_attempt_status") RETURNS "development"."quiz_attempts"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'development', 'public'
    AS $$
declare
  v_attempt development.quiz_attempts;
  v_total_questions integer;
  v_correct_count integer;
  v_score numeric(5,2);
  v_now timestamptz := now();
  v_result development.quiz_attempts;
begin
  if p_finalize_as not in (
    'submitted'::development.quiz_attempt_status,
    'expired'::development.quiz_attempt_status
  ) then
    raise exception
      'Attempt can only be finalized as submitted or expired.';
  end if;

  select *
  into v_attempt
  from development.quiz_attempts
  where id = p_attempt_id
  for update;

  if not found then
    raise exception 'Quiz attempt not found.';
  end if;

  if v_attempt.member_id <> p_member_id then
    raise exception 'This quiz attempt does not belong to the member.';
  end if;

  if v_attempt.status <> 'in_progress' then
    return v_attempt;
  end if;

  if p_finalize_as = 'submitted'
     and v_attempt.expires_at <= v_now then
    p_finalize_as :=
      'expired'::development.quiz_attempt_status;
  end if;

  -- Calificar respuestas guardadas
  update development.quiz_answers answer
  set
    is_correct = option_row.is_correct,
    updated_at = v_now
  from development.quiz_question_options option_row
  where answer.attempt_id = p_attempt_id
    and answer.selected_option_id = option_row.id;

  -- Total de preguntas válidas del snapshot
  select count(*)
  into v_total_questions
  from development.quiz_attempt_questions attempt_question
  join development.quiz_question_groups question_group
    on question_group.id = attempt_question.question_group_id
  where attempt_question.attempt_id = p_attempt_id
    and question_group.is_invalidated = false;

  -- Respuestas correctas
  select count(*)
  into v_correct_count
  from development.quiz_answers answer
  join development.quiz_attempt_questions attempt_question
    on attempt_question.id = answer.attempt_question_id
  join development.quiz_question_groups question_group
    on question_group.id = attempt_question.question_group_id
  where answer.attempt_id = p_attempt_id
    and answer.is_correct = true
    and question_group.is_invalidated = false;

  if v_total_questions = 0 then
    v_score := 0;
  else
    v_score := round(
      (
        v_correct_count::numeric
        / v_total_questions::numeric
      ) * 100,
      2
    );
  end if;

  update development.quiz_attempts
  set
    status = p_finalize_as,
    submitted_at = v_now,
    score = v_score,
    correct_count = v_correct_count,
    total_questions = v_total_questions,
    time_used_seconds = greatest(
      0,
      floor(
        extract(
          epoch from (
            least(v_now, expires_at) - started_at
          )
        )
      )::integer
    ),
    updated_at = v_now
  where id = p_attempt_id
    and status = 'in_progress'
  returning *
  into v_result;

  if v_result.id is null then
    select *
    into v_result
    from development.quiz_attempts
    where id = p_attempt_id;
  end if;

  return v_result;
end;
$$;


ALTER FUNCTION "development"."finalize_quiz_attempt"("p_attempt_id" "uuid", "p_member_id" "uuid", "p_finalize_as" "development"."quiz_attempt_status") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "development"."prevent_scoring_period_overlap"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin

  if exists (
    select 1
    from development.scoring_periods sp
    where sp.id <> new.id
      and daterange(
        sp.effective_from,
        coalesce(sp.effective_until, 'infinity'::date),
        '[]'
      )
      &&
      daterange(
        new.effective_from,
        coalesce(new.effective_until, 'infinity'::date),
        '[]'
      )
  ) then
    raise exception
      'Scoring period overlaps an existing scoring period.';
  end if;

  return new;

end;
$$;


ALTER FUNCTION "development"."prevent_scoring_period_overlap"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "development"."protect_started_scoring_period"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin

  if old.effective_from <= current_date then

    if new.effective_from is distinct from old.effective_from then
      raise exception
        'Cannot change effective_from for a scoring period that has already started.';
    end if;

    if new.attendance_weight is distinct from old.attendance_weight
      or new.quiz_weight is distinct from old.quiz_weight
      or new.report_weight is distinct from old.report_weight
      or new.evaluation_weight is distinct from old.evaluation_weight
    then
      raise exception
        'Cannot change weights for a scoring period that has already started. Close the existing period and create a new one.';
    end if;

  end if;

  return new;

end;
$$;


ALTER FUNCTION "development"."protect_started_scoring_period"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."quiz_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cycle_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "category" "development"."quiz_category" DEFAULT 'other'::"development"."quiz_category" NOT NULL,
    "status" "development"."quiz_assessment_status" DEFAULT 'draft'::"development"."quiz_assessment_status" NOT NULL,
    "required" boolean DEFAULT true NOT NULL,
    "counts_for_score" boolean DEFAULT true NOT NULL,
    "max_attempts" integer DEFAULT 1 NOT NULL,
    "time_limit_minutes" integer NOT NULL,
    "questions_per_attempt" integer NOT NULL,
    "randomize_questions" boolean DEFAULT true NOT NULL,
    "randomize_options" boolean DEFAULT true NOT NULL,
    "open_from" timestamp with time zone,
    "open_until" timestamp with time zone,
    "content_locked_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "published_by" "uuid",
    "published_at" timestamp with time zone,
    "closed_by" "uuid",
    "closed_at" timestamp with time zone,
    "archived_by" "uuid",
    "archived_at" timestamp with time zone,
    CONSTRAINT "quiz_assessments_attempts_check" CHECK (("max_attempts" >= 1)),
    CONSTRAINT "quiz_assessments_questions_per_attempt_check" CHECK (("questions_per_attempt" >= 1)),
    CONSTRAINT "quiz_assessments_required_score_check" CHECK ((("counts_for_score" = false) OR ("required" = true))),
    CONSTRAINT "quiz_assessments_time_limit_check" CHECK (("time_limit_minutes" >= 1)),
    CONSTRAINT "quiz_assessments_window_check" CHECK ((("open_from" IS NULL) OR ("open_until" IS NULL) OR ("open_from" < "open_until")))
);


ALTER TABLE "development"."quiz_assessments" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "development"."publish_quiz_assessment"("p_assessment_id" "uuid", "p_published_by" "uuid") RETURNS "development"."quiz_assessments"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'development', 'public'
    AS $$
declare
  v_assessment development.quiz_assessments;
  v_version_count integer;
  v_question_group_count integer;
  v_invalid_question_count integer;
  v_incomplete_translation_count integer;
  v_invalid_option_count integer;
  v_result development.quiz_assessments;
begin
  -- ===================================================
  -- 1. CARGAR Y BLOQUEAR LA EVALUACIÓN
  -- ===================================================

  select *
  into v_assessment
  from development.quiz_assessments
  where id = p_assessment_id
  for update;

  if not found then
    raise exception 'Quiz assessment not found.';
  end if;

  if v_assessment.status <> 'draft' then
    raise exception
      'Only draft assessments can be published.';
  end if;

  -- ===================================================
  -- 2. VALIDAR CONFIGURACIÓN GENERAL
  -- ===================================================

  if v_assessment.open_from is null
     or v_assessment.open_until is null then
    raise exception
      'The quiz availability window is required.';
  end if;

  if v_assessment.open_from >= v_assessment.open_until then
    raise exception
      'The opening date must be before the closing date.';
  end if;

  if v_assessment.time_limit_minutes < 1 then
    raise exception
      'The time limit must be at least one minute.';
  end if;

  if v_assessment.max_attempts < 1 then
    raise exception
      'At least one attempt must be allowed.';
  end if;

  if v_assessment.questions_per_attempt < 1 then
    raise exception
      'Questions per attempt must be greater than zero.';
  end if;

  -- ===================================================
  -- 3. VALIDAR VERSIONES
  -- ===================================================

  select count(*)
  into v_version_count
  from development.quiz_versions
  where assessment_id = p_assessment_id;

  if v_version_count = 0 then
    raise exception
      'At least one language version is required.';
  end if;

  -- ===================================================
  -- 4. VALIDAR BANCO DE PREGUNTAS
  -- ===================================================

  select count(*)
  into v_question_group_count
  from development.quiz_question_groups
  where assessment_id = p_assessment_id
    and is_invalidated = false;

  if v_question_group_count = 0 then
    raise exception
      'The assessment must contain at least one valid question.';
  end if;

  if v_assessment.questions_per_attempt >
     v_question_group_count then
    raise exception
      'Questions per attempt (%) exceed the available question bank (%).',
      v_assessment.questions_per_attempt,
      v_question_group_count;
  end if;

  -- ===================================================
  -- 5. CADA GRUPO DEBE TENER UNA PREGUNTA POR IDIOMA
  -- ===================================================

  select count(*)
  into v_incomplete_translation_count
  from development.quiz_question_groups qg
  where qg.assessment_id = p_assessment_id
    and qg.is_invalidated = false
    and (
      select count(*)
      from development.quiz_questions qq
      join development.quiz_versions qv
        on qv.id = qq.version_id
      where qq.question_group_id = qg.id
        and qv.assessment_id = p_assessment_id
    ) <> v_version_count;

  if v_incomplete_translation_count > 0 then
    raise exception
      '% question group(s) are missing a language version.',
      v_incomplete_translation_count;
  end if;

  -- ===================================================
  -- 6. VALIDAR TEXTO DE PREGUNTAS
  -- ===================================================

  select count(*)
  into v_invalid_question_count
  from development.quiz_questions qq
  join development.quiz_versions qv
    on qv.id = qq.version_id
  where qv.assessment_id = p_assessment_id
    and length(trim(qq.question_text)) = 0;

  if v_invalid_question_count > 0 then
    raise exception
      '% question(s) have empty text.',
      v_invalid_question_count;
  end if;

  -- ===================================================
  -- 7. VALIDAR OPCIONES
  --
  -- Cada pregunta debe tener:
  -- - entre 2 y 4 opciones
  -- - exactamente una opción correcta
  -- - True/False exactamente 2 opciones
  -- ===================================================

  select count(*)
  into v_invalid_option_count
  from development.quiz_questions qq

  join development.quiz_versions qv
    on qv.id = qq.version_id

  join development.quiz_question_groups qg
    on qg.id = qq.question_group_id

  left join lateral (
    select
      count(*) as option_count,
      count(*) filter (
        where qopt.is_correct = true
      ) as correct_count
    from development.quiz_question_options qopt
    where qopt.question_id = qq.id
  ) option_summary
    on true

  where qv.assessment_id = p_assessment_id
    and qg.is_invalidated = false
    and (
      option_summary.option_count < 2
      or option_summary.option_count > 4
      or option_summary.correct_count <> 1
      or (
        qg.question_type = 'true_false'
        and option_summary.option_count <> 2
      )
    );

  if v_invalid_option_count > 0 then
    raise exception
      '% question(s) have invalid answer options.',
      v_invalid_option_count;
  end if;

  -- ===================================================
  -- 8. PUBLICAR
  -- ===================================================

  update development.quiz_assessments
  set
    status = 'published',
    published_by = p_published_by,
    published_at = now(),
    updated_at = now()
  where id = p_assessment_id
  returning *
  into v_result;

  return v_result;
end;
$$;


ALTER FUNCTION "development"."publish_quiz_assessment"("p_assessment_id" "uuid", "p_published_by" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "development"."refresh_active_cycle_ranking_snapshot"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'development', 'public'
    AS $$
declare
    v_cycle_id uuid;
    v_rows integer;
begin

    select id
    into v_cycle_id
    from development.cycles
    where status = 'active'
      and current_date between start_date and end_date
    order by start_date desc
    limit 1;

    if v_cycle_id is null then
        return 0;
    end if;

    select development.refresh_current_ranking_snapshot(v_cycle_id)
    into v_rows;

    return coalesce(v_rows, 0);
end;
$$;


ALTER FUNCTION "development"."refresh_active_cycle_ranking_snapshot"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "development"."refresh_current_ranking_snapshot"("p_cycle_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    SET "search_path" TO 'development', 'public'
    AS $$
declare
    v_rows integer;
begin

    insert into development.current_ranking_snapshot (
        cycle_id,
        cycle_member_id,
        member_id,

        snapshot_date,

        development_score,

        evidence_percentage,
        evidence_factor_percentage,

        ranking_score,

        ranking_position,
        ranking_percentile,
        eligible_referees,

        ranking_eligible,
        evidence_status,

        attendance_evidence_count,
        quiz_assessments_counted,
        reports_required,
        evaluations_due,
        evaluations_received,

        refreshed_at
    )

    select
        r.cycle_id,
        r.cycle_member_id,
        r.member_id,

        r.snapshot_date,

        r.development_score,

        r.evidence_percentage,
        r.evidence_factor_percentage,

        r.ranking_score,

        r.ranking_position,
        r.ranking_percentile,
        r.eligible_referees,

        r.ranking_eligible,
        r.evidence_status,

        r.attendance_evidence_count,
        r.quiz_assessments_counted,
        r.reports_required,
        r.evaluations_due,
        r.evaluations_received,

        now()

    from development.referee_current_ranking_v2 r

    where r.cycle_id = p_cycle_id

    on conflict (
        cycle_id,
        member_id
    )
    do update set

        cycle_member_id = excluded.cycle_member_id,
        snapshot_date = excluded.snapshot_date,

        development_score = excluded.development_score,

        evidence_percentage = excluded.evidence_percentage,
        evidence_factor_percentage =
            excluded.evidence_factor_percentage,

        ranking_score = excluded.ranking_score,

        ranking_position = excluded.ranking_position,
        ranking_percentile = excluded.ranking_percentile,
        eligible_referees = excluded.eligible_referees,

        ranking_eligible = excluded.ranking_eligible,
        evidence_status = excluded.evidence_status,

        attendance_evidence_count =
            excluded.attendance_evidence_count,

        quiz_assessments_counted =
            excluded.quiz_assessments_counted,

        reports_required =
            excluded.reports_required,

        evaluations_due =
            excluded.evaluations_due,

        evaluations_received =
            excluded.evaluations_received,

        refreshed_at = now();

    get diagnostics v_rows = row_count;

    return v_rows;

end;
$$;


ALTER FUNCTION "development"."refresh_current_ranking_snapshot"("p_cycle_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."quiz_answers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "attempt_id" "uuid" NOT NULL,
    "attempt_question_id" "uuid" NOT NULL,
    "selected_option_id" "uuid",
    "is_correct" boolean,
    "answered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "development"."quiz_answers" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "development"."save_quiz_answer"("p_attempt_id" "uuid", "p_member_id" "uuid", "p_attempt_question_id" "uuid", "p_selected_option_id" "uuid") RETURNS "development"."quiz_answers"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'development', 'public'
    AS $$
declare
  v_attempt development.quiz_attempts;
  v_attempt_question development.quiz_attempt_questions;
  v_option development.quiz_question_options;
  v_answer development.quiz_answers;
begin
  -- Cargar y bloquear intento
  select *
  into v_attempt
  from development.quiz_attempts
  where id = p_attempt_id
  for update;

  if not found then
    raise exception 'Quiz attempt not found.';
  end if;

  if v_attempt.member_id <> p_member_id then
    raise exception 'This quiz attempt does not belong to the member.';
  end if;

  if v_attempt.status <> 'in_progress' then
    raise exception 'Only active quiz attempts can be updated.';
  end if;

  if v_attempt.expires_at <= now() then
    raise exception 'The quiz attempt has expired.';
  end if;

  -- Validar que la pregunta pertenece al intento
  select *
  into v_attempt_question
  from development.quiz_attempt_questions
  where id = p_attempt_question_id
    and attempt_id = p_attempt_id;

  if not found then
    raise exception 'The selected question does not belong to this attempt.';
  end if;

  -- Validar que la opción pertenece a esa pregunta
  select *
  into v_option
  from development.quiz_question_options
  where id = p_selected_option_id
    and question_id = v_attempt_question.question_id;

  if not found then
    raise exception 'The selected answer option is invalid.';
  end if;

  insert into development.quiz_answers (
    attempt_id,
    attempt_question_id,
    selected_option_id,
    is_correct,
    answered_at,
    updated_at
  )
  values (
    p_attempt_id,
    p_attempt_question_id,
    p_selected_option_id,
    null,
    now(),
    now()
  )
  on conflict (attempt_id, attempt_question_id)
  do update set
    selected_option_id = excluded.selected_option_id,
    is_correct = null,
    answered_at = now(),
    updated_at = now()
  returning *
  into v_answer;

  return v_answer;
end;
$$;


ALTER FUNCTION "development"."save_quiz_answer"("p_attempt_id" "uuid", "p_member_id" "uuid", "p_attempt_question_id" "uuid", "p_selected_option_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "development"."start_quiz_attempt"("p_assessment_id" "uuid", "p_member_id" "uuid", "p_language" "development"."quiz_language") RETURNS "development"."quiz_attempts"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'development', 'public'
    AS $$declare
  v_assessment development.quiz_assessments;
  v_version development.quiz_versions;
  v_cycle_member development.cycle_members;
  v_access_grant development.quiz_access_grants;
  v_existing_attempt development.quiz_attempts;
  v_attempt development.quiz_attempts;

  v_attempts_used integer;
  v_attempt_number integer;

  v_effective_from timestamptz;
  v_effective_until timestamptz;
  v_expires_at timestamptz;

  v_question_count integer;
  v_locked_at timestamptz := now();

  v_question record;
  v_option_order jsonb;
begin
  -- ===================================================
  -- 1. CARGAR ASSESSMENT
  -- ===================================================

  select *
  into v_assessment
  from development.quiz_assessments
  where id = p_assessment_id
  for update;

  if not found then
    raise exception 'Quiz assessment not found.';
  end if;

  if v_assessment.status <> 'published' then
    raise exception
      'This quiz is not available for attempts.';
  end if;

  -- ===================================================
  -- 2. VALIDAR MIEMBRO DEL CICLO
  -- ===================================================

  select *
  into v_cycle_member
  from development.cycle_members
  where cycle_id = v_assessment.cycle_id
    and member_id = p_member_id
    and status in (
      'active'::development.cycle_member_status,
      'withdrawn'::development.cycle_member_status
    )
  limit 1;

  if not found then
    raise exception
      'The member is not enrolled in this development cycle.';
  end if;

  -- ===================================================
  -- 3. VALIDAR VERSION DE IDIOMA
  -- ===================================================

  select *
  into v_version
  from development.quiz_versions
  where assessment_id = p_assessment_id
    and language = p_language
  limit 1;

  if not found then
    raise exception
      'The selected language version is not available.';
  end if;


select *
into v_existing_attempt
from development.quiz_attempts
where assessment_id = p_assessment_id
  and member_id = p_member_id
  and status = 'in_progress'
order by started_at desc
limit 1;

if found then

  /*
   * Si todavía tiene tiempo disponible,
   * reutilizamos exactamente el mismo intento.
   *
   * Esto conserva el comportamiento de
   * Resume Quiz.
   */
  if v_existing_attempt.expires_at > now() then
    return v_existing_attempt;
  end if;

  /*
   * Si el intento ya venció, lo finalizamos
   * automáticamente como expired.
   *
   * finalize_quiz_attempt:
   * - califica respuestas guardadas
   * - cuenta preguntas no respondidas como incorrectas
   * - calcula score
   * - guarda correct_count
   * - guarda total_questions
   * - guarda time_used_seconds
   * - cambia status a expired
   *
   * Después continuamos normalmente para comprobar
   * si todavía quedan intentos disponibles.
   */
  perform development.finalize_quiz_attempt(
    v_existing_attempt.id,
    p_member_id,
    'expired'::development.quiz_attempt_status
  );

end if;

  -- ===================================================
  -- 5. CONTAR INTENTOS VALIDOS UTILIZADOS
  -- ===================================================

  select count(*)
  into v_attempts_used
  from development.quiz_attempts
  where assessment_id = p_assessment_id
    and member_id = p_member_id
    and status in (
      'submitted'::development.quiz_attempt_status,
      'expired'::development.quiz_attempt_status
    );

  if v_attempts_used >= v_assessment.max_attempts then
    raise exception
      'No quiz attempts remain.';
  end if;

  v_attempt_number := v_attempts_used + 1;

  -- ===================================================
  -- 6. CALCULAR VENTANA EFECTIVA
  -- General o extensión individual.
  -- ===================================================

  select *
  into v_access_grant
  from development.quiz_access_grants
  where assessment_id = p_assessment_id
    and member_id = p_member_id
    and revoked_at is null
    and available_from <= now()
    and available_until > now()
  order by available_until desc
  limit 1;

  if found then
    v_effective_from :=
      v_access_grant.available_from;

    v_effective_until :=
      v_access_grant.available_until;
  else
    v_effective_from :=
      v_assessment.open_from;

    v_effective_until :=
      v_assessment.open_until;
  end if;

  if v_effective_from is null
     or v_effective_until is null then
    raise exception
      'The quiz availability window is not configured.';
  end if;

  if now() < v_effective_from then
    raise exception
      'The quiz is not open yet.';
  end if;

  if now() >= v_effective_until then
    raise exception
      'The quiz availability window has closed.';
  end if;

  -- ===================================================
  -- 7. VALIDAR ELEGIBILIDAD TEMPORAL DEL MIEMBRO
  -- ===================================================

  if v_cycle_member.effective_from >
     (v_effective_from at time zone 'America/Los_Angeles')::date
  then
    /*
     * Una extensión individual puede autorizar a un
     * miembro nuevo, incluso si entró después de la
     * ventana general.
     */
    if v_access_grant.id is null then
      raise exception
        'The member was not eligible when this quiz opened.';
    end if;
  end if;

  if v_cycle_member.effective_until is not null
     and v_cycle_member.effective_until <
       (v_effective_from at time zone 'America/Los_Angeles')::date
  then
    raise exception
      'The member was no longer eligible when this quiz opened.';
  end if;

  -- ===================================================
  -- 8. VALIDAR BANCO DISPONIBLE PARA ESTE IDIOMA
  -- ===================================================

  select count(*)
  into v_question_count
  from development.quiz_question_groups qg

  join development.quiz_questions qq
    on qq.question_group_id = qg.id

  where qg.assessment_id = p_assessment_id
    and qg.is_invalidated = false
    and qq.version_id = v_version.id;

  if v_question_count <
     v_assessment.questions_per_attempt
  then
    raise exception
      'The selected language version does not contain enough questions.';
  end if;

  -- ===================================================
  -- 9. CALCULAR EXPIRACION
  -- ===================================================

  v_expires_at := least(
    now()
      + make_interval(
          mins =>
            v_assessment.time_limit_minutes
        ),
    v_effective_until
  );

  -- ===================================================
  -- 10. CREAR INTENTO
  -- ===================================================

  insert into development.quiz_attempts (
    assessment_id,
    version_id,
    member_id,
    attempt_number,
    status,
    started_at,
    expires_at
  )
  values (
    p_assessment_id,
    v_version.id,
    p_member_id,
    v_attempt_number,
    'in_progress',
    now(),
    v_expires_at
  )
  returning *
  into v_attempt;

  -- ===================================================
  -- 11. SELECCIONAR Y CONGELAR PREGUNTAS
  -- ===================================================

  for v_question in
    select
      qg.id as question_group_id,
      qq.id as question_id,
      qg.question_type,

      row_number() over (
        order by random()
      )::integer as display_position

    from development.quiz_question_groups qg

    join development.quiz_questions qq
      on qq.question_group_id = qg.id

    where qg.assessment_id = p_assessment_id
      and qg.is_invalidated = false
      and qq.version_id = v_version.id

    order by random()

    limit v_assessment.questions_per_attempt
  loop
    /*
     * True/False mantiene su orden.
     * Las demás opciones se mezclan cuando corresponde.
     */
    if v_question.question_type =
       'true_false'::development.quiz_question_type
    then
      select jsonb_agg(
        option_row.id
        order by option_row.position
      )
      into v_option_order
      from development.quiz_question_options option_row
      where option_row.question_id =
        v_question.question_id;
    elsif v_assessment.randomize_options then
      select jsonb_agg(
        option_row.id
        order by random()
      )
      into v_option_order
      from development.quiz_question_options option_row
      where option_row.question_id =
        v_question.question_id;
    else
      select jsonb_agg(
        option_row.id
        order by option_row.position
      )
      into v_option_order
      from development.quiz_question_options option_row
      where option_row.question_id =
        v_question.question_id;
    end if;

    insert into development.quiz_attempt_questions (
      attempt_id,
      question_group_id,
      question_id,
      display_position,
      option_order
    )
    values (
      v_attempt.id,
      v_question.question_group_id,
      v_question.question_id,
      v_question.display_position,
      coalesce(v_option_order, '[]'::jsonb)
    );
  end loop;

  -- ===================================================
  -- 12. BLOQUEAR CONTENIDO DESDE EL PRIMER INTENTO
  -- ===================================================

  update development.quiz_assessments
  set
    content_locked_at =
      coalesce(content_locked_at, v_locked_at),
    updated_at = now()
  where id = p_assessment_id;

  return v_attempt;
end;$$;


ALTER FUNCTION "development"."start_quiz_attempt"("p_assessment_id" "uuid", "p_member_id" "uuid", "p_language" "development"."quiz_language") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_member_role"() RETURNS "public"."member_role"
    LANGUAGE "sql" STABLE
    AS $$
  select role
  from public.members
  where id = auth.uid()
$$;


ALTER FUNCTION "public"."current_member_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into public.members (
    id,
    full_name,
    email,
    phone,
    role,
    status,
    category,
    years_in_cafla,
    ussf_id,
    grade,
    notes
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name', -- 👈 viene del invite
    new.email,
    null,
    'member',
    'invited',
    'N/A',
    0,
    'N/A',
    'Grassroot',
    'New Member'
  );

  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_board"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.members
    where id = auth.uid()
    and role = 'board'
  );
$$;


ALTER FUNCTION "public"."is_board"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_match_report_status"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN

  UPDATE public.matches
  SET report_status = NEW.status
  WHERE id = NEW.match_id;

  RETURN NEW;

END;
$$;


ALTER FUNCTION "public"."sync_match_report_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "tournaments"."build_match_context"("p_match_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'tournaments'
    AS $$
declare
  v_match public.matches%rowtype;

  v_organization_id uuid;
  v_season_id uuid;
  v_division_id uuid;
  v_division_season_id uuid;

  v_home_team_id uuid;
  v_away_team_id uuid;

  v_home_team_registration_id uuid;
  v_away_team_registration_id uuid;

  v_has_report boolean;
  v_roster_count integer := 0;
begin
  -- =====================================================
  -- 1. LOAD MATCH
  -- =====================================================

  select *
  into v_match
  from public.matches
  where id = p_match_id;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error_code', 'MATCH_NOT_FOUND',
      'message', 'Match not found.'
    );
  end if;


  -- =====================================================
  -- 2. REQUIRE EXPLICIT DIVISION-SEASON
  -- =====================================================

  if v_match.tournament_division_season_id is null then
    insert into tournaments.match_context_logs (
      match_id,
      status,
      error_code,
      message,
      details
    )
    values (
      p_match_id,
      'failed',
      'DIVISION_SEASON_NOT_SELECTED',
      'The match does not have a tournament division-season selected.',
      jsonb_build_object(
        'arbiter_match_id',
        v_match.arbiter_match_id,
        'division',
        v_match.division
      )
    );

    return jsonb_build_object(
      'success', false,
      'error_code', 'DIVISION_SEASON_NOT_SELECTED',
      'message',
      'Tournament division-season is required.'
    );
  end if;


  -- =====================================================
  -- 3. RESOLVE CONTEXT FROM THE SELECTED DIVISION-SEASON
  -- =====================================================

  select
    ds.id,
    d.id,
    s.id,
    s.organization_id
  into
    v_division_season_id,
    v_division_id,
    v_season_id,
    v_organization_id
  from tournaments.division_seasons ds
  join tournaments.divisions d
    on d.id = ds.division_id
  join tournaments.seasons s
    on s.id = ds.season_id
  where ds.id =
        v_match.tournament_division_season_id
    and ds.active = true
  limit 1;

  if v_division_season_id is null then
    insert into tournaments.match_context_logs (
      match_id,
      status,
      error_code,
      message,
      details
    )
    values (
      p_match_id,
      'failed',
      'DIVISION_SEASON_NOT_FOUND',
      'The selected tournament division-season does not exist or is inactive.',
      jsonb_build_object(
        'tournament_division_season_id',
        v_match.tournament_division_season_id
      )
    );

    return jsonb_build_object(
      'success', false,
      'error_code', 'DIVISION_SEASON_NOT_FOUND',
      'message',
      'Selected tournament division-season could not be resolved.'
    );
  end if;


  -- =====================================================
  -- 4. RESOLVE HOME TEAM REGISTRATION
  --
  -- We match the permanent team by name, but only accept
  -- its registration inside the selected division-season.
  -- Internal repeated spaces are normalized.
  -- =====================================================

  select
    t.id,
    tr.id
  into
    v_home_team_id,
    v_home_team_registration_id
  from tournaments.team_registrations tr
  join tournaments.teams t
    on t.id = tr.team_id
  where tr.division_season_id =
        v_division_season_id
    and tr.active = true
    and t.organization_id =
        v_organization_id
    and t.active = true
    and lower(
      regexp_replace(
        trim(t.name),
        '\s+',
        ' ',
        'g'
      )
    ) =
    lower(
      regexp_replace(
        trim(v_match.home_team),
        '\s+',
        ' ',
        'g'
      )
    )
  limit 1;

  if v_home_team_registration_id is null then
    insert into tournaments.match_context_logs (
      match_id,
      status,
      error_code,
      message,
      details
    )
    values (
      p_match_id,
      'failed',
      'HOME_TEAM_REGISTRATION_NOT_FOUND',
      'The home team is not registered in the selected division-season.',
      jsonb_build_object(
        'home_team',
        v_match.home_team,
        'division_season_id',
        v_division_season_id
      )
    );

    return jsonb_build_object(
      'success', false,
      'error_code',
      'HOME_TEAM_REGISTRATION_NOT_FOUND',
      'message',
      'Home team registration could not be resolved.'
    );
  end if;


  -- =====================================================
  -- 5. RESOLVE AWAY TEAM REGISTRATION
  -- =====================================================

  select
    t.id,
    tr.id
  into
    v_away_team_id,
    v_away_team_registration_id
  from tournaments.team_registrations tr
  join tournaments.teams t
    on t.id = tr.team_id
  where tr.division_season_id =
        v_division_season_id
    and tr.active = true
    and t.organization_id =
        v_organization_id
    and t.active = true
    and lower(
      regexp_replace(
        trim(t.name),
        '\s+',
        ' ',
        'g'
      )
    ) =
    lower(
      regexp_replace(
        trim(v_match.away_team),
        '\s+',
        ' ',
        'g'
      )
    )
  limit 1;

  if v_away_team_registration_id is null then
    insert into tournaments.match_context_logs (
      match_id,
      status,
      error_code,
      message,
      details
    )
    values (
      p_match_id,
      'failed',
      'AWAY_TEAM_REGISTRATION_NOT_FOUND',
      'The away team is not registered in the selected division-season.',
      jsonb_build_object(
        'away_team',
        v_match.away_team,
        'division_season_id',
        v_division_season_id
      )
    );

    return jsonb_build_object(
      'success', false,
      'error_code',
      'AWAY_TEAM_REGISTRATION_NOT_FOUND',
      'message',
      'Away team registration could not be resolved.'
    );
  end if;


  -- =====================================================
  -- 6. CREATE OR UPDATE MATCH CONTEXT
  -- =====================================================

  insert into tournaments.match_context (
    match_id,
    division_season_id,
    home_team_registration_id,
    away_team_registration_id
  )
  values (
    p_match_id,
    v_division_season_id,
    v_home_team_registration_id,
    v_away_team_registration_id
  )
  on conflict (match_id)
  do update set
    division_season_id =
      excluded.division_season_id,
    home_team_registration_id =
      excluded.home_team_registration_id,
    away_team_registration_id =
      excluded.away_team_registration_id,
    updated_at = now();


  -- =====================================================
  -- 7. PROTECT HISTORICAL ROSTERS
  --
  -- Before a report exists, the roster may be rebuilt.
  -- Once a report exists, existing roster rows remain.
  -- =====================================================

  select exists (
    select 1
    from public.match_reports mr
    where mr.match_id = p_match_id
  )
  into v_has_report;

  if not v_has_report then
    delete from tournaments.match_rosters
    where match_id = p_match_id;
  end if;


  -- =====================================================
  -- 8. CREATE HOME ROSTER SNAPSHOT
  -- =====================================================

  insert into tournaments.match_rosters (
    match_id,
    player_id,
    team_id,
    checked_in
  )
  select
    p_match_id,
    pr.player_id,
    v_home_team_id,
    false
  from tournaments.player_registrations pr
  where pr.team_registration_id =
        v_home_team_registration_id
    and pr.active = true
  on conflict (
    match_id,
    player_id
  )
  do nothing;


  -- =====================================================
  -- 9. CREATE AWAY ROSTER SNAPSHOT
  -- =====================================================

  insert into tournaments.match_rosters (
    match_id,
    player_id,
    team_id,
    checked_in
  )
  select
    p_match_id,
    pr.player_id,
    v_away_team_id,
    false
  from tournaments.player_registrations pr
  where pr.team_registration_id =
        v_away_team_registration_id
    and pr.active = true
  on conflict (
    match_id,
    player_id
  )
  do nothing;


  select count(*)
  into v_roster_count
  from tournaments.match_rosters
  where match_id = p_match_id;


  -- =====================================================
  -- 10. SUCCESS LOG
  -- =====================================================

  insert into tournaments.match_context_logs (
    match_id,
    status,
    message,
    details
  )
  values (
    p_match_id,
    'success',
    'Match context and roster created successfully.',
    jsonb_build_object(
      'organization_id',
      v_organization_id,
      'season_id',
      v_season_id,
      'division_id',
      v_division_id,
      'division_season_id',
      v_division_season_id,
      'home_team_id',
      v_home_team_id,
      'away_team_id',
      v_away_team_id,
      'home_team_registration_id',
      v_home_team_registration_id,
      'away_team_registration_id',
      v_away_team_registration_id,
      'roster_players',
      v_roster_count
    )
  );


  return jsonb_build_object(
    'success', true,
    'match_id', p_match_id,
    'organization_id', v_organization_id,
    'season_id', v_season_id,
    'division_id', v_division_id,
    'division_season_id',
      v_division_season_id,
    'home_team_registration_id',
      v_home_team_registration_id,
    'away_team_registration_id',
      v_away_team_registration_id,
    'roster_players',
      v_roster_count
  );


exception
  when others then
    insert into tournaments.match_context_logs (
      match_id,
      status,
      error_code,
      message,
      details
    )
    values (
      p_match_id,
      'failed',
      'UNEXPECTED_DATABASE_ERROR',
      sqlerrm,
      jsonb_build_object(
        'sqlstate',
        sqlstate
      )
    );

    return jsonb_build_object(
      'success', false,
      'error_code',
      'UNEXPECTED_DATABASE_ERROR',
      'message',
      sqlerrm
    );
end;
$$;


ALTER FUNCTION "tournaments"."build_match_context"("p_match_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "tournaments"."handle_match_context_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'tournaments'
    AS $$
begin
  perform tournaments.build_match_context(new.id);

  return new;
end;
$$;


ALTER FUNCTION "tournaments"."handle_match_context_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "tournaments"."import_team_roster"("p_organization_name" "text", "p_season_term" "text", "p_season_year" integer, "p_external_team_id" "text", "p_players" "jsonb", "p_deactivate_missing" boolean DEFAULT false) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'tournaments'
    AS $$
declare
  v_organization_id uuid;
  v_team_registration_id uuid;

  v_player jsonb;
  v_player_id uuid;

  v_external_player_id text;
  v_first_name text;
  v_last_name text;
  v_birth_date date;
  v_photo_url text;

  v_processed integer := 0;
  v_registrations integer := 0;
  v_deactivated integer := 0;

  v_payload_count integer;
  v_distinct_id_count integer;
begin
  -- -------------------------------------------------------
  -- VALIDATE JSON PAYLOAD
  -- -------------------------------------------------------

  if p_players is null
     or jsonb_typeof(p_players) <> 'array'
  then
    raise exception
      'p_players must be a JSON array.';
  end if;

  if jsonb_array_length(p_players) = 0 then
    raise exception
      'The roster cannot be empty.';
  end if;

  select
    count(*),
    count(
      distinct nullif(
        trim(player->>'external_player_id'),
        ''
      )
    )
  into
    v_payload_count,
    v_distinct_id_count
  from jsonb_array_elements(p_players) player;

  if v_payload_count <> v_distinct_id_count then
    raise exception
      'The roster contains a missing or duplicated external_player_id.';
  end if;


  -- -------------------------------------------------------
  -- RESOLVE ORGANIZATION
  -- -------------------------------------------------------

  select o.id
  into v_organization_id
  from tournaments.organizations o
  where lower(trim(o.name)) =
        lower(trim(p_organization_name))
  limit 1;

  if v_organization_id is null then
    raise exception
      'Organization "%" was not found.',
      p_organization_name;
  end if;


  -- -------------------------------------------------------
  -- RESOLVE TEAM REGISTRATION
  --
  -- external_team_id belongs to the seasonal registration,
  -- not to the permanent team.
  -- -------------------------------------------------------

  select tr.id
  into v_team_registration_id
  from tournaments.team_registrations tr

  join tournaments.division_seasons ds
    on ds.id = tr.division_season_id

  join tournaments.seasons s
    on s.id = ds.season_id

  where s.organization_id = v_organization_id
    and lower(s.term) =
        lower(trim(p_season_term))
    and s.year = p_season_year
    and tr.external_team_id =
        trim(p_external_team_id)

  limit 1;

  if v_team_registration_id is null then
    raise exception
      'Team registration with external ID "%" was not found for % %.',
      p_external_team_id,
      p_season_term,
      p_season_year;
  end if;


  -- -------------------------------------------------------
  -- UPSERT PLAYERS AND REGISTRATIONS
  -- -------------------------------------------------------

  for v_player in
    select value
    from jsonb_array_elements(p_players)
  loop
    v_external_player_id :=
      nullif(
        trim(v_player->>'external_player_id'),
        ''
      );

    v_first_name :=
      nullif(
        trim(v_player->>'first_name'),
        ''
      );

    v_last_name :=
      nullif(
        trim(v_player->>'last_name'),
        ''
      );

    v_birth_date :=
      nullif(
        trim(v_player->>'birth_date'),
        ''
      )::date;

    v_photo_url :=
      nullif(
        trim(v_player->>'photo_url'),
        ''
      );

    if v_external_player_id is null then
      raise exception
        'Every player must have an external_player_id.';
    end if;

    if v_first_name is null
       or v_last_name is null
    then
      raise exception
        'Player % must include first_name and last_name.',
        v_external_player_id;
    end if;


    insert into tournaments.players (
      organization_id,
      external_player_id,
      first_name,
      last_name,
      birth_date,
      photo_url,
      active
    )
    values (
      v_organization_id,
      v_external_player_id,
      v_first_name,
      v_last_name,
      v_birth_date,
      v_photo_url,
      true
    )
    on conflict (
      organization_id,
      external_player_id
    )
    do update set
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      birth_date = coalesce(
        excluded.birth_date,
        tournaments.players.birth_date
      ),
      photo_url = coalesce(
        excluded.photo_url,
        tournaments.players.photo_url
      ),
      active = true,
      updated_at = now()
    returning id
    into v_player_id;

    v_processed := v_processed + 1;


    insert into tournaments.player_registrations (
      player_id,
      team_registration_id,
      active
    )
    values (
      v_player_id,
      v_team_registration_id,
      true
    )
    on conflict (
      player_id,
      team_registration_id
    )
    do update set
      active = true,
      updated_at = now();

    v_registrations := v_registrations + 1;
  end loop;


  -- -------------------------------------------------------
  -- OPTIONAL FULL-ROSTER SYNCHRONIZATION
  --
  -- Only deactivates seasonal registrations.
  -- It never deletes the permanent player identity.
  -- -------------------------------------------------------

  if p_deactivate_missing then
    update tournaments.player_registrations pr
    set
      active = false,
      updated_at = now()

    from tournaments.players p

    where pr.player_id = p.id
      and pr.team_registration_id =
          v_team_registration_id
      and pr.active = true
      and not exists (
        select 1
        from jsonb_array_elements(p_players) source
        where trim(
          source->>'external_player_id'
        ) = p.external_player_id
      );

    get diagnostics
      v_deactivated = row_count;
  end if;


  return jsonb_build_object(
    'success', true,
    'organization_id', v_organization_id,
    'team_registration_id',
      v_team_registration_id,
    'processed_players', v_processed,
    'active_registrations', v_registrations,
    'deactivated_registrations',
      v_deactivated
  );
end;
$$;


ALTER FUNCTION "tournaments"."import_team_roster"("p_organization_name" "text", "p_season_term" "text", "p_season_year" integer, "p_external_team_id" "text", "p_players" "jsonb", "p_deactivate_missing" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "tournaments"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "tournaments"."set_updated_at"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."attendance_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "status" "development"."attendance_status" NOT NULL,
    "notes" "text",
    "recorded_by" "uuid",
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "development"."attendance_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."attendance_scoring_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cycle_id" "uuid" NOT NULL,
    "present_weight" numeric(5,4) DEFAULT 1.0000 NOT NULL,
    "late_weight" numeric(5,4) DEFAULT 0.5000 NOT NULL,
    "excused_weight" numeric(5,4) DEFAULT 0.7500 NOT NULL,
    "absent_weight" numeric(5,4) DEFAULT 0.0000 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "attendance_absent_weight_check" CHECK ((("absent_weight" >= (0)::numeric) AND ("absent_weight" <= (1)::numeric))),
    CONSTRAINT "attendance_excused_weight_check" CHECK ((("excused_weight" >= (0)::numeric) AND ("excused_weight" <= (1)::numeric))),
    CONSTRAINT "attendance_late_weight_check" CHECK ((("late_weight" >= (0)::numeric) AND ("late_weight" <= (1)::numeric))),
    CONSTRAINT "attendance_present_weight_check" CHECK ((("present_weight" >= (0)::numeric) AND ("present_weight" <= (1)::numeric)))
);


ALTER TABLE "development"."attendance_scoring_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."attendance_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cycle_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "session_type" "development"."attendance_session_type" NOT NULL,
    "scheduled_at" timestamp with time zone NOT NULL,
    "location" "text",
    "status" "development"."attendance_session_status" DEFAULT 'scheduled'::"development"."attendance_session_status" NOT NULL,
    "counts_for_score" boolean DEFAULT true NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "opened_at" timestamp with time zone,
    "opened_by" "uuid",
    "completed_at" timestamp with time zone,
    "completed_by" "uuid",
    CONSTRAINT "development_attendance_session_title_check" CHECK (("length"(TRIM(BOTH FROM "title")) > 0))
);


ALTER TABLE "development"."attendance_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."current_ranking_snapshot" (
    "cycle_id" "uuid" NOT NULL,
    "cycle_member_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "snapshot_date" "date" NOT NULL,
    "development_score" numeric(6,2),
    "evidence_percentage" numeric(6,2),
    "evidence_factor_percentage" numeric(6,2),
    "ranking_score" numeric(6,2),
    "ranking_position" integer,
    "ranking_percentile" numeric(6,2),
    "eligible_referees" integer,
    "ranking_eligible" boolean DEFAULT false NOT NULL,
    "evidence_status" "text" NOT NULL,
    "attendance_evidence_count" numeric,
    "quiz_assessments_counted" bigint,
    "reports_required" bigint,
    "evaluations_due" bigint,
    "evaluations_received" bigint,
    "refreshed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "current_ranking_snapshot_development_check" CHECK ((("development_score" IS NULL) OR (("development_score" >= (0)::numeric) AND ("development_score" <= (100)::numeric)))),
    CONSTRAINT "current_ranking_snapshot_eligibility_check" CHECK ((("ranking_eligible" = false) OR (("ranking_score" IS NOT NULL) AND ("ranking_position" IS NOT NULL)))),
    CONSTRAINT "current_ranking_snapshot_evidence_check" CHECK ((("evidence_percentage" IS NULL) OR (("evidence_percentage" >= (0)::numeric) AND ("evidence_percentage" <= (100)::numeric)))),
    CONSTRAINT "current_ranking_snapshot_factor_check" CHECK ((("evidence_factor_percentage" IS NULL) OR (("evidence_factor_percentage" >= (0)::numeric) AND ("evidence_factor_percentage" <= (100)::numeric)))),
    CONSTRAINT "current_ranking_snapshot_percentile_check" CHECK ((("ranking_percentile" IS NULL) OR (("ranking_percentile" >= (0)::numeric) AND ("ranking_percentile" <= (100)::numeric)))),
    CONSTRAINT "current_ranking_snapshot_position_check" CHECK ((("ranking_position" IS NULL) OR ("ranking_position" >= 1))),
    CONSTRAINT "current_ranking_snapshot_score_check" CHECK ((("ranking_score" IS NULL) OR (("ranking_score" >= (0)::numeric) AND ("ranking_score" <= (100)::numeric))))
);


ALTER TABLE "development"."current_ranking_snapshot" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."cycle_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cycle_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "effective_from" "date" NOT NULL,
    "effective_until" "date",
    "enrollment_type" "development"."enrollment_type" NOT NULL,
    "status" "development"."cycle_member_status" DEFAULT 'active'::"development"."cycle_member_status" NOT NULL,
    "eligible_for_ranking" boolean DEFAULT true NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "development_cycle_member_dates_check" CHECK ((("effective_until" IS NULL) OR ("effective_until" >= "effective_from")))
);


ALTER TABLE "development"."cycle_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."cycles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "status" "development"."cycle_status" DEFAULT 'draft'::"development"."cycle_status" NOT NULL,
    "description" "text",
    "created_by" "uuid",
    "closed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "closed_at" timestamp with time zone,
    CONSTRAINT "development_cycles_dates_check" CHECK (("end_date" >= "start_date"))
);


ALTER TABLE "development"."cycles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."cycle_months_v2" AS
 SELECT "c"."id" AS "cycle_id",
    "c"."name" AS "cycle_name",
    ("gs"."gs")::"date" AS "month_start",
    ((("gs"."gs" + '1 mon'::interval) - '1 day'::interval))::"date" AS "calendar_month_end",
    GREATEST(("gs"."gs")::"date", "c"."start_date") AS "effective_month_from",
    LEAST(((("gs"."gs" + '1 mon'::interval) - '1 day'::interval))::"date", "c"."end_date") AS "effective_month_until"
   FROM ("development"."cycles" "c"
     CROSS JOIN LATERAL "generate_series"("date_trunc"('month'::"text", ("c"."start_date")::timestamp without time zone), "date_trunc"('month'::"text", ("c"."end_date")::timestamp without time zone), '1 mon'::interval) "gs"("gs"));


ALTER VIEW "development"."cycle_months_v2" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."monthly_ranking_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "cycle_id" "uuid" NOT NULL,
    "cycle_member_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "month_start" "date" NOT NULL,
    "snapshot_date" "date" NOT NULL,
    "development_score" numeric(6,2),
    "evidence_percentage" numeric(6,2),
    "evidence_factor_percentage" numeric(6,2),
    "ranking_score" numeric(6,2),
    "ranking_position" integer,
    "ranking_percentile" numeric(6,2),
    "eligible_referees" integer,
    "ranking_eligible" boolean DEFAULT false NOT NULL,
    "evidence_status" "text" NOT NULL,
    "captured_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "monthly_ranking_snapshots_development_score_check" CHECK ((("development_score" IS NULL) OR (("development_score" >= (0)::numeric) AND ("development_score" <= (100)::numeric)))),
    CONSTRAINT "monthly_ranking_snapshots_eligible_consistency" CHECK ((("ranking_eligible" = false) OR (("ranking_score" IS NOT NULL) AND ("ranking_position" IS NOT NULL)))),
    CONSTRAINT "monthly_ranking_snapshots_evidence_factor_check" CHECK ((("evidence_factor_percentage" IS NULL) OR (("evidence_factor_percentage" >= (0)::numeric) AND ("evidence_factor_percentage" <= (100)::numeric)))),
    CONSTRAINT "monthly_ranking_snapshots_evidence_percentage_check" CHECK ((("evidence_percentage" IS NULL) OR (("evidence_percentage" >= (0)::numeric) AND ("evidence_percentage" <= (100)::numeric)))),
    CONSTRAINT "monthly_ranking_snapshots_percentile_check" CHECK ((("ranking_percentile" IS NULL) OR (("ranking_percentile" >= (0)::numeric) AND ("ranking_percentile" <= (100)::numeric)))),
    CONSTRAINT "monthly_ranking_snapshots_position_check" CHECK ((("ranking_position" IS NULL) OR ("ranking_position" >= 1))),
    CONSTRAINT "monthly_ranking_snapshots_ranking_score_check" CHECK ((("ranking_score" IS NULL) OR (("ranking_score" >= (0)::numeric) AND ("ranking_score" <= (100)::numeric))))
);


ALTER TABLE "development"."monthly_ranking_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."quiz_access_grants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assessment_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "available_from" timestamp with time zone NOT NULL,
    "available_until" timestamp with time zone NOT NULL,
    "reason" "text",
    "granted_by" "uuid" NOT NULL,
    "granted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "revoked_at" timestamp with time zone,
    "revoked_by" "uuid",
    CONSTRAINT "quiz_access_grants_window_check" CHECK (("available_from" < "available_until"))
);


ALTER TABLE "development"."quiz_access_grants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."quiz_attempt_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "attempt_id" "uuid" NOT NULL,
    "question_group_id" "uuid" NOT NULL,
    "question_id" "uuid" NOT NULL,
    "display_position" integer NOT NULL,
    "option_order" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "development"."quiz_attempt_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "role" "public"."member_role" DEFAULT 'member'::"public"."member_role",
    "status" "public"."member_status" DEFAULT 'invited'::"public"."member_status",
    "category" "text",
    "years_in_cafla" integer,
    "ussf_id" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "grade" "text",
    "notes" "text"
);


ALTER TABLE "public"."members" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."quiz_member_best_results" WITH ("security_invoker"='false') AS
 SELECT "qa"."cycle_id",
    "qa"."id" AS "assessment_id",
    "qa"."title" AS "assessment_title",
    "qa"."required",
    "qa"."counts_for_score",
    "cm"."member_id",
    "m"."full_name",
    "count"("attempt"."id") FILTER (WHERE ("attempt"."status" = ANY (ARRAY['submitted'::"development"."quiz_attempt_status", 'expired'::"development"."quiz_attempt_status"]))) AS "attempts_used",
    "qa"."max_attempts",
    "max"("attempt"."score") FILTER (WHERE ("attempt"."status" = ANY (ARRAY['submitted'::"development"."quiz_attempt_status", 'expired'::"development"."quiz_attempt_status"]))) AS "best_score",
    "min"("attempt"."score") FILTER (WHERE ("attempt"."status" = ANY (ARRAY['submitted'::"development"."quiz_attempt_status", 'expired'::"development"."quiz_attempt_status"]))) AS "lowest_score",
    ("array_agg"("attempt"."score" ORDER BY "attempt"."started_at") FILTER (WHERE ("attempt"."status" = ANY (ARRAY['submitted'::"development"."quiz_attempt_status", 'expired'::"development"."quiz_attempt_status"]))))[1] AS "first_score",
    ("array_agg"("attempt"."score" ORDER BY "attempt"."started_at" DESC) FILTER (WHERE ("attempt"."status" = ANY (ARRAY['submitted'::"development"."quiz_attempt_status", 'expired'::"development"."quiz_attempt_status"]))))[1] AS "latest_score",
        CASE
            WHEN ("max"("attempt"."score") = (100)::numeric) THEN true
            WHEN ("count"("attempt"."id") FILTER (WHERE ("attempt"."status" = ANY (ARRAY['submitted'::"development"."quiz_attempt_status", 'expired'::"development"."quiz_attempt_status"]))) >= "qa"."max_attempts") THEN true
            ELSE false
        END AS "review_unlocked"
   FROM ((("development"."quiz_assessments" "qa"
     JOIN "development"."cycle_members" "cm" ON (("cm"."cycle_id" = "qa"."cycle_id")))
     JOIN "public"."members" "m" ON (("m"."id" = "cm"."member_id")))
     LEFT JOIN "development"."quiz_attempts" "attempt" ON ((("attempt"."assessment_id" = "qa"."id") AND ("attempt"."member_id" = "cm"."member_id"))))
  WHERE ("cm"."status" = ANY (ARRAY['active'::"development"."cycle_member_status", 'withdrawn'::"development"."cycle_member_status"]))
  GROUP BY "qa"."cycle_id", "qa"."id", "qa"."title", "qa"."required", "qa"."counts_for_score", "qa"."max_attempts", "cm"."member_id", "m"."full_name";


ALTER VIEW "development"."quiz_member_best_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."quiz_question_groups" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assessment_id" "uuid" NOT NULL,
    "question_type" "development"."quiz_question_type" NOT NULL,
    "position" integer,
    "is_invalidated" boolean DEFAULT false NOT NULL,
    "invalidated_at" timestamp with time zone,
    "invalidated_by" "uuid",
    "invalidation_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "development"."quiz_question_groups" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."quiz_question_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question_id" "uuid" NOT NULL,
    "option_text" "text" NOT NULL,
    "is_correct" boolean DEFAULT false NOT NULL,
    "position" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "development"."quiz_question_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."quiz_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "question_group_id" "uuid" NOT NULL,
    "version_id" "uuid" NOT NULL,
    "question_text" "text" NOT NULL,
    "explanation" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "development"."quiz_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."quiz_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "assessment_id" "uuid" NOT NULL,
    "language" "development"."quiz_language" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "instructions" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "development"."quiz_versions" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."referee_attendance_detail" AS
 SELECT "cm"."cycle_id",
    "c"."name" AS "cycle_name",
    "c"."status" AS "cycle_status",
    "cm"."id" AS "cycle_member_id",
    "cm"."member_id",
    "m"."full_name",
    "cm"."effective_from",
    "cm"."effective_until",
    "cm"."enrollment_type",
    "cm"."status" AS "cycle_member_status",
    "cm"."eligible_for_ranking",
    "s"."id" AS "session_id",
    "s"."title" AS "session_title",
    "s"."session_type",
    "s"."scheduled_at",
    "s"."location",
    COALESCE("ar"."status", 'absent'::"development"."attendance_status") AS "attendance_status",
    "ar"."notes" AS "attendance_notes",
    "ar"."recorded_by",
    "ar"."recorded_at",
        CASE
            WHEN ("ar"."status" = 'present'::"development"."attendance_status") THEN "rules"."present_weight"
            WHEN ("ar"."status" = 'late'::"development"."attendance_status") THEN "rules"."late_weight"
            WHEN ("ar"."status" = 'excused'::"development"."attendance_status") THEN "rules"."excused_weight"
            WHEN ("ar"."status" = 'absent'::"development"."attendance_status") THEN "rules"."absent_weight"
            WHEN ("ar"."status" IS NULL) THEN "rules"."absent_weight"
            ELSE (0)::numeric
        END AS "attendance_points"
   FROM ((((("development"."cycle_members" "cm"
     JOIN "development"."cycles" "c" ON (("c"."id" = "cm"."cycle_id")))
     JOIN "public"."members" "m" ON (("m"."id" = "cm"."member_id")))
     JOIN "development"."attendance_sessions" "s" ON (("s"."cycle_id" = "cm"."cycle_id")))
     JOIN "development"."attendance_scoring_rules" "rules" ON (("rules"."cycle_id" = "cm"."cycle_id")))
     LEFT JOIN "development"."attendance_records" "ar" ON ((("ar"."session_id" = "s"."id") AND ("ar"."member_id" = "cm"."member_id"))))
  WHERE (("cm"."status" = ANY (ARRAY['active'::"development"."cycle_member_status", 'withdrawn'::"development"."cycle_member_status"])) AND ("s"."status" = 'completed'::"development"."attendance_session_status") AND ("s"."counts_for_score" = true) AND ((("cm"."enrollment_type" = 'existing_member'::"development"."enrollment_type") AND ((("s"."scheduled_at" AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" >= "c"."start_date")) OR (("cm"."enrollment_type" = 'new_member'::"development"."enrollment_type") AND ((("s"."scheduled_at" AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" >= "cm"."effective_from"))) AND (("cm"."effective_until" IS NULL) OR ((("s"."scheduled_at" AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" <= "cm"."effective_until")) AND ((("s"."scheduled_at" AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" >= "c"."start_date") AND ((("s"."scheduled_at" AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" <= "c"."end_date"));


ALTER VIEW "development"."referee_attendance_detail" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."referee_attendance" WITH ("security_invoker"='false') AS
 SELECT "cm"."cycle_id",
    "c"."name" AS "cycle_name",
    "c"."start_date" AS "cycle_start_date",
    "c"."end_date" AS "cycle_end_date",
    "c"."status" AS "cycle_status",
    "cm"."id" AS "cycle_member_id",
    "cm"."member_id",
    "m"."full_name",
    "cm"."effective_from",
    "cm"."effective_until",
    "cm"."enrollment_type",
    "cm"."status" AS "cycle_member_status",
    "cm"."eligible_for_ranking",
    "count"("d"."session_id") AS "sessions_total",
    "count"("d"."session_id") FILTER (WHERE ("d"."attendance_status" = 'present'::"development"."attendance_status")) AS "sessions_present",
    "count"("d"."session_id") FILTER (WHERE ("d"."attendance_status" = 'late'::"development"."attendance_status")) AS "sessions_late",
    "count"("d"."session_id") FILTER (WHERE ("d"."attendance_status" = 'excused'::"development"."attendance_status")) AS "sessions_excused",
    "count"("d"."session_id") FILTER (WHERE ("d"."attendance_status" = 'absent'::"development"."attendance_status")) AS "sessions_absent",
    COALESCE("sum"("d"."attendance_points"), (0)::numeric) AS "attendance_points",
        CASE
            WHEN ("count"("d"."session_id") = 0) THEN (0)::numeric
            ELSE "round"(((COALESCE("sum"("d"."attendance_points"), (0)::numeric) / ("count"("d"."session_id"))::numeric) * (100)::numeric), 2)
        END AS "attendance_percentage"
   FROM ((("development"."cycle_members" "cm"
     JOIN "development"."cycles" "c" ON (("c"."id" = "cm"."cycle_id")))
     JOIN "public"."members" "m" ON (("m"."id" = "cm"."member_id")))
     LEFT JOIN "development"."referee_attendance_detail" "d" ON (("d"."cycle_member_id" = "cm"."id")))
  WHERE ("cm"."status" = ANY (ARRAY['active'::"development"."cycle_member_status", 'withdrawn'::"development"."cycle_member_status"]))
  GROUP BY "cm"."cycle_id", "c"."name", "c"."start_date", "c"."end_date", "c"."status", "cm"."id", "cm"."member_id", "m"."full_name", "cm"."effective_from", "cm"."effective_until", "cm"."enrollment_type", "cm"."status", "cm"."eligible_for_ranking";


ALTER VIEW "development"."referee_attendance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evaluations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "match_id" "uuid",
    "evaluator_id" "uuid",
    "evaluated_id" "uuid",
    "role_of_evaluator" "text",
    "role_of_evaluated" "text",
    "communication_score" integer,
    "teamwork_score" integer,
    "professionalism_score" integer,
    "comments" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "arrival_score" integer,
    "fitness_score" integer,
    CONSTRAINT "arrival_score_range" CHECK ((("arrival_score" >= 1) AND ("arrival_score" <= 5))),
    CONSTRAINT "communication_score_range" CHECK ((("communication_score" >= 1) AND ("communication_score" <= 5))),
    CONSTRAINT "fitness_score_range" CHECK ((("fitness_score" >= 1) AND ("fitness_score" <= 5))),
    CONSTRAINT "professionalism_score_range" CHECK ((("professionalism_score" >= 1) AND ("professionalism_score" <= 5))),
    CONSTRAINT "teamwork_score_range" CHECK ((("teamwork_score" >= 1) AND ("teamwork_score" <= 5)))
);


ALTER TABLE "public"."evaluations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "arbiter_match_id" "text",
    "match_number" "text",
    "home_team" "text" NOT NULL,
    "away_team" "text" NOT NULL,
    "league" "text",
    "division" "text",
    "location" "text",
    "field" "text",
    "kickoff_at" timestamp without time zone,
    "center_referee_id" "uuid",
    "assistant_referee_1_id" "uuid",
    "assistant_referee_2_id" "uuid",
    "report_status" "public"."report_status" DEFAULT 'pending'::"public"."report_status",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "arbiter_comments" "text",
    "tournament_division_season_id" "uuid"
);


ALTER TABLE "public"."matches" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."referee_evaluation_detail" AS
 WITH "cycle_members_eligible" AS (
         SELECT "cm"."id" AS "cycle_member_id",
            "cm"."cycle_id",
            "c"."name" AS "cycle_name",
            "c"."status" AS "cycle_status",
            "cm"."member_id",
            "cm"."effective_from",
            "cm"."effective_until",
            "cm"."enrollment_type",
            "cm"."status" AS "cycle_member_status",
            "cm"."eligible_for_ranking"
           FROM ("development"."cycle_members" "cm"
             JOIN "development"."cycles" "c" ON (("c"."id" = "cm"."cycle_id")))
          WHERE (("cm"."status" = ANY (ARRAY['active'::"development"."cycle_member_status", 'withdrawn'::"development"."cycle_member_status"])) AND ("cm"."eligible_for_ranking" = true))
        ), "match_crews" AS (
         SELECT "c"."id" AS "cycle_id",
            "c"."name" AS "cycle_name",
            "m"."id" AS "match_id",
            "m"."home_team",
            "m"."away_team",
            "m"."league",
            "m"."division",
            "m"."location",
            "m"."field",
            "m"."kickoff_at",
            "m"."center_referee_id",
            "m"."assistant_referee_1_id",
            "m"."assistant_referee_2_id"
           FROM ("development"."cycles" "c"
             JOIN "public"."matches" "m" ON (((("m"."kickoff_at")::"date" >= "c"."start_date") AND (("m"."kickoff_at")::"date" <= "c"."end_date"))))
          WHERE (("c"."status" = 'active'::"development"."cycle_status") AND ((("m"."kickoff_at")::"date" >= '2026-09-18'::"date") OR ("m"."id" = 'cb5cb563-d55d-4c74-a91f-e28b9e486e55'::"uuid")) AND ("m"."kickoff_at" < ("now"() AT TIME ZONE 'America/Los_Angeles'::"text")))
        ), "evaluation_obligations" AS (
         SELECT "match_crews"."cycle_id",
            "match_crews"."cycle_name",
            "match_crews"."match_id",
            "match_crews"."home_team",
            "match_crews"."away_team",
            "match_crews"."league",
            "match_crews"."division",
            "match_crews"."location",
            "match_crews"."field",
            "match_crews"."kickoff_at",
            "match_crews"."center_referee_id" AS "evaluator_id",
            "match_crews"."assistant_referee_1_id" AS "evaluated_id",
            'center'::"text" AS "evaluator_role",
            'ar1'::"text" AS "evaluated_role"
           FROM "match_crews"
        UNION ALL
         SELECT "match_crews"."cycle_id",
            "match_crews"."cycle_name",
            "match_crews"."match_id",
            "match_crews"."home_team",
            "match_crews"."away_team",
            "match_crews"."league",
            "match_crews"."division",
            "match_crews"."location",
            "match_crews"."field",
            "match_crews"."kickoff_at",
            "match_crews"."center_referee_id",
            "match_crews"."assistant_referee_2_id",
            'center'::"text" AS "text",
            'ar2'::"text" AS "text"
           FROM "match_crews"
        UNION ALL
         SELECT "match_crews"."cycle_id",
            "match_crews"."cycle_name",
            "match_crews"."match_id",
            "match_crews"."home_team",
            "match_crews"."away_team",
            "match_crews"."league",
            "match_crews"."division",
            "match_crews"."location",
            "match_crews"."field",
            "match_crews"."kickoff_at",
            "match_crews"."assistant_referee_1_id",
            "match_crews"."center_referee_id",
            'ar1'::"text" AS "text",
            'center'::"text" AS "text"
           FROM "match_crews"
        UNION ALL
         SELECT "match_crews"."cycle_id",
            "match_crews"."cycle_name",
            "match_crews"."match_id",
            "match_crews"."home_team",
            "match_crews"."away_team",
            "match_crews"."league",
            "match_crews"."division",
            "match_crews"."location",
            "match_crews"."field",
            "match_crews"."kickoff_at",
            "match_crews"."assistant_referee_1_id",
            "match_crews"."assistant_referee_2_id",
            'ar1'::"text" AS "text",
            'ar2'::"text" AS "text"
           FROM "match_crews"
        UNION ALL
         SELECT "match_crews"."cycle_id",
            "match_crews"."cycle_name",
            "match_crews"."match_id",
            "match_crews"."home_team",
            "match_crews"."away_team",
            "match_crews"."league",
            "match_crews"."division",
            "match_crews"."location",
            "match_crews"."field",
            "match_crews"."kickoff_at",
            "match_crews"."assistant_referee_2_id",
            "match_crews"."center_referee_id",
            'ar2'::"text" AS "text",
            'center'::"text" AS "text"
           FROM "match_crews"
        UNION ALL
         SELECT "match_crews"."cycle_id",
            "match_crews"."cycle_name",
            "match_crews"."match_id",
            "match_crews"."home_team",
            "match_crews"."away_team",
            "match_crews"."league",
            "match_crews"."division",
            "match_crews"."location",
            "match_crews"."field",
            "match_crews"."kickoff_at",
            "match_crews"."assistant_referee_2_id",
            "match_crews"."assistant_referee_1_id",
            'ar2'::"text" AS "text",
            'ar1'::"text" AS "text"
           FROM "match_crews"
        ), "valid_obligations" AS (
         SELECT "eo"."cycle_id",
            "eo"."cycle_name",
            "eo"."match_id",
            "eo"."home_team",
            "eo"."away_team",
            "eo"."league",
            "eo"."division",
            "eo"."location",
            "eo"."field",
            "eo"."kickoff_at",
            "eo"."evaluator_id",
            "eo"."evaluated_id",
            "eo"."evaluator_role",
            "eo"."evaluated_role",
            "evaluator_cm"."cycle_member_id" AS "evaluator_cycle_member_id",
            "evaluated_cm"."cycle_member_id" AS "evaluated_cycle_member_id"
           FROM (("evaluation_obligations" "eo"
             JOIN "cycle_members_eligible" "evaluator_cm" ON ((("evaluator_cm"."cycle_id" = "eo"."cycle_id") AND ("evaluator_cm"."member_id" = "eo"."evaluator_id") AND (("eo"."kickoff_at")::"date" >= "evaluator_cm"."effective_from") AND (("evaluator_cm"."effective_until" IS NULL) OR (("eo"."kickoff_at")::"date" <= "evaluator_cm"."effective_until")))))
             JOIN "cycle_members_eligible" "evaluated_cm" ON ((("evaluated_cm"."cycle_id" = "eo"."cycle_id") AND ("evaluated_cm"."member_id" = "eo"."evaluated_id") AND (("eo"."kickoff_at")::"date" >= "evaluated_cm"."effective_from") AND (("evaluated_cm"."effective_until" IS NULL) OR (("eo"."kickoff_at")::"date" <= "evaluated_cm"."effective_until")))))
          WHERE (("eo"."evaluator_id" IS NOT NULL) AND ("eo"."evaluated_id" IS NOT NULL) AND ("eo"."evaluator_id" <> "eo"."evaluated_id"))
        )
 SELECT "vo"."cycle_id",
    "vo"."cycle_name",
    "vo"."match_id",
    "vo"."home_team",
    "vo"."away_team",
    "vo"."league",
    "vo"."division",
    "vo"."location",
    "vo"."field",
    "vo"."kickoff_at",
    ("vo"."kickoff_at")::"date" AS "match_date_la",
    ("vo"."kickoff_at" + '48:00:00'::interval) AS "evaluation_deadline",
    "vo"."evaluator_cycle_member_id",
    "vo"."evaluator_id",
    "evaluator"."full_name" AS "evaluator_name",
    "vo"."evaluator_role",
    "vo"."evaluated_cycle_member_id",
    "vo"."evaluated_id",
    "evaluated"."full_name" AS "evaluated_name",
    "vo"."evaluated_role",
    "e"."id" AS "evaluation_id",
    "e"."created_at",
    (("e"."created_at" AT TIME ZONE 'UTC'::"text") AT TIME ZONE 'America/Los_Angeles'::"text") AS "created_at_la",
    "e"."arrival_score",
    "e"."fitness_score",
    "e"."communication_score",
    "e"."teamwork_score",
    "e"."professionalism_score",
    "e"."comments",
        CASE
            WHEN ("e"."id" IS NULL) THEN NULL::numeric
            ELSE "round"(((((((("e"."arrival_score" + "e"."fitness_score") + "e"."communication_score") + "e"."teamwork_score") + "e"."professionalism_score"))::numeric / 25.0) * (100)::numeric), 2)
        END AS "quality_percentage",
        CASE
            WHEN (("e"."id" IS NOT NULL) AND ((("e"."created_at" AT TIME ZONE 'UTC'::"text") AT TIME ZONE 'America/Los_Angeles'::"text") <= ("vo"."kickoff_at" + '48:00:00'::interval))) THEN 'completed_on_time'::"text"
            WHEN ("e"."id" IS NOT NULL) THEN 'completed_late'::"text"
            WHEN (("now"() AT TIME ZONE 'America/Los_Angeles'::"text") <= ("vo"."kickoff_at" + '48:00:00'::interval)) THEN 'pending'::"text"
            ELSE 'missed'::"text"
        END AS "obligation_status",
        CASE
            WHEN (("e"."id" IS NOT NULL) AND ((("e"."created_at" AT TIME ZONE 'UTC'::"text") AT TIME ZONE 'America/Los_Angeles'::"text") <= ("vo"."kickoff_at" + '48:00:00'::interval))) THEN 1
            ELSE 0
        END AS "compliance_point"
   FROM ((("valid_obligations" "vo"
     JOIN "public"."members" "evaluator" ON (("evaluator"."id" = "vo"."evaluator_id")))
     JOIN "public"."members" "evaluated" ON (("evaluated"."id" = "vo"."evaluated_id")))
     LEFT JOIN "public"."evaluations" "e" ON ((("e"."match_id" = "vo"."match_id") AND ("e"."evaluator_id" = "vo"."evaluator_id") AND ("e"."evaluated_id" = "vo"."evaluated_id"))));


ALTER VIEW "development"."referee_evaluation_detail" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."match_reports" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "match_id" "uuid",
    "submitted_by" "uuid",
    "submitted_at" timestamp without time zone,
    "home_score" integer,
    "away_score" integer,
    "comments" "text",
    "status" "public"."report_status" DEFAULT 'submitted'::"public"."report_status",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "revision_notes" "text"
);


ALTER TABLE "public"."match_reports" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."referee_report_detail" AS
 SELECT "cm"."cycle_id",
    "c"."name" AS "cycle_name",
    "c"."status" AS "cycle_status",
    "cm"."id" AS "cycle_member_id",
    "cm"."member_id",
    "mem"."full_name",
    "cm"."effective_from",
    "cm"."effective_until",
    "cm"."enrollment_type",
    "cm"."status" AS "cycle_member_status",
    "cm"."eligible_for_ranking",
    "m"."id" AS "match_id",
    "m"."home_team",
    "m"."away_team",
    "m"."league",
    "m"."division",
    "m"."location",
    "m"."field",
    "m"."kickoff_at",
    ("m"."kickoff_at")::"date" AS "match_date_la",
    "mr"."id" AS "report_id",
    "mr"."status" AS "report_status",
    "mr"."submitted_at",
    (("mr"."submitted_at" AT TIME ZONE 'UTC'::"text") AT TIME ZONE 'America/Los_Angeles'::"text") AS "submitted_at_la",
    ((("mr"."submitted_at" AT TIME ZONE 'UTC'::"text") AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" AS "submitted_date_la",
        CASE
            WHEN ("mr"."id" IS NULL) THEN false
            ELSE true
        END AS "report_submitted",
        CASE
            WHEN (("mr"."id" IS NOT NULL) AND (((("mr"."submitted_at" AT TIME ZONE 'UTC'::"text") AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" = ("m"."kickoff_at")::"date")) THEN true
            ELSE false
        END AS "submitted_on_time",
        CASE
            WHEN (("mr"."id" IS NOT NULL) AND (((("mr"."submitted_at" AT TIME ZONE 'UTC'::"text") AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" = ("m"."kickoff_at")::"date")) THEN 1
            ELSE 0
        END AS "report_points"
   FROM (((("development"."cycle_members" "cm"
     JOIN "development"."cycles" "c" ON (("c"."id" = "cm"."cycle_id")))
     JOIN "public"."members" "mem" ON (("mem"."id" = "cm"."member_id")))
     JOIN "public"."matches" "m" ON (("m"."center_referee_id" = "cm"."member_id")))
     LEFT JOIN "public"."match_reports" "mr" ON (("mr"."match_id" = "m"."id")))
  WHERE (("cm"."status" = 'active'::"development"."cycle_member_status") AND ("cm"."eligible_for_ranking" = true) AND ("m"."center_referee_id" IS NOT NULL) AND (("m"."kickoff_at")::"date" >= "cm"."effective_from") AND (("cm"."effective_until" IS NULL) OR (("m"."kickoff_at")::"date" <= "cm"."effective_until")) AND (("m"."kickoff_at")::"date" >= "c"."start_date") AND (("m"."kickoff_at")::"date" <= "c"."end_date") AND ("m"."kickoff_at" < CURRENT_TIMESTAMP));


ALTER VIEW "development"."referee_report_detail" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "development"."scoring_periods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "effective_from" "date" NOT NULL,
    "effective_until" "date",
    "attendance_weight" integer NOT NULL,
    "quiz_weight" integer NOT NULL,
    "report_weight" integer NOT NULL,
    "evaluation_weight" integer NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "scoring_periods_attendance_weight_range" CHECK ((("attendance_weight" >= 0) AND ("attendance_weight" <= 100))),
    CONSTRAINT "scoring_periods_evaluation_weight_range" CHECK ((("evaluation_weight" >= 0) AND ("evaluation_weight" <= 100))),
    CONSTRAINT "scoring_periods_name_not_blank" CHECK (("btrim"("name") <> ''::"text")),
    CONSTRAINT "scoring_periods_quiz_weight_range" CHECK ((("quiz_weight" >= 0) AND ("quiz_weight" <= 100))),
    CONSTRAINT "scoring_periods_report_weight_range" CHECK ((("report_weight" >= 0) AND ("report_weight" <= 100))),
    CONSTRAINT "scoring_periods_valid_dates" CHECK ((("effective_until" IS NULL) OR ("effective_until" >= "effective_from"))),
    CONSTRAINT "scoring_periods_weights_total" CHECK ((((("attendance_weight" + "quiz_weight") + "report_weight") + "evaluation_weight") = 100))
);


ALTER TABLE "development"."scoring_periods" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."referee_monthly_period_metric_scores_v2" AS
 WITH "member_month_periods" AS (
         SELECT "c"."id" AS "cycle_id",
            "c"."name" AS "cycle_name",
            "cm"."id" AS "cycle_member_id",
            "cm"."member_id",
            "m"."full_name",
            "cm"."effective_from" AS "member_effective_from",
            "cm"."effective_until" AS "member_effective_until",
            "cm"."enrollment_type",
            "cm"."status" AS "cycle_member_status",
            "cm"."eligible_for_ranking",
            "mon"."month_start",
            "mon"."calendar_month_end",
            "mon"."effective_month_from",
            "mon"."effective_month_until",
            LEAST("mon"."effective_month_until", (("now"() AT TIME ZONE 'America/Los_Angeles'::"text"))::"date") AS "snapshot_date",
            "sp"."id" AS "scoring_period_id",
            "sp"."name" AS "scoring_period_name",
            "sp"."effective_from" AS "period_from",
            "sp"."effective_until" AS "period_until",
            "sp"."attendance_weight",
            "sp"."quiz_weight",
            "sp"."report_weight",
            "sp"."evaluation_weight",
            GREATEST("sp"."effective_from", "cm"."effective_from", "c"."start_date") AS "period_activity_from",
            LEAST(COALESCE("sp"."effective_until", "c"."end_date"), "mon"."effective_month_until", COALESCE("cm"."effective_until", "c"."end_date"), "c"."end_date", (("now"() AT TIME ZONE 'America/Los_Angeles'::"text"))::"date") AS "period_cutoff"
           FROM (((("development"."cycle_members" "cm"
             JOIN "development"."cycles" "c" ON (("c"."id" = "cm"."cycle_id")))
             JOIN "public"."members" "m" ON (("m"."id" = "cm"."member_id")))
             JOIN "development"."cycle_months_v2" "mon" ON (("mon"."cycle_id" = "c"."id")))
             JOIN "development"."scoring_periods" "sp" ON ((("sp"."effective_from" <= LEAST("mon"."effective_month_until", (("now"() AT TIME ZONE 'America/Los_Angeles'::"text"))::"date")) AND (COALESCE("sp"."effective_until", "c"."end_date") >= "c"."start_date") AND ("sp"."effective_from" <= COALESCE("cm"."effective_until", "c"."end_date")) AND (COALESCE("sp"."effective_until", "c"."end_date") >= "cm"."effective_from"))))
          WHERE (("cm"."status" = ANY (ARRAY['active'::"development"."cycle_member_status", 'withdrawn'::"development"."cycle_member_status"])) AND ("cm"."eligible_for_ranking" = true) AND ("mon"."effective_month_from" <= (("now"() AT TIME ZONE 'America/Los_Angeles'::"text"))::"date") AND (GREATEST("sp"."effective_from", "cm"."effective_from", "c"."start_date") <= LEAST(COALESCE("sp"."effective_until", "c"."end_date"), "mon"."effective_month_until", COALESCE("cm"."effective_until", "c"."end_date"), "c"."end_date", (("now"() AT TIME ZONE 'America/Los_Angeles'::"text"))::"date")))
        ), "attendance_monthly" AS (
         SELECT "mp_1"."cycle_id",
            "mp_1"."cycle_member_id",
            "mp_1"."member_id",
            "mp_1"."month_start",
            "mp_1"."scoring_period_id",
            "count"("d".*) AS "attendance_sessions",
            "count"("d".*) FILTER (WHERE ("d"."attendance_status" = 'present'::"development"."attendance_status")) AS "attendance_present",
            "count"("d".*) FILTER (WHERE ("d"."attendance_status" = 'late'::"development"."attendance_status")) AS "attendance_late",
            "count"("d".*) FILTER (WHERE ("d"."attendance_status" = 'excused'::"development"."attendance_status")) AS "attendance_excused",
            "count"("d".*) FILTER (WHERE ("d"."attendance_status" = 'absent'::"development"."attendance_status")) AS "attendance_absent",
            "round"(("avg"("d"."attendance_points") * (100)::numeric), 2) AS "attendance_score"
           FROM ("member_month_periods" "mp_1"
             LEFT JOIN "development"."referee_attendance_detail" "d" ON ((("d"."cycle_id" = "mp_1"."cycle_id") AND ("d"."cycle_member_id" = "mp_1"."cycle_member_id") AND ("d"."member_id" = "mp_1"."member_id") AND ((("d"."scheduled_at" AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" >= "mp_1"."period_activity_from") AND ((("d"."scheduled_at" AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" <= "mp_1"."period_cutoff"))))
          GROUP BY "mp_1"."cycle_id", "mp_1"."cycle_member_id", "mp_1"."member_id", "mp_1"."month_start", "mp_1"."scoring_period_id"
        ), "quiz_results" AS (
         SELECT "result"."cycle_id",
            "result"."assessment_id",
            "result"."member_id",
            "qa"."open_from",
                CASE
                    WHEN ("result"."best_score" IS NOT NULL) THEN "result"."best_score"
                    WHEN (("qa"."required" = true) AND ("qa"."counts_for_score" = true) AND (("qa"."status" = ANY (ARRAY['closed'::"development"."quiz_assessment_status", 'archived'::"development"."quiz_assessment_status"])) OR (("qa"."status" = 'published'::"development"."quiz_assessment_status") AND ("qa"."open_until" <= "now"())))) THEN (0)::numeric
                    ELSE NULL::numeric
                END AS "effective_score"
           FROM ("development"."quiz_member_best_results" "result"
             JOIN "development"."quiz_assessments" "qa" ON (("qa"."id" = "result"."assessment_id")))
        ), "quiz_monthly" AS (
         SELECT "mp_1"."cycle_id",
            "mp_1"."member_id",
            "mp_1"."month_start",
            "mp_1"."scoring_period_id",
            "count"("qr".*) FILTER (WHERE ("qr"."effective_score" IS NOT NULL)) AS "quiz_assessments_counted",
            "count"("qr".*) FILTER (WHERE ("qr"."effective_score" = (0)::numeric)) AS "quiz_zero_scores",
            "round"("avg"("qr"."effective_score") FILTER (WHERE ("qr"."effective_score" IS NOT NULL)), 2) AS "quiz_score"
           FROM ("member_month_periods" "mp_1"
             LEFT JOIN "quiz_results" "qr" ON ((("qr"."cycle_id" = "mp_1"."cycle_id") AND ("qr"."member_id" = "mp_1"."member_id") AND ((("qr"."open_from" AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" >= "mp_1"."period_activity_from") AND ((("qr"."open_from" AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" <= "mp_1"."period_cutoff"))))
          GROUP BY "mp_1"."cycle_id", "mp_1"."member_id", "mp_1"."month_start", "mp_1"."scoring_period_id"
        ), "report_monthly" AS (
         SELECT "mp_1"."cycle_id",
            "mp_1"."cycle_member_id",
            "mp_1"."member_id",
            "mp_1"."month_start",
            "mp_1"."scoring_period_id",
            "count"("d".*) AS "reports_required",
            "count"("d".*) FILTER (WHERE ("d"."report_submitted" = true)) AS "reports_submitted",
            "count"("d".*) FILTER (WHERE ("d"."submitted_on_time" = true)) AS "reports_on_time",
            "count"("d".*) FILTER (WHERE (("d"."report_submitted" = true) AND ("d"."submitted_on_time" = false))) AS "reports_late",
            "count"("d".*) FILTER (WHERE ("d"."report_submitted" = false)) AS "reports_missing",
            COALESCE("sum"("d"."report_points"), (0)::bigint) AS "report_points",
            "round"(((("sum"("d"."report_points"))::numeric / (NULLIF("count"("d".*), 0))::numeric) * (100)::numeric), 2) AS "report_score"
           FROM ("member_month_periods" "mp_1"
             LEFT JOIN "development"."referee_report_detail" "d" ON ((("d"."cycle_id" = "mp_1"."cycle_id") AND ("d"."cycle_member_id" = "mp_1"."cycle_member_id") AND ("d"."member_id" = "mp_1"."member_id") AND ("d"."match_date_la" >= "mp_1"."period_activity_from") AND ("d"."match_date_la" <= "mp_1"."period_cutoff"))))
          GROUP BY "mp_1"."cycle_id", "mp_1"."cycle_member_id", "mp_1"."member_id", "mp_1"."month_start", "mp_1"."scoring_period_id"
        ), "evaluation_compliance" AS (
         SELECT "mp_1"."cycle_id",
            "mp_1"."cycle_member_id",
            "mp_1"."member_id",
            "mp_1"."month_start",
            "mp_1"."scoring_period_id",
            "count"("d".*) AS "evaluations_required_total",
            "count"("d".*) FILTER (WHERE ("d"."obligation_status" = 'pending'::"text")) AS "evaluations_pending",
            "count"("d".*) FILTER (WHERE ("d"."obligation_status" <> 'pending'::"text")) AS "evaluations_due",
            "count"("d".*) FILTER (WHERE ("d"."obligation_status" = 'completed_on_time'::"text")) AS "evaluations_completed_on_time",
            "count"("d".*) FILTER (WHERE ("d"."obligation_status" = 'completed_late'::"text")) AS "evaluations_completed_late",
            "count"("d".*) FILTER (WHERE ("d"."obligation_status" = 'missed'::"text")) AS "evaluations_missed",
            "round"(((("count"("d".*) FILTER (WHERE ("d"."obligation_status" = 'completed_on_time'::"text")))::numeric / (NULLIF("count"("d".*) FILTER (WHERE ("d"."obligation_status" <> 'pending'::"text")), 0))::numeric) * (100)::numeric), 2) AS "compliance_percentage"
           FROM ("member_month_periods" "mp_1"
             LEFT JOIN "development"."referee_evaluation_detail" "d" ON ((("d"."cycle_id" = "mp_1"."cycle_id") AND ("d"."evaluator_cycle_member_id" = "mp_1"."cycle_member_id") AND ("d"."evaluator_id" = "mp_1"."member_id") AND ("d"."match_date_la" >= "mp_1"."period_activity_from") AND ("d"."match_date_la" <= "mp_1"."period_cutoff"))))
          GROUP BY "mp_1"."cycle_id", "mp_1"."cycle_member_id", "mp_1"."member_id", "mp_1"."month_start", "mp_1"."scoring_period_id"
        ), "evaluation_quality" AS (
         SELECT "mp_1"."cycle_id",
            "mp_1"."cycle_member_id",
            "mp_1"."member_id",
            "mp_1"."month_start",
            "mp_1"."scoring_period_id",
            "count"("d".*) FILTER (WHERE ("d"."obligation_status" = 'completed_on_time'::"text")) AS "evaluations_received",
            "round"("avg"("d"."quality_percentage") FILTER (WHERE ("d"."obligation_status" = 'completed_on_time'::"text")), 2) AS "quality_percentage",
            "round"("avg"("d"."arrival_score") FILTER (WHERE ("d"."obligation_status" = 'completed_on_time'::"text")), 2) AS "avg_arrival",
            "round"("avg"("d"."fitness_score") FILTER (WHERE ("d"."obligation_status" = 'completed_on_time'::"text")), 2) AS "avg_fitness",
            "round"("avg"("d"."communication_score") FILTER (WHERE ("d"."obligation_status" = 'completed_on_time'::"text")), 2) AS "avg_communication",
            "round"("avg"("d"."teamwork_score") FILTER (WHERE ("d"."obligation_status" = 'completed_on_time'::"text")), 2) AS "avg_teamwork",
            "round"("avg"("d"."professionalism_score") FILTER (WHERE ("d"."obligation_status" = 'completed_on_time'::"text")), 2) AS "avg_professionalism"
           FROM ("member_month_periods" "mp_1"
             LEFT JOIN "development"."referee_evaluation_detail" "d" ON ((("d"."cycle_id" = "mp_1"."cycle_id") AND ("d"."evaluated_cycle_member_id" = "mp_1"."cycle_member_id") AND ("d"."evaluated_id" = "mp_1"."member_id") AND ("d"."match_date_la" >= "mp_1"."period_activity_from") AND ("d"."match_date_la" <= "mp_1"."period_cutoff"))))
          GROUP BY "mp_1"."cycle_id", "mp_1"."cycle_member_id", "mp_1"."member_id", "mp_1"."month_start", "mp_1"."scoring_period_id"
        ), "evaluation_monthly" AS (
         SELECT "mp_1"."cycle_id",
            "mp_1"."cycle_member_id",
            "mp_1"."member_id",
            "mp_1"."month_start",
            "mp_1"."scoring_period_id",
            COALESCE("ec"."evaluations_required_total", (0)::bigint) AS "evaluations_required_total",
            COALESCE("ec"."evaluations_pending", (0)::bigint) AS "evaluations_pending",
            COALESCE("ec"."evaluations_due", (0)::bigint) AS "evaluations_due",
            COALESCE("ec"."evaluations_completed_on_time", (0)::bigint) AS "evaluations_completed_on_time",
            COALESCE("ec"."evaluations_completed_late", (0)::bigint) AS "evaluations_completed_late",
            COALESCE("ec"."evaluations_missed", (0)::bigint) AS "evaluations_missed",
            "ec"."compliance_percentage",
            COALESCE("eq"."evaluations_received", (0)::bigint) AS "evaluations_received",
            "eq"."quality_percentage",
            "eq"."avg_arrival",
            "eq"."avg_fitness",
            "eq"."avg_communication",
            "eq"."avg_teamwork",
            "eq"."avg_professionalism",
                CASE
                    WHEN ("eq"."quality_percentage" IS NULL) THEN NULL::numeric
                    WHEN ("ec"."compliance_percentage" IS NULL) THEN NULL::numeric
                    ELSE "round"(("eq"."quality_percentage" * ("ec"."compliance_percentage" / 100.0)), 2)
                END AS "evaluation_score",
                CASE
                    WHEN ("eq"."quality_percentage" IS NULL) THEN 'insufficient_feedback'::"text"
                    WHEN ("ec"."compliance_percentage" IS NULL) THEN 'compliance_pending'::"text"
                    ELSE 'scored'::"text"
                END AS "evaluation_status"
           FROM (("member_month_periods" "mp_1"
             LEFT JOIN "evaluation_compliance" "ec" ON ((("ec"."cycle_id" = "mp_1"."cycle_id") AND ("ec"."cycle_member_id" = "mp_1"."cycle_member_id") AND ("ec"."member_id" = "mp_1"."member_id") AND ("ec"."month_start" = "mp_1"."month_start") AND ("ec"."scoring_period_id" = "mp_1"."scoring_period_id"))))
             LEFT JOIN "evaluation_quality" "eq" ON ((("eq"."cycle_id" = "mp_1"."cycle_id") AND ("eq"."cycle_member_id" = "mp_1"."cycle_member_id") AND ("eq"."member_id" = "mp_1"."member_id") AND ("eq"."month_start" = "mp_1"."month_start") AND ("eq"."scoring_period_id" = "mp_1"."scoring_period_id"))))
        )
 SELECT "mp"."cycle_id",
    "mp"."cycle_name",
    "mp"."cycle_member_id",
    "mp"."member_id",
    "mp"."full_name",
    "mp"."member_effective_from",
    "mp"."member_effective_until",
    "mp"."enrollment_type",
    "mp"."cycle_member_status",
    "mp"."eligible_for_ranking",
    "mp"."month_start",
    "mp"."calendar_month_end",
    "mp"."effective_month_from",
    "mp"."effective_month_until",
    "mp"."snapshot_date",
    "mp"."scoring_period_id",
    "mp"."scoring_period_name",
    "mp"."period_from",
    "mp"."period_until",
    "mp"."period_activity_from",
    "mp"."period_cutoff",
    "mp"."attendance_weight",
    "mp"."quiz_weight",
    "mp"."report_weight",
    "mp"."evaluation_weight",
    COALESCE("am"."attendance_sessions", (0)::bigint) AS "attendance_sessions",
    COALESCE("am"."attendance_present", (0)::bigint) AS "attendance_present",
    COALESCE("am"."attendance_late", (0)::bigint) AS "attendance_late",
    COALESCE("am"."attendance_excused", (0)::bigint) AS "attendance_excused",
    COALESCE("am"."attendance_absent", (0)::bigint) AS "attendance_absent",
    "am"."attendance_score",
    COALESCE("qm"."quiz_assessments_counted", (0)::bigint) AS "quiz_assessments_counted",
    COALESCE("qm"."quiz_zero_scores", (0)::bigint) AS "quiz_zero_scores",
    "qm"."quiz_score",
    COALESCE("rm"."reports_required", (0)::bigint) AS "reports_required",
    COALESCE("rm"."reports_submitted", (0)::bigint) AS "reports_submitted",
    COALESCE("rm"."reports_on_time", (0)::bigint) AS "reports_on_time",
    COALESCE("rm"."reports_late", (0)::bigint) AS "reports_late",
    COALESCE("rm"."reports_missing", (0)::bigint) AS "reports_missing",
    COALESCE("rm"."report_points", (0)::bigint) AS "report_points",
    "rm"."report_score",
    "em"."evaluations_required_total",
    "em"."evaluations_pending",
    "em"."evaluations_due",
    "em"."evaluations_completed_on_time",
    "em"."evaluations_completed_late",
    "em"."evaluations_missed",
    "em"."compliance_percentage",
    "em"."evaluations_received",
    "em"."quality_percentage",
    "em"."avg_arrival",
    "em"."avg_fitness",
    "em"."avg_communication",
    "em"."avg_teamwork",
    "em"."avg_professionalism",
    "em"."evaluation_score",
    "em"."evaluation_status"
   FROM (((("member_month_periods" "mp"
     LEFT JOIN "attendance_monthly" "am" ON ((("am"."cycle_id" = "mp"."cycle_id") AND ("am"."cycle_member_id" = "mp"."cycle_member_id") AND ("am"."member_id" = "mp"."member_id") AND ("am"."month_start" = "mp"."month_start") AND ("am"."scoring_period_id" = "mp"."scoring_period_id"))))
     LEFT JOIN "quiz_monthly" "qm" ON ((("qm"."cycle_id" = "mp"."cycle_id") AND ("qm"."member_id" = "mp"."member_id") AND ("qm"."month_start" = "mp"."month_start") AND ("qm"."scoring_period_id" = "mp"."scoring_period_id"))))
     LEFT JOIN "report_monthly" "rm" ON ((("rm"."cycle_id" = "mp"."cycle_id") AND ("rm"."cycle_member_id" = "mp"."cycle_member_id") AND ("rm"."member_id" = "mp"."member_id") AND ("rm"."month_start" = "mp"."month_start") AND ("rm"."scoring_period_id" = "mp"."scoring_period_id"))))
     LEFT JOIN "evaluation_monthly" "em" ON ((("em"."cycle_id" = "mp"."cycle_id") AND ("em"."cycle_member_id" = "mp"."cycle_member_id") AND ("em"."member_id" = "mp"."member_id") AND ("em"."month_start" = "mp"."month_start") AND ("em"."scoring_period_id" = "mp"."scoring_period_id"))));


ALTER VIEW "development"."referee_monthly_period_metric_scores_v2" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."referee_monthly_development_score_v2" AS
 WITH "metric_availability" AS (
         SELECT "p"."cycle_id",
            "p"."cycle_name",
            "p"."cycle_member_id",
            "p"."member_id",
            "p"."full_name",
            "p"."member_effective_from",
            "p"."member_effective_until",
            "p"."enrollment_type",
            "p"."cycle_member_status",
            "p"."eligible_for_ranking",
            "p"."month_start",
            "p"."calendar_month_end",
            "p"."effective_month_from",
            "p"."effective_month_until",
            "p"."snapshot_date",
            "p"."scoring_period_id",
            "p"."scoring_period_name",
            "p"."period_from",
            "p"."period_until",
            "p"."period_activity_from",
            "p"."period_cutoff",
            "p"."attendance_weight",
            "p"."quiz_weight",
            "p"."report_weight",
            "p"."evaluation_weight",
            "p"."attendance_sessions",
            "p"."attendance_present",
            "p"."attendance_late",
            "p"."attendance_excused",
            "p"."attendance_absent",
            "p"."attendance_score",
            "p"."quiz_assessments_counted",
            "p"."quiz_zero_scores",
            "p"."quiz_score",
            "p"."reports_required",
            "p"."reports_submitted",
            "p"."reports_on_time",
            "p"."reports_late",
            "p"."reports_missing",
            "p"."report_points",
            "p"."report_score",
            "p"."evaluations_required_total",
            "p"."evaluations_pending",
            "p"."evaluations_due",
            "p"."evaluations_completed_on_time",
            "p"."evaluations_completed_late",
            "p"."evaluations_missed",
            "p"."compliance_percentage",
            "p"."evaluations_received",
            "p"."quality_percentage",
            "p"."avg_arrival",
            "p"."avg_fitness",
            "p"."avg_communication",
            "p"."avg_teamwork",
            "p"."avg_professionalism",
            "p"."evaluation_score",
            "p"."evaluation_status",
            (("p"."attendance_weight" > 0) AND ("p"."attendance_score" IS NOT NULL)) AS "attendance_applied",
            (("p"."quiz_weight" > 0) AND ("p"."quiz_score" IS NOT NULL)) AS "quiz_applied",
            (("p"."report_weight" > 0) AND ("p"."report_score" IS NOT NULL)) AS "report_applied",
            (("p"."evaluation_weight" > 0) AND ("p"."evaluation_score" IS NOT NULL)) AS "evaluation_applied"
           FROM "development"."referee_monthly_period_metric_scores_v2" "p"
        ), "period_scores" AS (
         SELECT "m"."cycle_id",
            "m"."cycle_name",
            "m"."cycle_member_id",
            "m"."member_id",
            "m"."full_name",
            "m"."member_effective_from",
            "m"."member_effective_until",
            "m"."enrollment_type",
            "m"."cycle_member_status",
            "m"."eligible_for_ranking",
            "m"."month_start",
            "m"."calendar_month_end",
            "m"."effective_month_from",
            "m"."effective_month_until",
            "m"."snapshot_date",
            "m"."scoring_period_id",
            "m"."scoring_period_name",
            "m"."period_from",
            "m"."period_until",
            "m"."period_activity_from",
            "m"."period_cutoff",
            "m"."attendance_weight",
            "m"."quiz_weight",
            "m"."report_weight",
            "m"."evaluation_weight",
            "m"."attendance_sessions",
            "m"."attendance_present",
            "m"."attendance_late",
            "m"."attendance_excused",
            "m"."attendance_absent",
            "m"."attendance_score",
            "m"."quiz_assessments_counted",
            "m"."quiz_zero_scores",
            "m"."quiz_score",
            "m"."reports_required",
            "m"."reports_submitted",
            "m"."reports_on_time",
            "m"."reports_late",
            "m"."reports_missing",
            "m"."report_points",
            "m"."report_score",
            "m"."evaluations_required_total",
            "m"."evaluations_pending",
            "m"."evaluations_due",
            "m"."evaluations_completed_on_time",
            "m"."evaluations_completed_late",
            "m"."evaluations_missed",
            "m"."compliance_percentage",
            "m"."evaluations_received",
            "m"."quality_percentage",
            "m"."avg_arrival",
            "m"."avg_fitness",
            "m"."avg_communication",
            "m"."avg_teamwork",
            "m"."avg_professionalism",
            "m"."evaluation_score",
            "m"."evaluation_status",
            "m"."attendance_applied",
            "m"."quiz_applied",
            "m"."report_applied",
            "m"."evaluation_applied",
            (((
                CASE
                    WHEN "m"."attendance_applied" THEN "m"."attendance_weight"
                    ELSE 0
                END +
                CASE
                    WHEN "m"."quiz_applied" THEN "m"."quiz_weight"
                    ELSE 0
                END) +
                CASE
                    WHEN "m"."report_applied" THEN "m"."report_weight"
                    ELSE 0
                END) +
                CASE
                    WHEN "m"."evaluation_applied" THEN "m"."evaluation_weight"
                    ELSE 0
                END) AS "applicable_weight",
            (((
                CASE
                    WHEN "m"."attendance_applied" THEN ("m"."attendance_score" * ("m"."attendance_weight")::numeric)
                    ELSE (0)::numeric
                END +
                CASE
                    WHEN "m"."quiz_applied" THEN ("m"."quiz_score" * ("m"."quiz_weight")::numeric)
                    ELSE (0)::numeric
                END) +
                CASE
                    WHEN "m"."report_applied" THEN ("m"."report_score" * ("m"."report_weight")::numeric)
                    ELSE (0)::numeric
                END) +
                CASE
                    WHEN "m"."evaluation_applied" THEN ("m"."evaluation_score" * ("m"."evaluation_weight")::numeric)
                    ELSE (0)::numeric
                END) AS "weighted_points"
           FROM "metric_availability" "m"
        ), "period_results" AS (
         SELECT "p"."cycle_id",
            "p"."cycle_name",
            "p"."cycle_member_id",
            "p"."member_id",
            "p"."full_name",
            "p"."member_effective_from",
            "p"."member_effective_until",
            "p"."enrollment_type",
            "p"."cycle_member_status",
            "p"."eligible_for_ranking",
            "p"."month_start",
            "p"."calendar_month_end",
            "p"."effective_month_from",
            "p"."effective_month_until",
            "p"."snapshot_date",
            "p"."scoring_period_id",
            "p"."scoring_period_name",
            "p"."period_from",
            "p"."period_until",
            "p"."period_activity_from",
            "p"."period_cutoff",
            "p"."attendance_weight",
            "p"."quiz_weight",
            "p"."report_weight",
            "p"."evaluation_weight",
            "p"."attendance_sessions",
            "p"."attendance_present",
            "p"."attendance_late",
            "p"."attendance_excused",
            "p"."attendance_absent",
            "p"."attendance_score",
            "p"."quiz_assessments_counted",
            "p"."quiz_zero_scores",
            "p"."quiz_score",
            "p"."reports_required",
            "p"."reports_submitted",
            "p"."reports_on_time",
            "p"."reports_late",
            "p"."reports_missing",
            "p"."report_points",
            "p"."report_score",
            "p"."evaluations_required_total",
            "p"."evaluations_pending",
            "p"."evaluations_due",
            "p"."evaluations_completed_on_time",
            "p"."evaluations_completed_late",
            "p"."evaluations_missed",
            "p"."compliance_percentage",
            "p"."evaluations_received",
            "p"."quality_percentage",
            "p"."avg_arrival",
            "p"."avg_fitness",
            "p"."avg_communication",
            "p"."avg_teamwork",
            "p"."avg_professionalism",
            "p"."evaluation_score",
            "p"."evaluation_status",
            "p"."attendance_applied",
            "p"."quiz_applied",
            "p"."report_applied",
            "p"."evaluation_applied",
            "p"."applicable_weight",
            "p"."weighted_points",
                CASE
                    WHEN ("p"."applicable_weight" = 0) THEN NULL::numeric
                    ELSE "round"(("p"."weighted_points" / ("p"."applicable_weight")::numeric), 2)
                END AS "period_snapshot_score"
           FROM "period_scores" "p"
        ), "monthly_aggregated" AS (
         SELECT "period_results"."cycle_id",
            "period_results"."cycle_name",
            "period_results"."cycle_member_id",
            "period_results"."member_id",
            "period_results"."full_name",
            "period_results"."member_effective_from",
            "period_results"."member_effective_until",
            "period_results"."enrollment_type",
            "period_results"."cycle_member_status",
            "period_results"."eligible_for_ranking",
            "period_results"."month_start",
            "period_results"."calendar_month_end",
            "period_results"."effective_month_from",
            "period_results"."effective_month_until",
            "period_results"."snapshot_date",
            "count"(*) FILTER (WHERE (("period_results"."period_snapshot_score" IS NOT NULL) AND ("period_results"."applicable_weight" > 0))) AS "scoring_periods_contributing",
            "sum"(
                CASE
                    WHEN (("period_results"."period_snapshot_score" IS NOT NULL) AND ("period_results"."applicable_weight" > 0)) THEN "period_results"."applicable_weight"
                    ELSE 0
                END) AS "monthly_applicable_weight",
            "sum"(
                CASE
                    WHEN (("period_results"."period_snapshot_score" IS NOT NULL) AND ("period_results"."applicable_weight" > 0)) THEN ("period_results"."period_snapshot_score" * ("period_results"."applicable_weight")::numeric)
                    ELSE (0)::numeric
                END) AS "monthly_weighted_points",
            "sum"("period_results"."attendance_sessions") AS "attendance_sessions",
            "sum"("period_results"."quiz_assessments_counted") AS "quiz_assessments_counted",
            "sum"("period_results"."reports_required") AS "reports_required",
            "sum"("period_results"."reports_submitted") AS "reports_submitted",
            "sum"("period_results"."reports_on_time") AS "reports_on_time",
            "sum"("period_results"."reports_missing") AS "reports_missing",
            "sum"("period_results"."evaluations_due") AS "evaluations_due",
            "sum"("period_results"."evaluations_received") AS "evaluations_received"
           FROM "period_results"
          GROUP BY "period_results"."cycle_id", "period_results"."cycle_name", "period_results"."cycle_member_id", "period_results"."member_id", "period_results"."full_name", "period_results"."member_effective_from", "period_results"."member_effective_until", "period_results"."enrollment_type", "period_results"."cycle_member_status", "period_results"."eligible_for_ranking", "period_results"."month_start", "period_results"."calendar_month_end", "period_results"."effective_month_from", "period_results"."effective_month_until", "period_results"."snapshot_date"
        )
 SELECT "cycle_id",
    "cycle_name",
    "cycle_member_id",
    "member_id",
    "full_name",
    "member_effective_from",
    "member_effective_until",
    "enrollment_type",
    "cycle_member_status",
    "eligible_for_ranking",
    "month_start",
    "calendar_month_end",
    "effective_month_from",
    "effective_month_until",
    "snapshot_date",
    "scoring_periods_contributing",
    "monthly_applicable_weight",
    "attendance_sessions",
    "quiz_assessments_counted",
    "reports_required",
    "reports_submitted",
    "reports_on_time",
    "reports_missing",
    "evaluations_due",
    "evaluations_received",
        CASE
            WHEN ("monthly_applicable_weight" = 0) THEN NULL::numeric
            ELSE "round"(("monthly_weighted_points" / ("monthly_applicable_weight")::numeric), 2)
        END AS "monthly_development_score"
   FROM "monthly_aggregated";


ALTER VIEW "development"."referee_monthly_development_score_v2" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."referee_monthly_ranking_evidence_v2" AS
 WITH "base" AS (
         SELECT "d"."cycle_id",
            "d"."cycle_name",
            "d"."cycle_member_id",
            "d"."member_id",
            "d"."full_name",
            "d"."member_effective_from",
            "d"."member_effective_until",
            "d"."enrollment_type",
            "d"."cycle_member_status",
            "d"."eligible_for_ranking",
            "d"."month_start",
            "d"."calendar_month_end",
            "d"."effective_month_from",
            "d"."effective_month_until",
            "d"."snapshot_date",
            "d"."scoring_period_id",
            "d"."scoring_period_name",
            "d"."period_from",
            "d"."period_until",
            "d"."period_activity_from",
            "d"."period_cutoff",
            "d"."attendance_weight",
            "d"."quiz_weight",
            "d"."report_weight",
            "d"."evaluation_weight",
            "d"."attendance_sessions",
            "d"."attendance_present",
            "d"."attendance_late",
            "d"."attendance_excused",
            "d"."attendance_absent",
            "d"."attendance_score",
            "d"."quiz_assessments_counted",
            "d"."quiz_zero_scores",
            "d"."quiz_score",
            "d"."reports_required",
            "d"."reports_submitted",
            "d"."reports_on_time",
            "d"."reports_late",
            "d"."reports_missing",
            "d"."report_points",
            "d"."report_score",
            "d"."evaluations_required_total",
            "d"."evaluations_pending",
            "d"."evaluations_due",
            "d"."evaluations_completed_on_time",
            "d"."evaluations_completed_late",
            "d"."evaluations_missed",
            "d"."compliance_percentage",
            "d"."evaluations_received",
            "d"."quality_percentage",
            "d"."avg_arrival",
            "d"."avg_fitness",
            "d"."avg_communication",
            "d"."avg_teamwork",
            "d"."avg_professionalism",
            "d"."evaluation_score",
            "d"."evaluation_status",
            (((COALESCE("d"."attendance_present", (0)::bigint) + COALESCE("d"."attendance_late", (0)::bigint)) + COALESCE("d"."attendance_excused", (0)::bigint)))::numeric AS "attendance_evidence_count",
            (("d"."attendance_weight" > 0) AND ("d"."attendance_sessions" > 0)) AS "attendance_available",
            (("d"."quiz_weight" > 0) AND (EXISTS ( SELECT 1
                   FROM "development"."quiz_assessments" "qa"
                  WHERE (("qa"."cycle_id" = "d"."cycle_id") AND ("qa"."required" = true) AND ("qa"."counts_for_score" = true) AND ("qa"."open_from" IS NOT NULL) AND ((("qa"."open_from" AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" >= "d"."period_activity_from") AND ((("qa"."open_from" AT TIME ZONE 'America/Los_Angeles'::"text"))::"date" <= "d"."period_cutoff"))))) AS "quiz_available",
            (("d"."report_weight" > 0) AND ("d"."reports_required" > 0)) AS "report_available",
            (("d"."evaluation_weight" > 0) AND (("d"."evaluations_required_total" > 0) OR ("d"."evaluations_received" > 0))) AS "evaluation_available"
           FROM "development"."referee_monthly_period_metric_scores_v2" "d"
        ), "minimums" AS (
         SELECT "b"."cycle_id",
            "b"."cycle_name",
            "b"."cycle_member_id",
            "b"."member_id",
            "b"."full_name",
            "b"."member_effective_from",
            "b"."member_effective_until",
            "b"."enrollment_type",
            "b"."cycle_member_status",
            "b"."eligible_for_ranking",
            "b"."month_start",
            "b"."calendar_month_end",
            "b"."effective_month_from",
            "b"."effective_month_until",
            "b"."snapshot_date",
            "b"."scoring_period_id",
            "b"."scoring_period_name",
            "b"."period_from",
            "b"."period_until",
            "b"."period_activity_from",
            "b"."period_cutoff",
            "b"."attendance_weight",
            "b"."quiz_weight",
            "b"."report_weight",
            "b"."evaluation_weight",
            "b"."attendance_sessions",
            "b"."attendance_present",
            "b"."attendance_late",
            "b"."attendance_excused",
            "b"."attendance_absent",
            "b"."attendance_score",
            "b"."quiz_assessments_counted",
            "b"."quiz_zero_scores",
            "b"."quiz_score",
            "b"."reports_required",
            "b"."reports_submitted",
            "b"."reports_on_time",
            "b"."reports_late",
            "b"."reports_missing",
            "b"."report_points",
            "b"."report_score",
            "b"."evaluations_required_total",
            "b"."evaluations_pending",
            "b"."evaluations_due",
            "b"."evaluations_completed_on_time",
            "b"."evaluations_completed_late",
            "b"."evaluations_missed",
            "b"."compliance_percentage",
            "b"."evaluations_received",
            "b"."quality_percentage",
            "b"."avg_arrival",
            "b"."avg_fitness",
            "b"."avg_communication",
            "b"."avg_teamwork",
            "b"."avg_professionalism",
            "b"."evaluation_score",
            "b"."evaluation_status",
            "b"."attendance_evidence_count",
            "b"."attendance_available",
            "b"."quiz_available",
            "b"."report_available",
            "b"."evaluation_available",
            (("b"."attendance_available" = false) OR ("b"."attendance_evidence_count" >= (5)::numeric)) AS "attendance_minimum_met",
            (("b"."quiz_available" = false) OR ("b"."quiz_assessments_counted" >= 1)) AS "quiz_minimum_met",
            (("b"."report_available" = false) OR ("b"."reports_required" >= 1)) AS "report_minimum_met",
            (("b"."evaluation_available" = false) OR (("b"."evaluations_due" >= 1) AND ("b"."evaluations_received" >= 1))) AS "evaluation_minimum_met"
           FROM "base" "b"
        ), "benchmarks" AS (
         SELECT "minimums"."cycle_id",
            "minimums"."month_start",
            "minimums"."scoring_period_id",
            "percentile_cont"((0.90)::double precision) WITHIN GROUP (ORDER BY (("minimums"."attendance_evidence_count")::double precision)) AS "attendance_benchmark",
            "percentile_cont"((0.90)::double precision) WITHIN GROUP (ORDER BY (("minimums"."quiz_assessments_counted")::double precision)) AS "quiz_benchmark",
            "percentile_cont"((0.90)::double precision) WITHIN GROUP (ORDER BY (("minimums"."reports_required")::double precision)) AS "report_benchmark",
            "percentile_cont"((0.90)::double precision) WITHIN GROUP (ORDER BY (("minimums"."evaluations_due")::double precision)) AS "evaluation_due_benchmark",
            "percentile_cont"((0.90)::double precision) WITHIN GROUP (ORDER BY (("minimums"."evaluations_received")::double precision)) AS "evaluation_received_benchmark"
           FROM "minimums"
          WHERE ("minimums"."eligible_for_ranking" = true)
          GROUP BY "minimums"."cycle_id", "minimums"."month_start", "minimums"."scoring_period_id"
        ), "participation" AS (
         SELECT "b"."cycle_id",
            "b"."cycle_name",
            "b"."cycle_member_id",
            "b"."member_id",
            "b"."full_name",
            "b"."member_effective_from",
            "b"."member_effective_until",
            "b"."enrollment_type",
            "b"."cycle_member_status",
            "b"."eligible_for_ranking",
            "b"."month_start",
            "b"."calendar_month_end",
            "b"."effective_month_from",
            "b"."effective_month_until",
            "b"."snapshot_date",
            "b"."scoring_period_id",
            "b"."scoring_period_name",
            "b"."period_from",
            "b"."period_until",
            "b"."period_activity_from",
            "b"."period_cutoff",
            "b"."attendance_weight",
            "b"."quiz_weight",
            "b"."report_weight",
            "b"."evaluation_weight",
            "b"."attendance_sessions",
            "b"."attendance_present",
            "b"."attendance_late",
            "b"."attendance_excused",
            "b"."attendance_absent",
            "b"."attendance_score",
            "b"."quiz_assessments_counted",
            "b"."quiz_zero_scores",
            "b"."quiz_score",
            "b"."reports_required",
            "b"."reports_submitted",
            "b"."reports_on_time",
            "b"."reports_late",
            "b"."reports_missing",
            "b"."report_points",
            "b"."report_score",
            "b"."evaluations_required_total",
            "b"."evaluations_pending",
            "b"."evaluations_due",
            "b"."evaluations_completed_on_time",
            "b"."evaluations_completed_late",
            "b"."evaluations_missed",
            "b"."compliance_percentage",
            "b"."evaluations_received",
            "b"."quality_percentage",
            "b"."avg_arrival",
            "b"."avg_fitness",
            "b"."avg_communication",
            "b"."avg_teamwork",
            "b"."avg_professionalism",
            "b"."evaluation_score",
            "b"."evaluation_status",
            "b"."attendance_evidence_count",
            "b"."attendance_available",
            "b"."quiz_available",
            "b"."report_available",
            "b"."evaluation_available",
            "b"."attendance_minimum_met",
            "b"."quiz_minimum_met",
            "b"."report_minimum_met",
            "b"."evaluation_minimum_met",
            "bm"."attendance_benchmark",
            "bm"."quiz_benchmark",
            "bm"."report_benchmark",
            "bm"."evaluation_due_benchmark",
            "bm"."evaluation_received_benchmark",
                CASE
                    WHEN ("b"."attendance_available" = false) THEN NULL::numeric
                    WHEN ("b"."attendance_evidence_count" < (5)::numeric) THEN (0)::numeric
                    WHEN ("bm"."attendance_benchmark" <= (5)::double precision) THEN (1)::numeric
                    ELSE LEAST((1)::numeric, GREATEST((0)::numeric, (0.25 + (0.75 * (("b"."attendance_evidence_count" - (5)::numeric) / NULLIF((("bm"."attendance_benchmark")::numeric - (5)::numeric), (0)::numeric))))))
                END AS "attendance_evidence",
                CASE
                    WHEN ("b"."quiz_available" = false) THEN NULL::numeric
                    WHEN ("b"."quiz_assessments_counted" < 1) THEN (0)::numeric
                    WHEN ("bm"."quiz_benchmark" < (1)::double precision) THEN (0)::numeric
                    WHEN ("bm"."quiz_benchmark" <= (1)::double precision) THEN (1)::numeric
                    ELSE LEAST((1)::numeric, GREATEST((0)::numeric, (0.25 + (0.75 * ((("b"."quiz_assessments_counted")::numeric - (1)::numeric) / NULLIF((("bm"."quiz_benchmark")::numeric - (1)::numeric), (0)::numeric))))))
                END AS "quiz_evidence",
                CASE
                    WHEN ("b"."report_available" = false) THEN NULL::numeric
                    WHEN ("b"."reports_required" < 1) THEN (0)::numeric
                    WHEN ("bm"."report_benchmark" < (1)::double precision) THEN (0)::numeric
                    WHEN ("bm"."report_benchmark" <= (1)::double precision) THEN (1)::numeric
                    ELSE LEAST((1)::numeric, GREATEST((0)::numeric, (0.25 + (0.75 * ((("b"."reports_required")::numeric - (1)::numeric) / NULLIF((("bm"."report_benchmark")::numeric - (1)::numeric), (0)::numeric))))))
                END AS "report_evidence",
                CASE
                    WHEN ("b"."evaluation_available" = false) THEN NULL::numeric
                    WHEN (("b"."evaluations_due" < 1) OR ("b"."evaluations_received" < 1)) THEN (0)::numeric
                    WHEN (("bm"."evaluation_due_benchmark" < (1)::double precision) OR ("bm"."evaluation_received_benchmark" < (1)::double precision)) THEN (0)::numeric
                    ELSE LEAST(
                    CASE
                        WHEN ("bm"."evaluation_due_benchmark" <= (1)::double precision) THEN (1)::numeric
                        ELSE LEAST((1)::numeric, GREATEST((0)::numeric, (0.25 + (0.75 * ((("b"."evaluations_due")::numeric - (1)::numeric) / NULLIF((("bm"."evaluation_due_benchmark")::numeric - (1)::numeric), (0)::numeric))))))
                    END,
                    CASE
                        WHEN ("bm"."evaluation_received_benchmark" <= (1)::double precision) THEN (1)::numeric
                        ELSE LEAST((1)::numeric, GREATEST((0)::numeric, (0.25 + (0.75 * ((("b"."evaluations_received")::numeric - (1)::numeric) / NULLIF((("bm"."evaluation_received_benchmark")::numeric - (1)::numeric), (0)::numeric))))))
                    END)
                END AS "evaluation_evidence"
           FROM ("minimums" "b"
             JOIN "benchmarks" "bm" ON ((("bm"."cycle_id" = "b"."cycle_id") AND ("bm"."month_start" = "b"."month_start") AND ("bm"."scoring_period_id" = "b"."scoring_period_id"))))
        ), "period_evidence" AS (
         SELECT "p"."cycle_id",
            "p"."cycle_name",
            "p"."cycle_member_id",
            "p"."member_id",
            "p"."full_name",
            "p"."member_effective_from",
            "p"."member_effective_until",
            "p"."enrollment_type",
            "p"."cycle_member_status",
            "p"."eligible_for_ranking",
            "p"."month_start",
            "p"."calendar_month_end",
            "p"."effective_month_from",
            "p"."effective_month_until",
            "p"."snapshot_date",
            "p"."scoring_period_id",
            "p"."scoring_period_name",
            "p"."period_from",
            "p"."period_until",
            "p"."period_activity_from",
            "p"."period_cutoff",
            "p"."attendance_weight",
            "p"."quiz_weight",
            "p"."report_weight",
            "p"."evaluation_weight",
            "p"."attendance_sessions",
            "p"."attendance_present",
            "p"."attendance_late",
            "p"."attendance_excused",
            "p"."attendance_absent",
            "p"."attendance_score",
            "p"."quiz_assessments_counted",
            "p"."quiz_zero_scores",
            "p"."quiz_score",
            "p"."reports_required",
            "p"."reports_submitted",
            "p"."reports_on_time",
            "p"."reports_late",
            "p"."reports_missing",
            "p"."report_points",
            "p"."report_score",
            "p"."evaluations_required_total",
            "p"."evaluations_pending",
            "p"."evaluations_due",
            "p"."evaluations_completed_on_time",
            "p"."evaluations_completed_late",
            "p"."evaluations_missed",
            "p"."compliance_percentage",
            "p"."evaluations_received",
            "p"."quality_percentage",
            "p"."avg_arrival",
            "p"."avg_fitness",
            "p"."avg_communication",
            "p"."avg_teamwork",
            "p"."avg_professionalism",
            "p"."evaluation_score",
            "p"."evaluation_status",
            "p"."attendance_evidence_count",
            "p"."attendance_available",
            "p"."quiz_available",
            "p"."report_available",
            "p"."evaluation_available",
            "p"."attendance_minimum_met",
            "p"."quiz_minimum_met",
            "p"."report_minimum_met",
            "p"."evaluation_minimum_met",
            "p"."attendance_benchmark",
            "p"."quiz_benchmark",
            "p"."report_benchmark",
            "p"."evaluation_due_benchmark",
            "p"."evaluation_received_benchmark",
            "p"."attendance_evidence",
            "p"."quiz_evidence",
            "p"."report_evidence",
            "p"."evaluation_evidence",
            (((
                CASE
                    WHEN "p"."attendance_available" THEN "p"."attendance_weight"
                    ELSE 0
                END +
                CASE
                    WHEN "p"."quiz_available" THEN "p"."quiz_weight"
                    ELSE 0
                END) +
                CASE
                    WHEN "p"."report_available" THEN "p"."report_weight"
                    ELSE 0
                END) +
                CASE
                    WHEN "p"."evaluation_available" THEN "p"."evaluation_weight"
                    ELSE 0
                END) AS "evidence_weight",
            (((
                CASE
                    WHEN "p"."attendance_available" THEN ("p"."attendance_evidence" * ("p"."attendance_weight")::numeric)
                    ELSE (0)::numeric
                END +
                CASE
                    WHEN "p"."quiz_available" THEN ("p"."quiz_evidence" * ("p"."quiz_weight")::numeric)
                    ELSE (0)::numeric
                END) +
                CASE
                    WHEN "p"."report_available" THEN ("p"."report_evidence" * ("p"."report_weight")::numeric)
                    ELSE (0)::numeric
                END) +
                CASE
                    WHEN "p"."evaluation_available" THEN ("p"."evaluation_evidence" * ("p"."evaluation_weight")::numeric)
                    ELSE (0)::numeric
                END) AS "evidence_points"
           FROM "participation" "p"
        ), "period_calculation" AS (
         SELECT "p"."cycle_id",
            "p"."cycle_name",
            "p"."cycle_member_id",
            "p"."member_id",
            "p"."full_name",
            "p"."member_effective_from",
            "p"."member_effective_until",
            "p"."enrollment_type",
            "p"."cycle_member_status",
            "p"."eligible_for_ranking",
            "p"."month_start",
            "p"."calendar_month_end",
            "p"."effective_month_from",
            "p"."effective_month_until",
            "p"."snapshot_date",
            "p"."scoring_period_id",
            "p"."scoring_period_name",
            "p"."period_from",
            "p"."period_until",
            "p"."period_activity_from",
            "p"."period_cutoff",
            "p"."attendance_weight",
            "p"."quiz_weight",
            "p"."report_weight",
            "p"."evaluation_weight",
            "p"."attendance_sessions",
            "p"."attendance_present",
            "p"."attendance_late",
            "p"."attendance_excused",
            "p"."attendance_absent",
            "p"."attendance_score",
            "p"."quiz_assessments_counted",
            "p"."quiz_zero_scores",
            "p"."quiz_score",
            "p"."reports_required",
            "p"."reports_submitted",
            "p"."reports_on_time",
            "p"."reports_late",
            "p"."reports_missing",
            "p"."report_points",
            "p"."report_score",
            "p"."evaluations_required_total",
            "p"."evaluations_pending",
            "p"."evaluations_due",
            "p"."evaluations_completed_on_time",
            "p"."evaluations_completed_late",
            "p"."evaluations_missed",
            "p"."compliance_percentage",
            "p"."evaluations_received",
            "p"."quality_percentage",
            "p"."avg_arrival",
            "p"."avg_fitness",
            "p"."avg_communication",
            "p"."avg_teamwork",
            "p"."avg_professionalism",
            "p"."evaluation_score",
            "p"."evaluation_status",
            "p"."attendance_evidence_count",
            "p"."attendance_available",
            "p"."quiz_available",
            "p"."report_available",
            "p"."evaluation_available",
            "p"."attendance_minimum_met",
            "p"."quiz_minimum_met",
            "p"."report_minimum_met",
            "p"."evaluation_minimum_met",
            "p"."attendance_benchmark",
            "p"."quiz_benchmark",
            "p"."report_benchmark",
            "p"."evaluation_due_benchmark",
            "p"."evaluation_received_benchmark",
            "p"."attendance_evidence",
            "p"."quiz_evidence",
            "p"."report_evidence",
            "p"."evaluation_evidence",
            "p"."evidence_weight",
            "p"."evidence_points",
                CASE
                    WHEN ("p"."evidence_weight" = 0) THEN NULL::numeric
                    ELSE "round"(("p"."evidence_points" / ("p"."evidence_weight")::numeric), 4)
                END AS "period_evidence_index"
           FROM "period_evidence" "p"
        ), "monthly" AS (
         SELECT "period_calculation"."cycle_id",
            "period_calculation"."cycle_name",
            "period_calculation"."cycle_member_id",
            "period_calculation"."member_id",
            "period_calculation"."full_name",
            "period_calculation"."enrollment_type",
            "period_calculation"."cycle_member_status",
            "period_calculation"."eligible_for_ranking",
            "period_calculation"."month_start",
            "period_calculation"."calendar_month_end",
            "period_calculation"."effective_month_from",
            "period_calculation"."effective_month_until",
            "period_calculation"."snapshot_date",
            "sum"("period_calculation"."evidence_weight") AS "monthly_evidence_weight",
            ("sum"(
                CASE
                    WHEN ("period_calculation"."period_evidence_index" IS NOT NULL) THEN ("period_calculation"."period_evidence_index" * ("period_calculation"."evidence_weight")::numeric)
                    ELSE (0)::numeric
                END) / (NULLIF("sum"("period_calculation"."evidence_weight"), 0))::numeric) AS "monthly_evidence_index",
            "sum"("period_calculation"."attendance_evidence_count") AS "attendance_evidence_count",
            "sum"("period_calculation"."quiz_assessments_counted") AS "quiz_assessments_counted",
            "sum"("period_calculation"."reports_required") AS "reports_required",
            "sum"("period_calculation"."evaluations_due") AS "evaluations_due",
            "sum"("period_calculation"."evaluations_received") AS "evaluations_received",
            "bool_or"("period_calculation"."attendance_available") AS "attendance_available",
            "bool_or"("period_calculation"."quiz_available") AS "quiz_available",
            "bool_or"("period_calculation"."report_available") AS "report_available",
            "bool_or"("period_calculation"."evaluation_available") AS "evaluation_available",
            "bool_or"(("period_calculation"."attendance_available" AND "period_calculation"."attendance_minimum_met")) AS "attendance_minimum_reached",
            "bool_or"(("period_calculation"."quiz_available" AND "period_calculation"."quiz_minimum_met")) AS "quiz_minimum_reached",
            "bool_or"(("period_calculation"."report_available" AND "period_calculation"."report_minimum_met")) AS "report_minimum_reached",
            "bool_or"(("period_calculation"."evaluation_available" AND "period_calculation"."evaluation_minimum_met")) AS "evaluation_minimum_reached"
           FROM "period_calculation"
          GROUP BY "period_calculation"."cycle_id", "period_calculation"."cycle_name", "period_calculation"."cycle_member_id", "period_calculation"."member_id", "period_calculation"."full_name", "period_calculation"."enrollment_type", "period_calculation"."cycle_member_status", "period_calculation"."eligible_for_ranking", "period_calculation"."month_start", "period_calculation"."calendar_month_end", "period_calculation"."effective_month_from", "period_calculation"."effective_month_until", "period_calculation"."snapshot_date"
        ), "final" AS (
         SELECT "m"."cycle_id",
            "m"."cycle_name",
            "m"."cycle_member_id",
            "m"."member_id",
            "m"."full_name",
            "m"."enrollment_type",
            "m"."cycle_member_status",
            "m"."eligible_for_ranking",
            "m"."month_start",
            "m"."calendar_month_end",
            "m"."effective_month_from",
            "m"."effective_month_until",
            "m"."snapshot_date",
            "m"."monthly_evidence_weight",
            "m"."monthly_evidence_index",
            "m"."attendance_evidence_count",
            "m"."quiz_assessments_counted",
            "m"."reports_required",
            "m"."evaluations_due",
            "m"."evaluations_received",
            "m"."attendance_available",
            "m"."quiz_available",
            "m"."report_available",
            "m"."evaluation_available",
            "m"."attendance_minimum_reached",
            "m"."quiz_minimum_reached",
            "m"."report_minimum_reached",
            "m"."evaluation_minimum_reached",
            "d"."monthly_development_score",
            "round"(("m"."monthly_evidence_index" * (100)::numeric), 2) AS "monthly_evidence_percentage",
                CASE
                    WHEN ("m"."monthly_evidence_index" IS NULL) THEN NULL::numeric
                    ELSE "round"(((0.60 + ("m"."monthly_evidence_index" * 0.40)) * (100)::numeric), 2)
                END AS "monthly_evidence_factor_percentage",
            (("m"."eligible_for_ranking" = true) AND ("d"."monthly_development_score" IS NOT NULL) AND (("m"."attendance_available" = false) OR ("m"."attendance_minimum_reached" = true)) AND (("m"."quiz_available" = false) OR ("m"."quiz_minimum_reached" = true)) AND (("m"."report_available" = false) OR ("m"."report_minimum_reached" = true)) AND (("m"."evaluation_available" = false) OR ("m"."evaluation_minimum_reached" = true))) AS "monthly_ranking_eligible"
           FROM ("monthly" "m"
             JOIN "development"."referee_monthly_development_score_v2" "d" ON ((("d"."cycle_id" = "m"."cycle_id") AND ("d"."cycle_member_id" = "m"."cycle_member_id") AND ("d"."member_id" = "m"."member_id") AND ("d"."month_start" = "m"."month_start"))))
        )
 SELECT "cycle_id",
    "cycle_name",
    "cycle_member_id",
    "member_id",
    "full_name",
    "enrollment_type",
    "cycle_member_status",
    "eligible_for_ranking",
    "month_start",
    "calendar_month_end",
    "effective_month_from",
    "effective_month_until",
    "snapshot_date",
    "monthly_development_score",
    "monthly_evidence_weight",
    "monthly_evidence_percentage",
    "monthly_evidence_factor_percentage",
    "attendance_evidence_count",
    "quiz_assessments_counted",
    "reports_required",
    "evaluations_due",
    "evaluations_received",
    "attendance_available",
    "quiz_available",
    "report_available",
    "evaluation_available",
    "attendance_minimum_reached",
    "quiz_minimum_reached",
    "report_minimum_reached",
    "evaluation_minimum_reached",
    "monthly_ranking_eligible",
        CASE
            WHEN ("monthly_ranking_eligible" = false) THEN NULL::numeric
            WHEN ("monthly_evidence_factor_percentage" IS NULL) THEN NULL::numeric
            ELSE "round"(("monthly_development_score" * ("monthly_evidence_factor_percentage" / (100)::numeric)), 2)
        END AS "monthly_ranking_score",
        CASE
            WHEN ("eligible_for_ranking" = false) THEN 'not_eligible'::"text"
            WHEN ("attendance_available" AND (NOT "attendance_minimum_reached")) THEN 'needs_attendance'::"text"
            WHEN ("quiz_available" AND (NOT "quiz_minimum_reached")) THEN 'needs_quiz'::"text"
            WHEN ("report_available" AND (NOT "report_minimum_reached")) THEN 'needs_report'::"text"
            WHEN ("evaluation_available" AND (NOT "evaluation_minimum_reached")) THEN 'needs_evaluation'::"text"
            WHEN ("monthly_development_score" IS NULL) THEN 'insufficient_performance_data'::"text"
            WHEN ("monthly_evidence_percentage" < (25)::numeric) THEN 'limited_evidence'::"text"
            WHEN ("monthly_evidence_percentage" < (60)::numeric) THEN 'developing_evidence'::"text"
            WHEN ("monthly_evidence_percentage" < (90)::numeric) THEN 'strong_evidence'::"text"
            ELSE 'mature_evidence'::"text"
        END AS "monthly_evidence_status"
   FROM "final";


ALTER VIEW "development"."referee_monthly_ranking_evidence_v2" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."referee_monthly_ranking_history_v2" AS
 WITH "eligible_ranked" AS (
         SELECT "r_1"."cycle_id",
            "r_1"."month_start",
            "r_1"."member_id",
            "rank"() OVER (PARTITION BY "r_1"."cycle_id", "r_1"."month_start" ORDER BY "r_1"."monthly_ranking_score" DESC) AS "ranking_position",
            "count"(*) OVER (PARTITION BY "r_1"."cycle_id", "r_1"."month_start") AS "eligible_referees",
            "percent_rank"() OVER (PARTITION BY "r_1"."cycle_id", "r_1"."month_start" ORDER BY "r_1"."monthly_ranking_score" DESC) AS "raw_percent_rank"
           FROM "development"."referee_monthly_ranking_evidence_v2" "r_1"
          WHERE (("r_1"."monthly_ranking_eligible" = true) AND ("r_1"."monthly_ranking_score" IS NOT NULL))
        )
 SELECT "r"."cycle_id",
    "r"."cycle_name",
    "r"."cycle_member_id",
    "r"."member_id",
    "r"."full_name",
    "r"."enrollment_type",
    "r"."cycle_member_status",
    "r"."eligible_for_ranking",
    "r"."month_start",
    "r"."calendar_month_end",
    "r"."effective_month_from",
    "r"."effective_month_until",
    "r"."snapshot_date",
    "r"."monthly_development_score",
    "r"."monthly_evidence_percentage",
    "r"."monthly_evidence_factor_percentage",
    "r"."attendance_evidence_count",
    "r"."quiz_assessments_counted",
    "r"."reports_required",
    "r"."evaluations_due",
    "r"."evaluations_received",
    "r"."attendance_available",
    "r"."quiz_available",
    "r"."report_available",
    "r"."evaluation_available",
    "r"."attendance_minimum_reached",
    "r"."quiz_minimum_reached",
    "r"."report_minimum_reached",
    "r"."evaluation_minimum_reached",
    "r"."monthly_ranking_eligible",
    "r"."monthly_evidence_status",
    "r"."monthly_ranking_score",
    "er"."eligible_referees",
    "er"."ranking_position",
        CASE
            WHEN ("er"."ranking_position" IS NULL) THEN NULL::numeric
            WHEN ("er"."eligible_referees" <= 1) THEN (100)::numeric
            ELSE "round"((((1)::numeric - ("er"."raw_percent_rank")::numeric) * (100)::numeric), 2)
        END AS "ranking_percentile"
   FROM ("development"."referee_monthly_ranking_evidence_v2" "r"
     LEFT JOIN "eligible_ranked" "er" ON ((("er"."cycle_id" = "r"."cycle_id") AND ("er"."month_start" = "r"."month_start") AND ("er"."member_id" = "r"."member_id"))));


ALTER VIEW "development"."referee_monthly_ranking_history_v2" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."referee_current_ranking_v2" AS
 WITH "latest_snapshot" AS (
         SELECT "referee_monthly_ranking_history_v2"."cycle_id",
            "max"("referee_monthly_ranking_history_v2"."snapshot_date") AS "snapshot_date"
           FROM "development"."referee_monthly_ranking_history_v2"
          GROUP BY "referee_monthly_ranking_history_v2"."cycle_id"
        )
 SELECT "h"."cycle_id",
    "h"."cycle_name",
    "h"."cycle_member_id",
    "h"."member_id",
    "h"."full_name",
    "h"."enrollment_type",
    "h"."cycle_member_status",
    "h"."eligible_for_ranking",
    "h"."month_start",
    "h"."snapshot_date",
    "h"."monthly_development_score" AS "development_score",
    "h"."monthly_evidence_percentage" AS "evidence_percentage",
    "h"."monthly_evidence_factor_percentage" AS "evidence_factor_percentage",
    "h"."monthly_ranking_score" AS "ranking_score",
    "h"."ranking_position",
    "h"."ranking_percentile",
    "h"."eligible_referees",
    "h"."monthly_ranking_eligible" AS "ranking_eligible",
    "h"."monthly_evidence_status" AS "evidence_status",
    "h"."attendance_evidence_count",
    "h"."quiz_assessments_counted",
    "h"."reports_required",
    "h"."evaluations_due",
    "h"."evaluations_received",
    "h"."attendance_available",
    "h"."quiz_available",
    "h"."report_available",
    "h"."evaluation_available",
    "h"."attendance_minimum_reached",
    "h"."quiz_minimum_reached",
    "h"."report_minimum_reached",
    "h"."evaluation_minimum_reached"
   FROM ("development"."referee_monthly_ranking_history_v2" "h"
     JOIN "latest_snapshot" "ls" ON ((("ls"."cycle_id" = "h"."cycle_id") AND ("ls"."snapshot_date" = "h"."snapshot_date"))));


ALTER VIEW "development"."referee_current_ranking_v2" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."referee_evaluation_score" AS
 WITH "members_in_cycle" AS (
         SELECT "cm"."id" AS "cycle_member_id",
            "cm"."cycle_id",
            "c_1"."name" AS "cycle_name",
            "c_1"."status" AS "cycle_status",
            "cm"."member_id",
            "m"."full_name",
            "cm"."effective_from",
            "cm"."effective_until",
            "cm"."enrollment_type",
            "cm"."status" AS "cycle_member_status",
            "cm"."eligible_for_ranking"
           FROM (("development"."cycle_members" "cm"
             JOIN "development"."cycles" "c_1" ON (("c_1"."id" = "cm"."cycle_id")))
             JOIN "public"."members" "m" ON (("m"."id" = "cm"."member_id")))
          WHERE (("cm"."status" = ANY (ARRAY['active'::"development"."cycle_member_status", 'withdrawn'::"development"."cycle_member_status"])) AND ("cm"."eligible_for_ranking" = true))
        ), "compliance" AS (
         SELECT "referee_evaluation_detail"."cycle_id",
            "referee_evaluation_detail"."evaluator_id" AS "member_id",
            "count"(*) AS "evaluations_required_total",
            "count"(*) FILTER (WHERE ("referee_evaluation_detail"."obligation_status" = 'pending'::"text")) AS "evaluations_pending",
            "count"(*) FILTER (WHERE ("referee_evaluation_detail"."obligation_status" <> 'pending'::"text")) AS "evaluations_due",
            "count"(*) FILTER (WHERE ("referee_evaluation_detail"."obligation_status" = 'completed_on_time'::"text")) AS "evaluations_completed_on_time",
            "count"(*) FILTER (WHERE ("referee_evaluation_detail"."obligation_status" = 'completed_late'::"text")) AS "evaluations_completed_late",
            "count"(*) FILTER (WHERE ("referee_evaluation_detail"."obligation_status" = 'missed'::"text")) AS "evaluations_missed",
            "round"(((("count"(*) FILTER (WHERE ("referee_evaluation_detail"."obligation_status" = 'completed_on_time'::"text")))::numeric / (NULLIF("count"(*) FILTER (WHERE ("referee_evaluation_detail"."obligation_status" <> 'pending'::"text")), 0))::numeric) * (100)::numeric), 2) AS "compliance_percentage"
           FROM "development"."referee_evaluation_detail"
          GROUP BY "referee_evaluation_detail"."cycle_id", "referee_evaluation_detail"."evaluator_id"
        ), "quality" AS (
         SELECT "referee_evaluation_detail"."cycle_id",
            "referee_evaluation_detail"."evaluated_id" AS "member_id",
            "count"(*) FILTER (WHERE ("referee_evaluation_detail"."obligation_status" = 'completed_on_time'::"text")) AS "evaluations_received",
            "round"("avg"("referee_evaluation_detail"."quality_percentage") FILTER (WHERE ("referee_evaluation_detail"."obligation_status" = 'completed_on_time'::"text")), 2) AS "quality_percentage",
            "round"("avg"("referee_evaluation_detail"."arrival_score") FILTER (WHERE ("referee_evaluation_detail"."obligation_status" = 'completed_on_time'::"text")), 2) AS "avg_arrival",
            "round"("avg"("referee_evaluation_detail"."fitness_score") FILTER (WHERE ("referee_evaluation_detail"."obligation_status" = 'completed_on_time'::"text")), 2) AS "avg_fitness",
            "round"("avg"("referee_evaluation_detail"."communication_score") FILTER (WHERE ("referee_evaluation_detail"."obligation_status" = 'completed_on_time'::"text")), 2) AS "avg_communication",
            "round"("avg"("referee_evaluation_detail"."teamwork_score") FILTER (WHERE ("referee_evaluation_detail"."obligation_status" = 'completed_on_time'::"text")), 2) AS "avg_teamwork",
            "round"("avg"("referee_evaluation_detail"."professionalism_score") FILTER (WHERE ("referee_evaluation_detail"."obligation_status" = 'completed_on_time'::"text")), 2) AS "avg_professionalism"
           FROM "development"."referee_evaluation_detail"
          GROUP BY "referee_evaluation_detail"."cycle_id", "referee_evaluation_detail"."evaluated_id"
        )
 SELECT "mic"."cycle_id",
    "mic"."cycle_name",
    "mic"."cycle_status",
    "mic"."cycle_member_id",
    "mic"."member_id",
    "mic"."full_name",
    "mic"."effective_from",
    "mic"."effective_until",
    "mic"."enrollment_type",
    "mic"."cycle_member_status",
    "mic"."eligible_for_ranking",
    COALESCE("c"."evaluations_required_total", (0)::bigint) AS "evaluations_required_total",
    COALESCE("c"."evaluations_pending", (0)::bigint) AS "evaluations_pending",
    COALESCE("c"."evaluations_due", (0)::bigint) AS "evaluations_due",
    COALESCE("c"."evaluations_completed_on_time", (0)::bigint) AS "evaluations_completed_on_time",
    COALESCE("c"."evaluations_completed_late", (0)::bigint) AS "evaluations_completed_late",
    COALESCE("c"."evaluations_missed", (0)::bigint) AS "evaluations_missed",
    "c"."compliance_percentage",
    COALESCE("q"."evaluations_received", (0)::bigint) AS "evaluations_received",
    "q"."quality_percentage",
    "q"."avg_arrival",
    "q"."avg_fitness",
    "q"."avg_communication",
    "q"."avg_teamwork",
    "q"."avg_professionalism",
        CASE
            WHEN ("q"."quality_percentage" IS NULL) THEN NULL::numeric
            WHEN ("c"."compliance_percentage" IS NULL) THEN NULL::numeric
            ELSE "round"(("q"."quality_percentage" * ("c"."compliance_percentage" / 100.0)), 2)
        END AS "evaluation_score",
        CASE
            WHEN ("q"."quality_percentage" IS NULL) THEN 'insufficient_feedback'::"text"
            WHEN ("c"."compliance_percentage" IS NULL) THEN 'compliance_pending'::"text"
            ELSE 'scored'::"text"
        END AS "evaluation_status"
   FROM (("members_in_cycle" "mic"
     LEFT JOIN "compliance" "c" ON ((("c"."cycle_id" = "mic"."cycle_id") AND ("c"."member_id" = "mic"."member_id"))))
     LEFT JOIN "quality" "q" ON ((("q"."cycle_id" = "mic"."cycle_id") AND ("q"."member_id" = "mic"."member_id"))));


ALTER VIEW "development"."referee_evaluation_score" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."referee_quiz_score" WITH ("security_invoker"='false') AS
 WITH "assessment_results" AS (
         SELECT "result"."cycle_id",
            "result"."assessment_id",
            "result"."member_id",
            "result"."full_name",
            "result"."required",
            "result"."counts_for_score",
            "result"."best_score",
            "assessment"."status",
            "assessment"."open_until",
                CASE
                    WHEN ("result"."best_score" IS NOT NULL) THEN "result"."best_score"
                    WHEN (("assessment"."required" = true) AND ("assessment"."counts_for_score" = true) AND (("assessment"."status" = ANY (ARRAY['closed'::"development"."quiz_assessment_status", 'archived'::"development"."quiz_assessment_status"])) OR (("assessment"."status" = 'published'::"development"."quiz_assessment_status") AND ("assessment"."open_until" <= "now"())))) THEN (0)::numeric
                    ELSE NULL::numeric
                END AS "effective_score"
           FROM ("development"."quiz_member_best_results" "result"
             JOIN "development"."quiz_assessments" "assessment" ON (("assessment"."id" = "result"."assessment_id")))
        )
 SELECT "cycle_id",
    "member_id",
    "full_name",
    "count"(*) FILTER (WHERE (("counts_for_score" = true) AND ("effective_score" IS NOT NULL))) AS "assessments_counted",
    "count"(*) FILTER (WHERE (("counts_for_score" = true) AND ("effective_score" = (0)::numeric) AND ("best_score" IS NULL))) AS "assessments_not_attempted",
    "round"("avg"("effective_score") FILTER (WHERE (("counts_for_score" = true) AND ("effective_score" IS NOT NULL))), 2) AS "quiz_score"
   FROM "assessment_results"
  GROUP BY "cycle_id", "member_id", "full_name";


ALTER VIEW "development"."referee_quiz_score" OWNER TO "postgres";


CREATE OR REPLACE VIEW "development"."referee_report_score" AS
 SELECT "cycle_id",
    "cycle_name",
    "cycle_status",
    "cycle_member_id",
    "member_id",
    "full_name",
    "effective_from",
    "effective_until",
    "enrollment_type",
    "cycle_member_status",
    "eligible_for_ranking",
    "count"(*) AS "reports_required",
    "count"(*) FILTER (WHERE ("report_submitted" = true)) AS "reports_submitted",
    "count"(*) FILTER (WHERE ("submitted_on_time" = true)) AS "reports_on_time",
    "count"(*) FILTER (WHERE (("report_submitted" = true) AND ("submitted_on_time" = false))) AS "reports_late",
    "count"(*) FILTER (WHERE ("report_submitted" = false)) AS "reports_missing",
    "sum"("report_points") AS "report_points",
    "round"(((("sum"("report_points"))::numeric / (NULLIF("count"(*), 0))::numeric) * (100)::numeric), 2) AS "report_percentage"
   FROM "development"."referee_report_detail"
  GROUP BY "cycle_id", "cycle_name", "cycle_status", "cycle_member_id", "member_id", "full_name", "effective_from", "effective_until", "enrollment_type", "cycle_member_status", "eligible_for_ranking";


ALTER VIEW "development"."referee_report_score" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "league"."match_rosters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "player_id" "uuid" NOT NULL,
    "team_id" "uuid" NOT NULL,
    "jersey_number" "text",
    "checked_in" boolean DEFAULT false,
    "present" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "league"."match_rosters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "league"."players" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "external_player_id" "text" NOT NULL,
    "team_id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "league"."players" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "league"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "external_team_id" "text",
    "name" "text" NOT NULL,
    "division" "text",
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "league"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."arbiter_referees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "arbiter_name" "text" NOT NULL,
    "member_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."arbiter_referees" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."card_reasons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "card_type" "text" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "card_reasons_card_type_check" CHECK (("card_type" = ANY (ARRAY['yellow'::"text", 'red'::"text"])))
);


ALTER TABLE "public"."card_reasons" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."dashboard_pending_reports" AS
 SELECT "m"."id" AS "match_id",
    "m"."home_team",
    "m"."away_team",
    "m"."kickoff_at",
    "cr"."full_name" AS "center_referee"
   FROM (("public"."matches" "m"
     LEFT JOIN "public"."match_reports" "r" ON (("r"."match_id" = "m"."id")))
     LEFT JOIN "public"."members" "cr" ON (("m"."center_referee_id" = "cr"."id")))
  WHERE (("r"."id" IS NULL) AND ("m"."kickoff_at" < "now"()) AND (("m"."center_referee_id" = "auth"."uid"()) OR ("m"."assistant_referee_1_id" = "auth"."uid"()) OR ("m"."assistant_referee_2_id" = "auth"."uid"())));


ALTER VIEW "public"."dashboard_pending_reports" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."dashboard_referee_activity" AS
 WITH "matches_officiated" AS (
         SELECT "m_1"."id" AS "member_id",
            "count"(DISTINCT "mt"."id") AS "matches_officiated"
           FROM ("public"."members" "m_1"
             LEFT JOIN "public"."matches" "mt" ON ((("mt"."center_referee_id" = "m_1"."id") OR ("mt"."assistant_referee_1_id" = "m_1"."id") OR ("mt"."assistant_referee_2_id" = "m_1"."id"))))
          GROUP BY "m_1"."id"
        ), "reports_submitted" AS (
         SELECT "mr"."submitted_by" AS "member_id",
            "count"(*) AS "reports_submitted"
           FROM "public"."match_reports" "mr"
          GROUP BY "mr"."submitted_by"
        ), "evaluations_received" AS (
         SELECT "e"."evaluated_id" AS "member_id",
            "count"(*) AS "evaluations_received"
           FROM "public"."evaluations" "e"
          GROUP BY "e"."evaluated_id"
        )
 SELECT "m"."id" AS "member_id",
    "m"."full_name",
    COALESCE("mo"."matches_officiated", (0)::bigint) AS "matches_officiated",
    COALESCE("rs"."reports_submitted", (0)::bigint) AS "reports_submitted",
    COALESCE("er"."evaluations_received", (0)::bigint) AS "evaluations_received"
   FROM ((("public"."members" "m"
     LEFT JOIN "matches_officiated" "mo" ON (("mo"."member_id" = "m"."id")))
     LEFT JOIN "reports_submitted" "rs" ON (("rs"."member_id" = "m"."id")))
     LEFT JOIN "evaluations_received" "er" ON (("er"."member_id" = "m"."id")));


ALTER VIEW "public"."dashboard_referee_activity" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."dashboard_referee_matches" AS
 SELECT "mem"."id",
    "mem"."full_name",
    "count"("m"."id") AS "matches_officiated"
   FROM ("public"."members" "mem"
     LEFT JOIN "public"."matches" "m" ON ((("mem"."id" = "m"."center_referee_id") OR ("mem"."id" = "m"."assistant_referee_1_id") OR ("mem"."id" = "m"."assistant_referee_2_id"))))
  GROUP BY "mem"."id", "mem"."full_name";


ALTER VIEW "public"."dashboard_referee_matches" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."dashboard_upcoming_matches" AS
 SELECT "m"."id" AS "match_id",
    "m"."home_team",
    "m"."away_team",
    "m"."league",
    "m"."division",
    "m"."location",
    "m"."field",
    "m"."kickoff_at",
    "cr"."full_name" AS "center_referee",
    "ar1"."full_name" AS "assistant_referee_1",
    "ar2"."full_name" AS "assistant_referee_2"
   FROM ((("public"."matches" "m"
     LEFT JOIN "public"."members" "cr" ON (("m"."center_referee_id" = "cr"."id")))
     LEFT JOIN "public"."members" "ar1" ON (("m"."assistant_referee_1_id" = "ar1"."id")))
     LEFT JOIN "public"."members" "ar2" ON (("m"."assistant_referee_2_id" = "ar2"."id")))
  WHERE (("m"."kickoff_at" > "now"()) AND (("m"."center_referee_id" = "auth"."uid"()) OR ("m"."assistant_referee_1_id" = "auth"."uid"()) OR ("m"."assistant_referee_2_id" = "auth"."uid"())))
  ORDER BY "m"."kickoff_at";


ALTER VIEW "public"."dashboard_upcoming_matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_assets" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "report_id" "uuid",
    "asset_type" "text",
    "storage_path" "text",
    "uploaded_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."report_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_cards" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "report_id" "uuid",
    "team" "text",
    "card_type" "public"."card_type",
    "player_name" "text",
    "player_number" "text",
    "minute" integer,
    "reason_code" "text" NOT NULL,
    "notes" "text",
    "player_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."report_cards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_goals" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "report_id" "uuid",
    "team" "text" NOT NULL,
    "player_name" "text",
    "player_number" "text",
    "minute" integer,
    "half" "text",
    "goal_type" "public"."goal_type" DEFAULT 'normal'::"public"."goal_type",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "player_id" "uuid"
);


ALTER TABLE "public"."report_goals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_injuries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "report_id" "uuid",
    "team" "text",
    "player_name" "text",
    "player_number" "text",
    "minute" integer,
    "description" "text",
    "severity" "text",
    "player_id" "uuid"
);


ALTER TABLE "public"."report_injuries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tournaments"."division_seasons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "division_id" "uuid" NOT NULL,
    "season_id" "uuid" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "tournaments"."division_seasons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tournaments"."divisions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tournaments"."divisions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tournaments"."match_context" (
    "match_id" "uuid" NOT NULL,
    "division_season_id" "uuid" NOT NULL,
    "home_team_registration_id" "uuid" NOT NULL,
    "away_team_registration_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "match_context_different_teams_check" CHECK (("home_team_registration_id" <> "away_team_registration_id"))
);


ALTER TABLE "tournaments"."match_context" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tournaments"."match_context_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "error_code" "text",
    "message" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "match_context_logs_status_check" CHECK (("status" = ANY (ARRAY['success'::"text", 'warning'::"text", 'failed'::"text"])))
);


ALTER TABLE "tournaments"."match_context_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tournaments"."match_rosters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "player_id" "uuid" NOT NULL,
    "team_id" "uuid" NOT NULL,
    "jersey_number" "text",
    "checked_in" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tournaments"."match_rosters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tournaments"."players" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "external_player_id" "text",
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "birth_date" "date",
    "photo_url" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tournaments"."players" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tournaments"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tournaments"."teams" OWNER TO "postgres";


CREATE OR REPLACE VIEW "tournaments"."match_roster_view" AS
 SELECT "mr"."id",
    "mr"."match_id",
    "mr"."checked_in",
    "mr"."created_at",
    "p"."id" AS "player_id",
    "p"."first_name",
    "p"."last_name",
    "p"."photo_url",
    "t"."id" AS "team_id",
    "t"."name" AS "team_name"
   FROM (("tournaments"."match_rosters" "mr"
     JOIN "tournaments"."players" "p" ON (("p"."id" = "mr"."player_id")))
     JOIN "tournaments"."teams" "t" ON (("t"."id" = "mr"."team_id")));


ALTER VIEW "tournaments"."match_roster_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tournaments"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "tournaments"."organizations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tournaments"."seasons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "term" "text" NOT NULL,
    "year" integer NOT NULL,
    "starts_at" "date",
    "ends_at" "date",
    "status" "text" DEFAULT 'upcoming'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "seasons_date_range_check" CHECK ((("starts_at" IS NULL) OR ("ends_at" IS NULL) OR ("starts_at" <= "ends_at"))),
    CONSTRAINT "seasons_status_check" CHECK (("status" = ANY (ARRAY['upcoming'::"text", 'active'::"text", 'archived'::"text"]))),
    CONSTRAINT "seasons_term_check" CHECK (("term" = ANY (ARRAY['Spring'::"text", 'Winter'::"text", 'Fall'::"text"]))),
    CONSTRAINT "seasons_year_check" CHECK ((("year" >= 2000) AND ("year" <= 2100)))
);


ALTER TABLE "tournaments"."seasons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tournaments"."team_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "division_season_id" "uuid" NOT NULL,
    "external_team_id" "text",
    "active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "tournaments"."team_registrations" OWNER TO "postgres";


CREATE OR REPLACE VIEW "tournaments"."player_card_reason_stats" AS
 SELECT "rc"."player_id",
    "p"."external_player_id",
    "p"."first_name",
    "p"."last_name",
    "concat_ws"(' '::"text", "p"."first_name", "p"."last_name") AS "player_name",
    "tr"."team_id",
    "t"."name" AS "team_name",
    "mc"."division_season_id",
    "d"."id" AS "division_id",
    "d"."name" AS "division_name",
    "s"."id" AS "season_id",
    "s"."term" AS "season_term",
    "s"."year" AS "season_year",
    "concat_ws"(' '::"text", "s"."term", ("s"."year")::"text") AS "season_label",
    "rc"."card_type",
    "rc"."reason_code",
    ("count"(*))::integer AS "card_count"
   FROM (((((((("public"."report_cards" "rc"
     JOIN "public"."match_reports" "mr" ON (("mr"."id" = "rc"."report_id")))
     JOIN "tournaments"."match_context" "mc" ON (("mc"."match_id" = "mr"."match_id")))
     JOIN "tournaments"."team_registrations" "tr" ON (("tr"."id" =
        CASE
            WHEN ("rc"."team" = 'home'::"text") THEN "mc"."home_team_registration_id"
            WHEN ("rc"."team" = 'away'::"text") THEN "mc"."away_team_registration_id"
            ELSE NULL::"uuid"
        END)))
     JOIN "tournaments"."teams" "t" ON (("t"."id" = "tr"."team_id")))
     JOIN "tournaments"."players" "p" ON (("p"."id" = "rc"."player_id")))
     JOIN "tournaments"."division_seasons" "ds" ON (("ds"."id" = "mc"."division_season_id")))
     JOIN "tournaments"."divisions" "d" ON (("d"."id" = "ds"."division_id")))
     JOIN "tournaments"."seasons" "s" ON (("s"."id" = "ds"."season_id")))
  WHERE ("rc"."player_id" IS NOT NULL)
  GROUP BY "rc"."player_id", "p"."external_player_id", "p"."first_name", "p"."last_name", "tr"."team_id", "t"."name", "mc"."division_season_id", "d"."id", "d"."name", "s"."id", "s"."term", "s"."year", "rc"."card_type", "rc"."reason_code";


ALTER VIEW "tournaments"."player_card_reason_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "tournaments"."player_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "player_id" "uuid" NOT NULL,
    "team_registration_id" "uuid" NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "registered_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "tournaments"."player_registrations" OWNER TO "postgres";


CREATE OR REPLACE VIEW "tournaments"."player_team_season_stats" AS
 WITH "goal_stats" AS (
         SELECT "rg"."player_id",
            "tr"."team_id",
            "mc"."division_season_id",
            ("count"("rg"."id"))::integer AS "goals"
           FROM ((("public"."report_goals" "rg"
             JOIN "public"."match_reports" "mr" ON (("mr"."id" = "rg"."report_id")))
             JOIN "tournaments"."match_context" "mc" ON (("mc"."match_id" = "mr"."match_id")))
             JOIN "tournaments"."team_registrations" "tr" ON (("tr"."id" =
                CASE
                    WHEN ("rg"."team" = 'home'::"text") THEN "mc"."home_team_registration_id"
                    WHEN ("rg"."team" = 'away'::"text") THEN "mc"."away_team_registration_id"
                    ELSE NULL::"uuid"
                END)))
          WHERE ("rg"."player_id" IS NOT NULL)
          GROUP BY "rg"."player_id", "tr"."team_id", "mc"."division_season_id"
        ), "card_stats" AS (
         SELECT "rc"."player_id",
            "tr"."team_id",
            "mc"."division_season_id",
            ("count"(*) FILTER (WHERE ("rc"."card_type" = 'yellow'::"public"."card_type")))::integer AS "yellow_cards",
            ("count"(*) FILTER (WHERE (("rc"."card_type" = 'red'::"public"."card_type") AND (COALESCE("rc"."reason_code", ''::"text") <> '2CT'::"text"))))::integer AS "direct_red_cards",
            ("count"(*) FILTER (WHERE (("rc"."card_type" = 'red'::"public"."card_type") AND ("rc"."reason_code" = '2CT'::"text"))))::integer AS "second_yellow_reds",
            ("count"(*) FILTER (WHERE ("rc"."card_type" = 'red'::"public"."card_type")))::integer AS "total_red_cards"
           FROM ((("public"."report_cards" "rc"
             JOIN "public"."match_reports" "mr" ON (("mr"."id" = "rc"."report_id")))
             JOIN "tournaments"."match_context" "mc" ON (("mc"."match_id" = "mr"."match_id")))
             JOIN "tournaments"."team_registrations" "tr" ON (("tr"."id" =
                CASE
                    WHEN ("rc"."team" = 'home'::"text") THEN "mc"."home_team_registration_id"
                    WHEN ("rc"."team" = 'away'::"text") THEN "mc"."away_team_registration_id"
                    ELSE NULL::"uuid"
                END)))
          WHERE ("rc"."player_id" IS NOT NULL)
          GROUP BY "rc"."player_id", "tr"."team_id", "mc"."division_season_id"
        ), "combined_stats" AS (
         SELECT COALESCE("goals"."player_id", "cards"."player_id") AS "player_id",
            COALESCE("goals"."team_id", "cards"."team_id") AS "team_id",
            COALESCE("goals"."division_season_id", "cards"."division_season_id") AS "division_season_id",
            COALESCE("goals"."goals", 0) AS "goals",
            COALESCE("cards"."yellow_cards", 0) AS "yellow_cards",
            COALESCE("cards"."direct_red_cards", 0) AS "direct_red_cards",
            COALESCE("cards"."second_yellow_reds", 0) AS "second_yellow_reds",
            COALESCE("cards"."total_red_cards", 0) AS "total_red_cards"
           FROM ("goal_stats" "goals"
             FULL JOIN "card_stats" "cards" ON ((("cards"."player_id" = "goals"."player_id") AND ("cards"."team_id" = "goals"."team_id") AND ("cards"."division_season_id" = "goals"."division_season_id"))))
        )
 SELECT "stats"."player_id",
    "p"."external_player_id",
    "p"."first_name",
    "p"."last_name",
    "concat_ws"(' '::"text", "p"."first_name", "p"."last_name") AS "player_name",
    "stats"."team_id",
    "t"."name" AS "team_name",
    "ds"."id" AS "division_season_id",
    "d"."id" AS "division_id",
    "d"."name" AS "division_name",
    "s"."id" AS "season_id",
    "s"."term" AS "season_term",
    "s"."year" AS "season_year",
    "concat_ws"(' '::"text", "s"."term", ("s"."year")::"text") AS "season_label",
    "stats"."goals",
    "stats"."yellow_cards",
    "stats"."direct_red_cards",
    "stats"."second_yellow_reds",
    "stats"."total_red_cards"
   FROM ((((("combined_stats" "stats"
     JOIN "tournaments"."players" "p" ON (("p"."id" = "stats"."player_id")))
     JOIN "tournaments"."teams" "t" ON (("t"."id" = "stats"."team_id")))
     JOIN "tournaments"."division_seasons" "ds" ON (("ds"."id" = "stats"."division_season_id")))
     JOIN "tournaments"."divisions" "d" ON (("d"."id" = "ds"."division_id")))
     JOIN "tournaments"."seasons" "s" ON (("s"."id" = "ds"."season_id")));


ALTER VIEW "tournaments"."player_team_season_stats" OWNER TO "postgres";


CREATE OR REPLACE VIEW "tournaments"."team_season_standings" AS
 WITH "approved_reports" AS (
         SELECT DISTINCT ON ("mr"."match_id") "mr"."id" AS "report_id",
            "mr"."match_id",
            "mr"."home_score",
            "mr"."away_score",
            "mr"."submitted_at",
            "mr"."created_at"
           FROM "public"."match_reports" "mr"
          WHERE (("mr"."status" = 'approved'::"public"."report_status") AND ("mr"."home_score" IS NOT NULL) AND ("mr"."away_score" IS NOT NULL))
          ORDER BY "mr"."match_id", "mr"."submitted_at" DESC NULLS LAST, "mr"."created_at" DESC
        ), "match_team_results" AS (
         SELECT "mc"."division_season_id",
            "mc"."home_team_registration_id" AS "team_registration_id",
            "ar"."match_id",
            "ar"."home_score" AS "goals_for",
            "ar"."away_score" AS "goals_against",
                CASE
                    WHEN ("ar"."home_score" > "ar"."away_score") THEN 1
                    ELSE 0
                END AS "won",
                CASE
                    WHEN ("ar"."home_score" = "ar"."away_score") THEN 1
                    ELSE 0
                END AS "drawn",
                CASE
                    WHEN ("ar"."home_score" < "ar"."away_score") THEN 1
                    ELSE 0
                END AS "lost",
                CASE
                    WHEN ("ar"."home_score" > "ar"."away_score") THEN 3
                    WHEN ("ar"."home_score" = "ar"."away_score") THEN 1
                    ELSE 0
                END AS "points"
           FROM ("approved_reports" "ar"
             JOIN "tournaments"."match_context" "mc" ON (("mc"."match_id" = "ar"."match_id")))
        UNION ALL
         SELECT "mc"."division_season_id",
            "mc"."away_team_registration_id" AS "team_registration_id",
            "ar"."match_id",
            "ar"."away_score" AS "goals_for",
            "ar"."home_score" AS "goals_against",
                CASE
                    WHEN ("ar"."away_score" > "ar"."home_score") THEN 1
                    ELSE 0
                END AS "won",
                CASE
                    WHEN ("ar"."away_score" = "ar"."home_score") THEN 1
                    ELSE 0
                END AS "drawn",
                CASE
                    WHEN ("ar"."away_score" < "ar"."home_score") THEN 1
                    ELSE 0
                END AS "lost",
                CASE
                    WHEN ("ar"."away_score" > "ar"."home_score") THEN 3
                    WHEN ("ar"."away_score" = "ar"."home_score") THEN 1
                    ELSE 0
                END AS "points"
           FROM ("approved_reports" "ar"
             JOIN "tournaments"."match_context" "mc" ON (("mc"."match_id" = "ar"."match_id")))
        ), "team_totals" AS (
         SELECT "tr"."id" AS "team_registration_id",
            "tr"."team_id",
            "tr"."division_season_id",
            ("count"("results"."match_id"))::integer AS "played",
            (COALESCE("sum"("results"."won"), (0)::bigint))::integer AS "won",
            (COALESCE("sum"("results"."drawn"), (0)::bigint))::integer AS "drawn",
            (COALESCE("sum"("results"."lost"), (0)::bigint))::integer AS "lost",
            (COALESCE("sum"("results"."goals_for"), (0)::bigint))::integer AS "goals_for",
            (COALESCE("sum"("results"."goals_against"), (0)::bigint))::integer AS "goals_against",
            ((COALESCE("sum"("results"."goals_for"), (0)::bigint))::integer - (COALESCE("sum"("results"."goals_against"), (0)::bigint))::integer) AS "goal_difference",
            (COALESCE("sum"("results"."points"), (0)::bigint))::integer AS "total_points"
           FROM ("tournaments"."team_registrations" "tr"
             LEFT JOIN "match_team_results" "results" ON ((("results"."team_registration_id" = "tr"."id") AND ("results"."division_season_id" = "tr"."division_season_id"))))
          WHERE ("tr"."active" = true)
          GROUP BY "tr"."id", "tr"."team_id", "tr"."division_season_id"
        ), "standings_data" AS (
         SELECT "totals"."team_registration_id",
            "totals"."team_id",
            "t"."name" AS "team_name",
            "totals"."division_season_id",
            "d"."id" AS "division_id",
            "d"."name" AS "division_name",
            "s"."id" AS "season_id",
            "s"."term" AS "season_term",
            "s"."year" AS "season_year",
            "concat_ws"(' '::"text", "s"."term", ("s"."year")::"text") AS "season_label",
            "totals"."played",
            "totals"."won",
            "totals"."drawn",
            "totals"."lost",
            "totals"."goals_for",
            "totals"."goals_against",
            "totals"."goal_difference",
            0 AS "forfeits",
            "totals"."total_points"
           FROM (((("team_totals" "totals"
             JOIN "tournaments"."teams" "t" ON (("t"."id" = "totals"."team_id")))
             JOIN "tournaments"."division_seasons" "ds" ON (("ds"."id" = "totals"."division_season_id")))
             JOIN "tournaments"."divisions" "d" ON (("d"."id" = "ds"."division_id")))
             JOIN "tournaments"."seasons" "s" ON (("s"."id" = "ds"."season_id")))
        )
 SELECT ("row_number"() OVER (PARTITION BY "division_season_id" ORDER BY "total_points" DESC, "goal_difference" DESC, "goals_for" DESC, "team_name"))::integer AS "position",
    "team_registration_id",
    "team_id",
    "team_name",
    "division_season_id",
    "division_id",
    "division_name",
    "season_id",
    "season_term",
    "season_year",
    "season_label",
    "played",
    "won",
    "drawn",
    "lost",
    "forfeits",
    "goals_for",
    "goals_against",
    "goal_difference",
    "total_points"
   FROM "standings_data";


ALTER VIEW "tournaments"."team_season_standings" OWNER TO "postgres";


ALTER TABLE ONLY "development"."attendance_records"
    ADD CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."attendance_scoring_rules"
    ADD CONSTRAINT "attendance_scoring_rules_cycle_unique" UNIQUE ("cycle_id");



ALTER TABLE ONLY "development"."attendance_scoring_rules"
    ADD CONSTRAINT "attendance_scoring_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."attendance_sessions"
    ADD CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."current_ranking_snapshot"
    ADD CONSTRAINT "current_ranking_snapshot_pkey" PRIMARY KEY ("cycle_id", "member_id");



ALTER TABLE ONLY "development"."cycle_members"
    ADD CONSTRAINT "cycle_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."cycles"
    ADD CONSTRAINT "cycles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."attendance_records"
    ADD CONSTRAINT "development_attendance_session_member_unique" UNIQUE ("session_id", "member_id");



ALTER TABLE ONLY "development"."cycle_members"
    ADD CONSTRAINT "development_cycle_member_unique" UNIQUE ("cycle_id", "member_id");



ALTER TABLE ONLY "development"."cycles"
    ADD CONSTRAINT "development_cycles_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "development"."monthly_ranking_snapshots"
    ADD CONSTRAINT "monthly_ranking_snapshots_cycle_member_month_unique" UNIQUE ("cycle_id", "member_id", "month_start");



ALTER TABLE ONLY "development"."monthly_ranking_snapshots"
    ADD CONSTRAINT "monthly_ranking_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."quiz_access_grants"
    ADD CONSTRAINT "quiz_access_grants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."quiz_answers"
    ADD CONSTRAINT "quiz_answers_attempt_question_unique" UNIQUE ("attempt_id", "attempt_question_id");



ALTER TABLE ONLY "development"."quiz_answers"
    ADD CONSTRAINT "quiz_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."quiz_assessments"
    ADD CONSTRAINT "quiz_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."quiz_attempt_questions"
    ADD CONSTRAINT "quiz_attempt_questions_group_unique" UNIQUE ("attempt_id", "question_group_id");



ALTER TABLE ONLY "development"."quiz_attempt_questions"
    ADD CONSTRAINT "quiz_attempt_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."quiz_attempt_questions"
    ADD CONSTRAINT "quiz_attempt_questions_position_unique" UNIQUE ("attempt_id", "display_position");



ALTER TABLE ONLY "development"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_member_number_unique" UNIQUE ("assessment_id", "member_id", "attempt_number");



ALTER TABLE ONLY "development"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."quiz_question_groups"
    ADD CONSTRAINT "quiz_question_groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."quiz_question_options"
    ADD CONSTRAINT "quiz_question_options_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."quiz_question_options"
    ADD CONSTRAINT "quiz_question_options_position_unique" UNIQUE ("question_id", "position");



ALTER TABLE ONLY "development"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_group_version_unique" UNIQUE ("question_group_id", "version_id");



ALTER TABLE ONLY "development"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."quiz_versions"
    ADD CONSTRAINT "quiz_versions_assessment_language_unique" UNIQUE ("assessment_id", "language");



ALTER TABLE ONLY "development"."quiz_versions"
    ADD CONSTRAINT "quiz_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "development"."scoring_periods"
    ADD CONSTRAINT "scoring_periods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "league"."match_rosters"
    ADD CONSTRAINT "match_rosters_match_id_player_id_key" UNIQUE ("match_id", "player_id");



ALTER TABLE ONLY "league"."match_rosters"
    ADD CONSTRAINT "match_rosters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "league"."players"
    ADD CONSTRAINT "players_external_player_id_key" UNIQUE ("external_player_id");



ALTER TABLE ONLY "league"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "league"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."arbiter_referees"
    ADD CONSTRAINT "arbiter_referees_arbiter_name_key" UNIQUE ("arbiter_name");



ALTER TABLE ONLY "public"."arbiter_referees"
    ADD CONSTRAINT "arbiter_referees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."card_reasons"
    ADD CONSTRAINT "card_reasons_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."card_reasons"
    ADD CONSTRAINT "card_reasons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."match_reports"
    ADD CONSTRAINT "match_reports_match_id_key" UNIQUE ("match_id");



ALTER TABLE ONLY "public"."match_reports"
    ADD CONSTRAINT "match_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."members"
    ADD CONSTRAINT "members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_assets"
    ADD CONSTRAINT "report_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_cards"
    ADD CONSTRAINT "report_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_goals"
    ADD CONSTRAINT "report_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_injuries"
    ADD CONSTRAINT "report_injuries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "unique_match_evaluation" UNIQUE ("match_id", "evaluator_id", "evaluated_id");



ALTER TABLE ONLY "tournaments"."division_seasons"
    ADD CONSTRAINT "division_seasons_division_season_unique" UNIQUE ("division_id", "season_id");



ALTER TABLE ONLY "tournaments"."division_seasons"
    ADD CONSTRAINT "division_seasons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tournaments"."divisions"
    ADD CONSTRAINT "divisions_organization_name_unique" UNIQUE ("organization_id", "name");



ALTER TABLE ONLY "tournaments"."divisions"
    ADD CONSTRAINT "divisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tournaments"."match_context_logs"
    ADD CONSTRAINT "match_context_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tournaments"."match_context"
    ADD CONSTRAINT "match_context_pkey" PRIMARY KEY ("match_id");



ALTER TABLE ONLY "tournaments"."match_rosters"
    ADD CONSTRAINT "match_rosters_match_id_player_id_key" UNIQUE ("match_id", "player_id");



ALTER TABLE ONLY "tournaments"."match_rosters"
    ADD CONSTRAINT "match_rosters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tournaments"."organizations"
    ADD CONSTRAINT "organizations_name_key" UNIQUE ("name");



ALTER TABLE ONLY "tournaments"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tournaments"."organizations"
    ADD CONSTRAINT "organizations_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "tournaments"."player_registrations"
    ADD CONSTRAINT "player_registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tournaments"."player_registrations"
    ADD CONSTRAINT "player_registrations_player_team_registration_unique" UNIQUE ("player_id", "team_registration_id");



ALTER TABLE ONLY "tournaments"."players"
    ADD CONSTRAINT "players_org_external_player_unique" UNIQUE ("organization_id", "external_player_id");



ALTER TABLE ONLY "tournaments"."players"
    ADD CONSTRAINT "players_organization_external_id_unique" UNIQUE ("organization_id", "external_player_id");



ALTER TABLE ONLY "tournaments"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tournaments"."seasons"
    ADD CONSTRAINT "seasons_organization_term_year_unique" UNIQUE ("organization_id", "term", "year");



ALTER TABLE ONLY "tournaments"."seasons"
    ADD CONSTRAINT "seasons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tournaments"."team_registrations"
    ADD CONSTRAINT "team_registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "tournaments"."team_registrations"
    ADD CONSTRAINT "team_registrations_team_division_season_unique" UNIQUE ("team_id", "division_season_id");



ALTER TABLE ONLY "tournaments"."teams"
    ADD CONSTRAINT "teams_organization_name_unique" UNIQUE ("organization_id", "name");



ALTER TABLE ONLY "tournaments"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



CREATE INDEX "attendance_scoring_rules_cycle_idx" ON "development"."attendance_scoring_rules" USING "btree" ("cycle_id");



CREATE INDEX "current_ranking_snapshot_member_idx" ON "development"."current_ranking_snapshot" USING "btree" ("member_id");



CREATE INDEX "current_ranking_snapshot_rank_idx" ON "development"."current_ranking_snapshot" USING "btree" ("cycle_id", "ranking_position");



CREATE INDEX "current_ranking_snapshot_refreshed_idx" ON "development"."current_ranking_snapshot" USING "btree" ("cycle_id", "refreshed_at");



CREATE INDEX "development_attendance_records_member_idx" ON "development"."attendance_records" USING "btree" ("member_id");



CREATE INDEX "development_attendance_records_session_status_idx" ON "development"."attendance_records" USING "btree" ("session_id", "status");



CREATE INDEX "development_attendance_sessions_cycle_date_idx" ON "development"."attendance_sessions" USING "btree" ("cycle_id", "scheduled_at");



CREATE INDEX "development_attendance_sessions_status_idx" ON "development"."attendance_sessions" USING "btree" ("cycle_id", "status", "counts_for_score");



CREATE INDEX "development_cycle_members_cycle_idx" ON "development"."cycle_members" USING "btree" ("cycle_id", "status");



CREATE INDEX "development_cycle_members_member_idx" ON "development"."cycle_members" USING "btree" ("member_id", "cycle_id");



CREATE INDEX "development_cycles_status_dates_idx" ON "development"."cycles" USING "btree" ("status", "start_date", "end_date");



CREATE UNIQUE INDEX "development_one_active_cycle_unique" ON "development"."cycles" USING "btree" ("status") WHERE ("status" = 'active'::"development"."cycle_status");



CREATE INDEX "monthly_ranking_snapshots_cycle_rank_idx" ON "development"."monthly_ranking_snapshots" USING "btree" ("cycle_id", "month_start", "ranking_position");



CREATE INDEX "monthly_ranking_snapshots_cycle_snapshot_idx" ON "development"."monthly_ranking_snapshots" USING "btree" ("cycle_id", "snapshot_date");



CREATE INDEX "monthly_ranking_snapshots_member_idx" ON "development"."monthly_ranking_snapshots" USING "btree" ("member_id", "month_start");



CREATE INDEX "quiz_access_grants_lookup_idx" ON "development"."quiz_access_grants" USING "btree" ("assessment_id", "member_id", "available_until");



CREATE INDEX "quiz_answers_attempt_idx" ON "development"."quiz_answers" USING "btree" ("attempt_id");



CREATE INDEX "quiz_assessments_cycle_idx" ON "development"."quiz_assessments" USING "btree" ("cycle_id");



CREATE INDEX "quiz_assessments_status_idx" ON "development"."quiz_assessments" USING "btree" ("status");



CREATE INDEX "quiz_assessments_window_idx" ON "development"."quiz_assessments" USING "btree" ("open_from", "open_until");



CREATE INDEX "quiz_attempt_questions_attempt_idx" ON "development"."quiz_attempt_questions" USING "btree" ("attempt_id");



CREATE INDEX "quiz_attempts_active_lookup_idx" ON "development"."quiz_attempts" USING "btree" ("assessment_id", "member_id") WHERE ("status" = 'in_progress'::"development"."quiz_attempt_status");



CREATE INDEX "quiz_attempts_assessment_idx" ON "development"."quiz_attempts" USING "btree" ("assessment_id");



CREATE INDEX "quiz_attempts_assessment_member_status_idx" ON "development"."quiz_attempts" USING "btree" ("assessment_id", "member_id", "status");



CREATE INDEX "quiz_attempts_member_idx" ON "development"."quiz_attempts" USING "btree" ("member_id");



CREATE UNIQUE INDEX "quiz_attempts_one_active_per_member_idx" ON "development"."quiz_attempts" USING "btree" ("assessment_id", "member_id") WHERE ("status" = 'in_progress'::"development"."quiz_attempt_status");



CREATE INDEX "quiz_attempts_status_idx" ON "development"."quiz_attempts" USING "btree" ("status");



CREATE INDEX "quiz_options_correct_lookup_idx" ON "development"."quiz_question_options" USING "btree" ("question_id", "is_correct");



CREATE INDEX "quiz_question_groups_assessment_idx" ON "development"."quiz_question_groups" USING "btree" ("assessment_id");



CREATE INDEX "quiz_question_options_question_idx" ON "development"."quiz_question_options" USING "btree" ("question_id");



CREATE INDEX "quiz_questions_group_idx" ON "development"."quiz_questions" USING "btree" ("question_group_id");



CREATE INDEX "quiz_questions_version_group_idx" ON "development"."quiz_questions" USING "btree" ("version_id", "question_group_id");



CREATE INDEX "quiz_questions_version_idx" ON "development"."quiz_questions" USING "btree" ("version_id");



CREATE INDEX "quiz_versions_assessment_idx" ON "development"."quiz_versions" USING "btree" ("assessment_id");



CREATE INDEX "arbiter_referees_name_idx" ON "public"."arbiter_referees" USING "btree" ("arbiter_name");



CREATE INDEX "idx_evaluations_match" ON "public"."evaluations" USING "btree" ("match_id");



CREATE INDEX "idx_matches_kickoff" ON "public"."matches" USING "btree" ("kickoff_at");



CREATE INDEX "idx_report_cards_reason_code" ON "public"."report_cards" USING "btree" ("reason_code");



CREATE INDEX "idx_reports_match" ON "public"."match_reports" USING "btree" ("match_id");



CREATE UNIQUE INDEX "matches_arbiter_match_id_idx" ON "public"."matches" USING "btree" ("arbiter_match_id");



CREATE INDEX "matches_tournament_division_season_id_idx" ON "public"."matches" USING "btree" ("tournament_division_season_id");



CREATE INDEX "division_seasons_division_id_idx" ON "tournaments"."division_seasons" USING "btree" ("division_id");



CREATE INDEX "division_seasons_season_id_idx" ON "tournaments"."division_seasons" USING "btree" ("season_id");



CREATE INDEX "match_context_away_team_registration_id_idx" ON "tournaments"."match_context" USING "btree" ("away_team_registration_id");



CREATE INDEX "match_context_division_season_id_idx" ON "tournaments"."match_context" USING "btree" ("division_season_id");



CREATE INDEX "match_context_home_team_registration_id_idx" ON "tournaments"."match_context" USING "btree" ("home_team_registration_id");



CREATE INDEX "match_context_logs_match_id_idx" ON "tournaments"."match_context_logs" USING "btree" ("match_id");



CREATE INDEX "match_context_logs_status_idx" ON "tournaments"."match_context_logs" USING "btree" ("status");



CREATE INDEX "player_registrations_player_id_idx" ON "tournaments"."player_registrations" USING "btree" ("player_id");



CREATE INDEX "player_registrations_team_registration_id_idx" ON "tournaments"."player_registrations" USING "btree" ("team_registration_id");



CREATE UNIQUE INDEX "seasons_one_active_per_organization_idx" ON "tournaments"."seasons" USING "btree" ("organization_id") WHERE ("status" = 'active'::"text");



CREATE INDEX "seasons_organization_id_idx" ON "tournaments"."seasons" USING "btree" ("organization_id");



CREATE INDEX "seasons_status_idx" ON "tournaments"."seasons" USING "btree" ("status");



CREATE INDEX "team_registrations_division_season_id_idx" ON "tournaments"."team_registrations" USING "btree" ("division_season_id");



CREATE INDEX "team_registrations_team_id_idx" ON "tournaments"."team_registrations" USING "btree" ("team_id");



CREATE OR REPLACE TRIGGER "trg_prevent_scoring_period_overlap" BEFORE INSERT OR UPDATE ON "development"."scoring_periods" FOR EACH ROW EXECUTE FUNCTION "development"."prevent_scoring_period_overlap"();



CREATE OR REPLACE TRIGGER "trg_protect_started_scoring_period" BEFORE UPDATE ON "development"."scoring_periods" FOR EACH ROW EXECUTE FUNCTION "development"."protect_started_scoring_period"();



CREATE OR REPLACE TRIGGER "matches_build_tournament_context" AFTER INSERT OR UPDATE OF "league", "division", "home_team", "away_team", "tournament_division_season_id" ON "public"."matches" FOR EACH ROW EXECUTE FUNCTION "tournaments"."handle_match_context_trigger"();



CREATE OR REPLACE TRIGGER "trg_sync_match_report_status" AFTER INSERT OR UPDATE OF "status" ON "public"."match_reports" FOR EACH ROW EXECUTE FUNCTION "public"."sync_match_report_status"();



CREATE OR REPLACE TRIGGER "division_seasons_set_updated_at" BEFORE UPDATE ON "tournaments"."division_seasons" FOR EACH ROW EXECUTE FUNCTION "tournaments"."set_updated_at"();



CREATE OR REPLACE TRIGGER "match_context_set_updated_at" BEFORE UPDATE ON "tournaments"."match_context" FOR EACH ROW EXECUTE FUNCTION "tournaments"."set_updated_at"();



CREATE OR REPLACE TRIGGER "player_registrations_set_updated_at" BEFORE UPDATE ON "tournaments"."player_registrations" FOR EACH ROW EXECUTE FUNCTION "tournaments"."set_updated_at"();



CREATE OR REPLACE TRIGGER "seasons_set_updated_at" BEFORE UPDATE ON "tournaments"."seasons" FOR EACH ROW EXECUTE FUNCTION "tournaments"."set_updated_at"();



CREATE OR REPLACE TRIGGER "team_registrations_set_updated_at" BEFORE UPDATE ON "tournaments"."team_registrations" FOR EACH ROW EXECUTE FUNCTION "tournaments"."set_updated_at"();



ALTER TABLE ONLY "development"."attendance_records"
    ADD CONSTRAINT "attendance_records_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."attendance_records"
    ADD CONSTRAINT "attendance_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "development"."attendance_records"
    ADD CONSTRAINT "attendance_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "development"."attendance_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."attendance_scoring_rules"
    ADD CONSTRAINT "attendance_scoring_rules_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "development"."cycles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."attendance_sessions"
    ADD CONSTRAINT "attendance_sessions_completed_by_fkey" FOREIGN KEY ("completed_by") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "development"."attendance_sessions"
    ADD CONSTRAINT "attendance_sessions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "development"."attendance_sessions"
    ADD CONSTRAINT "attendance_sessions_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "development"."cycles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."attendance_sessions"
    ADD CONSTRAINT "attendance_sessions_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "development"."current_ranking_snapshot"
    ADD CONSTRAINT "current_ranking_snapshot_cycle_fkey" FOREIGN KEY ("cycle_id") REFERENCES "development"."cycles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."current_ranking_snapshot"
    ADD CONSTRAINT "current_ranking_snapshot_cycle_member_fkey" FOREIGN KEY ("cycle_member_id") REFERENCES "development"."cycle_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."current_ranking_snapshot"
    ADD CONSTRAINT "current_ranking_snapshot_member_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."cycle_members"
    ADD CONSTRAINT "cycle_members_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "development"."cycle_members"
    ADD CONSTRAINT "cycle_members_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "development"."cycles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."cycle_members"
    ADD CONSTRAINT "cycle_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."cycles"
    ADD CONSTRAINT "cycles_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "development"."cycles"
    ADD CONSTRAINT "cycles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "development"."monthly_ranking_snapshots"
    ADD CONSTRAINT "monthly_ranking_snapshots_cycle_fkey" FOREIGN KEY ("cycle_id") REFERENCES "development"."cycles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."monthly_ranking_snapshots"
    ADD CONSTRAINT "monthly_ranking_snapshots_cycle_member_fkey" FOREIGN KEY ("cycle_member_id") REFERENCES "development"."cycle_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."monthly_ranking_snapshots"
    ADD CONSTRAINT "monthly_ranking_snapshots_member_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."quiz_access_grants"
    ADD CONSTRAINT "quiz_access_grants_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "development"."quiz_assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."quiz_access_grants"
    ADD CONSTRAINT "quiz_access_grants_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "development"."quiz_access_grants"
    ADD CONSTRAINT "quiz_access_grants_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."quiz_access_grants"
    ADD CONSTRAINT "quiz_access_grants_revoked_by_fkey" FOREIGN KEY ("revoked_by") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "development"."quiz_answers"
    ADD CONSTRAINT "quiz_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "development"."quiz_attempts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."quiz_answers"
    ADD CONSTRAINT "quiz_answers_attempt_question_id_fkey" FOREIGN KEY ("attempt_question_id") REFERENCES "development"."quiz_attempt_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."quiz_answers"
    ADD CONSTRAINT "quiz_answers_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "development"."quiz_question_options"("id");



ALTER TABLE ONLY "development"."quiz_assessments"
    ADD CONSTRAINT "quiz_assessments_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "development"."quiz_assessments"
    ADD CONSTRAINT "quiz_assessments_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "development"."quiz_assessments"
    ADD CONSTRAINT "quiz_assessments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "development"."quiz_assessments"
    ADD CONSTRAINT "quiz_assessments_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "development"."cycles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."quiz_assessments"
    ADD CONSTRAINT "quiz_assessments_published_by_fkey" FOREIGN KEY ("published_by") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "development"."quiz_attempt_questions"
    ADD CONSTRAINT "quiz_attempt_questions_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "development"."quiz_attempts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."quiz_attempt_questions"
    ADD CONSTRAINT "quiz_attempt_questions_question_group_id_fkey" FOREIGN KEY ("question_group_id") REFERENCES "development"."quiz_question_groups"("id");



ALTER TABLE ONLY "development"."quiz_attempt_questions"
    ADD CONSTRAINT "quiz_attempt_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "development"."quiz_questions"("id");



ALTER TABLE ONLY "development"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "development"."quiz_assessments"("id");



ALTER TABLE ONLY "development"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "development"."quiz_attempts"
    ADD CONSTRAINT "quiz_attempts_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "development"."quiz_versions"("id");



ALTER TABLE ONLY "development"."quiz_question_groups"
    ADD CONSTRAINT "quiz_question_groups_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "development"."quiz_assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."quiz_question_groups"
    ADD CONSTRAINT "quiz_question_groups_invalidated_by_fkey" FOREIGN KEY ("invalidated_by") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "development"."quiz_question_options"
    ADD CONSTRAINT "quiz_question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "development"."quiz_questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_question_group_id_fkey" FOREIGN KEY ("question_group_id") REFERENCES "development"."quiz_question_groups"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."quiz_questions"
    ADD CONSTRAINT "quiz_questions_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "development"."quiz_versions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."quiz_versions"
    ADD CONSTRAINT "quiz_versions_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "development"."quiz_assessments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "development"."scoring_periods"
    ADD CONSTRAINT "scoring_periods_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "league"."match_rosters"
    ADD CONSTRAINT "match_rosters_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "league"."match_rosters"
    ADD CONSTRAINT "match_rosters_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "league"."players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "league"."match_rosters"
    ADD CONSTRAINT "match_rosters_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "league"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "league"."players"
    ADD CONSTRAINT "players_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "league"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."arbiter_referees"
    ADD CONSTRAINT "arbiter_referees_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_evaluated_id_fkey" FOREIGN KEY ("evaluated_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."evaluations"
    ADD CONSTRAINT "evaluations_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_cards"
    ADD CONSTRAINT "fk_report_cards_reason" FOREIGN KEY ("reason_code") REFERENCES "public"."card_reasons"("code");



ALTER TABLE ONLY "public"."match_reports"
    ADD CONSTRAINT "match_reports_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."match_reports"
    ADD CONSTRAINT "match_reports_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_assistant_referee_1_id_fkey" FOREIGN KEY ("assistant_referee_1_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_assistant_referee_2_id_fkey" FOREIGN KEY ("assistant_referee_2_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_center_referee_id_fkey" FOREIGN KEY ("center_referee_id") REFERENCES "public"."members"("id");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_tournament_division_season_id_fkey" FOREIGN KEY ("tournament_division_season_id") REFERENCES "tournaments"."division_seasons"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."report_assets"
    ADD CONSTRAINT "report_assets_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."match_reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_cards"
    ADD CONSTRAINT "report_cards_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."match_reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_goals"
    ADD CONSTRAINT "report_goals_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."match_reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."report_injuries"
    ADD CONSTRAINT "report_injuries_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."match_reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."division_seasons"
    ADD CONSTRAINT "division_seasons_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "tournaments"."divisions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."division_seasons"
    ADD CONSTRAINT "division_seasons_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "tournaments"."seasons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."divisions"
    ADD CONSTRAINT "divisions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tournaments"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."match_context"
    ADD CONSTRAINT "match_context_away_team_registration_id_fkey" FOREIGN KEY ("away_team_registration_id") REFERENCES "tournaments"."team_registrations"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "tournaments"."match_context"
    ADD CONSTRAINT "match_context_division_season_id_fkey" FOREIGN KEY ("division_season_id") REFERENCES "tournaments"."division_seasons"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "tournaments"."match_context"
    ADD CONSTRAINT "match_context_home_team_registration_id_fkey" FOREIGN KEY ("home_team_registration_id") REFERENCES "tournaments"."team_registrations"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "tournaments"."match_context_logs"
    ADD CONSTRAINT "match_context_logs_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."match_context"
    ADD CONSTRAINT "match_context_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."match_rosters"
    ADD CONSTRAINT "match_rosters_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."match_rosters"
    ADD CONSTRAINT "match_rosters_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "tournaments"."players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."match_rosters"
    ADD CONSTRAINT "match_rosters_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "tournaments"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."player_registrations"
    ADD CONSTRAINT "player_registrations_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "tournaments"."players"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."player_registrations"
    ADD CONSTRAINT "player_registrations_team_registration_id_fkey" FOREIGN KEY ("team_registration_id") REFERENCES "tournaments"."team_registrations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."players"
    ADD CONSTRAINT "players_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tournaments"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."seasons"
    ADD CONSTRAINT "seasons_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tournaments"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."team_registrations"
    ADD CONSTRAINT "team_registrations_division_season_id_fkey" FOREIGN KEY ("division_season_id") REFERENCES "tournaments"."division_seasons"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."team_registrations"
    ADD CONSTRAINT "team_registrations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "tournaments"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "tournaments"."teams"
    ADD CONSTRAINT "teams_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "tournaments"."organizations"("id") ON DELETE CASCADE;



CREATE POLICY "Authenticated members can read current ranking" ON "development"."current_ranking_snapshot" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Members can read own monthly ranking history" ON "development"."monthly_ranking_snapshots" FOR SELECT TO "authenticated" USING (("member_id" = "auth"."uid"()));



ALTER TABLE "development"."attendance_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."attendance_scoring_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."attendance_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."current_ranking_snapshot" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."cycle_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."cycles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."monthly_ranking_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."quiz_access_grants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."quiz_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."quiz_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."quiz_attempt_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."quiz_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."quiz_question_groups" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."quiz_question_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."quiz_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."quiz_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "development"."scoring_periods" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Allow authenticated users to read match rosters" ON "league"."match_rosters" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read players" ON "league"."players" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read teams" ON "league"."teams" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "league"."match_rosters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "league"."players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "league"."teams" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Allow delete report assets" ON "public"."report_assets" FOR DELETE USING (true);



CREATE POLICY "Allow delete report cards" ON "public"."report_cards" FOR DELETE USING (true);



CREATE POLICY "Allow delete report goals" ON "public"."report_goals" FOR DELETE USING (true);



CREATE POLICY "Allow delete report injuries" ON "public"."report_injuries" FOR DELETE USING (true);



CREATE POLICY "Allow select own match reports" ON "public"."match_reports" FOR SELECT USING (("submitted_by" = "auth"."uid"()));



CREATE POLICY "Allow update own match reports" ON "public"."match_reports" FOR UPDATE USING (("submitted_by" = "auth"."uid"())) WITH CHECK (("submitted_by" = "auth"."uid"()));



CREATE POLICY "Board can view all matches" ON "public"."matches" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."members"
  WHERE (("members"."id" = "auth"."uid"()) AND ("members"."role" = 'board'::"public"."member_role")))));



CREATE POLICY "Board can view all reports" ON "public"."match_reports" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."members"
  WHERE (("members"."id" = "auth"."uid"()) AND ("members"."role" = 'board'::"public"."member_role")))));



CREATE POLICY "Members can read matches" ON "public"."matches" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "board_insert_matches" ON "public"."matches" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_board"());



ALTER TABLE "public"."evaluations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "evaluations_insert_evaluator_only" ON "public"."evaluations" FOR INSERT WITH CHECK ((("evaluator_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."matches" "m"
  WHERE (("m"."id" = "evaluations"."match_id") AND (("auth"."uid"() = "m"."center_referee_id") OR ("auth"."uid"() = "m"."assistant_referee_1_id") OR ("auth"."uid"() = "m"."assistant_referee_2_id")) AND (("evaluations"."evaluated_id" = "m"."center_referee_id") OR ("evaluations"."evaluated_id" = "m"."assistant_referee_1_id") OR ("evaluations"."evaluated_id" = "m"."assistant_referee_2_id")))))));



CREATE POLICY "evaluations_select_board_all" ON "public"."evaluations" FOR SELECT USING ("public"."is_board"());



CREATE POLICY "evaluations_select_participant" ON "public"."evaluations" FOR SELECT USING ((("evaluator_id" = "auth"."uid"()) OR ("evaluated_id" = "auth"."uid"())));



CREATE POLICY "evaluations_update_board_only" ON "public"."evaluations" FOR UPDATE USING ("public"."is_board"()) WITH CHECK ("public"."is_board"());



CREATE POLICY "evaluations_update_evaluator_only" ON "public"."evaluations" FOR UPDATE USING (("evaluator_id" = "auth"."uid"())) WITH CHECK (("evaluator_id" = "auth"."uid"()));



ALTER TABLE "public"."match_reports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "match_reports_insert_center_referee_only" ON "public"."match_reports" FOR INSERT WITH CHECK ((("submitted_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM "public"."matches" "m"
  WHERE (("m"."id" = "match_reports"."match_id") AND ("m"."center_referee_id" = "auth"."uid"()))))));



CREATE POLICY "match_reports_select_board_all" ON "public"."match_reports" FOR SELECT USING ("public"."is_board"());



CREATE POLICY "match_reports_select_safe" ON "public"."match_reports" FOR SELECT USING ((("submitted_by" = "auth"."uid"()) OR "public"."is_board"()));



CREATE POLICY "match_reports_update_board_only" ON "public"."match_reports" FOR UPDATE USING ("public"."is_board"()) WITH CHECK ("public"."is_board"());



ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "members_insert_board_only" ON "public"."members" FOR INSERT WITH CHECK ("public"."is_board"());



CREATE POLICY "members_select_board_all" ON "public"."members" FOR SELECT USING ("public"."is_board"());



CREATE POLICY "members_select_self" ON "public"."members" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "members_update_board_all" ON "public"."members" FOR UPDATE USING ("public"."is_board"()) WITH CHECK ("public"."is_board"());



CREATE POLICY "members_update_self" ON "public"."members" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."report_assets" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "report_assets_insert_center_referee_only" ON "public"."report_assets" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."matches" "m"
     JOIN "public"."match_reports" "mr" ON (("mr"."match_id" = "m"."id")))
  WHERE (("mr"."id" = "report_assets"."report_id") AND ("m"."center_referee_id" = "auth"."uid"())))));



CREATE POLICY "report_assets_select_board_all" ON "public"."report_assets" FOR SELECT USING ("public"."is_board"());



CREATE POLICY "report_assets_select_safe" ON "public"."report_assets" FOR SELECT USING ((("report_id" IN ( SELECT "match_reports"."id"
   FROM "public"."match_reports"
  WHERE ("match_reports"."submitted_by" = "auth"."uid"()))) OR "public"."is_board"()));



CREATE POLICY "report_assets_update_board_only" ON "public"."report_assets" FOR UPDATE USING ("public"."is_board"()) WITH CHECK ("public"."is_board"());



CREATE POLICY "report_assets_update_center_referee_only" ON "public"."report_assets" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."match_reports" "mr"
     JOIN "public"."matches" "m" ON (("m"."id" = "mr"."match_id")))
  WHERE (("mr"."id" = "report_assets"."report_id") AND ("m"."center_referee_id" = "auth"."uid"()) AND ("mr"."submitted_by" = "auth"."uid"()) AND ("mr"."status" = ANY (ARRAY['pending'::"public"."report_status", 'submitted'::"public"."report_status"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."match_reports" "mr"
     JOIN "public"."matches" "m" ON (("m"."id" = "mr"."match_id")))
  WHERE (("mr"."id" = "report_assets"."report_id") AND ("m"."center_referee_id" = "auth"."uid"()) AND ("mr"."submitted_by" = "auth"."uid"()) AND ("mr"."status" = ANY (ARRAY['pending'::"public"."report_status", 'submitted'::"public"."report_status"]))))));



ALTER TABLE "public"."report_cards" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "report_cards_insert_center_referee_only" ON "public"."report_cards" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."matches" "m"
     JOIN "public"."match_reports" "mr" ON (("mr"."match_id" = "m"."id")))
  WHERE (("mr"."id" = "report_cards"."report_id") AND ("m"."center_referee_id" = "auth"."uid"())))));



CREATE POLICY "report_cards_select_board_all" ON "public"."report_cards" FOR SELECT USING ("public"."is_board"());



CREATE POLICY "report_cards_select_safe" ON "public"."report_cards" FOR SELECT USING ((("report_id" IN ( SELECT "match_reports"."id"
   FROM "public"."match_reports"
  WHERE ("match_reports"."submitted_by" = "auth"."uid"()))) OR "public"."is_board"()));



CREATE POLICY "report_cards_update_board_only" ON "public"."report_cards" FOR UPDATE USING ("public"."is_board"()) WITH CHECK ("public"."is_board"());



CREATE POLICY "report_cards_update_center_referee_only" ON "public"."report_cards" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."match_reports" "mr"
     JOIN "public"."matches" "m" ON (("m"."id" = "mr"."match_id")))
  WHERE (("mr"."id" = "report_cards"."report_id") AND ("m"."center_referee_id" = "auth"."uid"()) AND ("mr"."submitted_by" = "auth"."uid"()) AND ("mr"."status" = ANY (ARRAY['pending'::"public"."report_status", 'submitted'::"public"."report_status"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."match_reports" "mr"
     JOIN "public"."matches" "m" ON (("m"."id" = "mr"."match_id")))
  WHERE (("mr"."id" = "report_cards"."report_id") AND ("m"."center_referee_id" = "auth"."uid"()) AND ("mr"."submitted_by" = "auth"."uid"()) AND ("mr"."status" = ANY (ARRAY['pending'::"public"."report_status", 'submitted'::"public"."report_status"]))))));



ALTER TABLE "public"."report_goals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "report_goals_insert_center_referee_only" ON "public"."report_goals" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."matches" "m"
     JOIN "public"."match_reports" "mr" ON (("mr"."match_id" = "m"."id")))
  WHERE (("mr"."id" = "report_goals"."report_id") AND ("m"."center_referee_id" = "auth"."uid"())))));



CREATE POLICY "report_goals_select_board_all" ON "public"."report_goals" FOR SELECT USING ("public"."is_board"());



CREATE POLICY "report_goals_select_safe" ON "public"."report_goals" FOR SELECT USING ((("report_id" IN ( SELECT "match_reports"."id"
   FROM "public"."match_reports"
  WHERE ("match_reports"."submitted_by" = "auth"."uid"()))) OR "public"."is_board"()));



CREATE POLICY "report_goals_update_board_only" ON "public"."report_goals" FOR UPDATE USING ("public"."is_board"()) WITH CHECK ("public"."is_board"());



CREATE POLICY "report_goals_update_center_referee_only" ON "public"."report_goals" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."match_reports" "mr"
     JOIN "public"."matches" "m" ON (("m"."id" = "mr"."match_id")))
  WHERE (("mr"."id" = "report_goals"."report_id") AND ("m"."center_referee_id" = "auth"."uid"()) AND ("mr"."submitted_by" = "auth"."uid"()) AND ("mr"."status" = ANY (ARRAY['pending'::"public"."report_status", 'submitted'::"public"."report_status"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."match_reports" "mr"
     JOIN "public"."matches" "m" ON (("m"."id" = "mr"."match_id")))
  WHERE (("mr"."id" = "report_goals"."report_id") AND ("m"."center_referee_id" = "auth"."uid"()) AND ("mr"."submitted_by" = "auth"."uid"()) AND ("mr"."status" = ANY (ARRAY['pending'::"public"."report_status", 'submitted'::"public"."report_status"]))))));



ALTER TABLE "public"."report_injuries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "report_injuries_insert_center_referee_only" ON "public"."report_injuries" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."match_reports" "mr"
     JOIN "public"."matches" "m" ON (("m"."id" = "mr"."match_id")))
  WHERE (("mr"."id" = "report_injuries"."report_id") AND ("m"."center_referee_id" = "auth"."uid"()) AND ("mr"."submitted_by" = "auth"."uid"()) AND ("mr"."status" = ANY (ARRAY['pending'::"public"."report_status", 'submitted'::"public"."report_status"]))))));



CREATE POLICY "report_injuries_select_assigned_member" ON "public"."report_injuries" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."match_reports" "mr"
     JOIN "public"."matches" "m" ON (("m"."id" = "mr"."match_id")))
  WHERE (("mr"."id" = "report_injuries"."report_id") AND (("auth"."uid"() = "m"."center_referee_id") OR ("auth"."uid"() = "m"."assistant_referee_1_id") OR ("auth"."uid"() = "m"."assistant_referee_2_id"))))));



CREATE POLICY "report_injuries_select_board_all" ON "public"."report_injuries" FOR SELECT USING ("public"."is_board"());



CREATE POLICY "report_injuries_update_board_only" ON "public"."report_injuries" FOR UPDATE USING ("public"."is_board"()) WITH CHECK ("public"."is_board"());



CREATE POLICY "report_injuries_update_center_referee_only" ON "public"."report_injuries" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."match_reports" "mr"
     JOIN "public"."matches" "m" ON (("m"."id" = "mr"."match_id")))
  WHERE (("mr"."id" = "report_injuries"."report_id") AND ("m"."center_referee_id" = "auth"."uid"()) AND ("mr"."submitted_by" = "auth"."uid"()) AND ("mr"."status" = ANY (ARRAY['pending'::"public"."report_status", 'submitted'::"public"."report_status"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."match_reports" "mr"
     JOIN "public"."matches" "m" ON (("m"."id" = "mr"."match_id")))
  WHERE (("mr"."id" = "report_injuries"."report_id") AND ("m"."center_referee_id" = "auth"."uid"()) AND ("mr"."submitted_by" = "auth"."uid"()) AND ("mr"."status" = ANY (ARRAY['pending'::"public"."report_status", 'submitted'::"public"."report_status"]))))));



CREATE POLICY "Allow authenticated users to read divisions" ON "tournaments"."divisions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read match rosters" ON "tournaments"."match_rosters" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read organizations" ON "tournaments"."organizations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read players" ON "tournaments"."players" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow authenticated users to read teams" ON "tournaments"."teams" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "tournaments"."division_seasons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "tournaments"."divisions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "tournaments"."match_context" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "tournaments"."match_context_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "tournaments"."match_rosters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "tournaments"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "tournaments"."player_registrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "tournaments"."players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "tournaments"."seasons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "tournaments"."team_registrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "tournaments"."teams" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "development" TO "service_role";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT USAGE ON SCHEMA "tournaments" TO "anon";
GRANT USAGE ON SCHEMA "tournaments" TO "authenticated";
GRANT USAGE ON SCHEMA "tournaments" TO "service_role";
























REVOKE ALL ON FUNCTION "development"."capture_monthly_ranking_snapshot"("p_cycle_id" "uuid", "p_month_start" "date") FROM PUBLIC;
GRANT ALL ON FUNCTION "development"."capture_monthly_ranking_snapshot"("p_cycle_id" "uuid", "p_month_start" "date") TO "service_role";



REVOKE ALL ON FUNCTION "development"."capture_previous_month_ranking_snapshot"() FROM PUBLIC;
GRANT ALL ON FUNCTION "development"."capture_previous_month_ranking_snapshot"() TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."quiz_attempts" TO "service_role";



REVOKE ALL ON FUNCTION "development"."finalize_quiz_attempt"("p_attempt_id" "uuid", "p_member_id" "uuid", "p_finalize_as" "development"."quiz_attempt_status") FROM PUBLIC;
GRANT ALL ON FUNCTION "development"."finalize_quiz_attempt"("p_attempt_id" "uuid", "p_member_id" "uuid", "p_finalize_as" "development"."quiz_attempt_status") TO "service_role";



GRANT ALL ON FUNCTION "development"."prevent_scoring_period_overlap"() TO "service_role";



GRANT ALL ON FUNCTION "development"."protect_started_scoring_period"() TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."quiz_assessments" TO "service_role";



REVOKE ALL ON FUNCTION "development"."publish_quiz_assessment"("p_assessment_id" "uuid", "p_published_by" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "development"."publish_quiz_assessment"("p_assessment_id" "uuid", "p_published_by" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "development"."refresh_active_cycle_ranking_snapshot"() FROM PUBLIC;
GRANT ALL ON FUNCTION "development"."refresh_active_cycle_ranking_snapshot"() TO "service_role";



REVOKE ALL ON FUNCTION "development"."refresh_current_ranking_snapshot"("p_cycle_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "development"."refresh_current_ranking_snapshot"("p_cycle_id" "uuid") TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."quiz_answers" TO "service_role";



REVOKE ALL ON FUNCTION "development"."save_quiz_answer"("p_attempt_id" "uuid", "p_member_id" "uuid", "p_attempt_question_id" "uuid", "p_selected_option_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "development"."save_quiz_answer"("p_attempt_id" "uuid", "p_member_id" "uuid", "p_attempt_question_id" "uuid", "p_selected_option_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "development"."start_quiz_attempt"("p_assessment_id" "uuid", "p_member_id" "uuid", "p_language" "development"."quiz_language") FROM PUBLIC;
GRANT ALL ON FUNCTION "development"."start_quiz_attempt"("p_assessment_id" "uuid", "p_member_id" "uuid", "p_language" "development"."quiz_language") TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."current_member_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_member_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_member_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_board"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_board"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_board"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_match_report_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_match_report_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_match_report_status"() TO "service_role";



REVOKE ALL ON FUNCTION "tournaments"."build_match_context"("p_match_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "tournaments"."build_match_context"("p_match_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "tournaments"."build_match_context"("p_match_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "tournaments"."handle_match_context_trigger"() FROM PUBLIC;
GRANT ALL ON FUNCTION "tournaments"."handle_match_context_trigger"() TO "service_role";



REVOKE ALL ON FUNCTION "tournaments"."import_team_roster"("p_organization_name" "text", "p_season_term" "text", "p_season_year" integer, "p_external_team_id" "text", "p_players" "jsonb", "p_deactivate_missing" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "tournaments"."import_team_roster"("p_organization_name" "text", "p_season_term" "text", "p_season_year" integer, "p_external_team_id" "text", "p_players" "jsonb", "p_deactivate_missing" boolean) TO "service_role";



GRANT ALL ON FUNCTION "tournaments"."set_updated_at"() TO "service_role";


















GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."attendance_records" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."attendance_scoring_rules" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."attendance_sessions" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."current_ranking_snapshot" TO "service_role";
GRANT SELECT ON TABLE "development"."current_ranking_snapshot" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."cycle_members" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."cycles" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."cycle_months_v2" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."monthly_ranking_snapshots" TO "service_role";
GRANT SELECT ON TABLE "development"."monthly_ranking_snapshots" TO "authenticated";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."quiz_access_grants" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."quiz_attempt_questions" TO "service_role";



GRANT ALL ON TABLE "public"."members" TO "anon";
GRANT ALL ON TABLE "public"."members" TO "authenticated";
GRANT ALL ON TABLE "public"."members" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."quiz_member_best_results" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."quiz_question_groups" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."quiz_question_options" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."quiz_questions" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."quiz_versions" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."referee_attendance_detail" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."referee_attendance" TO "service_role";



GRANT ALL ON TABLE "public"."evaluations" TO "anon";
GRANT ALL ON TABLE "public"."evaluations" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluations" TO "service_role";



GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."referee_evaluation_detail" TO "service_role";



GRANT ALL ON TABLE "public"."match_reports" TO "anon";
GRANT ALL ON TABLE "public"."match_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."match_reports" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."referee_report_detail" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."scoring_periods" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."referee_monthly_period_metric_scores_v2" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."referee_monthly_development_score_v2" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."referee_monthly_ranking_evidence_v2" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."referee_monthly_ranking_history_v2" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."referee_current_ranking_v2" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."referee_evaluation_score" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."referee_quiz_score" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "development"."referee_report_score" TO "service_role";









GRANT ALL ON TABLE "public"."arbiter_referees" TO "anon";
GRANT ALL ON TABLE "public"."arbiter_referees" TO "authenticated";
GRANT ALL ON TABLE "public"."arbiter_referees" TO "service_role";



GRANT ALL ON TABLE "public"."card_reasons" TO "anon";
GRANT ALL ON TABLE "public"."card_reasons" TO "authenticated";
GRANT ALL ON TABLE "public"."card_reasons" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_pending_reports" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_pending_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_pending_reports" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_referee_activity" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_referee_activity" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_referee_activity" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_referee_matches" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_referee_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_referee_matches" TO "service_role";



GRANT ALL ON TABLE "public"."dashboard_upcoming_matches" TO "anon";
GRANT ALL ON TABLE "public"."dashboard_upcoming_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."dashboard_upcoming_matches" TO "service_role";



GRANT ALL ON TABLE "public"."report_assets" TO "anon";
GRANT ALL ON TABLE "public"."report_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."report_assets" TO "service_role";



GRANT ALL ON TABLE "public"."report_cards" TO "anon";
GRANT ALL ON TABLE "public"."report_cards" TO "authenticated";
GRANT ALL ON TABLE "public"."report_cards" TO "service_role";



GRANT ALL ON TABLE "public"."report_goals" TO "anon";
GRANT ALL ON TABLE "public"."report_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."report_goals" TO "service_role";



GRANT ALL ON TABLE "public"."report_injuries" TO "anon";
GRANT ALL ON TABLE "public"."report_injuries" TO "authenticated";
GRANT ALL ON TABLE "public"."report_injuries" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "tournaments"."division_seasons" TO "service_role";



GRANT ALL ON TABLE "tournaments"."divisions" TO "anon";
GRANT ALL ON TABLE "tournaments"."divisions" TO "authenticated";
GRANT ALL ON TABLE "tournaments"."divisions" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "tournaments"."match_context" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "tournaments"."match_context_logs" TO "service_role";



GRANT ALL ON TABLE "tournaments"."match_rosters" TO "anon";
GRANT ALL ON TABLE "tournaments"."match_rosters" TO "authenticated";
GRANT ALL ON TABLE "tournaments"."match_rosters" TO "service_role";



GRANT ALL ON TABLE "tournaments"."players" TO "anon";
GRANT ALL ON TABLE "tournaments"."players" TO "authenticated";
GRANT ALL ON TABLE "tournaments"."players" TO "service_role";



GRANT ALL ON TABLE "tournaments"."teams" TO "anon";
GRANT ALL ON TABLE "tournaments"."teams" TO "authenticated";
GRANT ALL ON TABLE "tournaments"."teams" TO "service_role";



GRANT ALL ON TABLE "tournaments"."match_roster_view" TO "anon";
GRANT ALL ON TABLE "tournaments"."match_roster_view" TO "authenticated";
GRANT ALL ON TABLE "tournaments"."match_roster_view" TO "service_role";



GRANT ALL ON TABLE "tournaments"."organizations" TO "anon";
GRANT ALL ON TABLE "tournaments"."organizations" TO "authenticated";
GRANT ALL ON TABLE "tournaments"."organizations" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "tournaments"."seasons" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "tournaments"."team_registrations" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "tournaments"."player_card_reason_stats" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "tournaments"."player_registrations" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "tournaments"."player_team_season_stats" TO "service_role";



GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "tournaments"."team_season_standings" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "development" GRANT USAGE ON SEQUENCES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "development" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "development" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "tournaments" GRANT ALL ON FUNCTIONS TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "tournaments" GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO "service_role";




























