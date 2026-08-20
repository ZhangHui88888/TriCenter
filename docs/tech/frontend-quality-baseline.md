# Frontend quality baseline

CI runs Knip and jscpd as regression gates. The following Knip findings are deliberately
baselined, not deleted, because repository rules require separate approval before file or
dependency removal:

- `src/data/mockData.ts`
- `src/components/EmptyState.tsx`
- `src/components/index.ts`
- `src/components/PageLoading.tsx`
- `src/pages/ProviderList.tsx`
- `src/services/index.ts`
- `src/utils/exportEnterpriseExcel.ts`
- `@ant-design/pro-components`, `exceljs`, `file-saver`, their type package, and currently
  inactive lint/PostCSS plugins

Any newly unused file or dependency still fails CI. `AnimatedCharacters.tsx` is excluded from
copy/paste measurement because its repeated declarative shapes are intentional artwork; all
business code remains subject to the 1.2% duplication threshold.

The type-debt ratchet currently permits the 417 legacy `any` occurrences discovered after
removing all 22 `@ts-nocheck` directives. CI rejects any increase; future DTO-adapter work must
only lower this number.
