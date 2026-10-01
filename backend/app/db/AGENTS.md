# Database and migrations

- No database, ORM, or migration tool has been selected. The `db/`, `models/`, `repositories/`, and `migrations/` areas are scaffolding only.
- Do not add a database driver, ORM, schema, connection/session implementation, or migration tool until the project has selected a database stack.
- When a stack is selected, document its choices and commands here, manage its dependencies through `uv`, and keep `uv.lock` updated.
- Model relational data in a normalized form by default. Choose column types based on the selected database and data semantics; do not store structured values as text by default or denormalize without a concrete requirement.
- Keep database access and migrations aligned with the selected ORM and migration tool; do not introduce parallel persistence patterns.
