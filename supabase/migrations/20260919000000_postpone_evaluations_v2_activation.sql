-- Evaluations V2: postpone the technical activation boundary by one week.
-- This is not a Development cycle or scoring-period date change.

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
          WHERE (("c"."status" = 'active'::"development"."cycle_status") AND ((("m"."kickoff_at")::"date" >= '2026-09-25'::"date") OR ("m"."id" = 'cb5cb563-d55d-4c74-a91f-e28b9e486e55'::"uuid")) AND ("m"."kickoff_at" < ("now"() AT TIME ZONE 'America/Los_Angeles'::"text")))
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

