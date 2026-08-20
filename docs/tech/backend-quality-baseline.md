# Backend quality baseline

The first JaCoCo run on the hardening branch measured 7% global line coverage across 201
classes. The `quality-gate` Maven profile therefore starts with a 7% non-regression floor so
CI remains actionable. The target remains 50% globally and 80% for authentication,
authorization, import, migration, and AI paths; every test increment should raise the floor.

PMD is limited to priority 1-3 error-prone/security rules. SpotBugs fails on Medium or higher
(rank 14 and below). The only SpotBugs exclusions cover mutable DTO/entity collection accessors
required by Jackson and MyBatis, documented in `backend/config/spotbugs-exclude.xml`.
