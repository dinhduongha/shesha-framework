import React, { cloneElement, FC, ReactElement } from 'react';
import { ConfigurableFormItem } from '@/components';
import SettingsControl from '../settingsControl';
import { ISettingsFormItemProps } from '../settingsFormItem';
import { useStyles } from '../styles/styles';

const FormItem: FC<ISettingsFormItemProps> = (props) => {
    const { styles } = useStyles();
    const { name, label, tooltip, required, hidden, jsSetting, children, valuePropName = 'value', layout } = props;
    const childElement = children as ReactElement;
    const readOnly = props.readOnly || childElement.props.readOnly || childElement.props.disabled;

    const handleChange = (onChange) => (...args: any[]) => {
        const event = args[0];
        const data = event && event.target && typeof event.target === 'object' && valuePropName in event.target
            ? (event.target as HTMLInputElement)[valuePropName]
            : event;
        onChange(data);
    };

    const createClonedElement = (value, onChange) => cloneElement(
        childElement,
        {
            ...childElement?.props,
            readOnly,
            size: 'small',
            disabled: readOnly,
            onChange: handleChange(onChange),
            [valuePropName]: value
        }
    );

    return (
        <ConfigurableFormItem
            model={{
                hideLabel: props.hideLabel,
                propertyName: name,
                label: <span className={styles.label} style={{ fontWeight: 500, fontSize: '11px', color: 'darkslategrey', maxHeight: '28px' }}>{label}</span>,
                type: '',
                id: '',
                description: tooltip,
                validate: { required },
                hidden,
                layout,
                size: 'small',

            }}

            className='sha-js-label'
        >
            {(value, onChange) =>
                jsSetting === false ? (
                    createClonedElement(value, onChange)
                ) : (
                    <SettingsControl
                        propertyName={name}
                        mode={'value'}
                        onChange={onChange}
                        value={value}
                        readOnly={readOnly}
                    >
                        {(value, onChange) => createClonedElement(value, onChange)}
                    </SettingsControl>
                )
            }
        </ConfigurableFormItem>
    );
};

export default FormItem;