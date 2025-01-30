import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { FormLayout } from 'antd/lib/form/Form';
import { getBorderInputs, getCornerInputs } from '../_settings/utils/border/utils';
import { positionOptions } from '../_settings/utils/background/utils';

export const getSettings = (data) => {

    return {

        components: new DesignerToolbarSettings(data)
            .addSearchableTabs({
                id: 'W_m7doMyCpCYwAYDfRh6I',
                propertyName: 'settingsTabs',
                parentId: 'root',
                label: 'Settings',
                hideLabel: true,
                labelAlign: 'right',
                size: 'small',
                tabs: [
                    {
                        key: '1',
                        title: 'Common',
                        id: 's4gmBg31azZC0UjZjpfTm',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                id: '5c813b1a-04c5-4658-ac0f-cbcbae6b3bd4',
                                propertyName: 'propertyName',
                                label: 'Property Name',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                size: 'small',
                                validate: {
                                    required: true,
                                },
                                jsSetting: true,
                            })
                            .addLabelConfigurator({
                                id: '46d07439-4c18-468c-89e1-60c002ce96c5',
                                propertyName: 'hideLabel',
                                label: 'label',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                hideLabel: true,
                            })
                            .addSettingsInput({
                                id: 'alt-text-c4sf4ff-f4ffe-4r34fc',
                                propertyName: 'alt',
                                label: 'Alt Text',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                            })
                            .addSettingsInput({
                                id: 'img-desc-4f4f4f4f-4f4f4f4f-4f4f4f4f',
                                propertyName: 'description',
                                label: 'Description',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                            })
                            .addSettingsInputRow({
                                id: '12d700d6-ed4d-49d5-9cfd-fe8f0060f3b6',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        type: 'editModeSelector',
                                        id: 'editMode-s4gmBg31azZC0UjZjpfTm',
                                        propertyName: 'editMode',
                                        label: 'Edit Mode',
                                        size: 'small',
                                        jsSetting: true,
                                    },
                                    {
                                        type: 'switch',
                                        id: 'hidden-s4gmBg31azZC0UjZjpfTm',
                                        propertyName: 'hidden',
                                        label: 'Hide',
                                        jsSetting: true,
                                        layout: 'horizontal',
                                    },
                                ],
                            })
                            .addSettingsInput({
                                id: 'allow-preview-s4gmBg31azZC0UjZjpfTm',
                                propertyName: 'allowPreview',
                                label: 'Allow Preview',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputType: 'switch'
                            })
                            .addSettingsInput({
                                id: 'allowed-type-s4gmBg31azZC0UjZjpfTm',
                                propertyName: 'allowedFileTypes',
                                label: 'Allowed File Types',
                                inputType: 'editableTagGroupProps',
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                            })
                            .addSettingsInput({
                                id: "image-source-type",
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                label: "Image Source Type",
                                jsSetting: false,
                                propertyName: "dataSource",
                                inputType: "radio",
                                tooltip: "Select a type of background",
                                buttonGroupOptions: [
                                    {
                                        title: "StoredFile",
                                        icon: "DatabaseOutlined",
                                        value: "storedFile",
                                    },
                                    {
                                        title: "Url",
                                        icon: "LinkOutlined",
                                        value: "url",
                                    },
                                    {
                                        title: "Base64",
                                        icon: "PictureOutlined",
                                        value: "base64",
                                    }
                                ],
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                                id: "image-url",
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputs: [{
                                    type: 'text',
                                    id: 'data-source-url',
                                    propertyName: "url",
                                    jsSetting: false,
                                    label: "URL",
                                }],
                                hidden: {
                                    _code: "return getSettingValue(data?.dataSource) !== 'url';",
                                    _mode: "code",
                                    _value: false
                                },
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                                id: "1ad43b1a-04c5-4658-ac0f-cbcbae6b3bd4",
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                inputs: [{
                                    id: "base-64",
                                    type: "imageUploader",
                                    parentId: 's4gmBg31azZC0UjZjpfTm',
                                    label: "Upload Image",
                                    propertyName: "base64",
                                }],
                                hidden: {
                                    _code: "return getSettingValue(data?.dataSource) !== 'base64';",
                                    _mode: "code",
                                    _value: false
                                },
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                            })
                            .addSettingsInputRow({
                                id: "image-storedFile",
                                parentId: 's4gmBg31azZC0UjZjpfTm',
                                hidden: {
                                    _code: "return getSettingValue(data?.dataSource) !== 'storedFile';",
                                    _mode: "code",
                                    _value: false
                                },
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                inputs: [
                                    {
                                        type: 'text',
                                        id: 'image-storedFile-id',
                                        jsSetting: false,
                                        propertyName: "storedFileId",
                                        label: "File ID"
                                    }
                                ]
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '2',
                        title: 'Validation',
                        id: '6eBJvoll3xtLJxdvOAlnB',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: '3be9da3f-f47e-48ae-b4c3-f5cc36e534d9',
                                propertyName: 'validate.required',
                                label: 'Required',
                                inputType: 'switch',
                                size: 'small',
                                layout: 'horizontal',
                                jsSetting: true,
                                parentId: '6eBJvoll3xtLJxdvOAlnB'
                            })
                            .toJson()
                        ]
                    },
                    {
                        key: '3',
                        title: 'Appearance',
                        id: 'elgrlievlfwehhh848r8hsdnflsdnclurbd',
                        components: [
                            ...new DesignerToolbarSettings()
                                .addCollapsiblePanel({
                                    id: 'dimensionsStyleCollapsiblePanel',
                                    propertyName: 'pnlDimensions',
                                    label: 'Dimensions',
                                    parentId: 'styleRouter',
                                    labelAlign: 'right',
                                    ghost: true,
                                    collapsible: 'header',
                                    content: {
                                        id: 'dimensionsStylePnl',
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInputRow({
                                                id: 'dimensionsStyleRowWidth',
                                                parentId: 'dimensionsStylePnl',
                                                inline: true,
                                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                inputs: [
                                                    {
                                                        type: 'text',
                                                        id: 'width-s4gmBg31azZC0UjZjpfTm',
                                                        label: "Width",
                                                        width: 85,
                                                        propertyName: "width",
                                                        icon: "widthIcon",
                                                        tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"

                                                    },
                                                    {
                                                        type: 'text',
                                                        id: 'height-s4gmBg31azZC0UjZjpfTm',
                                                        label: "Height",
                                                        width: 85,
                                                        propertyName: "height",
                                                        icon: "heightIcon",
                                                        tooltip: "You can use any unit (%, px, em, etc). px by default if without unit"
                                                    },

                                                ]
                                            })
                                            .toJson()
                                        ]
                                    }
                                })
                                .addCollapsiblePanel({
                                    id: 'size-position-CollapsiblePanel',
                                    propertyName: 'pnlsize-position-',
                                    label: 'Picture Style',
                                    labelAlign: 'right',
                                    ghost: true,
                                    parentId: 'styleRouter',
                                    collapsible: 'header',
                                    content: {
                                        id: 'size-position-Pnl',
                                        components: [
                                            ...new DesignerToolbarSettings()
                                                .addSettingsInputRow({
                                                    id: "size-position-Row-controls",
                                                    parentId: 'size-position-Pnl',
                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                    inputs: [
                                                        {
                                                            type: 'dropdown',
                                                            id: 'image-object-fit',
                                                            label: "Object Fit",
                                                            propertyName: "objectFit",
                                                            dropdownOptions: [
                                                                {
                                                                    value: "cover",
                                                                    label: "Cover"
                                                                },
                                                                {
                                                                    value: "contain",
                                                                    label: "Contain"
                                                                },
                                                                {
                                                                    value: "fill",
                                                                    label: "Fill"
                                                                },
                                                                {
                                                                    value: "auto",
                                                                    label: "Auto"
                                                                }
                                                            ],
                                                        },
                                                        {
                                                            type: 'customDropdown',
                                                            id: 'size-position-Row-position',
                                                            label: "Object Position",
                                                            propertyName: "objectPosition",
                                                            dropdownOptions: positionOptions,
                                                        }
                                                    ]
                                                })
                                                .addSettingsInputRow({
                                                    id: "filter-controls",
                                                    parentId: 'size-position-Pnl',
                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                    inputs: [
                                                        {
                                                            id: 'e34507ac-593a-44b7-bcfa-638ad7aff222',
                                                            parentId: 'size-position-Pnl',
                                                            type: 'dropdown',
                                                            label: 'Filter',
                                                            propertyName: 'filter',
                                                            dropdownOptions: [
                                                                {
                                                                    value: 'none',
                                                                    label: 'None'
                                                                },
                                                                {
                                                                    value: 'grayscale',
                                                                    label: 'Grayscale'
                                                                },
                                                                {
                                                                    value: 'sepia',
                                                                    label: 'Sepia'
                                                                },
                                                                {
                                                                    value: 'blur',
                                                                    label: 'Blur'
                                                                },
                                                                {
                                                                    value: 'brightness',
                                                                    label: 'Brightness'
                                                                },
                                                                {
                                                                    value: 'contrast',
                                                                    label: 'Contrast'
                                                                },
                                                                {
                                                                    value: 'hue-rotate',
                                                                    label: 'Hue Rotate'
                                                                },
                                                                {
                                                                    value: 'invert',
                                                                    label: 'Invert'
                                                                },
                                                                {
                                                                    value: 'saturate',
                                                                    label: 'Saturate'
                                                                }
                                                            ]
                                                        },
                                                        {
                                                            id: 'filter-intensity',
                                                            label: 'Filter Intensity',
                                                            propertyName: 'filterIntensity',
                                                            type: 'number',
                                                        }
                                                    ]
                                                })
                                                .addSettingsInputRow({
                                                    id: 'opacity-filter-row',
                                                    parentId: 'size-position-Pnl',
                                                    readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                    inputs: [{
                                                        id: 'opacity-filter',
                                                        label: 'Opacity',
                                                        propertyName: 'opacity',
                                                        type: 'number',
                                                    }],
                                                    hidden: {
                                                        _code: 'return  getSettingValue(data?.filter) !== "opacity";',
                                                        _mode: 'code', _value: false
                                                    }
                                                })
                                                .toJson()
                                        ],
                                    }
                                })
                                .addCollapsiblePanel({
                                    id: 'borderStyleCollapsiblePanel',
                                    propertyName: 'pnlBorderStyle',
                                    label: 'Border',
                                    labelAlign: 'right',
                                    ghost: true,
                                    parentId: 'styleRouter',
                                    collapsible: 'header',
                                    content: {
                                        id: 'borderStylePnl',
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInputRow({
                                                id: `borderStyleRow`,
                                                parentId: 'borderStylePnl',
                                                hidden: { _code: 'return  !getSettingValue(data?.border?.hideBorder);', _mode: 'code', _value: false } as any,
                                                readOnly: { _code: 'return getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                inputs: [
                                                    {
                                                        type: 'button',
                                                        id: 'borderStyleRow-hideBorder',
                                                        label: "Border",
                                                        hideLabel: true,
                                                        propertyName: "border.hideBorder",
                                                        icon: "EyeOutlined",
                                                        iconAlt: "EyeInvisibleOutlined"
                                                    },
                                                ]
                                            })
                                            .addSettingsInputRow(
                                                getBorderInputs(false)[0] as any
                                            )
                                            .addSettingsInputRow(
                                                getBorderInputs(false)[1] as any
                                            )
                                            .addSettingsInputRow(
                                                getBorderInputs(false)[2] as any
                                            )
                                            .addSettingsInputRow(
                                                getBorderInputs(false)[3] as any
                                            )
                                            .addSettingsInputRow(
                                                getBorderInputs(false)[4] as any
                                            )
                                            .addSettingsInputRow(
                                                getCornerInputs(false)[0] as any
                                            )
                                            .addSettingsInputRow(
                                                getCornerInputs(false)[1] as any
                                            )
                                            .addSettingsInputRow(
                                                getCornerInputs(false)[2] as any
                                            )
                                            .addSettingsInputRow(
                                                getCornerInputs(false)[3] as any
                                            )
                                            .addSettingsInputRow(
                                                getCornerInputs(false)[4] as any
                                            )
                                            .toJson()
                                        ]
                                    }
                                })
                                .addCollapsiblePanel({
                                    id: 'shadowStyleCollapsiblePanel',
                                    propertyName: 'pnlShadowStyle',
                                    label: 'Shadow',
                                    labelAlign: 'right',
                                    ghost: true,
                                    parentId: 'styleRouter',
                                    collapsible: 'header',
                                    content: {
                                        id: 'shadowStylePnl',
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInputRow({
                                                id: 'shadowStyleRow',
                                                parentId: 'shadowStylePnl',
                                                inline: true,
                                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                inputs: [
                                                    {
                                                        type: 'number',
                                                        id: 'shadowStyleRow-offsetX',
                                                        label: 'Offset X',
                                                        hideLabel: true,
                                                        width: 60,
                                                        icon: "offsetHorizontalIcon",
                                                        propertyName: 'shadow.offsetX',
                                                    },
                                                    {
                                                        type: 'number',
                                                        id: 'shadowStyleRow-offsetY',
                                                        label: 'Offset Y',
                                                        hideLabel: true,
                                                        width: 60,
                                                        icon: 'offsetVerticalIcon',
                                                        propertyName: 'shadow.offsetY',
                                                    },
                                                    {
                                                        type: 'number',
                                                        id: 'shadowStyleRow-blurRadius',
                                                        label: 'Blur',
                                                        hideLabel: true,
                                                        width: 60,
                                                        icon: 'blurIcon',
                                                        propertyName: 'shadow.blurRadius',
                                                    },
                                                    {
                                                        type: 'number',
                                                        id: 'shadowStyleRow-spreadRadius',
                                                        label: 'Spread',
                                                        hideLabel: true,
                                                        width: 60,
                                                        icon: 'spreadIcon',
                                                        propertyName: 'shadow.spreadRadius',
                                                    },
                                                    {
                                                        type: 'color',
                                                        id: 'shadowStyleRow-color',
                                                        label: 'Color',
                                                        hideLabel: true,
                                                        propertyName: 'shadow.color',
                                                    },
                                                ],
                                            })
                                            .toJson()
                                        ]
                                    }
                                })
                                .addCollapsiblePanel({
                                    id: 'styleCollapsiblePanel',
                                    propertyName: 'stylingBox',
                                    label: 'Margin & Padding',
                                    labelAlign: 'right',
                                    ghost: true,
                                    collapsible: 'header',
                                    content: {
                                        id: 'stylePnl-M5-911',
                                        components: [...new DesignerToolbarSettings()
                                            .addStyleBox({
                                                id: 'styleBoxPnl',
                                                label: 'Margin Padding',
                                                hideLabel: true,
                                                propertyName: 'stylingBox',
                                            })
                                            .toJson()
                                        ]
                                    }
                                })
                                .addCollapsiblePanel({
                                    id: 'customStyleCollapsiblePanel',
                                    propertyName: 'customStyle',
                                    label: 'Custom Style',
                                    labelAlign: 'right',
                                    ghost: true,
                                    parentId: 'styleRouter',
                                    collapsible: 'header',
                                    content: {
                                        id: 'stylePnl-M500-911MFR',
                                        components: [...new DesignerToolbarSettings()
                                            .addSettingsInput({
                                                id: 'custom-class-412c-8461-4c8d55e5c073',
                                                inputType: 'text',
                                                propertyName: 'className',
                                                label: 'Custom CSS Class',
                                            })
                                            .addSettingsInput({
                                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                id: 'custom-wrapper-css-412c-8461-4c8d55e5c073',
                                                inputType: 'codeEditor',
                                                propertyName: 'wrapperStyle',
                                                label: 'Wrapper Style',
                                                description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                            })
                                            .addSettingsInput({
                                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                                id: 'custom-css-412c-8461-4c8d55e5c073',
                                                inputType: 'codeEditor',
                                                propertyName: 'style',
                                                label: 'Style',
                                                description: 'A script that returns the style of the element as an object. This should conform to CSSProperties',
                                            })
                                            .toJson()
                                        ]
                                    }
                                })
                                .toJson()]
                    },
                    {
                        key: '5',
                        title: 'Security',
                        id: '6Vw9iiDw9d0MD_Rh5cbIn',
                        components: [...new DesignerToolbarSettings()
                            .addSettingsInput({
                                readOnly: { _code: 'return  getSettingValue(data?.readOnly);', _mode: 'code', _value: false } as any,
                                id: '1adea529-1f0c-4def-bd41-ee166a5dfcd7',
                                inputType: 'permissions',
                                propertyName: 'permissions',
                                label: 'Permissions',
                                size: 'small',
                                parentId: '6Vw9iiDw9d0MD_Rh5cbIn'
                            })
                            .toJson()
                        ]
                    }
                ]
            }).toJson(),
        formSettings: {
            colon: false,
            layout: 'vertical' as FormLayout,
            labelCol: { span: 24 },
            wrapperCol: { span: 24 }
        }
    };
};