import { Checkbox, Form, Input, Select } from 'antd';
import React, { FC } from 'react';
import FormAutocomplete from '../../../formAutocomplete';
import PropertyAutocomplete from '../../../propertyAutocomplete/propertyAutocomplete';
import SectionSeparator from '../../../sectionSeparator';
import CodeEditor from '../codeEditor/codeEditor';
import { IJsonEntityProps } from './models';

const FormItem = Form.Item;
const { Option } = Select;

export interface IJsonEntitySettingsProps {
  readOnly: boolean;
  model: IJsonEntityProps;
  onSave: (model: IJsonEntityProps) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: IJsonEntityProps) => void;
}

export const JsonEntitySettings: FC<IJsonEntitySettingsProps> = ({ readOnly, onSave, model, onValuesChange }) => {
  const [form] = Form.useForm();

  const handleValuesChange = (changedValues: IJsonEntityProps, values: IJsonEntityProps) => {
    if (readOnly) return;

    form?.setFieldsValue(changedValues);

    onValuesChange(changedValues, values);
  };

  return (
    <Form form={form} onFinish={onSave} layout="vertical" onValuesChange={handleValuesChange} initialValues={model}>
      <SectionSeparator title="Display" />

      <FormItem name="name" label="Name" rules={[{ required: true }]}>
        <PropertyAutocomplete id="415cc8ec-2fd1-4c5a-88e2-965153e16069" readOnly={readOnly} />
      </FormItem>

      <FormItem name="label" label="Label">
        <Input readOnly={readOnly} />
      </FormItem>

      <Form.Item name="readOnly" label="Read Only" valuePropName="checked">
        <Checkbox disabled={readOnly} />
      </Form.Item>

      <SectionSeparator title="Display" />

      <FormItem name="modalWidth" label="Modal Width">
        <Select disabled={readOnly} defaultValue="60%">
          <Option value="100%">Full</Option>
          <Option value="80%">Large</Option>
          <Option value="60%">Medium</Option>
          <Option value="40%">Small</Option>
        </Select>
      </FormItem>

      <SectionSeparator title="Render" />

      <FormItem name="labelFormat" label="Label Format" required>
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="labelFormat"
          type={''}
          id={''}
          label="Label Format"
          description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
          exposedVariables={[
            {
              id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
              name: 'data',
              description: 'Form data',
              type: 'object',
            },
            {
              id: '65b71112-d412-401f-af15-1d3080f85319',
              name: 'globalState',
              description: 'The global state',
              type: 'object',
            },
          ]}
        />
      </FormItem>

      <FormItem name="formId" label="Form Path">
        <FormAutocomplete readOnly={readOnly} convertToFullId={true} />
      </FormItem>

      <SectionSeparator title="Visibility" />

      <FormItem
        label="Custom Visibility"
        name="customVisibility"
        tooltip="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
      >
        <CodeEditor
          readOnly={readOnly}
          mode="dialog"
          label="Custom Visibility"
          setOptions={{ minLines: 20, maxLines: 500, fixedWidthGutter: true }}
          name="customVisibility"
          type={''}
          id={''}
          description="Enter custom visibility code.  You must return true to show the component. The global variable data is provided, and allows you to access the data of any form component, by using its API key."
          exposedVariables={[
            {
              id: '788673a5-5eb9-4a9a-a34b-d8cea9cacb3c',
              name: 'data',
              description: 'Form data',
              type: 'object',
            },
            {
              id: '65b71112-d412-401f-af15-1d3080f85319',
              name: 'globalState',
              description: 'The global state',
              type: 'object',
            },
            {
              id: '3633b881-43f4-4779-9f8c-da3de9ecf9b8',
              name: 'queryParams',
              description: 'Query parameters',
              type: 'object',
            },
          ]}
        />
      </FormItem>
    </Form>
  );
};