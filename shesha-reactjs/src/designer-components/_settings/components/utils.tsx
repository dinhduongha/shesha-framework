import { IPropertySetting } from "@/interfaces";

/**
 * Checks if the provided data is an instance of IPropertySetting.
 *
 * @param {any} data - The data to be checked
 * @return {boolean} Indicates whether the data is an instance of IPropertySetting
 */
export const isPropertySettings = <Value = any>(data: any): data is IPropertySetting<Value> => {
    if (!data || typeof data !== 'object')
        return false;

    const typed = data as IPropertySetting;
    return typed._mode === 'code' || typed._mode === 'value';
};

export const getPropertySettingsFromData = (data: any, propName: string): IPropertySetting => {
    if (!propName || !data)
        return { _mode: 'value', _code: undefined, _value: undefined };

    const propNames = propName.split('.');
    let val = data;
    propNames.forEach(p => {
        val = val?.[p];
    });

    if (isPropertySettings(val))
        return val;
    else
        return { _mode: 'value', _code: undefined, _value: val };
};

export const updateSettingsFromValues = <T,>(model: T, values: T): T => {
    const copy = { ...model };
    Object.keys(values).forEach(k => {
        if (isPropertySettings(copy[k]) && !isPropertySettings(values[k]))
            copy[k]._value = values[k];
        else
            copy[k] = values[k];
    });
    return copy;
};

export const getValueFromPropertySettings = (value: any): any => {
    if (isPropertySettings(value))
        return value._value;
    else
        return value;
};

export const getValuesFromSettings = <T,>(model: T): T => {
    const copy = { ...model };
    Object.keys(copy).forEach(k => {
        copy[k] = getValueFromPropertySettings(copy[k]);
    });
    return copy;
};

export const getPropertySettingsFromValue = (value: any): IPropertySetting => {
    if (!isPropertySettings(value) || !value)
        return { _mode: 'value', _code: undefined, _value: value };
    else
        return value;
};

/**
 * Evaluates a string expression in the context of the provided data object.
 * @param expression The string expression to evaluate.
 * @param data The data object to use as context for the evaluation.
 * @returns The result of the evaluated expression.
 */
const evaluateString = (expression: string, data: any): any => {
    try {
        // Create a new function with 'data' as a parameter and the expression as the function body
        const func = new Function('data', expression);
        // Execute the function with the provided data
        return func(data);
    } catch (error) {
        console.error('Error evaluating expression:', expression, error);
        return null;
    }
};

export const filterDynamicComponents = (components, query, data) => {
    if (!components || !Array.isArray(components)) return [];

    const lowerCaseQuery = query.toLowerCase();

    // Helper function to evaluate hidden property
    const evaluateHidden = (hidden, directMatch, hasVisibleChildren) => {
        if (typeof hidden === 'string') {
            console.log("evaluate hidden property Hidden::  ", hidden, " :: ", evaluateString(hidden, data));
            return evaluateString(hidden, data);
        }
        return hidden || (!directMatch && !hasVisibleChildren);
    };

    // Helper function to check if text matches query
    const matchesQuery = (text) => text?.toLowerCase().includes(lowerCaseQuery);

    const filterResult = components.map(component => {
        // Deep clone the component to avoid mutations
        const c = { ...component };

        // Check if component matches query directly
        const directMatch = (
            matchesQuery(c.label) ||
            matchesQuery(c.propertyName) ||
            (c.propertyName && matchesQuery(c.propertyName.split('.').join(' ')))
        );

        // Handle propertyRouter
        if (c.type === 'propertyRouter') {
            const filteredComponents = filterDynamicComponents(c.components, query, data);
            const hasVisibleChildren = filteredComponents.length > 0;
            return {
                ...c,
                components: filteredComponents,
                hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren)
            };
        }

        // Handle collapsiblePanel
        if (c.type === 'collapsiblePanel') {
            const contentComponents = filterDynamicComponents(c.content?.components || [], query, data);
            const hasVisibleChildren = contentComponents.length > 0;

            return {
                ...c,
                content: {
                    ...c.content,
                    components: contentComponents
                },
                hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren)
            };
        }

        // Handle settingsInputRow
        if (c.type === 'settingsInputRow') {
            const filteredInputs = c.inputs?.filter(input =>
                matchesQuery(input.label) ||
                matchesQuery(input.propertyName) ||
                (input.propertyName && matchesQuery(input.propertyName.split('.').join(' ')))
            ) || [];

            return {
                ...c,
                inputs: filteredInputs,
                hidden: evaluateHidden(c.hidden, directMatch, filteredInputs.length > 0)
            };
        }

        // Handle components with nested components
        if (c.components) {
            const filteredComponents = filterDynamicComponents(c.components, query, data);
            const hasVisibleChildren = filteredComponents.length > 0;

            return {
                ...c,
                components: filteredComponents,
                hidden: evaluateHidden(c.hidden, directMatch, hasVisibleChildren)
            };
        }

        // Handle inputs array if present
        if (c.inputs) {
            const filteredInputs = c.inputs?.filter(input =>
                matchesQuery(input.label) ||
                matchesQuery(input.propertyName) ||
                (input.propertyName && matchesQuery(input.propertyName.split('.').join(' ')))
            ) || [];

            return {
                ...c,
                inputs: filteredInputs,
                hidden: evaluateHidden(c.hidden, directMatch, filteredInputs.length > 0)
            };
        }

        // Handle basic component
        return {
            ...c,
            hidden: evaluateHidden(c.hidden, directMatch, false)
        };
    });

    // Filter out null components and handle visibility
    return filterResult.filter(c => {
        if (!c) return false;

        // Evaluate final hidden state
        const hasVisibleChildren = (
            (c.components && c.components.length > 0) ||
            (c.content?.components && c.content.components.length > 0) ||
            (c.inputs && c.inputs.length > 0)
        );

        const isHidden = typeof c.hidden === 'string'
            ? evaluateString(c.hidden, data)
            : c.hidden;

        return !isHidden || hasVisibleChildren;
    });
};