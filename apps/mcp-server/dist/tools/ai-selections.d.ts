import { z } from "zod";
export declare const saveAiSelectionsSchema: z.ZodObject<{
    assessment_id: z.ZodString;
    selections: z.ZodRecord<z.ZodString, z.ZodBoolean>;
    disabled_reasons: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    assessment_id: string;
    selections: Record<string, boolean>;
    disabled_reasons: Record<string, string>;
}, {
    assessment_id: string;
    selections: Record<string, boolean>;
    disabled_reasons?: Record<string, string> | undefined;
}>;
export declare function saveAiSelections(input: z.infer<typeof saveAiSelectionsSchema>): Promise<{
    success: boolean;
    total: number;
}>;
//# sourceMappingURL=ai-selections.d.ts.map