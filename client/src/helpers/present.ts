/**
 * Type guard that asserts that a value is present.
 * This type guard can be used if a value's type might be null or undefined,
 * but we are sure that the value is actually present.
 * @param value the value to be checked
 */
export function present<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}